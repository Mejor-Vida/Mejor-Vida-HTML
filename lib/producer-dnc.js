/**
 * Upsert producer DNC / consent revocation (STOP, staff opt-out, etc.).
 */

const { phoneLast10 } = require("./sms-consent-gate");
const { logComplianceEvent } = require("./crm-compliance");

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

/**
 * Record revocation for SMS (+ voice by default). Idempotent on phone_last10.
 */
async function recordProducerDnc(supabaseUrl, serviceKey, opts = {}) {
  const phone = String(opts.phone || "").trim();
  const last10 = phoneLast10(phone);
  if (!last10 || last10.length < 10) return null;

  const now = new Date().toISOString();
  const channels = Array.isArray(opts.channels) && opts.channels.length
    ? opts.channels
    : ["sms", "voice"];
  const row = {
    phone,
    phone_last10: last10,
    channels,
    reason: opts.reason || "consent_revoked",
    method: opts.method || "unknown",
    contact_id: opts.contactId || opts.contact_id || null,
    lead_id: opts.leadId || opts.lead_id || null,
    lead_source_table: opts.leadSourceTable || opts.lead_source_table || null,
    detail: opts.detail && typeof opts.detail === "object" ? opts.detail : {},
    updated_at: now,
  };

  try {
    const existing = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/producer_dnc_registry?phone_last10=eq.${encodeURIComponent(last10)}&select=id&limit=1`
    );
    if (Array.isArray(existing) && existing[0] && existing[0].id) {
      await sbFetch(supabaseUrl, serviceKey, `/producer_dnc_registry?id=eq.${existing[0].id}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify(row),
      });
    } else {
      await sbFetch(supabaseUrl, serviceKey, "/producer_dnc_registry", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify(Object.assign({ created_at: now }, row)),
      });
    }
  } catch (e) {
    console.warn("[producer-dnc] upsert failed:", e && e.message);
    return null;
  }

  if (row.lead_id && row.lead_source_table) {
    await logComplianceEvent(supabaseUrl, serviceKey, {
      leadId: row.lead_id,
      leadSourceTable: row.lead_source_table,
      eventType: "consent_revoked",
      title: "Consent revoked / DNC",
      actor: opts.actor || opts.method || "system",
      detail: {
        phone_last10: last10,
        channels,
        method: row.method,
        reason: row.reason,
      },
    });
  }

  // Clear SMS/voice flags on staff profile when we know the lead
  if (row.lead_id && row.lead_source_table) {
    try {
      const profiles = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/staff_lead_profiles?lead_id=eq.${encodeURIComponent(
          row.lead_id
        )}&lead_source_table=eq.${encodeURIComponent(row.lead_source_table)}&select=id,profile_data&limit=1`
      );
      const prof = Array.isArray(profiles) && profiles[0] ? profiles[0] : null;
      if (prof && prof.id) {
        const pd = prof.profile_data && typeof prof.profile_data === "object" ? { ...prof.profile_data } : {};
        pd.sms_opt_in = false;
        if (channels.includes("voice")) pd.voice_opt_in = false;
        pd.dnc_at = now;
        pd.dnc_method = row.method;
        await sbFetch(supabaseUrl, serviceKey, `/staff_lead_profiles?id=eq.${prof.id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({ profile_data: pd, updated_at: now }),
        });
      }
    } catch (e) {
      console.warn("[producer-dnc] profile update failed:", e && e.message);
    }

    try {
      await sbFetch(
        supabaseUrl,
        serviceKey,
        `/crm_nurture_enrollments?lead_id=eq.${encodeURIComponent(
          row.lead_id
        )}&lead_source_table=eq.${encodeURIComponent(row.lead_source_table)}&status=eq.active`,
        {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({
            status: "opt_out",
            updated_at: now,
          }),
        }
      );
    } catch (_) {
      /* enrollments table / column may differ */
    }
  }

  return { phone_last10: last10, channels };
}

module.exports = {
  recordProducerDnc,
};
