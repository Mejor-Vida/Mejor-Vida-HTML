const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const { resolveContactForStaffLead } = require("./_lead-contact");
const { oneLineSummary, htmlToPlain } = require("../../lib/contact-communications");
const { getSmsMessage, getEmailContent } = require("../../lib/nurture-templates");

const EVENT_LABELS = {
  first_message: "First message",
  language_picked: "Language selected",
  lead_updated: "Lead updated",
  age_answered: "Age answered",
  smoker_answered: "Smoker answered",
  gender_answered: "Gender answered",
  questionnaire_completed: "Questionnaire completed",
  quote_generated: "Quote generated",
  call_scheduled: "Call scheduled",
  call_completed: "Call completed",
  policy_issued: "Policy issued",
  staff_email_sent: "Email sent to client",
};

function fmtChannel(ch) {
  const c = String(ch || "").toLowerCase();
  if (c === "whatsapp") return "WhatsApp";
  if (c === "sms") return "SMS";
  if (c === "email") return "Email";
  if (c === "phone") return "Phone";
  return ch || "System";
}

function pushRow(rows, item) {
  if (!item || !item.at) return;
  rows.push(item);
}

function nurtureKey(phase, step, at) {
  return `nurture:${phase}:${step}:${new Date(at).toISOString()}`;
}

function legacyNurtureBody(channel, phase, step, contact) {
  if (!contact) return null;
  const ch = String(channel || "").toLowerCase();
  if (ch === "sms" && phase === 2) {
    return getSmsMessage(step, contact) || null;
  }
  if (ch === "email" && phase === 3) {
    const c = getEmailContent(step, contact);
    return c && c.html ? htmlToPlain(c.html) : null;
  }
  if (ch === "whatsapp" && phase === 1) {
    return (
      `Automated WhatsApp message (nurture step ${step}). ` +
      "Full content is managed in the ManyChat flow."
    );
  }
  return null;
}

function legacyNurtureSummary(channel, phase, step, contact) {
  const ch = String(channel || "").toLowerCase();
  if (ch === "email" && phase === 3 && contact) {
    const c = getEmailContent(step, contact);
    if (c && c.subject) return oneLineSummary(c.subject, "Email nurture");
  }
  const body = legacyNurtureBody(channel, phase, step, contact);
  if (body) return oneLineSummary(body, `${fmtChannel(channel)} nurture`);
  return `${fmtChannel(channel)} nurture — step ${step || "?"}`;
}

function formatEventTitle(ev) {
  const type = ev && ev.event_type ? ev.event_type : "";
  const data = ev && ev.event_data && typeof ev.event_data === "object" ? ev.event_data : {};
  if (type === "staff_email_sent" && data.email_type === "medical_information_request") {
    return "Medical information request sent";
  }
  if (type === "staff_email_sent" && data.email_type === "agent_credentials") {
    return "Agent credentials email sent";
  }
  return EVENT_LABELS[type] || type || "Event";
}

function formatEventSummary(ev) {
  const data = ev && ev.event_data && typeof ev.event_data === "object" ? ev.event_data : {};
  if (ev.event_type === "staff_email_sent") {
    if (data.subject) return oneLineSummary(data.subject, "Email sent");
    if (data.preview) return oneLineSummary(data.preview, "Email sent");
  }
  return oneLineSummary(formatEventTitle(ev), "Event");
}

