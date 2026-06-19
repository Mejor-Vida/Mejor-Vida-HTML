# Mejor Vida Insurance — Lead Nurture Pipeline (v2)

This document is the **design source of truth** for the automated nurture system.  
**All message copy, placeholders, and channel-specific formatting** live in **`NURTURE_CONTENT.md`** — keep that file in sync when templates or code changes.

---

## Trigger (post–language opt-in)

1. Lead completes the **WhatsApp MVI Chatflow** → quote is generated.
2. ManyChat immediately fires **`POST /api/post-quote-email`** (already wired in ManyChat).

   **ManyChat External Request body** — use custom-field pills (`{{quote_low}}`, `{{idioma}}`), **not** raw `cuf_` IDs:
   ```json
   {
     "phone": "{{phone}}",
     "first_name": "{{first_name}}",
     "language": "{{idioma}}",
     "age": "{{edad}}",
     "quote_low": "{{quote_low}}",
     "quote_high": "{{quote_high}}",
     "quote_status": "{{quote_status}}",
     "quote_error": "{{quote_error}}",
     "call_scheduled": "false"
   }
   ```
   Header: `X-App-Secret: [MANYCHAT_WEBHOOK_SECRET]`

   The API **prefers `contacts.language` / `contacts.idioma` in Supabase** over webhook `language` (avoids English emails when the contact chose Spanish).

   When **`age` > 85** (webhook, `lead_state.age`, or ManyChat API pull), **`quote_status` = `out_of_range`**, or quote fields are empty after `/api/quote` out-of-range, the API sends the **over-age follow-up email** instead of a quote email — no dollar range, Julie offers a personal call.

3. The **immediate email** (Resend) includes:
   - Quote range (when age ≤ 85 and quote values exist), **or** over-age personal follow-up copy (when age > 85)
   - Short explanation of the process
   - Appointment block **if** a call was already scheduled
   - **VCF download link** (`julie.vcf`) so the lead can save Julie’s contact

This instant email replaces any legacy **30-minute WhatsApp** first touch.

---

## Smart logic flags

| Flag | Supabase field | Set when |
|------|----------------|----------|
| **has_quote** | `lead_state.quote_generated_at` | Quote generated in the MVI Chatflow |
| **has_scheduled_call** | `lead_state.call_scheduled_at` | Lead books via HubSpot (or equivalent scheduler) |
| **vcf_sent_at** | `contacts.vcf_sent_at` | VCF has been delivered through **any** supported channel (email link, SMS/MMS, post-call SMS, etc.) |

Cron and templates use these flags for branching (see phases below).

---

## Phase 1 — WhatsApp (2 messages only)

Uses **Meta-approved templates** in ManyChat. Timing is from **`nurture_sequence.enrolled_at`** (set when **`/api/lead-intake`** enrolls the contact; first send at **5 hours**).

| Step | When | ManyChat template (in flow) | Env var |
|------|------|----------------------------|---------|
| **1** | **5 hours** | `nurture_day3` | `MANYCHAT_FLOW_PHASE1_STEP1` |
| **2** | **21 hours** | `nurture_day_5` | `MANYCHAT_FLOW_PHASE1_STEP2` |

**Smart logic**

