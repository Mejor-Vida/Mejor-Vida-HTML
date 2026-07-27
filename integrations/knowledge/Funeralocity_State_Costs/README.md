# Funeralocity state funeral averages

**Source of truth** for Mejor Vida funeral cost figures (final expense calculator, state coverage pages, map tooltips).

**Captured:** see `all-states-detailed.json` → `capturedAt`  
**Re-harvest:** `node scripts/harvest-funeralocity-state-costs.js`

## APIs

| Purpose | Endpoint |
|---------|----------|
| Summary (4 package averages) | `GET https://www.funeralocity.com/api/common/average/full/short/{STATE}` |
| Traditional burial components | `.../detailed/services/traditional-full-service-burial/location/state/states/{st}` |
| Full-service cremation | `.../detailed/services/full-service-cremation/location/state/states/{st}` |
| Affordable / direct burial | `.../detailed/services/affordable-burial/location/state/states/{st}` |
| Direct cremation | `.../detailed/services/direct-cremation/location/state/states/{st}` |

Public pages: `https://www.funeralocity.com/average-funeral-price/{state}`

Use `Accept: application/json` + a normal browser `User-Agent`. Do **not** use `location/0/...` patterns — those return national averages.

## Files

| File | Use |
|------|-----|
| `all-states-detailed.json` | Full raw harvest (short + detailed for all 50 states + DC) |
| `ne-ks-co-nv.json` | Licensed-state summary for coverage pages |
| `../../js/final-expense-state-costs.js` | Generated calculator data (`window.MVI_FE_STATE_COSTS`) |
| `../../js/state-coverage-costs.js` | Map / coverage-page short averages (NE/KS/CO/NV) |

## Calculator mapping

| Calculator field | Funeralocity source |
|------------------|---------------------|
| `burial.funeralHome` | Sum of traditional burial **service** components (Basic Services, Transfer, Embalming, Dressing & Casketing, Viewing, Funeral Service, Hearse, Utility Vehicle) — **excludes** median casket |
| `burial.casket` | `MedianPricedCasketAverage` (reference; UI still uses tier selects) |
| `funeralHome.cremation` / `cremation.cremationPrice` | `FullCremation.State.Average` |
| `cremation.directCremation` | `DirectCremation.State.Average` |
| Vault, cemetery plot, opening/closing, flowers, death certs, stationery | Not published as FO state averages → calculator tier selects |

Always cite Funeralocity. Re-fetch periodically; averages change.
