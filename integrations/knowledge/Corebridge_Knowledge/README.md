# Corebridge Financial — Final Expense knowledge (Connext harvest)

**Captured:** 2026-07-26 via Julie’s Connext session (MVI Agent Browser Bridge)  
**Issuer:** American General Life Insurance Company (AGL), Houston, TX (not NY; NY via US Life where applicable)  
**Use:** Internal agent / RAG knowledge only. Many linked guides are financial-professional materials — do not republish full restricted manuals on public marketing pages.

**Agent product scope (Julie):**
| In scope (harvest / RAG) | Out of scope |
|--------------------------|--------------|
| Final expense — SIWL + GIWL | **IUL** (index universal life) |
| Term life | **Annuities** (index / income / fixed / Assured Edge) |
| Guaranteed Universal Life (GUL) | Other accumulation / “financial” product lines |
| Whole life (non-IUL permanent protection) | |

**Start here for FE RAG:** [`MASTER_COREBRIDGE_FE_KNOWLEDGE.md`](./MASTER_COREBRIDGE_FE_KNOWLEDGE.md)  
**Full internal MASTER (Product Selector RAG):** [`MASTER_COREBRIDGE_KNOWLEDGE.md`](./MASTER_COREBRIDGE_KNOWLEDGE.md)  
**Julie sell / don’t-sell:** [`JULIE_PRODUCT_SCOPE.md`](./JULIE_PRODUCT_SCOPE.md)  
**State rules:** [`STATE_AVAILABILITY.md`](./STATE_AVAILABILITY.md)

**Internal RAG:** carrier=`corebridge` in `internal_knowledge_chunks` via  
`node scripts/embed-internal-knowledge.js --only=corebridge`  
Complex eval: `node scripts/test-corebridge-internal-rag.js`

## Products Julie’s Connext FE path surfaces

### 1) SimpliNow Legacy® — Simplified Issue Whole Life (SIWL)
- **Audience:** Final expense clients **ages 50–80** (ALB)
- **Structure:** Two death-benefit paths on **one eApp** — **Level (Legacy Max)** and **Graded (Legacy)**
- **Process:** Instant underwriting decisions / final offers in-app
- **Faces:** $5,000–$35,000 (max by age / Level vs Graded / tobacco — see MASTER)
- **Docs:** AGLC201192 (producer), AGLC201453 (UW)

### 2) Guaranteed Issue Whole Life (GIWL)
- **Audience:** Ages **50–80**; **no health questions / no exams**; acceptance guaranteed
- **Faces:** $5,000–$25,000; graded DB years 1–2 (110% of premiums)
- **Docs:** AGLC200472 (producer), AGLC200471 (rates as of 12/07/2024)

## Captured PDFs (`raw/pdfs/`)
| File | Status |
|------|--------|
| `AGLC200471-GIWL-Rates.pdf` (+ `.txt`) | Done |
| `AGLC200472-GIWL-Producer-Guide.pdf` (+ `.txt`) | Done |
| `AGLC101638-Field-Underwriting-Guide.pdf` (+ `.txt`) | Done (general Life Field UW; term/perm-focused) |
| `AGLC201192-SIWL-Producer-Guide.pdf` (+ `.txt`) | Done |
| `AGLC110190-AGL-State-Availability.pdf` (+ `.txt`) | Done (Term/UL/WL conversion — **no SIWL/GIWL rows**) |
| `AGLC104704-Select-a-Term-Product-Highlights.pdf` (+ `.txt`) | Done |
| `AGLC108539-Term-Conversion-FAQs.pdf` (+ `.txt`) | Done (13 pp — primary conversion ops) |

## State-specific
See [`STATE_AVAILABILITY.md`](./STATE_AVAILABILITY.md). AGLC110190 captured but **does not include SIWL/GIWL**; FE state rules from producer guides + live quoter verification.

## Still optional / later
1. Premium Class Translation Table / AU+ AGLC110667 (pull when a live case needs it)
2. Public ES/EN carrier page (consumer-safe copy only — not FP tables)

## Raw captures
JSON dumps + screenshots from the bridge are in `raw/` (product pages, UW hub, FE onboarding, etc.).
