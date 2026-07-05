# CRM Lead Nurture Engine — Content & Templates

Design reference for the **CRM Lead Nurture Engine** (replaces legacy WhatsApp/SMS/multi-week email phases in `NURTURE_PIPELINE.md`).

Template keys in `crm_nurture_settings` map to copy below. Code: `lib/crm-nurture-templates.js`.

---

## IC lifecycle stages

| Stage | Automation |
|-------|------------|
| **new** | 4-day intensive sequence (8 calls, welcome email/SMS, educational email) → auto **contacted** end of Day 3 |
| **contacted** | Call every 14 days, educational email every 30 days, weekly newsletter |
| **engaged** | No auto calls; Julie manual tasks; newsletter |
| **client / retained / loyal / enrolled** | Newsletter only (retained/loyal auto-promoted by policy date) |
| **lost** | Newsletter only; no calls/SMS |

SMS sends only when `profile_data.sms_opt_in === true`.

---

## New sequence (Days 0–3)

| When | Channel | Template key |
|------|---------|----------------|
| Day 0 immediate | Email | `welcome` |
| Day 0 immediate | SMS (opt-in) | `welcome_sms` |
| Day 0 immediate + 5 PM | Call tasks | attempts 1–2 |
| Day 1 9:30 AM + 5 PM | Call tasks | attempts 3–4 |
| Day 2 9:30 AM | Call task | attempt 5 |
| Day 2 10 AM | Email | `educational_day2` |
| Day 2 5 PM | Call task | attempt 6 |
| Day 2 5:30 PM | SMS (opt-in) | `day2_sms` |
| Day 3 9:30 AM + 5 PM | Call tasks | attempts 7–8 |
| Day 3 end of day | Stage → contacted | `stage_transition` |

**Note:** Instant quote email from ManyChat (`/api/post-quote-email`) is separate from nurture `welcome` email. If both would fire within the same hour, skip welcome (dedupe in engine).

**New-lead staff email (unchanged):** Quote/appointment intake still sends the existing Gmail notification to `julie@` and `admin@` with lead details and an IntegrityCONNECT CSV attachment (`lib/ic-lead-notify.js`). The nurture engine does **not** send a duplicate Julie notification on enrollment.

---

## Contacted sequence

| Cadence | Channel | Template key |
|---------|---------|----------------|
| Every 14 days | Call task | — |
| Every 30 days | Email | `contacted_educational` |
| Weekly (Sunday) | Newsletter | imported issue |

---

## Daily summary (8 AM Chicago)

Email to julie@ and admin@ (`daily_summary.recipients`): New call tasks with attempt #, Contacted due calls, queued emails/SMS. CRM dashboard mirrors this data via `/api/staff/crm-dashboard`.

---

## Newsletter import

`POST /api/staff/newsletter-import` body:

```json
{
  "hero_html": "<div>...</div>",
  "body_html": "<p>...</p>",
  "subject": "Weekly update",
  "hero_source": "abacus|blog|facebook|manual",
  "blog_url": "https://..."
}
```

Sunday cron sends to all leads with email except `unsubscribed` / `do_not_contact`.

---

## Environment

| Variable | Purpose |
|----------|---------|
| `CRM_NURTURE_ROLLOUT` | `testing` (default) or `live` — env overrides DB `rollout_mode` |
| `CRM_NURTURE_ENGINE_ENABLED` | Set `false` to disable enrollment + crons entirely |
| `CRM_NURTURE_DRY_RUN` | Log tasks without sending email/SMS |
| `RESEND_API_KEY` | Email |
| `TELNYX_API_KEY`, `TELNYX_SMS_FROM` | SMS |
| `CRON_SECRET` | Cron auth |

---

## Testing rollout (default)

Until you approve go-live, **`rollout_mode` is `testing`**. Only these leads receive automation:

- **Names:** Julie Braunsroth, Justin Braunsroth (fuzzy match)
- **Emails:** `julie@…`, `admin@…` (any domain) plus full addresses on `@mejorvidainsurance.com`

Everyone else: no enrollment, no emails/SMS/newsletter from the nurture engine.

**Review messages:** [`/staff/nurture-review.html`](/staff/nurture-review.html) — full ordered sequence (Spanish), approve or request changes. Also linked from the staff portal directory at `/staff/`.

**Language:** All lead-facing nurture emails and SMS use **`content_language: spanish`** (configured in DB). English copy in code is not sent to leads while this setting is active.

**Go live when ready:** set `rollout_mode` to `live` in nurture settings, or `CRM_NURTURE_ROLLOUT=live` on Vercel.

---

## Staff settings

Edit times and cadence in CRM → **Nurture** (`#/nurture-settings`) or `PATCH /api/staff/nurture-settings`.
