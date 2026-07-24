# Transamerica Final Expense Solutions Portfolio — Agent Rate & Underwriting Guide

**Source:** [Final Expense Agent Guide with New Underwriting Experience](https://cdn.bfldr.com/86JM1UOD/as/v4fxfsf795f87m5mffm77/Final_Expense_Agent_Guide_with_New_Underwriting_Experience)  
**Local PDF:** `source_pdfs/Final_Expense_Agent_Guide_with_New_Underwriting_Experience.pdf` (~3.7 MB, 28 pages)  
**Full text:** `source_pdfs/Final_Expense_Agent_Guide_with_New_Underwriting_Experience.txt`  
**UW extract:** `source_pdfs/FE_Portfolio_UW_charts_pages_8-17.txt`  
**Rates CSV:** `fe_portfolio_rates.csv` (**1,411** rows)  
**Revision:** **2644970R5** · **12/23** · ©2023  
**Extracted:** 2026-07-22  
**Audience:** **For Agent Use Only. Not for Public Distribution.**

## Scope (important)

**Portfolio FE** — Immediate Solution, 10-Pay Solution, Easy Solution (forms **TPWL10IC-0818** / **TPWL10-0818** family).  

**Not** FE Express / Graded FE Express (`FE_EXPRESS_AGENT_GUIDE.md` / `fe_express_rates.csv`). Use Comparison Flyer for product fit.

---

## Products at-a-glance (p.5)

| | Immediate Solution | 10-Pay Solution | Easy Solution |
|--|--------------------|-----------------|---------------|
| Premium period | Level to age **121** | Level for **10 years** | Level to age **121** |
| Issue ages (ALB) | **0–85** | **0–85** | **18–80** |
| Face min | **$1,000** | **$1,000** | **$1,000** |
| Face max | 0–55 **$50k** · 56–65 **$40k** · 66–75 **$30k** · 76–85 **$25k** | Same | **$25,000** |
| Death benefit | Full face day one | Full face day one | Graded 2 yrs: accidental = face; else **110% of premiums** − loans; then full face |
| Maturity | Age 121 | Age 121 | Age 121 |
| Policy loans | Variable ≤ **8%** | Same | Same |
| Included ADB riders | ADB+NH² · ADB (FL)³ · Terminal Illness (CA)⁴ | Same | **None** |
| Optional riders (extra cost) | **ADR** · **CGR** | None | None |

² ADB+NH not CA/FL · ³ ADB Florida only · ⁴ Terminal Illness CA only  

Issuers: Transamerica Life (non-NY) or Transamerica Financial Life (NY). Not GI; UW may request exams/data.

---

## Process / UW ops (p.4, 8)

- **iGO® e-App** (iPipeline) → digitally enabled UW → email decision  
- App valid **90 days**; cases close after **45 days** if outstanding requirements (can reopen if reqs arrive within 90)  
- Electronic medical data via Milliman etc.; client FCRA: FCRAReport@milliman.com · 877-211-4816  
- Insurable interest required  

### Activity Credit (p.9 — adults 18+)

- Activity ≥ **3 days/week**, ≥ **10 consecutive minutes** each  
- Can improve Standard → Preferred in defined scenarios (e.g. COPD/stroke/hospitalization + Preferred build; or build-only risk)  

### Class logic (p.10+)

Preferred / Standard / Graded / Decline from medical + lifestyle + build. Full **Adult Single Condition Decision Chart**, cancer, Rx, and build charts are ingested in `FE_PORTFOLIO_UNDERWRITING_CHARTS.md` (RAG). See also `FE_PORTFOLIO_ENHANCEMENTS_FLYER.md` for 2023 class improvements summary.

---

## Optional riders (Immediate only)

**ADR (p.7, rates p.23):** ages **18–70**; death within **90 days** of accident; amount = base face; annual $/1000 in CSV as `ADR Rider`.  

**CGR (p.7):** **$2.00** annual per unit ($1,000) per child; parent/GP **18–75**; child **15 days–18**; max **9** children; face $1,000–min(base, $5,000); same face all kids; terminates rider anniversary after age **25**; conversion rules apply.

---

## Rate formula (p.27)

| Mode | Policy fee &lt; $5,000 face | Policy fee ≥ $5,000 | Modal factor |
|------|----------------------------|---------------------|--------------|
| Annual | **$60.00** | **$42.00** | **1.00** |
| Semiannual | N/A | N/A | **0.51** |
| Quarterly | N/A | N/A | **0.2575** |
| EFT monthly | N/A | N/A | **0.086** |

1. Annual rate/$1,000 × units  
2. \+ policy fee  
3. × modal factor → round nearest cent  

**Worked example (guide):** Male 55, Immediate, Preferred Nontobacco, $15,000, monthly EFT  
`$37.38 × 15 + $42 = $602.70` → `× 0.086 = $51.83/mo` ✅ matches CSV.

**Montana:** Unisex-Male rates (footnote on rate pages).

### CSV contents (`fe_portfolio_rates.csv`)

| Product | Classes | Ages covered |
|---------|---------|----------------|
| Immediate | Preferred & Standard | Juvenile 0–17 (M/F); Adult 18–85 NT/T M/F |
| 10-Pay | Preferred & Standard | Same |
| Easy | Uni-smoke | 18–80 M/F |
| Immediate ADR Rider | Unisex | 18–70 |

**1,411** rows · source tag `Final_Expense_Agent_Guide_2644970R5` · no age-decrease OCR anomalies flagged in parse.

---

## RAG / Julie use

1. This markdown — product/UW/ops  
2. `fe_portfolio_rates.csv` — quoting  
3. UW chart TXT — condition decisions  
4. Prefer live quoter if guide superseded; this PDF last-modified **2023-12-20**

## Source URL

https://cdn.bfldr.com/86JM1UOD/as/v4fxfsf795f87m5mffm77/Final_Expense_Agent_Guide_with_New_Underwriting_Experience
