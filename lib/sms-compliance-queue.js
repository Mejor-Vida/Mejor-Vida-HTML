/**
 * SMS compliance queue — enqueue delayed automated Telnyx messages
 * and flush when send_after_timestamp has passed.
 */

const {
  evaluateAutomatedSmsCompliance,
  normalizeStateCode,
} = require("./telemarketing-compliance");
const { sendSms } = require("./sms-send");
const { evaluateSmsSendEligibility } = require("./sms-consent-gate");

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
 * Gate an automated SMS. Returns { allowed, deferred, sendAfter, reason, queued }.
 * When deferred and dryRun is false, inserts sms_compliance_queue (unless skipQueue).
 */
async function gateAutomatedSms(opts) {
  const {
    supabaseUrl,
    serviceKey,
    phone,
    body,
    stateCode,
    settings = {},
    now = new Date(),
    leadId = null,
    leadSourceTable = null,
    contactId = null,
    enrollmentId = null,
    nurtureTaskId = null,
    source = "crm_nurture",
    mediaUrls = null,
    meta = {},
    dryRun = false,
    skipQueue = false,
  } = opts;

  const decision = evaluateAutomatedSmsCompliance({
    stateCode,
    phone,
    now,
    settings,
  });

  if (decision.allowed) {
    return {
      allowed: true,
      deferred: false,
      sendAfter: null,
      reason: null,
      decision,
      queued: false,
    };
  }

  let queued = false;
  let queueId = null;
  if (!dryRun && !skipQueue && supabaseUrl && serviceKey) {
    const rows = await sbFetch(supabaseUrl, serviceKey, "/sms_compliance_queue", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        status: "pending",
        send_after_timestamp: decision.sendAfter,
        phone: String(phone || "").trim(),
        body: String(body || ""),
        state_code: normalizeStateCode(stateCode) || decision.state || null,
        timezone: decision.timezone,
        reason: decision.reason,
        lead_id: leadId,
        lead_source_table: leadSourceTable,
        contact_id: contactId,
        enrollment_id: enrollmentId,
        nurture_task_id: nurtureTaskId,
        source,
        media_urls: mediaUrls,
        meta: Object.assign({}, meta, {
          local: decision.local,
          window: decision.window,
        }),
      }),
    });
    queued = true;
    queueId = Array.isArray(rows) && rows[0] ? rows[0].id : null;
  }

  return {
    allowed: false,
    deferred: true,
    sendAfter: decision.sendAfter,
    reason: decision.reason,
    decision,
    queued,
    queueId,
  };
}

/**
 * Process due compliance queue rows. Re-checks STOP/opt-in and curfew before send.
 */
async function processSmsComplianceQueue(opts = {}) {
  const supabaseUrl = (opts.cfg && opts.cfg.supabaseUrl) || process.env.SUPABASE_URL;
  const serviceKey = (opts.cfg && opts.cfg.serviceKey) || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const now = opts.now || new Date();
  const dryRun = !!opts.dryRun;
  const settings = opts.settings || {};

  if (!supabaseUrl || !serviceKey) {
    return { ok: false, processed: 0, reason: "missing_supabase" };
  }

  const due = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/sms_compliance_queue?status=eq.pending&send_after_timestamp=lte.${encodeURIComponent(
      now.toISOString()
    )}&select=*&order=send_after_timestamp.asc&limit=50`
  );

  const results = [];
  for (const row of due || []) {
    let consent;
    try {
      consent = await evaluateSmsSendEligibility({
        supabaseUrl,
        serviceKey,
        phone: row.phone,
        leadId: row.lead_id,
        leadSourceTable: row.lead_source_table,
        contactId: row.contact_id,
        requireOptIn: true,
      });
    } catch (e) {
      consent = { allowed: false, reason: (e && e.message) || "consent_check_failed" };
    }
    if (!consent.allowed) {
      if (!dryRun) {
        await sbFetch(supabaseUrl, serviceKey, `/sms_compliance_queue?id=eq.${row.id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({
            status: "cancelled",
            reason: consent.reason,
            updated_at: now.toISOString(),
            error: `blocked_pre_send:${consent.reason}`,
            meta: Object.assign({}, row.meta || {}, {
              consent_blocked: true,
              consent_reason: consent.reason,
            }),
          }),
        });
      }
      results.push({ id: row.id, cancelled: true, reason: consent.reason });
      continue;
    }

    const decision = evaluateAutomatedSmsCompliance({
      stateCode: row.state_code,
      phone: row.phone,
      now,
      settings,
    });

    if (!decision.allowed) {
      if (!dryRun) {
        await sbFetch(supabaseUrl, serviceKey, `/sms_compliance_queue?id=eq.${row.id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({
            send_after_timestamp: decision.sendAfter,
            reason: decision.reason,
            updated_at: now.toISOString(),
            meta: Object.assign({}, row.meta || {}, {
              requeued: true,
              local: decision.local,
            }),
          }),
        });
      }
      results.push({ id: row.id, deferred: true, reason: decision.reason, send_after: decision.sendAfter });
      continue;
    }

    if (dryRun) {
      results.push({ id: row.id, would_send: true });
      continue;
    }

    await sbFetch(supabaseUrl, serviceKey, `/sms_compliance_queue?id=eq.${row.id}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({ status: "processing", updated_at: now.toISOString() }),
    });

    try {
      const media = Array.isArray(row.media_urls) ? row.media_urls : null;
      const sms = await sendSms({ to: row.phone, body: row.body, mediaUrls: media });
      if (!sms || sms.ok === false) {
        throw new Error((sms && (sms.reason || sms.error)) || "sms_send_failed");
      }
      await sbFetch(supabaseUrl, serviceKey, `/sms_compliance_queue?id=eq.${row.id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({
          status: "sent",
          sent_at: now.toISOString(),
          provider_message_id: sms.id || sms.sid || null,
          updated_at: now.toISOString(),
          error: null,
        }),
      });
      results.push({ id: row.id, sent: true, provider_id: sms.id || sms.sid });
    } catch (e) {
      const msg = (e && e.message) || String(e);
      await sbFetch(supabaseUrl, serviceKey, `/sms_compliance_queue?id=eq.${row.id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({
          status: "failed",
          error: msg.slice(0, 500),
          updated_at: now.toISOString(),
        }),
      });
      results.push({ id: row.id, ok: false, error: msg });
    }
  }

  return { ok: true, processed: results.length, results, dry_run: dryRun };
}

module.exports = {
  gateAutomatedSms,
  processSmsComplianceQueue,
};
