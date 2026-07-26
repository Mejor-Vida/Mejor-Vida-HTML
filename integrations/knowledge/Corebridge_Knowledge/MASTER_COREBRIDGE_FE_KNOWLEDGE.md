# Corebridge Financial — Final Expense Internal Knowledge
## For Julie / RAG (Connext harvest)

**Issuer:** American General Life Insurance Company (AGL), Houston, TX  
**Agent:** Julie Braunsroth (Connext session 2026-07-26)  
**Scope:** Life products Julie sells — **FE (SIWL/GIWL)**, **Term**, **GUL**, **Whole Life**.  
**Out of scope:** **IUL** and **annuities** / other financial accumulation products (Julie does not sell these).  
**Restriction:** Source PDFs are **FP-only / not for public distribution**. Use for agent Q&A and quoting guidance; do **not** republish full UW tables or rate sheets on marketing pages.

**Primary sources (`raw/pdfs/`):**
| Doc | Form | File |
|-----|------|------|
| SIWL Producer Guide | AGLC201192 REV0525 | `AGLC201192-SIWL-Producer-Guide.pdf` |
| SIWL Underwriting Guide | AGLC201453 REV0424 | `AGLC201453-SIWL-UW-Guide.pdf` |
| GIWL Producer Guide | AGLC200472 REV0925 | `AGLC200472-GIWL-Producer-Guide.pdf` |
| GIWL Rates | AGLC200471 REV1224 (premiums as of 12/07/2024) | `AGLC200471-GIWL-Rates.pdf` |
| Life Field UW Guide | AGLC101638 REV0226 | `AGLC101638-Field-Underwriting-Guide.pdf` (general term/perm; not SIWL-specific) |

---

## Product map (how to choose)

| Need | Product | Notes |
|------|---------|--------|
| Health Qs OK; want full DB day 1 | **SimpliNow Legacy Max (Level)** | Instant UW; higher faces than GIWL |
| Health Qs → graded path | **SimpliNow Legacy (Graded)** | Instant UW; 2-yr limited DB |
| No health Qs / declined SIWL DB search / SIWL Decline | **GIWL** | Guaranteed acceptance; always graded 2 yrs |

**Critical UW routing examples (AGLC201453):** COPD + tobacco user → **Decline** SIWL (do **not** offer Level/Graded) — consider **GIWL**. Alzheimer’s/Dementia ever → **Decline** SIWL. COPD not hospitalized 24 mo, **non-tobacco** → may be **Graded**. Always verify the condition table; combinations can worsen outcomes.

Fallback language from SIWL producer guide: if applicant cannot validate via database search for Level/Graded, **GIWL may be an option**.

---

## 1) SimpliNow Legacy® — SIWL (Simplified Issue Whole Life)

### Basics
- **Issue ages:** 50–80 **ALB** (age last birthday)
- **Face:** $5,000–$35,000 overall; max depends on Level vs Graded and age/tobacco (see chart)
- **Premiums:** Level; guaranteed not to increase; may exceed face over time
- **Limited-pay:** Built-in; premiums stop at **Maximum Payment Age** (varies by age/sex/tobacco/face); coverage remains to maturity
- **Maturity / endow:** Age **100**
- **Process:** 100% instant UW decisions via Connext eApp (knock-outs → eligibility Qs → real-time DB/HIPAA validation → issue in minutes)
- **Not NY;** not for foreign nationals; unisex rates MT only
- **Policy forms:** ICC21-21445 / 21445, ICC21-21447 / 21447 (riders ICC21-21468/69/70 series)

### Two designs

| | **SimpliNow Legacy Max (Level)** | **SimpliNow Legacy (Graded)** |
|--|----------------------------------|-------------------------------|
| Death benefit | 100% face all years (less loans/unpaid premium) | Yrs 1–2: **110% of premiums paid**; Yr 3+: face. **Accidental death in yrs 1–2 pays face** |
| Annual policy fee | **$36** | **$12** |
| Free look | **10 days** | **30 days** |
| Living benefit / ADB riders | Terminal Illness ABR, Nursing Home ABR (no extra charge; fee if activated); optional Accidental Death Rider ages **50–75** | Graded has built-in accidental face in first 2 years; ABR riders described as Level Max only in producer guide |

### Face amount limits (producer guide)

| Issue age | Graded (Legacy) | Level Max |
|-----------|-----------------|-----------|
| 50–60 | $5,000–$25,000 | $5,000–$25,000 |
| 61–70 | $5,000–$25,000 | $5,000–$30,000 |
| 71–80 non-smoker | $5,000–$25,000 | $5,000–$35,000 |
| 71–80 smoker | $5,000–$25,000 | **N/A** |

**Aggregate max (existing GIWL + SIWL + new):**
- Level approved: **$35K** total
- Graded SIWL approved: **$25K** total
- Applying GIWL: **$25K** total

### Application flow (5 steps)
1. Connext → new app / policy number  
2. Validate agent eligibility; gather client info  
3. UW: coverage amount → knock-out Qs (any Yes = deny) → eligibility Qs (all No may get Level; else Graded) → UW auth + HIPAA → real-time DB validation (fail = decline; consider GIWL)  
4. Payment + e-sign  
5. Issue / email delivery within minutes  

