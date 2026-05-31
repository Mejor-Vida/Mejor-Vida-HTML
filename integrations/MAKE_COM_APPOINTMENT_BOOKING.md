# Make.com — HubSpot appointment booking

Route Make.com through **`POST /api/webhooks/appointment`** instead of writing to Supabase directly. Vercel holds credentials, runs dedup, upserts `contacts` + `lead_state`, logs to `webhook_logs`, and optionally sends the IntegrityCONNECT CSV email.

## Flow

```
HubSpot confirmation redirect
  → /confirmacion.html?email=…&startTime=…
  → POST /api/webhooks/appointment  (+ optional Make custom webhook)

OR

HubSpot workflow / Make custom webhook
  → POST /api/webhooks/appointment
  → Supabase (contacts, lead_state, events)
```

## Make.com scenario (reference)

1. **Custom webhook** — receives HubSpot or `confirmacion.html` payload.
2. **Tools → Set variable** — normalize fields (see mapping below).
3. **HTTP → Make a request**
   - **URL:** `https://www.mejorvidainsurance.com/api/webhooks/appointment`
   - **Method:** POST
   - **Headers:**
     - `Content-Type: application/json`
     - `X-App-Secret: {{MANYCHAT_WEBHOOK_SECRET}}` (store in Make connection / data store)
   - **Body:** JSON (normalized object below)

Optional step 4: Slack/email notification on HTTP error ≠ 200.

## Normalized JSON body (send to Vercel)

```json
{
  "firstName": "Maria",
  "lastName": "Lopez",
  "email": "maria@example.com",
  "phone": "+14025551234",
  "startTime": "2026-06-02T15:00:00.000Z",
  "meetingTime": "Monday, June 2, 2026, 10:00 AM CDT",
  "appointmentStart": "2026-06-02T15:00:00.000Z",
  "meetingTitle": "Final expense consultation",
  "hubspotContactId": "12345",
  "hubspotMeetingId": "67890",
  "source": "hubspot_scheduler"
}
```

### Field mapping (Make Set variable module)

| Output field | Accept aliases from webhook |
|---|---|
| `firstName` | `firstname`, `first_name`, `contact.firstname` |
| `lastName` | `lastname`, `last_name` |
| `email` | `contact.email` |
| `phone` | `mobilephone`, `mobilePhone` |
| `startTime` | `appointmentStart`, `appointment_start`, `scheduled_at`, `hs_meeting_start_time` |
| `meetingTime` | `meeting_time`, `appointmentTime` — or copy `startTime` |
| `appointmentStart` | same as `startTime` |
| `hubspotContactId` | `contactId`, `contact_id` |
| `hubspotMeetingId` | `meetingId`, `meeting_id` |
| `source` | constant `hubspot_scheduler` |

## HubSpot redirect URL (confirmacion page)

Set each HubSpot scheduling page **confirmation redirect** to:

```
https://www.mejorvidainsurance.com/confirmacion.html?email={{contact.email}}&firstName={{contact.firstname}}&lastName={{contact.lastname}}&phone={{contact.phone}}&startTime={{meeting.start_time}}&meetingTime={{meeting.start_time}}&hubspotContactId={{contact.hs_object_id}}&hubspotMeetingId={{meeting.hs_object_id}}
```

Use the personalization tokens HubSpot shows for your account. `confirmacion.html` posts `startTime` and `meetingTime` to Make (if configured) and to `/api/webhooks/appointment`.

## Direct Supabase (legacy — not recommended)

If a scenario still POSTs to Supabase REST, use service role key only on the server. Example upsert pattern:

**PATCH contacts** — match by phone:

```
PATCH /rest/v1/contacts?phone=eq.%2B14025551234
Prefer: return=minimal

{
  "first_name": "Maria",
  "last_name": "Lopez",
  "email": "maria@example.com",
  "source": "hubspot_scheduler",
  "updated_at": "2026-06-02T14:00:00.000Z"
}
```

**PATCH lead_state** — after resolving `contact_id`:

```
PATCH /rest/v1/lead_state?contact_id=eq.<uuid>
Prefer: return=minimal

{
  "call_scheduled_at": "2026-06-02T15:00:00.000Z",
  "pipeline_stage": "call_scheduled",
  "last_activity_at": "2026-06-02T14:00:00.000Z"
}
```

Prefer the Vercel route for dedup, IC email, and audit events.

## Vercel env

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | CRM upsert |
| `SUPABASE_SERVICE_ROLE_KEY` | CRM upsert |
| `MANYCHAT_WEBHOOK_SECRET` | Auth for Make → Vercel |
| `HUBSPOT_ACCESS_TOKEN` | Optional enrich when only IDs are sent |
| `MAKE_APPOINTMENT_WEBHOOK_URL` | Optional forward from confirmacion server path |

## Response (`200`)

```json
{
  "ok": true,
  "deduped": false,
  "contact_id": "uuid",
  "created": true,
  "call_scheduled_at": "2026-06-02T15:00:00.000Z",
  "pipeline_stage": "call_scheduled",
  "notified": true,
  "notify_skipped": false
}
```

When deduped (same appointment within 1 minute): `"deduped": true`, `"reason": "call_already_scheduled"`.
