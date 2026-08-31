# Accendo Final Expense — cardiac underwriting (staff)

**Carrier RAG:** `aetna` (embed via `MASTER_AETNA_UW_AND_AGENT.md`; this file is the human index).

**Harvest:** 2026-08-30 from Aetna Senior Supplemental agent portal (`aetnaseniorproducts.com`) + **Quote & Enroll sandbox** (`aqetraining`). Nebraska zip 68104. Product: **Final Expense — Accendo Insurance Company**. Training banner: applications cannot be submitted.

**Audience:** Staff / Product Selector only. Do **not** paste Section A/B/C question text, the drug list, or Quote & Enroll decision logic onto public HTML or the consumer chatbot.

## What the product is (not a Transamerica class chart)

Accendo FE is **yes/no application routing** plus **Rx list** + Milliman IntelliScript. It does **not** publish Premier/Select by years since MI.

| Application answers | Result |
|---------------------|--------|
| Any **Section A** YES | **Not eligible** — do not complete or submit this Accendo application |
| Any **Section B** YES (and no Section A yes) | **Modified Plan** |
| Any **Section C** YES (and no A or B yes) | **Standard Level Plan** |
| All **no** in Sections A, B, and C | Eligible for **Preferred Level Plan** |

Super Preferred is a **price** tier (~10% below Preferred) when materials apply (recent Aetna-underwritten Med Supp), not a fourth health-question bucket.

## Cardiac questions (live AQE sandbox 2026-08-30, NE)

Verified on Plan Eligibility. Matches Accendo brochure sample app **ICC20-ACCFE05982** and NE brochure **ACCFE05984**.

**Section A (cannot issue)** includes:

- 6C. congestive heart failure, pulmonary fibrosis, any terminal condition or end-stage disease (ever diagnosed / treated / advised)
- 6D. un-operated heart defects (with other listed conditions)

**Section B (Modified)** — within the **past year**:

- 2A. angina (chest pain), heart attack, cardiomyopathy, or any type of heart or circulatory procedure or surgery
- 2B. stroke / TIA, aneurysm, or brain tumor

**Section C (Standard Level; all no A/B/C → Preferred)** — within the **past 2 years**:

- 1A. same heart wording as B.2A
- 1B. same stroke/TIA wording as B.2B

**Date logic (single factor, other questions no):**

| Event timing | Typical Accendo plan |
|--------------|----------------------|
| Less than 1 year | Modified |
| 1–2 years | Standard Level |
| More than 2 years | Can be Preferred Level |
| CHF **ever** | Not eligible on this Accendo application |

Stent, bypass, angioplasty, pacemaker, ICD implant: not named as their own rows. They fall under **heart or circulatory procedure or surgery** by date. ICD + CHF still hits Section A.

## Rx list (staff)

Full list: `MASTER_AETNA_DRUG_LIST.md`. CHF-labeled drugs (e.g. Entresto, Bidil, carvedilol/Coreg, Corlanor, loop diuretics for CHF) are typically **• • •** (Preferred, Standard, **and** Modified). Many angina drugs are **• •** (Preferred and Standard unacceptable; Modified may still be open). Questionnaire and Milliman can still decline after a “clean” yes/no path.

## Public-page rule

Consumer pages may say Accendo uses health questions (cannot issue / Modified / Standard Level / Preferred Level) plus a prescription check, with a **one-year** vs **two-year** vs **older** split for heart attack and heart procedures — not Transamerica’s Premier/Select chart. Do not dump Section A/B/C wording or the drug list. Do not invent a universal two-year wait for every company.
