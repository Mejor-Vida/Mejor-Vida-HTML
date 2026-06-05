# Twilio A2P 10DLC — status, rules, and English compliance URLs

> **Active provider:** SMS registration is now via **Telnyx** (brand verified). Use **[docs/10DLC-TELNYX-CAMPAIGN.md](../docs/10DLC-TELNYX-CAMPAIGN.md)** for new campaign submission. This file is kept for Twilio history and URL patterns.

Use this doc when re-registering the campaign or debugging **Error 30034** (unregistered number).

---

## Current status (Twilio account: “My first Twilio account”)

| Stage | Status | Notes |
|-------|--------|--------|
| **1. Standard Customer Profile** | Approved | Trust Hub / business profile complete |
| **2. Standard Brand** | Registered | Low Volume Standard; Brand SID `BN098ee5507495c2f1aa9dc7ea6bd2c4b5` |
| **3. Standard Campaign** | **Rejected / Failed** | Use case: Low Volume Mixed; Campaign SID `CM755bd1e151af55cc45a50d04c1c4d6cf` |

**Overall: NOT fully A2P-approved** until a campaign is **Verified**. Brand alone is not enough to send US 10DLC SMS at scale.

### Rejection reason (TCR)

> *The campaign submission has been reviewed and it was rejected because of **unverifiable website**.*

Twilio maps this to **Error 30891** — campaign vetting rejection, invalid/unverifiable website URL.

**Likely cause:** URLs submitted pointed at root Spanish pages or paths that were broken, redirected oddly, or lacked clear English SMS opt-in language at review time.

**Messaging Service SID (linked):** `MGc9295a4a66f26926265694375141ef7a`  
**Compliance Registration SID:** none (never assigned — campaign failed first)

---

## Two separate websites (critical for TCR)

| Site | Base | Implementation |
|------|------|----------------|
| **Spanish** | `https://www.mejorvidainsurance.com/` | Static HTML at repo root — **not** JS translation |
| **English** | `https://www.mejorvidainsurance.com/en/` | Static HTML under `en/` — **not** JS translation |

For an **English** Low Volume Mixed campaign, **every URL in Twilio must use `/en/`**.  
Do **not** submit `/privacy-policy`, `/terms-service`, or `/sms-optin` (those are the Spanish site).

---

## Copy-paste URLs for Twilio (English campaign)

| Twilio field | URL |
|--------------|-----|
| **Company / website** | `https://www.mejorvidainsurance.com/en/` |
| **Privacy policy** | `https://www.mejorvidainsurance.com/en/privacy-policy` |
| **Terms of service** | `https://www.mejorvidainsurance.com/en/terms-service` |
| **SMS opt-in disclosure** | `https://www.mejorvidainsurance.com/en/sms-optin` |
| **Quote form (opt-in sample)** | `https://www.mejorvidainsurance.com/en/quote` |
| **E-sign consent** (optional field) | `https://www.mejorvidainsurance.com/en/e-sign-consent` |

**Strongest page for reviewers:** `/en/sms-optin` — dedicated SMS disclosure, STOP/HELP, frequency, link to quote form.

Spanish-only FB landing `/gastos-finales-ads/` — do **not** use on English A2P unless you register a separate Spanish campaign.

---

## URL verification checklist (run before resubmit)

```bash
for url in \
  "https://www.mejorvidainsurance.com/en/" \
  "https://www.mejorvidainsurance.com/en/privacy-policy" \
  "https://www.mejorvidainsurance.com/en/terms-service" \
  "https://www.mejorvidainsurance.com/en/sms-optin" \
  "https://www.mejorvidainsurance.com/en/e-sign-consent" \
  "https://www.mejorvidainsurance.com/en/quote"; do
  curl -sL -o /dev/null -w "%{http_code} $url\n" "$url"
done
```

All should return **200**. Use `www` — non-www redirects to www.

---

## TCR / Twilio rules (what reviewers check)

### Website must be verifiable

- Public **HTTPS**, no login wall
- **200 OK** on every URL you submit
- Business name **Mejor Vida Insurance LLC** visible on site
- Pages match what you describe in the campaign (insurance quotes, appointment follow-up, etc.)

### Privacy policy must include

- What data you collect (name, phone, email, DOB, etc.)
- How SMS is used
- **Opt-out:** reply **STOP**
- **Help:** reply **HELP** (best practice)
- Message frequency (e.g. 1–5/week)
- “Message and data rates may apply”
- No selling phone numbers for unrelated marketing

### Terms / SMS section must include

- Program description (informational insurance messages)
- How user opts in
- How user opts out
- Carrier rates disclaimer

### Opt-in disclosure page (`/en/sms-optin`)

- Standalone page explaining the SMS program
- Sample consent language matching live forms
- Link to live form where opt-in occurs

### Live opt-in on forms (`/en/quote`)

- **Optional** unchecked checkbox (not required to submit quote)
- Clear consent text: frequency, STOP, not required for purchase
- Link to **Privacy Policy** on `/en/privacy-policy`
- Consent recorded only when box is checked + form submitted

### Campaign form fields (Twilio)

| Field | Guidance |
|-------|----------|
| **Use case** | Low Volume Mixed |
| **Message samples** | 2–3 realistic examples (quote follow-up, appointment reminder) |
| **Message flow / call-to-action** | Describe: user visits `/en/quote`, optionally checks SMS box, submits; cite `/en/sms-optin` |
| **Embedded links** | Yes (quote links, scheduling) |
| **Embedded phone numbers** | Yes (402-440-5438 office, 402-735-5665 SMS) |
| **Age-gated / direct lending** | No |

### After approval

- Link **Verified** campaign to Messaging Service `MGc9295a4a66f26926265694375141ef7a`
- Set Vercel env `TWILIO_MESSAGING_SERVICE_SID` to that MG SID
- Nurture SMS (`api/nurture-cron.js`) and phone verify can be enabled (currently gated in repo until A2P)

---

## Resubmit steps (Twilio Console)

1. **Messaging** → **Regulatory compliance** → **A2P 10DLC**
2. Confirm brand `BN098ee5507495c2f1aa9dc7ea6bd2c4b5` still **Registered**
3. **Register new campaign** (do not expect rejected `CM755bd1e…` to auto-heal)
4. Paste **`/en/`** URLs from table above
5. In **Message flow**, reference `/en/sms-optin` and `/en/quote` explicitly
6. Attach to messaging service **MGc9295a4a66f26926265694375141ef7a**
7. Wait **Verified** (often 1–7 business days)

If rejected again: Twilio support ticket with Brand SID, failed Campaign SID, and exact rejection text.

---

## Repo files (English compliance)

| Path | Purpose |
|------|---------|
| `en/privacy-policy.html` | English privacy + SMS |
| `en/terms-service.html` | English terms + SMS section |
| `en/sms-optin.html` | SMS opt-in disclosure |
| `en/e-sign-consent.html` | E-sign consent |
| `en/quote.html` | Quote wizard + SMS checkbox |
| `vercel.json` | Clean URLs: `/en/privacy-policy`, `/en/sms-optin`, `/en/e-sign-consent`, etc. |

Legacy redirects: `/privacy-policy-en` → `/en/privacy-policy`, `/terms-service-en` → `/en/terms-service`.

---

## Errors reference

| Error | Meaning |
|-------|---------|
| **30034** | Message from unregistered number — campaign not verified |
| **30891** | Campaign vetting — invalid/unverifiable website |

---

## Unrelated: Meta Pixel

Facebook ads landing uses Meta dataset **873141755808233** (`/gastos-finales-ads/`). Separate from Twilio A2P.
