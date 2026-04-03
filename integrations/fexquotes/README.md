# FEX Quotes — website embed

## Live embed

- **Page:** `quote.html` (section `.fex-quotes-container` / `.fex-quotes-wrap`).
- **Endpoint:** `https://fexquotes.com/wqt/v1/webquote.pl`
- **Query (current):** `id=55220`, `fn=1`, `vrt=m`, `tgt=2`, `cpn=6`, `style=blue`, `frm=1`
- **Domains:** `fexquotes.com` (iframe document and assets load from FEX).

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

## Dashboard settings (when regenerating)

Regenerate in **FEX → Website Quoter → Enhanced Web Plugin** if you change theme, caption, or rater type; replace the `src` URL in `quote.html` with the new snippet.

## Supabase → HubSpot

Leads from the widget are handled by **FEX** (Lead Manager / email per your plan). Sync to `quote_lead_submissions` and HubSpot is **not** automatic from this iframe alone—see `workflow.md` when that integration is implemented.
