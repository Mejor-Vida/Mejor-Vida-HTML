# Carrier ratings (state coverage chart)

Source of truth for the ranked carrier table on `/estados/*.html` and `/en/states/*.html`.

## File

- `integrations/knowledge/carrier-ratings.json`

## Rebuild pages

```bash
node scripts/render-state-coverage-pages.js
node scripts/apply-carrier-ratings-sections.js
```

State pages use a **simplified wide chart** (carrier + score, unique blurb, AM Best, Comdex, NAIC index, J.D. Power). Full detail is injected onto each carrier page via `apply-carrier-ratings-sections.js`.

**Scoring (Mejor Vida /5)** — proprietary

1. **AM Best FSR → %** — `A++`=100, `A+`=95, `A`=90, `A-`=85, …
2. **Comdex → %** — published score 1–100 (omit from average if N/A)
3. **NAIC CIS index → %** — `naic% = clamp(0, 100, 100 × (2 − index) / 2)` so `1.00 ≈ 50%` (lower index = higher %)
4. **Average** the available percents → **score/5** = `avg% ÷ 100 × 5` (stars match)

Formula lives in `scripts/lib/mejor-vida-carrier-score.js`. J.D. Power is display-only.

## Primary sources to refresh

| Source | Use |
|---|---|
| [AM Best News](https://news.ambest.com/) / disclosure PDFs | FSR, outlook, effective date |
| Moody’s / S&P | When the carrier publishes them publicly |
| [Comdex / industry charts](https://myannuitystore.com/resources/insurance-company-ratings/) | Percentile composite (verify issuer entity) |
| [NAIC CIS](https://content.naic.org/cis_consumer_information.htm) | National Complaint Index + company code (`…/RatioTrendDashboard.csv?COCODE=…`) |
| Weiss / J.D. Power | Optional; verify on their sites before adding numeric grades |

After changing AM Best / Comdex / NAIC inputs, recompute scores:

```bash
node -e "const fs=require('fs');const {applyScoresToCarriers}=require('./scripts/lib/mejor-vida-carrier-score');const p='integrations/knowledge/carrier-ratings.json';const d=JSON.parse(fs.readFileSync(p,'utf8'));d.carriers=applyScoresToCarriers(d.carriers);fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n')"
node scripts/render-state-coverage-pages.js
node scripts/apply-carrier-ratings-sections.js
```

Or re-run the fuller sync used when methodology text also needs refresh.
