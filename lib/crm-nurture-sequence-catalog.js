/**
 * Ordered catalog of CRM nurture communications for staff review.
 * Staff-facing labels are English; client message previews stay Spanish.
 */

const { DEFAULT_CRM_NURTURE_SETTINGS, resolveDailySummaryRecipients } = require("./crm-nurture-defaults");
const { getCrmNurtureEmail, getCrmNurtureSms, sampleSpanishContact } = require("./crm-nurture-templates");
const { getWeeklyFbPostEmailPreview, loadExampleWeeklyFbPost } = require("./crm-weekly-fb-email");
const { rolloutSummary } = require("./crm-nurture-rollout");

function formatTime12(timeStr) {
  const [hh, mm] = String(timeStr || "09:00").split(":").map((x) => parseInt(x, 10) || 0);
  const h12 = hh % 12 || 12;
  const ampm = hh >= 12 ? "PM" : "AM";
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

function whenLabel(day, spec) {
  if (!spec) return "";
  if (spec.offset_minutes != null && Number(spec.offset_minutes) === 0) {
    return day === 0 ? "Immediate (when lead enters CRM)" : `Day ${day} — immediate`;
  }
  if (spec.offset_minutes != null) {
    return `Day ${day} — +${spec.offset_minutes} min from enrollment`;
  }
  if (spec.time) {
    return `Day ${day} — ${formatTime12(spec.time)} Chicago time`;
  }
  return `Day ${day}`;
}

function channelLabel(type) {
  const map = {
    email: "Email",
    sms: "SMS (only if SMS Opt-In = Yes)",
    call: "Call task (Julie)",
    notification: "Internal notification (Julie)",
    stage_transition: "Stage automation",
    newsletter: "Weekly Facebook post (email)",
    weekly_fb_post: "Weekly Facebook post (email)",
    daily_summary: "Daily summary email (staff)",
  };
  return map[type] || type;
}

function pushStep(steps, base) {
  steps.push(Object.assign({ order: steps.length + 1 }, base));
}

function previewEmail(templateKey, settings) {
  const contact = sampleSpanishContact();
  const tpl = getCrmNurtureEmail(templateKey, contact, settings);
  if (!tpl) return { subject: "", html: "" };
  return {
    subject: tpl.subject || "",
    html: tpl.html || "",
    language: "spanish",
  };
}

function previewSms(templateKey, settings) {
  const contact = sampleSpanishContact();
  return {
    body: getCrmNurtureSms(templateKey, contact, settings) || "",
    language: "spanish",
  };
}

function buildNewSequenceSteps(settings, steps) {
  const seq = settings.new_sequence || {};
  const phaseLabel = "Stage: New — Intensive sequence (days 0–3)";
  const d0 = seq.day0 || {};

  if (d0.welcome_email) {
    const tpl = d0.welcome_email.template || "welcome";
    pushStep(steps, {
      phase: "new",
      phase_label: phaseLabel,
      day: 0,
      when: whenLabel(0, d0.welcome_email),
      channel: "email",
      channel_label: channelLabel("email"),
      template: tpl,
      audience: "Lead",
      preview: previewEmail(tpl, settings),
    });
  }

  if (d0.welcome_sms) {
    const tpl = d0.welcome_sms.template || "welcome_sms";
    pushStep(steps, {
      phase: "new",
      phase_label: phaseLabel,
      day: 0,
      when: whenLabel(0, d0.welcome_sms),
      channel: "sms",
      channel_label: channelLabel("sms"),
      template: tpl,
      audience: "Lead",
      preview: previewSms(tpl, settings),
    });
  }

  (d0.calls || []).forEach((c) => {
    pushStep(steps, {
      phase: "new",
      phase_label: phaseLabel,
      day: 0,
      when: whenLabel(0, c),
      channel: "call",
      channel_label: channelLabel("call"),
      template: null,
      audience: "Julie",
      call_attempt: c.attempt,
      preview: {
        description: `Julie calls the lead — attempt #${c.attempt || "?"}.`,
      },
    });
  });

  const d1 = seq.day1 || {};
  (d1.calls || []).forEach((c) => {
    pushStep(steps, {
      phase: "new",
      phase_label: phaseLabel,
      day: 1,
      when: whenLabel(1, c),
      channel: "call",
      channel_label: channelLabel("call"),
      audience: "Julie",
      call_attempt: c.attempt,
      preview: { description: `Julie calls the lead — attempt #${c.attempt || "?"}.` },
    });
  });

  const d2 = seq.day2 || {};
  (d2.calls || []).forEach((c) => {
    pushStep(steps, {
      phase: "new",
      phase_label: phaseLabel,
      day: 2,
      when: whenLabel(2, c),
      channel: "call",
      channel_label: channelLabel("call"),
      audience: "Julie",
      call_attempt: c.attempt,
      preview: { description: `Julie calls the lead — attempt #${c.attempt || "?"}.` },
    });
  });
  if (d2.email) {
    const tpl = d2.email.template || "educational_day2";
    pushStep(steps, {
      phase: "new",
      phase_label: phaseLabel,
      day: 2,
      when: whenLabel(2, d2.email),
      channel: "email",
      channel_label: channelLabel("email"),
      template: tpl,
      audience: "Lead",
      preview: previewEmail(tpl, settings),
    });
  }
  (d2.calls_pm || []).forEach((c) => {
    pushStep(steps, {
      phase: "new",
      phase_label: phaseLabel,
      day: 2,
      when: whenLabel(2, c),
      channel: "call",
      channel_label: channelLabel("call"),
      audience: "Julie",
      call_attempt: c.attempt,
      preview: { description: `Julie calls the lead — attempt #${c.attempt || "?"}.` },
    });
  });
  if (d2.sms) {
    const tpl = d2.sms.template || "day2_sms";
    pushStep(steps, {
      phase: "new",
      phase_label: phaseLabel,
      day: 2,
      when: whenLabel(2, d2.sms),
      channel: "sms",
      channel_label: channelLabel("sms"),
      template: tpl,
      audience: "Lead",
      preview: previewSms(tpl, settings),
    });
  }

  const d3 = seq.day3 || {};
  (d3.calls || []).forEach((c) => {
    pushStep(steps, {
      phase: "new",
      phase_label: phaseLabel,
      day: 3,
      when: whenLabel(3, c),
      channel: "call",
      channel_label: channelLabel("call"),
      audience: "Julie",
      call_attempt: c.attempt,
      preview: { description: `Julie calls the lead — attempt #${c.attempt || "?"}.` },
    });
  });
  if (d3.stage_transition) {
    pushStep(steps, {
      phase: "new",
      phase_label: phaseLabel,
      day: 3,
      when: whenLabel(3, d3.stage_transition),
      channel: "stage_transition",
      channel_label: channelLabel("stage_transition"),
      audience: "System",
      preview: {
        description:
          "End of day 3: if the lead is still in New stage, automatically move to Contacted.",
      },
    });
  }
}

function buildContactedSteps(settings, steps) {
  const cs = settings.contacted_sequence || {};
  const callDays = Number(cs.call_interval_days) || 14;
  const emailDays = Number(cs.email_interval_days) || 30;
  const tpl = cs.email_template || "contacted_educational";
  const phaseLabel = "Stage: Contacted — Long-term nurture";

  pushStep(steps, {
    phase: "contacted",
    phase_label: phaseLabel,
    day: callDays,
    when: `Every ${callDays} days — ${formatTime12(cs.call_time || "09:30")} Chicago time`,
    channel: "call",
    channel_label: channelLabel("call"),
    audience: "Julie",
    preview: { description: "Julie calls the lead on a recurring schedule." },
    recurring: true,
  });

  pushStep(steps, {
    phase: "contacted",
    phase_label: phaseLabel,
    day: emailDays,
    when: `Every ${emailDays} days — ${formatTime12(cs.email_time || "10:00")} Chicago time`,
    channel: "email",
    channel_label: channelLabel("email"),
    template: tpl,
    audience: "Lead",
    preview: previewEmail(tpl, settings),
    recurring: true,
  });
}

function buildDailySummaryStep(settings, steps) {
  const ds = settings.daily_summary || {};
  const hour = ds.hour != null ? ds.hour : 8;
  const minute = ds.minute != null ? ds.minute : 0;
  const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const recipients = resolveDailySummaryRecipients(settings);
  const recipientLabel = recipients.join(", ");
  const sampleDate = "2026-07-01";

  pushStep(steps, {
    phase: "daily_summary",
    phase_label: "Daily staff email — call list",
    day: null,
    when: `Every day — ${formatTime12(timeStr)} Chicago time`,
    channel: "daily_summary",
    channel_label: channelLabel("daily_summary"),
    audience: "Julie + admin (internal)",
    internal: true,
    recurring: true,
    preview: {
      language: "english",
      subject: `[CRM] Daily Summary — ${sampleDate}`,
      html: [
        `<h2>Daily Summary — ${sampleDate}</h2>`,
        "<h3>New leads — call tasks today (1)</h3>",
        "<ul>",
        "<li>Attempt #1 — due 9:30 AM</li>",
        "</ul>",
        "<h3>Contacted — call tasks today (1)</h3>",
        "<ul>",
        "<li>Attempt #1 — due 9:30 AM</li>",
        "</ul>",
        "<h3>Emails / SMS queued today (3)</h3>",
      ].join("\n"),
    },
    note:
      `Internal morning digest sent to ${recipientLabel} — not sent to leads. Lists today's nurture call tasks (New and Contacted stages) plus a count of client emails/SMS scheduled for the day. Separate from the existing new-lead Gmail notification to julie@ and admin@ with the IntegrityCONNECT CSV attachment at intake.`,
  });
}

function buildNewsletterStep(settings, steps) {
  const nl = settings.newsletter || {};
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dow = days[Number(nl.day_of_week)] || "Sunday";
  const hour = nl.hour != null ? nl.hour : 16;
  const samplePost = loadExampleWeeklyFbPost();
  const preview = getWeeklyFbPostEmailPreview(samplePost, settings);

  pushStep(steps, {
    phase: "weekly_fb_post",
    phase_label: "Weekly Facebook post — email (all stages except unsubscribed)",
    day: null,
    when: `${dow} — ${hour}:00 Chicago time`,
    channel: "weekly_fb_post",
    channel_label: channelLabel("weekly_fb_post"),
    audience: "Lead (with email)",
    preview,
    note:
      `Example shown: Facebook post from ${samplePost.post_date_iso || "this week"}. ` +
      "Each week, import the FB caption + image via POST /api/staff/newsletter-import (main_caption, image_url, blog_url) before the Sunday send.",
    recurring: true,
  });
}

function buildNurtureSequenceCatalog(settings, env) {
  settings = Object.assign({}, DEFAULT_CRM_NURTURE_SETTINGS, settings || {});
  const steps = [];
  buildNewSequenceSteps(settings, steps);
  buildContactedSteps(settings, steps);
  buildNewsletterStep(settings, steps);
  buildDailySummaryStep(settings, steps);

  const review = settings.review || {};
  return {
    ui_language: "english",
    content_language: settings.content_language || "spanish",
    timezone: settings.timezone || "America/Chicago",
    rollout: rolloutSummary(settings, env || process.env),
    review: {
      status: review.status || "pending",
      notes: review.notes || "",
      reviewed_at: review.reviewed_at || null,
      reviewed_by: review.reviewed_by || null,
    },
    steps,
    total_steps: steps.length,
  };
}

module.exports = {
  buildNurtureSequenceCatalog,
  whenLabel,
  channelLabel,
};