function eventBody(ev) {
  const data = ev && ev.event_data && typeof ev.event_data === "object" ? ev.event_data : {};
  if (ev.event_type === "staff_email_sent" && data.preview) {
    return String(data.preview);
  }
  return null;
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method not allowed" });
  }

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  const leadId = String((req.query && req.query.leadId) || "").trim();
  const resolved = await resolveContactForStaffLead(cfg, leadId);
  if (resolved.error) return json(res, resolved.status || 400, { error: resolved.error });

  const contactId = resolved.contactId;
  if (!contactId) {
    return json(res, 200, {
      items: [],
      contact_id: null,
      client_name: resolved.displayName,
      hint: "no_contact",
    });
  }

  const enc = encodeURIComponent(contactId);
  const rows = [];
  const nurtureLogged = new Set();
  const staffEmailLogged = new Set();

  try {
    let commRows = [];
    let events = [];
    let deliveryLogs = [];
    let transcripts = [];
    let leadState = [];

    try {
      commRows = await restSelect(
        cfg,
        "contact_communications",
        `select=id,direction,channel,summary,body,subject,meta,created_at&contact_id=eq.${enc}&order=created_at.desc&limit=200`
      );
    } catch (e) {
      console.error("staff/communications contact_communications", e && e.message ? e.message : e);
    }

    (commRows || []).forEach((row) => {
      const meta = row.meta && typeof row.meta === "object" ? row.meta : {};
      if (meta.source === "nurture" && meta.phase != null && meta.step != null) {
        nurtureLogged.add(`${meta.phase}:${meta.step}`);
      }
      if (meta.source === "staff_send_email" && meta.message_id) {
        staffEmailLogged.add(String(meta.message_id));
      }
      const body = row.body ? String(row.body) : null;
      pushRow(rows, {
        id: row.id,
        at: new Date(row.created_at).toISOString(),
        type: "message",
        direction: row.direction,
        channel: row.channel,
        summary: row.summary || oneLineSummary(body || row.subject, "Message"),
        title: row.summary || oneLineSummary(body || row.subject, "Message"),
        detail: null,
        subject: row.subject || null,
        body,
        has_body: !!body,
      });
    });

    try {
      events = await restSelect(
        cfg,
        "events",
        `select=event_type,channel,event_data,created_at&contact_id=eq.${enc}&order=created_at.desc&limit=200`
      );
    } catch (e) {
      console.error("staff/communications events", e && e.message ? e.message : e);
    }

    try {
      deliveryLogs = await restSelect(
        cfg,
        "nurture_delivery_log",
        `select=channel,phase,step,status,sent_at&contact_id=eq.${enc}&order=sent_at.desc&limit=200`
      );
    } catch (e) {
      console.error("staff/communications nurture_delivery_log", e && e.message ? e.message : e);
    }

    try {
      transcripts = await restSelect(
        cfg,
        "call_transcripts",
        `select=call_date,ai_summary,call_outcome,created_at&contact_id=eq.${enc}&order=created_at.desc&limit=50`
      );
    } catch (e) {
      console.error("staff/communications call_transcripts", e && e.message ? e.message : e);
    }

    try {
      leadState = await restSelect(
        cfg,
        "lead_state",
        `select=quote_generated_at,call_scheduled_at,call_completed_at,policy_issued_at&contact_id=eq.${enc}&limit=1`
      );
    } catch (e) {
      console.error("staff/communications lead_state", e && e.message ? e.message : e);
    }

    let questions = [];
    const phone = resolved.contact && resolved.contact.phone ? String(resolved.contact.phone).trim() : "";
    if (phone) {
      try {
        questions = await restSelect(
          cfg,
          "unanswered_questions",
          `select=question,flow_stage,created_at&phone=eq.${encodeURIComponent(phone)}&order=created_at.desc&limit=50`
        );
      } catch (e) {
        questions = [];
      }
    }

    (events || []).forEach((ev) => {
      const data = ev && ev.event_data && typeof ev.event_data === "object" ? ev.event_data : {};
      if (ev.event_type === "staff_email_sent") {
        if (data.message_id && staffEmailLogged.has(String(data.message_id))) return;
        const preview = data.preview ? String(data.preview) : null;
        const summary =
          data.subject ? oneLineSummary(data.subject, "Email sent") : oneLineSummary(preview, "Email sent");
        pushRow(rows, {
          id: `staff-email-${ev.created_at}`,
          at: new Date(ev.created_at).toISOString(),
          type: "message",
          direction: "outbound",
          channel: "email",
          summary,
          title: formatEventTitle(ev),
          detail: null,
          subject: data.subject || null,
          body: preview,
          has_body: !!preview,
          legacy: true,
        });
        return;
      }
      const summary = formatEventSummary(ev);
      pushRow(rows, {
        id: `event-${ev.created_at}`,
        at: new Date(ev.created_at).toISOString(),
        type: "event",
        direction: null,
        channel: ev.channel || null,
        summary,
        title: formatEventTitle(ev),
        detail: null,
        body: eventBody(ev),
        has_body: !!eventBody(ev),
      });
    });

    (deliveryLogs || []).forEach((log) => {
      if (String(log.status || "").toLowerCase() !== "sent") return;
      const at = log.sent_at;
      const key = nurtureKey(log.phase, log.step, at);
      if (nurtureLogged.has(`${log.phase}:${log.step}`)) return;

      const body = legacyNurtureBody(log.channel, log.phase, log.step, resolved.contact);
      const summary = legacyNurtureSummary(log.channel, log.phase, log.step, resolved.contact);
      pushRow(rows, {
        id: key,
        at: new Date(at).toISOString(),
        type: "message",
        direction: "outbound",
        channel: log.channel,
        summary,
        title: summary,
        detail: null,
        subject:
          String(log.channel || "").toLowerCase() === "email" && log.phase === 3 && resolved.contact
            ? (getEmailContent(log.step, resolved.contact) || {}).subject || null
            : null,
        body,
        has_body: !!body,
        legacy: true,
      });
    });

    (transcripts || []).forEach((tr) => {
      const at = tr.call_date || tr.created_at;
      const summary = String(tr.ai_summary || tr.call_outcome || "Phone call").trim();
      pushRow(rows, {
        id: `call-${at}`,
        at: new Date(at).toISOString(),
        type: "call",
        direction: null,
        channel: "phone",
        summary: oneLineSummary(summary, "Phone call"),
        title: "Phone call",
        detail: null,
        body: summary || null,
        has_body: !!summary,
      });
    });

    const ls = Array.isArray(leadState) && leadState[0] ? leadState[0] : null;
    if (ls) {
      [
        ["quote_generated_at", "Quote generated"],
        ["call_scheduled_at", "Call scheduled"],
        ["call_completed_at", "Call completed"],
        ["policy_issued_at", "Policy issued"],
      ].forEach(([field, label]) => {
        if (!ls[field]) return;
        pushRow(rows, {
          id: `milestone-${field}-${ls[field]}`,
          at: new Date(ls[field]).toISOString(),
          type: "milestone",
          direction: null,
          channel: null,
          summary: label,
          title: label,
          detail: null,
          body: null,
          has_body: false,
        });
      });
    }

    (questions || []).forEach((q) => {
      const qText = String(q.question || "").trim();
      pushRow(rows, {
        id: `question-${q.created_at}`,
        at: new Date(q.created_at).toISOString(),
        type: "question",
        direction: "inbound",
        channel: null,
        summary: oneLineSummary(qText, "Customer question"),
        title: "Customer question",
        detail: null,
        body: qText || null,
        has_body: !!qText,
      });
    });
  } catch (e) {
    console.error("staff/communications GET", e);
    return json(res, 500, { error: "Failed to load communication history" });
  }

  rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return json(res, 200, {
    items: rows,
    contact_id: contactId,
    client_name: resolved.displayName,
  });
};
