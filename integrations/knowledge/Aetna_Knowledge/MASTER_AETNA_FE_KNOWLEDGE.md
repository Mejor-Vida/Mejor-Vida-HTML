**Full life inventory:** [`LIFE_PRODUCTS.md`](./LIFE_PRODUCTS.md) (Accendo + CLI Protection Series FE).  
**Underwriting & agent ops:** [`MASTER_AETNA_UW_AND_AGENT.md`](./MASTER_AETNA_UW_AND_AGENT.md).  
**Drug list (staff only):** [`MASTER_AETNA_DRUG_LIST.md`](./MASTER_AETNA_DRUG_LIST.md).

# Aetna / Accendo — MASTER knowledge (agent / RAG)

**Portal:** Aetna Senior Supplemental Insurance  
**FE underwriter (Accendo):** Accendo Insurance Company · NAIC #63444  
**Also FE on portal:** Protection Series℠ Final Expense · Continental Life (CLI)  
**Portal catalog re-verified:** 2026-08-09 via MVI Agent Bridge (`raw/harvest-20260809/`)

## What Julie sells under “Aetna” for Mejor Vida FE

**In scope (all portal life insurance):**  
1. **Accendo Final Expense** whole life — Level / Modified (Accendo Insurance Company).  
2. **Protection Series℠ Final Expense** whole life — Level (Continental Life / CLI).  

**Out of scope for FE site:** Medicare Supplement, cancer/heart/stroke indemnity, hospital indemnity, dental/vision/hearing, home care / recovery care products (not life).

## Accendo Final Expense — facts

| Item | Detail |
|------|--------|
| Type | Individual whole life (simplified issue) |
| Issue ages | Level 40–89; Modified 40–75 (age last birthday) |
| Face amounts | Level min $2,000; max $50k / $40k / $30k / $25k by age band 40–55 / 56–65 / 66–75 / 76–89. Modified $2,000–$25,000 |
| Exam | None |
| UW | Health questions; Quote & Enroll uses Milliman IntelliScript Rx/claims → Approved / Declined / Additional Review (Real-Time Decision questions). Also MIB + Rx database review through issue/first premium. |
| Level DB | Full face from issue (accident or natural) |
| Modified DB | Accidental full immediately; non-accidental yrs 1–2 = 110% earned premium; yr 3+ full face |
| Fee | $40 annual policy fee |
| Rate classes | Male/female, tobacco/non-tobacco; Preferred / Standard (and Super Preferred when materials apply — typically 10% below Preferred) |
| Riders (Level) | Accelerated DB (up to 50%, caps/fees apply); Accidental death (issue ages 40–70); Child/grandchild term ($2,500 units up to $10,000/child typical) |
| Billing notes | Social Security payment-date option mentioned in FE training materials; producer guide notes Direct Pay after issue is **not** available for Final Expense |

## Protection Series℠ Final Expense (CLI) — facts

| Item | Detail |
|------|--------|
| Type | Individual whole life (Protection Series℠ / Aetna-branded) |
| Underwriter | Continental Life Insurance Company of Brentwood, Tennessee (CLI) |
| Issue ages | **45–89** |
| Plans | **Level** only (flyer does not list Modified) |
| Face amounts | **$2,000–$50,000** (max by age at issue) |
| Exam | None (simplified issue per product materials) |
| Riders | Accidental death; Children’s term (flyer does **not** list Accelerated DB) |
| Rate / billing | Super Preferred available; billing can match Social Security deposit date |
| Cash value | ACV chart `CLIFE07472_CASH_VALUE_FNLEX_120221` |
| Julie states | NE, KS, CO, NV — Yes (CGFLP01577, eff. 05-11-26) |

## App plan routing (Accendo AQE 2026-08-30 + brochure ACCFE05984)

- Section A yes → **not eligible** (do not submit). Includes **CHF ever**.  
- Section B yes → **Modified**. Includes heart attack / angina / cardiomyopathy / heart or circulatory surgery **in the past year**.  
- Section C yes → **Standard Level**. Includes the same heart items **in the past 2 years**.  
- All no A/B/C → **Preferred Level**  
- Rx list + Milliman can still change the decision. Staff wording: `MASTER_AETNA_UW_AND_AGENT.md`.  

## Company lineup (producer guide)

Entities: AHLIC, AHIC, ALIC, ACI, CLI, Accendo.  
Aetna-branded Protection Series includes CLI Final Expense whole life.  
CVS-branded Final Expense whole life = Accendo.

## Sources

Prefer `raw/pdfs/*.txt` extracts, [`LIFE_PRODUCTS.md`](./LIFE_PRODUCTS.md), and [`MASTER_AETNA_UW_AND_AGENT.md`](./MASTER_AETNA_UW_AND_AGENT.md). FP manuals are **not** for public republication — summarize only on consumer pages.
