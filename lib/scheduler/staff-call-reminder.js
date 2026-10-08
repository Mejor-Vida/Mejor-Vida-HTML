/**
 * Text Julie ~30 minutes before a scheduled MVI call.
 */
const { sendSms, normalizeE164 } = require("../sms-send");
const { dualAppointmentLabel } = require("./timezone");

function julieNotifyPhone() {
  const raw =
    String(process.env.SCHEDULER_JULIE_NOTIFY_PHONE || "").trim() ||
    String(process.env.JULIE_NOTIFY_PHONE || "").trim() ||
    "+14024405438";
  return normalizeE164(raw);
}

function supabaseBase(url) {
  return String(url || "").replace(/\/$/, "") + "/rest/v1";
}

function headers(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
}

/**
 * Appointments starting in [minutesBefore - 5, minutesBefore + 5] minutes, not yet reminded.
 */
async function processSchedulerStaffReminders({ supabaseUrl, serviceKey, minutesBefore = 30 }) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const target = now + minutesBefore * 60 * 1000;
  const fromIso = new Date(target - windowMs).toISOString();
  const toIso = new Date(target + windowMs).toISOString();

  const q =
    `scheduler_appointments?select=id,starts_at,first_name,last_name,phone,booker_timezone,host_timezone` +
    `&status=eq.scheduled` +
    `&staff_reminder_sent_at=is.null` +
    `&starts_at=gte.${encodeURIComponent(fromIso)}` +
    `&starts_at=lte.${encodeURIComponent(toIso)}`;

  const r = await fetch(`${supabaseBase(supabaseUrl)}/${q}`, { headers: headers(serviceKey) });
  const rows = await r.json().catch(() => []);
  if (!Array.isArray(rows)) return { processed: 0, error: "query_failed" };

  const to = julieNotifyPhone();
  let sent = 0;
  for (const row of rows) {
    const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim() || "Client";
    const when = dualAppointmentLabel(
      row.starts_at,
      row.booker_timezone,
      row.host_timezone || "America/Chicago"
    );
    const body = `Mejor Vida: call with ${name} in ~${minutesBefore} min (${when}). Phone: ${row.phone || "see CRM"}`;
    const sms = await sendSms({ to, body });
    if (!sms.ok) {
      console.error("[scheduler-reminder] sms failed", row.id, sms.reason || sms.message);
      continue;
    }
    await fetch(`${supabaseBase(supabaseUrl)}/scheduler_appointments?id=eq.${row.id}`, {
      method: "PATCH",
      headers: headers(serviceKey),
      body: JSON.stringify({ staff_reminder_sent_at: new Date().toISOString() }),
    });
    sent += 1;
  }
  return { processed: rows.length, sent };
}

module.exports = { processSchedulerStaffReminders, julieNotifyPhone };
