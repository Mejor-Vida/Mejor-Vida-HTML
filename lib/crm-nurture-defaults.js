/**
 * Default CRM nurture settings — seeded in migration; fallback when DB row missing.
 */

const DEFAULT_CRM_NURTURE_SETTINGS = {
  timezone: "America/Chicago",
  feature_enabled: true,
  content_language: "spanish",
  review: { status: "pending", notes: "", reviewed_at: null, reviewed_by: null },
  /** testing = only allowlisted test leads; live = all CRM leads */
  rollout_mode: "testing",
  test_allowlist_emails: [
    "julie@mejorvidainsurance.com",
    "admin@mejorvidainsurance.com",
  ],
  test_allowlist_names: ["julie braunsroth", "justin braunsroth"],
  test_allowlist_email_local_parts: ["julie", "admin"],
  new_sequence: {
    day0: {
      welcome_email: { template: "welcome", offset_minutes: 0 },
      welcome_sms: { template: "welcome_sms", offset_minutes: 0 },
      calls: [{ time: "09:30", attempt: 1 }],
    },
    day1: {
      calls: [{ time: "17:00", attempt: 2 }],
    },
    day2: {
      calls: [{ time: "09:30", attempt: 3 }],
      email: { time: "10:00", template: "educational_day2" },
      sms: { time: "17:30", template: "day2_sms" },
    },
    day3: {
      calls: [{ time: "17:00", attempt: 4 }],
      stage_transition: { time: "23:59", to: "contacted" },
    },
  },
  contacted_sequence: {
    call_interval_days: 14,
    email_interval_days: 30,
    call_time: "09:30",
    email_time: "10:00",
    email_template: "contacted_educational",
  },
  newsletter: {
    day_of_week: 0,
    hour: 16,
    minute: 0,
  },
  daily_summary: {
    hour: 8,
    minute: 0,
    recipients: [
      "julie@mejorvidainsurance.com",
      "admin@mejorvidainsurance.com",
    ],
  },
  retained_days: 365,
  loyal_days: 730,
};

const STAGES_WITH_AUTO_NURTURE = new Set(["new", "contacted"]);
const STAGES_NEWSLETTER_ONLY = new Set(["engaged", "client", "retained", "loyal", "lost", "enrolled"]);
const STAGES_NO_CALLS = new Set(["engaged", "client", "retained", "loyal", "lost", "enrolled"]);
const MANUAL_ENROLL_BLOCKED_STAGES = new Set(["lost"]);

/** Map CRM pipeline stage → nurture enrollment stage for manual enroll from Pipeline tab. */
function resolveManualEnrollStage(pipelineStage) {
  const s = String(pipelineStage || "new").trim().toLowerCase();
  if (MANUAL_ENROLL_BLOCKED_STAGES.has(s)) return null;
  if (s === "new") return "new";
  return "contacted";
}

function canManualEnroll(pipelineStage) {
  return resolveManualEnrollStage(pipelineStage) != null;
}

const DEFAULT_DAILY_SUMMARY_RECIPIENTS = [
  "julie@mejorvidainsurance.com",
  "admin@mejorvidainsurance.com",
];

function resolveDailySummaryRecipients(settings) {
  const ds = (settings && settings.daily_summary) || {};
  if (Array.isArray(ds.recipients) && ds.recipients.length) {
    return ds.recipients.map((e) => String(e).trim()).filter(Boolean);
  }
  if (ds.recipient) {
    return String(ds.recipient)
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
  }
  return DEFAULT_DAILY_SUMMARY_RECIPIENTS.slice();
}

module.exports = {
  DEFAULT_CRM_NURTURE_SETTINGS,
  STAGES_WITH_AUTO_NURTURE,
  STAGES_NEWSLETTER_ONLY,
  STAGES_NO_CALLS,
  DEFAULT_DAILY_SUMMARY_RECIPIENTS,
  resolveDailySummaryRecipients,
  resolveManualEnrollStage,
  canManualEnroll,
  MANUAL_ENROLL_BLOCKED_STAGES,
};
