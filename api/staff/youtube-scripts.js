const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restSelect, restPatch, restInsert } = require("./_inbox-lib");
const { listYoutubeScriptPages, findYoutubeScriptPage } = require("../../lib/youtube-script-pages");
const {
  JULIE_SCRIPT_SYSTEM,
  seedFromFiles,
  extractSpoken,
  forJulieRecording,
  pageTextForPrompt,
  openaiChat,
  transcribeRecording,
  buildCutPlan,
} = require("../../lib/youtube-scripts");

function statusFromTexts(row) {
  if (row && row.status && row.status !== "empty") return row.status;
  if (row && String(row.script_es || "").trim()) return "draft";
  if (row && String(row.breakdown || "").trim()) return "draft";
  return "empty";
}

async function loadRow(cfg, slug) {
  const rows = await restSelect(
    cfg,
    "youtube_page_scripts",
    `slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`
  );
  return rows && rows[0] ? rows[0] : null;
}

async function upsertRow(cfg, payload) {
  const existing = await loadRow(cfg, payload.slug);
  if (existing) {
    const patched = await restPatch(
      cfg,
      "youtube_page_scripts",
      `slug=eq.${encodeURIComponent(payload.slug)}`,
      payload
    );
    return Array.isArray(patched) ? patched[0] : patched;
  }
  const inserted = await restInsert(cfg, "youtube_page_scripts", [payload]);
  return Array.isArray(inserted) ? inserted[0] : inserted;
}

function recordingPathForSlug(slug, path) {
  const p = String(path || "")
    .trim()
    .replace(/^\/+/, "");
  if (!p || p.includes("..") || p.includes("\\") || p.length > 240) return "";
  if (p.indexOf(String(slug) + "/") !== 0) return "";
  return p;
}

function statusAfterRemoveRecording(current) {
  if (current.status === "published") return "published";
  const hasScript = String(current.script_es || "").trim();
  if (current.status === "draft" || current.status === "empty") {
    return hasScript ? "draft" : "empty";
  }
  return hasScript ? "approved" : "empty";
}

async function removeRecordingObject(cfg, path) {
  const safe = String(path || "").replace(/^\/+/, "");
  if (!safe) return;
  const r = await fetch(`${cfg.supabaseUrl}/storage/v1/object/youtube-recordings`, {
    method: "DELETE",
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [safe] }),
  });
  if (!r.ok && r.status !== 404) {
    const text = await r.text().catch(() => "");
    throw new Error(String(text || "Could not delete recording").slice(0, 200));
  }
}

