# Staff SMS inbox (Telnyx 402-844-1199)

Private Home Screen app for sending and receiving SMS on the Telnyx number, while that same number can also be used for a consumer WhatsApp account (groups). ManyChat WhatsApp stays on **402-440-5438**.

**App URL:** https://www.mejorvidainsurance.com/staff/sms-inbox.html

## What it does

- Receives every inbound Telnyx SMS (not only known CRM contacts)
- Sends replies from 402-844-1199
- Pushes a phone notification when a text arrives
- Does **not** auto-reply to verification codes or freeform messages (so WhatsApp signup codes are not answered with a keyword script)

Keyword auto-replies still run: `QUOTE` / `COTIZAR`, `CALL` / `LLAMAR`, `STOP`, `HELP` / `AYUDA`.

## Install on iPhone

1. Open the URL in **Safari** (not Chrome).
2. Share → **Add to Home Screen**.
3. Open the new icon.
4. Sign in with **julie@mejorvidainsurance.com** or **admin@mejorvidainsurance.com**. A 6-digit code is emailed.
5. Allow notifications.
6. Stay signed in until **Log out**.

iOS **16.4+** is required for Web Push. Notifications only work when the page was added to the Home Screen and opened from that icon.

## Login security

- Only those two emails can request a code
- Codes expire in 10 minutes and are rate-limited
- The page URL is not a secret; the email code is
- `/staff/` is disallowed in robots.txt and noindex
- SMS APIs require a staff session; the Telnyx webhook still uses `TELNYX_WEBHOOK_SECRET`

If the phone is unlocked, anyone who opens the icon can read/send SMS while you are signed in. Use Face ID / a passcode. Tap Log out if the phone is shared or lost.

## Environment

In Vercel (Production) and `.env.local`:

```
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@mejorvidainsurance.com
```

Generate keys: `npx web-push generate-vapid-keys`

Also required (already used for Telnyx SMS): `TELNYX_API_KEY`, `TELNYX_SMS_FROM`, `TELNYX_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `RESEND_API_KEY`, and `CRON_SECRET` or `PHONE_VERIFY_OTP_SECRET` (hashes inbox login codes).

## WhatsApp on this number

1. Confirm a test SMS to 402-844-1199 shows in the inbox and as a push.
2. In WhatsApp, add/verify **402-844-1199**. Do not change the ManyChat number 402-440-5438.
3. Choose SMS verification. Enter the code from the inbox / email / push.
4. Groups stay in WhatsApp. Client SMS stays in this app.

WhatsApp sometimes rejects VoIP numbers. If registration fails, stop and use a prepaid SIM instead of a paid SMS app.

## Code map

| Path | Role |
|------|------|
| `staff/sms-inbox.html` | PWA UI |
| `staff/sms-inbox-sw.js` | Push service worker |
| `api/staff/sms-otp-request.js` | Email a login code |
| `api/staff/sms-otp-verify.js` | Verify code → staff session |
| `api/staff/sms-threads.js` | Conversation list |
| `api/staff/sms-messages.js` | Thread messages |
| `api/staff/sms-reply.js` | Send SMS |
| `api/telnyx-sms-webhook.js` | Inbound Telnyx → log + push |
| `lib/staff-sms-inbox.js` | Shared inbox helpers |
| `integrations/supabase/migrations/093_staff_sms_inbox.sql` | Tables |

Send the install email after deploy:

```
node scripts/send-sms-inbox-install-email.js
```
