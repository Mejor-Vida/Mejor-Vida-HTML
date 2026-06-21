const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect, restPatch, restInsert, readJsonBody } = require("./_inbox-lib");
const { resolveContactForPipeline, CONTACT_SELECT } = require("./_contact-resolve");
const { fetchNurtureRow, restPatch: nurturePatch } = require("./_nurture-lib");
const { getEmailContent } = require("../../lib/nurture-templates");
const { logContactCommunication, htmlToPlain } = require("../../lib/contact-communications");
const {
  weekName,
  defaultScheduleFromEnrolled,
  defaultScheduleFromNow,
  scheduleMapFromRows,
  mergeSchedule,
  isStepSent,
  firstPendingEmailStep,
} = require("../../lib/nurture-email-schedule");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || "")
  );
}

async function loadContactById(cfg, contactId) {
  const rows = await restSelect(
    cfg,
    "contacts",
    `select=${CONTACT_SELECT}&id=eq.${encodeURIComponent(contactId)}&limit=1`
  );
  return rows && rows[0] ? rows[0] : null;
}

async function loadEmailScheduleRows(cfg, contactId) {
  try {
    return await restSelect(
      cfg,
      "nurture_email_schedule",
      `contact_id=eq.${encodeURIComponent(contactId)}&order=step.asc`
    );
  } catch (e) {
    return [];
  }
}

async function loadDeliveryLogs(cfg, contactId) {
  return restSelect(
    cfg,
    "nurture_delivery_log",
    `contact_id=eq.${encodeURIComponent(contactId)}&phase=eq.3&order=sent_at.asc`
  );
}

async function loadOverrides(cfg, contactId) {
  const overrides = await restSelect(
    cfg,
    "nurture_message_overrides",
    `contact_id=eq.${encodeURIComponent(contactId)}&phase=eq.3`
  );
  const ovMap = {};
  for (const o of overrides || []) {
    ovMap[o.step] = o;
  }
  return ovMap;
}

function emailPreview(contact, step, ovMap) {
  const ov = ovMap && ovMap[step];
  if (ov && ov.subject && ov.body) {
    const body = String(ov.body);
    return {
      subject: String(ov.subject),
      body,
      body_plain: htmlToPlain(body),
      is_override: true,
    };
  }
  const c = getEmailContent(step, contact);
  return {
    subject: c.subject,
    body: c.html,
    body_plain: htmlToPlain(c.html),
    is_override: false,
  };
}

function stepStatus(deliveryLogs, step, scheduledAtIso) {
  if (isStepSent(deliveryLogs, step)) return "sent";
  if (!scheduledAtIso) return "pending";
  const at = new Date(scheduledAtIso);
  if (Number.isNaN(at.getTime())) return "pending";
  return at.getTime() > Date.now() ? "upcoming" : "pending";
}

function buildWeeksPayload(contact, deliveryLogs, scheduleByStep, ovMap) {
  const weeks = [];
  for (let step = 1; step <= 4; step++) {
    const preview = emailPreview(contact, step, ovMap);
    const scheduledAt = scheduleByStep[step] || null;
    weeks.push({
      step,
      name: weekName(step),
      scheduled_at: scheduledAt,
      status: stepStatus(deliveryLogs, step, scheduledAt),
      preview,
    });
  }
  return weeks;
}

async function resolveContactId(cfg, q, body) {
  let contactId = String((q && q.contactId) || (body && body.contactId) || "").trim();
  if (isUuid(contactId)) return contactId;

  const contact = await resolveContactForPipeline(cfg, {
    contactId: q && q.contactId,
    phone: (q && q.phone) || (body && body.phone),
    email: (q && q.email) || (body && body.email),
    manychatSubscriberId:
      (q && (q.subscriberId || q.manychatSubscriberId)) ||
      (body && (body.subscriberId || body.manychatSubscriberId)),
  });
  return contact && contact.id ? contact.id : null;
}

async function upsertScheduleRow(cfg, contactId, step, scheduledAt, updatedBy) {
  const now = new Date().toISOString();
  const existing = await restSelect(
    cfg,
    "nurture_email_schedule",
    `contact_id=eq.${encodeURIComponent(contactId)}&step=eq.${step}&limit=1`
  );

  const payload = {
    scheduled_at: scheduledAt,
    updated_at: now,
    updated_by: updatedBy || null,
  };

  if (existing && existing[0]) {
    await restPatch(
      cfg,
      "nurture_email_schedule",
      `contact_id=eq.${encodeURIComponent(contactId)}&step=eq.${step}`,
      payload
    );
  } else {
    await restInsert(cfg, "nurture_email_schedule", {
      contact_id: contactId,
      step,
      ...payload,
    });
  }
}

