/**
 * /api/staff-reminder-cron.js
 * Sends due staff_reminders to Julie's inbox via Resend.
 * vercel.json cron every 5 minutes on /api/staff-reminder-cron
 */
const { processDueStaffReminders } = require("../lib/staff-reminder-processor");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await processDueStaffReminders();
    return res.status(200).json(result);
  } catch (e) {
    console.error("[staff-reminder-cron]", e.message);
    return res.status(500).json({ error: e.message });
  }
};
