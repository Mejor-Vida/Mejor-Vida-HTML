/**
 * Cancel scheduler appointment (staff or client token).
 */
const crypto = require("crypto");
const { deleteCalendarEvent } = require("./google-calendar");
const { dualAppointmentLabel } = require("./timezone");
const { buildManageUrls } = require("./manage-links");
const { sendSchedulerCancellationEmails } = require("./confirmation-emails");

function supabaseBase(url) {
  return String(url || "").replace(/\/$/, "") + "/rest/v1";
}

function restHeaders(key, prefer) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: prefer || "return=representation",
  };
}

async function fetchAppointment(cfg, id) {
  const q = `scheduler_appointments?id=eq.${encodeURIComponent(id)}&limit=1`;
  const r = await fetch(`${supabaseBase(cfg.supabaseUrl)}/${q}`, {
    headers: restHeaders(cfg.serviceKey),
  });
  const rows = await r.json().catch(() => []);
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

function tokenMatches(row, token) {
  if (!token || !row || !row.cancel_token_hash) return false;
  const hash = crypto.createHash("sha256").update(String(token).trim()).digest("hex");
  return hash === row.cancel_token_hash;
}

async function clearLeadScheduledCall(cfg, contactId, startsAtIso) {
  if (!contactId) return;
  const stateR = await fetch(
    `${supabaseBase(cfg.supabaseUrl)}/lead_state?contact_id=eq.${encodeURIComponent(contactId)}&select=call_scheduled_at&limit=1`,
    { headers: restHeaders(cfg.serviceKey) }
  );
  const states = await stateR.json().catch(() => []);
  const st = Array.isArray(states) && states[0] ? states[0] : null;
  if (!st || !st.call_scheduled_at) return;
  const a = Date.parse(st.call_scheduled_at);
  const b = Date.parse(startsAtIso);
  if (Number.isNaN(a) || Number.isNaN(b) || Math.abs(a - b) > 120_000) return;
  await fetch(`${supabaseBase(cfg.supabaseUrl)}/lead_state?contact_id=eq.${encodeURIComponent(contactId)}`, {
    method: "PATCH",
    headers: restHeaders(cfg.serviceKey, "return=minimal"),
    body: JSON.stringify({ call_scheduled_at: null }),
  });
}

async function cancelAppointment(cfg, { appointmentId, cancelToken, actor }) {
  const row = await fetchAppointment(cfg, appointmentId);
  if (!row) return { ok: false, status: 404, error: "not_found" };
  if (row.status === "cancelled") return { ok: true, status: 200, already: true };
  if (cancelToken && !tokenMatches(row, cancelToken)) {
    return { ok: false, status: 403, error: "invalid_token" };
  }
  if (!cancelToken && actor !== "staff") {
    return { ok: false, status: 403, error: "forbidden" };
  }

  if (row.google_event_id) {
    const del = await deleteCalendarEvent(row.google_event_id);
    if (!del.ok) {
      console.error("[scheduler] calendar delete", del.reason, row.google_event_id);
    }
  }

  const patchR = await fetch(
    `${supabaseBase(cfg.supabaseUrl)}/scheduler_appointments?id=eq.${encodeURIComponent(row.id)}`,
    {
      method: "PATCH",
      headers: restHeaders(cfg.serviceKey),
      body: JSON.stringify({
        status: "cancelled",
        updated_at: new Date().toISOString(),
        meta: {
          ...(row.meta && typeof row.meta === "object" ? row.meta : {}),
          cancelled_at: new Date().toISOString(),
          cancelled_by: actor || "client",
        },
      }),
    }
  );
  if (!patchR.ok) {
    const t = await patchR.text();
    return { ok: false, status: 500, error: "update_failed", detail: t.slice(0, 200) };
  }

  await clearLeadScheduledCall(cfg, row.contact_id, row.starts_at);

  const cancelledBy = actor || "client";
  const lang = String(row.language || "spanish").toLowerCase();
  const hostTz = row.host_timezone || "America/Chicago";
  const bookerTz = row.booker_timezone || hostTz;
  const links = buildManageUrls({
    appointmentId: row.id,
    cancelToken: "unused",
    language: lang,
  });
  let emailResult = null;
  try {
    emailResult = await sendSchedulerCancellationEmails({
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      language: lang,
      cancelledBy,
      rescheduleUrl: links.rescheduleUrl,
      labels: {
        host: dualAppointmentLabel(row.starts_at, bookerTz, hostTz, "en-US"),
        booker: dualAppointmentLabel(row.starts_at, bookerTz, bookerTz, "en-US"),
      },
    });
  } catch (e) {
    console.error("[scheduler] cancellation email", e.message || e);
  }

  return { ok: true, status: 200, id: row.id, email: emailResult };
}

module.exports = { cancelAppointment, tokenMatches, fetchAppointment };
