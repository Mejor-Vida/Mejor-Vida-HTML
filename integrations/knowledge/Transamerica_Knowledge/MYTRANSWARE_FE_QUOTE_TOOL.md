# myTransware — Final Expense Solutions Quote Tool (WL3)

**Source:** [myTransware Final Expense quote](https://mytranswarequote.transamerica.com/Wl3.html?id=WL3IM)  
**Captured:** 2026-07-22  
**UI version footer:** `v.4181.DC55.9A72.6384`  
**Audience:** Agent use only — quote only, not an offer of coverage  
**Page title:** myTransware - Final Expense Solutions  

## What this is

Public **lite** myTransware illustration/quote UI for the **Final Expense Solutions Portfolio (2021 WL3 series)**:

| Product ID | Label in tool | Default deep link |
|------------|---------------|-------------------|
| **WL3IM** | Immediate Solution (2021) | `Wl3.html?id=WL3IM` ← user link |
| **WL310** | 10 Pay Solution (2021) | `Wl3.html?id=WL310` |
| **WL3EY** | Easy Solution (2021) | `Wl3.html?id=WL3EY` |

Uses anonymous lite credentials (`litesitecode` / `liteProducer`) — no Agent Home login required for this lite page.

## Critical: FE Express is **not** in this tool

`Products.json` links include Trendsetter term, Living Benefit, older WL1/WL2 FE vintages, and **WL3** portfolio FE — **no FE Express / Graded FE Express product IDs**.  

For Express rates use `fe_express_rates.csv` / Agent Guide, or WELIS/Agent Home if Transamerica hosts Express elsewhere.

## Quote UI fields (from Wl3.html)

- Product (Immediate / 10-Pay / Easy)  
- Age, State, Gender, Risk Class  
- Solve for face **or** premium  
- Premium mode: Annual, Semi-Annual, Quarterly, Monthly EFT (lite default Monthly EFT)  
- Accidental Death Benefit Rider (Yes/No) — Immediate path  
- Child/Grandchild rider amount + number of children — Immediate path  
- Outputs: Annual / Semi-Annual / Quarterly / Monthly EFT + premium breakdown (base / ADR / CGR)

## Rules from VData (WL3 JSON)

### Immediate (WL3IM) & 10-Pay (WL310)

| Age band | Face min–max (most states) | Washington min–max |
|----------|----------------------------|--------------------|
| 0–55 | $1,000–$50,000 | $5,000–$50,000 |
| 56–65 | $1,000–$40,000 | $5,000–$40,000 |
| 66–75 | $1,000–$30,000 | $5,000–$30,000 |
| 76–85 | $1,000–$25,000 | $5,000–$25,000 |

- Issue ages: **0–85**  
- Risk classes: Preferred/Standard Nontobacco & Tobacco (18–85); Juvenile Preferred/Standard (0–17)  
- ADR: ages **18–70** (Immediate)  
- CGR: parent ages **18–75**; **1–5** units ($1k–$5k); **1–9** children  

### Easy (WL3EY)

- Ages **18–80** (Else); NY ages **50–75** in `AgeStateList` but **New York is not in `StateApproved`** for this WL3 lite config  
- Face **$1,000–$25,000**  
- Risk class: **Graded** only (uni-smoke path in Agent Guide rates)  
- Riders section hidden  

### Julie states (NE / KS / CO / NV)

All four appear in **`StateApproved`** for WL3IM / WL310 / WL3EY.  
**New York:** not in WL3 `StateApproved` (use other Transamerica NY paths / forms if needed).

`RiderApprovals.ADB.State` / `CI.State` arrays are **empty** in downloaded VData — do not infer state rider bans from that alone; confirm in live UI / rider charts.

## Local files saved

| File | Purpose |
|------|---------|
| `source_pdfs/mytransware_Wl3_WL3IM.html` | Quote page HTML |
| `source_pdfs/mytransware_Products.json` | Product catalog + links |
| `source_pdfs/mytransware_Products-lite.js` | Lite loader |
| `source_pdfs/mytransware_WL3.json` | Form defaults / enums for WL3 UI |
| `source_pdfs/mytransware_WL3IM.json` | Immediate VData rules |
| `source_pdfs/mytransware_WL310.json` | 10-Pay VData rules |
| `source_pdfs/mytransware_WL3EY.json` | Easy VData rules |
| `source_pdfs/mytransware_WL3IM_Script.js` | Quote calc script (shared WL3.js) |
| `source_pdfs/mytransware_Enum.json` | Shared enums |

Premium math for offline quotes remains in `fe_portfolio_rates.csv` (Agent Guide). Use this tool as the **live check** against carrier calc.

## Related deep links

- Immediate: https://mytranswarequote.transamerica.com/Wl3.html?id=WL3IM  
- 10-Pay: https://mytranswarequote.transamerica.com/Wl3.html?id=WL310  
- Easy: https://mytranswarequote.transamerica.com/Wl3.html?id=WL3EY  
- Marketing quote hub often cited: https://www.transamerica.com/quote-fe  

## RAG / Julie use

Bookmark + product-ID map for portfolio FE quoting. Tell agents Express is a different product/app. Prefer Agent Guide CSV for offline premiums; myTransware for validation.
