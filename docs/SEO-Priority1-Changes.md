# SEO Priority 1 — Items 3, 4, 5

Implemented in repo June 2026. Items 1–2 (GA4 + GSC verification) pending Cowork IDs — see Section 6 below.

## Done in codebase

- **Item 3:** `og:image` / `twitter:image` → `/img/opt/hero-couple-embrace.jpg` on ES + EN homepages; `og:locale:alternate` bug fixed on `en/index.html`
- **Item 4:** Canonical, hreflang, og/twitter on `about-julie.html` and `en/about-julie.html`
- **Item 5a:** Person JSON-LD on both about-julie pages
- **Item 5b:** hreflang + og/twitter on all carrier pages (ES + EN)
- **Item 5c:** Enhanced InsuranceAgency JSON-LD on both homepages
- **Item 5d:** Product JSON-LD on all carrier pages
- **Sitemap:** Carrier URLs added

## Section 6 — When GA4 + GSC IDs arrive

### GA4 gtag (replace `G-XXXXXXXXXX`)

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Add after `<head>` on all HTML pages (or shared include when available).

### GSC verification (ES homepage only)

```html
<meta name="google-site-verification" content="PASTE_VALUE_HERE">
```

Add to `index.html` `<head>`. Cowork clicks Verify in Search Console after deploy.

### Sitemap submit (after GSC verified)

`https://www.mejorvidainsurance.com/sitemap.xml`
