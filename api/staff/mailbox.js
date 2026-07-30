/**
 * Staff CRM MVI Mailbox — scanned virtual-mailbox PDFs.
 *
 * GET    /api/staff/mailbox              → list (optional ?q= name search)
 * GET    /api/staff/mailbox?download=id  → file bytes (base64 JSON)
 * POST   /api/staff/mailbox              → upload + create
 * PATCH  /api/staff/mailbox?id=<uuid>    → update title/from/notes/date
 * DELETE /api/staff/mailbox?id=<uuid>    → remove storage + row
 */
const { requireStaffAuth } = require("../auth-check");
const {
  json,
  readJsonBody,
  serviceConfig,
  restSelect,
  restInsert,
  restPatch,
  restDelete,
} = require("./_inbox-lib");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BUCKET = "staff-mailbox";
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const LIST_SELECT =
  "id,title,from_name,received_on,filename,content_type,file_size_bytes,source_id,notes,uploaded_by,created_at,updated_at";

function isUuid(s) {
  return UUID_RE.test(String(s || ""));
}

function parseDate(v) {
  if (v == null || v === "") return null;
  const s = String(v).trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function sbHeaders(serviceKey, extra) {
  return Object.assign(
    {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    extra || {}
  );
}

async function storageUpload(cfg, path, buffer, contentType) {
  const base = String(cfg.supabaseUrl || "").replace(/\/$/, "");
  const r = await fetch(`${base}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: sbHeaders(cfg.serviceKey, {
      "Content-Type": contentType,
      "x-upsert": "true",
    }),
    body: buffer,
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Storage upload ${r.status}: ${text.slice(0, 300)}`);
  }
}

async function storageDownload(cfg, path) {
  const base = String(cfg.supabaseUrl || "").replace(/\/$/, "");
  const r = await fetch(`${base}/storage/v1/object/${BUCKET}/${path}`, {
    headers: sbHeaders(cfg.serviceKey),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Storage download ${r.status}: ${text.slice(0, 300)}`);
  }
  return Buffer.from(await r.arrayBuffer());
}

async function storageRemove(cfg, path) {
  const base = String(cfg.supabaseUrl || "").replace(/\/$/, "");
  await fetch(`${base}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: sbHeaders(cfg.serviceKey, { "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: [path] }),
  });
}

function escapeIlike(q) {
  return String(q || "")
    .trim()
    .replace(/[%_,.()]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

function migrationHint(e) {
  const msg = String((e && e.message) || e);
  if (/42P01|relation|does not exist/i.test(msg)) {
    return {
      status: 503,
      body: {
        error: "Database not migrated",
        detail: "Apply migration 087_staff_mailbox.sql in Supabase.",
      },
    };
  }
  return null;
}

function parseSourceIdFromFilename(filename) {
  const m = String(filename || "").match(/^mail-\d+-\d+-(\d+)-\d+-c\d+/i);
  return m ? m[1] : null;
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  const q = req.query || {};
  const uploadedBy = auth.user && auth.user.email ? auth.user.email : null;

  if (req.method === "GET" && q.download) {
    const id = String(q.download || "").trim();
    if (!isUuid(id)) return json(res, 400, { error: "Valid download id required" });
    try {
      const rows = await restSelect(
        cfg,
        "staff_mailbox_items",
        `select=*&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      const item = rows && rows[0];
      if (!item) return json(res, 404, { error: "Mail item not found" });
      const buf = await storageDownload(cfg, item.storage_path);
      return json(res, 200, {
        id: item.id,
        filename: item.filename,
        content_type: item.content_type,
        title: item.title,
        data_base64: buf.toString("base64"),
      });
    } catch (e) {
      const hint = migrationHint(e);
      if (hint) return json(res, hint.status, hint.body);
      console.error("staff/mailbox GET download", e);
      return json(res, 500, { error: "Failed to download mail" });
    }
  }

  if (req.method === "GET") {
    try {
      const search = escapeIlike(q.q);
      let query = `select=${LIST_SELECT}&order=received_on.desc,created_at.desc&limit=500`;
      if (search) {
        const pattern = `*${search}*`;
        query +=
          `&or=(title.ilike.${encodeURIComponent(pattern)},from_name.ilike.${encodeURIComponent(pattern)})`;
      }
      const items = await restSelect(cfg, "staff_mailbox_items", query);
      return json(res, 200, { items: items || [], count: (items || []).length });
    } catch (e) {
      const hint = migrationHint(e);
      if (hint) return json(res, hint.status, hint.body);
      console.error("staff/mailbox GET", e);
      return json(res, 500, { error: "Failed to load mailbox" });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }

    const title = String(body.title || body.from_name || "").trim().slice(0, 300);
    if (!title) return json(res, 400, { error: "title (sender name) required" });
    const fromName = String(body.from_name || title).trim().slice(0, 300) || title;
    const filename = String(body.filename || "").trim().slice(0, 255);
    const contentType = String(body.content_type || "application/pdf").trim().slice(0, 120);
    const b64 = String(body.data_base64 || "").trim();
    if (!filename) return json(res, 400, { error: "filename required" });
    if (!b64) return json(res, 400, { error: "data_base64 required" });

    let buf;
    try {
      buf = Buffer.from(b64, "base64");
    } catch (e) {
      return json(res, 400, { error: "Invalid base64 file data" });
    }
    if (!buf.length) return json(res, 400, { error: "Empty file" });
    if (buf.length > MAX_UPLOAD_BYTES) {
      return json(res, 400, { error: "File too large (max 15 MB)" });
    }

    const receivedOn = parseDate(body.received_on) || new Date().toISOString().slice(0, 10);
    const sourceId =
      body.source_id != null && String(body.source_id).trim()
        ? String(body.source_id).trim().slice(0, 80)
        : parseSourceIdFromFilename(filename);
    const notes =
      body.notes != null ? String(body.notes).trim().slice(0, 8000) || null : null;

    if (sourceId) {
      try {
        const existing = await restSelect(
          cfg,
          "staff_mailbox_items",
          `select=id,title&source_id=eq.${encodeURIComponent(sourceId)}&limit=1`
        );
        if (existing && existing[0]) {
          return json(res, 409, {
            error: "Already imported",
            item: existing[0],
          });
        }
      } catch (e) {
        /* continue; unique index will catch races */
      }
    }

    const year = receivedOn.slice(0, 4);
    const safeName = filename.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
    const storagePath = `${year}/${sourceId || Date.now()}_${safeName}`;

    try {
      await storageUpload(cfg, storagePath, buf, contentType);
      const inserted = await restInsert(cfg, "staff_mailbox_items", {
        title,
        from_name: fromName,
        received_on: receivedOn,
        filename,
        content_type: contentType,
        storage_path: storagePath,
        file_size_bytes: buf.length,
        source_id: sourceId,
        notes,
        uploaded_by: uploadedBy,
        updated_at: new Date().toISOString(),
      });
      const item = Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
      return json(res, 200, { item });
    } catch (e) {
      const hint = migrationHint(e);
      if (hint) return json(res, hint.status, hint.body);
      if (/duplicate|unique|23505/i.test(String(e.message || e))) {
        return json(res, 409, { error: "Already imported" });
      }
      console.error("staff/mailbox POST", e);
      return json(res, 500, { error: "Failed to upload mail" });
    }
  }

  if (req.method === "PATCH") {
    const id = String(q.id || "").trim();
    if (!isUuid(id)) return json(res, 400, { error: "Valid id required" });
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const patch = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) {
      const title = String(body.title || "").trim().slice(0, 300);
      if (!title) return json(res, 400, { error: "title required" });
      patch.title = title;
    }
    if (body.from_name !== undefined) {
      patch.from_name = String(body.from_name || "").trim().slice(0, 300) || null;
    }
    if (body.received_on !== undefined) {
      const d = parseDate(body.received_on);
      if (!d) return json(res, 400, { error: "Invalid received_on" });
      patch.received_on = d;
    }
    if (body.notes !== undefined) {
      patch.notes = String(body.notes || "").trim().slice(0, 8000) || null;
    }
    try {
      await restPatch(cfg, "staff_mailbox_items", `id=eq.${encodeURIComponent(id)}`, patch);
      const rows = await restSelect(
        cfg,
        "staff_mailbox_items",
        `select=${LIST_SELECT}&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      return json(res, 200, { item: rows && rows[0] ? rows[0] : null });
    } catch (e) {
      const hint = migrationHint(e);
      if (hint) return json(res, hint.status, hint.body);
      console.error("staff/mailbox PATCH", e);
      return json(res, 500, { error: "Failed to update mail" });
    }
  }

  if (req.method === "DELETE") {
    const id = String(q.id || "").trim();
    if (!isUuid(id)) return json(res, 400, { error: "Valid id required" });
    try {
      const rows = await restSelect(
        cfg,
        "staff_mailbox_items",
        `select=storage_path&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      const item = rows && rows[0];
      if (item && item.storage_path) {
        try {
          await storageRemove(cfg, item.storage_path);
        } catch (e) {
          console.warn("staff/mailbox DELETE storage", e);
        }
      }
      await restDelete(cfg, "staff_mailbox_items", `id=eq.${encodeURIComponent(id)}`);
      return json(res, 200, { ok: true });
    } catch (e) {
      const hint = migrationHint(e);
      if (hint) return json(res, hint.status, hint.body);
      console.error("staff/mailbox DELETE", e);
      return json(res, 500, { error: "Failed to delete mail" });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return json(res, 405, { error: "Method Not Allowed" });
};
