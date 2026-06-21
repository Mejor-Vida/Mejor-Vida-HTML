const { restSelect, restPatch, restInsert } = require("./_inbox-lib");
const {
  allStepsOrdered,
  stepIndex,
  scheduledAtForStep,
  computeNextSend,
} = require("../../lib/nurture-schedule");
const { scheduleMapFromRows } = require("../../lib/nurture-email-schedule");

function channelForPhase(phase) {
  if (phase === 1) return "whatsapp";
  if (phase === 2) return "sms";
  return "email";
}

function stepDisplayName(phase, step) {
  if (phase === 0 && step === 1) return "WA-Quote email";
  if (phase === 1) return step === 1 ? "WA — Value + book call" : "WA — Check-in";
  if (phase === 2)
    return ["SMS — Day 3", "SMS — Day 5 + VCF", "SMS — Day 7"][step - 1] || `SMS step ${step}`;
  return ["Email — Week 1", "Email — Week 2", "Email — Week 3", "Email — Week 4"][step - 1] || `Email step ${step}`;
}

function pickLatestLog(logs) {
  if (!logs || !logs.length) return null;
  return [...logs].sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))[0];
}

/**
 * Timeline rows for the pipeline UI — honors nurture_delivery_log when present.
 */
function buildPipelineSteps(nurtureRow, deliveryLogs, emailScheduleMap) {
  if (!nurtureRow || !nurtureRow.enrolled_at) return [];

  const enrolled = nurtureRow.enrolled_at;
  const customEmailSchedule = emailScheduleMap || {};
  const ordered = allStepsOrdered();
  const curIdx = stepIndex(nurtureRow.phase, nurtureRow.step);
  const st = String(nurtureRow.status || 'active');

  const logsByKey = {};
  for (const L of deliveryLogs || []) {
    const k = `${L.phase}:${L.step}`;
    if (!logsByKey[k]) logsByKey[k] = [];
    logsByKey[k].push(L);
  }

  const postQuoteLogs = logsByKey['0:1'] || [];
  const lastPostQuote = pickLatestLog(postQuoteLogs);
  const postQuoteRow = {
    stageNumber: 1,
    phase: 0,
    step: 1,
    channel: 'email',
    channelUi: 'Email',
    name: stepDisplayName(0, 1),
    scheduled_at: enrolled,
    actual_sent_at: lastPostQuote ? lastPostQuote.sent_at : null,
    status: lastPostQuote
      ? lastPostQuote.status === 'sent'
        ? 'sent'
        : lastPostQuote.status === 'failed'
          ? 'failed'
          : 'skipped'
      : 'pending',
    is_next: false,
    detail_reason: lastPostQuote ? lastPostQuote.reason || lastPostQuote.error || null : null,
  };

  const mainSteps = ordered.map((stDef, idx) => {
    const k = `${stDef.phase}:${stDef.step}`;
    const lastLog = pickLatestLog(logsByKey[k]);
    let scheduledAt = scheduledAtForStep(enrolled, stDef.phase, stDef.step);
    if (stDef.phase === 3 && customEmailSchedule[stDef.step]) {
      scheduledAt = customEmailSchedule[stDef.step];
    }

    let uiStatus = "pending";
    let actualSentAt = null;
    let detailReason = null;

    if (lastLog) {
      actualSentAt = lastLog.sent_at;
      detailReason = lastLog.reason || lastLog.error || null;
      if (lastLog.status === "sent") uiStatus = "sent";
      else if (lastLog.status === "failed") uiStatus = "failed";
      else uiStatus = "skipped";
    } else if (idx < curIdx) {
      uiStatus = "sent";
      actualSentAt = nurtureRow.last_sent_at || null;
    } else if (idx > curIdx) {
      if (st === "converted" || st === "opted_out" || st === "completed") uiStatus = "skipped";
      else uiStatus = "upcoming";
    } else {
      if (st === "completed") uiStatus = "sent";
      else if (st === "converted" || st === "opted_out") uiStatus = "skipped";
      else uiStatus = "pending";
    }

    const isNext = idx === curIdx && (st === 'active' || st === 'paused');

    return {
      stageNumber: idx + 2,
      phase: stDef.phase,
      step: stDef.step,
      channel: channelForPhase(stDef.phase),
      channelUi: stDef.phase === 1 ? "WhatsApp" : stDef.phase === 2 ? "SMS" : "Email",
      name: stepDisplayName(stDef.phase, stDef.step),
      scheduled_at: scheduledAt,
      actual_sent_at: actualSentAt,
      status: uiStatus,
      is_next: isNext,
      detail_reason: detailReason,
    };
  });

  return [postQuoteRow, ...mainSteps];
}

/** All nurture stages for a contact not yet enrolled (CRM preview). */
function buildTemplatePipelineSteps() {
  const ordered = allStepsOrdered();
  const postQuoteRow = {
    stageNumber: 1,
    phase: 0,
    step: 1,
    channel: "email",
    channelUi: "Email",
    name: stepDisplayName(0, 1),
    scheduled_at: null,
    actual_sent_at: null,
    status: "not_enrolled",
    is_next: true,
    detail_reason: null,
  };

  const mainSteps = ordered.map((stDef, idx) => ({
    stageNumber: idx + 2,
    phase: stDef.phase,
    step: stDef.step,
    channel: channelForPhase(stDef.phase),
    channelUi: stDef.phase === 1 ? "WhatsApp" : stDef.phase === 2 ? "SMS" : "Email",
    name: stepDisplayName(stDef.phase, stDef.step),
    scheduled_at: null,
    actual_sent_at: null,
    status: "not_enrolled",
    is_next: false,
    detail_reason: null,
  }));

  return [postQuoteRow, ...mainSteps];
}

async function fetchNurtureRowWithContact(cfg, contactId) {
  const rows = await restSelect(
    cfg,
    "nurture_sequence",
    `select=*,contacts(id,first_name,last_name,full_name,phone,email,language,idioma,manychat_subscriber_id,vcf_sent_at)` +
      `&contact_id=eq.${encodeURIComponent(contactId)}&limit=1`
  );
  return rows && rows[0] ? rows[0] : null;
}

async function fetchNurtureRow(cfg, contactId) {
  const rows = await restSelect(
    cfg,
    "nurture_sequence",
    `contact_id=eq.${encodeURIComponent(contactId)}&limit=1`
  );
  return rows && rows[0] ? rows[0] : null;
}

async function insertSkippedDelivery(cfg, contactId, phase, step, reason) {
  await restInsert(cfg, "nurture_delivery_log", {
    contact_id: contactId,
    channel: channelForPhase(phase),
    phase,
    step,
    provider_id: null,
    status: "skipped",
    error: null,
    sent_at: new Date().toISOString(),
    reason: reason ? String(reason).slice(0, 500) : null,
  });
}

async function loadEmailScheduleMap(cfg, contactId) {
  try {
    const rows = await restSelect(
      cfg,
      "nurture_email_schedule",
      `contact_id=eq.${encodeURIComponent(contactId)}&order=step.asc`
    );
    return scheduleMapFromRows(rows);
  } catch (e) {
    return {};
  }
}

module.exports = {
  channelForPhase,
  computeNextSend,
  buildPipelineSteps,
  buildTemplatePipelineSteps,
  fetchNurtureRow,
  fetchNurtureRowWithContact,
  insertSkippedDelivery,
  loadEmailScheduleMap,
  restPatch,
  restSelect,
  restInsert,
};
