const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restPatch } = require("./_inbox-lib");
const {
  fetchNurtureRow,
  insertSkippedDelivery,
  computeNextSend,
} = require("./_nurture-lib");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || "")
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== "PATCH") {
    return json(res, 405, { error: "Method not allowed" });
  }
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server misconfigured" });

  const contactId = req.query.contactId;
  if (!isUuid(contactId)) return json(res, 400, { error: "contactId query parameter required" });

  try {
    const row = await fetchNurtureRow(cfg, contactId);
    if (!row) return json(res, 404, { error: "Nurture row not found" });

    if (String(row.status) !== "paused") {
      return json(res, 400, { error: "Only a paused nurture sequence can be resumed" });
    }

    const now = new Date();
    const isoNow = now.toISOString();
    const nextDue = row.next_send_at ? new Date(row.next_send_at) : null;
    const stillFuture = nextDue && !Number.isNaN(nextDue.getTime()) && nextDue.getTime() > now.getTime();

    if (stillFuture) {
      await restPatch(cfg, "nurture_sequence", `id=eq.${encodeURIComponent(row.id)}`, {
        status: "active",
        resumed_at: isoNow,
        updated_at: isoNow,
      });
      return json(res, 200, { ok: true, resumed: "future_next_send" });
    }

    await insertSkippedDelivery(cfg, contactId, row.phase, row.step, "paused_over");

    const { nextPhase, nextStep } = computeNextSend(row.phase, row.step, row.enrolled_at);
    const oneHour = new Date(now.getTime() + 3600000).toISOString();

    if (nextPhase === null) {
      await restPatch(cfg, "nurture_sequence", `id=eq.${encodeURIComponent(row.id)}`, {
        status: "completed",
        next_send_at: null,
        resumed_at: isoNow,
        updated_at: isoNow,
      });
      return json(res, 200, { ok: true, resumed: "skipped_to_completed" });
    }

    await restPatch(cfg, "nurture_sequence", `id=eq.${encodeURIComponent(row.id)}`, {
      status: "active",
      phase: nextPhase,
      step: nextStep,
      next_send_at: oneHour,
      resumed_at: isoNow,
      updated_at: isoNow,
    });
    return json(res, 200, { ok: true, resumed: "skipped_overdue_step" });
  } catch (e) {
    console.error("[staff/nurture-resume]", e);
    return json(res, 500, { error: String((e && e.message) || e) });
  }
};
