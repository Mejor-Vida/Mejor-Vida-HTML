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

**Pick use cases:** **Customer Care** + **2FA** (phone verification codes on quote forms). Not Political (no campaignverify.com token needed).

**Keep samples and consent aligned:** Customer Care samples = Julie/quote/appointment text. **2FA sample** = verification code message (see [Sample messages](#sample-messages-include-stop-in-each)).

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
Consumers opt in on our English website at
https://www.mejorvidainsurance.com/en/gastos-finales-ads-v2/
(phone/SMS step preview: add ?compliance-preview=phone)
or https://www.mejorvidainsurance.com/en/quote.html.

PHONE VERIFICATION (2FA): On the phone step, the user enters a mobile number
and clicks "Send verification code." Consent for the one-time verification SMS
is shown next to that button. The user receives a 6-digit code by SMS, enters
it, and continues the quote. Verification codes expire in 10 minutes.

OPTIONAL MARKETING/FOLLOW-UP SMS: The same forms show an OPTIONAL, UNCHECKED
SMS consent checkbox (express written consent). The checkbox is not required to
submit the form or receive a quote.

Full program disclosure:
https://www.mejorvidainsurance.com/en/sms-optin.html

Privacy Policy (no sale of phone numbers for third-party marketing):
https://www.mejorvidainsurance.com/en/privacy-policy.html

Terms of Service:
https://www.mejorvidainsurance.com/en/terms-service.html

Consent language on the form (optional checkbox):
"Yes, I agree to receive SMS text messages from Mejor Vida Insurance LLC
about insurance options, including one-time verification codes to confirm my
phone number. Frequency: 1–5 messages per week (excluding verification codes).
Msg & data rates may apply. Reply STOP to cancel. Reply HELP for help. Consent
is not required to get a quote or purchase insurance." Links to Privacy Policy
and Terms of Service.

Verification-code consent (Send verification code button):
"By clicking Send verification code, you agree to receive a one-time SMS with
a verification code from Mejor Vida Insurance LLC. Msg & data rates may apply.
Reply STOP to cancel. Reply HELP for help."

We send follow-up SMS only to users who checked the optional box and submitted.
Message frequency up to 1–5 per week during quoting/follow-up. Opt-out: reply
STOP. Help: reply HELP or call 402-440-5438. Messages are sent from 402-735-5665
by Mejor Vida Insurance LLC, a licensed Nebraska insurance agency (Producer
License #21695431).
```

## Sample messages (include STOP in each)

**Customer Care**

```
Mejor Vida Insurance: Hi [Name], this is Julie with Mejor Vida Insurance. I received your quote request and have a quick question. Reply STOP to opt out. Msg & data rates may apply.
```

```
Mejor Vida Insurance: Reminder — your appointment with Julie is [date] at [time]. Reply STOP to cancel SMS. Msg & data rates may apply.
```

```
Mejor Vida Insurance: Update on your insurance request — please call 402-440-5438 or reply here. Reply STOP to opt out. Reply HELP for help.
```

**2FA (required if 2FA use case is selected)**

```
Mejor Vida Insurance: Your verification code is 123456. It expires in 10 minutes. Reply STOP to opt out. Reply HELP for help. Msg & data rates may apply.
```

If Telnyx marks **Embedded phone number**, include **402-735-5665** in samples. If **Embedded link**, include `https://www.mejorvidainsurance.com/en/gastos-finales-ads-v2/` (or `en/quote.html`) in at least one sample.

**Do not** list `en/landing-final-expense.html` on this campaign — that page is retired for 10DLC.

## Consistency checklist (Telnyx vetting)

| Requirement | Your answer |
|-------------|-------------|
| Brand matches website | Mejor Vida Insurance LLC — `https://www.mejorvidainsurance.com/en/` |
| Sample messages match use case | Customer care samples + **2FA verification-code sample** (see above) |
| Working opt-in URLs | `en/sms-optin.html`, `en/gastos-finales-ads-v2/`, `en/quote.html` must load over HTTPS |
| Opt-out in samples | Every sample includes **STOP** |
| Privacy policy | No selling end-user data to third parties for their marketing |
| Email domain | Use `@mejorvidainsurance.com` (not Gmail) for brand/campaign contact |
| Provider on site | Privacy policy names **Telnyx** as SMS provider |

## Pages that collect phone + SMS consent (English)

| Page | SMS opt-in |
|------|------------|
| **`en/gastos-finales-ads-v2/`** | **Primary** — phone verification (2FA) + optional unchecked SMS checkbox on step 13; Nebraska only; reviewers: `?compliance-preview=phone` |
| `en/quote.html` | Optional unchecked checkbox (Nebraska-only quote wizard) |
| ~~`en/landing-final-expense.html`~~ | **Do not use** for Telnyx 10DLC (retired; not listed on campaign) |
| ~~`en/quote-out-of-state.html`~~ | **Not used** on English 10DLC paths (noindex; Spanish site only) |

## SMS phone number: Twilio vs Telnyx

| Question | Answer |
|----------|--------|
| Will my **old Twilio number** work on Telnyx automatically? | **No.** A US number is active on **one** messaging provider at a time for 10DLC. Twilio-owned numbers send through Twilio; Telnyx 10DLC SMS must use a number **in your Telnyx account** with the approved campaign assigned. |
| How do I keep the **same digits** customers know? | **Port** the number from Twilio → Telnyx (number porting / LNP in Telnyx portal). Allow several business days; both carriers coordinate. Until port completes, keep sending from Twilio or pause SMS. |
| What number should this campaign use? | The number shown on the site for **SMS/Text: 402-735-5665** — confirm in Telnyx → Numbers that this E.164 (`+14027355665`) is on Telnyx and will get the campaign. If 402-735-5665 is still only on Twilio, either **port it** or **buy/host a Telnyx number** and update the website + `en/sms-optin.html` before vetting. |
| Office line **402-440-5438** | Voice/office — not the 10DLC SMS sender unless you deliberately register it (usually keep SMS on 402-735-5665). |
| After campaign approval | **Port** the Twilio SMS number to Telnyx (LNP), assign the approved 10DLC campaign to that number, then switch app env from `TWILIO_*` to Telnyx API keys. |

**Practical rule:** Campaign samples, message flow, privacy policy, and live opt-in forms must all show the **same** SMS sender number that Telnyx will actually use.

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

---

## TELNYX_FAILED fix (campaign `4b30019e-95d1-eb30-690a-a3dee103f3de`)

Telnyx rejected this campaign because consent and samples did not match the selected **2FA** use case, and HELP was missing from checkbox consent.

| Issue | Fix (deployed in repo) |
|-------|------------------------|
| **Missing HELP in opt-in consent** | All English opt-in forms now include **Reply HELP for help** |
| **2FA not covered in consent** | Consent mentions **one-time verification codes**; phone step has **Send verification code** button with separate 2FA consent |
| **Missing 2FA sample message** | Add the 2FA sample below when resubmitting in Telnyx |

### Resubmit in Telnyx (after deploy)

1. **Messaging → 10DLC → Campaigns** → edit or create new campaign for brand **C1KNTM6**.
2. **Use cases:** keep **2FA** + **Customer Care** (or your Mixed equivalent).
3. **Opt-in URL:** `https://www.mejorvidainsurance.com/en/sms-optin.html`
4. **Message flow:** paste block from [Message flow](#message-flow-paste-into-telnyx-message-flow--opt-in-description) above.
5. **Sample messages:** submit **all four** samples (three Customer Care + one 2FA verification code).
6. Reviewers: open `https://www.mejorvidainsurance.com/en/gastos-finales-ads-v2/?compliance-preview=phone` to see the verification step.
7. Wait for vetting (~1–7 business days, ~$15).

### After campaign approval

- OTP API (`/api/phone-verify`) currently sends via Twilio env vars; switch to Telnyx when the number is ported and Telnyx API keys are configured.
- `en/gastos-finales-ads-v2/` has phone OTP enabled (`MVI_LANDING_PHONE_OTP_ENABLED`).
