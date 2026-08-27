# Term Life rate data (Nebraska)

Two Supabase sources power future term quoting and marketing charts:

| Table / file | Role |
|--------------|------|
| **`term_carrier_premiums`** | Appointed-carrier **chart** rates (today: AmAm Easy Term SI from Form 3350). Do not wipe when refreshing Integrity. |
| **`term_integrity_premiums`** | Integrity Connect **marketplace** Quick Quote cards (FU Preferred Best NT harvest). Full competitor set via **pagination**. |
| **`fe_integrity_premiums`** | Integrity Connect **Final Expense** Quick Quote cards (appointed-flagged). Parallel to term; does not yet drive `/api/quote-site`. |
| `integrity-fu-term-premiums.csv` | Knowledge export of `term_integrity_premiums` (all captured cards). |
| `integrity-fe-harvest.json` / `integrity-fe-premiums.csv` | FE harvest payload + CSV export. |
| `integrity-term-harvest.json` | Raw term harvest payload (source for import). |
| `js/term-life-cost-rates.json` | Static bilingual cost-page charts (**appointed-best** Preferred Best when flags present). |

## Appointed vs marketplace (critical)

The Integrity harvest stores **full marketplace cards** (paginated). Site cost charts and future bookable quoters should prefer **`is_mvi_appointed = true`**.

**MVI appointed / contracted:** Assurity, Mutual of Omaha / United of Omaha, American Amicable, Corebridge, Transamerica, Aetna, **Americo**.

**FU Preferred Best NT coverage:** Transamerica, Corebridge, and United of Omaha regularly appear. Americo / AmAm / Assurity / Aetna usually do **not** appear in FU Preferred Best (they are FE or SI products) — harvest Simplified Term + Final Expense for those.

**Capture:** Integrity lists ~19–31 policies; harvester walks **all result pages** and stores every card in `all[]`, plus `appointed[]` / `appointed_best`.

## Import / refresh Integrity FU charts

```bash
# Bridge + Chrome extension logged into connect.integrity.com
npm run bridge:browser
npm run term:harvest-integrity -- --force --fresh
# FE (after Product Specialties allow Final Expense Quick Quote):
npm run term:harvest-integrity-fe

# Apply schema then upsert DB + refresh CSV
python3 integrations/supabase/apply_migrations.py   # 090 term + 091 fe
npm run term:import-integrity
npm run term:import-integrity-fe

# Refresh static cost-page JSON (appointed-best)
npm run term:rebuild-cost-rates
node scripts/build-term-life-cost-pages.js
```

CSV-only: `python3 scripts/import-integrity-term-premiums.py --csv-only`

## Sample quoter queries

Marketplace lowest (educational / “from $X” charts):

```sql
SELECT carrier_slug, product_name, monthly_premium
FROM term_integrity_premiums
WHERE is_best
  AND underwriting_mode = 'fully_underwritten'
  AND health_class = 'preferred_plus_nt'
  AND state = 'NE' AND age = 40 AND sex = 'male' AND smoker = false
  AND term_years = 20 AND face_amount = 500000;
```

All captured competitors for one cell (rank/compare):

```sql
SELECT rank_in_quote, carrier_slug, product_name, monthly_premium, is_mvi_appointed
FROM term_integrity_premiums
WHERE harvest_batch_id = '2026-08-12'
  AND underwriting_mode = 'fully_underwritten'
  AND health_class = 'preferred_plus_nt'
  AND state = 'NE' AND age = 40 AND sex = 'male' AND smoker = false
  AND term_years = 20 AND face_amount = 500000
ORDER BY monthly_premium ASC;
```

Appointed-only best among captured cards:

```sql
SELECT carrier_slug, product_name, monthly_premium
FROM term_integrity_appointed_best_premiums
WHERE underwriting_mode = 'fully_underwritten'
  AND health_class = 'preferred_plus_nt'
  AND state = 'NE' AND age = 40 AND sex = 'male' AND smoker = false
  AND term_years = 20 AND face_amount = 500000;
```

AmAm Easy Term SI (unchanged chart table):

```sql
SELECT age, sex, term_years, face_amount, monthly_premium
FROM term_carrier_premiums
WHERE carrier = 'amam' AND product = 'easy_term' AND state = 'NE'
  AND health_class = 'standard_nt' AND smoker = false
  AND age = 40 AND term_years = 20 AND face_amount = 250000;
```

## Path: DB → future public term quoter

1. Prefer **`term_integrity_premiums`** for FU Preferred Best NT bands ($100k–$2M, terms 10/20/30, ages 20–60).
2. Apply **`is_mvi_appointed`** (or appointed view) before showing bookable offers.
3. Keep **`term_carrier_premiums`** for SI Easy Term and future appointed chart uploads (Transamerica WinFlex, MOO, Assurity).
4. Static pages stay on `js/term-life-cost-rates.json` until the live quoter ships — rebuild from CSV/DB export; DB is source of truth for Integrity FU.

## AmAm / appointed chart CSV (legacy quoter seed)

| File | Purpose |
|------|---------|
| `term_carrier_premiums.csv` | Raw carrier rows: rate per $1,000 and/or fixed monthly premium |

### CSV columns (`term_carrier_premiums`)

