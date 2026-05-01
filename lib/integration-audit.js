/**
 * Best-effort pipeline audit rows in Supabase (integration_audit_events).
 * Fails silently if the table is missing or insert errors — never blocks callers.
 */

function phoneLast4FromPhone(phone) {
  const d = String(phone || "").replace(/\D/g, "");
  if (d.length < 4) return null;
  return d.slice(-4);
}

function trimDetail(detail, maxKeys = 40) {
  if (!detail || typeof detail !== "object") return null;
  try {
    const out = {};
    let n = 0;
    for (const [k, v] of Object.entries(detail)) {
      if (n >= maxKeys) break;
      if (v == null) {
        out[k] = v;
      } else if (typeof v === "string") {
        out[k] = v.length > 500 ? `${v.slice(0, 500)}…` : v;
      } else if (typeof v === "number" || typeof v === "boolean") {
        out[k] = v;
      } else {
        out[k] = "[object]";
      }
      n++;
    }
    return out;
  } catch (_) {
    return null;
  }
}

/**
 * @param {string} supabaseUrl
 * @param {string} serviceKey
 * @param {{ stage: string, endpoint?: string, outcome: 'ok'|'error', phone?: string, message?: string, detail?: object, manychatLeadId?: string, contactId?: string }} event
 */
async function logIntegrationAudit(supabaseUrl, serviceKey, event) {
  if (!supabaseUrl || !serviceKey || !event || !event.stage) return;
  const base = `${String(supabaseUrl).replace(/\/$/, "")}/rest/v1/integration_audit_events`;
  const pl4 = event.phone
    ? phoneLast4FromPhone(event.phone)
    : event.phoneLast4
      ? String(event.phoneLast4).replace(/\D/g, "").slice(-4) || null
      : null;
  const body = {
    stage: String(event.stage).slice(0, 200),
    endpoint: event.endpoint ? String(event.endpoint).slice(0, 300) : null,
    outcome: event.outcome === "error" ? "error" : "ok",
    phone_last4: pl4 && pl4.length === 4 ? pl4 : null,
    message: event.message ? String(event.message).slice(0, 8000) : null,
    detail: trimDetail(event.detail),
    manychat_lead_id: event.manychatLeadId || null,
    contact_id: event.contactId || null,
  };
  try {
    const r = await fetch(base, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const t = await r.text();
      if (process.env.NODE_ENV !== "test") {
        console.warn("[integration-audit] insert", r.status, (t || "").slice(0, 200));
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[integration-audit] insert failed:", (e && e.message) || e);
    }
  }
}

module.exports = { logIntegrationAudit, phoneLast4FromPhone };
