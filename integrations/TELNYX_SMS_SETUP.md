# Telnyx SMS API — Mejor Vida setup

Campaign **C18HVT1** is **Active** on **+1 402 844 1199** (`+14028441199`). All site SMS (outbound + inbound) runs through Telnyx.

10DLC registration copy and URLs: **[docs/10DLC-TELNYX-CAMPAIGN.md](../docs/10DLC-TELNYX-CAMPAIGN.md)**.

---

## 1. Create API key (Telnyx portal)

1. Log in to [Telnyx Mission Control](https://portal.telnyx.com/).
2. **API Keys** → **Create API Key** (v2).
3. Copy the key once — store in your password manager.

---

## 2. Vercel environment variables

Project: **mejor-vida-html** (team `justins-projects-dd0ab4d0`).

| Variable | Value | Required |
|----------|-------|----------|
| `TELNYX_API_KEY` | API key from step 1 | Yes |
| `TELNYX_SMS_FROM` | `+14028441199` | Yes |
| `TELNYX_WEBHOOK_SECRET` | Random string (`openssl rand -hex 32`) | Recommended |

Existing vars still needed for inbound logic: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`.

**Local:** add the same names to `.env.local` (never commit values). Remove any legacy `TWILIO_*` vars — they are no longer used.

---

## 3. Inbound webhook (Telnyx → site)

Telnyx sends JSON `message.received` events. Replies are sent back via the Messages API.

**Webhook URL** (paste in Telnyx for number **+14028441199**):

```
https://www.mejorvidainsurance.com/api/telnyx-sms-webhook?secret=YOUR_TELNYX_WEBHOOK_SECRET
```

Replace `YOUR_TELNYX_WEBHOOK_SECRET` with the same value as the Vercel env var.

**Where in Telnyx:** Messaging → Phone Numbers → **+1 402 844 1199** → Messaging settings → **Webhook URL** (or Messaging Profile attached to the number).

**Keywords handled:** `QUOTE` / `COTIZAR`, `CALL` / `LLAMAR`, `STOP`, `HELP`, email capture. Other inbound texts are **not** auto-replied — they go to the [staff SMS inbox](STAFF_SMS_INBOX.md).

---

## 4. Code paths

| Route / module | Purpose |
|----------------|---------|
| `lib/sms-send.js` | Outbound SMS via Telnyx |
| `lib/sms-inbound-handler.js` | Shared QUOTE/CALL/STOP/email logic |
| `api/telnyx-sms-webhook.js` | Inbound SMS from Telnyx |
| `lib/phone-verify.js` | OTP codes on quote forms |
| `api/nurture-cron.js` | Phase 2 nurture SMS (+ VCF on step 2) |
| `api/call-scheduled-webhook.js` | VCF reminder after scheduled call |
| `lib/staff-sms-inbox.js` | Staff SMS inbox log, email OTP, push, alerts |
| `staff/sms-inbox.html` | Home Screen send/receive app |

See **[STAFF_SMS_INBOX.md](STAFF_SMS_INBOX.md)** for install, email-code login, and WhatsApp verification on this number.

---

## 5. Deploy and test

1. Commit + push (or deploy preview).
2. Confirm Vercel env vars are set for **Production**.
3. **Outbound test:** trigger a nurture SMS or phone OTP with a test number you own.
4. **Inbound test:** text `QUOTE` to **402-844-1199** — expect quote link reply within a few seconds.
5. **STOP test:** text `STOP` — nurture sequence should pause (`twilio_opt_out` column in Supabase; legacy name).

Check Vercel function logs: `[telnyx-sms-webhook]`, `[sms-send]`, `[nurture]`.

---

## 6. Troubleshooting

| Symptom | Check |
|---------|--------|
| Outbound fails with `missing_telnyx_api_key` | `TELNYX_API_KEY` on Vercel; redeploy after adding |
| Outbound fails with `missing_telnyx_sms_from` | Set `TELNYX_SMS_FROM=+14028441199` |
| Telnyx 403 on send | Number assigned to campaign C18HVT1; campaign Active |
| Inbound 403 | Webhook URL `?secret=` must match `TELNYX_WEBHOOK_SECRET` |
| No reply on inbound | Telnyx webhook URL on the **number**; check Vercel logs |

Telnyx Messages API: `POST https://api.telnyx.com/v2/messages` with `{ from, to, text, media_urls? }`.
