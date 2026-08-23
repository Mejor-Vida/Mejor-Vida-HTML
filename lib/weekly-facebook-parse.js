/**
 * Read the live Spanish weekly digest and extract the three stories + image URLs.
 */

const DEFAULT_SITE = "https://www.mejorvidainsurance.com";
const DIGEST_RE = /\/blog\/weekly-insurance-update-(\d{4}-\d{2}-\d{2})\.html/g;

function siteOrigin() {
  return String(process.env.PUBLIC_SITE_URL || DEFAULT_SITE).replace(/\/$/, "");
}

function stripTags(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.text();
}

async function urlLooksLive(url) {
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (head.ok) return true;
  } catch (_) {
    /* some CDNs reject HEAD */
  }
  try {
    const get = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-32" },
      redirect: "follow",
    });
    return get.ok;
  } catch (_) {
    return false;
  }
}

function latestDigestWeekFromSitemap(xml) {
  const dates = [];
  const re = new RegExp(DIGEST_RE.source, "g");
  let m;
  while ((m = re.exec(xml))) dates.push(m[1]);
  dates.sort();
  return dates.length ? dates[dates.length - 1] : null;
}

function parseDigestStories(html, weekKey, origin) {
  const base = (origin || siteOrigin()).replace(/\/$/, "");
  const stories = [];
  const re = /<section class="story-section" id="story(\d)">([\s\S]*?)<\/section>/gi;
  let m;
  while ((m = re.exec(html))) {
    const slot = Number(m[1]);
    const body = m[2] || "";
    const h2 = (body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1] || "";
    const title = stripTags(h2).replace(/^Historia\s+\d+\s*:\s*/i, "").trim();
    const paras = [];
    const pre = /<p(?![^>]*story-meta)[^>]*>([\s\S]*?)<\/p>/gi;
    let p;
    while ((p = pre.exec(body))) {
      const inner = p[1] || "";
      if (/btn btn-primary/i.test(inner)) continue;
      if (/¿Quiere conocer todos los detalles/i.test(inner)) continue;
      const text = stripTags(inner);
      if (text) paras.push(text);
    }
    const img = (body.match(/src="([^"]*story-\d+\.png)"/i) || [])[1] || "";
    const image_url = img.startsWith("http")
      ? img
      : `${base}/img/opt/blog-generated/weekly-insurance-update-${weekKey}/story-${slot}.png`;
    stories.push({
      slot,
      title,
      summary: paras.join("\n\n"),
      story_url: `${base}/blog/weekly-insurance-update-${weekKey}.html#story${slot}`,
      image_url,
    });
  }
  stories.sort((a, b) => a.slot - b.slot);
  return stories.filter((s) => s.slot >= 1 && s.slot <= 3).slice(0, 3);
}

async function loadLiveWeeklyDigest(opts) {
  opts = opts || {};
  const origin = (opts.origin || siteOrigin()).replace(/\/$/, "");
  const sitemap = await fetchText(`${origin}/sitemap.xml`);
  const weekKey = opts.weekKey || latestDigestWeekFromSitemap(sitemap);
  if (!weekKey) return { found: false, reason: "no_digest_in_sitemap", origin };

  const digestUrl = `${origin}/blog/weekly-insurance-update-${weekKey}.html`;
  let html;
  try {
    html = await fetchText(digestUrl);
  } catch (e) {
    return { found: false, reason: "digest_not_live", week_key: weekKey, error: e.message, origin };
  }

  const stories = parseDigestStories(html, weekKey, origin);
  if (stories.length !== 3) {
    return { found: false, reason: "digest_missing_three_stories", week_key: weekKey, origin };
  }

  const missingImages = [];
  for (const s of stories) {
    const ok = await urlLooksLive(s.image_url);
    if (!ok) missingImages.push(s.image_url);
  }
  if (missingImages.length) {
    return {
      found: true,
      ready: false,
      reason: "images_not_live",
      week_key: weekKey,
      digest_url: digestUrl,
      stories,
      missing_images: missingImages,
      origin,
    };
  }

  return {
    found: true,
    ready: true,
    week_key: weekKey,
    digest_url: digestUrl,
    stories,
    origin,
  };
}

module.exports = {
  siteOrigin,
  stripTags,
  latestDigestWeekFromSitemap,
  parseDigestStories,
  loadLiveWeeklyDigest,
  urlLooksLive,
};
