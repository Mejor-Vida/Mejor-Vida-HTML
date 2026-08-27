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
| Grid pricing | `lib/term-integrity-rates.js` |
| Data — fully underwritten | Supabase `term_integrity_premiums` (appointed carriers only) |
| Data — simplified issue | Supabase `term_carrier_premiums` (AmAm Easy Term) |
| Lead sync | `POST /api/quote-lead-sync` (`source: nebraska_term_quote_page`) |

The two underwriting modes read different tables. `lib/term-quote-router.js` picks
the table from the requested mode, so a change to one path cannot disturb the other.

## Rate data — fully underwritten

Quotes come from Integrity Connect marketplace harvests, restricted to carriers
Mejor Vida is appointed with. The harvest lands on a grid of ages (5-year steps),
terms (10/20/30), and face amounts, so `lib/term-integrity-rates.js` prices the
exact age, term, and coverage a visitor asked for by reading between the two
surrounding quoted points. A request outside a product's harvested range returns
nothing for that product rather than an extrapolated guess.

Health classes drive the low/high range: `preferred_plus_nt` sets the low end and
`standard_nt` the high end. Tobacco users carry `preferred_t` / `standard_t`, and
because carriers quote one tobacco rate rather than a class ladder, low and high
come out equal for them.

To refresh or extend the grid:

1. `npm run bridge:browser` and turn the Chrome extension Bridge ON, logged into Integrity Connect
2. `npm run term:harvest-integrity -- --health S --ages 25,30,35 --terms 10,20,30 --faces 100000,250000,500000,1000000`
   (add `--tobacco true` for tobacco classes)
3. `npm run term:import-integrity`
4. `npm run term:rebuild-cost-rates` when the cost pages should pick up new ages

## Rate data — simplified issue

1. Add verified rows to `integrations/knowledge/Term_Life_Knowledge/term_carrier_premiums.csv`  
2. Run `node scripts/build-term-premiums-migration.js`  
3. Apply migration `062` (table) + `063` (seed) via `integrations/supabase/apply_migrations.py`  
4. Validate samples against WinFlex / Agent Center quotes  

**Transamerica Trendsetter Super:** use `npm run harvest:winflex -- run --pilot` (see `integrations/knowledge/Term_Life_Knowledge/README.md`).

**No fabricated rates.** With no rows for a combination the API returns `no_data`,
and the wizard falls back to the other underwriting mode.

## Carriers

Fully underwritten (from the Integrity harvest, appointed only):

- **Transamerica** — Trendsetter Super, Trendsetter LB
- **Corebridge** — Select-a-Term, QoL Flex Term (incl. SimpliNow Choice)
- **Mutual of Omaha** — Term Life Answers

Simplified issue:

- **American Amicable** — Easy Term

The results page names whichever company won the quote via `quote_carrier`
(`lib/term-carrier-names.js`), so the copy is never pinned to one carrier.

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
