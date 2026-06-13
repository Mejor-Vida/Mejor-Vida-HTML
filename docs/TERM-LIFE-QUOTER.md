# Term Life Public Quoter

Nebraska term life quoter — same UX and results model as the [final expense quoter](quote.html).

## URLs

| Language | Wizard | Results |
|----------|--------|---------|
| Spanish | `/term-quote.html` | `/term-quote-results.html` |
| English | `/en/term-quote.html` | `/en/term-quote-results.html` |

## Inputs

1. Gender  
2. Date of birth  
3. State (Nebraska for v1)  
4. Tobacco (yes/no, last 12 months)  
5. Term length (10 / 15 / 20 / 25 / 30 years)  
6. Coverage amount ($100K–$1M, then $2M–$5M by whole millions)  
7. Height  
8. Weight  
9. Contact (name, email, phone, optional SMS)

## Output

Monthly premium **range** (same as FE):

- **Low** — best realistic health (preferred/build-qualified classes)  
- **High** — worst realistic health (standard/table classes)  
- **Anchor** — midpoint

### Underwriting mode (results page toggle)

| Mode | Products | Max face (typical) |
|------|----------|-------------------|
| **Fully underwritten** | Transamerica Trendsetter Super (when seeded) | Up to $5M UI cap |
| **Simplified issue** | AmAm Easy Term only | $500K (ages ≤45 NE nearest), $300K (46+) |

API: `underwritingMode: "full"` | `"simplified"` on `POST /api/term-quote-site`.  
Wizard tries **full** first; falls back to **simplified** when full has no data.

## Architecture

| Layer | Path |
|-------|------|
| Wizard | `js/mvi-term-quote-wizard.js` |
| API | `POST /api/term-quote-site` |
| Engine | `lib/term-quote-engine.js` |
| Build chart | `lib/term-build-chart.js` (MOO TLA chart) |
| Data | Supabase `term_carrier_premiums` |
| Lead sync | `POST /api/quote-lead-sync` (`source: nebraska_term_quote_page`) |

## Rate data (required before live quotes)

1. Add verified rows to `integrations/knowledge/Term_Life_Knowledge/term_carrier_premiums.csv`  
2. Run `node scripts/build-term-premiums-migration.js`  
3. Apply migration `062` (table) + `063` (seed) via `integrations/supabase/apply_migrations.py`  
4. Validate samples against WinFlex / Agent Center quotes  

**Transamerica Trendsetter Super:** use `npm run harvest:winflex -- run --pilot` (see `integrations/knowledge/Term_Life_Knowledge/README.md`).

**No fabricated rates.** Until CSV is populated, the API returns `no_data`.

## Carriers (v1)

- **Transamerica** — Trendsetter Super (fully underwritten — WinFlex harvest)
- **American Amicable** — Easy Term (simplified issue)
- Mutual of Omaha — TLA/TLE (when WinFlex MOO access approved)
- Assurity — Term Life (when Agent Center rates seeded)

## Maximum face amounts (underwriting — Nebraska)

Public quoter UI goes up to **$5M** (MOO TLA jumbo band). Lower caps apply per carrier/age; above those limits the API may return `no_data` until rate rows exist.

| Product | Typical max face | Notes |
|---------|------------------|--------|
| **MOO Term Life Answers (TLA)** | **$5M+** with underwriting | Chart bands: $100K–$249K, $250K–$499K, $500K–$999K, **$1M+** |
| **MOO Term Life Express (TLE)** | $550K (ages 18–50), $450K (51–60), $350K (61–75) | Simplified issue |
| **AmAm Easy Term** | $500K (ages 18–45), $300K (46+) | Products at a Glance |
| **Assurity Term Life** | Verify in Agent Center | Often up to $1M on site materials |

Code reference: `lib/term-face-limits.js`

## Staff QA

Staff portal links to `/term-quote.html` for testing the public flow.
