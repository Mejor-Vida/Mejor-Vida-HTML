# Spanish / English page split

Public site pages are **not bilingual**. Each URL is either Spanish (site root) or English (`/en/`).

## Edit workflow

1. Edit bilingual templates in **`sources/`** (mirrors site paths, e.g. `sources/quote.html`, `sources/blog/weekly-….html`).
2. Run:

```bash
npm run build:en
```

3. Commit generated **root** (Spanish) and **`en/`** (English) HTML together with any `sources/` changes.

## Output

| Path | Language |
|------|----------|
| `/index.html`, `/quote.html`, `/blog/…`, etc. | Spanish only |
| `/en/index.html`, `/en/quote.html`, `/en/blog/…`, etc. | English only |

Cross-links: Spanish pages link to `/en/…`; English header links to `/` (Español).

## Excluded

- `staff/` — internal app (separate UI)
- `preview/`, `email-previews/`, `facebook-posting/` — dev/preview assets
- `sources/` — not served; templates only