- If **`lead_state.call_scheduled_at`** is set before Step 2 would send, **do not send Step 2**; the nurture run treats the lead as **converted** and stops the sequence (see `api/nurture-cron.js`).
- **VCF is not sent via WhatsApp** — WhatsApp cannot reliably save a `.vcf` file in the customer’s contacts; VCF is handled in **email and SMS** only (see [VCF delivery channels](#vcf-delivery-channels-julievcf) below).

**Code reference:** `SCHEDULE_HOURS[1] = { 1: 5, 2: 21 }`, `MAX_STEPS[1] = 2`; `api/lead-intake.js` sets `next_send_at` to **now + 5 hours** for new enrollments.

---

## Phase 2 — SMS via Telnyx (days 1, 3, 5)

Hour offsets from **`enrolled_at`**: **24h / 72h / 120h** (calendar days 1, 3, 5). Inbound replies are handled by **`api/telnyx-sms-webhook.js`** (`QUOTE`, `CALL`, `STOP`, and email collection).

**Smart logic**

| Step | Offset | Behavior |
|------|--------|----------|
| **1** | 24h | Message adapts using **`has_quote`** and **`has_scheduled_call`** (via `quote_generated_at` / `call_scheduled_at`). |
| **2** | 72h | Includes **VCF as MMS** (`MediaUrl` → `julie.vcf` URL) **only if** `contacts.vcf_sent_at` is **null**; otherwise text-only. |
| **3** | 120h | **Skipped** (no send) if `call_scheduled_at` is set (`getSmsMessage` returns null for step 3 when a call is scheduled). |

Long-form SMS copy: **`NURTURE_CONTENT.md`** (SMS sections).

**Code reference:** `SCHEDULE_HOURS[2] = { 1: 24, 2: 72, 3: 120 }`, `MAX_STEPS[2] = 3`.

---

## Phase 3 — Email via Resend (weeks 1–4)

Hour offsets from **`enrolled_at`**: **168 / 336 / 504 / 672** (weeks 1–4).

**Smart logic**

- If **`lead_state.call_scheduled_at`** is set, **all four** weekly emails are **stopped**: the cron marks the nurture row **converted** and does not send further phase-3 messages.
- **Email 1 (week 1):** includes a **VCF P.S.** block only when **`vcf_sent_at`** is null.
- **Email 3 (week 3):** Julie’s **personal story** — exact subject/body must match **`NURTURE_CONTENT.md`** (Week 3 / education story block).

**Code reference:** `SCHEDULE_HOURS[3] = { 1: 168, 2: 336, 3: 504, 4: 672 }`, `MAX_STEPS[3] = 4`; templates in `getEmailContent()` inside `api/nurture-cron.js`.

---

## VCF delivery channels (`julie.vcf`)

| Channel | Mechanism |
|---------|-----------|
| ✅ Immediate post-quote email | **`POST /api/post-quote-email`** — link/button to VCF; sets `vcf_sent_at` when sent |
| ✅ SMS Day 3 (step 2) | **MMS** attachment to VCF URL **if** `vcf_sent_at` is null (`api/nurture-cron.js` → `sendSms`) |
| ✅ Email week 1 | VCF **P.S.** link **if** `vcf_sent_at` is null (`getEmailContent` step 1) |
| ✅ After call scheduled | **`POST /api/call-scheduled-webhook`** — VCF reminder SMS (+ updates `vcf_sent_at` when applicable) |
| ❌ WhatsApp | **Not used** for VCF — platform limitations |

---

## Phase 4 — Personal call (manual)

Julie may call manually after the email sequence. Not automated in this repo.

---

## Phase 5 — Close out

Mark unresponsive leads in CRM / Supabase; pause or complete nurture.

---

## Technical triggers

| Event | System |
|--------|--------|
| Language + opt-in (WhatsApp) | ManyChat → **`POST /api/lead-intake`** → `contacts`, `lead_state`, `nurture_sequence` |
| Quote + post-quote email | ManyChat → **`POST /api/post-quote-email`** |
| Scheduled call + VCF SMS | Automation → **`POST /api/call-scheduled-webhook`** |
| Nurture progression | Vercel Cron → **`GET /api/nurture-cron`** (Bearer `CRON_SECRET`) |
| SMS inbound | Telnyx → **`POST /api/telnyx-sms-webhook`** |

---

## Environment variables (Phase 1 WhatsApp)

| Variable | Purpose |
|----------|---------|
| `MANYCHAT_FLOW_PHASE1_STEP1` | ManyChat flow namespace — **5-hour** step (`nurture_day3` template in flow) |
| `MANYCHAT_FLOW_PHASE1_STEP2` | ManyChat flow namespace — **21-hour** step (`nurture_day_5` template in flow) |

No `STEP3` / `STEP4`. Telnyx, Resend, Supabase, and cron vars are in **`.env.example`**.

---

## Files not modified by pipeline code

- **`julie.vcf`** — static URL only; pipeline links to it.
- **HTML pages** — not generated by this pipeline.
- **ManyChat flow exports** — configured in ManyChat, not stored in this repo.

---

## Verification checklist (code vs v2)

| File | Expected |
|------|----------|
| `api/nurture-cron.js` | `SCHEDULE_HOURS`: phase `1` = `{1:5,2:21}`, `2` = `{1:24,2:72,3:120}`, `3` = `{1:168,2:336,3:504,4:672}`; `MAX_STEPS` = `{1:2,2:3,3:4}` |
| `api/post-quote-email.js` | Present; immediate post-quote email + `vcf_sent_at` update |
| `api/lead-intake.js` | `firstSendAt` = **5 hours** after enroll |
| `api/telnyx-sms-webhook.js` | Present; QUOTE / CALL / STOP / email capture |
| `api/call-scheduled-webhook.js` | Present; VCF reminder SMS |

If production behavior diverges (e.g. ManyChat API auth), adjust env and ManyChat, not this checklist, unless agreed.
