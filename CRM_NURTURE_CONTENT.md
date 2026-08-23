# CRM Lead Nurture Engine — Content & Templates

Design reference for the **CRM Lead Nurture Engine** (replaces legacy WhatsApp/SMS/multi-week email phases in `NURTURE_PIPELINE.md`).

Template keys in `crm_nurture_settings` map to copy below. Code: `lib/crm-nurture-templates.js`.

---

## IC lifecycle stages

| Stage | Automation |
|-------|------------|
| **new** | 4-day intensive sequence (4 calls — morning/evening alternating, welcome email/SMS, educational email) → auto **contacted** end of Day 3 |
| **contacted** | Rotating educational email every 30 days (4 topics, then repeats), weekly newsletter (no auto calls — only the 4 New-stage call attempts) |
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
| Day 0 9:30 AM | Call task | attempt 1 |
| Day 1 5:00 PM | Call task | attempt 2 |
| Day 2 9:30 AM | Call task | attempt 3 |
| Day 2 10 AM | Email | `educational_day2` |
| Day 2 5:30 PM | SMS (opt-in) | `day2_sms` |
| Day 3 5:00 PM | Call task | attempt 4 |
| Day 3 end of day | Stage → contacted | `stage_transition` |

**Note:** Instant quote email from ManyChat (`/api/post-quote-email`) is separate from nurture `welcome` email. If both would fire within the same hour, skip welcome (dedupe in engine).

**New-lead staff email (unchanged):** Quote/appointment intake still sends the existing Gmail notification to `julie@` and `admin@` with lead details and an IntegrityCONNECT CSV attachment (`lib/ic-lead-notify.js`). The nurture engine does **not** send a duplicate Julie notification on enrollment.

---

## Contacted sequence

| Cadence | Channel | Template key | Topic |
|---------|---------|--------------|-------|
| +30 days (1st Contacted email) | Email | `contacted_educational_1` | Personal check-in from Julie |
| +60 days | Email | `contacted_educational_2` | What is final expense insurance? |
| +90 days | Email | `contacted_educational_3` | Julie's personal story |
| +120 days | Email | `contacted_educational_4` | Gentle urgency — don't wait too long |
| +150 days | Email | `contacted_educational_1` | (series repeats) |
| Weekly (Sunday) | Newsletter | imported issue | Weekly FB post email |

---

## Daily summary (8 AM Chicago)

Email to julie@ and admin@ (`daily_summary.recipients`): New-stage call tasks with attempt #, queued emails/SMS. CRM dashboard mirrors this data via `/api/staff/crm-dashboard`.

---

## Weekly newsletter (Sunday 6:00 a.m. Chicago)

The live job **searches last week’s reputable news** (final expense, whole life, term, IUL, annuities), writes a 3-story Spanish digest, and emails **julie@** and **admin@**. Playbook: [`tools/weekly-newsletter/README.md`](tools/weekly-newsletter/README.md).

| When | Channel | Source |
|------|---------|--------|
| Sunday 6:00 a.m. Chicago (`0 11 * * 0` and `0 12 * * 0` UTC) | Email to julie@ + admin@ | `lib/weekly-newsletter-run.js` via `/api/crm-newsletter-cron` |
| After live digest + story images | Facebook: Sunday, then Tue 10am / Thu 10am Chicago | `lib/weekly-facebook-run.js` via `/api/weekly-facebook-cron` |

Cron **creates** the `crm_newsletter_issues` row if none exists (`hero_source: weekly_research`). It does not wait for a Facebook import.

**Client send:** not automatic from the research cron. After Julie reviews the 6 a.m. letter, Staff → Weekly emails → **Send now**. Optional: `WEEKLY_NEWSLETTER_SEND_CLIENTS=1` on Vercel to include eligible CRM leads in the same Sunday send.

Facebook captions are composed automatically from the live blog; Julie does not need to ask for the Tuesday or Thursday posts.

Legacy Facebook-caption import still works (`POST /api/staff/newsletter-import`) if Julie wants that week’s social post instead.

---

## Weekly Facebook post email (legacy import)

Leads can still receive a Spanish Facebook-style caption if you import it:

| When | Channel | Source |
|------|---------|--------|
| After staff Send now | Email | `crm_newsletter_issues` row imported from FB post |

**Import before send:** `POST /api/staff/newsletter-import` with:

```json
{
  "main_caption": "…",
  "email_caption": "… (usted form — used for lead email; main_caption stays tú for Facebook)",
  "image_url": "https://www.mejorvidainsurance.com/img/opt/…",
  "blog_url": "https://www.mejorvidainsurance.com/blog/…",
  "post_date_iso": "2026-07-05"
}
```

Optional `subject` overrides the default (first line of caption). Review preview uses `FB/post-package-story3-weekly-2026-07-05.json` as the current example.

Sent to all leads with email except `unsubscribed` / `do_not_contact`. Includes quote / schedule / WhatsApp buttons like other nurture emails.

---

## Newsletter import (legacy HTML)

You can still pass raw `hero_html` + `body_html` if needed; FB post fields are preferred.

```json
{
  "hero_html": "<div>...</div>",
  "body_html": "<p>...</p>",
  "subject": "Weekly update",
  "hero_source": "manual",
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
| `WEEKLY_NEWSLETTER_SEND_CLIENTS` | Set `1` to also email eligible CRM leads at the Sunday 6 a.m. research send (default: staff inboxes only) |
| `WEEKLY_FACEBOOK_AUTOPOST` | Set `0` to pause automatic Sunday/Tue/Thu Facebook posts |

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
