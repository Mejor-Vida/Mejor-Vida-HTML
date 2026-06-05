# Telnyx 10DLC campaign — Mejor Vida Insurance LLC

Use **English URLs only** for registration. Brand: **Mejor Vida Insurance** (verified). SMS sending number: **402-735-5665**.

## Campaign type (use case)

### What Telnyx / TCR use this for

- **Throughput (MPS):** How many SMS **segments per second** you can send is set by **Trust Score** (from brand registration) + **campaign use case**.
- **Trust Score:** Assigned once when the brand is registered (TCR reputation algorithm). It **does not improve over time** — accurate brand data and a consistent website matter at registration time.
- **Campaign vetting:** After you create a campaign, external vetting (~$15) checks that your use case, samples, and opt-in URLs match (see checklist below).

### Recommended for Mejor Vida

| Option | When to use | Notes |
|--------|-------------|--------|
| **Customer Care** (best fit) | Quote follow-up, appointment reminders, application help | Matches your samples and `en/sms-optin.html`. Usually **lower campaign fees** than Mixed. |
| **Account Notification** | Policy/application status updates only | Use if Telnyx offers it and messages are purely transactional. |
| **Low Volume Mixed** | You need one number for several unrelated use cases | **Higher fees** per Telnyx; only choose if you truly send marketing + operations on the same campaign. |
| **Marketing** | Cold promos, broad blasts | **Do not** use unless opt-in and content are purely promotional. |

**Pick one primary use case:** **Customer Care** — not Political (no campaignverify.com token needed).

**Avoid mismatch:** If you register Customer Care, samples must be Julie/quote/appointment text — not “Your OTP is 123456” or unrelated verticals.

### Mixed vs dedicated (cost)

Telnyx notes **Mixed** campaigns cost more than a **specific** use case. As a small agency with one SMS number for insurance follow-up, **Customer Care** (or your brand’s **Low Volume Standard** + matching campaign type in the portal) is usually the right balance — one number, one clear purpose, lower complexity at vetting.

### Brand already verified — trust score is set

Your brand **Mejor Vida Insurance** is **Verified**. The trust score is already locked from that registration. You cannot “re-score” later; you **can** still get campaign approval if the **campaign** use case, message flow, and URLs are consistent.

Optional: Telnyx **Brand API** third-party vetting (separate from campaign vetting) — only if the portal offers it and you need a higher trust tier; not required before creating the first campaign if the brand is already verified.

### Throughput expectations (small agency)

At low volume (dozens of texts per day, not thousands), MPS limits rarely matter. **T-Mobile daily caps** toward their subscribers still apply at scale — see Telnyx help on T-Mobile limits if volume grows.

**Not political:** Political campaigns require [campaignverify.com](https://campaignverify.com) — not applicable to Mejor Vida.

## Message flow (paste into Telnyx “message flow” / opt-in description)

```
Consumers opt in on our English website by submitting a quote request at
https://www.mejorvidainsurance.com/en/quote.html
with their mobile phone number and checking an OPTIONAL, UNCHECKED SMS consent
checkbox (express written consent). The checkbox is not required to submit
the form or receive a quote.

Full program disclosure:
https://www.mejorvidainsurance.com/en/sms-optin.html

Privacy Policy (no sale of phone numbers for third-party marketing):
https://www.mejorvidainsurance.com/en/privacy-policy.html

Terms of Service:
https://www.mejorvidainsurance.com/en/terms-service.html

Consent language on the form (optional checkbox):
"Yes, I agree to receive SMS text messages from Mejor Vida Insurance LLC
about insurance options. Frequency: 1–5 messages per week. Msg & data rates
may apply. Reply STOP to cancel. Consent is not required to get a quote or
purchase insurance." Links to Privacy Policy and Terms of Service.

We send SMS only to users who checked the box and submitted. Message frequency
up to 1–5 per week during quoting/follow-up. Opt-out: reply STOP. Help: reply
HELP or call 402-440-5438. Messages are sent from 402-735-5665 by Mejor Vida
Insurance LLC, a licensed Nebraska insurance agency (Producer License #21695431).
```

## Sample messages (include STOP in each)

```
Mejor Vida Insurance: Hi [Name], this is Julie with Mejor Vida Insurance. I received your quote request and have a quick question. Reply STOP to opt out. Msg & data rates may apply.
```

```
Mejor Vida Insurance: Reminder — your appointment with Julie is [date] at [time]. Reply STOP to cancel SMS. Msg & data rates may apply.
```

```
Mejor Vida Insurance: Update on your insurance request — please call 402-440-5438 or reply here. Reply STOP to opt out. Reply HELP for help.
```

If Telnyx marks **Embedded phone number**, include **402-735-5665** in samples. If **Embedded link**, include `https://www.mejorvidainsurance.com/en/quote.html` in at least one sample.

## Consistency checklist (Telnyx vetting)

| Requirement | Your answer |
|-------------|-------------|
| Brand matches website | Mejor Vida Insurance LLC — `https://www.mejorvidainsurance.com/en/` |
| Sample messages match use case | Customer care / quote follow-up — not OTP or unrelated vertical |
| Working opt-in URLs | `en/sms-optin.html`, `en/quote.html` must load over HTTPS |
| Opt-out in samples | Every sample includes **STOP** |
| Privacy policy | No selling end-user data to third parties for their marketing |
| Email domain | Use `@mejorvidainsurance.com` (not Gmail) for brand/campaign contact |
| Provider on site | Privacy policy names **Telnyx** as SMS provider |

## Pages that collect phone + SMS consent (English)

| Page | SMS opt-in |
|------|------------|
| `en/quote.html` | Optional unchecked checkbox (primary campaign path) |
| `en/landing-final-expense.html` | Optional unchecked checkbox |
| `en/quote-out-of-state.html` | Required general contact consent (includes SMS) — separate from optional quote path |

## After approval

1. Link campaign to brand in Telnyx → Messaging → 10DLC → Campaigns.
2. Assign campaign to number **402-735-5665**.
3. Point application SMS API to Telnyx (replace Twilio env vars when ready).

## Fees and vetting (two layers)

| Layer | Status | Cost (typical) |
|-------|--------|----------------|
| **Brand** | Verified (Mejor Vida Insurance) | Already paid at brand registration |
| **Campaign** | To create | External campaign vetting ~**$15** when submitted; extra if rejected and resubmitted |

Brand registration went to **TCR** for review and trust scoring. **Campaign** registration is a separate step with its own vetting — even with a verified brand, the campaign must match use case + website + samples.

## Qualify use case (optional API check)

If you use Telnyx APIs, the **Qualify By Use Case** endpoint can confirm a use case is acceptable for your brand before submit (see Telnyx developer docs → 10DLC).
