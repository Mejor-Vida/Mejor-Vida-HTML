const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restSelect } = require("./_inbox-lib");
const { resolveContactForStaffLead, isUuid } = require("./_lead-contact");
const { sendSms, normalizeE164 } = require("../../lib/sms-send");
const { logContactCommunication } = require("../../lib/contact-communications");
const { insertEvent } = require("../../lib/contacts-db");
const { evaluateSmsSendEligibility } = require("../../lib/sms-consent-gate");

function parseSmsOptInFromQuoteLead(consentSummary, payload) {
  const cs = consentSummary && typeof consentSummary === "object" ? consentSummary : {};
  const pl = payload && typeof payload === "object" ? payload : {};
  if (cs.smsOptIn === true || cs.smsOptIn === false) {
    return { sms_opt_in: !!cs.smsOptIn };
  }
  const mo =
    (pl.marketingOptIn && typeof pl.marketingOptIn === "object" ? pl.marketingOptIn : null) ||
    (cs.marketingOptIn && typeof cs.marketingOptIn === "object" ? cs.marketingOptIn : null);
  if (mo && (mo.sms === true || mo.sms === false)) {
    return { sms_opt_in: !!mo.sms };
  }
  return { sms_opt_in: null };
}

function mergeSmsOptIn(a, b) {
  if (a === true || b === true) return true;
  if (a === false || b === false) return false;
  return null;
}

async function smsOptInForManychatLead(cfg, leadId) {
  const rows = await restSelect(
    cfg,
    "manychat_leads",
    `select=opt_in&limit=1&id=eq.${encodeURIComponent(leadId)}`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!row) return null;
  if (row.opt_in === true) return true;
  if (row.opt_in === false) return false;
  return null;
}

async function smsOptInForQuoteLead(cfg, leadId) {
  const rows = await restSelect(
    cfg,
    "quote_lead_submissions",
    `select=consent_summary,payload&limit=1&id=eq.${encodeURIComponent(leadId)}`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!row) return null;
  return parseSmsOptInFromQuoteLead(row.consent_summary, row.payload).sms_opt_in;
}

async function smsOptInByPhone(cfg, phoneRaw) {
  const phone = String(phoneRaw || "").trim();
  if (!phone) return null;

  let merged = null;

  try {
    const quotes = await restSelect(
      cfg,
      "quote_lead_submissions",
      `select=consent_summary,payload&phone=eq.${encodeURIComponent(phone)}&order=created_at.desc&limit=3`
    );
    (quotes || []).forEach((row) => {
      merged = mergeSmsOptIn(merged, parseSmsOptInFromQuoteLead(row.consent_summary, row.payload).sms_opt_in);
    });
  } catch (e) {
    console.warn("staff/send-sms quote opt-in lookup", e && e.message);
  }

  try {
    const mc = await restSelect(
      cfg,
      "manychat_leads",
      `select=opt_in&phone=eq.${encodeURIComponent(phone)}&order=updated_at.desc&limit=3`
    );
    (mc || []).forEach((row) => {
      if (row.opt_in === true) merged = mergeSmsOptIn(merged, true);
      else if (row.opt_in === false) merged = mergeSmsOptIn(merged, false);
    });
  } catch (e) {
    console.warn("staff/send-sms manychat opt-in lookup", e && e.message);
  }

  return merged;
}

async function verifyLeadSmsOptIn(cfg, leadId, sourceTable, phone) {
  const src = String(sourceTable || "");
  let optIn = null;

  if (src === "manychat_leads") {
    optIn = mergeSmsOptIn(optIn, await smsOptInForManychatLead(cfg, leadId));
  } else if (src === "quote_lead_submissions") {
    optIn = mergeSmsOptIn(optIn, await smsOptInForQuoteLead(cfg, leadId));
  }

  optIn = mergeSmsOptIn(optIn, await smsOptInByPhone(cfg, phone));
  return optIn === true;
}