async function ensureNurtureSequence(cfg, contactId, contact, scheduleByStep, deliveryLogs) {
  const pending = firstPendingEmailStep(deliveryLogs, scheduleByStep);
  const now = new Date().toISOString();
  let ns = await fetchNurtureRow(cfg, contactId);

  if (!ns) {
    const inserted = await restInsert(cfg, "nurture_sequence", {
      contact_id: contactId,
      manychat_subscriber_id: (contact && contact.manychat_subscriber_id) || null,
      status: "active",
      phase: 3,
      step: pending ? pending.step : 1,
      enrolled_at: now,
      next_send_at: pending ? pending.scheduledAt.toISOString() : scheduleByStep[1] || now,
    });
    return Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
  }

  const terminal = ["converted", "opted_out", "completed"].includes(String(ns.status || "").toLowerCase());
  const update = {
    updated_at: now,
  };

  if (!terminal) {
    update.status = "active";
    if (pending) {
      update.phase = 3;
      update.step = pending.step;
      update.next_send_at = pending.scheduledAt.toISOString();
    } else {
      update.status = "completed";
      update.next_send_at = null;
    }
  }

  await nurturePatch(cfg, "nurture_sequence", `id=eq.${encodeURIComponent(ns.id)}`, update);
  return { ...ns, ...update };
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server misconfigured" });

  const q = req.query || {};

  try {
    if (req.method === "GET") {
      const contactId = await resolveContactId(cfg, q, null);
      if (!contactId) {
        return json(res, 404, {
          error: "Contact not found — add phone or email on Overview, or link a contacts record.",
          contact_found: false,
        });
      }

      const contact = await loadContactById(cfg, contactId);
      const deliveryLogs = await loadDeliveryLogs(cfg, contactId);
      const savedRows = await loadEmailScheduleRows(cfg, contactId);
      const savedMap = scheduleMapFromRows(savedRows);
      const ns = await fetchNurtureRow(cfg, contactId);
      const defaults = ns && ns.enrolled_at
        ? defaultScheduleFromEnrolled(ns.enrolled_at)
        : defaultScheduleFromNow();
      const scheduleByStep = mergeSchedule(defaults, savedMap);
      const ovMap = await loadOverrides(cfg, contactId);

      return json(res, 200, {
        ok: true,
        contact_id: contactId,
        contact_found: true,
        enrolled: !!ns,
        nurture_status: ns ? ns.status : null,
        weeks: buildWeeksPayload(contact, deliveryLogs, scheduleByStep, ovMap),
      });
    }

    if (req.method === "POST") {
      let body;
      try {
        body = readJsonBody(req);
      } catch (e) {
        return json(res, 400, { error: "Invalid JSON" });
      }

      const contactId = await resolveContactId(cfg, q, body);
      if (!contactId) {
        return json(res, 404, {
          error: "Contact not found — add phone or email on Overview, or link a contacts record.",
        });
      }

      const contact = await loadContactById(cfg, contactId);
      if (!contact || !String(contact.email || "").trim()) {
        return json(res, 400, { error: "Client must have an email address on file." });
      }

      const weeksIn = Array.isArray(body && body.weeks) ? body.weeks : [];
      if (weeksIn.length !== 4) {
        return json(res, 400, { error: "Provide scheduled_at for all 4 nurture email weeks." });
      }

      const scheduleByStep = {};
      for (const row of weeksIn) {
        const step = Number(row && row.step);
        const raw = row && row.scheduled_at ? String(row.scheduled_at).trim() : "";
        if (step < 1 || step > 4 || !raw) {
          return json(res, 400, { error: "Each week needs step (1–4) and scheduled_at." });
        }
        const at = new Date(raw);
        if (Number.isNaN(at.getTime())) {
          return json(res, 400, { error: `Invalid date for week ${step}.` });
        }
        scheduleByStep[step] = at.toISOString();
      }

      for (let step = 1; step <= 4; step++) {
        if (!scheduleByStep[step]) {
          return json(res, 400, { error: `Missing schedule for week ${step}.` });
        }
      }

      const updatedBy = (auth.user && auth.user.email) || "";
      for (let step = 1; step <= 4; step++) {
        await upsertScheduleRow(cfg, contactId, step, scheduleByStep[step], updatedBy);
      }

      const deliveryLogs = await loadDeliveryLogs(cfg, contactId);
      await ensureNurtureSequence(cfg, contactId, contact, scheduleByStep, deliveryLogs);

      const ovMap = await loadOverrides(cfg, contactId);
      const logged = [];

      for (let step = 1; step <= 4; step++) {
        if (isStepSent(deliveryLogs, step)) continue;
        const preview = emailPreview(contact, step, ovMap);
        const scheduledAt = scheduleByStep[step];
        const summary = `Scheduled ${weekName(step)} for ${new Date(scheduledAt).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })}`;
        await logContactCommunication(cfg.supabaseUrl, cfg.serviceKey, {
          contactId,
          direction: "outbound",
          channel: "email",
          subject: preview.subject,
          summary,
          body: htmlToPlain(preview.body),
          meta: {
            source: "staff_nurture_schedule",
            phase: 3,
            step,
            scheduled_at: scheduledAt,
            scheduled_by: updatedBy,
            email_type: "schedule_nurture_email",
          },
        });
        logged.push({ step, scheduled_at: scheduledAt });
      }

      return json(res, 200, {
        ok: true,
        contact_id: contactId,
        saved: scheduleByStep,
        logged,
        weeks: buildWeeksPayload(contact, deliveryLogs, scheduleByStep, ovMap),
      });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (e) {
    console.error("[staff/nurture-schedule-email]", e);
    return json(res, 500, { error: String((e && e.message) || e) });
  }
};
