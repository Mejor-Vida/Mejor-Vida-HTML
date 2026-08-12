# MVI appointed carriers (term / life) — Integrity filter reference

Used by `scripts/import-integrity-term-premiums.py` (`is_mvi_appointed`) and documented in README.

## Appointed / contracted (quoteable by Julie)

| Slug | Carrier | Notes |
|------|---------|--------|
| `transamerica` | Transamerica | FE public; Trendsetter Super / LB term via Integrity |
| `corebridge` | Corebridge (American General) | FE + term appointed (Select-a-Term / QoL Flex Term) |
| `moo` | Mutual of Omaha / United of Omaha | FE + Term Life Answers |
| `amam` | American Amicable | Easy Term SI + FE (SI marketplace) |
| `assurity` | Assurity | Term + FE whole life (Protect+) |
| `aetna` | Aetna / Accendo | FE-focused (Accendo / Protection Series) |
| `americo` | Americo | **Appointed** — Eagle Premier / Eagle Guaranteed FE; confirm Integrity product labels during harvest |

## Marketplace-only (appeared in Integrity harvest; not MVI appointed)

Banner Life, Symetra, Protective, Prudential, Pacific Life, Principal, Lincoln, Minnesota Life, John Hancock, Nationwide, North American — treat as **comparison/education only** until appointed.

## Integrity product coverage notes (2026-08 harvest)

- **Fully Underwritten Term Preferred Best NT:** marketplace regularly includes Transamerica, Corebridge, United of Omaha among appointed carriers. Americo / American Amicable / Assurity / Aetna typically **do not** appear in FU Preferred Best result sets (they are FE or SI products).
- **Simplified Term:** use for AmAm Easy Term and other SI products Julie sells.
- **Final Expense:** use Integrity `Final Expense` Quick Quote for Assurity / MOO / AmAm / Accendo / Americo / Corebridge / Transamerica FE cards.

Update this file when appointments change, then re-run `npm run term:import-integrity` to refresh `is_mvi_appointed` flags.
