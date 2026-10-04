/**
 * GET/POST /api/staff/call-intake
 * Staff call drop: upload or paste a recorded call, extract CRM fields, apply.
 *
 * Auth: Authorization Bearer <Supabase JWT>
 */
const crypto = require("crypto");
const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restSelect, restInsert, restPatch } = require("./_inbox-lib");
const {
  signCallUpload,
  processIntake,
  applyIntake,
  getIntake,
  publicRow,
  listStaffCallDropPhones,
  saveStaffCallDropPhone,
  deleteStaffCallDropPhone,
} = require("../../lib/staff-call-intake");

const ALLOWED_EXT = {
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  aac: "audio/aac",
  ogg: "audio/ogg",
  webm: "audio/webm",
  mp4: "video/mp4",
  mov: "video/quicktime",
  caf: "audio/mp4",
  amr: "audio/amr",
  "3gp": "audio/3gpp",
};

function queryParam(req, name) {
  const q = req.query && req.query[name];
  if (q != null && String(q).trim()) return String(q).trim();
  try {
    const path = req.url || "";
    const base = path.startsWith("http") ? path : `https://localhost${path.startsWith("/") ? path : `/${path}`}`;
    return new URL(base).searchParams.get(name) || "";
  } catch (_) {
    return "";
  }
}

function safeExt(raw) {
  const ext = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^\./, "")
    .replace(/[^a-z0-9]/g, "");
  return ALLOWED_EXT[ext] ? ext : "";
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  const actor = auth.user && auth.user.email ? auth.user.email : null;

  try {
    if (req.method === "GET") {
      const id = queryParam(req, "id");
      if (id) {
        const row = await getIntake(cfg, id);
        if (!row) return json(res, 404, { error: "Call intake not found" });
        return json(res, 200, { item: publicRow(row) });
      }
      const status = queryParam(req, "status");
      const leadId = queryParam(req, "leadId") || queryParam(req, "lead_id");
      let query = "select=id,created_at,updated_at,created_by,status,source,hint_phone,match_label,matched_lead_id,error_text,applied_at&order=created_at.desc&limit=80";
      if (status) query = `status=eq.${encodeURIComponent(status)}&` + query;
      if (leadId) query = `matched_lead_id=eq.${encodeURIComponent(leadId)}&` + query;
      const items = await restSelect(cfg, "staff_call_intakes", query);
      const phones = await listStaffCallDropPhones(cfg);
      return json(res, 200, { items: items || [], phones });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return json(res, 405, { error: "Method Not Allowed" });
    }

    const body = readJsonBody(req);
    const action = String(body.action || "").trim();

    if (action === "upload-url") {
      const ext = safeExt(body.ext);
      if (!ext) return json(res, 400, { error: "Unsupported audio type" });
      const id = crypto.randomUUID();
      const objectPath = `${id}/call.${ext}`;
      const signed = await signCallUpload(cfg, objectPath);
      const now = new Date().toISOString();
      const inserted = await restInsert(cfg, "staff_call_intakes", [
        {
          id,
          created_by: actor,
          status: "received",
          source: "upload",
          hint_phone: String(body.hint_phone || body.phone || "").trim() || null,
          recording_path: objectPath,
          recording_mime: ALLOWED_EXT[ext],
          created_at: now,
          updated_at: now,
        },
      ]);
      const row = Array.isArray(inserted) && inserted[0] ? inserted[0] : { id, recording_path: objectPath };
      return json(res, 200, {
        ok: true,
        id: row.id,
        path: signed.path,
        signedUrl: signed.signedUrl,
        mime: ALLOWED_EXT[ext],
      });
    }

    if (action === "uploaded") {
      const id = String(body.id || "").trim();
      if (!id) return json(res, 400, { error: "id required" });
      await restPatch(cfg, "staff_call_intakes", `id=eq.${encodeURIComponent(id)}`, {
        status: "uploaded",
        updated_at: new Date().toISOString(),
      });
      const processed = await processIntake(cfg, id);
      return json(res, 200, { ok: true, item: publicRow(processed) });
    }

    if (action === "paste") {
      const transcript = String(body.transcript_text || body.transcript || "").trim();
      if (transcript.length < 20) return json(res, 400, { error: "Paste more of the transcript" });
      const now = new Date().toISOString();
      const inserted = await restInsert(cfg, "staff_call_intakes", [
        {
          created_by: actor,
          status: "received",
          source: "paste",
          hint_phone: String(body.hint_phone || body.phone || "").trim() || null,
          transcript_text: transcript.slice(0, 20000),
          created_at: now,
          updated_at: now,
        },
      ]);
      const row = Array.isArray(inserted) && inserted[0] ? inserted[0] : null;
      if (!row) return json(res, 500, { error: "Could not save transcript" });
      const processed = await processIntake(cfg, row.id);
      return json(res, 200, { ok: true, item: publicRow(processed) });
    }

    if (action === "process") {
      const id = String(body.id || "").trim();
      if (!id) return json(res, 400, { error: "id required" });
      const processed = await processIntake(cfg, id);
      return json(res, 200, { ok: true, item: publicRow(processed) });
    }

    if (action === "apply") {
      const id = String(body.id || "").trim();
      if (!id) return json(res, 400, { error: "id required" });
      const applied = await applyIntake(cfg, id, {
        actor,
        leadId: body.lead_id || body.leadId || "",
        createIfMissing: body.create_if_missing !== false,
      });
      return json(res, 200, { ok: true, item: publicRow(applied) });
    }

    if (action === "discard") {
      const id = String(body.id || "").trim();
      if (!id) return json(res, 400, { error: "id required" });
      const patched = await restPatch(cfg, "staff_call_intakes", `id=eq.${encodeURIComponent(id)}`, {
        status: "discarded",
        updated_at: new Date().toISOString(),
      });
      const row = Array.isArray(patched) && patched[0] ? patched[0] : await getIntake(cfg, id);
      return json(res, 200, { ok: true, item: publicRow(row) });
    }

    if (action === "save-phone") {
      const saved = await saveStaffCallDropPhone(cfg, body.phone, actor);
      const phones = await listStaffCallDropPhones(cfg);
      return json(res, 200, { ok: true, phone: saved, phones });
    }

    if (action === "remove-phone") {
      await deleteStaffCallDropPhone(cfg, body.phone);
      const phones = await listStaffCallDropPhones(cfg);
      return json(res, 200, { ok: true, phones });
    }

    return json(res, 400, { error: "Unknown action" });
  } catch (e) {
    console.error("staff/call-intake", e);
    return json(res, 500, { error: String(e && e.message ? e.message : "Call intake failed").slice(0, 240) });
  }
};