function mergeSeed(page, dbRow) {
  const seed = seedFromFiles(page.slug);
  const breakdown = (dbRow && dbRow.breakdown) || seed.breakdown || "";
  const script_en = (dbRow && dbRow.script_en) || seed.script_en || "";
  const script_es_raw = (dbRow && dbRow.script_es) || seed.script_es || "";
  const script_es = forJulieRecording(script_es_raw);
  const row = dbRow || {};
  return {
    slug: page.slug,
    title: page.title,
    group: page.group,
    groupTitle: page.groupTitle,
    groupSubtitle: page.groupSubtitle || "",
    urlEs: page.urlEs,
    urlEn: page.urlEn || row.url_en || "",
    clusterParent: page.clusterParent || null,
    breakdown,
    script_en,
    script_es,
    spoken: forJulieRecording(script_es_raw || script_en),
    status: statusFromTexts({ ...row, breakdown, script_en, script_es }),
    chat: Array.isArray(row.chat) ? row.chat : [],
    recording_path: row.recording_path || "",
    recording_mime: row.recording_mime || "",
    transcript: row.transcript || "",
    cut_plan: row.cut_plan || null,
    review_notes: row.review_notes || "",
    youtube_id: row.youtube_id || "",
    updated_at: row.updated_at || null,
    from_files: !!(seed.breakdown || seed.script_en || seed.script_es) && !dbRow,
  };
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  if (req.method === "GET") {
    const url = new URL(req.url, "http://localhost");
    const slug = String(url.searchParams.get("slug") || "").trim();
    try {
      if (!slug) {
        const catalog = listYoutubeScriptPages();
        const rows = await restSelect(cfg, "youtube_page_scripts", "select=slug,status,updated_at,script_es,breakdown");
        const bySlug = {};
        (rows || []).forEach((r) => {
          bySlug[r.slug] = r;
        });
        const groups = catalog.groups.map((g) => ({
          id: g.id,
          title: g.title,
          pages: g.pages.map((p) => {
            const seed = seedFromFiles(p.slug);
            const db = bySlug[p.slug];
            return {
              slug: p.slug,
              title: p.title,
              urlEs: p.urlEs,
              clusterParent: p.clusterParent || null,
              status: statusFromTexts({
                status: db && db.status,
                script_es: (db && db.script_es) || seed.script_es,
                breakdown: (db && db.breakdown) || seed.breakdown,
              }),
              hasScript: !!(
                (db && String(db.script_es || "").trim()) ||
                seed.script_es
              ),
              updated_at: (db && db.updated_at) || null,
            };
          }),
        }));
        return json(res, 200, { groups });
      }
      const page = findYoutubeScriptPage(slug);
      if (!page) return json(res, 404, { error: "Unknown page" });
      const dbRow = await loadRow(cfg, slug);
      return json(res, 200, mergeSeed(page, dbRow));
    } catch (e) {
      return json(res, 500, { error: String(e.message || e).slice(0, 200) });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const action = String(body.action || "save").trim();
  const slug = String(body.slug || "").trim();
  const page = findYoutubeScriptPage(slug);
  if (!page) return json(res, 404, { error: "Unknown page" });

  try {
    if (action === "save") {
      const allowed = {
        empty: 1,
        draft: 1,
        approved: 1,
        recorded: 1,
        analyzed: 1,
        review: 1,
        ready: 1,
        published: 1,
      };
      const status = allowed[String(body.status || "draft")] ? String(body.status || "draft") : "draft";
      const payload = {
        slug,
        title: page.title,
        group_id: page.group,
        url_es: page.urlEs,
        url_en: page.urlEn || "",
        breakdown: String(body.breakdown != null ? body.breakdown : ""),
        script_en: String(body.script_en != null ? body.script_en : ""),
        script_es: String(body.script_es != null ? body.script_es : ""),
        status,
        chat: Array.isArray(body.chat) ? body.chat : undefined,
        updated_by: auth.user && auth.user.email,
        updated_at: new Date().toISOString(),
      };
      if (payload.chat === undefined) delete payload.chat;
      const saved = await upsertRow(cfg, payload);
      return json(res, 200, { ok: true, item: mergeSeed(page, saved) });
    }

    if (action === "generate") {
      const pageText = pageTextForPrompt(page);
      if (!pageText) return json(res, 400, { error: "Could not read that page" });
      const existing = mergeSeed(page, await loadRow(cfg, slug));
      const content = await openaiChat(
        [
          { role: "system", content: JULIE_SCRIPT_SYSTEM },
          {
            role: "user",
            content:
              `Create a page breakdown AND a Spanish usted recording script for Julie (not Jhenny).\n` +
              `Page title: ${page.title}\nURL: https://www.mejorvidainsurance.com${page.urlEs}\n` +
              (page.clusterParent
                ? `This URL is a coverage-amount variant. Prefer a short note that the parent lesson is ${page.clusterParent}, then still give a tight script if Julie wants this amount.\n`
                : "") +
              `Return markdown with exactly two sections:\n## Breakdown\n## Spoken script\n\nPage text:\n${pageText}`,
          },
        ],
        { max_tokens: 2800 }
      );
      const parts = content.split(/##\s+Spoken script/i);
      const breakdown = (parts[0] || content).replace(/^##\s+Breakdown\s*/i, "").trim();
      const script_es = (parts[1] || "").trim() || existing.script_es;
      const payload = {
        slug,
        title: page.title,
        group_id: page.group,
        url_es: page.urlEs,
        url_en: page.urlEn || "",
        breakdown: breakdown || existing.breakdown,
        script_en: existing.script_en,
        script_es: script_es || existing.script_es,
        status: "draft",
        updated_by: auth.user && auth.user.email,
        updated_at: new Date().toISOString(),
      };
      const saved = await upsertRow(cfg, payload);
      return json(res, 200, { ok: true, item: mergeSeed(page, saved) });
    }

    if (action === "chat") {
      const message = String(body.message || "").trim();
      if (!message) return json(res, 400, { error: "message required" });
      const current = mergeSeed(page, await loadRow(cfg, slug));
      if (body.script_es != null && String(body.script_es).trim()) {
        current.script_es = String(body.script_es);
        current.spoken = forJulieRecording(current.script_es);
      }
      const history = (Array.isArray(body.chat) ? body.chat : current.chat).slice(-12);
      const reply = await openaiChat(
        [
          { role: "system", content: JULIE_SCRIPT_SYSTEM },
          {
            role: "user",
            content:
              `Current page: ${page.title} (${page.urlEs})\n\n` +
              `## Current breakdown\n${current.breakdown || "(none)"}\n\n` +
              `## Current Spanish script\n${current.script_es || "(none)"}\n\n` +
              `Julie will type edits like Cursor. If she asks to change the script, return:\n` +
              `1) A short reply in her language\n2) Then a fenced block:\n\`\`\`script\nfull updated Spanish spoken script\n\`\`\`\n` +
              `If she only asked a question, reply without a script block.`,
          },
        ].concat(
          history.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content || ""),
          }))
        ).concat([{ role: "user", content: message }]),
        { max_tokens: 2200 }
      );
      let script_es = current.script_es;
      const block = reply.match(/```script\n([\s\S]*?)```/i);
      if (block) script_es = String(block[1] || "").trim();
      const chat = history.concat([
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ]);
      const payload = {
        slug,
        title: page.title,
        group_id: page.group,
        url_es: page.urlEs,
        url_en: page.urlEn || "",
        breakdown: current.breakdown,
        script_en: current.script_en,
        script_es,
        status: current.status === "empty" ? "draft" : current.status,
        chat,
        updated_by: auth.user && auth.user.email,
        updated_at: new Date().toISOString(),
      };
      const saved = await upsertRow(cfg, payload);
      return json(res, 200, { ok: true, reply, item: mergeSeed(page, saved) });
    }

    if (action === "upload-url") {
      const ext = String(body.ext || "mp4").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "mp4";
      const objectPath = `${slug}/${Date.now()}.${ext}`;
      const r = await fetch(
        `${cfg.supabaseUrl}/storage/v1/object/upload/sign/youtube-recordings/${objectPath}`,
        {
          method: "POST",
          headers: {
            apikey: cfg.serviceKey,
            Authorization: `Bearer ${cfg.serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ expiresIn: 3600 }),
        }
      );
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        return json(res, 500, { error: String((data && (data.message || data.error)) || "Upload URL failed").slice(0, 200) });
      }
      const token = data.token || "";
      if (!token) {
        return json(res, 500, { error: "Upload URL failed" });
      }
      const base = String(cfg.supabaseUrl || "").replace(/\/$/, "");
      const raw = String(data.url || data.signedUrl || "");
      let signedUrl;
      if (/^https?:\/\//i.test(raw)) signedUrl = raw;
      else if (raw.indexOf("/storage/v1/") === 0) signedUrl = base + raw;
      else if (raw.indexOf("/object/") === 0) signedUrl = base + "/storage/v1" + raw;
      else {
        signedUrl = `${base}/storage/v1/object/upload/sign/youtube-recordings/${objectPath}?token=${encodeURIComponent(token)}`;
      }
      if (signedUrl.indexOf("token=") === -1) {
        signedUrl += (signedUrl.indexOf("?") === -1 ? "?" : "&") + "token=" + encodeURIComponent(token);
      }
      return json(res, 200, { path: objectPath, token, signedUrl, bucket: "youtube-recordings" });
    }

    if (action === "recording-saved") {
      const recording_path = String(body.recording_path || "").trim();
      if (!recording_path) return json(res, 400, { error: "recording_path required" });
      const current = mergeSeed(page, await loadRow(cfg, slug));
      const saved = await upsertRow(cfg, {
        slug,
        title: page.title,
        group_id: page.group,
        url_es: page.urlEs,
        url_en: page.urlEn || "",
        breakdown: current.breakdown,
        script_en: current.script_en,
        script_es: current.script_es,
        status: "recorded",
        recording_path,
        recording_mime: String(body.recording_mime || "video/mp4"),
        updated_by: auth.user && auth.user.email,
        updated_at: new Date().toISOString(),
      });
      return json(res, 200, { ok: true, item: mergeSeed(page, saved) });
    }

    if (action === "remove-recording") {
      const current = mergeSeed(page, await loadRow(cfg, slug));
      if (!current.recording_path) return json(res, 400, { error: "No recording on file" });
      const objectPath = recordingPathForSlug(slug, current.recording_path);
      if (objectPath) {
        try {
          await removeRecordingObject(cfg, objectPath);
        } catch (_) {
          /* still clear the CRM row so a new take can be uploaded */
        }
      }
      const saved = await upsertRow(cfg, {
        slug,
        title: page.title,
        group_id: page.group,
        url_es: page.urlEs,
        url_en: page.urlEn || "",
        breakdown: current.breakdown,
        script_en: current.script_en,
        script_es: current.script_es,
        status: statusAfterRemoveRecording(current),
        recording_path: "",
        recording_mime: "",
        transcript: "",
        cut_plan: null,
        review_notes: current.review_notes || "",
        youtube_id: current.youtube_id || "",
        updated_by: auth.user && auth.user.email,
        updated_at: new Date().toISOString(),
      });
      return json(res, 200, { ok: true, item: mergeSeed(page, saved) });
    }

    if (action === "analyze") {
      const current = mergeSeed(page, await loadRow(cfg, slug));
      if (!current.recording_path) return json(res, 400, { error: "Upload a recording first" });
      const spoken = extractSpoken(current.script_es);
      if (!spoken) return json(res, 400, { error: "Save the Spanish script first" });
      const fileRes = await fetch(
        `${cfg.supabaseUrl}/storage/v1/object/youtube-recordings/${current.recording_path}`,
        {
          headers: {
            apikey: cfg.serviceKey,
            Authorization: `Bearer ${cfg.serviceKey}`,
          },
        }
      );
      if (!fileRes.ok) return json(res, 500, { error: "Could not read the recording" });
      const buf = Buffer.from(await fileRes.arrayBuffer());
      if (buf.length > 26 * 1024 * 1024) {
        return json(res, 400, { error: "Recording is over 25 MB. Export a shorter take or compress, then upload again." });
      }
      const transcript = await transcribeRecording(
        buf,
        current.recording_path.split("/").pop() || "recording.mp4",
        current.recording_mime
      );
      const cut_plan = await buildCutPlan(spoken, transcript);
      const saved = await upsertRow(cfg, {
        slug,
        title: page.title,
        group_id: page.group,
        url_es: page.urlEs,
        url_en: page.urlEn || "",
        breakdown: current.breakdown,
        script_en: current.script_en,
        script_es: current.script_es,
        status: "analyzed",
        recording_path: current.recording_path,
        recording_mime: current.recording_mime,
        transcript: String(transcript.text || ""),
        cut_plan,
        updated_by: auth.user && auth.user.email,
        updated_at: new Date().toISOString(),
      });
      return json(res, 200, { ok: true, item: mergeSeed(page, saved) });
    }

    if (action === "review") {
      const current = mergeSeed(page, await loadRow(cfg, slug));
      const decision = String(body.decision || "").trim();
      const nextStatus = decision === "approved" ? "ready" : "review";
      const saved = await upsertRow(cfg, {
        slug,
        title: page.title,
        group_id: page.group,
        url_es: page.urlEs,
        url_en: page.urlEn || "",
        breakdown: current.breakdown,
        script_en: current.script_en,
        script_es: current.script_es,
        status: nextStatus,
        recording_path: current.recording_path,
        recording_mime: current.recording_mime,
        transcript: current.transcript,
        cut_plan: current.cut_plan,
        review_notes: String(body.review_notes || current.review_notes || ""),
        youtube_id: current.youtube_id,
        updated_by: auth.user && auth.user.email,
        updated_at: new Date().toISOString(),
      });
      return json(res, 200, { ok: true, item: mergeSeed(page, saved) });
    }

    return json(res, 400, { error: "Unknown action" });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e).slice(0, 240) });
  }
};
