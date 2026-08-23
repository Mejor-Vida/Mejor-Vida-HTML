# Pending carrier appointments (do not publish yet)

Julie noted these **new appointments** on 2026-07-19. Store for later site/RAG content only — **do not** add homepage cards, carrier pages, logos, or public copy until agent-portal access and product details are available.

## Appointed (pending content build-out)

| Carrier        | Status                         | Notes |
|----------------|--------------------------------|-------|
| Corebridge     | FE public page live; Term/GUL/WL internal RAG ready | **Sells:** FE (SIWL/GIWL), Term, GUL, Whole Life. **Does not sell:** IUL or annuities/financial products. Public pages: `carriers/corebridge.html` + `en/carriers/corebridge.html`. Internal RAG in `Corebridge_Knowledge/`. Staff Product Selector UI deferred. |
| Transamerica   | FE public page live            | FE-only pages: `carriers/transamerica.html` + `en/carriers/transamerica.html` (Express + portfolio). Term page deferred. |
| Aetna (Accendo + CLI PS FE) | Appointed; **full FE life knowledge + public pages** | Accendo FE (40–89 Level/Modified) + Protection Series FE CLI (45–89 Level). Knowledge: `integrations/knowledge/Aetna_Knowledge/LIFE_PRODUCTS.md`. Pages: `carriers/aetna.html` + `en/carriers/aetna.html`. |
| Americo        | **Public pages live** (2026-08-22) | **Sells:** Eagle Select FE (tiers 1/2/3, ages 40–85), AdvantageWL, Instant Decision IUL, Instant Decision Term Series (CBO, Term 100/125, Continuation, Payment Protector, ADB, LifeTerm), Elite 5, Platinum Assure Series. Knowledge: `integrations/knowledge/Americo_Knowledge/`. Pages: `carriers/americo.html` + `en/carriers/americo.html` (+ children: `americo-infantil.html` / `americo-children.html`). |

## Already on the public site

- Assurity
- Mutual of Omaha
- American Amicable
- Corebridge (FE overview pages + homepage trust-strip links)
- Transamerica (FE overview pages + homepage trust-strip links)
- Homepage carrier trust strip shows **Aetna**; dedicated carrier pages live under `carriers/aetna.html`
- Americo (FE + AdvantageWL / term / IUL overview pages + homepage trust-strip + quoter logos)

## When ready to build

1. Collect logos + approved product blurbs from each agent portal.
2. Add ES/EN carrier pages under `carriers/` and `en/carriers/`.
3. Update homepage `#carriers` section + any quote/chatbot carrier lists.
4. Add knowledge folders under `integrations/knowledge/` as needed for RAG.
