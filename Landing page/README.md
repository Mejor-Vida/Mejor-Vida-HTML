# Landing page flows (preview / dev)

English wizard flows for Mejor Vida Insurance. Each variant has its own HTML, CSS, and JS so you can edit one product line without affecting the others.

## Variants

| Folder | Purpose | Preview URL |
|--------|---------|-------------|
| `multi-product/` | Final expense + term + whole life (combined flow) | http://127.0.0.1:4174/Landing%20page/multi-product/index.html |
| `final-expense/` | **Final expense only** — edit this one for FE campaigns | http://127.0.0.1:4174/Landing%20page/final-expense/index.html |

Legacy shortcut (same repo root server on port **4173**):

- `preview/landing-flow-goals.html` — still works; shares root `css/` and `js/` (not the copies in this folder).

## Dev server

From the project root:

```bash
npm run preview:landing
```

Opens **port 4174** (repo root). Use the URLs above.

For the original preview server (port 4173):

```bash
npm run preview
```

## Folder layout (each variant)

```
final-expense/
  index.html          # Wizard HTML
  css/landing-flow.css
  js/
    landing-flow.js
    landing-flow-date-mask.js
```

Shared site assets (logo, images, legal pages, quote form) load from the main repo via `../../` paths.

## Identifiers

Each `index.html` sets on `<body>`:

- `data-product-line` — `multi-product` or `final-expense` (passed to quote as `productLine`)
- `data-quote-href` — where the wizard redirects after the last step (default `../../en/quote.html`)

## Adding another variant

1. Copy `final-expense/` to a new folder (e.g. `term-life/`).
2. Update `index.html` title, meta, `data-product-line`, and copy as needed.
3. Edit that folder’s `js/` and `css/` independently.


## Legacy Spanish landing (current production)

| Path | Purpose |
|------|---------|
| `landing-gastos-finales.html` (repo root) | **Live:** https://www.mejorvidainsurance.com/landing-gastos-finales.html |
| `landing-gastos-finales-legacy/` | Reference archive of that page (long-form + inline quote) |

## Facebook ads (Spanish wizard — new flow)

| Path | Purpose |
|------|---------|
| `gastos-finales-ads-v2/` (repo root) | **Primary Meta ad destination** — Spanish wizard v2, `noindex`, not linked from site nav |
| `gastos-finales-ads/` (repo root) | Legacy v1 wizard (still live; prefer v2 for new ads) |
| `Landing page/final-expense-en-backup/` | English backup copy (same as `final-expense/`) |
| `Landing page/final-expense-es/` | Spanish working copy (dev preview under `Landing page/`) |
| `Landing page/final-expense-es-backup/` | Spanish backup copy |

**Ad URL (use in Meta Ads Manager):** `https://www.mejorvidainsurance.com/gastos-finales-ads-v2/`

**URL Parameters (ad level → Website URL → URL Parameters):**
`utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}`

Use `https://www…` (not bare domain or `http://`). Preview each ad and confirm `?utm_source=facebook` appears in the browser bar before scaling spend.

- Results show **inline** on the last wizard step (landing header only; no site footer or redirect).
- Leads sync with `lang: "es"`.
- English dev preview: `Landing page/final-expense/index.html` (or `final-expense-en-backup/`).
- Spanish dev preview: `http://127.0.0.1:4174/Landing%20page/final-expense-es/index.html`

### Mobile dev preview (phone frame)

From the project root:

```bash
npm run preview:gastos-finales-ads-mobile
```

Opens **http://127.0.0.1:8766/preview/landing-gastos-finales-ads-mobile.html** — iframe inside a phone mockup with width/height presets and reload. Edit `gastos-finales-ads/` CSS/JS, save, click **Recargar**.

- Switch source in the toolbar: **gastos-finales-ads/** (deploy path) or **Landing page/final-expense-es/** (working copy).
- Full page without frame: `npm run preview:landing` → http://127.0.0.1:4174/gastos-finales-ads/
- Legacy long-form landing header preview: `python3 preview/serve-landing-mobile.py --page legacy`
