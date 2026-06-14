# Term Life rate data (Nebraska public quoter)

The term quoter reads **only** from `term_carrier_premiums.csv` → Supabase. Do not copy final expense rates or guess premiums.

## Source of truth

| File | Purpose |
|------|---------|
| `term_carrier_premiums.csv` | Raw carrier rows: rate per $1,000 and/or fixed monthly premium |

### CSV columns

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

### Where to get rates

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

### Build & deploy

```bash
node scripts/build-term-premiums-migration.js
python3 integrations/supabase/apply_migrations.py
```

### Validation

After adding rows, compare each sample cell to a manual quote in Integrity Connect / WinFlex. Log mismatches in `validation-log.md` (create as you verify).

Height/weight uses MOO TLA build chart (`lib/term-build-chart.js`) to cap the **low** bound only — from MOO Underwriting Guide, not invented.