| Column | Required | Notes |
|--------|----------|--------|
| `carrier` | yes | `transamerica`, `amam`, `moo`, or `assurity` |
| `product` | yes | e.g. `trendsetter_super`, `easy_term`, `term_life_answers`, `term_life` |
| `state` | yes | `NE` for v1 |
| `age` | yes | Issue age (last birthday) |
| `sex` | yes | `male` or `female` |
| `smoker` | yes | `0` or `1` |
| `term_years` | yes | `10`, `15`, `20`, `25`, or `30` |
| `face_band_min` | yes | e.g. `100000` |
| `face_band_max` | yes | e.g. `249999` |
| `health_class` | yes | See classes below |
| `rate_per_thousand` | usually | From carrier chart (annual $/1K) |
| `policy_fee_annual` | optional | Transamerica TS Super (bands 2–7): $30; MOO TLA: $62.50 |
| `modal_monthly_factor` | optional | Transamerica: `0.085`; MOO TLA: `0.086` |
| `monthly_premium` | optional | Use when chart gives total monthly directly |
| `face_amount` | optional | Required if `monthly_premium` is for one face only |
| `source_file` | yes | PDF/form name |
| `source_date` | yes | `YYYY-MM-DD` when rate was verified |

### Health classes (low / high pools)

**Low (best health):** `preferred_plus_nt`, `preferred_nt`, `standard_plus_nt`  
**High (worst realistic):** `standard_nt`, `substandard_nt`, `table_2`, `standard_t`, `substandard_t`

Simplified products (MOO TLE, AmAm Easy Term) may only have `standard_nt` / `standard_t` — if only one class exists, low and high match (no fabricated spread).

### Where to get appointed chart rates

| Carrier | Product | Source |
|---------|---------|--------|
| **Transamerica** | Trendsetter Super | WinFlex Web — NE, monthly (default harvest) |
| American Amicable | Easy Term | Form 3350 — `amam-easy-term-3350.pdf` |
| Mutual of Omaha | Term Life Answers (TLA) | WinFlex (when MOO access approved) |
| Mutual of Omaha | Term Life Express (TLE) | WinFlex |
| Assurity | Term Life | Agent Center |

### WinFlex → CSV (Transamerica)

**Recommended: spot import** (fast, no Playwright). Run quotes in WinFlex **Express Illustrations** yourself, then paste monthly premiums:

1. **Express Illustrations** → **Term** → Insured / Quote / Company (Transamerica → Trendsetter Super) → Calculate  
2. Quote specs: **NE**, **monthly**, **$250,000**, **20-year**, issue age **45**  
3. Run twice: **Preferred Plus NT** (low) and **Standard NT** (high)

**Option A — edit template, import batch**

```bash
# Edit monthly_premium column in:
# integrations/knowledge/Term_Life_Knowledge/winflex-spot-template.csv
npm run term:import-spots
node scripts/build-term-premiums-migration.js
python3 integrations/supabase/apply_migrations.py
```

**Option B — one CLI line per quote**

```bash
node scripts/term-spot-import.mjs --age 45 --sex male --term 20 --face 250000 --health preferred_plus_nt --monthly PASTE_HERE
node scripts/term-spot-import.mjs --age 45 --sex male --term 20 --face 250000 --health standard_nt --monthly PASTE_HERE
node scripts/build-term-premiums-migration.js
python3 integrations/supabase/apply_migrations.py
```

Replace `PASTE_HERE` with the **monthly** premium from WinFlex (not annual). If only annual is shown: `monthly ≈ annual × 0.085`.

**Optional — interactive harvest** (browser open, you run quotes, script reads results page):

```bash
npm run harvest:winflex:setup
npm run harvest:winflex -- login
npm run harvest:winflex -- snap   # on each results page, press Enter
npm run harvest:winflex -- merge
```

Automated Playwright extract (`harvest:winflex:auto`) is experimental — Express UI selectors change often; prefer spot import.

WinFlex per quote: **Transamerica → Trendsetter Super** (match term length), Nebraska, monthly, **Preferred Plus NT** (low) or **Standard NT** (high).

### AmAm Form 3350 → CSV

After downloading Form 3350 from Agent E-File → Order Supply:

```bash
# Copy PDF to integrations/knowledge/Term_Life_Knowledge/amam-easy-term-3350.pdf
python3 scripts/parse-amam-3350-pdf.py
node scripts/build-term-premiums-migration.js
```

Parser imports **standard** Easy Term only (skips ROP pages). Stores monthly premiums at quoter face amounts ($100K–$500K) for ages on the chart (10yr to 70, 20yr to 65, 30yr to 55).

### Build & deploy (AmAm chart seed)

```bash
node scripts/build-term-premiums-migration.js
python3 integrations/supabase/apply_migrations.py
```

### Validation

After adding rows, compare each sample cell to a manual quote in Integrity Connect / WinFlex. Log mismatches in `validation-log.md` (create as you verify).

Height/weight uses MOO TLA build chart (`lib/term-build-chart.js`) to cap the **low** bound only — from MOO Underwriting Guide, not invented.

## Gaps (next)

- Terms 15 and 25 are read between the 10/20/30 grid rather than harvested directly
- Tobacco faces above $2M (grid tops out at $1M for tobacco classes)
- Standard+ (`standard_plus_nt`) and substandard classes not harvested
- WinFlex/chart fills for Transamerica/MOO/Assurity into `term_carrier_premiums` still sparse vs Integrity marketplace

## Done

- Health classes: Preferred Best, Preferred, and Standard non-tobacco; Preferred and Standard tobacco
- Appointed-only public quoter filter (live — the quoter reads `is_mvi_appointed` rows only)
- Full Integrity result sets (~30 cards) via result-page pagination
- 30-year term past roughly age 55, and 20-year past 70, return no premium — a real product max age, not a harvest miss
