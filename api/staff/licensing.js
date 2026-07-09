/**
 * Staff CRM Licensing — state licenses, agency license, training, documents.
 *
 * GET    /api/staff/licensing
 * POST   /api/staff/licensing?type=state|agency|training|document
 * PATCH  /api/staff/licensing?type=state|agency|training&id=<uuid>
 * DELETE /api/staff/licensing?type=state|training|document&id=<uuid>
 * GET    /api/staff/licensing?download=<document_uuid>  → file bytes (base64 JSON)
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
const BUCKET = "staff-licensing-docs";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const STATE_TYPES = new Set(["resident", "non_resident", "temporary", "other"]);
const STATE_STATUS = new Set(["active", "pending", "expired", "inactive", "suspended"]);
const AGENCY_STATUS = new Set(["active", "pending", "expired", "inactive"]);
const TRAIN_CAT = new Set(["ce", "product", "aml", "compliance", "other"]);
const TRAIN_STATUS = new Set(["pending", "completed", "overdue", "waived"]);
const PARENT_TYPES = new Set(["state", "agency", "training"]);

function isUuid(s) {
  return UUID_RE.test(String(s || ""));
}

function normState(v) {
  const t = String(v || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return t.length >= 2 ? t.slice(0, 2) : null;
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
  const buf = Buffer.from(await r.arrayBuffer());
  return buf;
}

async function storageRemove(cfg, path) {
  const base = String(cfg.supabaseUrl || "").replace(/\/$/, "");
  await fetch(`${base}/storage/v1/object/${BUCKET}/${encodeURIComponent(path)}`, {
    method: "DELETE",
    headers: sbHeaders(cfg.serviceKey),
  });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T12:00:00");
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function enrichState(row) {
  const exp = daysUntil(row.expiration_date);
  const renew = daysUntil(row.renewal_due_date);
  return Object.assign({}, row, {
    days_until_expiration: exp,
    days_until_renewal: renew,
    expiring_soon: exp != null && exp >= 0 && exp <= 60,
    expired: exp != null && exp < 0,
  });
}

function enrichTraining(row) {
  const due = daysUntil(row.due_date);
  let status = row.status;
  if (status === "pending" && due != null && due < 0) status = "overdue";
  return Object.assign({}, row, {
    days_until_due: due,
    display_status: status,
    overdue: due != null && due < 0 && row.status !== "completed" && row.status !== "waived",
  });
}

async function loadAll(cfg) {
  const [states, agencyRows, training, documents] = await Promise.all([
    restSelect(
      cfg,
      "staff_state_licenses",
      "select=*&order=state_code.asc&limit=100"
    ),
    restSelect(cfg, "staff_agency_license", "select=*&order=updated_at.desc&limit=5"),
    restSelect(
      cfg,
      "staff_license_training",
      "select=*&order=due_date.asc.nullslast,title.asc&limit=200"
    ),
    restSelect(
      cfg,
      "staff_license_documents",
      "select=id,parent_type,parent_id,filename,content_type,file_size_bytes,uploaded_at,notes&order=uploaded_at.desc&limit=500"
    ),
  ]);

  const enrichedStates = (states || []).map(enrichState);
  const enrichedTraining = (training || []).map(enrichTraining);
  const agency = agencyRows && agencyRows[0] ? agencyRows[0] : null;

  const summary = {
    state_count: enrichedStates.length,
    states_expiring_60: enrichedStates.filter((s) => s.expiring_soon && !s.expired).length,
    states_expired: enrichedStates.filter((s) => s.expired).length,
    training_due_30: enrichedTraining.filter(
      (t) => t.days_until_due != null && t.days_until_due >= 0 && t.days_until_due <= 30 && t.status !== "completed"
    ).length,
    training_overdue: enrichedTraining.filter((t) => t.overdue).length,
    document_count: (documents || []).length,
    agency_expiration_days: agency ? daysUntil(agency.expiration_date) : null,
  };

  return {
    summary,
    states: enrichedStates,
    agency,
    training: enrichedTraining,
    documents: documents || [],
  };
}

function migrationHint(e) {
  const msg = String((e && e.message) || e);
  if (/42P01|relation|does not exist/i.test(msg)) {
    return {
      status: 503,
      body: {
        error: "Database not migrated",
        detail: "Apply migration 082_staff_licensing.sql in Supabase.",
      },
    };
  }
  return null;
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  const q = req.query || {};
  const uploadedBy = auth.user && auth.user.email ? auth.user.email : null;

  if (req.method === "GET" && q.download) {
    const docId = String(q.download || "").trim();
    if (!isUuid(docId)) return json(res, 400, { error: "Valid download id required" });
    try {
      const rows = await restSelect(
        cfg,
        "staff_license_documents",
        `select=*&id=eq.${encodeURIComponent(docId)}&limit=1`
      );
      const doc = rows && rows[0];
      if (!doc) return json(res, 404, { error: "Document not found" });
      const buf = await storageDownload(cfg, doc.storage_path);
      return json(res, 200, {
        id: doc.id,
        filename: doc.filename,
        content_type: doc.content_type,
        data_base64: buf.toString("base64"),
      });
    } catch (e) {
      console.error("staff/licensing GET download", e);
      return json(res, 500, { error: "Failed to download document" });
    }
  }

  if (req.method === "GET") {
    try {
      const payload = await loadAll(cfg);
      return json(res, 200, payload);
    } catch (e) {
      const hint = migrationHint(e);
      if (hint) return json(res, hint.status, hint.body);
      console.error("staff/licensing GET", e);
      return json(res, 500, { error: "Failed to load licensing data" });
    }
  }

  const type = String(q.type || "").trim().toLowerCase();

  if (req.method === "POST") {
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }

    if (type === "state") {
      const state = normState(body.state_code);
      if (!state) return json(res, 400, { error: "state_code (2 letters) required" });
      const licenseType = STATE_TYPES.has(body.license_type) ? body.license_type : "non_resident";
      const status = STATE_STATUS.has(body.status) ? body.status : "active";
      const loa = Array.isArray(body.lines_of_authority)
        ? body.lines_of_authority.map((x) => String(x).trim()).filter(Boolean).slice(0, 12)
        : [];
      const row = {
        state_code: state,
        license_number: body.license_number != null ? String(body.license_number).trim().slice(0, 80) || null : null,
        license_type: licenseType,
        status,
        lines_of_authority: loa,
        effective_date: parseDate(body.effective_date),
        expiration_date: parseDate(body.expiration_date),
        renewal_due_date: parseDate(body.renewal_due_date),
        verify_url: body.verify_url != null ? String(body.verify_url).trim().slice(0, 500) || null : null,
        notes: body.notes != null ? String(body.notes).trim().slice(0, 8000) || null : null,
        updated_at: new Date().toISOString(),
      };
      try {
        const inserted = await restInsert(cfg, "staff_state_licenses", row);
        const item = Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
        return json(res, 200, { state: enrichState(item) });
      } catch (e) {
        const hint = migrationHint(e);
        if (hint) return json(res, hint.status, hint.body);
        console.error("staff/licensing POST state", e);
        return json(res, 500, { error: "Failed to add state license" });
      }
    }

    if (type === "agency") {
      const entityName = String(body.entity_name || "").trim().slice(0, 300);
      if (!entityName) return json(res, 400, { error: "entity_name required" });
      const row = {
        entity_name: entityName,
        license_number: body.license_number != null ? String(body.license_number).trim().slice(0, 80) || null : null,
        state_code: normState(body.state_code) || "NE",
        status: AGENCY_STATUS.has(body.status) ? body.status : "active",
        effective_date: parseDate(body.effective_date),
        expiration_date: parseDate(body.expiration_date),
        renewal_due_date: parseDate(body.renewal_due_date),
        registered_agent: body.registered_agent != null ? String(body.registered_agent).trim().slice(0, 300) || null : null,
        business_address: body.business_address != null ? String(body.business_address).trim().slice(0, 500) || null : null,
        verify_url: body.verify_url != null ? String(body.verify_url).trim().slice(0, 500) || null : null,
        notes: body.notes != null ? String(body.notes).trim().slice(0, 8000) || null : null,
        updated_at: new Date().toISOString(),
      };
      try {
        const existing = await restSelect(cfg, "staff_agency_license", "select=id&limit=1");
        if (existing && existing[0]) {
          await restPatch(cfg, "staff_agency_license", `id=eq.${existing[0].id}`, row);
          const rows = await restSelect(cfg, "staff_agency_license", `select=*&id=eq.${existing[0].id}&limit=1`);
          return json(res, 200, { agency: rows && rows[0] });
        }
        const inserted = await restInsert(cfg, "staff_agency_license", row);
        const item = Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
        return json(res, 200, { agency: item });
      } catch (e) {
        const hint = migrationHint(e);
        if (hint) return json(res, hint.status, hint.body);
        console.error("staff/licensing POST agency", e);
        return json(res, 500, { error: "Failed to save agency license" });
      }
    }

    if (type === "training") {
      const title = String(body.title || "").trim().slice(0, 300);
      if (!title) return json(res, 400, { error: "title required" });
      const row = {
        title,
        category: TRAIN_CAT.has(body.category) ? body.category : "ce",
        provider: body.provider != null ? String(body.provider).trim().slice(0, 200) || null : null,
        state_code: body.state_code ? normState(body.state_code) : null,
        due_date: parseDate(body.due_date),
        completed_date: parseDate(body.completed_date),
        hours_required: body.hours_required != null ? Number(body.hours_required) || null : null,
        hours_completed: body.hours_completed != null ? Number(body.hours_completed) || null : null,
        status: TRAIN_STATUS.has(body.status) ? body.status : "pending",
        notes: body.notes != null ? String(body.notes).trim().slice(0, 8000) || null : null,
        updated_at: new Date().toISOString(),
      };
      try {
        const inserted = await restInsert(cfg, "staff_license_training", row);
        const item = Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
        return json(res, 200, { training: enrichTraining(item) });
      } catch (e) {
        const hint = migrationHint(e);
        if (hint) return json(res, hint.status, hint.body);
        console.error("staff/licensing POST training", e);
        return json(res, 500, { error: "Failed to add training item" });
      }
    }

    if (type === "document") {
      const parentType = String(body.parent_type || "").toLowerCase();
      const parentId = String(body.parent_id || "").trim();
      if (!PARENT_TYPES.has(parentType)) return json(res, 400, { error: "parent_type required" });
      if (!isUuid(parentId)) return json(res, 400, { error: "Valid parent_id required" });
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
      if (buf.length > MAX_UPLOAD_BYTES) return json(res, 400, { error: "File too large (max 8 MB)" });
      const safeName = filename.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
      const storagePath = `${parentType}/${parentId}/${Date.now()}_${safeName}`;
      try {
        await storageUpload(cfg, storagePath, buf, contentType);
        const inserted = await restInsert(cfg, "staff_license_documents", {
          parent_type: parentType,
          parent_id: parentId,
          filename,
          content_type: contentType,
          storage_path: storagePath,
          file_size_bytes: buf.length,
          notes: body.notes != null ? String(body.notes).trim().slice(0, 2000) || null : null,
          uploaded_by: uploadedBy,
        });
        const doc = Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
        return json(res, 200, { document: doc });
      } catch (e) {
        const hint = migrationHint(e);
        if (hint) return json(res, hint.status, hint.body);
        console.error("staff/licensing POST document", e);
        return json(res, 500, { error: "Failed to upload document" });
      }
    }

    return json(res, 400, { error: "POST requires type=state|agency|training|document" });
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

    if (type === "state") {
      if (body.state_code !== undefined) {
        const s = normState(body.state_code);
        if (!s) return json(res, 400, { error: "Invalid state_code" });
        patch.state_code = s;
      }
      if (body.license_number !== undefined) patch.license_number = String(body.license_number || "").trim().slice(0, 80) || null;
      if (body.license_type !== undefined && STATE_TYPES.has(body.license_type)) patch.license_type = body.license_type;
      if (body.status !== undefined && STATE_STATUS.has(body.status)) patch.status = body.status;
      if (body.lines_of_authority !== undefined) {
        patch.lines_of_authority = Array.isArray(body.lines_of_authority)
          ? body.lines_of_authority.map((x) => String(x).trim()).filter(Boolean).slice(0, 12)
          : [];
      }
      if (body.effective_date !== undefined) patch.effective_date = parseDate(body.effective_date);
      if (body.expiration_date !== undefined) patch.expiration_date = parseDate(body.expiration_date);
      if (body.renewal_due_date !== undefined) patch.renewal_due_date = parseDate(body.renewal_due_date);
      if (body.verify_url !== undefined) patch.verify_url = String(body.verify_url || "").trim().slice(0, 500) || null;
      if (body.notes !== undefined) patch.notes = String(body.notes || "").trim().slice(0, 8000) || null;
      try {
        await restPatch(cfg, "staff_state_licenses", `id=eq.${encodeURIComponent(id)}`, patch);
        const rows = await restSelect(cfg, "staff_state_licenses", `select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
        return json(res, 200, { state: rows && rows[0] ? enrichState(rows[0]) : null });
      } catch (e) {
        console.error("staff/licensing PATCH state", e);
        return json(res, 500, { error: "Failed to update state license" });
      }
    }

    if (type === "agency") {
      if (body.entity_name !== undefined) patch.entity_name = String(body.entity_name || "").trim().slice(0, 300);
      if (body.license_number !== undefined) patch.license_number = String(body.license_number || "").trim().slice(0, 80) || null;
      if (body.state_code !== undefined) patch.state_code = normState(body.state_code) || "NE";
      if (body.status !== undefined && AGENCY_STATUS.has(body.status)) patch.status = body.status;
      if (body.effective_date !== undefined) patch.effective_date = parseDate(body.effective_date);
      if (body.expiration_date !== undefined) patch.expiration_date = parseDate(body.expiration_date);
      if (body.renewal_due_date !== undefined) patch.renewal_due_date = parseDate(body.renewal_due_date);
      if (body.registered_agent !== undefined) patch.registered_agent = String(body.registered_agent || "").trim().slice(0, 300) || null;
      if (body.business_address !== undefined) patch.business_address = String(body.business_address || "").trim().slice(0, 500) || null;
      if (body.verify_url !== undefined) patch.verify_url = String(body.verify_url || "").trim().slice(0, 500) || null;
      if (body.notes !== undefined) patch.notes = String(body.notes || "").trim().slice(0, 8000) || null;
      try {
        await restPatch(cfg, "staff_agency_license", `id=eq.${encodeURIComponent(id)}`, patch);
        const rows = await restSelect(cfg, "staff_agency_license", `select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
        return json(res, 200, { agency: rows && rows[0] });
      } catch (e) {
        console.error("staff/licensing PATCH agency", e);
        return json(res, 500, { error: "Failed to update agency license" });
      }
    }

    if (type === "training") {
      if (body.title !== undefined) patch.title = String(body.title || "").trim().slice(0, 300);
      if (body.category !== undefined && TRAIN_CAT.has(body.category)) patch.category = body.category;
      if (body.provider !== undefined) patch.provider = String(body.provider || "").trim().slice(0, 200) || null;
      if (body.state_code !== undefined) patch.state_code = body.state_code ? normState(body.state_code) : null;
      if (body.due_date !== undefined) patch.due_date = parseDate(body.due_date);
      if (body.completed_date !== undefined) patch.completed_date = parseDate(body.completed_date);
      if (body.hours_required !== undefined) patch.hours_required = body.hours_required != null ? Number(body.hours_required) || null : null;
      if (body.hours_completed !== undefined) patch.hours_completed = body.hours_completed != null ? Number(body.hours_completed) || null : null;
      if (body.status !== undefined && TRAIN_STATUS.has(body.status)) patch.status = body.status;
      if (body.notes !== undefined) patch.notes = String(body.notes || "").trim().slice(0, 8000) || null;
      try {
        await restPatch(cfg, "staff_license_training", `id=eq.${encodeURIComponent(id)}`, patch);
        const rows = await restSelect(cfg, "staff_license_training", `select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
        return json(res, 200, { training: rows && rows[0] ? enrichTraining(rows[0]) : null });
      } catch (e) {
        console.error("staff/licensing PATCH training", e);
        return json(res, 500, { error: "Failed to update training item" });
      }
    }

    return json(res, 400, { error: "PATCH requires type=state|agency|training" });
  }

  if (req.method === "DELETE") {
    const id = String(q.id || "").trim();
    if (!isUuid(id)) return json(res, 400, { error: "Valid id required" });

    if (type === "document") {
      try {
        const rows = await restSelect(
          cfg,
          "staff_license_documents",
          `select=storage_path&id=eq.${encodeURIComponent(id)}&limit=1`
        );
        const doc = rows && rows[0];
        if (doc && doc.storage_path) {
          try {
            await storageRemove(cfg, doc.storage_path);
          } catch (e) {
            console.warn("staff/licensing DELETE storage", e);
          }
        }
        await restDelete(cfg, "staff_license_documents", `id=eq.${encodeURIComponent(id)}`);
        return json(res, 200, { ok: true });
      } catch (e) {
        console.error("staff/licensing DELETE document", e);
        return json(res, 500, { error: "Failed to delete document" });
      }
    }

    if (type === "state") {
      try {
        const docs = await restSelect(
          cfg,
          "staff_license_documents",
          `select=id,storage_path&parent_type=eq.state&parent_id=eq.${encodeURIComponent(id)}`
        );
        for (const d of docs || []) {
          if (d.storage_path) {
            try {
              await storageRemove(cfg, d.storage_path);
            } catch (e) {
              /* ignore */
            }
          }
          await restDelete(cfg, "staff_license_documents", `id=eq.${d.id}`);
        }
        await restDelete(cfg, "staff_state_licenses", `id=eq.${encodeURIComponent(id)}`);
        return json(res, 200, { ok: true });
      } catch (e) {
        console.error("staff/licensing DELETE state", e);
        return json(res, 500, { error: "Failed to delete state license" });
      }
    }

    if (type === "training") {
      try {
        await restDelete(cfg, "staff_license_training", `id=eq.${encodeURIComponent(id)}`);
        return json(res, 200, { ok: true });
      } catch (e) {
        console.error("staff/licensing DELETE training", e);
        return json(res, 500, { error: "Failed to delete training item" });
      }
    }

    return json(res, 400, { error: "DELETE requires type=state|training|document" });
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return json(res, 405, { error: "Method Not Allowed" });
};
