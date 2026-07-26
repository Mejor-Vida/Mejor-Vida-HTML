# Corebridge — State-specific rules (FE + Term/GUL/WL)

**Agent focus:** Julie Braunsroth — licensed **NE, KS, CO, NV** (expand as more states are added)  
**Compiled:** 2026-07-26 from Connext producer/UW PDFs + AGLC110190 + AGLC112585  
**Restriction:** FP-only source material — internal / RAG use only  
**Out of scope here:** IUL free-look rows (Julie does not sell IULs)

---

## Important gaps

1. **AGLC110190** (state availability as of **Jan 31, 2025**) covers Term / Fixed UL / Index UL / conversion Whole Life — it does **not** list **SIWL** or **GIWL**.
2. **AGLC112585** (Free Look & Grace by product, REV1024) covers Select-a-Term, GUL 3, American Elite conversion, etc. — it also does **not** list **SIWL** or **GIWL** (use FE producer guides for those).

FE exclusions come from **AGLC201192** (SIWL) and **AGLC200472** (GIWL). For any new state, **confirm in Connext / SimpliNow Quoter / Forms Depot**.

Local copies:
- `raw/pdfs/AGLC110190-AGL-State-Availability.pdf`
- `raw/pdfs/AGLC112585-Free-Look-and-Grace-Periods.pdf`

**Still needed:** FE-specific full state/rider matrix if published; SIWL rider-by-state list.

---

## Hard product exclusions (from producer guides)

| Product | Not approved / not sold | Notes |
|---------|-------------------------|--------|
| **SIWL** (SimpliNow Legacy / Legacy Max) | **New York** | AGL does not issue in NY; product “not approved for sale in New York” |
| **GIWL** | **New York** and **Maine** | Explicit: “not approved for sale in NY & ME” |
| Both FE | **US territories** (per AGLC110190 notes) | American Samoa, Guam, N. Mariana Islands, Puerto Rico, U.S. Virgin Islands — not for new sales |
| Both FE | **Foreign nationals** | Not available (SIWL UW + both producer guides) |

Issuer: Outside NY → **AGL**. NY life lines → **US Life** where applicable. FE SIWL/GIWL **not** for NY sale.

---

## Free look & grace — in-scope products (AGLC112585-LB REV1024)

**Julie states (NE / KS / CO / NV)** use the “All states” defaults below (none of Julie’s four are special-cased).

| Product | Free look (Julie states) | Grace (Julie states) | Special-state notes (not Julie) |
|---------|--------------------------|----------------------|----------------------------------|
| **Select-a-Term** | **10 days** (30 if replacement) | **31 days** | CA: free look 30 days age 60+; grace 60. FL free look 14. ND 20. PA 45 for replacements. NY 60 for replacements |
| **Secure Lifetime GUL 3** | **10 days** (30 if replacement) | **61 days** | Same free-look specials as Term; NY 60 for replacements |
| **American Elite Whole Life 2** (term conversion only) | **10 days** (30 if replacement) | **31 days** | CA free look 30 age 60+; CA grace 60. FL 14 / ND 20 free look. PA 45 for replacements |
| **American Elite 2** (NY conversion only) | NY only — N/A for Julie | NY only | Out of Julie’s licensed states |
| **AG Ultra One** | 10 days | 31 days | Confirm if Julie sells this short-term non-convertible line |

**FE (not on AGLC112585)** — from producer guides:
| Product | Free look | Grace |
|---------|-----------|-------|
| SIWL Level (Legacy Max) | **10 days** | **31 days** (CA **60**) |
| SIWL Graded | **30 days** | **31 days** (CA **60**) |
| GIWL | **30 days** | (use policy / Forms Depot; not on 112585) |

---

## Julie licensed states — FE availability (best current read)

| State | SIWL Level | SIWL Graded | GIWL | Chronic ABR (GIWL) | Terminal ABR (GIWL) | Unisex | SIWL grace |
|-------|------------|-------------|------|--------------------|---------------------|--------|------------|
| **Nebraska** | Available* | Available* | Available* | Available* | Available* | No | 31 days |
| **Kansas** | Available* | Available* | Available* | Available* | Available* | No | 31 days |
| **Colorado** | Available* | Available* | Available* | Available* | Available* | No | 31 days |
| **Nevada** | Available* | Available* | Available* | Available* | Available* | No | 31 days |

\*Not in named exclusion lists; **verify live in Connext/quoter**.

### Why this table
- SIWL block: **NY only** → Julie states OK  
- GIWL blocks: **NY & ME** → Julie states OK  
- GIWL Chronic ABR: not **CA/DC**; Terminal ABR: not **CA**  
- Unisex: **Montana only**

---

## Non-FE state availability (AGLC110190 highlights for Julie)

| Product | Availability |
|---------|--------------|
| **Select-a-Term** | All states |
| **Secure Lifetime GUL 3** | All states |
| **American Elite Whole Life 2** (conversion) | All states **except NY** |
| **American Elite 2** (conversion) | **NY only** |

(IUL rows omitted — out of scope.)

---

## Rider / feature state notes (GIWL)

From AGLC200472:
- **Chronic Illness ABR** — not **CA**, not **DC**
- **Terminal Illness ABR** — not **CA**
- ABR claim admin fee: **$250** most states; **$100 in Florida**

From AGLC201192 (SIWL): riders “not available in all states” — **no named state list** (gap).

---

## Multi-state expansion checklist

When Julie adds a new licensed state:
1. Confirm not NY (SIWL/GIWL) and not ME (GIWL).  
2. Apply AGLC112585 free-look/grace specials if state is CA/FL/ND/PA/NY.  
3. Run SimpliNow Quoter / Rapid Rater for that state.  
4. Check Forms Depot for riders.  
5. Update this file.

---

## Source docs

| Doc | Form | File |
|-----|------|------|
| SIWL Producer Guide | AGLC201192 | `raw/pdfs/AGLC201192-SIWL-Producer-Guide.pdf` |
| GIWL Producer Guide | AGLC200472 | `raw/pdfs/AGLC200472-GIWL-Producer-Guide.pdf` |
| AGL Life State Availability | AGLC110190 REV0125 | `raw/pdfs/AGLC110190-AGL-State-Availability.pdf` |
| Free Look & Grace by Product | AGLC112585-LB REV1024 | `raw/pdfs/AGLC112585-Free-Look-and-Grace-Periods.pdf` |
| American Elite 2 specs | AGLC111279 | `raw/pdfs/AGLC111279-American-Elite-2-Endowment.pdf` |
