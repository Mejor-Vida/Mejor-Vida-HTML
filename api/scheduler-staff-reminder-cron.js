/**
 * Text Julie before scheduled MVI calls (default 30 min).
 * vercel.json: every 5 minutes
 */
const { processSchedulerStaffReminders } = require("../lib/scheduler/staff-call-reminder");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Supabase not configured" });
  }
  const minutes = parseInt(process.env.SCHEDULER_STAFF_REMINDER_MINUTES || "30", 10) || 30;
  try {
    const result = await processSchedulerStaffReminders({
      supabaseUrl,
      serviceKey,
      minutesBefore: minutes,
    });
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    console.error("[scheduler-staff-reminder-cron]", e.message || e);
    return res.status(500).json({ error: "failed" });
  }
};
