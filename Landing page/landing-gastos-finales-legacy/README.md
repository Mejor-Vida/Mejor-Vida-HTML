# Legacy Spanish landing (reference archive)

Snapshot of the **current production** long-form Spanish landing page used for Facebook and direct traffic.

| | |
|---|---|
| **Live URL** | https://www.mejorvidainsurance.com/landing-gastos-finales.html |
| **Deploy path** | Repo root: `landing-gastos-finales.html` (this folder is **not** served unless copied back to root) |
| **Archive copy** | `landing-gastos-finales.html` in this folder |

## What this page is

Single-file landing (inline CSS + embedded quote form). Includes video hero, carrier sections, inline quote estimator (`/api/quote-site`), lead sync (`/api/quote-lead-sync`), HubSpot scheduling iframe, and Meta Pixel.

## Local preview

Use the **repo root** file (same assets paths as production):

```bash
npm run preview:landing
```

Open: http://127.0.0.1:4174/landing-gastos-finales.html

To preview this archive copy specifically, temporarily copy it to the repo root or adjust asset paths (`img/`, `bootstrap/`, `video/`, etc.) to `../../`.

## Related landings

| Page | URL / path |
|------|------------|
| New wizard (FB ads) | `/gastos-finales-ads/` — see `Landing page/README.md` |
| Wizard dev (Spanish) | `Landing page/final-expense-es/` |

When you change the live page, update **both** `landing-gastos-finales.html` (root) and this archive copy if you want them to stay in sync.
