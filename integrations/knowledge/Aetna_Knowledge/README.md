# Aetna Senior Supplemental / Accendo — knowledge harvest

**Captured:** 2026-07-28 · **Portal re-check:** 2026-08-30 Accendo cardiac via AQE sandbox (`raw/harvest-20260830/`); catalog 2026-08-09 (`raw/harvest-20260809/`) via MVI Agent Browser Bridge (Julie session, portal `aetnaseniorproducts.com`)  
**Agent account:** Mejor Vida Insurance LLC (GNW5050773)

## Important scope note (Mejor Vida)

Aetna Senior Supplemental sells **Medicare Supplement + senior supplemental health + final expense whole life**.  
For Mejor Vida public FE pages / Julie FE quoting, the **life** products are:

| Product | Underwriter | Notes |
|---------|-------------|--------|
| **Accendo Final Expense** (CVS/Accendo branded FE) | Accendo Insurance Company (**ACC**, NAIC **#63444**) | Primary FE whole life Julie uses under Aetna appointment |
| **Protection Series℠ Final Expense** | Continental Life of Brentwood, TN (**CLI**) | Also FE whole life on the same portal availability chart |

All other portal products (Med Supp, Cancer/Heart/Stroke, Hospital Indemnity Flex, DVH, Home Care, Recovery Care, etc.) are **not** traditional life insurance for the Mejor Vida FE site unless Julie expands scope later.

## Entities on the portal
- AHLIC, AHIC, ACI, CLI, Accendo (ACC)
- Policy admin often via Aetna Life Insurance Company and affiliates
- Brand: Aetna Senior Supplemental Insurance (CVS Health family)

## Documents harvested (`raw/pdfs/`)

| File | Source | Use |
|------|--------|-----|
| `AccendoFE_AdministrativeSalesHandbook.pdf` | Portal Reference → Accendo FE Sales Handbook | Ops + product admin (FP only) |
| `FinalExpenseACC_webinar.pdf` | Public ToolsAndTraining | Plan ages/faces/riders overview |
| `CGFLP04359_PRODUCER_GUIDE.pdf` | Portal Reference → Producer guide | Full SSI producer ops (FP only) |
| `CGFMP08411_ProductOverviewTraining.pdf` | Portal Reference → Product overview | **Full product lineup one-pager** |
| `CGFMP06547_DOCUMENT_UNDERWRITING_FAQ_090823.pdf` | Portal Reference → UW FAQ | Quote & Enroll automated UW / Milliman |
| `AccendoFE_DrugList.pdf` | Portal Reference → Accendo FE drug list | UW drug list (FP only) |
| `CGFMS02664_MedSuppGIplans.pdf` | Portal Reference → Guaranteed Issue | **Med Supp GI** (not FE life) |
| `Accendo-Final-Expense-Brochure-2025.pdf` | Public brochure mirror | Consumer-safe plan tables |
| `ACCFE06490_CASH_VALUE_FNLEX_ACC_093021.pdf` | Forms & Documents → Accendo FE ACV Chart | Accendo cash value chart (FP) |
| `CLIFE07472_CASH_VALUE_FNLEX_120221.pdf` | Forms & Documents → CLI FE ACV Chart | Protection Series CLI FE cash value chart (FP) |
| `PHS-ACC-ChangeOfBeneficiary.pdf` | Forms & Documents | Accendo change of beneficiary |
| `Aetna-Accendo-Final-Expense-Brochure.pdf` | Public brochure mirror | Short Freedom brochure |
| `product-availability.png` / `product-availability-full.png` | Portal Product Availability | Screenshots |
| `CGFLP01577ProductAvailabilityChart.pdf` | Portal embedded chart URL | **State availability** (eff. 05-11-26) — see `STATE_AVAILABILITY.md` |
| `CGFMP03457ProductDescriptionFlyer.pdf` | ToolsAndTraining/Forms | Accendo + CLI FE one-pager specs |
| `CGFMP08395_AboutAetnaSSI.pdf` | Reference → About Us | Company / portfolio overview |
| `ACCFE08386_ConsumerPostcard.pdf` | Flyers & Ads / broker pdfs | Accendo FE consumer postcard |
| `ACCFE08387_ConsumerFlyer.pdf` | Flyers & Ads / broker pdfs | Accendo FE consumer flyer |
| `CLIFE07615_FinalExpenseConsumerPostcard.pdf` | ToolsAndTraining/Forms | CLI / Protection Series FE consumer postcard |
| `CGFFE07557_ProtectionSeriesFinalExpenseAgentFlyer.pdf` | ToolsAndTraining/Forms | Protection Series FE agent flyer (CLI AM Best A) |
| `CGFMP03462MedSuppFEFlyer.pdf` | ToolsAndTraining/Forms | Med Supp + FE combo agent flyer (marketing) |
| `raw/images/CLIFE07616_FinalExpenseConsumerEmail.jpg` | ToolsAndTraining/Forms | PS FE consumer email image (not PDF) |

**Life products (complete):** [`LIFE_PRODUCTS.md`](./LIFE_PRODUCTS.md)

## Accendo FE snapshot (public-safe)

- Issue ages: Level **40–89**; Modified **40–75** (ALB)
- Faces: Level **$2k–$50k** age-banded; Modified **$2k–$25k**
- No medical exam; health questions + Rx/claims databases (Milliman IntelliScript in Quote & Enroll)
- Level: full DB from issue; Modified: 110% premiums yrs 1–2 non-accidental; full yr 3+
- Annual policy fee **$40**
- Level riders: accelerated DB, accidental death (40–70), child/grandchild term
- Super preferred rate tier (when qualifies) cited in FE webinar materials
- Social Security payment-date billing option cited in webinar materials

## Portal product lineup (from Product Overview CGFMP08411)

1. Medicare Supplement (ACI/AHIC/AHLIC/CLI)
2. **Final Expense Whole Life (ACC/CLI)** ← life
3. Cancer and Heart Attack or Stroke Plus (CLI)
4. Home Care Plus (CLI)
5. Recovery Care (CLI)
6. Hospital Indemnity Flex (CLI)
7. Home Recovery Care (CLI) — TX only
8. Dental, Vision and Hearing Flex / Plus / standard (CLI)

## Julie / public site status

- Public ES/EN pages: `carriers/aetna.html`, `en/carriers/aetna.html` — **both** Accendo FE (Level/Modified) and Protection Series CLI FE (Level) + ratings
- Both life products marked `julieInScope: true` in `product-inventory.json`
- Chart ratings still use Aetna Life CIS **#60054** with note that FE underwriter is Accendo **#63444**
- Internal MASTER: [`MASTER_AETNA_FE_KNOWLEDGE.md`](./MASTER_AETNA_FE_KNOWLEDGE.md) · full life inventory: [`LIFE_PRODUCTS.md`](./LIFE_PRODUCTS.md)

## Staff RAG files (2026-08-09)

- [`MASTER_AETNA_FE_KNOWLEDGE.md`](./MASTER_AETNA_FE_KNOWLEDGE.md)
- [`LIFE_PRODUCTS.md`](./LIFE_PRODUCTS.md)
- [`MASTER_AETNA_UW_AND_AGENT.md`](./MASTER_AETNA_UW_AND_AGENT.md) — Quote & Enroll / Milliman / handbook UW + Accendo cardiac (AQE 2026-08-30)
- [`ACCENDO_CARDIAC_UW.md`](./ACCENDO_CARDIAC_UW.md) — human index for Accendo heart routing (embed via UW MASTER)
- [`MASTER_AETNA_DRUG_LIST.md`](./MASTER_AETNA_DRUG_LIST.md) — staff only
- [`STATE_AVAILABILITY.md`](./STATE_AVAILABILITY.md)
- Public chatbot seed: `scripts/knowledge_seed_aetna_fe.csv`

## Still optional
1. ~~Confirm NE/KS/NV Accendo checkmarks~~ — done via CGFLP01577 (all four Julie states Yes)
2. ~~Include Protection Series CLI FE on public pages / Julie scope~~ — done
3. Accendo CIS index for #63444 (separate ratings pull)
4. Optional portal Flyers & Ads consumer/agent mailers (marketing only; specs already covered)
