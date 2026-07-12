/**
 * Append-only CRM compliance events + consent window helpers.
 */

const CONSENT_CONTACT_DAYS = 30;

function sbHeaders(serviceKey, prefer) {
  const h = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
  if (prefer) h.Prefer = prefer;
  return h;
}

async function sbFetch(supabaseUrl, serviceKey, path, opts = {}) {
  const base = String(supabaseUrl || "").replace(/\/$/, "");
  const res = await fetch(`${base}/rest/v1${path}`, {
    method: opts.method || "GET",
    headers: sbHeaders(serviceKey, opts.prefer),
    body: opts.body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase ${opts.method || "GET"} ${path}: ${res.status} ${text.slice(0, 300)}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function consentExpiresAt(fromIso, days = CONSENT_CONTACT_DAYS) {
  const base = fromIso ? new Date(fromIso) : new Date();
  if (Number.isNaN(base.getTime())) return new Date(Date.now() + days * 86400000).toISOString();
  return new Date(base.getTime() + days * 86400000).toISOString();
}

function isConsentExpired(expiresAt, now = new Date()) {
  if (!expiresAt) return false;
  const t = new Date(expiresAt).getTime();
  if (!Number.isFinite(t)) return false;
  return now.getTime() > t;
}

async function logComplianceEvent(supabaseUrl, serviceKey, opts) {
  const leadId = opts.leadId || opts.lead_id;
  const leadSourceTable = opts.leadSourceTable || opts.lead_source_table;
  if (!leadId || !leadSourceTable) return null;
  const row = {
    lead_id: leadId,
    lead_source_table: leadSourceTable,
    event_type: String(opts.eventType || opts.event_type || "note").slice(0, 80),
    title: opts.title ? String(opts.title).slice(0, 300) : null,
    detail: opts.detail && typeof opts.detail === "object" ? opts.detail : {},
    actor: opts.actor ? String(opts.actor).slice(0, 200) : null,
  };
  try {
    const rows = await sbFetch(supabaseUrl, serviceKey, "/crm_compliance_events", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify(row),
    });
    return Array.isArray(rows) ? rows[0] : rows;
  } catch (e) {
    console.warn("[crm-compliance] log event failed:", e && e.message);
    return null;
  }
}

async function listComplianceEvents(supabaseUrl, serviceKey, leadId, leadSourceTable, limit = 100) {
  const q =
    `/crm_compliance_events?lead_id=eq.${encodeURIComponent(leadId)}` +
    `&lead_source_table=eq.${encodeURIComponent(leadSourceTable)}` +
    `&select=*&order=created_at.desc&limit=${Math.min(Number(limit) || 100, 500)}`;
  return (await sbFetch(supabaseUrl, serviceKey, q)) || [];
}

module.exports = {
  CONSENT_CONTACT_DAYS,
  consentExpiresAt,
  isConsentExpired,
  logComplianceEvent,
  listComplianceEvents,
};
