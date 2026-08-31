# Aetna / Accendo — Underwriting & agent operations (staff RAG)

**Carrier label for RAG:** Aetna (Accendo FE + Protection Series FE / CLI)  
**Portal:** Aetna Senior Supplemental Insurance — `aetnaseniorproducts.com` (agent login)  
**Audience:** Staff assistant / agents only. Do **not** paste FP manuals, drug lists, commission guides, or Quote & Enroll decision logic onto public pages or the consumer chatbot.  
**Portal re-check:** 2026-08-30 (MVI Agent Bridge — Accendo FE cardiac via Quote & Enroll **sandbox** `aqetraining`, NE). Prior catalog harvest 2026-08-09 (`raw/harvest-20260809/`). Reference Material still lists Producer guide, Product overview, Drug List, Underwriting FAQ, Accendo FE Sales Handbook, Accendo FE drug list. Forms & Documents: Accendo FE ACV chart + CLI FE ACV chart (no paper Accendo app in Forms; health questions live in AQE). NE brochure cited in AQE: **ACCFE05984**.

## Julie scope reminder

Life products Julie sells under Aetna Senior Supplemental for Mejor Vida FE:

1. **Accendo Final Expense** — Accendo Insurance Company (ACC), NAIC **#63444**
2. **Protection Series℠ Final Expense** — Continental Life of Brentwood, TN (**CLI**)

Not life for FE quoting: Medicare Supplement, Cancer/Heart/Stroke Plus, Hospital Indemnity Flex, Home Care, Recovery Care, Dental/Vision/Hearing.

Julie states with Accendo FE + PS FE available (chart CGFLP01577, eff. 05-11-26): **NE, KS, CO, NV**.

## Quote & Enroll automated underwriting (UW FAQ CGFMP06547)

Source: *Automated underwriting and decisions* FAQ (portal Reference → Underwriting FAQ’s).

- Underwriting **guidelines themselves were not changed** by automation (FAQ stance).
- Apps via **Aetna Quote & Enroll** get an automated decision within about **2 minutes**: **Approved**, **Declined**, or **Additional Review** (FAQ also says “review”).
- Over **66%** of submitted apps get automated Approved or Declined.
- **Additional Review** = Rx and/or medical claims history conflicts with guidelines. Agent should use **Real-Time Decision**: ask the listed questions of the applicant (replaces prior phone interview), answer completely/accurately, then Submit for a decision.
- **Milliman IntelliScript** supplies Rx/claims data + rules engine; **Aetna/Accendo make the UW decisions** and maintain guidelines with Milliman.
- Declined applicants receive a letter with dispute steps; they can request Milliman **Consumer Report** (Rx + claims). Corrections go through Milliman. Consumer Report does **not** list which UW rules caused the decline.
- Milliman Consumer Report request: `www.rxhistories.com/contact/#report` (preferred) or phone **877-211-4816** (listen to the full recording — do not hang up early). Email: fcrareport@milliman.com. Address: P.O. Box 2223, Brookfield, WI 53008.
- Accendo UW cannot reopen an automated decline without the applicant’s **updated** Milliman Consumer Report.

## Accendo Final Expense underwriting (Sales Handbook)

Source: Accendo FE Administrative Sales Handbook (agent only).

- FE apps stay subject to underwriting **until the policy is issued and first premium is paid**. A declinable condition found in that window → decline.
- All apps: **prescription drug database review** + **MIB review**.
- Ask health questions **as written**; record answers as given. A “Yes” may move the applicant to another plan level rather than fully disqualify — if a Yes fully disqualifies, **do not submit**.
- Refer to the **Accendo FE drug list** for unacceptable medications (Preferred / Standard / Modified columns). If Preferred is blocked, check Standard or Modified.
- Dual-purpose medications: record the condition treated (paper app Section 6 comments / electronic equivalent).
- Electronic app color codes at end of process: **Green** = approved · **Yellow** = referred to underwriter · **Red** = not eligible.
- Required with submission: all app pages, **HIPAA**, replacement form if applicable, state-required forms.
- Power of Attorney signatures are **not** acceptable.
- Paper FE: submit within **15 days** from pre-approval date (handbook note). General paper apps within 30 days of signature; fax 1-877-380-2777 or mail Accendo Life Insurance Company, P.O. Box 14399, Lexington, KY 40512.
- Agent must have Accendo welcome notice + writing number before taking/submitting apps.
- Age = **age last birthday** at effective date.

