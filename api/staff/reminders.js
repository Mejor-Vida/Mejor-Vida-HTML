const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restSelect, restInsert, restPatch } = require("./_inbox-lib");
const { resolveContactForStaffLead, isUuid } = require("./_lead-contact");
const { processDueStaffReminders } = require("../../lib/staff-reminder-processor");

const DEFAULT_NOTIFY = "julie@mejorvidainsurance.com";

function parseScheduledAt(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  const d = new Date(s);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toISOString();
}

function pgInListQuoted(values) {
  return values.map((v) => `"${String(v).replace(/"/g, "")}"`).join(",");
}

async function enrichRemindersWithClientNames(cfg, rows) {
  const ids = Array.from(new Set((rows || []).map((r) => r && r.lead_id).filter(Boolean)));
  const nameMap = new Map();
  if (ids.length) {
    try {
      const inList = pgInListQuoted(ids);
      const leads = await restSelect(
        cfg,
        "unified_leads",
        `select=id,display_name,first_name,last_name&id=in.(${inList})`
      );
      (leads || []).forEach((l) => {
        if (!l || !l.id) return;
        const a = String(l.first_name || "").trim();
        const b = String(l.last_name || "").trim();
        const full = String(l.display_name || "").trim() || [a, b].filter(Boolean).join(" ");
        nameMap.set(String(l.id), full || "Unknown");
      });
    } catch (e) {
      console.error("staff/reminders enrich names", e && e.message ? e.message : e);
    }
  }
  return (rows || []).map((r) =>
    Object.assign({}, r, {
      client_name: nameMap.get(String(r.lead_id)) || "Unknown",
    })
  );
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  if (req.method === "GET") {
    const scopeAll =
      String((req.query && req.query.scope) || "").trim() === "all" ||
      String((req.query && req.query.all) || "").trim() === "1";

    if (scopeAll) {
      try {
        const rows = await restSelect(
          cfg,
          "staff_reminders",
          "select=id,lead_id,lead_source_table,message,scheduled_at,notify_email,status,sent_at,created_at,created_by&status=eq.pending&order=scheduled_at.asc&limit=200"
        );
        const items = await enrichRemindersWithClientNames(cfg, rows || []);
        return json(res, 200, { items });
      } catch (e) {
        console.error("staff/reminders GET all", e);
        return json(res, 500, { error: "Failed to load reminders" });
      }
    }

    const leadId = String((req.query && req.query.leadId) || "").trim();
    if (!isUuid(leadId)) return json(res, 400, { error: "Valid lead id required" });

    const resolved = await resolveContactForStaffLead(cfg, leadId);
    if (resolved.error) return json(res, resolved.status || 400, { error: resolved.error });

    try {
      const rows = await restSelect(
        cfg,
        "staff_reminders",
        `select=id,lead_id,lead_source_table,message,scheduled_at,notify_email,status,sent_at,created_at,created_by&lead_id=eq.${encodeURIComponent(
          leadId
        )}&lead_source_table=eq.${encodeURIComponent(resolved.sourceTable)}&order=scheduled_at.asc&limit=50`
      );
      const items = await enrichRemindersWithClientNames(cfg, rows || []);
      return json(res, 200, { items });
    } catch (e) {
      console.error("staff/reminders GET", e);
      return json(res, 500, { error: "Failed to load reminders" });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }

    if (body && (body.action === "process_due" || body.process_due === true)) {
      try {
        const result = await processDueStaffReminders({
          supabaseUrl: cfg.supabaseUrl,
          serviceKey: cfg.serviceKey,
        });
        return json(res, 200, { ok: true, ...result });
      } catch (e) {
        console.error("staff/reminders process_due", e);
        return json(res, 200, {
          ok: false,
          processed: 0,
          sent: 0,
          error: e.message || "Failed to process due reminders",
        });
      }
    }

    const leadId = String(body.lead_id || body.leadId || "").trim();
    const message = String(body.message || "").trim();
    const scheduledAt = parseScheduledAt(body.scheduled_at || body.scheduledAt);
    if (!isUuid(leadId)) return json(res, 400, { error: "Valid lead id required" });
    if (!message) return json(res, 400, { error: "Reminder message required" });
    if (!scheduledAt) return json(res, 400, { error: "Valid date and time required" });
    if (new Date(scheduledAt).getTime() <= Date.now() - 60000) {
      return json(res, 400, { error: "Scheduled time must be in the future" });
    }

    const resolved = await resolveContactForStaffLead(cfg, leadId);
    if (resolved.error) return json(res, resolved.status || 400, { error: resolved.error });

    const notifyEmail =
      String(process.env.STAFF_REMINDER_EMAIL || DEFAULT_NOTIFY).trim() || DEFAULT_NOTIFY;
    const createdBy = auth.user && auth.user.email ? auth.user.email : null;

    try {
      const inserted = await restInsert(cfg, "staff_reminders", [
        {
          lead_id: leadId,
          lead_source_table: resolved.sourceTable,
          contact_id: resolved.contactId || null,
          message,
          scheduled_at: scheduledAt,
          notify_email: notifyEmail,
          status: "pending",
          created_by: createdBy,
        },
      ]);
      const item = Array.isArray(inserted) && inserted[0] ? inserted[0] : null;
      return json(res, 200, { ok: true, item });
    } catch (e) {
      console.error("staff/reminders POST", e);
      return json(res, 500, { error: "Failed to schedule reminder" });
    }
  }

  if (req.method === "PATCH") {
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }

    const id = String(body.id || "").trim();
    if (!isUuid(id)) return json(res, 400, { error: "Valid reminder id required" });

    if (body.status === "cancelled") {
      try {
        const patched = await restPatch(cfg, "staff_reminders", `id=eq.${encodeURIComponent(id)}&status=eq.pending`, {
          status: "cancelled",
        });
        const item = Array.isArray(patched) && patched[0] ? patched[0] : null;
        if (!item) return json(res, 404, { error: "Reminder not found or already sent" });
        return json(res, 200, { ok: true, item });
      } catch (e) {
        console.error("staff/reminders PATCH", e);
        return json(res, 500, { error: "Failed to cancel reminder" });
      }
    }

    return json(res, 400, { error: "Unsupported update" });
  }

  res.setHeader("Allow", "GET, POST, PATCH");
  return json(res, 405, { error: "Method not allowed" });
};
