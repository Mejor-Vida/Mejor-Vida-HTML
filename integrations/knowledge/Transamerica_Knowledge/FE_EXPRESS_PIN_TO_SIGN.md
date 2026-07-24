# Transamerica FE Express — PIN to Sign / remote signature ops

**Extracted:** 2026-07-22  
**Products:** Transamerica FE Express Solution℠ (remote / PIN signing)

## Sources

| Asset | URL | Local | Notes |
|-------|-----|-------|-------|
| PIN to Sign FAQs (PDF) | https://cdn.bfldr.com/86JM1UOD/as/b4r5qjnb9k4mk9x6ssmg3ks3/Transamerica_FE_Express_PIN_to_Sign_FAQs | `source_pdfs/Transamerica_FE_Express_PIN_to_Sign_FAQs.pdf` | Rev **4796960 09/25** — full text below |
| PIN to Sign training video (MP4) | https://cdn.bfldr.com/86JM1UOD/as/6g8v9t3qjn8mbvtfbkvc2g2s/Pin_to_Sign_-_FE_Express_Training_Video | *not stored* (~28MB) | Agent training video; URL only |
| Brokerage FE Express National Launch Webinar 9/19/24 | https://cdn.bfldr.com/86JM1UOD/as/n6sccfkpwpp3qnm5pptfwv/Transamerica_Brokerage_FE_Express_National_Launch_Webinar_91924 | *not stored* (large media) | Launch webinar; URL only |
| Related: Remote signature flyer | see `FE_EXPRESS_SIGNATURE_PROCESS.md` | | Client walkthrough (text link → DOB + last 4 SSN → sign) |

---

## PIN to Sign FAQs — extracted content (agent use only)

### Overview — Socure contact validation

When clients use **PIN to Sign**, **Socure** (third-party) verifies each **phone number and email** belong to the applicant. Goal: reduce fraud and bad contact data.

- If verified → PIN to Sign continues normally.  
- If issues detected → prompt to **re-verify** contact info.

**Most common failure:** policy owner’s phone/email was **not** used. Always use the **policy owner’s** phone and email before submit.

Agent is prompted to re-enter phone or email (e.g. fix typo).  
**If invalid info is provided 3 times**, the applicant may be **blocked** and must contact **Customer Experience (CX)**.

### If applicant is blocked

- Agents call **CX: 800-476-0198**  
- CX may validate with a second tool and/or request documentation  
- If CX cannot resolve phone/email → application may need to be **canceled and re-applied** using the **other signing method**  
- Applicant may also be blocked outright after too many failed retries (ineligible screen)

### FAQ answers (from PDF)

**What is Socure?**  
Identity verification during PIN to Sign. Compares phone/email to consumer data to flag fraudulent or incorrect entries. Invalid/risky data → retry prompt or block.

**Why flag/block a phone or email?**  
Most common: number doesn’t belong to the **policy owner**. Also:
- Temporary / newly established phone numbers  
- Invalid or disposable email domains  
- Typos / misspellings  
- Toll-free numbers, unlinked numbers, or numbers tied to suspicious IPs (proxy/TOR)  
- Contact details from **OFAC-sanctioned** countries  

**What if blocked?**  
Message that verification failed. Call CX **800-476-0198**. CX may override or request docs (e.g. recent phone bill). Else cancel/re-apply with other signing method.

**Documentation for overrides?**  
- Phone: recent **phone bill** with applicant name + number (sometimes)  
- Email: no extra docs; CX uses second validation tool  

**False positives?**  
Contact CX to dispute; if confirmed accurate, CX can override.

**How many retries?**  
**3** chances to enter a new/corrected phone or email. Then fully blocked online. Tip: if phone fails, try email (and vice versa).

**Can client use spouse’s contact info?**  
**No** — use policy owner’s own phone/email. Spouse/third-party info can trigger high-risk codes / blocks.

**Can typos cause a block?**  
**Yes** — double-check digits and spelling.

**Who to call?**  
CX **800-476-0198** for overrides / false-positive review.

---

## RAG use

- Good for agent chatbot: “client blocked on PIN to Sign,” “Socure,” “can we use spouse’s phone,” CX number.  
- **Not** product rates / underwriting.  
- Pair with remote signature flyer steps in `FE_EXPRESS_SIGNATURE_PROCESS.md`.

## Media not ingested as text

Training video + launch webinar kept as **URL references only** (too large for repo; no transcript extracted this session). Ask later if a transcript is needed.