### Super Preferred (10% below Preferred)

- Handbook: to qualify for Super Preferred, note qualifying **Aetna-underwritten Medicare Supplement** policy number in Remarks, or “NA” if not available.
- Accendo/Aetna Med Supp must have been underwritten in the **last 180 days** to qualify when used for Super Preferred.
- If Remarks blank and quoted premium ≠ system rate, UW may search for active Med Supp and adjust rate class.
- Webinar materials also market Super Preferred as **10% lower than Preferred** for qualifying applicants.

### Payments / billing (agent)

- EFT preferred; bank owner must sign if not the applicant.
- Premiums may draft to match **Social Security** deposit schedule (not SSI-only oddities — SSI needs draft date before the 29th).
- **Credit/debit cards not accepted** (including Social Security Direct Express debit card).
- Direct bill: quarterly / semi-annual / annual only; no commissions/claims until initial payment received.
- Bill date cannot be 29th–31st; subsequent bill date generally ≤15 days after effective date or system may draft twice first month.
- Producer guide note (MASTER): **Direct Pay after issue is not available for Final Expense**.

### Reasons applications may close (handbook highlights)

Incorrect/missing docs or contact info; someone other than applicant answers/signs; applicant unaware of application; no consent to Rx check / clarifying interview incomplete; third-party check without family/business relationship; app received >30 days after signature; not a legal U.S. resident; multiple non-forfeiture options selected incorrectly.

Agent Services: **866-272-6630**.

## Accendo product UW / plan facts (quick agent card)

| Item | Detail |
|------|--------|
| Type | Simplified-issue whole life; **no exam** |
| Level ages / faces | 40–89; max $50k / $40k / $30k / $25k by bands 40–55 / 56–65 / 66–75 / 76–89; min $2,000 |
| Modified ages / faces | 40–75; $2,000–$25,000 |
| Level DB | Full face from issue (accident or natural) |
| Modified DB | Accidental full immediately; non-accidental yrs 1–2 = **110% earned premium**; yr 3+ full face |
| Policy fee | **$40** annual |
| Level riders | Accelerated DB (up to 50%, caps/fees); Accidental death (issue 40–70); Child/grandchild term ($2,500 units up to $10,000/child typical) |
| App routing (AQE 2026-08-30 + brochure) | Section A yes → not eligible; Section B yes → Modified; Section C yes → Standard Level; all no A/B/C → Preferred Level |

## Accendo FE — cardiac (staff)

**Harvest:** 2026-08-30. Aetna Quote & Enroll **sandbox** (training; cannot submit), Nebraska, Accendo Final Expense Plan Eligibility. Matches brochure sample **ICC20-ACCFE05982** and NE brochure **ACCFE05984**. Human index: `ACCENDO_CARDIAC_UW.md`.

Accendo does **not** publish a Transamerica-style Premier/Select chart by years since MI. Routing is **yes/no application sections** plus **Rx list** + Milliman.

### Live Section wording (staff only — not for public HTML)

**Section A —** If you answer “yes” in section A, you are not eligible. You will not be able to complete or submit this application.

Cardiac-relevant A items:

- 6C. Have you ever been diagnosed with, received or been advised to receive treatment or medication for **congestive heart failure**, pulmonary fibrosis, any terminal condition or end-stage disease?
- 6D. … or **un-operated heart defects** (with cerebral palsy, cystic fibrosis, muscular dystrophy)

**Section B —** If any “yes” answers in section B, you are eligible for **Modified Plan**.

- 2. **Within the past year** have you been diagnosed with, received or been advised to receive treatment for:
  - A. **angina (chest pain), heart attack, cardiomyopathy, or any type of heart or circulatory procedure or surgery?**
  - B. stroke or TIA, aneurysm or brain tumor?

**Section C —** appears after A and B are all No and **Check eligibility**. If any “yes” in section C → **Standard Level Plan**. If all “no” in A, B, and C → **Preferred Level Plan**.