async function contactSmsOptedOut(cfg, contactId) {
  if (!contactId) return false;
  try {
    const rows = await restSelect(
      cfg,
      "nurture_sequence",
      `select=twilio_opt_out&contact_id=eq.${encodeURIComponent(contactId)}&limit=1`
    );
    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    return !!(row && row.twilio_opt_out);
  } catch (e) {
    console.warn("staff/send-sms opt-out lookup", e && e.message);
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { success: false, error: "Server missing required configuration" });

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  const leadId = body && body.leadId != null ? String(body.leadId).trim() : "";
  const toPhoneRaw = body && body.toPhone != null ? String(body.toPhone).trim() : "";
  const message = body && body.body != null ? String(body.body).trim() : "";
  const leadSourceTable =
    body && body.leadSourceTable != null ? String(body.leadSourceTable).trim() : "";

  if (!leadId || !isUuid(leadId)) {
    return json(res, 400, { success: false, error: "Select a lead before sending SMS." });
  }
  if (!message) {
    return json(res, 200, { success: false, error: "Enter a message before sending." });
  }
  if (message.length > 1600) {
    return json(res, 200, { success: false, error: "Message is too long (max 1600 characters)." });
  }

  const toE164 = normalizeE164(toPhoneRaw);
  if (!toE164 || toE164.length < 11) {
    return json(res, 200, { success: false, error: "A valid mobile number is required." });
  }

  let resolved;
  try {
    resolved = await resolveContactForStaffLead(cfg, leadId);
  } catch (e) {
    console.error("staff/send-sms resolveContact", e);
    return json(res, 500, { success: false, error: "Could not resolve client record." });
  }
  if (resolved.error) {
    return json(res, resolved.status || 400, { success: false, error: resolved.error });
  }

  const sourceTable = leadSourceTable || resolved.sourceTable || "";
  try {
    const profiles = await restSelect(
      cfg,
      "staff_lead_profiles",
      `lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
        sourceTable
      )}&select=profile_data&limit=1`
    );
    const pd = profiles && profiles[0] && profiles[0].profile_data;
    if (pd && (pd.archived_at || pd.status === "archived" || pd.sms_opt_in === false)) {
      return json(res, 200, {
        success: false,
        error: "SMS not allowed — this lead is archived or SMS permission is off.",
      });
    }
  } catch (e) {
    console.warn("staff/send-sms archive check", e && e.message);
  }
  const phoneForOptIn = toPhoneRaw || resolved.unified.phone || "";
  let optedIn;
  try {
    optedIn = await verifyLeadSmsOptIn(cfg, leadId, sourceTable, phoneForOptIn);
  } catch (e) {
    console.error("staff/send-sms opt-in check", e);
    return json(res, 500, { success: false, error: "Could not verify SMS opt-in." });
  }
  if (!optedIn) {
    return json(res, 200, {
      success: false,
      error: "SMS not allowed — client has not opted in to text messages.",
    });
  }

  if (await contactSmsOptedOut(cfg, resolved.contactId)) {
    return json(res, 200, {
      success: false,
      error: "SMS not allowed — this number replied STOP to opt out.",
    });
  }

  try {
    const elig = await evaluateSmsSendEligibility({
      supabaseUrl: cfg.supabaseUrl,
      serviceKey: cfg.serviceKey,
      phone: toE164,
      leadId,
      leadSourceTable: sourceTable,
      contactId: resolved.contactId,
      requireOptIn: false,
    });
    if (elig.optedOut || elig.reason === "producer_dnc") {
      return json(res, 200, {
        success: false,
        error: "SMS not allowed — this number is on the do-not-contact / STOP list.",
      });
    }
  } catch (e) {
    console.warn("staff/send-sms DNC check", e && e.message);
  }

  const sent = await sendSms({ to: toE164, body: message });
  if (!sent.ok) {
    const reason = sent.reason || "send_failed";
    const detail = sent.message || sent.detail || reason;
    return json(res, 200, { success: false, error: `SMS failed: ${detail}` });
  }

  const sentBy = auth.user && auth.user.email ? auth.user.email : null;

  if (resolved.contactId) {
    try {
      await insertEvent(
        cfg.supabaseUrl,
        cfg.serviceKey,
        resolved.contactId,
        "staff_sms_sent",
        {
          to_phone: toE164,
          message_id: sent.sid,
          sent_by: sentBy,
          preview: message.slice(0, 400),
        },
        "sms"
      );
      await logContactCommunication(cfg.supabaseUrl, cfg.serviceKey, {
        contactId: resolved.contactId,
        direction: "outbound",
        channel: "sms",
        summary: message,
        body: message,
        meta: {
          source: "staff_send_sms",
          message_id: sent.sid,
          to_phone: toE164,
          sent_by: sentBy,
          provider: sent.provider || "telnyx",
        },
      });
    } catch (logErr) {
      console.error("staff/send-sms log", logErr && logErr.message ? logErr.message : logErr);
    }
  }

  return json(res, 200, {
    success: true,
    toPhone: toE164,
    messageId: sent.sid || null,
  });
};
