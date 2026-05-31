# HubSpot meeting — client vs staff email

After someone books via HubSpot, two different email paths exist. **Do not confuse them.**

## Keep both of these

| Email | From | To | Purpose |
|-------|------|-----|---------|
| HubSpot confirmation | **admin@** | Client (booker) | Appointment confirmation ✅ |
| IC lead alert + CSV | **julie@** (Gmail) | **admin@ + julie@** only | Staff import into IntegrityCONNECT ✅ |

The IC email is **never** sent to the client. It always uses `QUOTE_LEAD_NOTIFY_TO` in `lib/ic-lead-notify.js`.

Triggered by:

- `POST /api/webhooks/appointment` (confirmacion.html / Make.com)
- `GET|POST /api/hubspot-meeting-webhook`

## Remove client duplicate from julie@

The client should **not** receive a second email from julie@ after booking.

### From our codebase (fixed)

| Route | Client julie@? | Fix |
|-------|----------------|-----|
| **`POST /api/post-quote-email`** | Yes — Resend to `contacts.email` | Skipped when `call_scheduled=true` **or** when `lead_state.call_scheduled_at` is already set |
| **`POST /api/webhooks/appointment`** IC notify | No — staff only | Sent on every new booking (even if contact quoted before) |
| **`/api/hubspot-meeting-webhook`** IC notify | No — staff only | Same — always sends IC CSV to admin+julie |

`post-quote-email` is the only server route that sends **julie@ → client**. ManyChat may fire it after quote; if the lead already booked (or `call_scheduled=true`), we skip.

### Outside the repo (HubSpot UI)

If the client still gets julie@ after deploy, it is usually:

1. **HubSpot Meetings → Automation → Confirmation email** (sender = meeting owner Julie)
2. **Google Calendar guest invite** from Julie’s connected calendar

Disable those in HubSpot; keep the **admin@** workflow email.

## Redirect URL (HubSpot — required)

Without this, HubSpot confirms the booking but **no IC email is sent** (nothing hits our API).

**Recommended** (server-side):

```
https://www.mejorvidainsurance.com/api/hubspot-meeting-webhook?email={{contact.email}}&firstName={{contact.firstname}}&lastName={{contact.lastname}}&phone={{contact.phone}}&startTime={{meeting.start_time}}&meetingTime={{meeting.start_time}}&hubspotContactId={{contact.hs_object_id}}&hubspotMeetingId={{meeting.hs_object_id}}
```

Then the booker is redirected to `/confirmacion.html?processed=1&…` for the thank-you screen.
