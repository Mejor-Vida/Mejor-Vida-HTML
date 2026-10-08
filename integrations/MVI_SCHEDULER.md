# MVI scheduler (Google Workspace + dual timezone)

Replaces HubSpot Meetings across the public site: `schedule-julie.html`, quote/term results modals, final-expense landings, and ad landing flows. Bookings use `/api/scheduler/*` with CRM source `mvi_scheduler`.

## Behavior

- **Client:** times in their timezone (default from IP via Vercel `x-vercel-ip-timezone`, overridable dropdown until they change it).
- **Julie:** CRM bell tooltip and Google Calendar event description show **Central** plus **client local** when zones differ.
- **Storage:** `lead_state.call_scheduled_at` (UTC), `lead_state.appointment_booker_timezone`, row in `scheduler_appointments`.
- **Google:** free/busy + create event on primary calendar.

## Staff CRM

Sidebar **Scheduler** (`#/scheduler`) — edit availability, buffers, blocked dates, and view upcoming appointments with **your time + client time**.

API: `GET/PATCH /api/staff/scheduler`

## Setup (one-time)

1. **Supabase:** apply migration `109_mvi_scheduler.sql`.
2. **Google Cloud Console** (same project as `GMAIL_CLIENT_ID`): enable **[Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)**. Without this, OAuth succeeds but every `create_event` returns 403 and CRM shows **No GCal**.
3. **Google Calendar OAuth:** while signed in as Julie, open  
   `https://www.mejorvidainsurance.com/api/staff/calendar-auth`  
   Copy refresh token → Vercel **`GOOGLE_CALENDAR_REFRESH_TOKEN`** (same OAuth client as Gmail).
4. **Optional env (Vercel):**
   - `SCHEDULER_HOST_TIMEZONE` — default `America/Chicago`
   - `GOOGLE_CALENDAR_ID` — default `primary`
   - `SCHEDULER_SLOT_MINUTES` — default `30`
   - `SCHEDULER_HORIZON_DAYS` — default `21`

## APIs

| Route | Purpose |
|--------|---------|
| `GET /api/scheduler/config` | Timezone options + IP guess |
| `GET /api/scheduler/slots?timezone=America/Los_Angeles` | Open slots |
| `POST /api/scheduler/book` | Book + CRM + Google |

## Host hours (code default)

Mon–Fri 9am–5pm CT, Sat 10am–2pm CT, 30-minute slots, 3-hour minimum notice.

Change in `lib/scheduler/config.js` when Julie’s availability changes.
