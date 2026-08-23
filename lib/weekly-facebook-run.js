/**
 * After the weekly digest is live (with images), queue 3 Facebook posts and
 * publish them: Sunday as soon as the blog exists, Tuesday 10am, Thursday 10am Chicago.
 */

const { sbFetch } = require("./crm-newsletter-send");
const { addDaysISO, chicagoDateISO, weeklyFacebookSlotTimes } = require("./weekly-newsletter-window");
const { loadLiveWeeklyDigest } = require("./weekly-facebook-parse");
const { composeWeeklyFacebookPosts } = require("./weekly-facebook-compose");
const { facebookPublishReady, publishPhotoPost, publishComment } = require("./facebook-page-publish");

const COMMENT_DELAY_MS = 10 * 60 * 1000;

function facebookAutopostEnabled() {
  const v = String(process.env.WEEKLY_FACEBOOK_AUTOPOST || "1").trim().toLowerCase();
  return v !== "0" && v !== "false" && v !== "off";
}

async function existingWeekRows(supabaseUrl, serviceKey, weekKey) {
  return (
    (await sbFetch(
      supabaseUrl,
      serviceKey,
      `/weekly_facebook_queue?week_key=eq.${weekKey}&order=slot.asc&select=*`
    )) || []
  );
}

async function enqueueWeek(supabaseUrl, serviceKey, digest, posts, now) {
  const times = weeklyFacebookSlotTimes(digest.week_key, now);
  const rows = posts.map((p) => ({
    week_key: digest.week_key,
    slot: p.slot,
    story_url: p.story_url,
    image_url: p.image_url,
    title: p.title || null,
    main_caption: p.main_caption,
    first_comment: p.first_comment,
    publish_at: times[p.slot].toISOString(),
    status: "queued",
    updated_at: new Date().toISOString(),
  }));
  const inserted = await sbFetch(supabaseUrl, serviceKey, "/weekly_facebook_queue", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(rows),
  });
  return Array.isArray(inserted) ? inserted : rows;
}

async function patchRow(supabaseUrl, serviceKey, id, payload) {
  await sbFetch(supabaseUrl, serviceKey, `/weekly_facebook_queue?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
  });
}

async function publishDuePosts(supabaseUrl, serviceKey, now, dryRun) {
  const iso = now.toISOString();
  const due =
    (await sbFetch(
      supabaseUrl,
      serviceKey,
      `/weekly_facebook_queue?status=eq.queued&publish_at=lte.${encodeURIComponent(iso)}&order=publish_at.asc&select=*`
    )) || [];
  const published = [];
  for (const row of due) {
    if (dryRun) {
      published.push({ id: row.id, slot: row.slot, dry_run: true });
      continue;
    }
    try {
      const result = await publishPhotoPost({
        message: row.main_caption,
        imageUrl: row.image_url,
      });
      const postId = result.post_id;
      const publishedAt = new Date().toISOString();
      const commentAt = new Date(Date.now() + COMMENT_DELAY_MS).toISOString();
      await patchRow(supabaseUrl, serviceKey, row.id, {
        status: "posted",
        published_at: publishedAt,
        fb_post_id: postId,
        comment_at: commentAt,
        error_message: null,
      });
      published.push({ id: row.id, slot: row.slot, fb_post_id: postId });
    } catch (e) {
      await patchRow(supabaseUrl, serviceKey, row.id, {
        status: "error",
        error_message: String(e.message || e).slice(0, 500),
      });
      published.push({ id: row.id, slot: row.slot, error: String(e.message || e).slice(0, 200) });
    }
  }
  return published;
}

async function publishDueComments(supabaseUrl, serviceKey, now, dryRun) {
  const iso = now.toISOString();
  const due =
    (await sbFetch(
      supabaseUrl,
      serviceKey,
      `/weekly_facebook_queue?status=eq.posted&comment_at=lte.${encodeURIComponent(iso)}&order=comment_at.asc&select=*`
    )) || [];
  const commented = [];
  for (const row of due) {
    if (!row.fb_post_id || !row.first_comment) continue;
    if (dryRun) {
      commented.push({ id: row.id, slot: row.slot, dry_run: true });
      continue;
    }
    try {
      const result = await publishComment(row.fb_post_id, row.first_comment);
      await patchRow(supabaseUrl, serviceKey, row.id, {
        status: "commented",
        commented_at: new Date().toISOString(),
        fb_comment_id: result.id || null,
        error_message: null,
      });
      commented.push({ id: row.id, slot: row.slot, fb_comment_id: result.id || null });
    } catch (e) {
      await patchRow(supabaseUrl, serviceKey, row.id, {
        error_message: String(e.message || e).slice(0, 500),
      });
      commented.push({ id: row.id, slot: row.slot, error: String(e.message || e).slice(0, 200) });
    }
  }
  return commented;
}

async function detectAndEnqueue(supabaseUrl, serviceKey, now, dryRun) {
  const today = chicagoDateISO(now);
  const minWeek = addDaysISO(today, -10);
  const digest = await loadLiveWeeklyDigest();
  if (!digest.found || !digest.week_key) {
    return { queued: false, reason: digest.reason || "no_digest" };
  }
  if (digest.week_key < minWeek) {
    return { queued: false, reason: "digest_too_old", week_key: digest.week_key };
  }
  if (!digest.ready) {
    return { queued: false, reason: digest.reason, week_key: digest.week_key, missing_images: digest.missing_images };
  }
  const existing = await existingWeekRows(supabaseUrl, serviceKey, digest.week_key);
  if (existing.length > 0) {
    return { queued: false, reason: "already_queued", week_key: digest.week_key, rows: existing.length };
  }
  if (dryRun) {
    return { queued: false, dry_run: true, would_queue: true, week_key: digest.week_key };
  }
  try {
    const posts = await composeWeeklyFacebookPosts(digest.stories);
    const rows = await enqueueWeek(supabaseUrl, serviceKey, digest, posts, now);
    return { queued: true, week_key: digest.week_key, slots: rows.map((r) => r.slot || r) };
  } catch (e) {
    if (/duplicate|unique|409/i.test(String(e.message || e))) {
      return { queued: false, reason: "already_queued", week_key: digest.week_key };
    }
    throw e;
  }
}

async function runWeeklyFacebook(opts) {
  opts = opts || {};
  const now = opts.now || new Date();
  const dryRun = !!opts.dryRun;
  const supabaseUrl = (opts.supabaseUrl || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = opts.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!facebookAutopostEnabled()) {
    return { skipped: true, reason: "WEEKLY_FACEBOOK_AUTOPOST disabled" };
  }
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!dryRun && !facebookPublishReady()) {
    return { skipped: true, reason: "missing_facebook_page_credentials" };
  }

  const enqueue = await detectAndEnqueue(supabaseUrl, serviceKey, now, dryRun);
  const published = await publishDuePosts(supabaseUrl, serviceKey, now, dryRun);
  const commented = await publishDueComments(supabaseUrl, serviceKey, now, dryRun);

  return {
    ran_at: now.toISOString(),
    enqueue,
    published,
    commented,
  };
}

module.exports = {
  facebookAutopostEnabled,
  runWeeklyFacebook,
  detectAndEnqueue,
  COMMENT_DELAY_MS,
};