- 1. **Within the past 2 years** have you been diagnosed with, received or been advised to receive treatment for:
  - A. **angina (chest pain), heart attack, cardiomyopathy, or any type of heart or circulatory procedure or surgery?**
  - B. stroke or TIA, aneurysm or brain tumor?

### Date logic (other questions no)

| Timing of heart attack / angina / cardiomyopathy / heart or circulatory surgery | Typical Accendo plan |
|-----------------------------------------------------------------------------|----------------------|
| Less than 1 year | Modified |
| 1–2 years | Standard Level |
| More than 2 years | Can be Preferred Level |
| CHF ever (Section A 6C) | Not eligible on this Accendo application |

Stent, bypass, angioplasty, pacemaker, ICD: **not separate rows**. They are **heart or circulatory procedure or surgery** by date. CHF + device still hits Section A.

### Heart-failure medicines

Many CHF drugs are • on Preferred **and** Standard **and** Modified (full list in `MASTER_AETNA_DRUG_LIST.md`). Examples: **Entresto**, **Bidil**, **Coreg** / carvedilol, **Corlanor**, loop diuretics used for CHF. A • in all three columns means do not submit that Accendo plan for that listed condition — GIWL may still be open if age/amount fit. Many **angina** drugs are • • (Preferred and Standard blocked; Modified may still be open).

Questionnaire answers do **not** override Milliman / Rx / MIB. Green / yellow / red at the end of the e-app still apply.

**Public pages:** may say Accendo uses health questions (cannot issue / Modified / Standard Level / Preferred) plus a prescription check, with a one-year vs two-year vs older split for heart attack and heart procedures. Do **not** dump Section A/B/C text or the drug list. Do **not** copy FE Express Premier/Select onto Accendo.

---

## Protection Series FE (CLI) — agent card

| Item | Detail |
|------|--------|
| Underwriter | Continental Life Insurance Company of Brentwood, Tennessee (CLI) |
| Ages | **45–89** |
| Plans | **Level** only (flyer does not list Modified) |
| Faces | $2,000–$50,000 (max by age) |
| Riders (flyer) | Accidental death; Children’s term (no Accelerated DB listed on flyer) |
| Super Preferred | Available per product materials |
| Billing | Can match Social Security deposit date |
| ACV chart | `CLIFE07472_CASH_VALUE_FNLEX_120221` |

## Accendo drug list — agent rules (full list in separate MASTER)

- List of commonly prescribed meds for **declinable** conditions; updated extract **6/25/20**.
- “•” = unacceptable for that plan column (Preferred / Standard / Modified) for the listed condition, or any condition if none listed.
- Brand names capitalized; generics lowercase.
- New drugs appear often — contact UW if unsure.
- **Staff RAG** holds the full list under `MASTER_AETNA_DRUG_LIST.md`. Never dump the full list to consumers.

## Portal locations (life)

| Area | Life-related |
|------|----------------|
| Reference Material | Producer guide, Product overview, UW FAQ, Accendo Sales Handbook, Accendo drug list, ACC & PS CLI commission statement guide, About Us |
| Forms & Documents | Accendo FE ACV chart, CLI FE ACV chart, Accendo change of beneficiary, policy loan / EFT forms |
| Drug List page | Portal drug list tool |
| Product Availability | Accendo FE + PS FE by state (`CGFLP01577`) |
| Flyers & Ads / webinars | Consumer + agent FE marketing (Accendo + Protection Series) |

## Public vs staff split

| Topic | Staff assistant | Public chatbot |
|-------|-----------------|----------------|
| Ages, faces, Level vs Modified overview | Yes | Yes (consumer language) |
| Milliman / Real-Time Decision / decline dispute | Yes | High-level only: “no exam; health questions + review; Julie helps” |
| Full drug list / Preferred·Standard·Modified knockouts | Yes | **No** |
| Commission statement guide | Yes | **No** |
| Super Preferred Med Supp linkage (180-day) | Yes | Soft: “preferred pricing may be available if you qualify” |
| Agent Services phone / fax / mail | Yes | Prefer Julie / Mejor Vida contact paths publicly |
