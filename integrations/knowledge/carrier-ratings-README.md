# Carrier ratings (state coverage chart)

Source of truth for the ranked carrier table on `/estados/*.html` and `/en/states/*.html`.

## File

- `integrations/knowledge/carrier-ratings.json`

## Rebuild pages

```bash
node scripts/render-state-coverage-pages.js
```

## Scoring (Mejor Vida /5)

Led by **AM Best FSR**, then small adjustments for outlook / under-review and multi-agency confirmation (Moody’s, S&P). Not an endorsement by any agency.

## Primary sources to refresh

| Source | Use |
|---|---|
| [AM Best News](https://news.ambest.com/) / disclosure PDFs | FSR, outlook, effective date |
| Moody’s / S&P | When the carrier publishes them publicly |
| [NAIC CIS](https://content.naic.org/cis_consumer_information.htm) | Complaint lookup by NAIC company code (cite; don’t invent national indexes) |
| Weiss / J.D. Power | Optional; verify on their sites before adding numeric grades |

Update `updatedAt` and per-carrier `amBest` / `otherRatings` / `score` / `rank` when ratings change, then re-run the renderer.