### Payment / ops
- Credit card, bank draft, Social Security debit (**Direct Express**); initial vs recurring can differ; payor ≠ insured OK  
- Insured must be owner; SSN required  
- No face increase/decrease after issue; no exchange/conversion  
- Policy loans allowed; **8%** interest in arrears  
- Grace: **31 days** (CA **60**)  
- Replacements: allowed on **Level Max** only (per producer guide)  
- Chargebacks: no CB on earned commissions for lapse/surrender/death; **100% CB on unearned**  

### Build chart
Height/weight grids for Graded vs Max are in `AGLC201192` / `AGLC201453` extracts (same build table). Outside build → not Level Max / may be Graded or decline per UW rules.

### Underwriting (AGLC201453)
Instant decision = **Level**, **Graded**, or **Decline** by condition + timeframe. Combinations can worsen the listed outcome. Full condition table is in `raw/pdfs/AGLC201453-SIWL-UW-Guide.txt` — use that file for condition-level RAG; do not invent outcomes.

**Examples (illustrative only — verify in guide):**
- Alzheimer’s/Dementia ever → Decline  
- Parkinson’s / MS ever → Graded  
- Stroke last 12 mo → Decline; last 24 mo → Graded  
- COPD + tobacco → Decline; COPD not hospitalized 24 mo, non-tobacco → Graded  
- Currently nursing home / hospice / oxygen (non–sleep apnea) / wheelchair for debilitating condition → Decline  
- Rx red flags (e.g. Entresto/BiDil heart failure, many PAH drugs) → Decline per Rx table in guide  

Also includes a **brand/generic Rx decision table** (pages ~9–11 of UW guide).

---

## 2) Guaranteed Issue Whole Life (GIWL)

### Basics
- **Issue ages:** 50–80 ALB  
- **Face:** $5,000–$25,000  
- **No health questions, no medical tests;** acceptance guaranteed for eligible ages/faces  
- **Premiums:** Level; guaranteed not to increase; stop at/before age **90** (limited-pay schedule by age/sex/face — see producer guide)  
- **Annual policy fee:** **$24** (included in published monthly premiums)  
- **Free look:** 30 days  
- **Not NY & ME;** not foreign nationals; unisex MT only  
- **Aggregate:** All AGL GIWL on one person ≤ **$25,000**; **one GIWL policy per insured per 12 months**  
- **No replacement/conversion into GIWL**  
- Policy forms: ICC21-20532 Rev0621 / 20532 Rev0621 (riders ICC23-23200/15200, ICC23-23201/15201)

### Graded death benefit
- Years 1–2: **110% of premiums paid**  
- Year 3+: full face  
- Accidental death: full face (with listed exclusions)  
- Suicide: premiums refunded (contractual period)

### Living benefits (no additional premium; state variations)
- **Chronic Illness ABR:** return of premiums paid, up to **25% of face**; 2 of 6 ADLs or severe cognitive impairment; no waiting period; not in CA/DC  
- **Terminal Illness ABR:** **50%** of applicable DB if death expected in **24 months** or less (physician certified); admin fee at claim ($250; FL $100); not in CA  

### Payments
ACH, Social Security debit card, credit card; delayed billing / specify date available.

### Rates
Full monthly premium table (M/F, ages 50–80, faces $5K–$25K) as of **12/07/2024** is in `AGLC200471-GIWL-Rates.txt`. Example age 50 / $10,000: Male **$60.85**, Female **$41.88** (includes $24 annual policy fee in monthly figures). Always re-quote in Connext / SimpliNow Quoter for live rates.

### Commission chargebacks (GIWL)
- Death: Year 1 **100%**, Year 2 **50%** of earned  
- No CB on earned for lapse / surrender / RPU  

---

## Quoters / portals

- Combined FE quoter: https://rapid-rater.live.web.corebridgefinancial.com/Simplinowquoter  
- Connext SIWL product: `/life/connext-portal/app/home/products/simplified-issue-life`  
- Connext GIWL product: `/life/connext-portal/app/home/products/guaranteedissue-whole-life`  
- SIWL/GIWL UW hub: `/life/connext-portal/app/home/underwriting/siwl`  
- Marketing hubs: `corebridgefinancial.com/life/siwl` · `/life/giwl` · `/life/finalexpense`

---

## Agent talking points (internal)

1. **One carrier, two FE paths:** SIWL for clients who can answer health Qs (Level Max when clean; Graded when mild impairments); GIWL when they can’t / won’t / fail SIWL validation.  
2. **Instant SIWL decisions** — no underwriter back-and-forth when DB validates.  
3. **Both products** use graded 110% of premium in years 1–2 when on the graded design; Level Max pays face from day one.  
4. **Always disclose** premiums may exceed face; limited-pay ages; state/rider limits.  
5. **Quote live** — published GIWL sheet is as of 12/07/2024; SIWL premiums via quoter.

---

## State-specific
See **`STATE_AVAILABILITY.md`** (Julie focus NE/KS/CO/NV + known exclusions).  
Note: AGLC110190 general life state sheet does **not** list SIWL/GIWL — FE exclusions come from producer guides; confirm each new state in the quoter.

## Still open
- Harvest **Term / GUL / Whole Life** (in scope) — skip IUL and annuities.  
- Free Look & Grace by Product PDF + any FE-specific state/rider matrix if published.  
- Public carrier page for Corebridge: only after approved consumer-safe blurbs (no FP-only tables).
