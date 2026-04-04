# FEX Quotes — website embed

## Live embed

- **Page:** `quote.html` (section `.fex-quotes-container` / `.fex-quotes-wrap`).
- **Endpoint:** `https://fexquotes.com/wqt/v1/webquote.pl`
- **Query (current):** `id=55220`, `state=NE`, `fn=1`, `vrt=m`, `tgt=2`, `cpn=6`, `style=blue`, `frm=1`, plus `embed_v=<n>` (cache-bust; bump `FEX_EMBED_VER` in `quote.html` when you change FEX settings or need a fresh iframe load).
- **Domains:** `fexquotes.com` (iframe document and assets load from FEX).

### Caching (this repo)

- **No service worker** is registered in this project; there is **no** `sw.js` / Workbox.
- **`vercel.json`** only sets serverless `maxDuration`; it does **not** add long-lived cache headers for HTML.
- **Your static `quote.html`** is what sets the iframe `src`; the **quoter UI and carrier logic** load from **FEX’s servers**. Cloudflare (if used in front of `mejorvidainsurance.com`) may cache **HTML** briefly—purge cache or bump `FEX_EMBED_VER` after deploys.
- **Carrier results** (e.g. Assurity vs Mutual of Omaha) are decided when the user runs a quote on **FEX**; that is **not** cached by your site’s JavaScript.

### If a carrier (e.g. Assurity) is missing from results

1. Confirm in **FEX dashboard** that Assurity is enabled for **this** web quoter / rater and product type (not only “account enabled”).
2. **Regenerate** the plugin snippet and align `id`, `fn`, `cpn`, `frm`, etc. with `quote.html` (see “Dashboard settings” below).
3. Try another **age / tobacco / face amount / health class**—carriers often **decline** or hide for certain profiles even when “enabled.”
4. Open the embed URL **directly** in a new tab (paste the full `webquote.pl?...` URL from DevTools → iframe `src`) and compare; if Assurity is still missing, contact **FEX support** with that URL.
5. Bump **`FEX_EMBED_VER`** in `quote.html` and redeploy to force browsers to request a new iframe URL.

## Cache-busting the embed

In `quote.html`, increase `FEX_EMBED_VER` (e.g. `'1'` → `'2'`) and deploy. The `embed_v=` query parameter is a harmless extra that changes the iframe URL so caches treat it as a new resource (FEX typically ignores unknown params).

FEX documents using the **same query string** in your own `<iframe>` or `<object>` for layout flexibility, plus a **simple API** to tweak plugin behavior further (see their support/docs for API details).

### Query parameters you can change

| Parameter | Values | Meaning |
|-----------|--------|---------|
| **`vrt`** | `m` | Vertically align **middle** of the page or element (current). |
| | `t` | Align **top** of the page or element. |
| | `b` | Align **bottom** of the page or element. |
| **`tgt`** | `1` | Show results **inside** the current page or element (stays in the iframe). |
| | `2` | Send results **outside** the current page or element (current — e.g. new window/tab or parent; behavior per FEX). |

**Current:** `vrt=m`, `tgt=2`. If you want the quote results to stay **inside** the embedded box, try `tgt=1` and test on desktop and mobile.

Other keys in the URL (`id`, `fn`, `cpn`, `style`, `frm`, etc.) come from the **Generate Plugin Code** output in the FEX dashboard—keep those in sync when you regenerate.

### Language (no Spanish quoter from FEX)

- FEX’s web plugin is **English only** (no public Spanish embed or documented URL flag).
- **`quote.html`** keeps the **rest of the page** bilingual (ES/EN toggle); the iframe stays one **English** URL. A short note on the page explains that Julie can help in **Spanish** by phone or WhatsApp.

## Dashboard settings (when regenerating)

Regenerate in **FEX → Website Quoter → Enhanced Web Plugin** if you change theme, caption, or rater type; replace the `src` URL in `quote.html` with the new snippet.

## Supabase → HubSpot

The iframe **cannot** send data to our server. **`POST /api/quote-lead-sync`** saves leads from the **follow-up form** on `quote.html` to **`quote_lead_submissions`** and syncs contacts to **HubSpot**. See **`workflow.md`** for env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `HUBSPOT_ACCESS_TOKEN`).

## HubSpot scheduling (meetings embed)

- **`quote.html`** includes a Bootstrap **modal** with HubSpot meeting iframes: **Spanish** `…/julie-braunsroth`, **English** `…/insurance-consultation-mejor-vida-insurance`. The iframe `src` is set when the modal opens, matching the site language (ES/EN).
- **Open modal:** buttons on the quote page, **`/quote.html?schedule=1`** or **`#schedule`**, and **automatically ~700ms after a successful** lead form submit (Supabase/CRM sync).
- **Index** nav links **Agendar / Schedule** point to **`/quote.html?schedule=1`**.
