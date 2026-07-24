# Transamerica FE Express Solution — Agent & Underwriting Guide

**Source:** [Transamerica FE Express Solution Agent Guide](https://cdn.bfldr.com/86JM1UOD/as/m7q69ngk78kw39p7w5923h/Transamerica_FE_Express_Solution_Agent_Guide)  
**Local PDF:** `source_pdfs/Transamerica_FE_Express_Solution_Agent_Guide.pdf` (28 pages)  
**Full text:** `source_pdfs/Transamerica_FE_Express_Solution_Agent_Guide.txt`  
**UW pages extract:** `source_pdfs/FE_Express_UW_charts_pages_9-17.txt`  
**Rates CSV:** `fe_express_rates.csv` (**1,436** rows)  
**Revision:** **3247945R11** ©2026  
**Extracted:** 2026-07-22  
**Agent use only**

## Products covered

| | FE Express Solution℠ | Graded FE Express Solution℠ |
|--|----------------------|------------------------------|
| Form | ICC23 TPWL14IC-0123 | ICC23 TPWL15IC-0123 |
| Type | Nonparticipating whole life | Nonparticipating whole life |
| Death benefit | Level from day 1 | Graded: first 2 years = **110% of premiums** (non-accidental); then full face |
| Issue ages | **18–85** | **18–80** |
| Face | Min **$5,000** (**$10,000** Premier); max **$100,000** ages 18–75 / **$25,000** ages 76–85 | Min **$5,000**; max **$25,000** all ages |
| Risk classes | Select NT/T + **Premier** (Premier not in CA) | Nontobacco / Tobacco |
| Owner | Insured = owner | Insured = owner |
| Premium period | Level to age **121** | Level to age **121** |
| Modal | Annual 1.000 · Monthly **0.0860** | Same |
| Policy fee | **$42 / year** | **$42 / year** |
| State exclusions | GU, NY, PR, VI | Same |
| Conversion | Not allowed | Not allowed |
| Citizenship | US citizen or green card not expiring within 90 days | Same |

Issuer: Transamerica Life Insurance Company, Cedar Rapids, IA. **Not available in New York.**

### Rate formula (FE Express)

1. Annual rate per $1,000 from band table × (face / 1000)  
2. \+ **$42** policy fee  
3. × modal factor (**0.0860** monthly) → round to nearest cent  

**Worked example (guide p.27):** Male 55, $15,000, Select Nonsmoker, monthly EFT  
`$57.63 × 15 + $42 = $906.45` → `× 0.0860 = $77.95/mo` ✅ matches CSV.

### Face bands (annual $ per $1,000)

| Band | Face amount |
|------|-------------|
| 1 | $5,000–$9,999 (Select NT/T only; no Premier column) |
| 2 | $10,000–$24,999 (Premier / Select NT / Select T) |
| 3 | $25,000–$49,999 (same classes; ages 76–85 max face $25k noted) |
| 4 | $50,000–$100,000 (through age **75** only in table) |

**CSV note:** Band 1 male Select Smoker ages **80** and **82** extracted as `24.34` / `15.64` — likely PDF text-extract errors; flagged `VERIFY_OCR_possible_error` in CSV. Visually verify those two cells before quoting.

**Gap:** This R11 guide’s published **rate charts are for FE Express** (Premier/Select). A separate full **Graded FE Express** rate-per-thousand table was **not** found as its own chart in this PDF extract — Graded UW classes are Nontobacco/Tobacco. Confirm Graded premiums via live quoter / next toolkit PDF if needed.

---

## Underwriting (summary)

- **100% digital / instant** decision; **never referred** to an underwriter (per guide).  
- Application valid **60 days**.  
- Data: personal history + diagnostic/Rx (Milliman etc.). Client can request health data from Milliman: FCRAReport@milliman.com · 877-211-4816.  
- Does **not stack** nonrelated medical conditions for best rate.  
- Class logic (p.9): Premier / Select / Graded / Decline rules; comorbidity = interacting conditions (e.g. tobacco + O2).  
- Full **adult single-condition decision chart**, **cancer decision chart**, **Rx that preclude coverage**, and **adult build/BMI chart** are ingested in `FE_EXPRESS_UNDERWRITING_CHARTS.md` (RAG).

---

## Riders (subject to state availability)

FE Express may include Concierge Planning, ADB w/ Nursing Home (not CA/FL), FL-only ADB, CA-only Terminal Illness ADB. Graded: Concierge Planning primarily. See `RIDER_STATE_AVAILABILITY.md` for NE/KS/CO/NV.

---

## Files for database / RAG ingest

1. This markdown (product + rules)  
2. `fe_express_rates.csv` — band rates for quoting engine / RAG  
3. Full guide TXT + UW chart pages for chatbot retrieval  

## Source URL

https://cdn.bfldr.com/86JM1UOD/as/m7q69ngk78kw39p7w5923h/Transamerica_FE_Express_Solution_Agent_Guide
