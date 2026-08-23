# Americo Financial Life — knowledge harvest

**Captured:** 2026-08-23 via MVI Agent Browser Bridge (Julie session, `portal.americoagent.com`)  
**Issuer:** Americo Financial Life and Annuity Insurance Company, Kansas City, MO (not NY)  
**Agent:** Braunsroth, Julie R · agent # RIT0MD-335  
**Use:** Internal agent / RAG. Agent guides are **FOR AGENT USE ONLY** — do not republish full manuals on public marketing pages.

**Julie product scope:** [`JULIE_PRODUCT_SCOPE.md`](./JULIE_PRODUCT_SCOPE.md)  
**Product inventory:** [`LIFE_PRODUCTS.md`](./LIFE_PRODUCTS.md)  
**Staff MASTER:** [`MASTER_AMERICO_KNOWLEDGE.md`](./MASTER_AMERICO_KNOWLEDGE.md)  
**Underwriting & agent ops:** [`MASTER_AMERICO_UW_AND_AGENT.md`](./MASTER_AMERICO_UW_AND_AGENT.md)  
**State notes:** [`STATE_AVAILABILITY.md`](./STATE_AVAILABILITY.md)  
**Public chatbot seed:** `scripts/knowledge_seed_americo.csv`

**Internal RAG:** `carrier=americo` in `internal_knowledge_chunks` via  
`node scripts/embed-internal-knowledge.js --only=americo`

**Public RAG:**  
`python3 scripts/ingest_knowledge_to_supabase.py --csv scripts/knowledge_seed_americo.csv --source-name americo_portal_20260823`

Public **carrier HTML pages are live:** `carriers/americo.html` and `en/carriers/americo.html` (children: `americo-infantil.html` / `americo-children.html`).

## Portal product resources Julie can sell

| Market | Products |
|--------|----------|
| Final Expense | Eagle Select Series (tiers 1 / 2 / 3) |
| General Life | AdvantageWL · Instant Decision IUL |
| Term | CBO 100/50 · Term 125/100 · Continuation 10/25 · Payment Protector (+ Continuation) · ADB · LifeTerm Series |
| Annuity | Elite 5 · Platinum Assure 5 (CA) · Platinum Assure Series |

## Key PDFs (`raw/pdfs/`)

**135 informational PDFs opened** (agent guides, UW flyers, client brochures, sales tools, Julie-state AdvantageWL apps, UW questionnaires, replacement notices, annuity suitability). Catalog of every portal File/Get ID is `raw/harvest-20260823/applied-catalog.json` (171 unique). Admin-only service forms (W-9, address change, payroll deduction, etc.) were cataloged but not stored.

Pass 1 = specs/UW guides. Pass 2 = Sales Tools flyers, questionnaires, apps, suitability. Pass 3 = remaining replacement/PAC/fax forms. See [`FORMS_AND_QUESTIONNAIRES.md`](./FORMS_AND_QUESTIONNAIRES.md).

| File | Use |
|------|-----|
| `Eagle_Select_Agent_Guide_21041` | FE specs, Quit Smoking Advantage, knockouts, build chart |
| `Eagle_Select_Underwriting_Flyer_20894` / `Eagle_Select_Reference_Sheet_21108` / `Eagle_Select_Spec_Flyer_20725` | FE UW + state grid |
| `Instant_Decision_eApp_UW_Quick_Reference_21216` | eApp medical limits + build charts |
| `AdvantageWL_Agent_Guide_19271` + `AdvantageWL_UW_Quick_Reference_21217` | WL specs, paper UW, rate/$1,000 |
| `IUL_Agent_Guide_20900` + `IUL_Highlights_20901` | IUL specs + living benefits |
| `Instant_Decision_Term_Agent_Guide_20911` + `Term_Products_at_a_Glance_20590` | Term/UL/CBO/Payment Protector |
| `DIR_Occupations_Guidelines_20166` | Disability Income Rider occupations |
| `Elite_5_Agent_Guide_21282` · `Platinum_Assure_Series_Agent_Guide_20284` · `Platinum_Assure_5_Agent_Guide_20203` | Annuities |
| `Annuity_Products_at_a_Glance_20205` · `Current_Interest_Rates_21276` | Rates snapshot 7/31/2026 |
| `Product_Availability_Guide_21058` | State grid as of 2/13/26 |
| `Contracting_New_Business_Guidelines_20878` · `Who_to_Call_21286` | Agent ops |

Raw portal JSON: `raw/harvest-20260823/`.

## Public-safe snapshot (chatbot)

- **Eagle Select** simplified-issue whole life for funeral/final expenses: issue ages **40–85** (tier 3 and some nicotine classes stop at **75**); faces **$5,000–$50,000** (age/tier capped); no medical exam; 3 automatic health tiers; smokers may get non-nicotine rates for the first **3 years** (Quit Smoking Advantage on tiers 1–2).
- **AdvantageWL** permanent whole life, ages **0–75**, min **$15,000** (children) / **$25,000** (adults).
- **Instant Decision IUL** ages **18–70**, faces **$50,000–$450,000**, non-medical, living benefits included.
- **Instant Decision Term** simplified issue, typically **$25,000–$450,000**, living benefits on most plans, CBO return-of-premium UL, Payment Protector monthly-income decreasing term, Continuation (term then permanent at 10%/25%).
- **Annuities:** Elite 5 indexed SPIA/FIA; Platinum Assure Series MYGA (2–7 year guarantees). Rates change — do not quote stale interest rates to consumers as guaranteed current offers.
- Point readers to the **licenses** page for where Mejor Vida can write business. Do not list licensed states in chatbot copy.
