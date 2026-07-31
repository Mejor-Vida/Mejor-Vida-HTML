/**
 * Pre-send SMS consent / STOP gate for automated (and queue) messages.
 * Used so deferred queue flushes and legacy nurture paths re-check before send.
 */

const { isConsentExpired } = require("./crm-compliance");

function sbHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

async function sbFetch(supabaseUrl, serviceKey, path) {
  const base = String(supabaseUrl || "").replace(/\/$/, "");
  const res = await fetch(`${base}/rest/v1${path}`, {
    headers: sbHeaders(serviceKey),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase GET ${path}: ${res.status} ${text.slice(0, 300)}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function digitsOnly(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function phoneLast10(phone) {
  const d = digitsOnly(phone);
  return d.length >= 10 ? d.slice(-10) : d;
}

function parseSmsOptInFromQuoteLead(consentSummary, payload) {
  const cs = consentSummary && typeof consentSummary === "object" ? consentSummary : {};
  const pl = payload && typeof payload === "object" ? payload : {};
  if (cs.smsOptIn === true || cs.smsOptIn === false) return !!cs.smsOptIn;
  const mo =
    (pl.marketingOptIn && typeof pl.marketingOptIn === "object" ? pl.marketingOptIn : null) ||
    (cs.marketingOptIn && typeof cs.marketingOptIn === "object" ? cs.marketingOptIn : null);
  if (mo && (mo.sms === true || mo.sms === false)) return !!mo.sms;
  return null;
}

/**
 * @returns {Promise<{ allowed: boolean, reason: string|null, optedOut: boolean, optedIn: boolean|null }>}
 */
async function evaluateSmsSendEligibility({
  supabaseUrl,
  serviceKey,
  phone,
  leadId = null,
  leadSourceTable = null,
  contactId = null,
  requireOptIn = true,
}) {
  if (!supabaseUrl || !serviceKey) {
    return { allowed: false, reason: "missing_supabase", optedOut: false, optedIn: null };
  }
  const phoneRaw = String(phone || "").trim();
  if (!phoneRaw) {
    return { allowed: false, reason: "no_phone", optedOut: false, optedIn: null };
  }
  const last10 = phoneLast10(phoneRaw);

  // 1) Producer DNC registry (STOP / revocation)
  try {
    const dnc = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/producer_dnc_registry?phone_last10=eq.${encodeURIComponent(last10)}&select=id,channels&limit=1`
    );
    if (Array.isArray(dnc) && dnc[0]) {
      const ch = dnc[0].channels || [];
      if (!Array.isArray(ch) || ch.includes("sms") || ch.length === 0) {
        return { allowed: false, reason: "producer_dnc", optedOut: true, optedIn: false };
      }
    }
  } catch (_) {
    /* table may not exist yet — fall through to legacy flags */
  }

  // 2) Legacy nurture STOP flag on contact
  let resolvedContactId = contactId;
  if (!resolvedContactId) {
    try {
      const contacts = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/contacts?or=(phone.eq.${encodeURIComponent(phoneRaw)},phone_last10.eq.${encodeURIComponent(
          last10
        )})&select=id&limit=1`
      );
      if (Array.isArray(contacts) && contacts[0]) resolvedContactId = contacts[0].id;
    } catch (_) {
      /* ignore */
    }
  }
  if (resolvedContactId) {
    try {
      const rows = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/nurture_sequence?contact_id=eq.${encodeURIComponent(
          resolvedContactId
        )}&select=twilio_opt_out&limit=1`
      );
      if (Array.isArray(rows) && rows[0] && rows[0].twilio_opt_out) {
        return { allowed: false, reason: "opted_out", optedOut: true, optedIn: false };
      }
    } catch (_) {
      /* ignore */
    }
  }

  // 3) Profile / lead sms_opt_in + expiry
  let optedIn = null;

  if (leadId && leadSourceTable) {
    try {
      const profiles = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/staff_lead_profiles?lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
          leadSourceTable
        )}&select=profile_data&limit=1`
      );
      const pd = profiles && profiles[0] ? profiles[0].profile_data : null;
      if (pd && typeof pd === "object") {
        if (pd.archived_at || pd.status === "archived" || pd.outreach_blocked_reason === "archived") {
          return { allowed: false, reason: "archived", optedOut: false, optedIn: false };
        }
        if (pd.sms_opt_in === false) {
          return { allowed: false, reason: "sms_opt_in_false", optedOut: false, optedIn: false };
        }
        if (pd.consent_expires_at && isConsentExpired(pd.consent_expires_at)) {
          return { allowed: false, reason: "consent_expired", optedOut: false, optedIn: false };
        }
        if (pd.sms_opt_in === true) optedIn = true;
      }
    } catch (_) {
      /* ignore */
    }

    if (leadSourceTable === "quote_lead_submissions" && optedIn !== true) {
      try {
        const rows = await sbFetch(
          supabaseUrl,
          serviceKey,
          `/quote_lead_submissions?id=eq.${encodeURIComponent(
            leadId
          )}&select=consent_summary,consent_expires_at,payload&limit=1`
        );
        const row = rows && rows[0];
        if (row) {
          if (row.consent_expires_at && isConsentExpired(row.consent_expires_at)) {
            return { allowed: false, reason: "consent_expired", optedOut: false, optedIn: false };
          }
          const flag = parseSmsOptInFromQuoteLead(row.consent_summary, row.payload);
          if (flag === false) {
            return { allowed: false, reason: "sms_opt_in_false", optedOut: false, optedIn: false };
          }
          if (flag === true) optedIn = true;
        }
      } catch (_) {
        /* ignore */
      }
    }

    if (leadSourceTable === "manychat_leads" && optedIn !== true) {
      try {
        const rows = await sbFetch(
          supabaseUrl,
          serviceKey,
          `/manychat_leads?id=eq.${encodeURIComponent(leadId)}&select=opt_in&limit=1`
        );
        if (rows && rows[0] && rows[0].opt_in === true) optedIn = true;
        if (rows && rows[0] && rows[0].opt_in === false) {
          return { allowed: false, reason: "sms_opt_in_false", optedOut: false, optedIn: false };
        }
      } catch (_) {
        /* ignore */
      }
    }
  }

  // 4) Phone-level quote consent fallback
  if (optedIn !== true) {
    const phoneVariants = Array.from(
      new Set([phoneRaw, last10, `+1${last10}`, `1${last10}`].filter(Boolean))
    );
    for (const variant of phoneVariants) {
      try {
        const quotes = await sbFetch(
          supabaseUrl,
          serviceKey,
          `/quote_lead_submissions?phone=eq.${encodeURIComponent(
            variant
          )}&select=consent_summary,consent_expires_at,payload&order=created_at.desc&limit=3`
        );
        for (const row of quotes || []) {
          if (row.consent_expires_at && isConsentExpired(row.consent_expires_at)) continue;
          const flag = parseSmsOptInFromQuoteLead(row.consent_summary, row.payload);
          if (flag === true) {
            optedIn = true;
            break;
          }
          if (flag === false && optedIn == null) optedIn = false;
        }
        if (optedIn === true) break;
      } catch (_) {
        /* ignore */
      }
    }
  }

  if (requireOptIn && optedIn !== true) {
    return {
      allowed: false,
      reason: optedIn === false ? "sms_opt_in_false" : "sms_opt_in_unknown",
      optedOut: false,
      optedIn,
    };
  }

  return { allowed: true, reason: null, optedOut: false, optedIn };
}

module.exports = {
  evaluateSmsSendEligibility,
  phoneLast10,
  digitsOnly,
};
