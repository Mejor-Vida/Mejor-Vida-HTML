# Assurity Protect+ rate data (site quoter)

The Nebraska landing / `quote_ranges_assurity` table is built **only** from files in this folder. Nothing is derived from Mutual of Omaha or American Amicable.

## Source of truth

| File | Purpose |
|------|---------|
| `assurity_protect_plus_premiums_10k.csv` | Monthly premiums for **$10,000** face, **Pay to Age 100**, **Whole Life Protect+** |

Columns:

- `age` — issue age (last birthday)
- `sex` — `male` or `female`
- `uw_class` — Assurity underwriting class (see below)
- `monthly` — monthly premium in dollars
- `source` — `flyer_rates_compare_rev_10_25`, `flyer_interpolated`, `agent_center`, or interim `moo_ratio_calibrated_v050` (replace with `agent_center`)

### Underwriting classes (Assurity product guide)

- `preferred_plus_nt` — Preferred Plus Non-Tobacco
- `standard_nt` — Standard Non-Tobacco
- `preferred_tobacco` — Preferred Tobacco
- `standard_tobacco` — Standard Tobacco

## How the quoter uses this file

1. Run `node scripts/build-assurity-quote-ranges-from-csv.js` to regenerate `050_quote_ranges_assurity.sql` (or apply directly to Supabase).
2. **Non-smoker:** `low` = lowest available NT class premium; `high` = highest available NT class premium. If only one NT class exists, all three amounts match (no fabricated spread).
3. **Tobacco:** quotes when `preferred_tobacco` / `standard_tobacco` rows exist in the CSV. Interim tobacco uses `moo_ratio_calibrated_v050` until Agent Center rows replace them.

## Adding real rates from Agent Center

Export illustrations (NE, $10K, monthly, Pay to 100, Protect+) and append rows to the CSV, then rebuild:

```bash
node scripts/generate-assurity-tobacco-interim.js   # only if refreshing interim tobacco rows
node scripts/build-assurity-quote-ranges-from-csv.js
python3 integrations/supabase/apply_migrations.py   # or run 060 SQL in Supabase
```

Do **not** add estimated tobacco or standard premiums without an Assurity source.

## Public flyer anchor (already in CSV)

Assurity **Flyer-RatesCompare-WL.pdf** (Rev. 10/25): Preferred Plus NT sample premiums at ages **5, 25, 35, 45** for $50,000 face.

Important: Assurity Whole Life Protect+ includes a **$65 annual policy fee** (see product guide). The $10,000 premium is **not exactly** \(0.2 \times\) the $50,000 premium because the **fee does not scale** with face amount.

To match Agent Center monthly totals, the CSV stores $10,000 monthly amounts that include the fee correctly (fee held constant). Ages **18–44** without an Agent Center row use **linear interpolation** between the flyer anchor ages only (`source = flyer_interpolated`).
