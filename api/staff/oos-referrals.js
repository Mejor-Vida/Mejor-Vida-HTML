const {
  requireStaffAuth,
  json,
  readJsonBody,
  serviceConfig,
  restSelect,
  restPatch,
  restDelete,
} = require("./_inbox-lib");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ""));
}

function normState(v) {
  const t = String(v || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return t.length >= 2 ? t.slice(0, 2) : t || null;
}

/** ManyChat / automation merge field that was never expanded (stored literally in DB). */
const UNRESOLVED_MERGE_TOKEN = /^\{\{[\s\S]*\}\}$/;

function pickScalar(row, keys) {
  if (!row || typeof row !== "object") return "";
  for (let i = 0; i < keys.length; i++) {
    const v = row[keys[i]];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function extractEmailFromMessage(messageText) {
  const m = String(messageText || "").match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);
  return m ? m[1] : "";
}

function extractPhoneFromMessage(messageText) {
  const t = String(messageText || "");
  const m = t.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/);
  if (!m) return "";
  const digits = m[0].replace(/\D/g, "");
  return digits.length >= 10 ? m[0].replace(/\s+/g, " ").trim() : "";
}

function resolveOosContactDisplay(raw, kind, messageText) {
  let s = raw != null ? String(raw).trim() : "";
  if (s && !UNRESOLVED_MERGE_TOKEN.test(s)) return s;
  if (UNRESOLVED_MERGE_TOKEN.test(s)) s = "";
  if (kind === "email") {
    const alt = extractEmailFromMessage(messageText);
    return alt || s;
  }
  if (kind === "phone") {
    const alt = extractPhoneFromMessage(messageText);
    return alt || s;
  }
  return s;
}

function normalizeOosReferralRow(r) {
  if (!r || typeof r !== "object") return r;
  const messageText = r.message != null ? String(r.message) : "";
  const emailRaw = pickScalar(r, ["email", "Email", "user_email"]);
  const phoneRaw = pickScalar(r, ["phone", "Phone", "phone_number", "mobile"]);
  return Object.assign({}, r, {
    email: resolveOosContactDisplay(emailRaw, "email", messageText),
    phone: resolveOosContactDisplay(phoneRaw, "phone", messageText),
  });
}

function isCompletedBucketStatus(status) {
  const t = String(status || "").trim().toLowerCase();
  return t === "completed" || t === "compensated";
}

function filterReferralsByBucket(rows, bucket) {
  const b = String(bucket || "open").toLowerCase();
  const list = Array.isArray(rows) ? rows : [];
  if (b === "completed") return list.filter((r) => isCompletedBucketStatus(r && r.status));
  return list.filter((r) => !isCompletedBucketStatus(r && r.status));
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  if (req.method === "GET") {
    try {
      const bucket = req.query && req.query.bucket ? String(req.query.bucket) : "open";
      const rows = await restSelect(
        cfg,
        "out_of_state_referrals",
        "select=id,created_at,first_name,last_name,email,phone,state_code,message,consent_licensed_agent,source,status,matched_oos_agent_id,referral_context,ai_connection_email,compensation_notes,compensated_at&order=created_at.desc&limit=500"
      );
      const filtered = filterReferralsByBucket(rows, bucket);
      return json(res, 200, { referrals: filtered.map(normalizeOosReferralRow), bucket: bucket || "open" });
    } catch (e) {
      const msg = String((e && e.message) || e);
      if (/42703|PGRST204|column|does not exist/i.test(msg)) {
        return json(res, 503, {
          error: "Database not migrated",
          detail: "Apply migrations 042_oos_agents.sql and 043_oos_referral_compensation.sql in Supabase.",
        });
      }
      return json(res, 500, { error: "Failed to load referrals" });
    }
  }

  if (req.method === "DELETE") {
    const id = req.query && req.query.id ? String(req.query.id).trim() : "";
    if (!isUuid(id)) {
      return json(res, 400, { error: "Valid id query parameter required" });
    }
    try {
      await restDelete(cfg, "out_of_state_referrals", `id=eq.${encodeURIComponent(id)}`);
      return json(res, 200, { ok: true });
    } catch (e) {
      return json(res, 500, { error: "Failed to delete referral" });
    }
  }

  if (req.method === "PATCH") {
    const id = req.query && req.query.id ? String(req.query.id).trim() : "";
    if (!isUuid(id)) {
      return json(res, 400, { error: "Valid id query parameter required" });
    }
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const patch = {};
    const str = (k, max) => {
      if (body[k] === undefined) return;
      const v = String(body[k] ?? "").trim();
      patch[k] = max ? v.slice(0, max) : v || null;
    };
    str("first_name", 200);
    str("last_name", 200);
    if (body.email !== undefined) {
      const e = String(body.email || "")
        .trim()
        .toLowerCase()
        .slice(0, 500);
      if (!e) return json(res, 400, { error: "email cannot be empty" });
      patch.email = e;
    }
    str("phone", 40);
    if (body.state_code !== undefined) {
      patch.state_code = normState(body.state_code);
    }
    str("status", 80);
    if (body.referral_context !== undefined) {
      const t = String(body.referral_context || "").trim();
      patch.referral_context = t ? t.slice(0, 8000) : null;
    }
    if (body.ai_connection_email !== undefined) {
      const t = String(body.ai_connection_email || "").trim();
      patch.ai_connection_email = t ? t.slice(0, 16000) : null;
    }
    if (body.compensation_notes !== undefined) {
      const t = String(body.compensation_notes || "").trim();
      patch.compensation_notes = t ? t.slice(0, 8000) : null;
    }
    if (body.compensated_at !== undefined) {
      const v = body.compensated_at;
      if (v === null || v === "") patch.compensated_at = null;
      else {
        const d = new Date(String(v));
        patch.compensated_at = Number.isNaN(d.getTime()) ? null : d.toISOString();
      }
    }
    if (body.matched_oos_agent_id !== undefined) {
      const v = body.matched_oos_agent_id;
      if (v === null || v === "") patch.matched_oos_agent_id = null;
      else if (isUuid(v)) patch.matched_oos_agent_id = String(v);
      else return json(res, 400, { error: "matched_oos_agent_id must be a UUID or null" });
    }
    if (Object.keys(patch).length === 0) {
      return json(res, 400, { error: "No allowed fields to update" });
    }
    try {
      const updated = await restPatch(
        cfg,
        "out_of_state_referrals",
        `id=eq.${encodeURIComponent(id)}&select=*`,
        patch
      );
      const row = Array.isArray(updated) && updated[0] ? updated[0] : null;
      return json(res, 200, { referral: row ? normalizeOosReferralRow(row) : null });
    } catch (e) {
      const msg = String((e && e.message) || e);
      if (/42703|PGRST204|column|does not exist/i.test(msg)) {
        return json(res, 503, {
          error: "Database not migrated",
          detail: "Apply migration 042_oos_agents.sql in Supabase.",
        });
      }
      return json(res, 500, { error: "Failed to update referral" });
    }
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  return json(res, 405, { error: "Method Not Allowed" });
};
