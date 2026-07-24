# Transamerica — Complete Internal Knowledge Base
## For Product Selector Internal RAG System
**Carrier:** Transamerica Life Insurance Company (and TFLIC where noted)
**Agent states focus:** Nebraska, Kansas, Colorado, Nevada | **Agent:** Julie
**Compiled:** 2026-07-22 (updated with full UW chart extracts; page sections preserved)
**Scope:** Final Expense (Express + portfolio), Trendsetter term (Super/LB), Lifetime whole life, cross-product underwriting & ops.
**Underwriting:** Full decision charts / age-amount grids are included in this MASTER (not summary-only).
**Out of scope for this MASTER:** IUL product deep-dive / live IUL rates (not requested). Term/Lifetime premiums require carrier illustration system when not in CSV.
**Sources:** Brandfolder CDN PDFs + myTransware lite FE quoter metadata under `integrations/knowledge/Transamerica_Knowledge/`

---


<!-- source:FE_EXPRESS_TOOLKIT_INVENTORY.md -->

# Transamerica FE Express Toolkit — page inventory

**Source page:** [FE Express toolkit](https://www.transamerica.com/financial-pro/insurance/FE-express-toolkit)  
**Captured:** 2026-07-22  
**Note:** Direct `curl` to transamerica.com is blocked by Incapsula bot protection. Page titles below come from a successful content fetch of the toolkit HTML. **CDN/PDF URLs still need to be copied from the live page** (right-click → Copy link address) and pasted here for download.

## Priority downloads for RAG + rates (need CDN URLs)

| # | Toolkit label | Why we need it | Status |
|---|---------------|----------------|--------|
| 1 | FE Express Solution **Agent and Underwriting guide** | Rates, UW charts, build chart, Rx list | **DONE** — `FE_EXPRESS_AGENT_GUIDE.md` + `fe_express_rates.csv` |
| 2 | FE Express Solution **product spec sheet** | Face/age/modes/fees summary | **DONE** — `FE_EXPRESS_SPEC_SHEET.md` |
| 3 | **Comparison flyer** (FE options side-by-side) | FE Express vs Immediate/10-Pay/Easy | **DONE** — `FE_EXPRESS_COMPARISON_FLYER.md` |
| 4 | Final Expense **Agent and Underwriting guide** (portfolio) | Older FE line rates/UW | **DONE** — `FE_PORTFOLIO_AGENT_GUIDE.md` + `fe_portfolio_rates.csv` |
| 5 | Download **new agent and underwriting guide** (Underwriting section) | May be same as #1 or update | Likely same as #1 (Express) or #4 — confirm if a newer CDN appears |

## Already captured from email CDN links

- Product availability by state  
- Rider state availability  
- FE Express remote signature flyer  
- PIN to Sign FAQs (+ video/webinar URLs noted, media not stored)  
- Meet the Underwriter webinar URL (media not stored)  
- FE Express “Game-Changing” overview PDF (alt host)  
- Trendsetter professional field guide (alt host)

## Other toolkit items (lower priority / mostly ops or marketing)

### Training
- FE Express training course  
- **Enhanced Digital UW Application** (Articulate Rise) — **URL + meta only** — `ENHANCED_DIGITAL_UW_ARTICULATE_COURSE.md` (**Term/IUL only, excl. NY — not Whole Life / FE**)  
- FE Express Launch webinar *(have URL from email)*  
- FE Express Promo Training Video — **URL only** — `FE_EXPRESS_PROMO_TRAINING_VIDEO.md` (MP4 ~103 MB, not stored; last-mod 2026-01-21)  
- FE Express: Deep Dive with Everest  
- FE Express: Meet the Underwriter *(have URL)*  
- Final Expense iGO® e-App training  
- PIN to sign video *(have URL)*  

### FE Express collateral
- Consumer brochure (public) — **DONE** — `FE_EXPRESS_CONSUMER_BROCHURE.md`  
- Benefit flyer — **DONE** — `FE_EXPRESS_BENEFIT_FLYER.md`  
- Consumer video / Agent video — Consumer: **URL only** — `FE_EXPRESS_CONSUMER_VIDEO.md` (MP4 ~166 MB, not stored); Agent: **URL only** — `FE_EXPRESS_AGENT_VIDEO.md` (MP4 ~149 MB, not stored)  
- Prospecting flyer — **DONE** — `FE_EXPRESS_EVEREST_PROSPECTING_FLYER.md` (Everest Concierge)  
- Competitive Advantage flyer — **DONE** — `FE_EXPRESS_COMPETITIVE_ADVANTAGE_FLYER.md`  
- Consumer trifold  

### Portfolio collateral
- Final Expense Quick Quote tool — **DONE** — `MYTRANSWARE_FE_QUOTE_TOOL.md` (myTransware WL3 Immediate/10-Pay/Easy; **not** FE Express)  
  - https://mytranswarequote.transamerica.com/Wl3.html?id=WL3IM  
- Final Expense Enhancements flyer — **DONE** — `FE_PORTFOLIO_ENHANCEMENTS_FLYER.md` (Immediate/10-Pay/Easy; ©2023 — **not** Express)  
- Veterans flyer — **DONE** — `FE_PORTFOLIO_VETERANS_FLYER.md`  
- eDelivery / eSignature flyer — **DONE** — `FE_EDELIVERY_ESIGNATURE_FLYER.md` (DocuSign/DocFast; IUL/term/FE)  
- Final Expense Consumer brochure — **DONE** — `FE_PORTFOLIO_CONSUMER_BROCHURE.md` (Immediate/10-Pay/Easy)  

### FAQs
- Toolkit FAQs section (applications / selling experience) — **Need link** if PDF

## How to hand off the missing PDFs

On the toolkit page, for each priority row above:
1. Right-click the document name  
2. **Copy link address** (should look like `https://cdn.bfldr.com/86JM1UOD/as/...`)  
3. Paste here  

Start with **Agent and Underwriting guide** + **product spec sheet**.


<!-- source:LIFETIME_TOOLKIT_INVENTORY.md -->

# Transamerica Lifetime℠ — Toolkit Inventory

**Captured:** 2026-07-22  
**Product:** Non-participating whole life · Form **ICC19 TPWL12IC-1018** · Transamerica Life · **Not available in New York**

| Asset | Status | Knowledge file |
|-------|--------|----------------|
| Consumer Brochure | **DONE** (6 pp, 126940R2, 04/26) | `LIFETIME_CONSUMER_BROCHURE.md` |
| Product Spec Sheet | **DONE** (2 pp, 126941R2, 04/26) | `LIFETIME_PRODUCT_SPEC_SHEET.md` |
| Agent Guide | **DONE** (21 pp, 126939R3, 04/26) | `LIFETIME_AGENT_GUIDE.md` |
| Whole Life Underwriting Guide | **DONE** (33 pp) | `LIFETIME_UNDERWRITING_GUIDE.md` |

## Gap

**Premium rate tables** — not published in these PDFs (non-illustratable; use carrier illustration / WELIS).

## Source URLs

- https://cdn.brandfolder.io/86JM1UOD/as/qfaexh-3er7tk-f41tpw/Transamerica_Lifetime_-_Consumer_Brochure  
- https://cdn.brandfolder.io/86JM1UOD/as/qfaexg-1royao-2tv5fn/Transamerica_Lifetime_-_Product_Spec_sheet  
- https://cdn.brandfolder.io/86JM1UOD/as/qfaexd-50m55s-d8nsns/Transamerica_Lifetime_-_Agent_Guide.pdf  
- https://cdn.brandfolder.io/86JM1UOD/as/qf8bz4-977wsw-5emcas/Lifetime_Whole_Life_Underwriting_Guide_Brochure.pdf  


<!-- source:TERM_TOOLKIT_INVENTORY.md -->

# Transamerica Term Toolkit — Inventory

**Toolkit page:** [Term toolkit](https://www.transamerica.com/financial-pro/insurance/term-toolkit) (Incapsula often blocks automated fetch)  
**Captured:** 2026-07-22  
**Knowledge folder:** `integrations/knowledge/Transamerica_Knowledge/`

## Ingested this session

| Asset | Status | Knowledge file |
|-------|--------|----------------|
| Trendsetter Term Life Guide for Insurance Professionals | **DONE** (30 pp, 12/25) | `TRENDSETTER_PROFESSIONAL_FIELD_GUIDE.md` |
| Term Life Conversion Guide | **DONE** (8 pp) | `TERM_LIFE_CONVERSION_GUIDE.md` |
| Income Protection Option flyer | **DONE** (2 pp) | `TRENDSETTER_IPO_FLYER.md` |
| Where We Win brochure (Super reprice) | **DONE** (4 pp) | `TRENDSETTER_WHERE_WE_WIN.md` |
| Trendsetter Super Transition Rules | **DONE** (1 p) | `TRENDSETTER_SUPER_TRANSITION_RULES.md` |
| Consumer Guide to Trendsetter Super Series | **DONE** (8 pp, light text) | `TRENDSETTER_SUPER_CONSUMER_GUIDE.md` |
| Producer Presentation PPTX (133027R8 10/25) | **DONE** (42 slides; notes extracted) | `TRENDSETTER_PRODUCER_PRESENTATION.md` |
| Trendsetter LB Consumer Brochure (English) | **DONE** (20 pp, 122982R6) | `TRENDSETTER_LB_CONSUMER_BROCHURE.md` |
| Trendsetter LB Sales Comparison Flyer | **DONE** (2 pp, 133026R5) | `TRENDSETTER_LB_SALES_COMPARISON_FLYER.md` |

## Prior related assets (already in folder)

- `source_pdfs/Trendsetter_Term_Guide_Professionals.pdf` — earlier copy of field guide  
- myTransware term product IDs in `Products.json`: `TS110`–`TS130`, `TS1YR`, `LB110`–`LB130`  
- `ENHANCED_DIGITAL_UW_ARTICULATE_COURSE.md` — Term/IUL digital UW (not Whole Life)

## Critical gaps (term)

1. **Full premium rate tables** — not in field guide PDFs; live rates via Transamerica illustration / WELIS / Agent Home  
2. **Nonmed age/amount grids** — referenced; details often in UW guide / illustration system  
3. **Monthly DI rider occupational listing** — producer deck points to UW guide  

## Source URLs

- https://cdn.brandfolder.io/86JM1UOD/as/qf9niy-fhulrk-7kcn4t/Trendsetter_Term_Life_Guide_for_Insurance_Professionals  
- https://cdn.brandfolder.io/86JM1UOD/as/qf8c8t-fywgj4-6wjhrz/Term_Life_Conversion_Guide  
- https://cdn.bfldr.com/86JM1UOD/at/35hjg92pt59xsztrm538twnr/115196R2_0820_Transform_Income_Protection_Option_Flyer_FINAL_Digital  
- https://cdn.bfldr.com/86JM1UOD/as/hsm3mj4pk4ws8vjhk4mn9kx/Transamerica_Trendsetter_Where_We_Win_Brochure  
- https://cdn.bfldr.com/86JM1UOD/as/757hw5rxbjwbstrmgcbj3r5f/Transamerica_Trendsetter_Super_Transition_Rules  
- https://cdn.brandfolder.io/86JM1UOD/as/qf8byr-2txu74-f11pfq/Consumer_Guide_to_Transamericas_Trendsetter_Super_Series  
- https://cdn.brandfolder.io/86JM1UOD/as/qf9nj0-45c77k-9u1639/Trendsetter_LB_Consumer_Brochure_English  
- https://cdn.brandfolder.io/86JM1UOD/as/qf89kq-3uf0w-g3br98/Trendsetter_LB_Sales_Comparison_Flyer  


<!-- source:UNDERWRITING_TOOLKIT_INVENTORY.md -->

# Transamerica Underwriting — Toolkit Inventory

**Captured:** 2026-07-22  

Cross-product UW materials (Term / IUL / Lifetime / FE / foreign national / large case).

| Asset | Status | Knowledge file |
|-------|--------|----------------|
| Enhanced Digital UW Articulate course | **DONE earlier** (Term/IUL only; not WL) | `ENHANCED_DIGITAL_UW_ARTICULATE_COURSE.md` |
| Term & IUL UW Guide (ICC states) | **DONE** (36 pp, 08/25) | `TERM_IUL_UNDERWRITING_GUIDE.md` |
| FE Enhancements Flyer | **DONE earlier** | `FE_PORTFOLIO_ENHANCEMENTS_FLYER.md` |
| Lifetime Whole Life UW Guide | **DONE earlier** | `LIFETIME_UNDERWRITING_GUIDE.md` |
| Tobacco / Nicotine / Marijuana flyer | **DONE** | `UW_TOBACCO_NICOTINE_MARIJUANA.md` |
| Resident Foreign Nationals & Travel Guidelines | **DONE** (8 pp) | `UW_FOREIGN_NATIONALS_TRAVEL.md` |
| Internal Retention Limits Flyer | **DONE** | `UW_RETENTION_LIMITS.md` |
| Large Case Unit Underwriting Flyer | **DONE** | `UW_LARGE_CASE_UNIT.md` |
| Consumer Guide to Underwriting Process | **DONE** | `UW_CONSUMER_GUIDE.md` |

## Source URLs (this batch)

- https://share.articulate.com/LZPWQWu0mLzTS-W6Hdh9c#/  
- https://cdn.bfldr.com/86JM1UOD/as/vsg5vfmmm63rmms8gwt6nw/Transamerica_Term_and_IUL_Underwriting_Guide_for_ICC_States  
- https://cdn.bfldr.com/86JM1UOD/as/4jprgq9bq5f9fb3wghn8fcp5/Final_Expense_Enhancements_Flyer  
- https://cdn.brandfolder.io/86JM1UOD/as/qf8bz4-977wsw-5emcas/Lifetime_Whole_Life_Underwriting_Guide_Brochure  
- https://cdn.brandfolder.io/86JM1UOD/as/hz6x3gwx8995vs6cr969br/Underwriting_Sales_Enablement_Flyer_for_tobacco_nicotine_marijuana  
- https://cdn.bfldr.com/86JM1UOD/as/qfxz3k-fcr8oo-8vwrvt/Resident_Foreign_Nationals_Travel_Guidelines_Flyer  
- https://cdn.bfldr.com/86JM1UOD/as/tks7xgpwjbfngct7kk9jp/Internal_Retention_Limits_Flyer  
- https://cdn.bfldr.com/86JM1UOD/as/qf8h8q-3uoovs-fg1w5d/Large_Case_Unit_Underwriting_Flyer  
- https://cdn.bfldr.com/86JM1UOD/as/qfaewj-g849qw-62x59u/Consumer_Guide_to_Underwriting_Process  


<!-- source:FE_EXPRESS_UNDERWRITING_CHARTS.md -->

# Transamerica FE Express — Underwriting Charts

**Product focus:** FE Express Solution / Graded FE Express
**Source extract:** `source_pdfs/FE_Express_UW_charts_pages_9-17.txt`
**Guide:** FE Express Solution Agent Guide (rev 3247945R11) pages 9–17+
**Audience:** Agent use only — underwriting decision charts for internal RAG.
**Extracted:** 2026-07-22

This file contains the **full underwriting chart text** (not a summary). Use for impairment, class, build, Rx, and requirement questions.

## Transamerica FE Express — Underwriting Charts — Page 9

Transamerica uses new underwriting rules to offer the best rate 
possible and does not stack nonrelated medical conditions.
The proposed insured will most likely be PREMIER if …
• They demonstrate favorable health characteristics, meet Premier 
build guidelines, and do not have medical, prescription, or lifestyle 
factors that would result in a Select, Graded, or Decline.
The proposed insured will most likely qualify for SELECT if …
• Their medical conditions, lifestyle factors, and height/weight are ALL 
(rated Select) or they have multiple nonrelated medical conditions 
that are each independently (rated Select).
The proposed insured will most likely qualify for GRADED if …
• They have one medical condition (rated Graded), height/weight are 
Select, and ALL lifestyle factors are Select OR
• They have more than one medical condition (rated Graded) that is not 
considered a comorbidity or they have multiple nonrelated medical 
conditions that are each independently (rated Graded).
The proposed insured will most likely be declined if …
• They have one medical condition or one lifestyle factor that is rated 
as a Decline OR
• Their height/weight is rated as Decline OR
• They have more than one comorbidity
• Lifestyle factors include questions related to alcohol/drug use, 
driving record, and felonies. See Adult Single-Condition Decision 
Chart for specific Lifestyle ratings.
• A comorbidity refers to the presence of one or more additional 
diseases or disorders co-occurring in an individual. These conditions 
interact with each other, complicating medical management and 
treatment. (Example of comorbidity is tobacco use in combination 
with supplemental oxygen use).
Adult personal history
For Agent Use Only. Not for Use With the Public.
 9

## Transamerica FE Express — Underwriting Charts — Page 10

**Adult single-condition decision chart**
Condition Timeframe Decision
Alcohol treatment
<2 years
2–5 years
>5 years
Decline
Select
Premier
Alzheimer's disease Ever Decline
Amputation, not due to trauma Ever Decline
Amyloidosis Ever Select
Amyotrophic lateral sclerosis (ALS) Ever Decline
Angina (heart-related chest pain) 5 years Premier
Anxiety 1 year Premier
Aortic aneurysm Ever Select
Arrhythmia, heart 5 years Premier
Atrial fibrillation 5 years Premier
Autism Ever Select
Bariatric weight loss surgery Ever Premier
Bedridden Currently Decline
Bell's palsy Ever Premier
Bipolar disorder <5 years
>5 years
Select
Premier
Black lung disease Ever Select
Blindness 5 years Premier
Blood clots (DVT), no complications Ever Premier
Brain aneurysm <5 years
>5 years
Select
Premier
Bronchitis, chronic Ever Select
Cancer (recommended course of treatment completed, no 
spread to lymph nodes or other organs, and no recurrence)
With spread to lymph nodes or other organs, 
or recurrence, or cancer of multiple sites
<2 years
>2 years 
Decline 
Decline
See Cancer Decision 
chart on page 15
Cardiac surgery (pacemaker, stent, valvular, bypass, 
angioplasty, etc.)
<1 year
1–2 years
>2 years
Select
Premier
Premier
Cardiomyopathy Ever Select
Cerebral palsy Ever Decline
Chest pain 5 years Premier
Chronic kidney failure or recurrent dialysis
<1 year
1–5 years
>5 years
Graded
Select
Premier
Chronic kidney insufficiency, mild to moderate (no kidney 
failure or dialysis) Ever Premier
Chronic pain (pain lasting longer than 6 months) 5 years Premier
Cirrhosis Ever Graded
For Agent Use Only. Not for Use With the Public.10

## Transamerica FE Express — Underwriting Charts — Page 11

Condition Timeframe Decision
Cognitive disorder Ever Decline
Congestive heart failure (CHF) Ever Select
COPD, emphysema, chronic bronchitis Ever Select
Coronary artery disease (no heart attack, no surgery) 5 year Premier
Creutzfeldt-Jakob Disease Ever Decline
Crohn's disease Ever Premier
Cystic fibrosis Ever Decline
Defibrillator, cardiac Ever Decline
Dementia Ever Decline
Depression, major <5 years
>5 years
Select
Premier
Developmental disability Currently employed
Unemployed/disabled
Select
Decline
Diabetes
Treated with insulin in the past 12 months
Diagnosed before age 40
Diagnosed age >40, no insulin and 
no complications or comorbidities1
Select
Select
Premier 
Diabetes with complications (eye, kidney, nerve, etc.) Ever Select
Dialysis, kidney
<1 year
1–5 years
>5 years
Graded
Select
Premier
Down syndrome Ever Decline
Drug use
<2 years
2–5 years
>5 years
Decline
Select
Premier
DWI/OWI/DUI <2 years
>2 years
Graded
Premier
Eating disorder <5 years
>5 years
Select
Premier
Ehlers-Danlos syndrome Ever Premier
Electric scooter/cart 1 year Select
Emphysema, COPD, chronic bronchitis Ever Select
Encephalitis Ever Premier
Esophageal varices <2 years
>2 years
Decline
Select
Felony charges, or have such charges pending
<2 years
2–10 years
> 10 years
Decline
Premier
Premier
Gaucher's disease Ever Select
Gestational diabetes Ever Premier
Heart attack, single <1 year
>1 year
Select
Premier
For Agent Use Only. Not for Use With the Public.
1 Comorbidities may include heart disease, stroke, TIA, vascular disease, kidney disease, and liver disease.
11
**Adult single-condition decision chart cont’d**

## Transamerica FE Express — Underwriting Charts — Page 12

For Agent Use Only. Not for Use With the Public.
Condition Timeframe Decision
Heart attacks, multiple Ever Select
Heart murmur Ever Premier
Heart surgery (pacemaker, stent, valvular, bypass, 
angioplasty, etc.)
<1 year
1–2 years
>2 years
Select
Premier
Premier
Hemophilia or bleeding disorder Ever Select
Hepatitis B or C
<2 years
2–5 years
>5 years
Select
Premier
Premier
Hereditary angioedema Ever Select
HIV or AIDS Ever Decline
Hospice palliative, home healthcare, or adult day care Currently Decline
Hospitalization (2 or more times), other than childbirth 1 year Decline
Hunter syndrome Ever Select
Huntington's disease Ever Decline
Hydrocephalus Ever Select
Hypertension, controlled Ever Premier
Immune system disorders Ever Select
Incarceration or on probation or parole Currently Decline
Inpatient treatment for mental health disorder
<2 years
2–5 years
>5 years
Graded
Select
Premier
Intellectual disability, mild Ever Select
Intellectual disability, moderate to severe Ever Decline
Irregular heartbeat 5 years Premier
Kidney stone(s) Ever Premier
Liver disease/disorder (excluding fatty liver disease)
<2 years
2–5 years
>5 years
Select
Premier
Premier
Liver failure Ever Graded
Marfan syndrome Ever Premier
Marijuana use Ever Premier
Memory loss <2 years
>2 years
Decline
Premier
Mental health disorder resulting in inpatient treatment
<2 years
2–5 years
>5 years
Graded
Select
Premier
Mental incapacity Ever Decline
Mixed connective tissue disease (MCTD) Ever Select
Monoclonal gammopathy Ever Select
Motor neuron disease Ever Decline
Multiple sclerosis Ever Select
12
**Adult single-condition decision chart cont’d**

## Transamerica FE Express — Underwriting Charts — Page 13

For Agent Use Only. Not for Use With the Public.
Condition Timeframe Decision
Muscular dystrophy Ever Select
Myasthenia gravis Ever Premier
Myelodysplastic syndrome
<2 years
2–4 years
>4 years
Decline
Graded
Select
Myeloproliferative disorder Ever Select
Neurofibromatosis Ever Select
Neuromuscular disorder Ever Select
Niemann-Pick disease Ever Select
"Nursing home, assisted living, or long term  
care facility" Currently Decline
Optic neuritis <1 year
>1 year
Select
Premier
Organ transplant recipient or recommendation Ever Decline
Osteoporosis Ever Premier
Oxygen, supplemental (except for temporary condition 
immediately following injury or medical treatment/not 
exceeding 3 months)
<1 year
>1year
Graded
Premier
Pacemaker
<1 year
1–2 years
>2 years
Select
Premier
Premier
Pancreatitis, chronic Ever Select
Paraplegia Ever Graded
Parkinson's disease Ever Select
Pending tests, surgery, hospitalization, medical diagnosis, or 
test results 6 months Decline
Peripheral vascular/arterial disease 
(no amputation) Ever Select
Peripheral vascular/arterial disease 
(with amputation) Ever Decline
Pituitary adenoma Ever Premier
Poliomyelitis (polio) Ever Premier
Polycystic kidney disease Ever Select
Polymyositis <3 years
>3 years
Select
Premier
Pompe disease Ever Select
Post-traumatic stress disorder (PTSD) 2 years Premier
Pregnancy Current Premier
Premature birth (ages <4 only)
Born prior to 28 weeks
28–32 wks (current age <2 years)
28–32 wks (current age ≥2 years)
33 week or over
n/a
n/a
n/a
n/a
Psoriatic arthritis Ever Premier
Pulmonary embolism Ever Premier
13
**Adult single-condition decision chart cont’d**

## Transamerica FE Express — Underwriting Charts — Page 14

Condition Timeframe Decision
Pulmonary fibrosis Ever Decline
Pulmonary hypertension Ever Select
Quadriplegia Ever Graded
Reckless driving <2 years
>2 years
Graded
Premier
Rheumatoid arthritis Ever Premier
Sarcoidosis Ever Premier
Schizophrenia <5 years
>5 years
Select
Premier
Scleroderma Ever Premier
Seizures or epilepsy (excl. febrile seizures) <1 year
>1 year
Select
Premier
Sickle cell anemia Ever Decline
Sleep apnea (CPAP/treatment without supplemental oxygen/
oxygen concentrator use) Ever Premier
Stroke or cerebrovascular attack <5 years
>5 years
Select
Premier
Suicide attempt
<2 year
2–5 years
>5 years
Decline
Select
Premier
Systemic lupus erythematosus (SLE) Ever Select
Terminal illness (life expectancy is 12 months or less) Currently Decline
Tobacco use <1 year
>1 year
Select Tobacco
Premier
Tracheostomy Ever Select
Transient ischemic attack (TIA) or mini-stroke, 
single episode
<5 years
>5 years
Select
Premier
Tuberculosis <1 year
>1 year
Select
Premier
Ulcerative colitis Ever Premier
Wasting syndrome <1 year
>1 year
Select
Premier
Wernicke-Korsakoff syndrome <2 years
>2 years
Graded
Select
Wheelchair confinement (except for temporary condition 
immediately following injury or medical treatment/not 
exceeding 3 months)
1 year Graded
Wilson disease Ever Select
Wiskott-Aldrich syndrome Ever Select
For Agent Use Only. Not for Use With the Public.14

## Transamerica FE Express — Underwriting Charts — Page 15

For Agent Use Only. Not for Use With the Public.
**Cancer decision chart**
Cancer type
(Recommended course of treatment completed, no spread 
to lymph nodes or other organs, and no recurrence)
Timeframe since  
last treatment 
Decision 
 
Breast or  
testicular1 cancer
Less than 2 yrs
2–4 yrs ago
4 or more years ago
Decline
Select
Premier
Cervical1 or prostate 
cancer, or melanoma1
Less than 2 yrs
2–5 yrs ago
5 or more yrs ago
Decline
Select
Premier
Thyroid cancer Less than 2 yrs
2 or more yrs ago
Decline
Premier
Bladder, kidney, or colorectal cancer
Less than 2 yrs
2–4 yrs ago
4–10 yrs ago
10 or more yrs ago
Decline
Graded
Select
Premier
Other types of cancer
Less than 2 yrs
2–4 yrs ago
4 or more yrs ago
Decline
Graded
Select
1 Acceptable if only type of treatment was surgery (no chemotherapy, radiation, or other types of treatment)
15

## Transamerica FE Express — Underwriting Charts — Page 16

16 For Agent Use Only. Not for Use With the Public.

## Transamerica FE Express — Underwriting Charts — Page 17

For Agent Use Only. Not for Use With the Public.
Abacavir Epzicom Paraplatin
Acamprosate Erleada Pifeltro
Adlarity Etravirine Pomalyst
Adrucil Evotaz Prezcobix
Alimta Exelon Prograf
Antabuse Gengraf Raltegravir
Aricept Genvoya Rapamune
Atazanavir Gleevec Revlimid
Atripla Imbruvica Reyataz
Azathioprine Imnovid Ritonavir
Belbuca Imuran Rivastigmine
Bicalutamide Intelence Rukobia
Biktarvy Isentress Sandimmune
Brixadi Juluca Sirolimus
Bunavail Kaletra Sublocade
Buprenorphine HCl  Keytruda Suboxone
Buprenorphine HCl - Naloxone Lexiva Subutex
Cabanuva Lupron Symtuza
Campral Lynparza Tabrecta
Casodex Memantine Tacrolimus
Cellcept Mycophenolate mofetil Tasigna
Cyclosporine Myfortic Thalomid
Cytoxan Mytesi Tivicay
Disulfiram Naltrexone Triumeq
Dolutegravir Namenda Vidaza
Donepazil Neoral Vivitrol
Dovato Neosar Xtandi
Eligard Norvir Ziagen
Eloxatin Nubeqa Zubsolv
Emtriva Odefsey Zytiga
Envarsus Orgovyx
Proposed insureds currently taking any of the medications below will not be eligible for coverage with Transamerica 
FE Express SolutionSM or Transamerica Graded FE Express SolutionSM. Note: This list is not exhaustive and is subject 
to change at any time.
Prescription drugs that preclude coverage
17


<!-- source:FE_PORTFOLIO_UNDERWRITING_CHARTS.md -->

# Transamerica FE Portfolio — Underwriting Charts

**Product focus:** Immediate / 10-Pay / Easy Solution (portfolio FE)
**Source extract:** `source_pdfs/FE_Portfolio_UW_charts_pages_8-17.txt`
**Guide:** Final Expense Agent Guide with New UW Experience (2644970R5) pages 8–17+
**Audience:** Agent use only — underwriting decision charts for internal RAG.
**Extracted:** 2026-07-22

This file contains the **full underwriting chart text** (not a summary). Use for impairment, class, build, Rx, and requirement questions.

## Transamerica FE Portfolio — Underwriting Charts — Page 8

8
OUR APPROACH
Transamerica utilizes a digitally-enabled underwriting process built to deliver quick 
and more consistent decisions. This process provides a streamlined approach to 
underwriting risk selection, focusing on applicant-specific data such as personal history, 
height/weight, and health conditions.
ELECTRONIC MEDICAL DATA
We want to create as simple and seamless of an experience as possible for you and your 
client when it comes to collecting their health information.
• Our straightforward personal history and lifestyle questions coupled with diagnostic 
and prescription data direct from the healthcare provider eliminates the need for 
lengthy, intrusive health questions and traditional medical records.
• All electronic medical data will be ordered through Transamerica and will be 
administered through Transamerica-approved vendors, safely and securely.
INSURABLE INTEREST
Insurable interest must exist between the proposed insured, policy owner, payor, 
and beneficiary or beneficiaries. Underwriting reserves the right to make the final 
determination on the issuance of any policy.
AN APPLICATION IS VALID FOR 90 DAYS
Cases will close after 45 days if there are outstanding requirements but, if the 
requirements are received within 90 days, the case can be reopened for processing. 
A new application will be needed after 90 days.
UNDERWRITING GUIDELINES
DID YOU KNOW?
Your client may request more information about the health data 
we received in making our decision by contacting Milliman:
Email: FCRAReport@milliman.com
Phone: 877-211-4816
Mail: P.O. Box 2223, Brookfield, WI 53008

## Transamerica FE Portfolio — Underwriting Charts — Page 9

ACTIVITY
CREDIT
UNDERWRITING GUIDELINES
EVALUATING PHYSICAL ACTIVITY
We recognize regular physical activity performed during a few days of the week can lead to positive impacts on an 
individual’s health and well-being, which is why it is part of our holistic evaluation process. In some situations, we 
provide an Activity Credit, which can positively affect your client’s rating.
QUALIFICATIONS FOR ACTIVITY CREDIT
Type of activity: This can include routine activities such as walking the dog, gardening, 
mowing the yard, or other jobs requiring manual labor. Activity can also 
include jogging, running, using an elliptical, rowing machine, stationary 
bike, lifting weights, or other common exercises. 
Frequency and duration: Three or more days a week, for at least 10 consecutive minutes each time
WHEN DOES THE ACTIVITY CREDIT IMPACT THE UNDERWRITING DECISION?
An Activity Credit may qualify your client for a better rating outcome, depending on a number of factors, combined 
with the total evaluation of your client’s health profile. Below are two general scenarios where an Activity Credit may 
positively influence a decision. See Adult Single Condition Decision Chart  for more specific details and examples.
Scenario #1
The proposed insured’s height/weight is Preferred and they have only one  of the following medical conditions:
• Respiratory diseases or disorders such as COPD, black lung, or chronic bronchitis 
• Stroke or Transient Ischemic Attack (TIA)
• Hospitalization within the last 12 months  
NOTE: For the above medical conditions, the proposed insured rating would improve from Standard to Preferred.
Scenario #2
The proposed insured’s height/weight is the only risk factor. For example, if the proposed insured is a male, 5’6” 
250 pounds with no health conditions or other risk factors, exercises at least three days a week for 10 minutes each 
time, their rating could improve from Standard to Preferred.
9
APPLIES ONLY TO ADULTS  
(AGES 18 AND OVER)

## Transamerica FE Portfolio — Underwriting Charts — Page 10

ADULT PERSONAL HISTORY
GENERAL UNDERWRITING RULES (AGES 18 AND OVER)
The proposed insured will most likely be PREFERRED if … 
• Their medical conditions, lifestyle factors 1, and height/weight are ALL Preferred
The proposed insured will most likely be STANDARD if …
• ALL their medical conditions are Preferred and ALL lifestyle factors and height/weight are Standard OR
• They have one medical condition (rated Standard), height/weight are Preferred, and ALL lifestyle factors  
are Preferred or Standard
The proposed insured will most likely be GRADED if …
• They have one medical condition (rated Graded), height/weight are Standard or Preferred, and ALL lifestyle 
factors are Graded or better OR
• They have two medical conditions that are Standard, height/weight are Standard or Preferred, and ALL lifestyle 
factors are Graded or better OR
• ALL their lifestyle factors and height/weight are Graded and ALL medical conditions (if any) are Preferred
The proposed insured will most likely be DECLINED if …
• They have one medical condition or one lifestyle factor that is rated as a Decline OR
• Their height/weight is rated as a Decline OR
• They have four or more medical conditions that are either Standard or Graded
1  Lifestyle factors include questions related to alcohol/drug use, driving record, and felonies. See Adult Single Condition Decision Chart for specific 
Lifestyle ratings.
10

## Transamerica FE Portfolio — Underwriting Charts — Page 11

11
ADULT SINGLE CONDITION DECISION CHART  — Subject to underwriting and change without notice
The following decisions are based on proposed insured having only one medical condition or lifestyle factor:
MEDICAL CONDITION OR LIFESTYLE FACTOR DECISION (SUBJECT TO ALL OTHER FACTORS)
AIDS/HIV/ARC DECLINE
Alcoholism/Alcohol Abuse –  Used or been diagnosed with, treated, 
tested positive for, or been given medical advice by a member 
of medical profession
Within 2 years – DECLINE
Within 2–4 years – GRADED
Within 4–10 years – STANDARD
Over 10 years – PREFERRED
ALS (Lou Gehrig’s disease) or other motor neuron disease DECLINE
Alzheimer’s/Dementia/Memory Loss/Cognitive Disorders DECLINE
Amputation (other than due to accident/trauma) DECLINE
Anemia (other than Sickle Cell Anemia ) GRADED
With Activity Credit - STANDARD
No treatment for last 3 months – PREFERRED
Aneurysm PREFERRED
Angina See Heart Disease
Angioplasty  (of any kind) See Heart Disease
Arrhythmia See Heart Disease
Assisted Living/Long Term Care Facility – Home healthcare is defined 
as medical care provided by a medical professional, friends, or family 
member, including — but not limited to — arranging medications, 
taking blood pressure or sugar readings, administering medications, 
wound care, feeding tube, etc.
Current – DECLINE
Asthma Mild (no daily symptoms, no limitations to daily activities, no 
reduced lung function, no regular use of steroids and no ER visits or 
hospitalizations due to asthma in last 5 years – PREFERRED
Chronic – STANDARD
with Activity Credit – PREFERRED 
Atrial Fibrillation See Heart Disease
Autism Mild (Highly Functional): – PREFERRED
All others – DECLINE
Bipolar PREFERRED
Black Lung STANDARD
With Activity Credit – PREFERRED
Blood Clots  (no complications/time since resolved) PREFERRED
Blood Disorder  (excluding Iron Deficiency Anemia  and Sickle Cell 
Anemia): Polycythemia, Thrombocytopenia, Hemophilia, and other 
coagulation disorders
PREFERRED
Bone Marrow Transplant (Including donor stem cells) DECLINE
Bronchitis (chronic) STANDARD
With Activity Credit – PREFERRED
Build See Adult Height and Weight Chart page 15
Bypass See Heart Disease

## Transamerica FE Portfolio — Underwriting Charts — Page 12

12
MEDICAL CONDITION OR LIFESTYLE FACTOR DECISION (SUBJECT TO ALL OTHER FACTORS)
Cancer (other than Basal Cell) Any onset within 2 years – DECLINE
Metastatic – DECLINE
Recurrent – DECLINE
Multiple cancers – DECLINE
With metastasis to lymph nodes – DECLINE
Cancer free and no treatment within last 2 years – STANDARD
Cardiac Surgery See Heart Disease
Cardiomyopathy See Heart Disease
Cerebral Palsy DECLINE
Chest Pain See Heart Disease
Chronic Pain PREFERRED
Circulatory Disorder PREFERRED
Cirrhosis STANDARD
Clotting Disorder PREFERRED
Cognitive Disorder DECLINE
Congestive Heart Failure/Heart Failure/Diastolic Heart Failure STANDARD
COPD (Chronic Obstructive Pulmonary Disease) STANDARD
With Activity Credit – PREFERRED
Coronary Artery Disease See Heart Disease
Creutzfeldt-Jakob Disease DECLINE
Crohn’s Disease PREFERRED
Cystic Fibrosis DECLINE
Defibrillator Implant See Heart Disease
Dementia DECLINE
Depression PREFERRED
Diabetes (Type 1 and 2) STANDARD
Only during pregnancy – PREFERRED
Diabetic Coma DECLINE
Dialysis STANDARD
Diastolic Heart Failure See Congestive Heart Failure
Down Syndrome DECLINE
Driving (including: reckless driving, DUI/DWI/OWI ) Within 2 years – DECLINE
Within 2–5 years – STANDARD
> 5 years – PREFERRED
Multiple offenses in last 5 years – DECLINE
Drug Use/Abuse (including prescription drugs) 
Used or been diagnosed with, treated, tested positive for, 
or been given medical advice by a member of medical profession
Within 2 years - DECLINE
Within 2–4 years - GRADED
Within 4–10 years - STANDARD
Over 10 years - PREFERRED
Electric Scooter/Cart See Wheelchair/Scooter/Cart
Emphysema STANDARD
With Activity Credit – PREFERRED
Employment (in the cannabis industry or a cannabis-related business) DECLINE

## Transamerica FE Portfolio — Underwriting Charts — Page 13

13
MEDICAL CONDITION OR LIFESTYLE FACTOR DECISION (SUBJECT TO ALL OTHER FACTORS)
Encephalitis PREFERRED
Epilepsy See Seizures
Felony Offense (convicted of or pleaded no contest) Within 3 years – DECLINE
Within 3–5 years – GRADED
Within 5–10 years – STANDARD
Over 10 years – PREFERRED
Multiple offenses in last 10 years – DECLINE
Gaucher’s Disease DECLINE
Heart Attack See Heart Disease
Heart Disease PREFERRED
Heart Failure See Congestive Heart Failure
Heart Murmur See Heart Disease
Heart Valve Replacement See Heart Disease
Hepatitis See Liver Disease/Disorder
Hodgkin’s/Non-Hodgkin’s/Lymphoma See Cancer
Home Healthcare See Assisted Living
Hospice DECLINE
Hospitalization  Currently - DECLINE
Within last 12 months - STANDARD
With Activity Credit - PREFERRED
Hunter Syndrome DECLINE
Huntington’s Disease DECLINE
Illegal Drugs See Drug Use/Abuse
Incarceration Current – DECLINE
Iron Deficiency Anemia See Anemia
Irregular Heartbeat See Heart Disease
Kidney Disease/Disorder  (Chronic Kidney Disease) STANDARD
Kidney Failure STANDARD
Liver Disease/Disorder  (excluding Fatty Liver Disease) STANDARD
Long Term Care See Assisted Living
Lou Gehrig Disease See ALS
Lupus See Systemic Lupus Erythematosus (SLE)
Marijuana use PREFERRED
Memory Loss See Alzheimer's
Mental Incapacity DECLINE
Mental Retardation DECLINE
Myocardial Infarction See Heart Disease
Niemann-Pick Disease DECLINE
Nursing Home See Assisted Living
Oxygen See Respiratory Disease or Disorder
Pacemaker/Defibrillator Implant See Heart Disease
Pancreatitis (nonalcoholic) Diagnosed and/or received treatment within 2 years – STANDARD
Treated and resolved > 2 years – PREFERRED

## Transamerica FE Portfolio — Underwriting Charts — Page 14

14
MEDICAL CONDITION OR LIFESTYLE FACTOR DECISION (SUBJECT TO ALL OTHER FACTORS)
Parole/Probation  (currently) Within 2 years – DECLINE
Peripheral Artery/Vascular Disease (PAD/PVD) See Circulatory Disorder
Phlebitis See Blood Clots
Pompe Disease DECLINE
Post-Traumatic Stress Disorder (PTSD) See Depression
Prison (within 2 years) See Incarceration
Pulmonary Fibrosis DECLINE
Pulmonary Hypertension See Circulatory Disorder
Respiratory Disease or Disorder (Chronic) STANDARD
With Activity Credit - PREFERRED
Rheumatoid Arthritis PREFERRED
Sarcoidosis Not affecting the lungs – PREFERRED
Affecting the lungs – See Respiratory Disease or Disorder
Schizophrenia PREFERRED
Seizures PREFERRED
Sickle Cell Anemia DECLINE
Sleep Apnea  CPAP/treatment with supplemental oxygen/oxygen concentrator use 
– STANDARD
With Activity Credit – PREFERRED
CPAP/treatment without supplemental oxygen – PREFERRED
Stent Implant (Heart) See Heart Disease
Stroke STANDARD
  With Activity Credit - PREFERRED
Suicide (attempted) Within 2 years – DECLINE
Surgery (Been advised or planning to have surgery requiring general 
anesthesia)
DECLINE
Systemic Lupus Erythematosus  (SLE) PREFERRED 
Terminal Illness (death expected within 18 months) DECLINE
Tobacco/Nicotine use (This includes cigarettes, e-cigarettes/vapes, 
chewing tobacco/smokeless tobacco, pipe, cigar, nicotine gum/patch 
or other nicotine delivery system.)
Within last 12 months will receive Tobacco Rating
Transplant Recipient Organ or Stem Cell – DECLINE
Transient Ischemic Attack ( TIA) STANDARD
  With Activity Credit - PREFERRED
Tuberculosis See Respiratory Disease or Disorder
Ulcerative Colitis PREFERRED
Wasting Syndrome DECLINE
Wheelchair/Electric Scooter/Electric Cart PREFERRED 
If any assistance is required, see Assisted Living
Wilson’s Disease DECLINE
Wiskott-Aldrich Syndrome DECLINE

## Transamerica FE Portfolio — Underwriting Charts — Page 15

15
ADULT HEIGHT AND WEIGHT CHART
Rate classes represent best possible decision for the height/weight without taking into consideration 
any additional medical conditions or lifestyle factors. If the build for the insured exceeds the maximum 
weight listed for graded, no coverage will be available.
HEIGHT
MINIMUM WEIGHT 
PREFERRED AND STANDARD  
(BMI greater than 18.5)
MAXIMUM WEIGHT 
PREFERRED  
(BMI less than 40)
MAXIMUM WEIGHT 
STANDARD  
(BMI less than 45)
MAXIMUM WEIGHT 
GRADED  
(BMI less than 48)
4’5” 74 159 179 191
4’6” 77 165 186 199
4’7” 80 172 193 206
4’8” 83 178 200 214
4’9” 86 184 207 221
4’10” 89 191 215 229
4’11” 92 198 222 237
5’0” 95 204 230 245
5’1” 98 211 238 254
5’2” 102 218 246 262
5’3” 105 225 254 270
5’4” 108 233 262 279
5’5” 112 240 270 288
5’6” 115 247 278 297
5’7” 119 255 287 306
5’8” 122 263 295 315
5’9” 126 270 304 325
5’10” 129 278 313 334
5’11” 133 286 322 344
6’0” 137 294 331 353
6’1” 141 303 341 363
6’2” 145 311 350 373
6’3” 149 320 360 384
6’4” 152 328 369 394
6’5” 157 337 379 404
6’6” 161 346 389 415
6’7” 165 355 399 426
6’8” 169 364 409 436
6’9” 173 373 419 447
6’10” 177 382 430 459
6’11” 182 391 440 470
7’0” 186 401 451 481

## Transamerica FE Portfolio — Underwriting Charts — Page 16

16
JUVENILES (AGES 0 THROUGH 17) COVERAGE ELIGIBILITY  
Medical conditions or personal history that will not be eligible for coverage with Final Expense Solutions 
Portfolio products 1 include, but may not be limited to:
JUVENILE MEDICAL CONDITIONS  
Juvenile applicants will not be eligible for coverage when two or more medical categories have a “yes” answer.
• Cognitive impairment
• Memory loss
• Mental incapacity
• Motor neuron disease
• Cerebral palsy
• Cystic fibrosis
• Huntington’s disease
• Amputation (other than due  
to accident/trauma)
• Bone marrow, stem cell,  
or organ transplant   
(other than corneal)
• Cancer
• Pulmonary fibrosis  
 
 
 
• Sickle cell anemia
• Down syndrome
• Autism
• Depression
• Bipolar
• Schizophrenia
• Eating disorder
• Suicide attempt
• Cardiac surgery
• Diabetes Type I or II
• Chronic pain
• Muscular dystrophy
• Paralysis 
 
 
 
• Heart failure
• Pending surgery requiring 
general anesthesia
• Hospice, palliative, or home 
healthcare
• Terminal medical condition
• Diagnosis of HIV/AIDS
• Currently incarcerated
• Alcohol and or drug treatment 
• Drug use
• Reckless driving, DUI, OWI,  
and DWI
• Felony (convicted of or  
pleaded no contest) 
• Proposed insured, owner, 
or payor is employed in 
the cannabis industry or a 
cannabis-related business.
1 Subject to underwriting and change without notice
MEDICAL CATEGORIES MEDICAL CONDITIONS DECISION  
(Subject to all other factors)
Heart or blood vessels disorder • Congenital heart disease
• Irregular heartbeat/ arrhythmia
• Murmur
• Any other disease or disorder of the heart or 
blood vessels
Standard
Brain or nervous system disorder
• Epilepsy/Seizures
• Any other disease or disorder of the brain or 
nervous system
Standard
Blood disorder • Platelet disorders
• Any other abnormality of the spleen, bone 
marrow, or blood
Standard
Digestive disorder • Any disease or disorder of the esophagus, 
stomach, liver, pancreas, intestine, or colon
Standard
Lung disorder • Asthma
• Any other disease or disorder of the lungs or 
respiratory system
Standard
Renal and reproductive disorder • Disease or disorder of the bladder
• Disease or disorder of the kidney
• Any other disease or disorder of the urinary or 
reproductive organs
Standard
Mental health disorder • Anxiety
• Attention deficit disorder (ADD/ ADHD)
• Any other psychiatric mental or emotional 
condition or disorder
Standard
Muscles, skin, joints, bones,  
connective tissue, eyes, and ears 
disorder
• Rheumatoid arthritis (JRA)
• Autoimmune disorder
• Any other disease or disorder of the 
musculoskeletal system, skin, or spine
Standard
Childhood cancers Decline

## Transamerica FE Portfolio — Underwriting Charts — Page 17

JUVENILE HEIGHT AND WEIGHT CHART  
Ages 0 through 13: If the build for the proposed insured does not fall within the ranges listed, no coverage will 
be available.
AGE MIN AND MAX HEIGHT IN INCHES MIN AND MAX WEIGHT IN LBS
15 days–less than 1 year 18–35” 5–32lbs
1 26–42” 14–50lbs
2–4 30–45” 19–71lbs
5–8 38–56” 27–120lbs
9–11 44–70” 40–160lbs
12–13 52–73” 60–195lbs
Ages 14 through 17 : See adult weight chart on page 15. If weight exceeds the maximum weight for the Standard 
product, no coverage will be available.
17


<!-- source:LIFETIME_UNDERWRITING_CHARTS.md -->

# Transamerica Lifetime Whole Life — Underwriting Guide (full charts)

**Product focus:** Lifetime℠ whole life
**Source extract:** `source_pdfs/Lifetime_UW_key_pages_3-28.txt`
**Guide:** Lifetime Whole Life Underwriting Guide Brochure (key pages)
**Audience:** Agent use only — underwriting decision charts for internal RAG.
**Extracted:** 2026-07-22

This file contains the **full underwriting chart text** (not a summary). Use for impairment, class, build, Rx, and requirement questions.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 3

3
For Agent Use Only. Not for Distribution to the Public.
EXPRESS PROTECT UNDERWRITING
Our streamlined underwriting process is designed for faster issuing, more consistent application decisions, 
and seamless functionality. It’s called Express Protect Underwriting®, and leverages automation to help reduce 
overall cycle times for you and your clients.
iGO® e-APP (RECOMMENDED)
Our electronic application, the iGO e-App, will provide you with guidance and prompts to assist your 
clients' application process and will help ensure good order before submission to the home office. 
Additionally, if your customer requires the completion of a teleinterview, there will be a clear prompt 
indicating this direction. 
Some applications will go straight through, and an Express Protect Underwriting decision will be made at point 
of sale.
PAPER APPLICATION
On paper applications, only Part 1 will be available for completion. All paper applications will require the 
applicant to complete a teleinterview which will be prompted once the paper application is received and  
is in good order.
The paper process may take longer as all elements not in good order will need to be resolved before we are 
able to prompt the teleinterview process.  
FLUIDLESS ACCELERATION
Some clients may qualify for fluidless acceleration and accelerated underwriting decision without the need 
for traditional fluids (blood and urine). Please see the age/face amount parameters to see if your client is  
a candidate.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 4

4
AGE AND AMOUNT REQUIREMENTS
TRANSAMERICA LIFETIME℠  
  May be eligible for fluidless acceleration 1,2,3  
INITIAL AGE 
AND AMOUNT 
REQUIREMENTS
ISSUE AGE
15 days–17 
years4,5 18–45 46–55 56–65 66–69 70–80 6
$25,000–$99,999 Medical History 
Questions Part II N/A N/A N/A N/A N/A
$100,000–
$499,999
Medical History 
Questions Part II
Medical History 
Questions Part II
Medical History 
Questions Part II
Medical History 
Questions Part II
Teleinterview Part 
II7 BCP HOS Vitals
Teleinterview  
Part II7 BCP HOS 
Vitals CS
$500,000–
$999,999
Medical History 
Questions Part II
Medical History 
Questions Part II
Medical History 
Questions Part II
Teleinterview Part 
II7 BCP HOS Vitals
Teleinterview Part 
II7 BCP HOS Vitals
Teleinterview  
Part II7 BCP HOS 
Vitals CS
$1,000,000–
$1,999,999
Medical History 
Questions Part II
Medical History 
Questions Part II
Teleinterview Part 
II7 BCP HOS Vitals
Teleinterview Part 
II7 BCP HOS Vitals
Teleinterview Part 
II7 BCP HOS Vitals
Teleinterview  
Part II7 BCP HOS 
Vitals CS
$2,000,000–
$3,500,000 8 N/A9 Teleinterview Part 
II7 BCP HOS Vitals
Teleinterview Part 
II7 BCP HOS Vitals
Teleinterview Part 
II7 BCP HOS Vitals
Teleinterview Part 
II7 BCP HOS Vitals
Teleinterview  
Part II7 BCP HOS 
Vitals CS
$3,500,001–
$5,000,000 N/A
Teleinterview  
Part II7 BCP HOS 
Vitals IR
Teleinterview  
Part II7 BCP HOS 
Vitals IR
Teleinterview  
Part II7 BCP HOS 
Vitals IR
Teleinterview  
Part II7 BCP HOS 
Vitals IR
Teleinterview  
Part II7 BCP HOS 
Vitals IR CS
For Agent Use Only. Not for Use With the Public.
1 May be eligible for fluidless acceleration. Agent to complete with the consumer. Paper application will require a teleinterview.  
2 Applicants receiving a Fluidless acceleration decision will not be reconsidered for a better rate classification.  
3 Non-U.S. residents are not eligible for automated decisioning or fluidless underwriting.  
4 Juveniles (0-17) must reside in the U.S. for consideration.  
5 MVR ordered at ages 16 and up.  
6 Financial supplement (PFS) required for age 70+ and face amounts > $1,000,000  
7 Vendor conducts Teleinterview Part II with consumer over the phone.  
8 Maximum face amount for California contracts is $2,000,000.  
9 Consideration through $2,000,000 on juveniles.
If Chronic and Critical Illness living benefit riders are selected, the case is not eligible for an immediate, point of sale decision. The case may still qualify for  
fluidless underwriting.
Requests to reduce face amount received during underwriting will not alter the age/amount requests.
Prescription and medical claims data checks will be ordered on all applications.
Transamerica reserves the right to request other evidence of insurability as it deems necessary.
Transamerica performs post-issue audits on cases put in force to validate our underwriting assessments and models. If we develop information that was not disclosed at the 
time of the application, we reserve the right to rescind the policy.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 5

5
For Agent Use Only. Not for Distribution to the Public.
UNDERWRITING TIPS
INSURABLE INTEREST
Insurable interest must exist between the proposed insured(s), policy owner(s), payer(s), and beneficiary.* 
Underwriting reserves the right to make the final determination on the issuance of any policy(ies). 
FLUIDLESS DOES NOT MEAN GUARANTEED ISSUE
Nonmedical means that initial underwriting requirements do not include traditional underwriting 
requirements such as paramedical exam with labs, although vitals/physical findings and/or labs may be 
required upon case review at underwriter discretion. All applications are subject to a Medical Information 
Bureau (MIB) report, motor vehicle report, prescription check, medical data check personal history, 
and medical history (Application Part 2). Guaranteed issue, as the name implies, guarantees certain life 
insurance policies will be issued, regardless of health. Since the insured cannot be declined or turned down, 
carriers generally offer low death benefit options with higher-than-normal premiums. We do not currently 
offer any guaranteed-issue policies. 
AN APPLICATION IS VALID FOR 180 DAYS
Cases will close after 45 days if there are outstanding requirements and no activity on the file. An agent may 
request an extension of the closure date.
IF THE PROPOSED INSURED IS A JUVENILE, A PARENT/LEGAL GUARDIAN SIGNATURE  
IS REQUIRED
If the grandparent is the owner of the policy, the parents are still required to sign the application and HIPAA. 
If the legal guardian is not a parent, proof of guardianship will be requested. Please note that state statutes 
take precedence regarding requirements.
A LEGIBLE CASE ID NUMBER MUST BE PRINTED ON ALL CORRESPONDENCE  
FOR PROPER PROCESSING
APPLICATION AND ALL FORMS (MEDICAL QUESTIONS/TELEINTERVIEW AS WELL)  
NEED TO BE FILLED OUT COMPLETELY AND ACCURATELY
For the best agent and customer experience, the electronic application through iGO® e-App should be used 
rather than a paper application.
ALWAYS PROVIDE THE BEST TIMES, TELEPHONE NUMBERS, AND ANY SPECIAL LANGUAGE 
NEEDS FOR YOUR CLIENT 
Providing accurate contact information will assist in timely ordering and collection of underwriting information.
ANY OMISSIONS OR MISSTATEMENTS IN AN APPLICATION COULD CAUSE AN OTHERWISE 
VALID CLAIM TO BE DENIED UNDER ANY INSURANCE ISSUED FROM THE APPLICATION
* Insurable interest of beneficiary is subject to state statutes.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 6

6
For Agent Use Only. Not for Distribution to the Public.
UNDERWRITING TIPS
LIVING BENEFIT COVERAGE*
Certain medical conditions will impact an individual’s eligibility for living benefits coverage, and Transamerica 
reserves the right to decline living benefit riders or products based on an individual's medical history. 
The following are some conditions that may not be eligible for chronic illness and/or critical illness 
living benefit coverage (this list is not all-inclusive) :
• Drug and alcohol abuse
• Cancer (other than nonmelanoma skin cancer)
• Coronary artery disease
• Diabetes with insulin use
• Inability to perform activities of daily living (ADLs)
• Motor neuron disease
• Multiple sclerosis
• Muscular dystrophy
• Parkinson's disease
• Stroke or TIA
• Systemic lupus erythematosus
*  Underwriting reserves the right to rate the base policy, deny or limit benefits, or offer a different product based on medical information obtained during  
 the underwriting process.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 7

7
For Agent Use Only. Not for Distribution to the Public.
HOW DO I APPROACH DELICATE SUBJECTS?
To help clients obtain the coverage they need, you need to be sure to ask all the necessary questions — even 
the uncomfortable ones. Remember, incomplete responses will delay the review process, the client’s coverage, 
and your commission payment. Below are some suggestions to help you address these sensitive subjects.
EXPLAIN THAT CORRECT WEIGHT AND OTHER SENSITIVE DETAILS ARE REQUIRED
Before you submit a client as preferred, be sure he or she meets the criteria. Refer to the underwriting criteria  
and medical impairments information in the following pages of this guide to determine if the applicant is 
eligible for coverage and at what underwriting class. It may help the client understand how important it is to 
provide correct details.
ASSURE THE CLIENT THAT ALL INFORMATION ON THE APPLICATION IS CONFIDENTIAL
If the applicant has ever been arrested or has sensitive medical history, he or she may not want to disclose it. 
Assure all clients in advance that the application is confidential and none of their personal information is at risk.
Where possible, select a condition from the list and/or drop down menu. If you must select “Any Other 
Disease or Disorder,” try to find the condition in the box that will appear and select it, SPELLING IS 
IMPORTANT. If you cannot find a match, it is OK to type the condition and hit confirm. At this time, a box 
entitled "Description" will appear. 
DOCUMENT THE DETAILS:
Bad example: Misdemeanor 
Good example: Public intoxication August 2018, fined $250 with one night in jail, probation ended August 
2020; Trespassing October 2015, fined $100 with one night in jail, probation ended March 2016.
ASK THE FOLLOWING IMPORTANT QUESTIONS ABOUT MEDICAL AND CRIMINAL ACTIVITIES
To gain a complete picture of an applicant’s medical, criminal, or moving violation history, ask the following 
questions when completing the description box:
1. When was the condition diagnosed or date of criminal activity or moving violation (provide as correct 
date, month, and year as possible)? 
2. What was the cause?
3. How and when was it treated? 
4. When were the last symptoms?
5. If currently symptomatic, what are your limitations?
6. What was the charge and sentence?
7. Are you currently on parole or probation?
 
DOCUMENT THE DETAILS:
Bad example: Heart surgery 
Good example: Bypass surgery, 01/31/2011. Last seen six months ago for routine checkup with normal 
findings. Currently on atorvastatin medication.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 8

For Agent Use Only. Not for Distribution to the Public.
8
FIELD UNDERWRITING
WHAT IS FIELD UNDERWRITING?
In order to provide the most accurate picture of the applicant to the insurer, it is 
important for an agent to get to know his or her clients in the process of soliciting 
business. This process, known as field underwriting, is the initial medical and 
financial screening of prospective buyers of life insurance and is a key responsibility 
of our agents.
For an agent, good field underwriting builds credibility with your client and boosts 
your reputation in the community as a knowledgeable life insurance advisor. Often 
additional requirements are needed due to inconsistent information provided; 
therefore, the more complete and accurate the information is on the application, 
the less likely additional requirements, such as an Attending Physician Statement 
(APS), will be needed. More importantly, it can lead to a better customer experience 
by setting realistic expectations for a potential rate class, which will be beneficial to 
everyone involved. When meeting with your client, please be sure to keep in mind 
the following questions:
• What is their occupation, annual income, and net worth?
• Have they ever been rated or denied for life, long term care, or other insurance in 
the past and why?
• Do they already own a life insurance policy?
- If so, what is the face amount and company that issued it? Is it being replaced?
• What is the purpose of the life insurance being applied for?
• Do they have any medical issues?
• Do they travel outside the U.S. or are they a foreign national? 
• Do they participate in aviation, scuba, climbing, racing, or other similar activities? 
• Any driving violations?
WHY SHOULD I PERFORM FIELD UNDERWRITING?
• Expedite the underwriting process
• Meet client expectations
• May reduce the need for additional underwriting requirements
• Ensure conditional receipt is binding

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 9

9
For Agent Use Only. Not for Distribution to the Public.
UNDERWRITING REQUIREMENTS  
AND REPORTS DEFINED 
Transamerica will order all necessary underwriting evidence for your customer, reducing the burden 
on your time and efforts, as well as insuring we only get the necessary information to understand your 
customer’s risk profile. 
Transamerica reserves the right to request other evidence of insurability as it deems necessary.
VITALS AND PARAMED PHYSICAL FINDINGS
When required, paramed physical findings are ordered by the home office and are completed by an 
approved third-party vendor. The process includes a qualified examiner completing proper paperwork/
forms, taking vitals (height, weight, blood pressure and pulse), and if applicable collecting fluids (blood and 
urine), and administering ECGs.
TELEINTERVIEW
A teleinterview is a guided interview completed over the phone, conducted by an examiner through a 
third-party vendor. Several base questions will be asked, and related reflexive questions based on your 
individual client's medical history. 
HOME OFFICE SPECIMEN
A home office specimen (HOS) is a urine sample collected during the paramed physical findings visit and is 
sent to a laboratory for analysis.
BLOOD CHEMISTRY PROFILE
A blood chemistry profile (BCP) is a venous blood draw collected during the paramed physical findings visit 
and is sent to a laboratory for analysis.
AccessMyHealthTM is a web portal that allows clients to access the results of their blood, urine and paramed 
physical findings tests, taken in connection with their life insurance application. When the client completes 
their labs or paramed physical findings test, they can opt in to receive text notifications. Once their labs 
are processed (up to seven days after completion), the client will receive a text message with a link to the 
AccessMyHealth web portal. From there, the client can register to obtain their results using their phone 
number and date of birth.
transamerica.accessmyhealth.com
RESTING ELECTROCARDIOGRAM 
During an electrocardiogram (ECG), small patches are placed on the chest, arms, and legs to record the 
electrical activity and rhythm of the heart. If normal resting ECG records are available from a test conducted 
within the last 12 months, test need not be repeated. 
 
 
 
 
 
 
All requirements will be administered by Transamerica through Transamerica-approved vendors.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 10

10
For Agent Use Only. Not for Distribution to the Public.
UNDERWRITING REQUIREMENTS  
AND REPORTS DEFINED CONTINUED
MINNESOTA COGNITIVE ACUITY SCREEN
The Minnesota Cognitive Acuity Screen (MCAS) is a telephone interview conducted by a registered nurse 
(RN), who is specifically trained to administer the test. The purpose for this test is to screen for potential 
early cognitive impairment. Proposed insureds age 70 and older applying for $100,000 or more in coverage, 
will be required to complete an MCAS.
It is important your client realize the significance of the interview and concentrate to do as well as they can. 
Your client should be in an environment that is free of distractions. If they wear a hearing aid, they should 
have it on during the interview. The telephone interview usually takes between 15–20 minutes.  
Family, friends, or agent can be present, but they must be in a separate room during the cognitive interview, 
not interacting at all with the proposed insured in any way during the course of the interview.
INSPECTION REPORTS (IR, BBIR, EIR)
Provides a holistic view of the proposed insured's public record footprint, including such information as 
financials, criminal records history, properties owned, and bankruptcies. Inspection reports may be completed 
as a telephone interview or by online database searches, depending on the amount being applied for.
PERSONAL FINANCIAL STATEMENTS
A Financial Supplement to Application for Life Insurance (also known as a Personal Financial Supplement or 
a Confidential Financial Questionnaire) will be requested if: the income and net worth of proposed insured 
is not provided on the application; The company finds the financial information unclear, inconsistent, or 
additional details are needed; and/or the insurance is being used for business coverage, including Buy-Sell, 
Loan, and Key Person applications. 
FORM 4506T-EZ
Form 4506T-EZ, is an Internal Revenue Service (IRS) form which gives permission for Transamerica to 
receive a transcript of previously filed tax returns directly from the IRS. This pre-filled form is obtained 
through your agent portal or through iPipeline® to expedite processing. 
MOTOR VEHICLE REPORTS
A motor vehicle report (MVR) is a record of a proposed insured's driving history.
LABPIQTURE™
A LabPiQture report from ExamOne will contain up to seven years of clinical lab test results. These results 
are obtained from the vast network of Quest Diagnostics and LabCorp, and are populated with physician-
ordered laboratory tests related to preventative care, disease monitoring, and diagnostic purposes, with 
some additional coverage from biometric screenings. Additional medical context returned with the test 
results are date of service, ordering physician specialty, submitted diagnosis codes (ICD-9/10-CM), and a 
standardized test type identifier.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 11

11
For Agent Use Only. Not for Distribution to the Public.
PRESCRIPTION AND MEDICAL CLAIMS DATA CHECK
A prescription and medical claims data check will be ordered on every application and includes details on 
prescriptions filled, medical diagnoses, hospital and physician procedures, inpatient and clinic administered 
medications, and medical equipment information — as well as prescribing physician’s information. Your 
client can request a copy of their report at rxhistories.com.
IDENTITY VERIFICATION
A check to verify the identities of our customers in order to ensure the quality of business, manage identity 
risk, prevent identity fraud, and comply with obligations under the USA Patriot Act. This check is primarily 
used for identity verification. In some instances we may request a copy of the individual's Social Security 
card, driver's license or other state-issued ID, or utility bill to help verify an individual's identity.
ATTENDING PHYSICIAN STATEMENTS
An attending physician statement (APS) is a copy of the proposed insured's medical records obtained from 
their attending physician or healthcare provider.
APS GUIDELINES ARE AS FOLLOWS:
FACE AMOUNTS
Age Up to and including $500,000 $500,001 to $1 million $1,000,001 to $2 million
15 days–17 years NOT ROUTINELY (for cause only) YES YES
18–55 years NOT ROUTINELY (for cause only) NOT ROUTINELY (for cause only) NOT ROUTINELY (for cause only)
56–70 years NOT ROUTINELY (for cause only) NOT ROUTINELY (for cause only) NOT ROUTINELY (for cause only)
71 years and older YES YES YES
TRANSAMERICA ORDERS ALL REQUIREMENTS
Please refer to age/amount chart. Be aware that an agent may be charged if they order requirements, as 
Transamerica handles ordering of age and amount requirements.
UNDERWRITING REQUIREMENTS  
AND REPORTS DEFINED CONTINUED

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 12

12
For Agent Use Only. Not for Distribution to the Public.* ECG: If normal resting ECG records are available from a test conducted within the last 12 months, the test need not be repeated.
Transamerica reserves the right to request other evidence of insurability as it deems necessary.
TRANSAMERICA'S REQUIREMENT VENDORS  
Transamerica will order all requirements from one of the following vendors. Any underwriting evidence 
obtained for insurance with another carrier will not be accepted.
VENDOR NAME USED FOR
APPS Teleinterview, paramed physical findings, blood/urine, ECG
CRL Labs
ExamOne APS (attending physician statement)
Illumifin Inspection Reports and MCAS (Minnesota Cognitive Acuity Screen) 
REQUIREMENTS THROUGH AGE 70 AGE 71 AND OLDER
Paramed Physical Findings/Vitals Valid for 1 year Valid for 6 months
Teleinterview Valid for 90 days Valid for 90 days
Resting Electrocardiogram (ECG)* Valid for 1 year Valid for 1 year
Inspection Report (IR) Valid for 1 year Valid for 1 year
Financial Supplement to Application for Life Insurance Valid for 1 year Valid for 1 year
Home Office Urine Specimen (HOS) Valid for 1 year Valid for 6 months
Blood Chemistry Profile (BCP) Valid for 1 year Valid for 6 months
Minnesota Cognitive Acuity Screen (CS) N/A Valid for 6 months
UNDERWRITING REQUIREMENTS  
AND REPORTS DEFINED CONTINUED

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 13

13
For Agent Use Only. Not for Distribution to the Public.
DETERMINING COVERAGE  
AMOUNTS FOR INDIVIDUALS 
While each of your clients have different financial needs, these guidelines are intended to provide a general 
formula to help calculate suggested maximum amounts of life insurance.
• What does the client do for a living?
• What is their annual income and net worth?
• Do they already own a life insurance policy?
- If so, what is the face amount and company that issued it? Is it being replaced?
• What is the purpose of the life insurance being applied for?
• Do they have any medical issues that may result in a higher premium?
PURPOSE FORMULA REQUIREMENTS
Income 
Continuation
Ages Income Factor
• Income stated must be reasonable for the profession or 
occupation stated.
• Income source considered will be that of the proposed 
insured, not the household income or that of the owner.
• Earned income includes salary, bonuses, commissions, 
and deferred compensation and excludes income from 
investments.
18–35
36–70
71+
40
75 minus current age
individual consideration
Non-Income Earning 
Spouse/Partner
Up to $500,000 • Review of household income
• Review of total line of insurance in force
 $500,001–$5,000,000
All requirements as indicated above for face amounts 
through $500,000, plus:
• Spouse/partner total line of personal coverage in force
• Up to equal coverage of income-earning spouse/partner.
• Household net worth
College Student Up to $2,000,000 total line • Annual earned income
• Greater of income multiplier or $2,000,000
Transamerica reserves the right to order additional financial requirements.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 14

14
For Agent Use Only. Not for Distribution to the Public.
Transamerica reserves the right to order additional financial requirements.
PREMIUM TO INCOME GUIDELINES
PURPOSE FORMULA REQUIREMENTS
Affordability 
Guidelines
Annual Premium for all policies/Annual Income % should 
not exceed the percentages below. • There should not be a significant adverse change in 
financial status or financial flexibility as a result of 
the purchase of the policy(ies). 
• For incomes less than $15,000 (USD), details 
supporting the need and purpose of the insurance 
may be necessary. Adjustments (upwards) for 
family size (when known) should be considered 
to align with U.S. Federal Poverty Guidelines 
published by the U.S. Department of Health & 
Human Services. 
• Premium affordability should be demonstrated for 
the total premiums being paid on all policies, by the 
payer(s). This includes all policies on the payer(s) 
life and all policies on the lives of others for which 
they are paying. 
Annual Income Premium to Income
≤ $30,000 15%
> or = $30,001 20%

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 15

15
For Agent Use Only. Not for Distribution to the Public.State specific laws, including NY and WA, take precedence over company guidelines.
* All siblings should have similar coverage. 
Group coverage, accidental death and dismemberment insurance, and credit card insurance should not be counted in determining the parent/owner's total coverage.
DETERMINING COVERAGE  
AMOUNTS FOR JUVENILES
PURPOSE FORMULA
REQUIREMENTS*
Juvenile Ages Face Amount
Total juvenile insurance 
coverage with all 
carriers cannot exceed 
$2,000,000.
15 days 
through 
17 years
Amounts through $250,000
• Coverage on all siblings should be similar. 
• Parent(s) or guardian(s) must witness the applications 
and complete the medical history declarations for the 
juvenile applicant. 
• The policy owner must be the parent, legal guardian, or 
grandparent. For legal guardianship where the guardian 
is not the parent, we require a copy of the guardianship 
papers. 
• The parent/legal guardian, juvenile, and owner must 
be residing in the U.S. permanently, either as a U.S. 
citizen or a visa type that is not considered temporary 
or uninsurable based on our international underwriting 
guidelines.
$250,001–$1,000,000
All requirements as indicated above for face amounts 
through $250,000, plus: 
• Equal coverage* for parent(s) or legal guardian is allow 
up to $1,000,000.**
For amounts $500,000 and greater: 
• Underwriting will obtain the child’s medical records. 
• Minimum household income must be ≥ $100,000.
$1,000,001–$2,000,000
All requirements as indicated above for face amounts 
through $1,000,000, plus:
• At least one parent or legal guardian needs to have 
2x the total line of coverage, in force and applied for, 
pending, as the amount applied for on the juvenile.
Washington State
15 days 
through  
17 years
Total line of coverage cannot 
exceed the U.S. household 
income.
All requirements as indicated above for the appropriate 
face amount, plus:
• Juveniles 15 years or older must sign the application.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 16

16
For Agent Use Only. Not for Distribution to the Public.
DETERMINING COVERAGE AMOUNTS  
FOR BUSINESS PLANNING
PURPOSE FORMULA REQUIREMENTS
Estate Planning
Projected future estate tax liability • The purpose of the insurance
• A current value of the applicant’s estate, which includes 
a personal balance sheet listing all assets and liabilities 
and an estate analysis 
• Third-party financial verification if total combined face 
amount in force, and pending, is greater than $10 million 
or total line over jumbo limits
• The estate projection rate and/or number of 
projected years may be adjusted, up or down, taking 
into consideration what is reasonable in the current 
environment
Ages Maximum Projection 
Years
18–50
51–60 
61–70
71–75
76+
25
20
15
10
5
Key Person
Ages Factor x Income • The key person’s value to the company
• How the coverage amount was determined
• Whether the key person has ownership in the company 
and the percentage of ownership
• A list of all other key persons, the amount of key  
person coverage, and percentage ownership for  
each key person
Under 65
65+ 
Up to 10
Up to 5
Buy-Sell/Business 
Continuation % Ownership x Corporate Value
• The fair market value of the business and how the 
amount of insurance was determined
• A copy of the buy-sell agreement or the details of the 
buy-sell agreement
• The proposed insured's ownership percentage, 
the number of other partners, and their ownership 
percentage
• The amount of buy-sell coverage on each partner and the 
amount and purpose of all in force business coverage
All partners must apply for or have in force buy-sell 
coverage. Corporate balance sheets, income statements 
and/or business valuation may be requested at 
Underwriter discretion.
Business Loan
An amount up to the outstanding  
principal of the loan 
• The business must be the owner of the policy
• Include the purpose, duration of the loan, collateral 
pledged, its value and the loan interest rate
• The term of the loan must be five years or more
• The business may be the policy owner and beneficiary. 
Alternatively, the proposed insured may be the policy 
owner naming a personal beneficiary. The death benefit 
should be collaterally assigned to the lending institution. 
The lending institution cannot be the policy owner and/
or beneficiary.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 17

17
For Agent Use Only. Not for Use With the Public.
BLENDED BODY MASS INDEX (BMI) CHART
ADULT — AGES 16+
In order to calculate Adult BMI, please click here.
In order to calculate Juvenile BMI, please click here.
**BMI RANGE AGES 16–59**
</= 16 Decline
16.0001–17.0000 Nontobacco & Tobacco
17.0001–28.0000 Preferred Elite
28.0001–30.0000 Preferred Plus/Preferred 
Tobacco
30.0001–32.0000 Preferred
32.0001-35.0000 Nontobacco & Tobacco
35.0001–37.0000 Table A
37.0001–39.0000 Table B
39.0001–41.0000 Table C
41.0001–42.0000 Table D
42.0001–43.0000 Table E
43.0001–44.0000 Table F
44.0001–46.0000 Table H
>46 Decline
BMI RANGE AGES 60+
</= 16 Decline
16.0001–18.0000 Individual Consideration
18.0001–28.0000 Preferred Elite
28.0001–30.0000 Preferred Plus/Preferred 
Tobacco
30.0001–32.0000 Preferred
32.0001–35.0000 Nontobacco & Tobacco
35.0001–37.0000 Table A
37.0001–39.0000 Table B
39.0001–41.0000 Table C
41.0001–42.0000 Table D
42.0001–43.0000 Table E
43.0001–44.0000 Table F
44.0001–46.0000 Table H
>46 Decline
JUVENILE — AGES 2 THROUGH 15*
AGE JUVENILE STANDARD
2 13.9–30.0
3 13.9–29.0
4 12.9–29.0
5 12.9–29.0
6 12.9–29.0
7 12.9–30.0
8 12.9–31.0
9 12.9–32.0
10 12.9–33.0
11 13.9–34.0
12 13.9–35.0
13 14.9–36.0
14 14.9–37.0
15 15.9–38.0
* Ages under two years old generally OK unless premature. Ages over 15 — see adult body mass index charts.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 18

18
For Agent Use Only. Not for Use With the Public.
LIFESTYLE AND HEALTH HISTORY 
IMPACT ON RISK CLASS 
TRANSAMERICA LIFETIME SM PREFERRED 
ELITE
PREFERRED 
PLUS PREFERRED NONTOBACCO PREFERRED 
TOBACCO TOBACCO
Tobacco Usage* None in 5 yrs None in 2 yrs None in 2 yrs None in 2 yrs Tobacco 
permitted
Tobacco 
permitted
Cholesterol with or without 
treatment**
230 260 300 ** 260 **
Chol /HDL Ratio** 5.0 for ages 
</=70 
5.5 for ages 71+
5.5 for ages 
</=70 
6.0 for ages 71+
6.2 for ages 
</=70 
6.7 for ages 71+
7.0 for ages </=70 
7.5 for ages 71+
5.5 for ages 
</=70 
6.0 for ages 71+
**
Blood pressure with or 
without treatment*
135/85 for ages 
</=70 
145/85 for ages 
71+ 
Treatment only 
allowed ages 
50-80
145/85 for ages 
</=70 
150/90 for ages 
71+ 
With or without 
treatment
148/88 for ages 
</=70 
152/88 for ages 
71+ 
With or without 
treatment
** 145/85 for ages 
</=70 
150/90 for ages 
71+ 
With or without 
treatment
**
Family history 1
- Includes cardiovascular 
disease or the following 
cancers: breast, ovarian, 
melanoma, prostate,  
and colon
- Some cancers may require 
evidence of routine 
surveillance screening
No Death in 
Parent or Sibling 
prior to age 60
No Death in 
Parent or Sibling 
prior to age 60
No more than one 
Parent or Sibling 
death prior to 
age 60
** No Death in 
Parent or Sibling 
prior to age 60
**
Personal history No personal 
history of heart or 
vascular disease, 
diabetes, cancer 
(except some  
skin cancers)
No personal 
history of heart or 
vascular disease, 
diabetes, cancer 
(except some  
skin cancers)
No personal 
history of heart or 
vascular disease, 
diabetes, cancer 
(except some  
skin cancers)
** No personal 
history of heart or 
vascular disease, 
diabetes, cancer 
(except some  
skin cancers)
**
DUI None in last 5 yrs None in last 5 yrs None in last 5 yrs ** None in last 5 yrs **
MVR - major violations None in last  
12 months, no 
more than 1 in  
last three yrs
No more than 1 in 
last three yrs
No more than 1 in 
last three yrs
** No more than 1 in 
last three yrs
**
MVR - minor violations No more than 3 
violations in last 
3 yrs
No more than 3 
violations in last 
3 yrs
No more than 3 
violations in last 
3 yrs
** No more than 3 
violations in last 
3 yrs
**
Private aviation No aviation With or without 
ratable aviation
With or without 
ratable aviation
With or without 
ratable aviation
With or without 
ratable aviation
With or without 
ratable aviation
Avocation No participation in 
listed activities 2
No participation in 
listed activities 2
No participation in 
listed activities 2
Can be offered 
with or without 
ratable avocation
No participation in 
listed activities 2
Can be offered 
with or without 
ratable avocation
Alcohol/substance abuse Never Never 10 yrs 7 yrs 10 yrs 7 yrs
*  Tobacco usage is defined as using any tobacco product(s) (cigarettes, cigars, chewing tobacco, nicotine patch/lozenge/gum/pouch, e-cigarettes, vapes (with or without nicotine)), etc, within 
the past 24 months.
** May include a rating
1 Some gender-specific cancers may qualify for preferred rates.
2  Avocation: Prohibited activities include aeronautics (e.g., hang gliding, ultralight, soaring, skydiving, ballooning, etc.), power racing competitive vehicles, mountain climbing, rodeos, 
competitive skiing, or scuba/skin diving at a depth greater than 75 feet.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 19

19
For Agent Use Only. Not for Use With the Public.
LIFESTYLE AND HEALTH HISTORY 
IMPACT ON RISK CLASS 
TRANSAMERICA LIFETIME SM PREFERRED 
ELITE
PREFERRED 
PLUS PREFERRED NONTOBACCO PREFERRED 
TOBACCO TOBACCO
Travel No dangerous 
travel1
No dangerous 
travel1
No dangerous 
travel1
No dangerous 
travel1
No dangerous 
travel1
No dangerous 
travel1
Citizenship/Residency U.S. citizens/
green card holders 
- all others 
contact UW
U.S. citizens/
green card holders 
- all others 
contact UW
U.S. citizens/
green card holders 
- all others 
contact UW
U.S. citizens/
green card holders 
- all others 
contact UW
U.S. citizens/
green card holders 
- all others 
contact UW
U.S. citizens/
green card holders 
- all others 
contact UW
Military Active military 
duty is acceptable 
provided insured 
is not serving in 
a hazardous area 
or does not have 
orders to serve in 
a hazardous area 2
Active military 
duty is acceptable 
provided insured 
is not serving in 
a hazardous area 
or does not have 
orders to serve in 
a hazardous area 2
Active military 
duty is acceptable 
provided insured 
is not serving in 
a hazardous area 
or does not have 
orders to serve in 
a hazardous area 2
Active military 
duty is acceptable 
provided insured 
is not serving in 
a hazardous area 
or does not have 
orders to serve in 
a hazardous area 2
Active military 
duty is acceptable 
provided insured 
is not serving in 
a hazardous area 
or does not have 
orders to serve in 
a hazardous area 2
Active military 
duty is acceptable 
provided insured 
is not serving in 
a hazardous area 
or does not have 
orders to serve in 
a hazardous area 2
1 Foreign travel: unless otherwise prohibited by statute
2 Military: unless otherwise prohibited by statute

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 20

20
20For Agent Use Only. Not for Use With the Public.
Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.
Potential morbidity assessments may differ.
MEDICAL IMPAIRMENTS
BEST POSSIBLE RATE CLASS AVAILABLE RIDER AVAILABILITY
IMPAIRMENT PREFERRED 
RATE CLASS
STANDARD 
RATE CLASS 
(NONTOBACCO/
TOBACCO
DECLINE CRITICAL 
ILLNESS RIDER
CHRONIC ILLNESS 
RIDER / LONG 
TERM CARE 
RIDER
Impacted ADL's Yes
ADD/ADHD (age 8 and under) Yes
AIDS Yes
Alcoholism Yes
ALS (Lou Gehrig's disease) Yes
Alzheimer's disease/dementia Yes
Amputations, not due to disease Yes ✔ ✔
Anemia Yes ✔ ✔
Aneurysm Yes
Anxiety Yes ✔ ✔
Arthritis, osteo Yes ✔ ✔
Arthritis, rheumatoid Yes ✔
Asthma Yes ✔ ✔
Atrial fibrillation Yes ✔ ✔
Autism Individual 
consideration ✔
Barrett's esophagus Yes ✔ ✔
Bell's palsy Yes ✔ ✔
Bipolar disorder Yes
Blindness Yes
Benign Prostatic Hypertrophy (BPH) Yes ✔ ✔
Broken bone Yes ✔ ✔
Bronchitis, chronic (COPD) Yes ✔
Bundle branch block, right Yes ✔ ✔
Bundle branch block, left Yes ✔ ✔
Cancer (internal organ) Yes ✔
Cancer, skin (not melanoma) Yes ✔ ✔
Cancer (undergoing treatment) Yes
Cardiomyopathy Yes
Cerebral palsy Yes
Cerebrovascular accident, stroke (CVA) Yes
Chronic fatigue syndrome Yes ✔ ✔
Chronic obstructive pulmonary disorder (COPD) Yes ✔
Chronic pain Yes ✔
Cirrhosis Yes
Colitis, ulcerative Yes
Colitis, other than ulcerative Yes ✔ ✔
Concussion (head injury) Yes ✔ ✔

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 21

21
BEST POSSIBLE RATE CLASS AVAILABLE RIDER AVAILABILITY
IMPAIRMENT PREFERRED 
RATE CLASS
STANDARD 
RATE CLASS 
(NONTOBACCO/
TOBACCO
DECLINE CRITICAL 
ILLNESS RIDER
CHRONIC ILLNESS 
RIDER / LONG 
TERM CARE 
RIDER
Congestive heart failure (CHF) Yes
Coronary artery disease Yes ✔
Criminal activity Yes ✔ ✔
Crohn's disease Yes
Cystic fibrosis Yes
Depression Yes ✔ ✔
Diabetes Yes ✔ ✔
Down syndrome Yes
Emphysema Yes ✔
Endocarditis Yes ✔ ✔
Epilepsy (greater than age 3) Yes ✔ ✔
Fibromyalgia, fibrositis Yes ✔ ✔
Gastric banding, sleeve or bypass surgery Yes ✔ ✔
Gastroesophgeal reflux disease (GERD) Yes ✔ ✔
Glomerulonephritis Yes ✔ ✔
Headache, migraine or tension Yes ✔ ✔
Heart attack Yes ✔
Heart, lung, or liver transplant Yes
Heart valve surgery Yes ✔
Hepatitis B Yes
Hepatitis C Yes
Hernia Yes ✔ ✔
High blood pressure/hypertension Yes ✔ ✔
Histoplasmosis Yes ✔ ✔
Hodgkin's disease Yes ✔
Huntington's disease Yes
Hydronephrosis Yes ✔ ✔
Kidney failure, dialysis Yes
Kidney removal Yes ✔ ✔
Leukemia Yes
Lou Gehrig’s disease (ALS) Yes
Lupus Yes
Marijuana use Yes ✔ ✔
Melanoma (less than 2, including melanoma in situ) Yes ✔
Meniere's disease Yes ✔ ✔
Meningioma Yes ✔ ✔
Meningitis, history of Yes ✔
MEDICAL IMPAIRMENTS
For Agent Use Only. Not for Use With the Public.
Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.
Potential morbidity assessments may differ.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 22

22
BEST POSSIBLE RATE CLASS AVAILABLE RIDER AVAILABILITY
IMPAIRMENT PREFERRED 
RATE CLASS
STANDARD 
RATE CLASS 
(NONTOBACCO/
TOBACCO
DECLINE CRITICAL 
ILLNESS RIDER
CHRONIC ILLNESS 
RIDER / LONG 
TERM CARE 
RIDER
Mental retardation and/or intellectual disability Yes
Mitral insufficiency, Mitral valve prolapse (MVP) Yes ✔ ✔
Mitral stenosis Yes ✔ ✔
Multiple sclerosis (MS) Yes
Muscular dystrophy Yes
Myasthenia gravis Yes
Myocarditis Yes ✔ ✔
Nephrectomy Yes ✔ ✔
Non-Hodgkin's lymphoma Yes ✔
Occupations with special hazards Yes ✔ ✔
Pacemaker Yes ✔ ✔
Pancreatitis (resolved) Yes ✔ ✔
Paralysis, spinal cord injury Yes
Parkinson's disease Yes
Pericarditis Yes ✔ ✔
Peripheral vascular disease (PVD) Yes ✔
Phlebitis, thrombosis, blood clot Yes ✔ ✔
Pituitary adenoma Yes ✔ ✔
Pleurisy Yes ✔ ✔
Pregnancy, no history of or current complications Yes ✔ ✔
Prostatitis, with normal PSA Yes ✔ ✔
Psychosis Yes
Pulmonary fibrosis Yes
Pyelonephritis, acute Yes ✔ ✔
Pyelonephritis, chronic Yes
Rheumatic fever, no heart complications Yes ✔ ✔
Sarcoidosis Yes ✔
Schizophrenia Yes
Sleep apnea Yes ✔ ✔
Stroke Yes
Suicide attempt (more than 2 years ago) Yes
Terminal illnesses Yes
Thyroid disorder Yes ✔ ✔
Transient ischemic attack (TIA) Yes
Tuberculosis, recovered Yes ✔ ✔
Tumors, benign Yes ✔ ✔
Tumors, malignant, history of Yes ✔
MEDICAL IMPAIRMENTS
For Agent Use Only. Not for Use With the Public.
Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.
Potential morbidity assessments may differ.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 23

23
BEST POSSIBLE RATE CLASS AVAILABLE RIDER AVAILABILITY
IMPAIRMENT PREFERRED 
RATE CLASS
STANDARD 
RATE CLASS 
(NONTOBACCO/
TOBACCO
DECLINE CRITICAL 
ILLNESS RIDER
CHRONIC ILLNESS 
RIDER / LONG 
TERM CARE 
RIDER
Ulcerative colitis Yes
Ulcer, stomach Yes ✔ ✔
Vascular Ehlers-Danlos syndrome Yes
Wasting syndrome Yes
MEDICAL IMPAIRMENTS
For Agent Use Only. Not for Use With the Public.
Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.
Potential morbidity assessments may differ.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 24

24
For Agent Use Only. Not for Distribution to the Public.
SUBSTANDARD TABLE RATINGS
Substandard ratings may be attributable to health, occupation, or avocation characteristics that result in 
higher than average mortality risks.
Our competitive underwriting allows us to offer substandard table ratings using the following guide:
TABLE RATING GUIDE
Standard = 100%
1/A = 125%
2/B = 150%
3/C = 175%
4/D = 200%
5/E = 225%
6/F = 250%
8/H = 300%

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 25

25
For Agent Use Only. Not for Distribution to the Public.
ADDITIONAL RIDER INFORMATION
ACCIDENTAL DEATH BENEFIT RIDER (ADR)
Provides an additional death benefit if the primary 
insured dies as a result of an accident, or if the death 
occurs within 180 days of accidental bodily injury 
ISSUE AGES: ISSUE LIMITS:
15–55 years - Not available if base is higher than Table D
- Not available if any flat extra is added to  
base policy
- Total benefit in force cannot exceed 
$300,000 with all Transamerica policies
CHILDREN’S BENEFIT RIDER
Pays level death benefit upon death of any children 
of the insured. Rider is not rated.
ISSUE AGES: ISSUE LIMITS:
15 days to 18 years 
old (actual age of 
child) 18–80 years 
old insured
- Children with a risk profile greater than 
Table B will not be accepted for coverage
CHRONIC ILLNESS RIDER
If the insured becomes chronically ill, you may elect 
to receive a portion of the death benefit that can be 
accelerated in advance of death. The insured must 
have the inability to perform at least two of the six 
activities of daily living for a period of 90 consecutive 
days, or have a severe cognitive impairment. 
ISSUE AGES: ISSUE LIMITS:
Varies by risk 
class, product, 
and issue state
- Not available if base is higher than Table D 
- Not available if base is rated higher than 
$2.50 flat extra
- The sum of all living benefit coverages  
under all Transamerica policies cannot 
exceed $1,500,000
- The maximum benefit payable under the 
Chronic Illness Rider is equal to the lesser  
of 90% of the available death benefit or  
$1,500,000
- Electable at issue, not automatically 
attached to the base product 
- Underwriting reserves the right to deny 
coverage under the Chronic Illness Rider 
on individuals with certain pre-existing 
conditions, impairments, or diseases
CRITICAL ILLNESS RIDER
If the insured suffered a critical health condition 
(state specific) while the policy and rider are in 
effect, you may elect to receive an accelerated death 
payment subject to certain provisions. 
ISSUE AGES: ISSUE LIMITS:
May vary by risk, 
product, and  
issue date
- Not available if base is higher than Table D 
- Not available if base is rated higher than 
$2.50 flat extra
- The per life sum of all living benefit 
coverages under all Transamerica policies 
cannot exceed $1,500,000
- The per life maximum benefit payable under 
the Critical Illness Rider on Transamerica 
Lifetime℠ is equal to the lesser of 90% of the 
available death benefit or $500,000
- Electable at issue, not automatically 
attached to the base product 
- Underwriting reserves the right to deny 
coverage under the Critical Illness Rider 
on individuals with certain pre-existing 
conditions, impairments, or diseases
DISABILITY WAIVER OF PREMIUM RIDER
Provides premium into the policy if the base insured 
becomes totally disabled and remains totally disabled 
for at least six months. A retroactive payment will be 
made for the number of months following the date of 
total disability for up to one year. 
ISSUE AGES: ISSUE LIMITS:
18–55 years - Not available if base is rated higher  
than Table D
- Flat extras are not allowed
- $5,000,000 maximum aggregate face 
amount across all Transamerica policies
- Not available in Guam, Virgin Islands, or 
Puerto Rico

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 26

26
For Agent Use Only. Not for Distribution to the Public.
ADDITIONAL RIDER INFORMATION
GUARANTEED INSURABILITY RIDER
This benefit provides the opportunity to buy a new 
policy or increase a specified amount at a certain 
defined age and/or events with no underwriting. 
ISSUE AGES: ISSUE LIMITS:
0–37 years old; 
issue age must be 
at least 15 days 
old
- Not available if base is rated
- Not available in Guam, Virgin Islands, or 
Puerto Rico
TERM INSURANCE RIDER
An affordable way to provide additional coverage to 
the primary insured. This term coverage will help fill 
a temporary need of additional life insurance above 
the current face amount of the base policy. The term 
rider amount cannot exceed 3X base face amount.
BAND 1 BAND2
10-YEAR 18–80 (NT/T) 18–80 (NT/T)
20-YEAR 18–65 (NT/T) 18–70 (NT) 18-65 (T)
30-YEAR 18–50 (NT) 18–58 (NT)
18–45 (T) 18–53 (T)
TERMINAL ILLNESS ACCELERATED  
DEATH BENEFIT RIDER
While the policy is in force and conditions are met, 
we will pay an Accelerated Death Benefit (Terminal 
Illness only) upon request (life expectancy less 
than 12 months), minus the loan balance, minus 
an administrative charge, and minus any amount 
necessary to provide insurance to the date of the 
Accelerated Death Benefit payment if we make the 
payment during a grace period.
This benefit is automatically attached to all new 
issues. Rider is not rated.
INCOME PROTECTION OPTION
The owner can choose to have the death benefit 
paid out in any combination of an initial lump sum, 
monthly payments, and a final lump sum (after the 
monthly payments). If the policy's death benefit 
at the time of death is greater than the Total 
Face Amount, the excess will be paid as a sum in 
addition to any initial lump sum payment amount. 
If the death benefit is less than the Total Face 
Amount, all designated payment amounts will be 
proportionately reduced.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 27

27
For Agent Use Only. Not for Distribution to the Public.
FIELD UNDERWRITING AND  
THE CONDITIONAL RECEIPT
Every time you submit an application, you take a very important step in helping your clients protect their 
family and their dreams. The Conditional Receipt is an important part of this process.
WHAT IS THE CONDITIONAL RECEIPT?
The Conditional Receipt is “interim” coverage provided to life insurance applicants when the full modal 
premium is paid at the time of the application. Provided certain conditions are met, the Conditional Receipt 
provides death benefit protection for the proposed primary insured up to the amount stated in the dollar 
limits of conditional coverage section of the receipt or the face amount applied for, whichever is less. The 
Conditional Receipt is not valid on foreign nationals.
CONDITIONS AND REQUIREMENTS
The following must be met for the conditional receipt to be in effect:
• Proposed primary insured is found insurable, at any rating, under the company’s rules for insurance on the 
product applied for and at the face amount and tobacco classification applied for;
• All statements and answers given in the application are true and complete;
• Full initial modal premium is received at our administrative office within the lifetime of the proposed 
primary insured (if the form of payment is by check or draft, it must be honored for payment);
• All medical exams, tests, screenings, and questionnaires required by the company are completed and 
received at our administrative office.
If the proposed primary insured passes away while conditional coverage is in effect, coverage will be denied 
if the death is caused by suicide or a self-inflicted injury.
There is no conditional coverage for riders or any additional benefits. Conditional coverage only applies to 
the proposed primary insured. There is no conditional coverage on any other persons proposed for coverage 
in the application.

## Transamerica Lifetime Whole Life — Underwriting Guide (full charts) — Page 28

28
For Agent Use Only. Not for Distribution to the Public.
WHAT IF THE CLIENT IS NOT A U.S. CITIZEN?
A client who is not a U.S. citizen may still qualify for life insurance coverage if they meet certain special 
requirements and comply with all relevant items (which may vary based on their status) listed below: 
• The client must have significant business and/or financial ties in the United States;
• The client must present either a(n): Social Security Number (SSN); Individual Tax Identification Number 
(ITIN/TIN); appropriate version of IRS Form W8 for those without an SSN or TIN; or (for the ITIN 
Program) IRS ITIN letter issued as a result of a W-7 Application;
• The client must be physically present in the United States at the time of application; 
• ITIN applicants will require ITIN forms (CP565) or Social Security card. Submit copy with the file;
• Visa holders: indicate the specific visa type (e.g., H1, F1, etc.) or exact immigration status (e.g., refugee, 
asylum, etc.) on the application and submit a copy of the valid visa;1,2
• Employment Authorization Card (“EAC”) holders: compare the category code, located in the center of the 
EAC to determine if the candidate is eligible to apply for insurance and submit a copy of the valid EAC; 
• Immigration documents pending expiration within 60 days of the application date may affect insurability 
or delay processing while we confirm renewal;
• Fully-expired visas must show proof of renewal or extension (I-797, I-797A, or other confirmation 
document from USCIS that is acceptable to Underwriting);
• EB-5 visa holders transitioning to a green card status may be asked for additional documentation to 
confirm that process;
• A copy of all required documentation will be asked for in iGO at the time of application. For paper 
applications, use the image upload tool on the agent portals to submit copies of images, and indicate this 
in the agent comments section;
• Only U.S. residents are eligible to apply for the Living Benefit Riders (Chronic Illness, Critical Illness) and/
or Long Term Care Rider;
• A separate international underwriting guide is available for information on submitting nonresident 
foreign national and U.S. expatriate business. All international risk guidelines are subject to change 
without prior notice.
• Permanent Resident Card (green card holders): Copy of front and back of the card may be requested at 
underwriter discretion.
For further details please refer to our Resident Foreign Nationals Travel Guidelines flyer, HNW Nonresident FN 
UW Guidelines (111955), and Foreign National Individual Taxpayer identification number guidelines (117754). 
DOCUMENTATION NEEDED
Visa or EAC are required. Proof of entry (passport stamp or I-94 document) or other supporting 
documents may be required at Underwriter discretion.
1 Not all visa types or immigration statuses are eligible. Note also that the Matricula Consular document is not recognized to be valid as a visa by the U.S. government.
2 List "Permanent Resident" on the application if the client is a valid green card holder residing in the U.S.


<!-- source:LIFETIME_UNDERWRITING_FULL_EXTRACT.md -->

# Transamerica Lifetime UW Guide — Full Text Extract

**Product focus:** Lifetime℠
**Source:** `source_pdfs/Lifetime_UW_Guide_upload_extract.md`
**Audience:** Agent use only — full PDF text extract for internal RAG underwriting retrieval.

Source URL: https://cdn.brandfolder.io/86JM1UOD/as/qf8bz4-977wsw-5emcas/Lifetime_Whole_Life_Underwriting_Guide_Brochure.pdf
Title: THE DIFFERENCE IS IN

## THE DIFFERENCE IS IN
# KNOWING THE DETAILS

A FIELD GUIDE TO UNDERWRITING FOR
TRANSAMERICA LIFETIME℠ WHOLE LIFE INSURANCE

TRANSAMERICA®

---

# CONTENTS

|  **EXPRESS PROTECT UNDERWRITING®** | 3  |
| --- | --- |
|  **AGE AND AMOUNT REQUIREMENTS** | 4  |
|  **UNDERWRITING TIPS** | 5  |
|  How Do I Approach Delicate Subjects? | 7  |
|  **FIELD UNDERWRITING** | 8  |
|  What Is Field Underwriting and Why Should I Do It? | 8  |
|  **UNDERWRITING REQUIREMENTS** | 9  |
|  Underwriting Requirements and Reports Defined | 9  |
|  Attending Physician Statements | 11  |
|  Requirement Vendors | 12  |
|  **GUIDELINES FOR DETERMINING COVERAGE AMOUNTS** | 13  |
|  Premium to Income Guidelines | 14  |
|  Juveniles | 15  |
|  Business Planning | 16  |
|  **BODY MASS INDEX (BMI) CHARTS** | 17  |
|  Adult Blended BMI Charts | 17  |
|  **LIFESTYLE, HEALTH HISTORY** | 18  |
|  Impact on Risk Class | 18  |
|  Medical Impairments Guidelines | 20  |
|  **ADDITIONAL INFORMATION** |   |
|  Substandard Table Ratings | 24  |
|  Additional Rider Information | 25  |
|  Field Underwriting and the Conditional Receipt | 27  |
|  What if the Client Is Not a U.S. Citizen? | 28  |
|  Eligibility for Employee Authorization Card | 29  |

2

For Agent Use Only. Not for Distribution to the Public.

---

# EXPRESS PROTECT UNDERWRITING

Our streamlined underwriting process is designed for faster issuing, more consistent application decisions, and seamless functionality. It's called *Express Protect Underwriting®*, and leverages automation to help reduce overall cycle times for you and your clients.

## iGO® e-APP (RECOMMENDED)

Our electronic application, the iGO e-App, will provide you with guidance and prompts to assist your clients' application process and will help ensure good order before submission to the home office. Additionally, if your customer requires the completion of a teleinterview, there will be a clear prompt indicating this direction.

Some applications will go straight through, and an *Express Protect Underwriting* decision will be made at point of sale.

## PAPER APPLICATION

On paper applications, only Part 1 will be available for completion. All paper applications will require the applicant to complete a teleinterview which will be prompted once the paper application is received and is in good order.

The paper process may take longer as all elements not in good order will need to be resolved before we are able to prompt the teleinterview process.

## FLUIDLESS ACCELERATION

Some clients may qualify for fluidless acceleration and accelerated underwriting decision without the need for traditional fluids (blood and urine). Please see the age/face amount parameters to see if your client is a candidate.

For Agent Use Only. Not for Distribution to the Public.

3

---

# AGE AND AMOUNT REQUIREMENTS

## TRANSAMERICA LIFETIME$^{SM}$

■ May be eligible for fluidless acceleration$^{1,2,3}$

|  INITIAL AGE AND AMOUNT REQUIREMENTS | ISSUE AGE  |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- |
|   |  15 days-17 years^{4,5} | 18-45 | 46-55 | 56-65 | 66-69 | 70-80^{6}  |
|  $25,000-$99,999 | Medical History Questions Part II | N/A | N/A | N/A | N/A | N/A  |
|  $100,000- $499,999 | Medical History Questions Part II | Medical History Questions Part II | Medical History Questions Part II | Medical History Questions Part II | Teleinterview Part II^{7} BCP HOS Vitals | Teleinterview Part II^{7} BCP HOS Vitals CS  |
|  $500,000- $999,999 | Medical History Questions Part II | Medical History Questions Part II | Medical History Questions Part II | Teleinterview Part II^{7} BCP HOS Vitals | Teleinterview Part II^{7} BCP HOS Vitals | Teleinterview Part II^{7} BCP HOS Vitals CS  |
|  $1,000,000- $1,999,999 | Medical History Questions Part II | Medical History Questions Part II | Teleinterview Part II^{7} BCP HOS Vitals | Teleinterview Part II^{7} BCP HOS Vitals | Teleinterview Part II^{7} BCP HOS Vitals | Teleinterview Part II^{7} BCP HOS Vitals CS  |
|  $2,000,000- $3,500,000^{8} | N/A^{9} | Teleinterview Part II^{7} BCP HOS Vitals | Teleinterview Part II^{7} BCP HOS Vitals | Teleinterview Part II^{7} BCP HOS Vitals | Teleinterview Part II^{7} BCP HOS Vitals | Teleinterview Part II^{7} BCP HOS Vitals CS  |
|  $3,500,001- $5,000,000 | N/A | Teleinterview Part II^{7} BCP HOS Vitals IR | Teleinterview Part II^{7} BCP HOS Vitals IR | Teleinterview Part II^{7} BCP HOS Vitals IR | Teleinterview Part II^{7} BCP HOS Vitals IR | Teleinterview Part II^{7} BCP HOS Vitals IR CS  |

$^{1}$ May be eligible for fluidless acceleration. Agent to complete with the consumer. Paper application will require a teleinterview.

$^{2}$ Applicants receiving a Fluidless acceleration decision will not be reconsidered for a better rate classification.

$^{3}$ Non-U.S. residents are not eligible for automated decisioning or fluidless underwriting.

$^{4}$ Juveniles (0-17) must reside in the U.S. for consideration.

$^{5}$ MVR ordered at ages 16 and up.

$^{6}$ Financial supplement (PFS) required for age 70+ and face amounts > $1,000,000

$^{7}$ Vendor conducts Teleinterview Part II with consumer over the phone.

$^{8}$ Maximum face amount for California contracts is $2,000,000.

$^{9}$ Consideration through $2,000,000 on juveniles.

If Chronic and Critical Illness living benefit riders are selected, the case is not eligible for an immediate, point of sale decision. The case may still qualify for fluidless underwriting.

Requests to reduce face amount received during underwriting will not alter the age/amount requests.

Prescription and medical claims data checks will be ordered on all applications.

Transamerica reserves the right to request other evidence of insurability as it deems necessary.

Transamerica performs post-issue audits on cases put in force to validate our underwriting assessments and models. If we develop information that was not disclosed at the time of the application, we reserve the right to rescind the policy.

For Agent Use Only. Not for Use With the Public.

4

---

# UNDERWRITING TIPS

## INSURABLE INTEREST

Insurable interest must exist between the proposed insured(s), policy owner(s), payer(s), and beneficiary.* Underwriting reserves the right to make the final determination on the issuance of any policy(ies).

## FLUIDLESS DOES NOT MEAN GUARANTEED ISSUE

Nonmedical means that initial underwriting requirements do not include traditional underwriting requirements such as paramedical exam with labs, although vitals/physical findings and/or labs may be required upon case review at underwriter discretion. All applications are subject to a Medical Information Bureau (MIB) report, motor vehicle report, prescription check, medical data check personal history, and medical history (Application Part 2). Guaranteed issue, as the name implies, guarantees certain life insurance policies will be issued, regardless of health. Since the insured cannot be declined or turned down, carriers generally offer low death benefit options with higher-than-normal premiums. We do not currently offer any guaranteed-issue policies.

## AN APPLICATION IS VALID FOR 180 DAYS

Cases will close after 45 days if there are outstanding requirements and no activity on the file. An agent may request an extension of the closure date.

## IF THE PROPOSED INSURED IS A JUVENILE, A PARENT/LEGAL GUARDIAN SIGNATURE IS REQUIRED

If the grandparent is the owner of the policy, the parents are still required to sign the application and HIPAA. If the legal guardian is not a parent, proof of guardianship will be requested. Please note that state statutes take precedence regarding requirements.

## A LEGIBLE CASE ID NUMBER MUST BE PRINTED ON ALL CORRESPONDENCE FOR PROPER PROCESSING

## APPLICATION AND ALL FORMS (MEDICAL QUESTIONS/TELEINTERVIEW AS WELL) NEED TO BE FILLED OUT COMPLETELY AND ACCURATELY

For the best agent and customer experience, the electronic application through iGO® e-App should be used rather than a paper application.

## ALWAYS PROVIDE THE BEST TIMES, TELEPHONE NUMBERS, AND ANY SPECIAL LANGUAGE NEEDS FOR YOUR CLIENT

Providing accurate contact information will assist in timely ordering and collection of underwriting information.

## ANY OMISSIONS OR MISSTATEMENTS IN AN APPLICATION COULD CAUSE AN OTHERWISE VALID CLAIM TO BE DENIED UNDER ANY INSURANCE ISSUED FROM THE APPLICATION

* Insurable interest of beneficiary is subject to state statutes.

For Agent Use Only. Not for Distribution to the Public.

5

---

# UNDERWRITING TIPS

## LIVING BENEFIT COVERAGE*

Certain medical conditions will impact an individual's eligibility for living benefits coverage, and Transamerica reserves the right to decline living benefit riders or products based on an individual's medical history.

**The following are some conditions that may not be eligible for chronic illness and/or critical illness living benefit coverage** (this list is not all-inclusive):

- Drug and alcohol abuse
- Cancer (other than nonmelanoma skin cancer)
- Coronary artery disease
- Diabetes with insulin use
- Inability to perform activities of daily living (ADLs)
- Motor neuron disease
- Multiple sclerosis
- Muscular dystrophy
- Parkinson's disease
- Stroke or TIA
- Systemic lupus erythematosus

* Underwriting reserves the right to rate the base policy, deny or limit benefits, or offer a different product based on medical information obtained during the underwriting process.

For Agent Use Only. Not for Distribution to the Public.

6

---

# HOW DO I APPROACH DELICATE SUBJECTS?

To help clients obtain the coverage they need, you need to be sure to ask all the necessary questions — even the uncomfortable ones. Remember, incomplete responses will delay the review process, the client's coverage, and your commission payment. Below are some suggestions to help you address these sensitive subjects.

## EXPLAIN THAT CORRECT WEIGHT AND OTHER SENSITIVE DETAILS ARE REQUIRED

Before you submit a client as preferred, be sure he or she meets the criteria. Refer to the underwriting criteria and medical impairments information in the following pages of this guide to determine if the applicant is eligible for coverage and at what underwriting class. It may help the client understand how important it is to provide correct details.

## ASSURE THE CLIENT THAT ALL INFORMATION ON THE APPLICATION IS CONFIDENTIAL

If the applicant has ever been arrested or has sensitive medical history, he or she may not want to disclose it. Assure all clients in advance that the application is confidential and none of their personal information is at risk.

Where possible, select a condition from the list and/or drop down menu. If you must select "Any Other Disease or Disorder," try to find the condition in the box that will appear and select it, SPELLING IS IMPORTANT. If you cannot find a match, it is OK to type the condition and hit confirm. At this time, a box entitled "Description" will appear.

## DOCUMENT THE DETAILS:

**Bad example:** Misdemeanor

**Good example:** Public intoxication August 2018, fined $250 with one night in jail, probation ended August 2020; Trespassing October 2015, fined $100 with one night in jail, probation ended March 2016.

## ASK THE FOLLOWING IMPORTANT QUESTIONS ABOUT MEDICAL AND CRIMINAL ACTIVITIES

To gain a complete picture of an applicant's medical, criminal, or moving violation history, ask the following questions when completing the description box:

1. When was the condition diagnosed or date of criminal activity or moving violation (provide as correct date, month, and year as possible)?
2. What was the cause?
3. How and when was it treated?
4. When were the last symptoms?
5. If currently symptomatic, what are your limitations?
6. What was the charge and sentence?
7. Are you currently on parole or probation?

## DOCUMENT THE DETAILS:

**Bad example:** Heart surgery

**Good example:** Bypass surgery, 01/31/2011. Last seen six months ago for routine checkup with normal findings. Currently on atorvastatin medication.

For Agent Use Only. Not for Distribution to the Public.

7

---

# FIELD UNDERWRITING

## WHAT IS FIELD UNDERWRITING?

In order to provide the most accurate picture of the applicant to the insurer, it is important for an agent to get to know his or her clients in the process of soliciting business. This process, known as field underwriting, is the initial medical and financial screening of prospective buyers of life insurance and is a key responsibility of our agents.

For an agent, good field underwriting builds credibility with your client and boosts your reputation in the community as a knowledgeable life insurance advisor. Often additional requirements are needed due to inconsistent information provided; therefore, the more complete and accurate the information is on the application, the less likely additional requirements, such as an Attending Physician Statement (APS), will be needed. More importantly, it can lead to a better customer experience by setting realistic expectations for a potential rate class, which will be beneficial to everyone involved. When meeting with your client, please be sure to keep in mind the following questions:

- What is their occupation, annual income, and net worth?
- Have they ever been rated or denied for life, long term care, or other insurance in the past and why?
- Do they already own a life insurance policy?
  - If so, what is the face amount and company that issued it? Is it being replaced?
- What is the purpose of the life insurance being applied for?
- Do they have any medical issues?
- Do they travel outside the U.S. or are they a foreign national?
- Do they participate in aviation, scuba, climbing, racing, or other similar activities?
- Any driving violations?

## WHY SHOULD I PERFORM FIELD UNDERWRITING?

- Expedite the underwriting process
- Meet client expectations
- May reduce the need for additional underwriting requirements
- Ensure conditional receipt is binding

For Agent Use Only. Not for Distribution to the Public.

---

# UNDERWRITING REQUIREMENTS AND REPORTS DEFINED

Transamerica will order all necessary underwriting evidence for your customer, reducing the burden on your time and efforts, as well as insuring we only get the necessary information to understand your customer's risk profile.

**Transamerica reserves the right to request other evidence of insurability as it deems necessary.**

## VITALS AND PARAMED PHYSICAL FINDINGS

When required, paramed physical findings are ordered by the home office and are completed by an approved third-party vendor. The process includes a qualified examiner completing proper paperwork/forms, taking vitals (height, weight, blood pressure and pulse), and if applicable collecting fluids (blood and urine), and administering ECGs.

## TELEINTERVIEW

A teleinterview is a guided interview completed over the phone, conducted by an examiner through a third-party vendor. Several base questions will be asked, and related reflexive questions based on your individual client's medical history.

## HOME OFFICE SPECIMEN

A home office specimen (HOS) is a urine sample collected during the paramed physical findings visit and is sent to a laboratory for analysis.

## BLOOD CHEMISTRY PROFILE

A blood chemistry profile (BCP) is a venous blood draw collected during the paramed physical findings visit and is sent to a laboratory for analysis.

AccessMyHealth™ is a web portal that allows clients to access the results of their blood, urine and paramed physical findings tests, taken in connection with their life insurance application. When the client completes their labs or paramed physical findings test, they can opt in to receive text notifications. Once their labs are processed (up to seven days after completion), the client will receive a text message with a link to the AccessMyHealth web portal. From there, the client can register to obtain their results using their phone number and date of birth.

transamerica.accessmyhealth.com

## RESTING ELECTROCARDIOGRAM

During an electrocardiogram (ECG), small patches are placed on the chest, arms, and legs to record the electrical activity and rhythm of the heart. If normal resting ECG records are available from a test conducted within the last 12 months, test need not be repeated.

All requirements will be administered by Transamerica through Transamerica-approved vendors.

For Agent Use Only. Not for Distribution to the Public.

9

---

# UNDERWRITING REQUIREMENTS AND REPORTS DEFINED CONTINUED

## MINNESOTA COGNITIVE ACUITY SCREEN

The Minnesota Cognitive Acuity Screen (MCAS) is a telephone interview conducted by a registered nurse (RN), who is specifically trained to administer the test. The purpose for this test is to screen for potential early cognitive impairment. Proposed insureds age 70 and older applying for $100,000 or more in coverage, will be required to complete an MCAS.

It is important your client realize the significance of the interview and concentrate to do as well as they can. Your client should be in an environment that is free of distractions. If they wear a hearing aid, they should have it on during the interview. The telephone interview usually takes between 15-20 minutes.

Family, friends, or agent can be present, but they must be in a separate room during the cognitive interview, not interacting at all with the proposed insured in any way during the course of the interview.

## INSPECTION REPORTS (IR, BBIR, EIR)

Provides a holistic view of the proposed insured's public record footprint, including such information as financials, criminal records history, properties owned, and bankruptcies. Inspection reports may be completed as a telephone interview or by online database searches, depending on the amount being applied for.

## PERSONAL FINANCIAL STATEMENTS

A Financial Supplement to Application for Life Insurance (also known as a Personal Financial Supplement or a Confidential Financial Questionnaire) will be requested if: the income and net worth of proposed insured is not provided on the application; The company finds the financial information unclear, inconsistent, or additional details are needed; and/or the insurance is being used for business coverage, including Buy-Sell, Loan, and Key Person applications.

## FORM 4506T-EZ

Form 4506T-EZ, is an Internal Revenue Service (IRS) form which gives permission for Transamerica to receive a transcript of previously filed tax returns directly from the IRS. This pre-filled form is obtained through your agent portal or through iPipeline® to expedite processing.

## MOTOR VEHICLE REPORTS

A motor vehicle report (MVR) is a record of a proposed insured's driving history.

## LABPIQTURE™

A LabPIQture report from ExamOne will contain up to seven years of clinical lab test results. These results are obtained from the vast network of Quest Diagnostics and LabCorp, and are populated with physician-ordered laboratory tests related to preventative care, disease monitoring, and diagnostic purposes, with some additional coverage from biometric screenings. Additional medical context returned with the test results are date of service, ordering physician specialty, submitted diagnosis codes (ICD-9/10-CM), and a standardized test type identifier.

For Agent Use Only. Not for Distribution to the Public.

10

---

# UNDERWRITING REQUIREMENTS AND REPORTS DEFINED CONTINUED

## PRESCRIPTION AND MEDICAL CLAIMS DATA CHECK

A prescription and medical claims data check will be ordered on every application and includes details on prescriptions filled, medical diagnoses, hospital and physician procedures, inpatient and clinic administered medications, and medical equipment information — as well as prescribing physician's information. Your client can request a copy of their report at rxhistories.com.

## IDENTITY VERIFICATION

A check to verify the identities of our customers in order to ensure the quality of business, manage identity risk, prevent identity fraud, and comply with obligations under the USA Patriot Act. This check is primarily used for identity verification. In some instances we may request a copy of the individual's Social Security card, driver's license or other state-issued ID, or utility bill to help verify an individual's identity.

## ATTENDING PHYSICIAN STATEMENTS

An attending physician statement (APS) is a copy of the proposed insured's medical records obtained from their attending physician or healthcare provider.

## APS GUIDELINES ARE AS FOLLOWS:

|  FACE AMOUNTS  |   |   |   |
| --- | --- | --- | --- |
|  Age | Up to and including $500,000 | $500,001 to $1 million | $1,000,001 to $2 million  |
|  15 days–17 years | NOT ROUTINELY (for cause only) | YES | YES  |
|  18–55 years | NOT ROUTINELY (for cause only) | NOT ROUTINELY (for cause only) | NOT ROUTINELY (for cause only)  |
|  56–70 years | NOT ROUTINELY (for cause only) | NOT ROUTINELY (for cause only) | NOT ROUTINELY (for cause only)  |
|  71 years and older | YES | YES | YES  |

## TRANSAMERICA ORDERS ALL REQUIREMENTS

Please refer to age/amount chart. Be aware that an agent may be charged if they order requirements, as Transamerica handles ordering of age and amount requirements.

For Agent Use Only. Not for Distribution to the Public.

11

---

# UNDERWRITING REQUIREMENTS AND REPORTS DEFINED CONTINUED

## TRANSAMERICA'S REQUIREMENT VENDORS

Transamerica will order all requirements from one of the following vendors. Any underwriting evidence obtained for insurance with another carrier will not be accepted.

|  VENDOR NAME | USED FOR  |
| --- | --- |
|  APPS | Teleinterview, paramed physical findings, blood/urine, ECG  |
|  CRL | Labs  |
|  ExamOne | APS (attending physician statement)  |
|  Illumifin | Inspection Reports and MCAS (Minnesota Cognitive Acuity Screen)  |

|  REQUIREMENTS | THROUGH AGE 70 | AGE 71 AND OLDER  |
| --- | --- | --- |
|  Paramed Physical Findings/Vitals | Valid for 1 year | Valid for 6 months  |
|  Teleinterview | Valid for 90 days | Valid for 90 days  |
|  Resting Electrocardiogram (ECG)* | Valid for 1 year | Valid for 1 year  |
|  Inspection Report (IR) | Valid for 1 year | Valid for 1 year  |
|  Financial Supplement to Application for Life Insurance | Valid for 1 year | Valid for 1 year  |
|  Home Office Urine Specimen (HOS) | Valid for 1 year | Valid for 6 months  |
|  Blood Chemistry Profile (BCP) | Valid for 1 year | Valid for 6 months  |
|  Minnesota Cognitive Acuity Screen (CS) | N/A | Valid for 6 months  |

* ECG: If normal resting ECG records are available from a test conducted within the last 12 months, the test need not be repeated. Transamerica reserves the right to request other evidence of insurability as it deems necessary.

For Agent Use Only. Not for Distribution to the Public.

12

---

# DETERMINING COVERAGE AMOUNTS FOR INDIVIDUALS

While each of your clients have different financial needs, these guidelines are intended to provide a general formula to help calculate suggested maximum amounts of life insurance.

- What does the client do for a living?
- What is their annual income and net worth?
- Do they already own a life insurance policy?
  - If so, what is the face amount and company that issued it? Is it being replaced?
- What is the purpose of the life insurance being applied for?
- Do they have any medical issues that may result in a higher premium?

|  PURPOSE | FORMULA |   | REQUIREMENTS  |
| --- | --- | --- | --- |
|  **Income Continuation** | Ages | Income Factor | - Income stated must be reasonable for the profession or occupation stated. - Income source considered will be that of the proposed insured, not the household income or that of the owner. - Earned income includes salary, bonuses, commissions, and deferred compensation and excludes income from investments.  |
|   |  18-35 36-70 71+ | 40 75 minus current age individual consideration  |   |
|  **Non-Income Earning Spouse/Partner** | Up to $500,000 |   | - Review of household income - Review of total line of insurance in force  |
|   |  $500,001-$5,000,000 |   | All requirements as indicated above for face amounts through $500,000, plus: - Spouse/partner total line of personal coverage in force - Up to equal coverage of income-earning spouse/partner. - Household net worth  |
|  **College Student** | Up to $2,000,000 total line |   | - Annual earned income - Greater of income multiplier or $2,000,000  |

Transamerica reserves the right to order additional financial requirements.

For Agent Use Only. Not for Distribution to the Public.

13

---

# PREMIUM TO INCOME GUIDELINES

|  PURPOSE | FORMULA |   | REQUIREMENTS  |
| --- | --- | --- | --- |
|  **Affordability Guidelines** | Annual Premium for all policies/Annual Income % should not exceed the percentages below. |   | - There should not be a significant adverse change in financial status or financial flexibility as a result of the purchase of the policy(ies). - For incomes less than $15,000 (USD), details supporting the need and purpose of the insurance may be necessary. Adjustments (upwards) for family size (when known) should be considered to align with U.S. Federal Poverty Guidelines published by the U.S. Department of Health & Human Services. - Premium affordability should be demonstrated for the total premiums being paid on all policies, by the payer(s). This includes all policies on the payer(s) life and all policies on the lives of others for which they are paying.  |
|   |  Annual Income | Premium to Income  |   |
|   |  ≤ $30,000 | 15%  |   |
|   |  > or = $30,001 | 20%  |   |

Transamerica reserves the right to order additional financial requirements.

For Agent Use Only. Not for Distribution to the Public.

14

---

# DETERMINING COVERAGE AMOUNTS FOR JUVENILES

|  PURPOSE | FORMULA |   | REQUIREMENTS*  |
| --- | --- | --- | --- |
|  Juvenile | Ages | Face Amount  |   |
|  Total juvenile insurance coverage with all carriers cannot exceed $2,000,000. | 15 days through 17 years | Amounts through $250,000 | - Coverage on all siblings should be similar. - Parent(s) or guardian(s) must witness the applications and complete the medical history declarations for the juvenile applicant. - The policy owner must be the parent, legal guardian, or grandparent. For legal guardianship where the guardian is not the parent, we require a copy of the guardianship papers. - The parent/legal guardian, juvenile, and owner must be residing in the U.S. permanently, either as a U.S. citizen or a visa type that is not considered temporary or uninsurable based on our international underwriting guidelines.  |
|   |   |  $250,001-$1,000,000 | **All requirements as indicated above for face amounts through $250,000, plus:** - Equal coverage* for parent(s) or legal guardian is allow up to $1,000,000.****For amounts $500,000 and greater:** - Underwriting will obtain the child's medical records. - Minimum household income must be ≥ $100,000.  |
|   |   |  $1,000,001-$2,000,000 | **All requirements as indicated above for face amounts through $1,000,000, plus:** - At least one parent or legal guardian needs to have 2x the total line of coverage, in force and applied for, pending, as the amount applied for on the juvenile.  |
|  Washington State | 15 days through 17 years | Total line of coverage cannot exceed the U.S. household income. | **All requirements as indicated above for the appropriate face amount, plus:** - Juveniles 15 years or older must sign the application.  |

Group coverage, accidental death and dismemberment insurance, and credit card insurance should not be counted in determining the parent/owner's total coverage.

State specific laws, including NY and WA, take precedence over company guidelines.

* All siblings should have similar coverage.

For Agent Use Only. Not for Distribution to the Public.

15

---

# DETERMINING COVERAGE AMOUNTS FOR BUSINESS PLANNING

|  PURPOSE | FORMULA |   | REQUIREMENTS  |
| --- | --- | --- | --- |
|  **Estate Planning** | Projected future estate tax liability |   | - The purpose of the insurance - A current value of the applicant's estate, which includes a personal balance sheet listing all assets and liabilities and an estate analysis - Third-party financial verification if total combined face amount in force, and pending, is greater than $10 million or total line over jumbo limits - The estate projection rate and/or number of projected years may be adjusted, up or down, taking into consideration what is reasonable in the current environment  |
|   |  **Ages** | **Maximum Projection Years**  |   |
|   |  18-50 | 25  |   |
|   |  51-60 | 20  |   |
|   |  61-70 | 15  |   |
|   |  71-75 | 10  |   |
|   | 76+ | 5 |   |
|  **Key Person** | **Ages** | **Factor x Income** | - The key person's value to the company - How the coverage amount was determined - Whether the key person has ownership in the company and the percentage of ownership - A list of all other key persons, the amount of key person coverage, and percentage ownership for each key person  |
|   |  Under 65 65+ | Up to 10 Up to 5  |   |
|  **Buy-Sell/Business Continuation** | % Ownership x Corporate Value |   | - The fair market value of the business and how the amount of insurance was determined - A copy of the buy-sell agreement or the details of the buy-sell agreement - The proposed insured's ownership percentage, the number of other partners, and their ownership percentage - The amount of buy-sell coverage on each partner and the amount and purpose of all in force business coverage All partners must apply for or have in force buy-sell coverage. Corporate balance sheets, income statements and/or business valuation may be requested at Underwriter discretion.  |
|  **Business Loan** | An amount up to the outstanding principal of the loan |   | - The business must be the owner of the policy - Include the purpose, duration of the loan, collateral pledged, its value and the loan interest rate - The term of the loan must be five years or more - The business may be the policy owner and beneficiary. Alternatively, the proposed insured may be the policy owner naming a personal beneficiary. The death benefit should be collaterally assigned to the lending institution. The lending institution cannot be the policy owner and/or beneficiary.  |

For Agent Use Only. Not for Distribution to the Public.

16

---

# BLENDED BODY MASS INDEX (BMI) CHART

## ADULT — AGES 16+

|  BMI RANGE | AGES 16–59  |
| --- | --- |
|  <= 16 | Decline  |
|  16.0001–17.0000 | Nontobacco & Tobacco  |
|  17.0001–28.0000 | Preferred Elite  |
|  28.0001–30.0000 | Preferred Plus/Preferred Tobacco  |
|  30.0001–32.0000 | Preferred  |
|  32.0001–35.0000 | Nontobacco & Tobacco  |
|  35.0001–37.0000 | Table A  |
|  37.0001–39.0000 | Table B  |
|  39.0001–41.0000 | Table C  |
|  41.0001–42.0000 | Table D  |
|  42.0001–43.0000 | Table E  |
|  43.0001–44.0000 | Table F  |
|  44.0001–46.0000 | Table H  |
|  >46 | Decline  |

|  BMI RANGE | AGES 60+  |
| --- | --- |
|  <= 16 | Decline  |
|  16.0001–18.0000 | Individual Consideration  |
|  18.0001–28.0000 | Preferred Elite  |
|  28.0001–30.0000 | Preferred Plus/Preferred Tobacco  |
|  30.0001–32.0000 | Preferred  |
|  32.0001–35.0000 | Nontobacco & Tobacco  |
|  35.0001–37.0000 | Table A  |
|  37.0001–39.0000 | Table B  |
|  39.0001–41.0000 | Table C  |
|  41.0001–42.0000 | Table D  |
|  42.0001–43.0000 | Table E  |
|  43.0001–44.0000 | Table F  |
|  44.0001–46.0000 | Table H  |
|  >46 | Decline  |

In order to calculate Adult BMI, please click here.

## JUVENILE — AGES 2 THROUGH 15*

|  AGE | JUVENILE STANDARD  |
| --- | --- |
|  2 | 13.9–30.0  |
|  3 | 13.9–29.0  |
|  4 | 12.9–29.0  |
|  5 | 12.9–29.0  |
|  6 | 12.9–29.0  |
|  7 | 12.9–30.0  |
|  8 | 12.9–31.0  |
|  9 | 12.9–32.0  |
|  10 | 12.9–33.0  |
|  11 | 13.9–34.0  |
|  12 | 13.9–35.0  |
|  13 | 14.9–36.0  |
|  14 | 14.9–37.0  |
|  15 | 15.9–38.0  |

In order to calculate Juvenile BMI, please click here.

* Ages under two years old generally OK unless premature. Ages over 15 — see adult body mass index charts.

For Agent Use Only. Not for Use With the Public.

17

---

# LIFESTYLE AND HEALTH HISTORY

## IMPACT ON RISK CLASS

|  TRANSAMERICA LIFETIME^{SM} | PREFERRED ELITE | PREFERRED PLUS | PREFERRED | NONTOBACCO | PREFERRED TOBACCO | TOBACCO  |
| --- | --- | --- | --- | --- | --- | --- |
|  **Tobacco Usage*** | None in 5 yrs | None in 2 yrs | None in 2 yrs | None in 2 yrs | Tobacco permitted | Tobacco permitted  |
|  **Cholesterol with or without treatment**** | 230 | 260 | 300 | ** | 260 | **  |
|  **Chol /HDL Ratio**** | 5.0 for ages <=70 5.5 for ages 71+ | 5.5 for ages <=70 6.0 for ages 71+ | 6.2 for ages <=70 6.7 for ages 71+ | 7.0 for ages <=70 7.5 for ages 71+ | 5.5 for ages <=70 6.0 for ages 71+ | **  |
|  **Blood pressure with or without treatment*** | 135/85 for ages <=70 145/85 for ages 71+ Treatment only allowed ages 50-80 | 145/85 for ages <=70 150/90 for ages 71+ With or without treatment | 148/88 for ages <=70 152/88 for ages 71+ With or without treatment | ** | 145/85 for ages <=70 150/90 for ages 71+ With or without treatment | **  |
|  **Family history^{1}** - Includes cardiovascular disease or the following cancers: breast, ovarian, melanoma, prostate, and colon - Some cancers may require evidence of routine surveillance screening | No Death in Parent or Sibling prior to age 60 | No Death in Parent or Sibling prior to age 60 | No more than one Parent or Sibling death prior to age 60 | ** | No Death in Parent or Sibling prior to age 60 | **  |
|  **Personal history** | No personal history of heart or vascular disease, diabetes, cancer (except some skin cancers) | No personal history of heart or vascular disease, diabetes, cancer (except some skin cancers) | No personal history of heart or vascular disease, diabetes, cancer (except some skin cancers) | ** | No personal history of heart or vascular disease, diabetes, cancer (except some skin cancers) | **  |
|  **DUI** | None in last 5 yrs | None in last 5 yrs | None in last 5 yrs | ** | None in last 5 yrs | **  |
|  **MVR - major violations** | None in last 12 months, no more than 1 in last three yrs | No more than 1 in last three yrs | No more than 1 in last three yrs | ** | No more than 1 in last three yrs | **  |
|  **MVR - minor violations** | No more than 3 violations in last 3 yrs | No more than 3 violations in last 3 yrs | No more than 3 violations in last 3 yrs | ** | No more than 3 violations in last 3 yrs | **  |
|  **Private aviation** | No aviation | With or without ratable aviation | With or without ratable aviation | With or without ratable aviation | With or without ratable aviation | With or without ratable aviation  |
|  **Avocation** | No participation in listed activities^{2} | No participation in listed activities^{2} | No participation in listed activities^{2} | Can be offered with or without ratable avocation | No participation in listed activities^{2} | Can be offered with or without ratable avocation  |
|  **Alcohol/substance abuse** | Never | Never | 10 yrs | 7 yrs | 10 yrs | 7 yrs  |

* Tobacco usage is defined as using any tobacco product(s) (cigarettes, cigars, chewing tobacco, nicotine patch/lozenge/gum/pouch, e-cigarettes, vapes (with or without nicotine)), etc, within the past 24 months.

** May include a rating

$^{1}$ Some gender-specific cancers may qualify for preferred rates.

$^{2}$ Avocation: Prohibited activities include aeronautics (e.g., hang gliding, ultralight, soaring, skydiving, ballooning, etc.), power racing competitive vehicles, mountain climbing, rodeos, competitive skiing, or scuba/skin diving at a depth greater than 75 feet.

For Agent Use Only. Not for Use With the Public.

18

---

# LIFESTYLE AND HEALTH HISTORY

## IMPACT ON RISK CLASS

|  TRANSAMERICA LIFETIME^{SM} | PREFERRED ELITE | PREFERRED PLUS | PREFERRED | NONTOBACCO | PREFERRED TOBACCO | TOBACCO  |
| --- | --- | --- | --- | --- | --- | --- |
|  Travel | No dangerous travel^{1} | No dangerous travel^{1} | No dangerous travel^{1} | No dangerous travel^{1} | No dangerous travel^{1} | No dangerous travel^{1}  |
|  Citizenship/Residency | U.S. citizens/ green card holders - all others contact UW | U.S. citizens/ green card holders - all others contact UW | U.S. citizens/ green card holders - all others contact UW | U.S. citizens/ green card holders - all others contact UW | U.S. citizens/ green card holders - all others contact UW | U.S. citizens/ green card holders - all others contact UW  |
|  Military | Active military duty is acceptable provided insured is not serving in a hazardous area or does not have orders to serve in a hazardous area^{2} | Active military duty is acceptable provided insured is not serving in a hazardous area or does not have orders to serve in a hazardous area^{2} | Active military duty is acceptable provided insured is not serving in a hazardous area or does not have orders to serve in a hazardous area^{2} | Active military duty is acceptable provided insured is not serving in a hazardous area or does not have orders to serve in a hazardous area^{2} | Active military duty is acceptable provided insured is not serving in a hazardous area or does not have orders to serve in a hazardous area^{2} | Active military duty is acceptable provided insured is not serving in a hazardous area or does not have orders to serve in a hazardous area^{2}  |

$^{1}$ Foreign travel: unless otherwise prohibited by statute

$^{2}$ Military: unless otherwise prohibited by statute

For Agent Use Only. Not for Use With the Public.

19

---

# MEDICAL IMPAIRMENTS

|  IMPAIRMENT | BEST POSSIBLE RATE CLASS AVAILABLE |   |   | RIDER AVAILABILITY  |   |
| --- | --- | --- | --- | --- | --- |
|   |  PREFERRED RATE CLASS | STANDARD RATE CLASS (NONTOBACCO/ TOBACCO) | DECLINE | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER / LONG TERM CARE RIDER  |
|  Impacted ADL's | Yes |  |  |  |   |
|  ADD/ADHD (age 8 and under) |  |  | Yes |  |   |
|  AIDS |  |  | Yes |  |   |
|  Alcoholism |  |  | Yes |  |   |
|  ALS (Lou Gehrig's disease) |  |  | Yes |  |   |
|  Alzheimer's disease/dementia |  |  | Yes |  |   |
|  Amputations, not due to disease | Yes |  |  | ✓ | ✓  |
|  Anemia | Yes |  |  | ✓ | ✓  |
|  Aneurysm |  | Yes |  |  |   |
|  Anxiety | Yes |  |  | ✓ | ✓  |
|  Arthritis, osteo | Yes |  |  | ✓ | ✓  |
|  Arthritis, rheumatoid |  | Yes |  | ✓ |   |
|  Asthma | Yes |  |  | ✓ | ✓  |
|  Atrial fibrillation |  | Yes |  | ✓ | ✓  |
|  Autism |  | Individual consideration |  | ✓ |   |
|  Barrett's esophagus |  | Yes |  | ✓ | ✓  |
|  Bell's palsy | Yes |  |  | ✓ | ✓  |
|  Bipolar disorder |  | Yes |  |  |   |
|  Blindness | Yes |  |  |  |   |
|  Benign Prostatic Hypertrophy (BPH) | Yes |  |  | ✓ | ✓  |
|  Broken bone | Yes |  |  | ✓ | ✓  |
|  Bronchitis, chronic (COPD) |  | Yes |  |  | ✓  |
|  Bundle branch block, right | Yes |  |  | ✓ | ✓  |
|  Bundle branch block, left |  | Yes |  | ✓ | ✓  |
|  Cancer (internal organ) |  | Yes |  | ✓ |   |
|  Cancer, skin (not melanoma) | Yes |  |  | ✓ | ✓  |
|  Cancer (undergoing treatment) |  |  | Yes |  |   |
|  Cardiomyopathy |  | Yes |  |  |   |
|  Cerebral palsy |  | Yes |  |  |   |
|  Cerebrovascular accident, stroke (CVA) |  | Yes |  |  |   |
|  Chronic fatigue syndrome | Yes |  |  | ✓ | ✓  |
|  Chronic obstructive pulmonary disorder (COPD) |  | Yes |  |  | ✓  |
|  Chronic pain |  | Yes |  | ✓ |   |
|  Cirrhosis |  |  | Yes |  |   |
|  Colitis, ulcerative |  | Yes |  |  |   |
|  Colitis, other than ulcerative | Yes |  |  | ✓ | ✓  |
|  Concussion (head injury) | Yes |  |  | ✓ | ✓  |

Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition. Potential morbidity assessments may differ.

For Agent Use Only. Not for Use With the Public.

20

---

# MEDICAL IMPAIRMENTS

|  IMPAIRMENT | BEST POSSIBLE RATE CLASS AVAILABLE |   |   | RIDER AVAILABILITY  |   |
| --- | --- | --- | --- | --- | --- |
|   |  PREFERRED RATE CLASS | STANDARD RATE CLASS (NONTOBACCO/ TOBACCO) | DECLINE | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER / LONG TERM CARE RIDER  |
|  Congestive heart failure (CHF) |  |  | Yes |  |   |
|  Coronary artery disease |  | Yes |  |  | ✓  |
|  Criminal activity | Yes |  |  | ✓ | ✓  |
|  Crohn's disease |  | Yes |  |  |   |
|  Cystic fibrosis |  |  | Yes |  |   |
|  Depression | Yes |  |  | ✓ | ✓  |
|  Diabetes |  | Yes |  | ✓ | ✓  |
|  Down syndrome |  |  | Yes |  |   |
|  Emphysema |  | Yes |  |  | ✓  |
|  Endocarditis |  | Yes |  | ✓ | ✓  |
|  Epilepsy (greater than age 3) |  | Yes |  | ✓ | ✓  |
|  Fibromyalgia, fibrositis | Yes |  |  | ✓ | ✓  |
|  Gastric banding, sleeve or bypass surgery | Yes |  |  | ✓ | ✓  |
|  Gastroesophageal reflux disease (GERD) | Yes |  |  | ✓ | ✓  |
|  Glomerulonephritis |  | Yes |  | ✓ | ✓  |
|  Headache, migraine or tension | Yes |  |  | ✓ | ✓  |
|  Heart attack |  | Yes |  |  | ✓  |
|  Heart, lung, or liver transplant |  |  | Yes |  |   |
|  Heart valve surgery |  | Yes |  |  | ✓  |
|  Hepatitis B |  | Yes |  |  |   |
|  Hepatitis C |  | Yes |  |  |   |
|  Hernia | Yes |  |  | ✓ | ✓  |
|  High blood pressure/hypertension | Yes |  |  | ✓ | ✓  |
|  Histoplasmosis |  | Yes |  | ✓ | ✓  |
|  Hodgkin's disease |  | Yes |  |  | ✓  |
|  Huntington's disease |  |  | Yes |  |   |
|  Hydronephrosis |  | Yes |  | ✓ | ✓  |
|  Kidney failure, dialysis |  |  | Yes |  |   |
|  Kidney removal | Yes |  |  | ✓ | ✓  |
|  Leukemia |  | Yes |  |  |   |
|  Lou Gehrig's disease (ALS) |  |  | Yes |  |   |
|  Lupus |  | Yes |  |  |   |
|  Marijuana use | Yes |  |  | ✓ | ✓  |
|  Melanoma (less than 2, including melanoma in situ) |  | Yes |  |  | ✓  |
|  Meniere's disease | Yes |  |  | ✓ | ✓  |
|  Meningioma | Yes |  |  | ✓ | ✓  |
|  Meningitis, history of | Yes |  |  |  | ✓  |

Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition. Potential morbidity assessments may differ.

For Agent Use Only. Not for Use With the Public.

21

---

# MEDICAL IMPAIRMENTS

|  IMPAIRMENT | BEST POSSIBLE RATE CLASS AVAILABLE |   |   | RIDER AVAILABILITY  |   |
| --- | --- | --- | --- | --- | --- |
|   |  PREFERRED RATE CLASS | STANDARD RATE CLASS (NONTOBACCO/ TOBACCO) | DECLINE | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER / LONG TERM CARE RIDER  |
|  Mental retardation and/or intellectual disability |  | Yes |  |  |   |
|  Mitral insufficiency, Mitral valve prolapse (MVP) |  | Yes |  | ✓ | ✓  |
|  Mitral stenosis |  | Yes |  | ✓ | ✓  |
|  Multiple sclerosis (MS) |  | Yes |  |  |   |
|  Muscular dystrophy |  | Yes |  |  |   |
|  Myasthenia gravis |  | Yes |  |  |   |
|  Myocarditis |  | Yes |  | ✓ | ✓  |
|  Nephrectomy | Yes |  |  | ✓ | ✓  |
|  Non-Hodgkin's lymphoma |  | Yes |  |  | ✓  |
|  Occupations with special hazards | Yes |  |  | ✓ | ✓  |
|  Pacemaker |  | Yes |  | ✓ | ✓  |
|  Pancreatitis (resolved) |  | Yes |  | ✓ | ✓  |
|  Paralysis, spinal cord injury |  | Yes |  |  |   |
|  Parkinson's disease |  | Yes |  |  |   |
|  Pericarditis |  | Yes |  | ✓ | ✓  |
|  Peripheral vascular disease (PVD) |  | Yes |  | ✓ |   |
|  Phlebitis, thrombosis, blood clot |  | Yes |  | ✓ | ✓  |
|  Pituitary adenoma |  | Yes |  | ✓ | ✓  |
|  Pleurisy | Yes |  |  | ✓ | ✓  |
|  Pregnancy, no history of or current complications | Yes |  |  | ✓ | ✓  |
|  Prostatitis, with normal PSA | Yes |  |  | ✓ | ✓  |
|  Psychosis |  | Yes |  |  |   |
|  Pulmonary fibrosis |  |  | Yes |  |   |
|  Pyelonephritis, acute | Yes |  |  | ✓ | ✓  |
|  Pyelonephritis, chronic |  | Yes |  |  |   |
|  Rheumatic fever, no heart complications | Yes |  |  | ✓ | ✓  |
|  Sarcoidosis |  | Yes |  | ✓ |   |
|  Schizophrenia |  | Yes |  |  |   |
|  Sleep apnea | Yes |  |  | ✓ | ✓  |
|  Stroke |  | Yes |  |  |   |
|  Suicide attempt (more than 2 years ago) |  | Yes |  |  |   |
|  Terminal illnesses |  |  | Yes |  |   |
|  Thyroid disorder | Yes |  |  | ✓ | ✓  |
|  Transient ischemic attack (TIA) |  | Yes |  |  |   |
|  Tuberculosis, recovered | Yes |  |  | ✓ | ✓  |
|  Tumors, benign | Yes |  |  | ✓ | ✓  |
|  Tumors, malignant, history of |  | Yes |  |  | ✓  |

Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition. Potential morbidity assessments may differ.

For Agent Use Only. Not for Use With the Public.

22

---

# MEDICAL IMPAIRMENTS

|  IMPAIRMENT | BEST POSSIBLE RATE CLASS AVAILABLE |   |   | RIDER AVAILABILITY  |   |
| --- | --- | --- | --- | --- | --- |
|   |  PREFERRED RATE CLASS | STANDARD RATE CLASS (NONTOBACCO/ TOBACCO) | DECLINE | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER / LONG TERM CARE RIDER  |
|  Ulcerative colitis |  | Yes |  |  |   |
|  Ulcer, stomach | Yes |  |  | ✓ | ✓  |
|  Vascular Ehlers-Danlos syndrome |  |  | Yes |  |   |
|  Wasting syndrome |  |  | Yes |  |   |

Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition. Potential morbidity assessments may differ.

For Agent Use Only. Not for Use With the Public.

23

---

# SUBSTANDARD TABLE RATINGS

Substandard ratings may be attributable to health, occupation, or avocation characteristics that result in higher than average mortality risks.

Our competitive underwriting allows us to offer substandard table ratings using the following guide:

|  TABLE RATING GUIDE  |
| --- |
|  Standard = 100%  |
|  1/A = 125%  |
|  2/B = 150%  |
|  3/C = 175%  |
|  4/D = 200%  |
|  5/E = 225%  |
|  6/F = 250%  |
|  8/H = 300%  |

For Agent Use Only. Not for Distribution to the Public.

24

---

# ADDITIONAL RIDER INFORMATION

## ACCIDENTAL DEATH BENEFIT RIDER (ADR)

Provides an additional death benefit if the primary insured dies as a result of an accident, or if the death occurs within 180 days of accidental bodily injury

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  15-55 years | - Not available if base is higher than Table D - Not available if any flat extra is added to base policy - Total benefit in force cannot exceed $300,000 with all Transamerica policies  |

## CHILDREN'S BENEFIT RIDER

Pays level death benefit upon death of any children of the insured. Rider is not rated.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  15 days to 18 years old (actual age of child) 18-80 years old insured | - Children with a risk profile greater than Table B will not be accepted for coverage  |

## CHRONIC ILLNESS RIDER

If the insured becomes chronically ill, you may elect to receive a portion of the death benefit that can be accelerated in advance of death. The insured must have the inability to perform at least two of the six activities of daily living for a period of 90 consecutive days, or have a severe cognitive impairment.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  Varies by risk class, product, and issue state | - Not available if base is higher than Table D - Not available if base is rated higher than $2.50 flat extra - The sum of all living benefit coverages under all Transamerica policies cannot exceed $1,500,000 - The maximum benefit payable under the Chronic Illness Rider is equal to the lesser of 90% of the available death benefit or $1,500,000 - Electable at issue, not automatically attached to the base product - Underwriting reserves the right to deny coverage under the Chronic Illness Rider on individuals with certain pre-existing conditions, impairments, or diseases  |

## CRITICAL ILLNESS RIDER

If the insured suffered a critical health condition (state specific) while the policy and rider are in effect, you may elect to receive an accelerated death payment subject to certain provisions.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  May vary by risk, product, and issue date | - Not available if base is higher than Table D - Not available if base is rated higher than $2.50 flat extra - The per life sum of all living benefit coverages under all Transamerica policies cannot exceed $1,500,000 - The per life maximum benefit payable under the Critical Illness Rider on *Transamerica Lifetime™* is equal to the lesser of 90% of the available death benefit or $500,000 - Electable at issue, not automatically attached to the base product - Underwriting reserves the right to deny coverage under the Critical Illness Rider on individuals with certain pre-existing conditions, impairments, or diseases  |

## DISABILITY WAIVER OF PREMIUM RIDER

Provides premium into the policy if the base insured becomes totally disabled and remains totally disabled for at least six months. A retroactive payment will be made for the number of months following the date of total disability for up to one year.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  18-55 years | - Not available if base is rated higher than Table D - Flat extras are not allowed - $5,000,000 maximum aggregate face amount across all Transamerica policies - Not available in Guam, Virgin Islands, or Puerto Rico  |

For Agent Use Only. Not for Distribution to the Public.

25

---

# ADDITIONAL RIDER INFORMATION

## GUARANTEED INSURABILITY RIDER

This benefit provides the opportunity to buy a new policy or increase a specified amount at a certain defined age and/or events with no underwriting.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  0-37 years old; issue age must be at least 15 days old | - Not available if base is rated - Not available in Guam, Virgin Islands, or Puerto Rico  |

## TERM INSURANCE RIDER

An affordable way to provide additional coverage to the primary insured. This term coverage will help fill a temporary need of additional life insurance above the current face amount of the base policy. The term rider amount cannot exceed 3X base face amount.

|   | BAND 1 | BAND2  |
| --- | --- | --- |
|  10-YEAR | 18-80 (NT/T) | 18-80 (NT/T)  |
|  20-YEAR | 18-65 (NT/T) | 18-70 (NT) 18-65 (T)  |
|  30-YEAR | 18-50 (NT) | 18-58 (NT)  |
|   | 18-45 (T) | 18-53 (T)  |

## TERMINAL ILLNESS ACCELERATED DEATH BENEFIT RIDER

While the policy is in force and conditions are met, we will pay an Accelerated Death Benefit (Terminal Illness only) upon request (life expectancy less than 12 months), minus the loan balance, minus an administrative charge, and minus any amount necessary to provide insurance to the date of the Accelerated Death Benefit payment if we make the payment during a grace period.

This benefit is automatically attached to all new issues. Rider is not rated.

## INCOME PROTECTION OPTION

The owner can choose to have the death benefit paid out in any combination of an initial lump sum, monthly payments, and a final lump sum (after the monthly payments). If the policy's death benefit at the time of death is greater than the Total Face Amount, the excess will be paid as a sum in addition to any initial lump sum payment amount. If the death benefit is less than the Total Face Amount, all designated payment amounts will be proportionately reduced.

For Agent Use Only. Not for Distribution to the Public.

26

---

# FIELD UNDERWRITING AND THE CONDITIONAL RECEIPT

Every time you submit an application, you take a very important step in helping your clients protect their family and their dreams. The Conditional Receipt is an important part of this process.

## WHAT IS THE CONDITIONAL RECEIPT?

The Conditional Receipt is “interim” coverage provided to life insurance applicants when the full modal premium is paid at the time of the application. Provided certain conditions are met, the Conditional Receipt provides death benefit protection for the proposed primary insured up to the amount stated in the dollar limits of conditional coverage section of the receipt or the face amount applied for, whichever is less. The Conditional Receipt is not valid on foreign nationals.

## CONDITIONS AND REQUIREMENTS

**The following must be met for the conditional receipt to be in effect:**

- Proposed primary insured is found insurable, at any rating, under the company’s rules for insurance on the product applied for and at the face amount and tobacco classification applied for;
- All statements and answers given in the application are true and complete;
- Full initial modal premium is received at our administrative office within the lifetime of the proposed primary insured (if the form of payment is by check or draft, it must be honored for payment);
- All medical exams, tests, screenings, and questionnaires required by the company are completed and received at our administrative office.

If the proposed primary insured passes away while conditional coverage is in effect, coverage will be denied if the death is caused by suicide or a self-inflicted injury.

There is no conditional coverage for riders or any additional benefits. Conditional coverage only applies to the proposed primary insured. There is no conditional coverage on any other persons proposed for coverage in the application.

For Agent Use Only. Not for Distribution to the Public.

27

---

# WHAT IF THE CLIENT IS NOT A U.S. CITIZEN?

A client who is not a U.S. citizen may still qualify for life insurance coverage if they meet certain special requirements and comply with all relevant items (which may vary based on their status) listed below:

- • The client must have significant business and/or financial ties in the United States;
- • The client must present either a(n): Social Security Number (SSN); Individual Tax Identification Number (ITIN/TIN); appropriate version of IRS Form W8 for those without an SSN or TIN; or (for the ITIN Program) IRS ITIN letter issued as a result of a W-7 Application;
- • The client must be physically present in the United States at the time of application;
- • ITIN applicants will require ITIN forms (CP565) or Social Security card. Submit copy with the file;
- • Visa holders: indicate the specific visa type (e.g., H1, F1, etc.) or exact immigration status (e.g., refugee, asylum, etc.) on the application and submit a copy of the valid visa;$^{1,2}$
- • Employment Authorization Card ('EAC') holders: compare the category code, located in the center of the EAC to determine if the candidate is eligible to apply for insurance and submit a copy of the valid EAC;
- • Immigration documents pending expiration within 60 days of the application date may affect insurability or delay processing while we confirm renewal;
- • Fully-expired visas must show proof of renewal or extension (I-797, I-797A, or other confirmation document from USCIS that is acceptable to Underwriting);
- • EB-5 visa holders transitioning to a green card status may be asked for additional documentation to confirm that process;
- • A copy of all required documentation will be asked for in iGO at the time of application. For paper applications, use the image upload tool on the agent portals to submit copies of images, and indicate this in the agent comments section;
- • Only U.S. residents are eligible to apply for the Living Benefit Riders (Chronic Illness, Critical Illness) and/or Long Term Care Rider;
- • A separate international underwriting guide is available for information on submitting nonresident foreign national and U.S. expatriate business. All international risk guidelines are subject to change without prior notice.
- • Permanent Resident Card (green card holders): Copy of front and back of the card may be requested at underwriter discretion.

For further details please refer to our Resident Foreign Nationals Travel Guidelines flyer, HNW Nonresident FN UW Guidelines (111955), and Foreign National Individual Taxpayer identification number guidelines (117754).

## DOCUMENTATION NEEDED

**Visa or EAC** are required. Proof of entry (passport stamp or I-94 document) or other supporting documents may be required at Underwriter discretion.

$^{1}$ Not all visa types or immigration statuses are eligible. Note also that the Matricula Consular document is not recognized to be valid as a visa by the U.S. government.

$^{2}$ List 'Permanent Resident' on the application if the client is a valid green card holder residing in the U.S.

For Agent Use Only. Not for Distribution to the Public.

28

---

# ELIGIBILITY BY EMPLOYEE AUTHORIZATION CARD CATEGORY CODE

|  CATEGORY CODE | DESCRIPTION | ELIGIBILITY  |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- |
|   |   |  LIFE | LONG TERM CARE RIDER | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER | JUVENILES (INCLUDES PARENT/ OWNER STATUS)  |
|  A2 | Lawful temporary resident - Special Agricultural Workers | Up to best class | Yes | Yes | Yes | Yes  |
|  A3 | Refugee | Up to best class | Yes | Yes | Yes | Yes  |
|  A4 | Paroled refugee | Up to best class | Yes | Yes | Yes | Yes  |
|  A5 | Asylee | Up to best class | Yes | Yes | Yes | Yes  |
|  A6 | Fiancé(e) (K-1 or K-2 nonimmigrant) | Up to best class | Yes | Yes | Yes | Yes  |
|  A7 | N-8 or N-9 | Based on country of origin | Yes | Yes | Yes | Yes  |
|  A8 | Citizen of Micronesia, Marshall Islands, or Palau | Up to best class | Yes | Yes | Yes | Yes  |
|  A9 | K-3 or K-4 | Up to best class | Yes | Yes | Yes | Yes  |
|  A10 | Withholding of deportation or removal granted | Eligible under the ITIN program | Yes | Yes | Yes | Yes  |
|  A11 | Deferred Enforced Departure | Decline | No | No | No | No  |
|  A12 | Temporary Protected Status granted | Based on country of origin | Yes | Yes | Yes | Yes  |
|  A13 | Family Unity Program (Section 301 of the Immigration Act of 1990) | Up to best class | Yes | Yes | Yes | Yes  |
|  A14 | LIFE Legalization (Section 1504 of the Legal Immigrant Family Equity (LIFE) Act Amendments) | Up to best class | Yes | Yes | Yes | Yes  |
|  A15 | V visa nonimmigrant | Based on country of origin | Yes | Yes | Yes | Yes  |
|  A16 | T-1 nonimmigrant | Decline | No | No | No | No  |
|  A17 | Spouse of an E nonimmigrant | Up to best class | Yes | Yes | Yes | Yes  |
|  A18 | Spouse of an L nonimmigrant | Decline | Yes | Yes | Yes | Yes  |
|  A19 | U-1 nonimmigrant | Based on country of origin | Yes | Yes | Yes | No  |
|  A20 | U-2, U-3, U-4, or U-5 nonimmigrant | Based on country of origin | Yes | Yes | Yes | No  |
|  C1 | Spouse/dependent of A-1 or A-2 visa nonimmigrant | Decline | No | No | No | No  |
|  C2 | Spouse/dependent of Coordination Council for North American Affairs (E-1)/Taipei Economic and Cultural Representative Office (TECRO) | Up to best class | Yes | Yes | Yes | Yes  |
|  C3 | F-1 student, pre-completion Optional Practical Training | Up to best class | Yes | Yes | Yes | Yes  |
|  C4 | Spouse/dependent of G-1, G-3, or G-4 | Based on country of origin | Yes | Yes | Yes | Yes  |
|  C5 | J-2 spouse or child of J-1 exchange visitor | Based on country of origin | Yes | Yes | Yes | Yes  |
|  C6 | M-1 student, Practical Training | Up to best class | Yes | Yes | Yes | Yes  |
|  C7 | Dependent of NATO-1 through NATO-6 | Based on country of origin | Yes | Yes | Yes | Yes  |
|  C8 | Asylum application pending filed | Eligible under the ITIN program | Yes | Yes | Yes | Yes  |

For Agent Use Only. Not for Use With the Public.

29

---

# ELIGIBILITY BY EMPLOYEE AUTHORIZATION CARD CATEGORY CODE

> Continued from previous page

|  CATEGORY CODE | DESCRIPTION | ELIGIBILITY  |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- |
|   |   |  LIFE | LONG TERM CARE RIDER | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER | JUVENILES (INCLUDES PARENT/ OWNER STATUS)  |
|  C9 | Pending adjustment of status under Section 245 of the Act | Up to best class | Yes | Yes | Yes | Yes  |
|  C10 | Suspension of deportation applicants (filed before April 1, 1997) | Eligible under the ITIN program | Yes | Yes | Yes | Yes  |
|  C11 | Public Interest parolee | Based on country of origin | Yes | Yes | Yes | Yes  |
|  C12 | Spouse of an E-2 CNMI investor | Up to best class | Yes | Yes | Yes | Yes  |
|  C14 | Deferred action | Eligible under the ITIN program | Yes | Yes | Yes | Yes  |
|  C15 | Not in use | N/A | No | Yes | Yes | Yes  |
|  C16 | Creation of record (adjustment based on continuous residence since January 1, 1972) | Up to best class | Yes | Yes | Yes | Yes  |
|  C17 | B-1 domestic servant of certain nonimmigrants | Decline | No | No | No | No  |
|  C18 | Order of supervision | Decline | No | No | No | No  |
|  C19 | Certain pending TPS applicants whom USCIS has determined are prima facie eligible for TPS and who may then receive an EAD as a 'temporary treatment benefit' under 8 C.F.R. 244.10(a). | Based on country of origin | Yes | Yes | Yes | Yes  |
|  C20 | Section 210 legalization (pending I-700) Special Agricultural Workers | Up to best class | Yes | Yes | Yes | Yes  |
|  C21 | S visa nonimmigrant | Decline | No | No | No | No  |
|  C22 | Section 245A legalization (pending I-687) | Up to best class | Yes | Yes | Yes | Yes  |
|  C23 | Irish peace process (Q-2) | Up to best class | Yes | Yes | Yes | Yes  |
|  C24 | LIFE legalization | Up to best class | Yes | Yes | Yes | Yes  |
|  C25 | T-2, T-3, T-4, T-5, or T-6 nonimmigrant | Decline | No | No | No | No  |
|  C26 | Spouse of an H-1B nonimmigrant | Up to best class | Yes | Yes | Yes | Yes  |
|  C31 | VAWA self-petitioners with an approved Form I-360 | Up to best class | Yes | Yes | Yes | Yes  |
|  C33 | Consideration of Deferred Action for Childhood Arrivals | Eligible under the ITIN program | Yes | Yes | Yes | Yes  |
|  C35 | Principal beneficiary of an approved employment-based immigrant petition facing compelling circumstances | Up to best class | Yes | Yes | Yes | Yes  |
|  C36 | Spouse or unmarried child of a principal beneficiary of an approved employment-based immigrant petition facing compelling circumstances | Up to best class | Yes | Yes | Yes | Yes  |

The purpose of this document is to outline risks that are considered uninsurable based on immigration status. It is not possible to include every scenario and the contents of this document are subject to change without notice. This is not an offer guaranteeing any predetermined rate for any applicant.

For Agent Use Only. Not for Use With the Public.

30

---

# ELIGIBILITY BY VISA TYPES

|  CATEGORY CODE | DESCRIPTION | DOCUMENTATION REQUIRED | ELIGIBILITY  |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- |
|   |   |   |  LIFE | LONG TERM CARE RIDER | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER | JUVENILES (INCLUDES PARENT/ OWNER STATUS)  |
|  **A** | Government Official | N/A | Decline | No | No | No | No  |
|  **A5** | Asylum | Proof of asylum approval (copy immigration court document or EAD category A5) | Up to best class | Yes | Yes | Yes | Yes  |
|  **B** | Visitor (B1, B2, B1/B2, BCC) | Copy of visa and proof of U.S. entry | Underwritten according to country of legal residence | No | No | No | No  |
|  **C** | Transit | N/A | Decline | No | No | No | No  |
|  **D** | Crewman | N/A | Decline | No | No | No | No  |
|  **E** | Investor | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **E** | Employment Auth. Card | Copy of employee authorization card | Based on category code | See code chart | See code chart | See code chart | See code chart  |
|  **F** | Student/ academic | Copy of visa and I-20 from college | Up to best class | Yes | Yes | Yes | Yes  |
|  **G** | Representative to international organization | Copy of visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **GC** | Green Card, Permanent Resident Card | Copy of green card at underwriter discretion | Up to best class | Yes | Yes | Yes | Yes  |
|  **H** | Work/occupation | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **I** | Media | N/A | Decline | No | No | No | No  |
|  **J** | Cultural Exchange | Copy of visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **K** | Fiancée/fiancé | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **L** | Executive | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **M** | Vocational/non-academic | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **MC** | Matricula Consular ID | N/A | Decline | No | No | No | No  |
|  **NATO** | Government workers | Copy of visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **O** | Science/art extraordinary ability | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |

The purpose of this document is to outline risks that are considered uninsurable based on immigration status. It is not possible to include every scenario and the contents of this document are subject to change without notice. This is not an offer guaranteeing any predetermined rate for any applicant.

For Agent Use Only. Not for Distribution to the Public.

Continued >

31

---

# ELIGIBILITY BY VISA TYPES

> Continued from previous page

|  CATEGORY CODE | DESCRIPTION | DOCUMENTATION REQUIRED | ELIGIBILITY  |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- |
|   |   |   |  LIFE | LONG TERM CARE RIDER | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER | JUVENILES (INCLUDES PARENT/ OWNER STATUS)  |
|  **P** | Professional athlete/ entertainer | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **Q** | Cultural exchange | Copy of visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **R** | Religious | Copy of visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **RE** | Refugee | Proof of refugee status (I-94) | Up to best class | Yes | Yes | Yes | Yes  |
|  **S** | Witness/ informant | N/A | Decline | No | No | No | No  |
|  **T** | Victims of trafficking | N/A | Decline | No | No | No | No  |
|  **TN/TD** | Trades (NAFTA ) | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **TPS** | Temporary protection status | Proof of status (I-94) | Based on country of origin | Yes | Yes | Yes | No  |
|  **TWOV** | Transit without a visa | N/A | Decline | No | No | No | No  |
|  **U** | Victims of certain criminal activity | Valid current visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **V** | Certain second preference beneficiaries | Copy of visa, proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **VWP** | Visa Waiver Program | Copy of visa, proof of U.S. entry | Underwritten according to country of legal residence | No | No | No | No  |

The purpose of this document is to outline risks that are considered uninsurable based on immigration status. It is not possible to include every scenario and the contents of this document are subject to change without notice. This is not an offer guaranteeing any predetermined rate for any applicant.

For Agent Use Only. Not for Distribution to the Public.

32

---

TRANSAMERICA®

When it comes to protecting their future,
there’s no time like the present.

Visit: transamerica.com

The purpose of this document is to outline risks that are considered uninsurable based on immigration status. It is not possible to include every scenario and the contents of this document are subject to change without notice. This is not an offer guaranteeing any predetermined rate for any applicant.

Underwriting requirements are subject to change without notice.

Not available in New York.

Life insurance products are issued by Transamerica Life Insurance Company, Cedar Rapids, IA. All products may not be available in all jurisdictions.

For Agent Use Only. Not for Use With the Public.

130794R11

© 2026 Transamerica Corporation. All Rights Reserved.

04/26


<!-- source:TERM_UNDERWRITING_CHARTS.md -->

# Transamerica Term (Trendsetter) Underwriting Guide Charts

**Product focus:** Trendsetter Super / LB (Term); shared ICC UW grids
**Source extract:** `source_pdfs/Term_IUL_UW_Guide_pages.txt`
**Guide:** Term and IUL Underwriting Guide for ICC States (08/25). Included for Trendsetter Super/LB age-amount grids, BMI, impairments, visa rules. IUL product marketing is out of scope; shared UW grids apply.
**Audience:** Agent use only — underwriting decision charts for internal RAG.
**Extracted:** 2026-07-22

This file contains the **full underwriting chart text** (not a summary). Use for impairment, class, build, Rx, and requirement questions.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 1

1
08/25
REV UP YOUR 
ROUTINE
A FIELD GUIDE TO UNDERWRITING: 
Trendsetter® Super, Trendsetter® LB,  
Transamerica Financial Foundation IUL® II, 
Transamerica Financial Choice IULSM II
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 2

2
DIGITAL UNDERWRITING SOLUTION 3
UNDERWRITING REQUIREMENTS 4
T ransamerica Orders All Requirements 
Underwriting Requirements and Reports Defined 
How Long Are Underwriting Requirements Valid? 6 
APS Guidelines  6
AGE AND FACE AMOUNT REQUIREMENTS 7
Trendsetter® Super and Trendsetter® LB 7
Transamerica Financial Choice IULSM II 8
Transamerica Financial Foundation IUL® II 9
AVAILABLE RIDERS BY PRODUCT 10
Additional Rider Information 11
BLENDED BODY MASS INDEX (BMI) CHARTS 13
UNDERWRITING TIPS 14
Determining Coverage Amounts for Individuals 15 
Premium to Income Guidelines 17 
High Net Worth Applicants 17 
Coverage Amounts for Businesses 18
LIFESTYLE AND HEALTH HISTORY 19
Medical Impairments 21
Case Scenarios 25 
Substandard T able Ratings 26
WHAT IF THE CLIENT IS NOT A U.S. CITIZEN?  27
INITIAL UNDERWRITING REQUIREMENTS  
FOR NON-U.S. RESIDENTS 28
ELIGIBILITY BY EMPLOYEE AUTHORIZATION  
CARD CATEGORY CODE 32
ELIGIBILITY BY VISA TYPES 34
TABLE OF CONTENTS
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 3

3
DIGITAL UNDERWRITING SOLUTION
DIGITAL UNDERWRITING SOLUTION  
Transamerica is proud to introduce our digital underwriting solution for term and index 
universal life policies. By leveraging automation, we expect this streamlined process to 
reduce underwriting and issue times for you and your clients, improving your overall new 
business submission experience. 
DIGITAL UNDERWRITING
No one likes surprises when they’re writing business. In an ever-changing landscape, you 
need tools that can quickly and efficiently help clients obtain the protection they need. 
That’s why we’ve introduced our digital application to help collect more information upfront, 
reduce the need to request traditional underwriting requirements, and significantly increase 
the number of applications submitted in good order.
iGO e-APP 
Our electronic application, the iGO® e-App, provides guidance and prompts to assist you 
with a client’s application process and helps ensure good order before submission to the 
home office. The application features LexisNexis data prefill to prepopulate fields and help 
with the client verification process. Reflexive questions only ask questions when applicable 
to the proposed insured and help us obtain additional details about a client's medical 
history. The personalized application captures information upfront for faster underwriting 
decisions and coverage. As a result, clients may receive a digital underwriting decision 
within minutes of submission. 
CLIENT-DRIVEN PART II
We understand discussing sensitive information with another person is not always easy for 
the client and, at times, can limit the amount of information the proposed insured is willing 
to disclose. But we also know that field underwriting is still needed to ensure you are setting 
the correct expectations with the client.
The client collaboration process helps ensure the required application information is 
received. This optional process allows the proposed insured or their legal guardian (if the 
proposed insured is a juvenile) to complete the personal and medical history Part II, without 
having specifics of medical and nonmedical conditions disclosed with someone else. The 
client collaboration feature may be helpful when working with clients who are uncomfortable 
or ill-prepared to discuss their medical history. Providing clients this option may reduce your 
face-to-face time with the client and encourage more thorough and candid responses from 
clients.
FRAUD WARNING 
Any person who knowingly represents a false statement in an application for insurance may 
be guilty of a criminal offense and subject to penalties under state law. 
Transamerica may complete Post Issue Audits on cases to validate our underwriting 
assessments. If we develop material misrepresentation, we reserve the right to rescind the 
policy within the contestable period and deny future coverage. 
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 4

4
All requirements will be ordered through Transamerica and  
administered through Transamerica-approved vendors.
As we move to a new world of an enhanced consumer experience, there will 
be times when not all the traditional evidence will be necessary to determine 
your customer’s insurability. As a result, Transamerica will order all necessary 
underwriting evidence for your customer, reducing the burden as well as 
ensuring we only get the necessary information to understand your customer’s 
risk profile. This change in process will allow us to help expedite the ordering 
of the most relevant information the first time and drive down the time it takes 
to make a decision.
VITALS AND PARAMED PHYSICAL FINDINGS
When required, paramed physical findings are ordered by the home office 
and are completed by an approved third-party vendor. The process includes 
a qualified examiner completing proper paperwork/forms, taking vitals 
(height, weight, blood pressure, pulse), collecting fluids (blood and urine), and 
administering ECGs (if applicable).
HOME OFFICE SPECIMEN (HOS)
A home office specimen is a urine sample collected during the paramed 
physical findings visit and sent to a laboratory for analysis.
BLOOD CHEMISTRY PROFILE (BCP)
A blood chemistry profile is a venous blood draw collected during the paramed 
physical findings visit and sent to a laboratory for analysis.
AccessMyHealthTM is a web portal that allows clients to access the results of 
their blood, urine, and paramed physical findings tests, taken in connection 
with their life insurance application. When the client completes their labs 
or paramed physical findings test, they can opt in to receiving text message 
notifications.* Once their results are ready to be accessed (up to seven days 
after completion for labs), the client will receive a text message with a link to 
the AccessMyHealth TM web portal. From there, the client can register to obtain 
their results using their phone number and date of birth.
Visit AccessMyHealth:  transamerica.accessmyhealth.com
UNDERWRITING REQUIREMENTS
4For Agent Use Only. Not for Use With the Public.
*  AccessMyHealth TM does not have the ability to call international phone numbers.  
Lab report is available for 12 months from the date the sample was received at the laboratory.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 5

5
RESTING ELECTROCARDIOGRAM (ECG)
During an electrocardiogram (when required), 
small patches are placed on the chest, arms, and 
legs to record the electrical activity and rhythm 
of the heart. If normal resting ECG records are 
available from a test conducted within the last  
12 months, the test does not need to be repeated 
upon provision of the test results.
MINNESOTA COGNITIVE ACUITY SCREEN (CS)
The Minnesota Cognitive Acuity Screen is a 
telephone interview conducted by a registered 
nurse (RN), who is specifically trained to 
administer the test. The purpose of this test is to 
screen for potential early cognitive impairment. 
Proposed insureds age 70 and older that are also 
applying for the LTC Rider will be required to 
complete a face to face CS.
It is important your client realizes the significance 
of the interview and concentrate to do as well as 
they can. Your client should be in an environment 
that is free of distractions. If they wear a hearing 
aid, they should have it on during the interview. 
The telephone interview usually takes 15–20 
minutes.
Family, friends, or agent can be present, but they 
must be in a separate room during the cognitive 
interview, not interacting at all with the proposed 
insured in any way during the CS.
INSPECTION REPORTS (IR, BBIR, EIR)
Inspection Reports provide a holistic view of the 
proposed insured’s public record, including such 
information as financials, criminal records history, 
properties owned, and bankruptcies. Inspection 
reports may be completed as a telephone interview 
or by online database searches, depending on the 
amount being applied for.
PERSONAL FINANCIAL STATEMENTS (PFS) 
A Financial Supplement to Application for Life 
Insurance (also known as a Confidential Financial 
Questionnaire) will be requested on larger face 
amounts or/if:
• The income and net worth of proposed insured  
is not provided on the application 
• The company finds the financial information 
unclear, inconsistent, or additional details are 
needed
• Or/if the insurance is being used for business 
coverage on amounts of $5 million and higher, 
including Buy-Sell, Loan, and Key Person 
applications
MOTOR VEHICLE REPORTS
A motor vehicle report (MVR) is a record  
of a proposed insured’s driving history.
CRIMINAL BACKGROUND CHECK
A criminal history background check may be 
ordered and is a database search of court records.
PRESCRIPTION AND MEDICAL DATA CHECK  
A prescription and medical data check will be 
ordered on every application and includes details 
on prescriptions filled, medical diagnoses, hospital 
and physician procedures, inpatient and clinic 
administered medications, and medical equipment 
information — as well as prescribing physician’s 
information. Your client can request a copy of their 
report at rxhistories.com .
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 6

6
HOW LONG ARE UNDERWRITING REQUIREMENTS VALID?
REQUIREMENTS UP TO AGE 70 AGE 71 AND OLDER
Paramed-Physical Findings Valid for 1 year Valid for 6 months
Teleinterview 1 Valid for 90 days Valid for 90 days
Resting Electrocardiogram (ECG) Valid for 1 year Valid for 1 year
Inspection Report (IR) Valid for 1 year Valid for 1 year
Financial Supplement to Application for Life Insurance Valid for 1 year Valid for 1 year
Home Office Urine Specimen (HOS) Valid for 1 year Valid for 6 months
Blood Chemistry Profile (BCP) Valid for 1 year Valid for 6 months
Minnesota Cognitive Acuity Screen (CS) N/A Valid for 6 months
1 Only ordered on paper applications
1 APS ordered on amounts > $500,000 through maximum $2 million total line considered.
2  An APS is not needed on routine screening or annual exams if noted to be within normal 
limits, unless needed due to medical history.
For Agent Use Only. Not for Use With the Public.
APS GUIDELINES ARE AS FOLLOWS:
FACE AMOUNTS
Age Up to and including $1 million > $1 million to $3 million Over $3 million
0–17 YES1 YES1 N/A
18–50
NOT ROUTINELY  
(for cause or for exam within the past 3 
months not marked within normal limits) 2
NOT ROUTINELY  
(for cause or for exam within the past 3 
months not marked within normal limits) 2
YES 
Will be required on all applications 3
51–60
NOT ROUTINELY 
(for cause or for exam within the past 3 
months not marked within normal limits) 2
NOT ROUTINELY 
(for cause or for exam within the past 3 
months not marked within normal limits) 2
YES 
Will be required on all applications
61–69
NOT ROUTINELY 
(for cause or for exam within the past 12 
months not marked within normal limits) 2
YES 
Within the last 5 years for preferred 
classes and has an established primary 
care physician
YES 
Within the last 5 years for 
preferred classes and has an 
established primary care physician
70 and 
older YES4 YES4 YES4
3  Individual consideration up to and including $5 million (and under age 50)  
if applicant has not seen an M.D. in more than three years.
4   Ages 70–79, all rate classes available if seen in the last 24 months by primary 
care physician, otherwise limited to standard at best.
All third-party requirements will be ordered by Transamerica.
IDENTITY VERIFICATION  
An identity verification is primarily used to 
verify the identities of our customers and 
ensure our quality of business, manage 
identity risk, prevent identity fraud, and 
comply with obligations under the USA Patriot 
Act. In some instances, we may request a 
copy of the individual’s Social Security card, 
driver’s license or other state-issued ID, or 
utility bill to help verify an individual’s identity.
TAX RETURN TRANSCRIPT  
IRS Form 4506-C is an Internal Revenue 
Service (IRS) form that gives permission 
for Transamerica to receive a transcript of 
previously filed tax returns directly from the 
IRS. This pre-filled form is obtained through 
your agent portal or through the application 
submission process to expedite processing. 
ATTENDING PHYSICIAN STATEMENTS (APS)  
An attending physician statement is a copy of the proposed 
insured’s medical records obtained from their attending 
physician or healthcare provider. APS may be required 
based on age and/or face amount. 
TRANSAMERICA ORDERS ALL REQUIREMENTS  
Please refer to age and face amount chart on the next 
pages. Transamerica will order all requirements through 
Transamerica-approved vendors. 
Application will close in iPipeline® at 45 days. The agent receives an email  
to finalize the case four times prior to the case closing.
AN APPLICATION IS VALID FOR 180 DAYS  
Cases will close after 60 days if there are outstanding 
requirements. A new application will be needed after 180 
days. Underwriting may reorder fast data requirements and/
or request a statement of good health on delivery depending 
on the age of the requirements at time of decision.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 7

7
FACE AMOUNTS 3, 4, 7, 9, 10, 11 ISSUE AGE  5, 6, 8
Min. Max. 18–40 12 41–45 46–55 56–60 61–70 71–75 76–80
$25,000 $50,000 * * * * * Vitals BCP  
HOS MVR
Vitals BCP  
HOS MVR
$50,001 $99,999 * * * * Vitals  
BCP HOS
Vitals BCP  
HOS MVR
Vitals BCP  
HOS MVR
$100,000 $249,999 * 
MVR * * Vitals  
BCP HOS
Vitals  
BCP HOS
Vitals BCP  
HOS CS MVR
Vitals BCP  
HOS CS MVR
$250,000 $500,000 * 
MVR
* 
MVR
* 
MVR
Vitals BCP  
HOS MVR
Vitals BCP  
HOS MVR
Vitals BCP  
HOS CS MVR
Vitals BCP  
HOS CS MVR
$500,001 $1,000,000 * 
MVR
* 
MVR
* 
MVR
Vitals BCP  
HOS MVR
Vitals BCP  
HOS MVR
Vitals BCP HOS 
CS MVR
Vitals BCP HOS 
CS MVR
$1,000,001 $2,000,000 * 
MVR
* 
MVR
Vitals BCP  
HOS MVR
Vitals BCP  
HOS MVR
Vitals  BCP  
HOS MVR
Vitals BCP HOS 
CS PFS MVR
VItals BCP HOS 
ECG CS PFS 
MVR
$2,000,001 $3,500,000 Vitals BCP  
HOS MVR
Vitals BCP  
HOS MVR
Vitals BCP  
HOS MVR
Vitals BCP  
HOS MVR
Vitals BCP  
HOS MVR
Vitals BCP HOS 
CS PFS MVR
VItals BCP HOS 
ECG CS PFS 
MVR
$3,500,001 $5,000,000 Vitals BCP  
HOS MVR
Vitals BCP  
HOS  MVR
Vitals BCP  
HOS MVR
Vitals BCP  
HOS MVR
Vitals BCP  
HOS MVR
Vitals BCP HOS 
CS PFS MVR
VItals BCP HOS 
ECG CS PFS 
MVR
$5,000,001 $10,000,000 Vitals BCP  
HOS PFS MVR
Vitals BCP  
HOS PFS MVR
Vitals BCP  
HOS PFS MVR
Vitals BCP  
HOS PFS MVR
Vitals BCP  
HOS PFS MVR
Vitals BCP HOS 
ECG CS PFS 
MVR
VItals BCP HOS 
ECG CS PFS 
MVR
$10,000,001 and higher Vitals BCP HOS 
ECG PFS MVR IR
Vitals BCP HOS 
ECG PFS MVR IR
Vitals BCP HOS 
ECG PFS MVR IR
Vitals BCP HOS 
ECG PFS MVR IR
Vitals BCP HOS 
ECG PFS MVR IR
Vitals BCP HOS 
ECG CS PFS 
MVR IR
Vitals BCP HOS 
ECG CS PFS 
MVR IR
Trendsetter® Super and Trendsetter® LB 1,2
AGE AND FACE AMOUNT REQUIREMENTS
* Highlighted cells indicate potential eligibility for fluidless processing.
1  Applicants receiving a digital underwriting decision will not be reconsidered for a 
better rate classification.
2 Transamerica reserves the right to request additional evidence of insurability.
3  Requests to reduce face amount received during Underwriting will not alter the 
medical requirements.
4 Paper applications require a Vendor conducted Tele-interview.
5  Trendsetter LB  band on ($25,000-$99,999) is not available for ages 18-22 and ages 
60 and up.
6 CS required at age 70 on amounts ≥ $100,000.
7  IRS Form 4506-C is required with all applications ≥ $5,000,000 or at  
Underwriter discretion.
8 Term lengths are not available at all ages.
9  Electronic Inspection Report (EIR) ordered on all face amounts > $5,000,000 
through age 70 and face amounts > $3,000,000 ages 71 and up.
10  Business Beneficiary Inspection Report (BBIR) ordered for business coverage > 
$5,000,000.
11  Cover Letters and third-party financial verification required for face amounts ≥ 
$10,000,000 and/or total line over jumbo limits.
12 Trendsetter LB maximum face amount is $2,000,000.
Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at 
the time of the application, we reserve the right to rescind the policy.
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 8

8
Transamerica Financial Choice IUL SM II 1, 2
FACE AMOUNTS 3, 4, 8, 9, 10, 11 ISSUE AGE  7
Min. Max. 0–175, 6 18–40 41–45 46–55 56–60 61–70 71–75 76-80 81–85
$250,000 $500,000 *
MVR
*
MVR
*
MVR
*
MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals HOS 
CS MVR
Vitals BCP 
HOS CS 
MVR
Vitals BCP 
HOS CS 
MVR
$500,001 $1,000,000 *
MVR
*
MVR
*
MVR
*
MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS CS 
MVR
Vitals BCP 
HOS CS 
MVR
Vitals BCP 
HOS CS 
MVR
$1,000,001 $2,000,000 *
MVR
*
MVR
*
MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS PFS CS 
MVR
Vitals BCP 
HOS CS PFS 
MVR
Vitals BCP 
HOS ECG CS 
PFS MVR
$2,000,001 $3,500,000 N/A Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS CS 
MVR  
PFS
Vitals BCP 
HOS CS PFS 
MVR
Vitals BCP 
HOS ECG CS  
PFS MVR
$3,500,001 $5,000,000 N/A Vitals BCP 
HOS MVR IR
Vitals BCP 
HOS MVR IR
Vitals BCP 
HOS MVR IR
Vitals BCP 
HOS MVR IR
Vitals BCP 
HOS MVR IR
Vitals BCP 
HOS CS PFS 
MVR IR
Vitals BCP 
HOS CS PFS 
MVR IR
Vitals BCP 
HOS ECG CS 
PFS MVR IR
$5,000,001 $10,000,000 N/A
Vitals BCP 
HOS PFS 
MVR IR
Vitals BCP 
HOS PFS 
MVR IR
Vitals BCP 
HOS PFS 
MVR IR
Vitals BCP 
HOS PFS 
MVR IR
Vitals BCP 
HOS PFS 
MVR IR
Vitals BCP 
HOS CS PFS 
MVR IR
Vitals BCP 
HOS ECG CS 
PFS MVR IR
Vitals BCP 
HOS ECG CS 
PFS MVR IR
$10,000,001 and higher N/A
Vitals BCP 
HOS ECG 
PFS MVR IR
Vitals BCP 
HOS ECG 
PFS MVR IR
Vitals BCP 
HOS ECG 
PFS MVR IR
Vitals BCP 
HOS ECG 
PFS MVR IR
Vitals BCP 
HOS ECG 
PFS MVR IR
Vitals BCP 
HOS ECG CS 
PFS MVR IR
Vitals BCP 
HOS ECG CS 
PFS MVR IR
Vitals BCP 
HOS ECG CS 
PFS MVR IR
AGE AND FACE AMOUNT REQUIREMENTS
* Highlighted cells indicate potential eligibility for fluidless processing.
1  Applicants receiving a digital underwriting decision will not be reconsidered for a 
better rate classification. 
2 Transamerica reserves the right to request additional evidence of insurability. 
3  Requests to reduce face amount received during Underwriting will not alter the 
medical requirements. 
4 Paper applications require a Vendor conducted Tele-interview. 
5 Juvenile must reside in the U.S. for consideration.
6 MVR ordered at ages 16 and 17 for juveniles with a valid driver's license.
7 CS required at age 70. 
8  IRS Form 4506-C is required with all applications ≥ $5,000,000 or at Underwriter 
discretion. 
9  Electronic Inspection Report (EIR) ordered on all face amounts > $5,000,000 
through age 70 and face amounts > $3,000,000 ages 71 and up.
10  Business Beneficiary Inspection Report (BBIR) ordered for business coverage > 
$5,000,000. 
11  Cover Letters and third-party financial verification required for face amounts ≥ 
$10,000,000 and/or total line over jumbo limits.
For Agent Use Only. Not for Use With the Public.
Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at 
the time of the application, we reserve the right to rescind the policy.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 9

9
FACE AMOUNTS 3, 4, 9, 10, 11, 12 ISSUE AGE  7, 8
Min. Max. 0–17 5, 6 18–40 41–45 46–55 56–60 61–70 71–75 76–80 81–85
$25,000 $50,000 *
MVR
*
MVR * * * Vitals BCP 
HOS 
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
$50,001 $75,000 *
MVR
*
MVR * * * Vitals BCP 
HOS 
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
$75,001 $99,999 *
MVR
*
MVR * * Vitals BCP 
HOS
Vitals BCP 
HOS 
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
$100,000 $249,999 *
MVR
*
MVR * * Vitals BCP 
HOS 
Vitals BCP 
HOS
Vitals BCP 
HOS CS 
MVR
Vitals BCP 
HOS CS 
MVR
Vitals BCP 
HOS CS 
MVR
$250,000 $500,000 *
MVR
*
MVR
*
MVR
*
MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS CS 
MVR
Vitals BCP 
HOS CS 
MVR
Vitals BCP 
HOS CS 
MVR
$500,001 $1,000,000 *
MVR
*
MVR
*
MVR
*
MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS CS 
MVR
Vitals BCP 
HOS CS 
MVR
Vitals BCP 
HOS CS 
MVR
$1,000,001 $2,000,000 *
MVR
*
MVR
*
MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS CS PFS 
MVR
Vitals BCP 
HOS CS PFS 
MVR
Vitals BCP 
HOS ECG CS 
PFS MVR
$2,000,001 $3,500,000 N/A Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS MVR
Vitals BCP 
HOS CS PFS 
MVR
Vitals BCP 
HOS CS PFS 
MVR
Vitals BCP 
HOS ECG CS 
PFS MVR
$3,500,001 $5,000,000 N/A Vitals BCP 
HOS MVR IR
Vitals BCP 
HOS MVR IR
Vitals BCP 
HOS MVR IR
Vitals BCP 
HOS MVR IR
Vitals BCP 
HOS MVR IR
Vitals BCP 
HOS CS PFS 
MVR IR
Vitals BCP 
HOS CS PFS 
MVR IR
Vitals BCP 
HOS ECG CS 
PFS MVRIR
$5,000,001 $10,000,000 N/A
Vitals BCP 
HOS PFS 
MVR IR
Vitals BCP 
HOS PFS 
MVR IR
Vitals BCP 
HOS PFS 
MVR IR
Vitals BCP 
HOS PFS 
MVR IR
Vitals BCP 
HOS PFS 
MVR IR
Vitals BCP 
HOS CS PFS 
MVR IR
Vitals BCP 
HOS ECG CS 
PFS MVR IR
Vitals BCP 
HOS ECG CS 
PFS MVR IR
$10,000,001 and higher N/A
Vitals BCP 
HOS ECG 
PFS MVR IR
Vitals BCP 
HOS ECG 
PFS MVR IR
Vitals BCP 
HOS ECG 
PFS MVR IR
Vitals BCP 
HOS ECG 
PFS MVR IR
Vitals BCP 
HOS ECG 
PFS MVR IR
Vitals BCP 
HOS ECG CS  
PFS MVR IR
Vitals BCP 
HOS ECG CS  
PFS MVR IR
Vitals BCP 
HOS ECG CS 
PFS MVR IR
Transamerica Financial Foundation IUL® II 1, 2
* Highlighted cells indicate potential eligibility for fluidless processing.
1  Applicants receiving a digital underwriting decision will not be reconsidered for a 
better rate classification. 
2 Transamerica reserves the right to request additional evidence of insurability. 
3  Requests to reduce face amount received during Underwriting will not alter the 
medical requirements. 
4 Paper applications require a Vendor conducted Tele-interview. 
5 Juvenile must reside in the U.S. for consideration.
6 MVR ordered at ages 16 and 17 for juveniles with a valid driver's license.
7 CS required at age 70 on face amounts ≥ $100,000.
8 If LTC Rider is applied for, the Cognitive Screen (CS) is a face-to-face assessment.
9  IRS Form 4506-C is required with all applications ≥ $5,000,000 or at Underwriter 
discretion. 
10  Electronic Inspection Report (EIR) ordered on all face amounts > $5,000,000 
through age 70 and face amounts > $3,000,000 ages 71 and up.
11  Business Beneficiary Inspection Report (BBIR) ordered for business coverages > 
$5,000,000. 
12  Cover Letters and third-party financial verification required for face amounts ≥ 
$10,000,000 and/or total line over jumbo limits. 
AGE AND FACE AMOUNT REQUIREMENTS
For Agent Use Only. Not for Use With the Public.
Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at 
the time of the application, we reserve the right to rescind the policy.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 10

10
PRODUCT
ACCIDENTAL
DEATH
BENEFIT (ADB) 
RIDER
BASE INSURED 
RIDER (BIR)1,2
CHILDREN’S 
BENEFIT RIDER/ 
CHILDREN’S 
INSURANCE RIDER 
(CBR/CIR)1
CHRONIC
ILLNESS RIDER1
CRITICAL
ILLNESS RIDER1
DISABILITY
WAIVER OF
PREMIUM (DWP)
RIDER1
Trendsetter® 
Super Yes N/A Yes N/A N/A Yes
Trendsetter® LB Yes N/A Yes Yes3 Yes3 Yes
FFIUL II Yes Yes Yes Yes Yes Yes
FCIUL II Yes Yes Yes Yes Yes Yes
PRODUCT
ADDITIONAL
SERVICES
RIDER4/
EVEREST
GUARANTEED
INSURABILITY 
(GIR) RIDER
INCOME
PROTECTION
OPTION (IPO) 
RIDER
LONG TERM
CARE (LTC) 
RIDER1
MONTHLY
DISABILITY
INCOME 
(MDI)1
TERMINAL  
ILLNESS
RIDER/
ACCELERATED
DEATH BENEFIT
DISABILITY  
WAIVER OF 
MONTHLY 
DEDUCTIONS 
RIDER1
Trendsetter 
Super N/A N/A Yes N/A N/A Yes3 N/A
Trendsetter LB N/A N/A Yes N/A Yes Yes3 N/A
FFIUL II Yes Yes Yes Yes N/A Yes3 Yes
FCIUL II Yes N/A Yes N/A N/A Yes3 Yes
AVAILABLE RIDERS AND BENEFITS BY PRODUCT
1 Additional Underwriting may be required.
2 Amount of Base Insured Rider (BIR) should be added to the base face amount to determine initial age/amount requirements.
3 Rider is inherent in product.
4 In California, Florida, and Maryland, this is known as the Concierge Planning Benefit SM .
Note: Not all riders are available in every state.
10For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 11

11
ADDITIONAL RIDER INFORMATION
ACCIDENTAL DEATH BENEFIT RIDER (ADB)
Provides an additional death benefit if the primary 
insured dies as a result of an accident, or if the death 
occurs within 180 days of accidental bodily injury    
ISSUE AGES: ISSUE LIMITS:
15–55 years 
(IUL); 18-55 
years (term)
- Not available if base is higher than Table D
- Total benefit in force cannot exceed $300,000 
with all Transamerica policies
ADDITIONAL SERVICES RIDER
Marketed as the Concierge Planning RiderSM, this  
rider provides funeral concierge services through  
an independent, third-party service provider,  
Everest Funeral Package, LLC (Everest1). Availability of 
the additional services rider is subject to state approval 
and it is not available in all states. In California, Florida, 
and Maryland, this benefit is called the Concierge 
Planning BenefitSM. In those states, the benefits services 
are not provided through a contractual rider; they are 
offered outside of the life insurance policy.
ISSUE AGES: ISSUE LIMITS:
Same as base 
policy
- Minimum face amount $250,000
- No maximum face amount. Expedited claims 
payout process not qualified at $2 million 
and above.
BASE INSURED RIDER (BIR)
Provides additional level term insurance coverage  
at term insurance rates on the primary insured
ISSUE AGES: ISSUE LIMITS:
18–85 years, 
varies by rate 
class and 
writing state
- Available at time of issue, may be added after 
issue if no Long Term Care Rider is present, 
subject to Underwriting
- Minimum face amount $100,000
- Maximum face amount varies depending on 
LTC Rider
CHILDREN'S BENEFIT RIDER/CHILDREN'S  
INSURANCE RIDER (CBR/CIR)
Pays level death benefit upon death of any children  
of the insured. Rider is not rated.
ISSUE AGES: ISSUE LIMITS:
15 days to 
18 years old 
(actual age 
of child) 
18–80 years old 
insured
- Children with a risk profile greater than Table B 
will not be accepted for coverage
- Minimum $1,000 CIR/CBR; max lesser of 
$99,000 or total coverage on the primary 
insured
CHRONIC ILLNESS RIDER
If the insured becomes chronically ill, they may elect 
to receive a portion of the death benefit that can be 
accelerated in advance of death. The insured must have 
the inability to perform at least two of the six activities 
of daily living for a period of 90 consecutive days or  
have a severe cognitive impairment. 
ISSUE AGES: ISSUE LIMITS:
Varies by risk 
class, product, 
and issue state
- Not available if base is higher than Table D 
- Not available if base is rated higher than $2.50 
flat extra
- The sum of all living benefit coverages 
(including Chronic Illness Rider), under all 
Transamerica policies, cannot exceed the 
lesser of 90% of the available death benefit or 
$1,500,000
- Electable at issue, not automatically attached 
to the base product 
- Underwriting reserves the right to deny 
coverage under the Chronic Illness Rider on 
individuals with certain pre-existing conditions, 
impairments, or diseases.
- Not available with the LTC Rider
- Not available to Medicaid recipients
CRITICAL ILLNESS RIDER
If the insured suffered a critical health condition  
(state specific) while the policy and rider are in effect, 
they may elect to receive an accelerated death payment 
subject to certain provisions. 
ISSUE AGES: ISSUE LIMITS:
Varies by risk 
class, product, 
and issue state
- Not available if base is higher than Table D
- Not available if base is rated higher than $2.50 
flat extra
- The sum of all living benefit coverages 
(including Chronic Illness Rider), under all 
Transamerica policies, cannot exceed the 
lesser of 90% of the available death benefit or 
$1,500,000
- Electable at issue, not automatically attached 
to the base product 
- Underwriting reserves the right to deny 
coverage under the Critical Illness Rider on 
individuals with certain pre-existing conditions, 
impairments, or diseases.
For Agent Use Only. Not for Use With the Public.
Note: Not all riders are available in every state.
1 All services are offered by Everest, which is not an affiliate of Transamerica.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 12

12
ADDITIONAL RIDER INFORMATION
DISABILITY WAIVER OF MONTHLY DEDUCTIONS
The benefit waives monthly deductions for the base  
and all riders if the base insured is disabled prior to  
age 65. 
ISSUE AGES: ISSUE LIMITS:
18–55 years - Not available if base is rated higher than Table D 
- Flat extras are allowed up to $2.50
DISABILITY WAIVER OF PREMIUM (DWP) RIDER
Provides premium into the policy if the base insured 
becomes totally disabled and remains totally disabled  
for at least six months. A retroactive payment will be 
made for the number of months following the date of  
total disability for up to one year. 
ISSUE AGES: ISSUE LIMITS:
18–55 years - Not available if base is rated higher  
than Table D
- Flat extras up to $2.50 allowed
- $5 million maximum aggregate face amount 
across all Transamerica policies
GUARANTEED INSURABILITY RIDER (GIR)
This benefit provides the opportunity to buy a new 
policy or increase a specified amount at certain  
defined ages and/or events with no underwriting. 
ISSUE AGES: ISSUE LIMITS:
0–37 years old; 
issue age must  
be at least  
15 days old
- Not available if base is rated
-  Not available with the Disability Waiver  
of Monthly Deductions Rider
-  Not available with the Long Term Care Rider
INCOME PROTECTION OPTION (IPO)
The owner can choose to have the death benefit 
paid out in any combination of an initial lump sum, 
monthly payments, and a final lump sum (after the 
monthly payments). If the policy's death benefit at  
the time of death is greater than the Total Face 
Amount, the excess will be paid as a lump sum in 
addition to any initial lump-sum payment amount.  
If the death benefit is less than the Total Face 
Amount, all designated payment amounts will  
be proportionately reduced. 
LONG TERM CARE (LTC) RIDER
Designed to accelerate payment of the face amount  
of the base policy to provide policy owners with certain 
benefits to help offset expenses that arise in connection 
with long term care for the insured. Provides a benefit 
for long term care equal to the base face amount. 
The LTC Rider rate class is the same as the base policy.  
See the LTC Rider Agent guide for additional details.
ISSUE AGES: ISSUE LIMITS:
18–75 years, 
subject to 
policy issue age 
maximums
-   Not available if base is rated over Table D  
or $2.50/1,000
- Not available if base is rated over Table D or 
with a flat extra over $2.50/1,000
- Minimum face amount $100,000
- Maximum face amount varies depending on 
Base Insured Rider elected
-  Not available with the Chronic Illness Rider
-  Underwriting reserves the right to deny 
coverage under the LTC Rider on individuals 
with certain pre-existing conditions, 
impairments, or diseases
ISSUE AGES: INITIAL LTC U/W REQUIREMENTS:
18–65 Medical Information Bureau (MIB),  
Prescription History (RX)
66–69 Medical Information Bureau (MIB), Medical  
Records, Prescription History (RX)
70–75 Face-to-Face Assessment (F2F), Medical  
Information Bureau (MIB), Medical Records,  
Prescription History (RX)
MONTHLY DISABILITY INCOME (MDI) RIDER
Provides a monthly income to the insured in the event  
the insured becomes totally disabled
ISSUE AGES: ISSUE LIMITS:
18–50 years - Not available if base is rated
- Available only at time of issue
- Offers up to $2,000 per month in disability 
income protection with a 2-year benefit period
- Certain occupations are ineligible for coverage
TERMINAL ILLNESS ACCELERATED DEATH  
BENEFIT RIDER
While the policy is in force and conditions are met, 
we will pay an Accelerated Death Benefit (Terminal 
Illness only) upon request (life expectancy less 
than 12 months), minus the loan balance, minus an 
administrative charge, and minus any amount necessary 
to provide insurance to the date of the Accelerated 
Death Benefit payment if we make the payment during  
a grace period. 
This rider is automatically attached to all new issues  
and is not rated.
For Agent Use Only. Not for Use With the Public.
Note: Not all riders are available in every state.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 13

13
AGES 16–59
**BMI RANGE TRENDSETTER® SUPER**
TRENDSETTER® LB
FFIUL II/FFIUL
FCIUL II/FCIUL
</= 16 Decline Decline
16.0001–17.0000 Standard (S/NS) Nontobacco & Tobacco
17.0001–28.0000 Preferred Plus Preferred Elite
28.0001–30.0000 Preferred (S/NS) Preferred Plus/Preferred Tobacco
30.0001–32.0000 Standard Plus Preferred
32.0001–35.0000 Standard (S/NS) Nontobacco & Tobacco
35.0001–37.0000 Table A Table A
37.0001–39.0000 Table B Table B
39.0001–41.0000 Table C Table C
41.0001–42.0000 Table D Table D
42.0001–43.0000 Table E Table E
43.0001–44.0000 Table F Table F
44.0001–46.0000 Table H Table H
>46 Decline Decline
AGES 60+
BMI RANGE TRENDSETTER SUPER
TRENDSETTER LB
FFIUL II/FFIUL
FCIUL II/FCIUL
</= 16 Decline Decline
16.0001–18.0000 Individual Consideration Individual Consideration
18.0001–28.0000 Preferred Plus Preferred Elite
28.0001–30.0000 Preferred (S/NS) Preferred Plus/Preferred Tobacco
30.0001–32.0000 Standard Plus Preferred
32.0001–35.0000 Standard (S/NS) Nontobacco & Tobacco
35.0001–37.0000 Table A Table A
37.0001–39.0000 Table B Table B
39.0001–41.0000 Table C Table C
41.0001–42.0000 Table D Table D
42.0001–43.0000 Table E Table E
43.0001–44.0000 Table F Table F
44.0001–46.0000 Table H Table H
>46 Decline Decline
BLENDED BODY MASS INDEX (BMI) CHARTS
In order to calculate Adult BMI,  please click here .
In order to calculate Juvenile BMI, please click here .
For Agent Use Only. Not for Use With the Public.
JUVENILE — AGES 2 THROUGH 15*
AGE JUVENILE STANDARD
2 13.9–30.0
3 13.9–29.0
4 12.9–29.0
5 12.9–29.0
6 12.9–29.0
7 12.9–30.0
8 12.9–31.0
9 12.9–32.0
10 12.9–33.0
11 13.9–34.0
12 13.9–35.0
13 14.9–36.0
14 14.9–37.0
15 15.9–38.0
* Ages under two years old generally OK unless premature. Ages over 15 — see adult body mass index charts.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 14

14
UNDERWRITING TIPS
LIVING BENEFIT COVERAGE
Certain medical conditions will impact an individual’s eligibility for living benefit coverage, and 
Transamerica reserves the right to decline living benefit riders or products based on an individual’s  
medical history.
The following are some conditions that may not be eligible for chronic illness and/or critical illness  
living benefit coverage (this list is not all-inclusive):
• Drug and alcohol abuse
• Cancer (other than nonmelanoma skin cancer)
• Coronary artery disease
• Diabetes with insulin use
• Inability to perform activities of daily  
living (ADL’s)
• Motor neuron disease  
• Multiple sclerosis
• Muscular dystrophy
• Parkinson’s disease
• Stroke or transient ischemic attack
• Systemic lupus erythematosus
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 15

15
DETERMINING COVERAGE AMOUNTS FOR INDIVIDUALS
PURPOSE FORMULA REQUIREMENTS
Income 
replacement
Ages Income Factor • Income stated must be reasonable for the stated 
occupation.
• Income source considered will be that of the proposed 
insured, not the household income or that of the  
policy owner.
• Earned income includes salary, bonuses, commissions, 
and deferred compensation and excludes income from 
investments.
18–35
36–70 
71+
40
75 minus current age
Individual consideration
PURPOSE COVERAGE AMOUNT REQUIREMENTS
Non-income earning 
spouse/partner
Up to $500,000 • Household income
• Total line of insurance in force
$500,001–$5,000,000
IC for amounts > $5,000,000
• All requirements as indicated above for face amounts 
through $500,000, plus:
• Household net worth
• Spouse/partner total line of personal coverage in force
• Up to equal coverage of income-earning spouse/partner
PURPOSE COVERAGE AMOUNT REQUIREMENTS
College student
Up to $2,000,000 • Annual earned income
• Total line of coverage in force
• Depending on amount applied for, we may ask for 
graduation date and field of study
PURPOSE FORMULA REQUIREMENTS
Estate planning – 
projected future  
estate tax liability
Ages
18–50
51–60 
61–70
71–75
76+
Maximum projection years
25
20
15
10
5
• A current value of the applicant’s estate, which includes a 
personal balance sheet listing all assets and liabilities and an 
estate analysis
• The estate projection rate and/or number of projected years 
may be adjusted, up or down, taking into consideration what 
is reasonable in the current environment
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 16

16
DETERMINING COVERAGE AMOUNTS FOR INDIVIDUALS
PURPOSE FORMULA REQUIREMENTS
Juvenile coverage Ages Coverage amount
Total juvenile insurance 
coverage with all 
carriers cannot exceed 
$2,000,000.
15 days 
through  
17 years
Amounts through $250,000 • Coverage on all siblings should be similar.
• Parent(s) or Guardian(s) must witness the applications  
and complete the medical history declarations for the  
juvile applicant.
• The policy owner must be the parent, legal guardian, or 
grandparent. For legal guardianship where the guardian is 
not the parent, we require a copy of the guardianship papers.
• The parent/legal guardian, juvenile, and owner must be 
residing in the U.S. permanently, either as a U.S. citizen or 
a visa type that is not considered temporary or uninsurable 
based on our international underwriting guidelines.
$250,001–$1,000,000 All requirements as indicated above for face amounts through 
$250,000, plus:
• Equal coverage* for parent(s) or legal guardian is allow  
up to $1,000,000.**
For amounts $500,000 and greater:
• Underwriting will obtain the child’s medical records.
• Minimum household income must be ≥ $100,000.
$1,000,001–$2,000,000 All requirements as indicated above for face amounts through 
$1,000,000, plus:
• At least one parent or legal guardian needs to have 2x the 
total line of coverage, in force and applied for, pending, as 
the amount applied for on the juvenile.
Washington State
15 days 
through 
17 years
Total line of coverage  
cannot exceed the U.S. 
household income.
All requirements as indicated above for the appropriate face 
amount, plus: 
• Juveniles 15 years or older must sign the application.
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 17

17
PREMIUM TO INCOME GUIDELINES
While each of your clients have different financial needs, these guidelines are intended to provide a general 
formula to help calculate suggested maximum amounts of life insurance.
• What does the client do for a living?
• What is their annual income and net worth?
• Do they already own a life insurance policy?
• If so, what is the face amount? Is it being replaced?
• What is the purpose of the life insurance being applied for?
• Do they have any medical issues that may result in a higher premium?
HIGH NET WORTH APPLICANTS
In circumstances where the premiums exceed the above guidelines, such as a client with demonstrable  
high liquid assets and low/moderate income, further consideration beyond the guidelines may be given.  
A cover letter of explanation and supporting financial evidence will be required for face amounts $3 million 
and higher.
PURPOSE FORMULA REQUIREMENTS
Affordability 
Guidelines
Below Formula – Annual premium for all policies ÷  
Annual income = %. The premium to income ratio  
should not exceed the percentages below.
• There should not be a significant adverse change in 
financial status or financial flexibility as a result of 
the purchase of the policy(ies). 
• For annual incomes less than $15,000, details 
supporting the need and purpose of the insurance 
may be necessary. Adjustments (upwards) for family 
size (when known) should be considered to align with 
U.S. Federal Poverty Guidelines published by the U.S. 
Department of Health & Human Services. 
• Premium affordability should be demonstrated for 
the total premiums being paid on all policies, by the 
payer(s). This includes all policies on the payer(s) life 
and all policies on the lives of others for which they 
are paying. 
Annual Income Premium to Income
≤ $30,000 15%
> or = $30,001 20%
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 18

18
DETERMINING COVERAGE AMOUNTS  
FOR BUSINESS PLANNING
PURPOSE FORMULA REQUIREMENTS
Key Person
Ages Factor x Income • The key person’s value to the company
• How the coverage amount was determined
• Whether the key person has ownership in the company 
and the percentage of ownership
• A list of all other key persons, the amount of key  
person coverage, and percentage ownership for  
each key person
• Business Beneficiary Report (BBIR) on amounts > 
$5,000,000
Under 65
65+ 
10
5
Buy-Sell/Business 
Continuation % Ownership x Corporate Value
• The fair market value of the business and how the amount 
of insurance was determined
• A copy of the buy-sell agreement or the details of the buy-
sell agreement
• The proposed insured's ownership percentage, the 
number of other partners, and their ownership percentage
• The amount of buy-sell coverage on each partner and the 
amount and purpose of all in force business coverage
• Business Beneficiary Report (BBIR) on amounts > 
$5,000,000
All partners must apply for or have in force buy-sell 
coverage. Corporate balance sheets, income statements 
and/or business valuation may be requested at  
Underwriter discretion.
Business Loan
An amount up to the outstanding  
principal of the loan  
• The business must be the owner of the policy
• Cover letter must include the purpose, duration of 
the loan, collateral pledged, its value, and the loan  
interest rate
• The term of the loan must be five years or more
• If creditor is designated beneficiary, it should be stated  
"as its interest may appear" with balance of proceeds  
to go to another designated personal beneficiary.  
A collateral assignment would also be acceptable.
• Business Beneficiary Report (BBIR) on amounts > 
$5,000,000
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 19

19
LIFESTYLE AND HEALTH HISTORY
Business Beneficiary Inspection Report (BBIR) ordered for business coverage over $2 million.
Electronic Inspection Report ordered for all coverage greater than $3.5 million through $10 million. Full Inspection Report ordered for all coverage greater than $10 million.
Trendsetter ® Super 
Trendsetter ® LB Preferred Plus Preferred 
Nonsmoker Standard Plus
Nonmed 
Standard 
Nonsmoker 
(Trendsetter LB 
Bands 1&2  
Only)
Standard 
Nonsmoker
Preferred 
Smoker
Nonmed 
Standard 
Smoker 
(Trendsetter LB 
Bands 1 & 2)
Standard 
Smoker
FFIUL II & FCIUL II Preferred Elite Preferred Plus Preferred N/A Nontobacco Preferred 
Tobacco N/A Tobacco
Tobacco Usage 1 None in the 
past 5 years 
None in the 
past 2 years
None in the 
past 2 years
None in the 
past year
None in the 
past 2 years
Tobacco 
permitted
Tobacco 
permitted
Tobacco 
permitted
Incidental cigar usage
Available 
subject to:  
-Admitted on 
application  
-HOS neg for 
cotinine 
-No more than 
1 per month
Available 
subject to:  
-Admitted on 
application  
-HOS neg for 
cotinine 
-No more than 
1 per month
Available 
subject to:  
-Admitted on 
application  
-HOS neg for 
cotinine 
-No more than 
1 per month
Available 
subject to:  
-Admitted on 
application  
-HOS neg for 
cotinine 
-No more than 
1 per month
Available 
subject to:  
-Admitted on 
application  
-HOS neg for 
cotinine 
-No more than 
1 per month
Permitted Permitted Permitted
Cholesterol with or  
without treatment 230 260 300 N/A N/A 260 N/A N/A
Chol/HDL
5.0 for ages 
≤70
5.5 for ages 
≤70
6.2 for ages 
≤70 N/A 7.0 for ages 
≤70
5.5 for ages 
≤70 N/A 7.0 for ages 
≤70
5.5 for ages 
71+
6.0 for ages 
71+
6.7 for ages 
71+
7.5 for ages 
71+
6.0 for ages 
71+
7.5 for ages 
71+
Blood pressure
135/85 for 
ages ≤70
145/85 for 
ages ≤70
148/88 for 
ages ≤70 N/A N/A 145/85 for 
ages ≤70 N/A N/A
145/85 for 
ages 71+
150/90 for 
ages 71+
152/88 for 
ages 71+ N/A N/A 150/90 for 
ages 71+ N/A
Treatment for  
blood pressure
Through age 
49: 
Without 
treatment 
Ages 50–80 :  
With 
treatment, 
as long as 
readings fit 
criteria above 
Ages 81+:  
Without 
treatment
With or 
without 
treatment
With or 
without 
treatment
N/A N/A
With or 
without 
treatment
N/A N/A
Family history 2 
Ages 18–64  
-  Includes cardiovascular 
disease or the following 
cancers: breast, ovarian, 
melanoma, prostate,  
and colon
- Some cancers may 
require evidence of 
routine surveillance 
screening
No Death 
in Parent or 
Sibling prior  
to age 60
No Death 
in Parent or 
Sibling prior to 
age 60
No more than 
one Parent or 
Sibling death 
prior to age 
60
N/A N/A
No Death 
in Parent or 
Sibling prior  
to age 60
N/A N/A
Impact on Risk Class
1  Tobacco usage is defined as using any tobacco products (cigarettes, cigars, chewing tobacco, nicotine patch/lozenge/gum, e-cigarettes, vapes (with or without nicotine)),  
etc., within the past 24 months. 
2 Some gender-specific cancers may qualify for preferred rates.
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 20

20
LIFESTYLE AND HEALTH HISTORY
Lifestyle and Health History — Impact on Risk Class
1  Avocation: Prohibited activities involving aeronautics (e.g., hang gliding, ultralight, soaring, skydiving, ballooning, etc.), power racing, competitive vehicles, mountain climbing, rodeos,  
competitive skiing, or scuba/skin diving at a depth greater than 75 feet. Individual consideration on a case-by-case basis — may or may not be eligible.
2 Foreign travel: Unless otherwise prohibited by statute  
3 Military: Unless otherwise prohibited by statute
Trendsetter ® Super 
Trendsetter ® LB Preferred Plus Preferred 
Nonsmoker Standard Plus
Nonmed 
Standard 
Nonsmoker 
(Trendsetter LB 
Bands 1 & 2  
Only)
Standard 
Nonsmoker
Preferred 
Smoker
Nonmed 
Standard 
Smoker 
(Trendsetter LB 
Bands 1 & 2)
Standard 
Smoker
FFIUL II & FCIUL II Preferred Elite Preferred Plus Preferred N/A Nontobacco Preferred 
Tobacco N/A Tobacco
Personal history
No heart 
or vascular 
disease, 
diabetes, 
or cancer 
(except some 
skin cancers)
No heart 
or vascular 
disease, 
diabetes, 
or cancer 
(except some 
skin cancers)
No heart 
or vascular 
disease, 
diabetes, 
or cancer 
(except some 
skin cancers)
N/A No ratable 
impairments
No heart 
or vascular 
disease, 
diabetes, 
or cancer 
(except some 
skin cancers)
N/A No ratable 
impairments
MVR - DUI None in the past 5 years N/A N/A None in past 5 
years N/A N/A
MVR-serious violations
No more 
than 1 serious 
violation in the 
past 3 years 
and NONE in 
the past 12 
months
No more than 1 serious 
violation in past 3 years N/A N/A
No more 
than 1 serious 
violation in 
past 3 years
N/A N/A
MVR-minor violations Up to 2 minor violations within the last year N/A N/A
Up to 2 minor 
violations 
within the last 
year
N/A N/A
Private aviation N/A
Preferred 
can be 
offered with 
or without 
ratable 
aviation
Can be 
offered with 
or without 
ratable 
aviation
 
N/A
Available as 
qualifies 
Preferred  
can be  
offered with  
or without 
ratable  
aviation
 
N/A
Available as 
qualifies
Avocation (hazardous)1
No 
participation 
in activities 
listed below
No 
participation 
in activities 
listed below
No 
participation 
in activities 
listed below 
N/A
Can be 
offered with 
or without 
ratable 
avocation
No 
participation 
in activities 
listed below
N/A
Can be 
offered with 
or without 
ratable 
avocation
Alcohol/substance abuse
No history or 
treatment at 
any time
No history or 
treatment at 
any time
No history or 
treatment in 
the past 10 
years
N/A
No history 
or treatment 
in the past 7 
years
No history or 
treatment at 
any time
N/A
No history 
or treatment 
in the past 7 
years
Citizenship/residence U.S. citizen or legal permanent resident/green card residing in the U.S. — all others, contact Underwriting for individual consideration
Foreign travel (high risk)2 No traveling to dangerous areas of the world where the State Department has issued travel advisories.
Military 3 Active military duty is acceptable provided the proposed insured is not serving in a hazardous area or does not have orders to serve 
in a hazardous area.
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 21

21
21For Agent Use Only. Not for Use With the Public.
Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.
Potential morbidity assessments may differ.
MDIR - Some conditions for monthly disability income rider may require an exclusion for that condition.
MEDICAL IMPAIRMENTS
BEST POSSIBLE RATE CLASS AVAILABLE RIDER AVAILABILITY
IMPAIRMENT PREFERRED 
RATE CLASS
STANDARD 
RATE CLASS DECLINE CRITICAL 
ILLNESS RIDER
CHRONIC ILLNESS 
RIDER / LONG 
TERM CARE 
RIDER
Impacted ADL's Yes
ADD/ADHD (age 8 and under) Yes
AIDS Yes
Alcoholism Yes
ALS (Lou Gehrig's disease) Yes
Alzheimer's disease/dementia Yes
Amputations, not due to disease Yes ✔ ✔
Anemia Yes ✔ ✔
Aneurysm Yes
Anxiety Yes ✔ ✔
Arthritis, osteo Yes ✔ ✔
Arthritis, rheumatoid Yes ✔
Asthma Yes ✔ ✔
Atrial fibrillation Yes ✔ ✔
Autism Individual 
consideration ✔
Barrett's esophagus Yes ✔ ✔
Bell's palsy Yes ✔ ✔
Bipolar disorder Yes
Blindness Yes
Benign Prostatic Hypertrophy (BPH) Yes ✔ ✔
Broken bone Yes ✔ ✔
Bronchitis, chronic (COPD) Yes ✔
Bundle branch block, right Yes ✔ ✔
Bundle branch block, left Yes ✔ ✔
Cancer (internal organ) Yes ✔
Cancer, skin (not melanoma) Yes ✔ ✔
Cancer (undergoing treatment) Yes
Cardiomyopathy Yes
Cerebral palsy Yes
Cerebrovascular accident, stroke (CVA) Yes
Chronic fatigue syndrome Yes ✔ ✔
Chronic obstructive pulmonary disorder (COPD) Yes ✔
Chronic pain Yes ✔
Cirrhosis Yes
Colitis, ulcerative Yes
Colitis, other than ulcerative Yes ✔ ✔
Concussion (head injury) Yes ✔ ✔

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 22

22
BEST POSSIBLE RATE CLASS AVAILABLE RIDER AVAILABILITY
IMPAIRMENT PREFERRED 
RATE CLASS
STANDARD 
RATE CLASS DECLINE CRITICAL 
ILLNESS RIDER
CHRONIC ILLNESS 
RIDER / LONG 
TERM CARE 
RIDER
Congestive heart failure (CHF) Yes
Coronary artery disease Yes ✔
Criminal activity Yes ✔ ✔
Crohn's disease Yes
Cystic fibrosis Yes
Depression Yes ✔ ✔
Diabetes Yes ✔ ✔
Down syndrome Yes
Emphysema Yes ✔
Endocarditis Yes ✔ ✔
Epilepsy (greater than age 3) Yes ✔ ✔
Fibromyalgia, fibrositis Yes ✔ ✔
Gastric banding, sleeve or bypass surgery Yes ✔ ✔
Gastroesophgeal reflux disease (GERD) Yes ✔ ✔
Glomerulonephritis Yes ✔ ✔
Headache, migraine or tension Yes ✔ ✔
Heart attack Yes ✔
Heart, lung, or liver transplant Yes
Heart valve surgery Yes ✔
Hepatitis B Yes
Hepatitis C Yes
Hernia Yes ✔ ✔
High blood pressure/hypertension Yes ✔ ✔
Histoplasmosis Yes ✔ ✔
Hodgkin's disease Yes ✔
Huntington's disease Yes
Hydronephrosis Yes ✔ ✔
Kidney failure, dialysis Yes
Kidney removal Yes ✔ ✔
Leukemia Yes
Lou Gehrig’s disease (ALS) Yes
Lupus Yes
Marijuana use Yes ✔ ✔
Melanoma (less than 2, including melanoma in situ) Yes ✔
Meniere's disease Yes ✔ ✔
Meningioma Yes ✔ ✔
Meningitis, history of Yes ✔
MEDICAL IMPAIRMENTS
For Agent Use Only. Not for Use With the Public.
Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.
Potential morbidity assessments may differ.
MDIR - Some conditions for monthly disability income rider may require an exclusion for that condition.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 23

23
BEST POSSIBLE RATE CLASS AVAILABLE RIDER AVAILABILITY
IMPAIRMENT PREFERRED 
RATE CLASS
STANDARD 
RATE CLASS DECLINE CRITICAL 
ILLNESS RIDER
CHRONIC ILLNESS 
RIDER / LONG 
TERM CARE 
RIDER
Mental retardation and/or intellectual disability Yes
Mitral insufficiency, Mitral valve prolapse (MVP) Yes ✔ ✔
Mitral stenosis Yes ✔ ✔
Multiple sclerosis (MS) Yes
Muscular dystrophy Yes
Myasthenia gravis Yes
Myocarditis Yes ✔ ✔
Nephrectomy Yes ✔ ✔
Non-Hodgkin's lymphoma Yes ✔
Occupations with special hazards Yes ✔ ✔
Pacemaker Yes ✔ ✔
Pancreatitis (resolved) Yes ✔ ✔
Paralysis, spinal cord injury Yes
Parkinson's disease Yes
Pericarditis Yes ✔ ✔
Peripheral vascular disease (PVD) Yes ✔
Phlebitis, thrombosis, blood clot Yes ✔ ✔
Pituitary adenoma Yes ✔ ✔
Pleurisy Yes ✔ ✔
Pregnancy, no history of or current complications Yes ✔ ✔
Prostatitis, with normal PSA Yes ✔ ✔
Psychosis Yes
Pulmonary fibrosis Yes
Pyelonephritis, acute Yes ✔ ✔
Pyelonephritis, chronic Yes
Rheumatic fever, no heart complications Yes ✔ ✔
Sarcoidosis Yes ✔
Schizophrenia Yes
Sleep apnea Yes ✔ ✔
Stroke Yes
Suicide attempt (more than 2 years ago) Yes
Terminal illnesses Yes
Thyroid disorder Yes ✔ ✔
Transient ischemic attack (TIA) Yes
Tuberculosis, recovered Yes ✔ ✔
Tumors, benign Yes ✔ ✔
Tumors, malignant, history of Yes ✔
MEDICAL IMPAIRMENTS
For Agent Use Only. Not for Use With the Public.
Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.
Potential morbidity assessments may differ.
MDIR - Some conditions for monthly disability income rider may require an exclusion for that condition.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 24

24
BEST POSSIBLE RATE CLASS AVAILABLE RIDER AVAILABILITY
IMPAIRMENT PREFERRED 
RATE CLASS
STANDARD 
RATE CLASS DECLINE CRITICAL 
ILLNESS RIDER
CHRONIC ILLNESS 
RIDER / LONG 
TERM CARE 
RIDER
Ulcerative colitis Yes
Ulcer, stomach Yes ✔ ✔
Vascular Ehlers-Danlos syndrome Yes
Wasting syndrome Yes
MEDICAL IMPAIRMENTS
For Agent Use Only. Not for Use With the Public.
Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.
Potential morbidity assessments may differ.
MDIR - Some conditions for monthly disability income rider may require an exclusion for that condition.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 25

25
CASE SCENARIOS
Henry, a 55-year-old male,  was diagnosed 
with high blood pressure three years ago and 
has since been prescribed Ramipril. At his 
last doctor’s appointment, he was 5 foot, 10 
inches and 199 pounds, and he had a blood 
pressure reading of 136/86. He had  
a speeding ticket within the last year for 
driving 10 mph over the limit. Henry applied 
for a $1 million FFIUL II with Accidental Death 
Benefit and Disability Waiver of Premium 
Riders. He qualified for Preferred Elite.
Tina, a 37-year-old accountant,  had a physical 
two years ago where her labs were drawn.  
The lab results showed high cholesterol 
and high triglycerides. She has since been 
diagnosed with hypercholesterolemia and  
was prescribed Atorvastatin. Tina is 5 foot,  
7 inches and 192 pounds. She applied for a 
$75K 30-year Trendsetter® Super  policy and 
got approved at Standard Plus due to her  
**BMI of 30.1.  **
Phil, a 72-year-old male,  was prescribed 
Donepezil for dementia treatment five years 
ago. He lives alone, requires no assistance, 
and has a clear driving record. He is 5 foot,  
6 inches and 142 pounds. Phil applied for  
a $250K FFIUL II policy, but he was declined  
due to dementia treatment.
Kim, a 23-year-old nurse,  was recently 
diagnosed with iron deficient anemia.  
The doctor was not concerned, thought it 
was due to her menstrual cycle and she was 
advised to take an iron supplement. Kim’s  
on the smaller side at 5 feet, 3 inches and  
120 pounds. She applied for a $1.5 million 
FCIUL II policy and got approved at a  
Preferred Elite risk class.
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 26

26
SUBSTANDARD TABLE RATINGS
Substandard ratings may be attributable to health, occupation, or avocation 
characteristics that result in higher than average mortality risks.
Our competitive underwriting allows us to offer substandard table ratings 
using the following guide:
TABLE RATING GUIDE
Standard = 100%
1/A = 125%
2/B = 150%
3/C = 175%
4/D = 200%
5/E = 225%
6/F = 250%
8/H = 300%
26For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 27

27
WHAT IF THE CLIENT  
IS NOT A U.S. CITIZEN?  
A client who is not a U.S. citizen may still qualify for life insurance coverage if they meet certain 
special requirements and comply with all relevant items (which may vary based on their status)  
listed below:
• The client must have significant business and/or financial ties to the United States;
• The client must present either a(n): Social Security number (SSN); Individual Tax Identification 
Number (ITIN/TIN); appropriate version of IRS Form W8 for those without an SSN or TIN;  
or (for the ITIN Program) IRS ITIN letter issued as a result of a W-7 Application;
• The client must be physically present in the United States at the time of application;
• ITIN applicants will require ITIN forms (CP565) or Social Security card. Submit copy with the file;
• Visa holders: Indicate the specific visa type (e.g., H1, F1, etc.) or exact immigration status  
(e.g., refugee, asylum, etc.) on the application and submit a copy of the valid visa;1,2
• Employment Authorization Card (“EAC”) holders: compare the category code, located in the 
center of the EAC to determine if the candidate is eligible to apply for insurance and submit a copy 
of the valid EAC;
• Immigration documents pending expiration within 60 days of the application date may affect 
insurability or delay processing while we confirm renewal;
• Fully expired visas must show proof of renewal or extension (I-797, I-797A, or other confirmation 
document from USCIS that is acceptable to Underwriting);
• EB-5 visa holders transitioning to a green card status may be asked for additional documentation  
to confirm that process;
• A copy of all required documentation will be asked for in iGO at the time of application. For paper 
applications, use the image upload tool on the agent portals to submit copies of images, and 
indicate this in the agent comments section;
• Only U.S. residents are eligible to apply for the Living Benefit Riders (Chronic Illness, Critical 
Illness) and/or Long Term Care Rider, approval is subject to Underwriting.
• A separate international underwriting guide is available for information on submitting nonresident 
foreign national and U.S. expatriate business. All international risk guidelines are subject to 
change without prior notice.
For further details, please refer to our Resident Foreign Nationals Travel Guidelines flyer, HNW 
Nonresident FN UW Guidelines (111955), and Foreign National Individual Taxpayer Identification 
Number Guidelines (117754).
For Agent Use Only. Not for Use With the Public.
1  Not all visa types or immigration statuses are eligible. Note also that the Matricula Consular document is not recognized to be valid as a visa by the  
U.S. government.
2  List "Permanent Resident" on the application if the client is a valid green card holder residing in the U.S.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 28

28
INITIAL UNDERWRITING REQUIREMENTS  
FOR NON-U.S. RESIDENTS
Transamerica Financial Foundation IUL ® II1,2
FACE  
AMOUNT 3,4,5,7,8,9
ISSUE AGE 6 
0–179 18–40 41–50 51–60 61–70 71–75 76–8010 81–85 10
$25,000– 
$50,000 N/A Vitals, BCP, 
HOS, PFS
Vitals, BCP, 
HOS, PFS
Vitals, BCP, 
HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
$50,001– 
$75,000 N/A Vitals, BCP, 
HOS, PFS
Vitals, BCP, 
HOS, PFS
Vitals, BCP, 
HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
$75,001– 
$99,999 N/A Vitals, BCP, 
HOS, PFS
Vitals, BCP, 
HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
$100,000– 
$250,000 N/A Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS CS, PFS
Vitals BCP 
 HOS CS, PFS
Vitals BCP HOS 
CS, PFS
$250,001– 
$500,000 N/A Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS CS, PFS
Vitals BCP HOS 
CS, PFS
Vitals BCP HOS 
CS, PFS
$500,001– 
$1,000,000 N/A Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP  
HOS CS, PFS
Vitals BCP HOS 
CS, PFS
Vitals BCP HOS 
CS, PFS
$1,000,001– 
$2,000,000 N/A Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP 
 HOS, PFS
Vitals BCP  
HOS CS PFS
Vitals BCP  
HOS CS PFS
Vitals BCP HOS 
ECG CS PFS
$2,000,001– 
$3,500,000 N/A Vitals BCP  
HOS PFS
Vitals BCP  
HOS PFS
Vitals BCP  
HOS PFS
Vitals BCP  
HOS PFS
Vitals BCP  
HOS CS PFS
Vitals BCP  
HOS CS PFS
Vitals BCP  
HOS ECG  
CS PFS
$3,500,001– 
$5,000,000 N/A Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS CS PFS IR
VitalsBCP  
HOS CS PFS IR
Vitals BCP  
HOS ECG CS 
PFS IR
$5,000,001– 
$10,000,000 N/A Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP 
HOS CS  
PFS IR
Vitals BCP  
HOS ECG CS 
PFS IR
Vitals BCP  
HOS ECG  
CS PFS IR
$10,000,001  
and higher N/A
Vitals BCP  
HOS ECG  
PFS IR
Vitals BCP  
HOS ECG  
PFS IR
Vitals BCP  
HOS ECG  
PFS IR
Vitals BCP  
HOS ECG  
PFS IR
Vitals BCP  
HOS ECG CS 
PFS IR
Vitals BCP  
HOS ECG CS 
PFS IR
Vitals BCP  
HOS ECG  
CS PFS IR
For Agent Use Only. Not for Use With the Public.
1 Use this chart for non-U.S. residents.
2  Transamerica reserves the right to request other evidence of insurability as it deems 
necessary.  
3  Requests to reduce face amount received during underwriting will not alter the medical 
requirements.
4 Available with $5,000 Minimum No Lapse Premium (MNLP) and higher
5 The Long Term Care (LTC) Rider is not available to individuals residing outside the U.S.
6 Cognitive Screen (CS) required at ages ≥ 70 for face amounts ≥ $100,000.
7  Third-party financial verification for face amounts > $3,000,000 and/or total line over 
jumbo limits
8  IRS Form 4506-C is required with all applications ≥ $5,000,000 or at underwriter 
discretion.
9  Business Beneficiary Inspection Report (BBIR) ordered for business coverage over 
$5,000,000.
10 IC/Individual Consideration at these ages
Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at 
the time of the application, we reserve the right to rescind the policy.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 29

29
INITIAL UNDERWRITING REQUIREMENTS  
FOR NON-U.S. RESIDENTS
Transamerica Financial Choice IUL II SM 1,2
1 Use this chart for non-U.S. residents.
2  Transamerica reserves the right to request other evidence of insurability as it  
deems necessary.  
3  Requests to reduce face amount received during underwriting will not alter the medical 
requirements.
4 Available with $5,000 Minimum No Lapse Premium (MNLP) and higher
5 Cognitive Screen (CS) required at ages ≥ 70 for face amounts ≥ $250,000.
6  Third-party financial verification for face amounts > $3,000,000 and/or total line over 
jumbo limits
7  IRS Form 4506-C is required with all applications ≥ $5,000,000 or at  
underwriter discretion.
8  Business Beneficiary Inspection Report (BBIR) ordered for business coverage  
over $5,000,000.
9 IC/Individual Consideration at these ages
FACE  
AMOUNTS 3, 4, 6, 7, 8
ISSUE AGE  7 
0–17 18–40 41–50 51–60 61–70 71–75 76–809 81–859
$250,000– 
$500,000 N/A Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS CS, PFS
Vitals BCP HOS 
CS, PFS
Vitals BCP HOS 
CS, PFS
$500,001– 
$1,000,000 N/A Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS CS, PFS
Vitals BCP HOS 
CS, PFS
Vitals BCP HOS 
CS, PFS
$1,000,001– 
$2,000,000 N/A Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS CS PFS
Vitals BCP  
HOS CS PFS
Vitals BCP 
HOS ECG  
CS PFS
$2,000,001– 
$3,500,000 N/A Vitals BCP  
HOS PFS
Vitals BCP  
HOS PFS
Vitals BCP  
HOS PFS
Vitals BCP  
HOS PFS
Vitals BCP  
HOS CS PFS
Vitals BCP  
HOS CS PFS
Vitals BCP  
HOS ECG  
CS PFS
$3,500,001– 
$5,000,000 N/A Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP 
HOS CS  
PFS IR
Vitals BCP 
HOS CS  
PFS IR
Vitals BCP  
HOS ECG  
CS PFS IR
$5,000,001– 
$10,000,000 N/A Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP  
HOS PFS IR
Vitals BCP 
HOS CS  
PFS IR
Vitals BCP  
HOS ECG  
CS PFS IR
Vitals BCP  
HOS ECG  
CS PFS IR
$10,000,001  
and higher N/A
Vitals BCP  
HOS ECG  
PFS IR
Vitals BCP  
HOS ECG  
PFS IR
Vitals BCP  
HOS ECG  
PFS IR
Vitals BCP  
HOS ECG  
PFS IR
Vitals BCP  
HOS ECG  
CS PFS IR
Vitals BCP  
HOS ECG  
CS PFS IR
Vitals BCP  
HOS ECG  
CS PFS IR
For Agent Use Only. Not for Use With the Public.
Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at 
the time of the application, we reserve the right to rescind the policy.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 30

30
INITIAL UNDERWRITING REQUIREMENTS  
FOR NON-U.S. RESIDENTS
Trendsetter® Super 1,2
1 Use this chart for non-U.S. residents.
2  Transamerica reserves the right to request other evidence of insurability as it deems 
necessary.  
3  Requests to reduce face amount received during underwriting will not alter the medical 
requirements.
4 Available with $5,000 Minimum No Lapse Premium (MNLP) and higher
5 The Long Term Care (LTC) Rider is not available to individuals residing outside the U.S.
6 Cognitive Screen (CS) required at ages ≥ 70 for face amounts ≥= $100,000.
7  Third-party financial verification for face amounts > $3,000,000 and/or total line over 
jumbo limits
8  IRS Form 4506-C is required with all applications ≥ $5,000,000 or at underwriter 
discretion.
9  Business Beneficiary Inspection Report (BBIR) ordered for business coverage over 
$5,000,000.
10 IC/Individual consideration at these ages
 
FACE AMOUNT 3, 4, 5, 7, 8, 9
ISSUE AGE 6 
18–40 41–50 51–60 61–70 71–75 76–8010
$25,000–$50,000 Vitals, BCP,  
HOS, PFS
Vitals, BCP,  
HOS, PFS
Vitals, BCP,  
HOS, PFS
Vitals, BCP,  
HOS, PFS
Vitals BCP HOS, 
PFS
Vitals BCP HOS, 
PFS
$50,001–$99,999 Vitals, BCP,  
HOS, PFS
Vitals, BCP,  
HOS, PFS
Vitals, BCP,  
HOS, PFS
Vitals BCP HOS, 
PFS
Vitals BCP HOS, 
PFS
Vitals BCP HOS, 
PFS
$100,000–$250,000 Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS CS, PFS
Vitals BCP  
HOS CS, PFS
$250,001–$500,000 Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS CS, PFS
Vitals BCP  
HOS CS, PFS
$500,001–$1,000,000 Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS CS PFS
Vitals BCP  
HOS CS, PFS
$1,000,001–$2,000,000 Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS PFS
Vitals BCP  
HOS CS PFS
Vitals BCP HOS 
ECG CS PFS
$2,000,001–$3,500,000 Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS PFS
Vitals BCP  
HOS CS PFS
Vitals BCP HOS 
ECG CS PFS
$3,500,001–$5,000,000 Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS, PFS
Vitals BCP  
HOS PFS
Vitals BCP HOS 
CS PFS
Vitals BCP HOS 
ECG CS PFS
$5,000,001–$10,000,000 Vitals BCP  
HOS PFS
Vitals BCP  
HOS PFS
Vitals BCP  
HOS PFS
Vitals BCP  
HOS PFS
Vitals BCP HOS 
ECG CS PFS
Vitals BCP HOS 
ECG CS PFS
$10,000,001 and higher Vitals BCP HOS 
ECG PFS IR
Vitals BCP HOS 
ECG PFS IR
Vitals BCP HOS 
ECG PFS IR
Vitals BCP HOS 
ECG PFS IR
Vitals BCP HOS 
ECG CS PFS IR
Vitals BCP HOS 
ECG CS PFS IR
For Agent Use Only. Not for Use With the Public.
Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at 
the time of the application, we reserve the right to rescind the policy.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 31

31
DOCUMENTATION NEEDED FOR NON U.S. CITIZENS
Your client will need to provide on the application their resident status, country of citizenship, 
date of entry into U.S. (mm/yyyy) and green card expiration date. Copies of visas and 
Employment Authorization Cards (EAC) should be uploaded. Please see the visa or EAC 
category code/type for potential rates (see pages 32–35). Green cards are not routinely 
needed but may be requested at Underwriter discretion. 
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 32

32
CATEGORY 
CODE DESCRIPTION
ELIGIBILITY 
LIFE LONG TERM 
CARE RIDER 
CRITICAL 
ILLNESS RIDER 
CHRONIC 
ILLNESS RIDER 
JUVENILES 
(INCLUDES 
PARENT/
OWNER 
STATUS)
A2 Lawful temporary resident -  
Special Agricultural Workers Up to best class Ye s Ye s Ye s Ye s
A3  Refugee Up to best class Ye s Ye s Ye s Ye s
A4 Paroled refugee Up to best class Ye s Ye s Ye s Ye s
A5 Asylee Up to best class Ye s Ye s Ye s Ye s
A6 Fiancé(e) (K-1 or K-2 nonimmigrant) Up to best class Ye s Ye s Ye s Ye s
A7 N-8 or N-9 Based on country 
of origin Ye s Ye s Ye s Ye s
A8 Citizen of Micronesia, Marshall Islands, 
or Palau Up to best class Ye s Ye s Ye s Ye s
A9 K-3 or K-4 Up to best class Ye s Ye s Ye s Ye s
A10 Withholding of deportation or  
removal granted
Eligible under the 
ITIN program Ye s Ye s Ye s Ye s
A11 Deferred Enforced Departure Decline No No No No
A12 T emporary Protected Status granted Based on country 
of origin Ye s Ye s Ye s Ye s
A13 Family Unity Program (Section 301  
of the Immigration Act of 1990) Up to best class Ye s Ye s Ye s Ye s
A14
LIFE Legalization (Section 1504 of the 
Legal Immigrant Family Equity (LIFE)  
Act Amendments)
Up to best class Ye s Ye s Ye s Ye s
A15 V visa nonimmigrant Based on country 
of origin Ye s Ye s Ye s Ye s
A16 T-1 nonimmigrant Decline No No No No
A17 Spouse of an E nonimmigrant Up to best class Ye s Ye s Ye s Ye s
A18 Spouse of an L nonimmigrant Decline Ye s Ye s Ye s Ye s
A19 U-1 nonimmigrant Based on country 
of origin  Ye s Ye s Ye s No
A20 U-2, U-3, U-4, or U-5 nonimmigrant Based on country 
of origin  Ye s Ye s Ye s No
C1 Spouse/ dependent of A-1 or  
A-2 visa nonimmigrant Decline No No No No
C2
Spouse/ dependent of Coordination 
Council for North American Affairs 
(E-1)/T aipei Economic and Cultural 
Representative Office (TECRO)
Up to best class Ye s Ye s Ye s Ye s
C3 F-1 student, pre-completion Optional 
Practical T raining Up to best class Ye s Ye s Ye s Ye s
C4 Spouse/ dependent of G-1, G-3, or G-4 Based on country 
of origin Ye s Ye s Ye s Ye s
C5 J-2 spouse or child of J-1 exchange visitor Based on country 
of origin Ye s Ye s Ye s Ye s
C6 M-1 student, Practical T raining Up to best class Ye s Ye s Ye s Ye s
C7 Dependent of NATO-1 through
NATO-6
Based on country 
of origin Ye s Ye s Ye s Ye s
C8 Asylum application pending filed Eligible under the 
ITIN program Ye s Ye s Ye s Ye s
ELIGIBILITY BY EMPLOYEE AUTHORIZATION CARD CATEGORY CODE
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 33

33
ELIGIBILITY BY EMPLOYEE AUTHORIZATION CARD CATEGORY CODE
> Continued from previous page
CATEGORY 
CODE DESCRIPTION
ELIGIBILITY 
LIFE LONG TERM 
CARE RIDER 
CRITICAL 
ILLNESS RIDER 
CHRONIC 
ILLNESS RIDER 
JUVENILES 
(INCLUDES 
PARENT/
OWNER 
STATUS)
C9 Pending adjustment of status under 
Section 245 of the Act Up to best class Ye s Ye s Ye s Ye s
C10  Suspension of deportation applicants 
(filed before April 1, 1997)
Eligible under the
ITIN program Ye s Ye s Ye s Ye s
C11 Public Interest parolee Based on country 
of origin Ye s Ye s Ye s Ye s
C12 Spouse of an E-2 CNMI investor Up to best class Ye s Ye s Ye s Ye s
C14 Deferred action Eligible under the 
ITIN program Ye s Ye s Ye s Ye s
C15 Not in use N /A No Ye s Ye s Ye s
C16
Creation of record (adjustment based  
on continuous residence since  
January 1, 1972)
Up to best class Ye s Ye s Ye s Ye s
C17 B-1 domestic servant  of certain 
nonimmigrants Decline No No No No
C18 Order of supervision Decline No No No No
C19
Certain pending TPS applicants whom 
USCIS has determined are prima facie 
eligible for TPS and who may then receive 
an EAD as a ”temporary treatment 
benefit” under 8 C.F.R. 244.10(a). 
Based on country 
of origin Ye s Ye s Ye s Ye s
C20 Section 210 legalization (pending I-700) 
Special Agricultural Workers Up to best class Ye s Ye s Ye s Ye s
C21  S visa nonimmigrant Decline No No No No
C22 Section 245A legalization (pending 
I-687) Up to best class Ye s Ye s Ye s Ye s
C23 Irish peace process (Q-2) Up to best class Ye s Ye s Ye s Ye s
C24 LIFE legalization Up to best class Ye s Ye s Ye s Ye s
C25 T-2, T-3, T-4, T-5, or T-6 nonimmigrant Decline No No No No
C26 Spouse of an H-1B nonimmigrant Up to best class Ye s Ye s Ye s Ye s
C31 VAWA self-petitioners with an approved 
Form I-360 Up to best class Ye s Ye s Ye s Ye s
C33 Consideration of Deferred Action  
for Childhood Arrivals
Eligible under the 
ITIN program Ye s Ye s Ye s Ye s
C35
Principal beneficiary of an approved 
employment-based immigrant petition 
facing compelling circumstances 
Up to best class Ye s Ye s Ye s Ye s
C36
Spouse or unmarried child of a principal 
beneficiary of an approved employment-
based immigrant petition facing 
compelling circumstances
Up to best class Ye s Ye s Ye s Ye s
The purpose of this document is to outline risks that are considered uninsurable based on immigration status. It is not possible to include every scenario and the contents of this document are subject to change 
without notice. This is not an offer guaranteeing any predetermined rate for any applicant.
For Agent Use Only. Not for Use With the Public.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 34

34
For Agent Use Only. Not for Distribution to the Public.
ELIGIBILITY BY VISA TYPES
The purpose of this document is to outline risks that are considered uninsurable based on immigration status. It is not possible to include every scenario and the contents of this document are subject to 
change without notice. This is not an offer guaranteeing any predetermined rate for any applicant.
CATEGORY 
CODE DESCRIPTION DOCUMENTATION 
REQUIRED
ELIGIBILITY 
LIFE LONG TERM 
CARE RIDER 
CRITICAL 
ILLNESS RIDER 
CHRONIC 
ILLNESS RIDER 
JUVENILES 
(INCLUDES 
PARENT/
OWNER 
STATUS)
A Government 
Official N /A Decline No No No No
AS Asylum
Proof of asylum 
approval (copy 
immigration court 
document or EAD 
category A5)
Up to best class Ye s Ye s Ye s Ye s
B
Visitor  
(B1, B2, B1/B2, 
BCC)
Copy of visa and proof 
of U.S. entry
Underwritten 
according to 
country of legal 
residence
No No No No
C T ransit N /A Decline No No No No
D Crewman N /A Decline No No No No
E  Investor Copy of visa Up to best class Ye s Ye s Ye s Ye s
E  Employment 
Auth. Card 
Copy of employee 
authorization card
Based on  
category code
See code 
chart
See code 
chart
See code 
chart
See code 
chart
F Student/
academic
Copy of visa and
I-20 from college Up to best class Ye s Ye s Ye s Ye s
G 
Representative 
to international 
organization
Copy of visa and proof 
of U.S. entry
Based on 
country of origin Ye s Ye s Ye s No
GC 
Green Card,
Permanent 
Resident Card
Copy of green card at 
underwriter discretion Up to best class Ye s Ye s Ye s Ye s
H Work/ occupation Copy of visa Up to best class Ye s Ye s Ye s Ye s
I Media N /A Decline No No No No
J Cultural 
Exchange
Copy of visa and proof 
of U.S. entry
Based on 
country of origin Ye s Ye s Ye s No
K Fiancée/fiancé Copy of visa Up to best class Ye s Ye s Ye s Ye s
L Executive Copy of visa Up to best class Ye s Ye s Ye s Ye s
M Vocational/ non-
academic Copy of visa Up to best class Ye s Ye s Ye s Ye s
MC Matricula 
Consular ID N /A Decline No No No No
NATO Government 
workers
Copy of green card at 
underwriter discretion, 
copy of visa and proof 
of U.S. entry
Based on 
country of origin Ye s Ye s Ye s No
O 
Science/ art 
extraordinary 
ability
Copy of visa Up to best class Ye s Ye s Ye s Ye s
Continued >

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 35

35
For Agent Use Only. Not for Distribution to the Public.
ELIGIBILITY BY VISA TYPES
> Continued from previous page
CATEGORY 
CODE DESCRIPTION DOCUMENTATION 
REQUIRED
ELIGIBILITY 
LIFE LONG TERM 
CARE RIDER 
CRITICAL 
ILLNESS RIDER 
CHRONIC 
ILLNESS RIDER 
JUVENILES 
(INCLUDES 
PARENT/
OWNER 
STATUS)
P 
Professional 
athlete/
entertainer
Copy of visa Up to best class Ye s Ye s Ye s Ye s
Q 
Cultural 
exchange Copy of visa and proof 
of U.S. entry
Based on 
country of origin Ye s Ye s Ye s No
R Religious Copy of visa and proof 
of U.S. entry
Based on 
country of origin Ye s Ye s Ye s No
RE Refugee Proof of refugee          
status (I-94) Up to best class Ye s Ye s Ye s Ye s
S Witness/
informant N /A Decline No No No No
T Victims of 
trafficking N /A Decline No No No No
TN/TD T rades (NAFTA ) Copy of visa Up to best class Ye s Ye s Ye s Ye s
TPS T emporary 
protection status Proof of status (I-94) Based on 
country of origin Ye s Ye s Ye s No
TWOV T ransit without 
a visa N /A Decline No No No No
U Victims of certain
criminal activity
Valid current visa and 
proof of U.S. entry
Based on 
country of origin Ye s Ye s Ye s No
V 
Certain second
preference 
beneficiaries
Copy of visa, proof of 
U.S. entry
Based on 
country of origin Ye s Ye s Ye s No
VWP Visa Waiver 
Program
Copy of visa, proof of 
U.S. entry
Underwritten 
according to
country of legal 
residence
No No No No
The purpose of this document is to outline risks that are considered uninsurable based on immigration status. It is not possible to include every scenario and the contents of this document are subject to 
change without notice. This is not an offer guaranteeing any predetermined rate for any applicant.

## Transamerica Term (Trendsetter) Underwriting Guide Charts — Page 36

Visit: transamerica.com
Underwriting requirements are subject to change without notice.
Life insurance products are issued by Transamerica Life Insurance Company, Cedar Rapids, IA, or Transamerica Financial Life Insurance Company, Harrison, 
NY. Transamerica Financial Life Insurance Company is authorized to conduct business in New York. Transamerica Life Insurance Company is authorized to 
conduct business in all other states. All products may not be available in all jurisdictions. 
For Agent Use Only. Not for Use With the Public.
Let’s get started today.
3422452R6 08/25
© 2025 Transamerica Corporation. All Rights Reserved.


<!-- source:TERM_UNDERWRITING_FULL_EXTRACT.md -->

# Transamerica Term/IUL UW Guide — Full Text Extract

**Product focus:** Trendsetter Super/LB (+ shared IUL UW grids)
**Source:** `source_pdfs/Term_IUL_UW_Guide_upload_extract.md`
**Audience:** Agent use only — full PDF text extract for internal RAG underwriting retrieval.

Source URL: https://cdn.bfldr.com/86JM1UOD/as/vsg5vfmmm63rmms8gwt6nw/Transamerica_Term_and_IUL_Underwriting_Guide_for_ICC_States
Title: REV UP YOUR ROUTINE

08/25

## REV UP YOUR ROUTINE

## A FIELD GUIDE TO UNDERWRITING:

Trendsetter® Super, Trendsetter® LB,  
Transamerica Financial Foundation IUL® II,  
Transamerica Financial Choice IUL$^{SM}$ II

For Agent Use Only. Not for Use With the Public.

TRANSAMERICA®

---

# TABLE OF CONTENTS

|  **DIGITAL UNDERWRITING SOLUTION** | **3**  |
| --- | --- |
|  **UNDERWRITING REQUIREMENTS** | **4**  |
|  Transamerica Orders All Requirements |   |
|  Underwriting Requirements and Reports Defined |   |
|  How Long Are Underwriting Requirements Valid? | 6  |
|  APS Guidelines | 6  |
|  **AGE AND FACE AMOUNT REQUIREMENTS** | **7**  |
|  *Trendsetter® Super and Trendsetter® LB* | 7  |
|  *Transamerica Financial Choice IUL^{SM} II* | 8  |
|  *Transamerica Financial Foundation IUL^{®} II* | 9  |
|  **AVAILABLE RIDERS BY PRODUCT** | **10**  |
|  Additional Rider Information | 11  |
|  **BLENDED BODY MASS INDEX (BMI) CHARTS** | **13**  |
|  **UNDERWRITING TIPS** | **14**  |
|  Determining Coverage Amounts for Individuals | 15  |
|  Premium to Income Guidelines | 17  |
|  High Net Worth Applicants | 17  |
|  Coverage Amounts for Businesses | 18  |
|  **LIFESTYLE AND HEALTH HISTORY** | **19**  |
|  Medical Impairments | 21  |
|  Case Scenarios | 25  |
|  Substandard Table Ratings | 26  |
|  **WHAT IF THE CLIENT IS NOT A U.S. CITIZEN?** | **27**  |
|  **INITIAL UNDERWRITING REQUIREMENTS FOR NON-U.S. RESIDENTS** | **28**  |
|  **ELIGIBILITY BY EMPLOYEE AUTHORIZATION CARD CATEGORY CODE** | **32**  |
|  **ELIGIBILITY BY VISA TYPES** | **34**  |

For Agent Use Only. Not for Use With the Public.

/ 2

---

# DIGITAL UNDERWRITING SOLUTION

## DIGITAL UNDERWRITING SOLUTION

Transamerica is proud to introduce our digital underwriting solution for term and index universal life policies. By leveraging automation, we expect this streamlined process to reduce underwriting and issue times for you and your clients, improving your overall new business submission experience.

## DIGITAL UNDERWRITING

No one likes surprises when they’re writing business. In an ever-changing landscape, you need tools that can quickly and efficiently help clients obtain the protection they need. That’s why we’ve introduced our digital application to help collect more information upfront, reduce the need to request traditional underwriting requirements, and significantly increase the number of applications submitted in good order.

## iGO e-APP

Our electronic application, the iGO® e-App, provides guidance and prompts to assist you with a client’s application process and helps ensure good order before submission to the home office. The application features LexisNexis data prefill to prepopulate fields and help with the client verification process. Reflexive questions only ask questions when applicable to the proposed insured and help us obtain additional details about a client’s medical history. The personalized application captures information upfront for faster underwriting decisions and coverage. As a result, clients may receive a digital underwriting decision within minutes of submission.

## CLIENT-DRIVEN PART II

We understand discussing sensitive information with another person is not always easy for the client and, at times, can limit the amount of information the proposed insured is willing to disclose. But we also know that field underwriting is still needed to ensure you are setting the correct expectations with the client.

The client collaboration process helps ensure the required application information is received. This optional process allows the proposed insured or their legal guardian (if the proposed insured is a juvenile) to complete the personal and medical history Part II, without having specifics of medical and nonmedical conditions disclosed with someone else. The client collaboration feature may be helpful when working with clients who are uncomfortable or ill-prepared to discuss their medical history. Providing clients this option may reduce your face-to-face time with the client and encourage more thorough and candid responses from clients.

## FRAUD WARNING

Any person who knowingly represents a false statement in an application for insurance may be guilty of a criminal offense and subject to penalties under state law.

Transamerica may complete Post Issue Audits on cases to validate our underwriting assessments. If we develop material misrepresentation, we reserve the right to rescind the policy within the contestable period and deny future coverage.

For Agent Use Only. Not for Use With the Public.

3

---

# UNDERWRITING REQUIREMENTS

**All requirements will be ordered through Transamerica and administered through Transamerica-approved vendors.**

As we move to a new world of an enhanced consumer experience, there will be times when not all the traditional evidence will be necessary to determine your customer's insurability. As a result, Transamerica will order all necessary underwriting evidence for your customer, reducing the burden as well as ensuring we only get the necessary information to understand your customer's risk profile. This change in process will allow us to help expedite the ordering of the most relevant information the first time and drive down the time it takes to make a decision.

## VITALS AND PARAMED PHYSICAL FINDINGS

When required, paramed physical findings are ordered by the home office and are completed by an approved third-party vendor. The process includes a qualified examiner completing proper paperwork/forms, taking vitals (height, weight, blood pressure, pulse), collecting fluids (blood and urine), and administering ECGs (if applicable).

## HOME OFFICE SPECIMEN (HOS)

A home office specimen is a urine sample collected during the paramed physical findings visit and sent to a laboratory for analysis.

## BLOOD CHEMISTRY PROFILE (BCP)

A blood chemistry profile is a venous blood draw collected during the paramed physical findings visit and sent to a laboratory for analysis.

AccessMyHealth™ is a web portal that allows clients to access the results of their blood, urine, and paramed physical findings tests, taken in connection with their life insurance application. When the client completes their labs or paramed physical findings test, they can opt in to receiving text message notifications.* Once their results are ready to be accessed (up to seven days after completion for labs), the client will receive a text message with a link to the AccessMyHealth™ web portal. From there, the client can register to obtain their results using their phone number and date of birth.

Visit AccessMyHealth: transamerica.accessmyhealth.com

* AccessMyHealth™ does not have the ability to call international phone numbers.
Lab report is available for 12 months from the date the sample was received at the laboratory.

For Agent Use Only. Not for Use With the Public.

4

---

****RESTING ELECTROCARDIOGRAM (ECG)****

During an electrocardiogram (when required), small patches are placed on the chest, arms, and legs to record the electrical activity and rhythm of the heart. If normal resting ECG records are available from a test conducted within the last 12 months, the test does not need to be repeated upon provision of the test results.

****MINNESOTA COGNITIVE ACUITY SCREEN (CS)****

The Minnesota Cognitive Acuity Screen is a telephone interview conducted by a registered nurse (RN), who is specifically trained to administer the test. The purpose of this test is to screen for potential early cognitive impairment. Proposed insureds age 70 and older that are also applying for the LTC Rider will be required to complete a face to face CS.

It is important your client realizes the significance of the interview and concentrate to do as well as they can. Your client should be in an environment that is free of distractions. If they wear a hearing aid, they should have it on during the interview. The telephone interview usually takes 15-20 minutes.

Family, friends, or agent can be present, but they must be in a separate room during the cognitive interview, not interacting at all with the proposed insured in any way during the CS.

****INSPECTION REPORTS (IR, BBIR, EIR)****

Inspection Reports provide a holistic view of the proposed insured's public record, including such information as financials, criminal records history, properties owned, and bankruptcies. Inspection

reports may be completed as a telephone interview or by online database searches, depending on the amount being applied for.

****PERSONAL FINANCIAL STATEMENTS (PFS)****

A Financial Supplement to Application for Life Insurance (also known as a Confidential Financial Questionnaire) will be requested on larger face amounts or/if:

- The income and net worth of proposed insured is not provided on the application
- The company finds the financial information unclear, inconsistent, or additional details are needed
- Or/if the insurance is being used for business coverage on amounts of $5 million and higher, including Buy-Sell, Loan, and Key Person applications

****MOTOR VEHICLE REPORTS****

A motor vehicle report (MVR) is a record of a proposed insured's driving history.

****CRIMINAL BACKGROUND CHECK****

A criminal history background check may be ordered and is a database search of court records.

****PRESCRIPTION AND MEDICAL DATA CHECK****

A prescription and medical data check will be ordered on every application and includes details on prescriptions filled, medical diagnoses, hospital and physician procedures, inpatient and clinic administered medications, and medical equipment information — as well as prescribing physician's information. Your client can request a copy of their report at rxhistories.com.

For Agent Use Only. Not for Use With the Public.

5

---

## IDENTITY VERIFICATION

An identity verification is primarily used to verify the identities of our customers and ensure our quality of business, manage identity risk, prevent identity fraud, and comply with obligations under the USA Patriot Act. In some instances, we may request a copy of the individual's Social Security card, driver's license or other state-issued ID, or utility bill to help verify an individual's identity.

## TAX RETURN TRANSCRIPT

IRS Form 4506-C is an Internal Revenue Service (IRS) form that gives permission for Transamerica to receive a transcript of previously filed tax returns directly from the IRS. This pre-filled form is obtained through your agent portal or through the application submission process to expedite processing.

## ATTENDING PHYSICIAN STATEMENTS (APS)

An attending physician statement is a copy of the proposed insured's medical records obtained from their attending physician or healthcare provider. APS may be required based on age and/or face amount.

## TRANSAMERICA ORDERS ALL REQUIREMENTS

Please refer to age and face amount chart on the next pages. Transamerica will order all requirements through Transamerica-approved vendors.

Application will close in iPipeline® at 45 days. The agent receives an email to finalize the case four times prior to the case closing.

## AN APPLICATION IS VALID FOR 180 DAYS

Cases will close after 60 days if there are outstanding requirements. A new application will be needed after 180 days. Underwriting may reorder fast data requirements and/or request a statement of good health on delivery depending on the age of the requirements at time of decision.

## HOW LONG ARE UNDERWRITING REQUIREMENTS VALID?

|  REQUIREMENTS | UP TO AGE 70 | AGE 71 AND OLDER  |
| --- | --- | --- |
|  Paramed-Physical Findings | Valid for 1 year | Valid for 6 months  |
|  Teleinterview^{1} | Valid for 90 days | Valid for 90 days  |
|  Resting Electrocardiogram (ECG) | Valid for 1 year | Valid for 1 year  |
|  Inspection Report (IR) | Valid for 1 year | Valid for 1 year  |
|  Financial Supplement to Application for Life Insurance | Valid for 1 year | Valid for 1 year  |
|  Home Office Urine Specimen (HOS) | Valid for 1 year | Valid for 6 months  |
|  Blood Chemistry Profile (BCP) | Valid for 1 year | Valid for 6 months  |
|  Minnesota Cognitive Acuity Screen (CS) | N/A | Valid for 6 months  |

$^{1}$ Only ordered on paper applications

## APS GUIDELINES ARE AS FOLLOWS:

|  FACE AMOUNTS  |   |   |   |
| --- | --- | --- | --- |
|  Age | Up to and including $1 million | > $1 million to $3 million | Over $3 million  |
|  0-17 | YES^{1} | YES^{1} | N/A  |
|  18-50 | NOT ROUTINELY (for cause or for exam within the past 3 months not marked within normal limits)^{2} | NOT ROUTINELY (for cause or for exam within the past 3 months not marked within normal limits)^{2} | YES Will be required on all applications^{3}  |
|  51-60 | NOT ROUTINELY (for cause or for exam within the past 3 months not marked within normal limits)^{2} | NOT ROUTINELY (for cause or for exam within the past 3 months not marked within normal limits)^{2} | YES Will be required on all applications  |
|  61-69 | NOT ROUTINELY (for cause or for exam within the past 12 months not marked within normal limits)^{2} | YES Within the last 5 years for preferred classes and has an established primary care physician | YES Within the last 5 years for preferred classes and has an established primary care physician  |
|  70 and older | YES^{4} | YES^{4} | YES^{4}  |

$^{1}$ APS ordered on amounts > $500,000 through maximum $2 million total line considered.

$^{2}$ An APS is not needed on routine screening or annual exams if noted to be within normal limits, unless needed due to medical history.

$^{3}$ Individual consideration up to and including $5 million (and under age 50) if applicant has not seen an M.D. in more than three years.

$^{4}$ Ages 70-79, all rate classes available if seen in the last 24 months by primary care physician, otherwise limited to standard at best.

All third-party requirements will be ordered by Transamerica.

For Agent Use Only. Not for Use With the Public.

6

---

# AGE AND FACE AMOUNT REQUIREMENTS

Trendsetter® Super and Trendsetter® LB 1,2

|  FACE AMOUNTS 3, 4, 7, 9, 10, 11 |   | ISSUE AGE 5, 6, 8  |   |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  Min. | Max. | 18-40 12 | 41-45 | 46-55 | 56-60 | 61-70 | 71-75 | 76-80  |
|  $25,000 | $50,000 | * | * | * | * | * | Vitals BCP HOS MVR | Vitals BCP HOS MVR  |
|  $50,001 | $99,999 | * | * | * | * | Vitals BCP HOS | Vitals BCP HOS MVR | Vitals BCP HOS MVR  |
|  $100,000 | $249,999 | * MVR | * | * | Vitals BCP HOS | Vitals BCP HOS | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR  |
|  $250,000 | $500,000 | * MVR | * MVR | * MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR  |
|  $500,001 | $1,000,000 | * MVR | * MVR | * MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR  |
|  $1,000,001 | $2,000,000 | * MVR | * MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS CS PFS MVR | Vitals BCP HOS ECG CS PFS MVR  |
|  $2,000,001 | $3,500,000 | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS CS PFS MVR | Vitals BCP HOS ECG CS PFS MVR  |
|  $3,500,001 | $5,000,000 | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS CS PFS MVR | Vitals BCP HOS ECG CS PFS MVR  |
|  $5,000,001 | $10,000,000 | Vitals BCP HOS PFS MVR | Vitals BCP HOS PFS MVR | Vitals BCP HOS PFS MVR | Vitals BCP HOS PFS MVR | Vitals BCP HOS PFS MVR | Vitals BCP HOS ECG CS PFS MVR | Vitals BCP HOS ECG CS PFS MVR  |
|  $10,000,001 | and higher | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR  |

* Highlighted cells indicate potential eligibility for fluidless processing.

1 Applicants receiving a digital underwriting decision will not be reconsidered for a better rate classification.

2 Transamerica reserves the right to request additional evidence of insurability.

3 Requests to reduce face amount received during Underwriting will not alter the medical requirements.

4 Paper applications require a Vendor conducted Tele-interview.

5 Trendsetter LB band on ($25,000-$99,999) is not available for ages 18-22 and ages 60 and up.

6 CS required at age 70 on amounts ≥ $100,000.

7 IRS Form 4506-C is required with all applications ≥ $5,000,000 or at Underwriter discretion.

8 Term lengths are not available at all ages.

9 Electronic Inspection Report (EIR) ordered on all face amounts > $5,000,000 through age 70 and face amounts > $3,000,000 ages 71 and up.

10 Business Beneficiary Inspection Report (BBIR) ordered for business coverage > $5,000,000.

11 Cover Letters and third-party financial verification required for face amounts ≥ $10,000,000 and/or total line over jumbo limits.

12 Trendsetter LB maximum face amount is $2,000,000.

Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at the time of the application, we reserve the right to rescind the policy.

For Agent Use Only. Not for Use With the Public.

7

---

# AGE AND FACE AMOUNT REQUIREMENTS

*Transamerica Financial Choice IUL$^{SM}$ II*$^{1, 2}$

|  FACE AMOUNTS^{3, 4, 8, 9, 10, 11} |   | ISSUE AGE^{7}  |   |   |   |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  Min. | Max. | 0-17^{1, 4} | 18-40 | 41-45 | 46-55 | 56-60 | 61-70 | 71-75 | 76-80 | 81-85  |
|  $250,000 | $500,000 | * MVR | * MVR | * MVR | * MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals HOS CS MVR | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR  |
|  $500,001 | $1,000,000 | * MVR | * MVR | * MVR | * MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR  |
|  $1,000,001 | $2,000,000 | * MVR | * MVR | * MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS PFS CS MVR | Vitals BCP HOS CS PFS MVR | Vitals BCP HOS ECG CS PFS MVR  |
|  $2,000,001 | $3,500,000 | N/A | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS CS MVR PFS | Vitals BCP HOS CS PFS MVR | Vitals BCP HOS ECG CS PFS MVR  |
|  $3,500,001 | $5,000,000 | N/A | Vitals BCP HOS MVR IR | Vitals BCP HOS MVR IR | Vitals BCP HOS MVR IR | Vitals BCP HOS MVR IR | Vitals BCP HOS MVR IR | Vitals BCP HOS CS PFS MVR IR | Vitals BCP HOS CS PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR  |
|  $5,000,001 | $10,000,000 | N/A | Vitals BCP HOS PFS MVR IR | Vitals BCP HOS PFS MVR IR | Vitals BCP HOS PFS MVR IR | Vitals BCP HOS PFS MVR IR | Vitals BCP HOS PFS MVR IR | Vitals BCP HOS CS PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR  |
|  $10,000,001 | and higher | N/A | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR  |

\* Highlighted cells indicate potential eligibility for fluidless processing.

$^{1}$ Applicants receiving a digital underwriting decision will not be reconsidered for a better rate classification.

$^{2}$ Transamerica reserves the right to request additional evidence of insurability.

$^{3}$ Requests to reduce face amount received during Underwriting will not alter the medical requirements.

$^{4}$ Paper applications require a Vendor conducted Tele-interview.

$^{5}$ Juvenile must reside in the U.S. for consideration.

$^{6}$ MVR ordered at ages 16 and 17 for juveniles with a valid driver's license.

$^{7}$ CS required at age 70.

$^{8}$ IRS Form 4506-C is required with all applications ≥ $5,000,000 or at Underwriter discretion.

$^{9}$ Electronic Inspection Report (EIR) ordered on all face amounts > $5,000,000 through age 70 and face amounts > $3,000,000 ages 71 and up.

$^{10}$ Business Beneficiary Inspection Report (BBIR) ordered for business coverage > $5,000,000.

$^{11}$ Cover Letters and third-party financial verification required for face amounts ≥ $10,000,000 and/or total line over jumbo limits.

Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at the time of the application, we reserve the right to rescind the policy.

For Agent Use Only. Not for Use With the Public.

8

---

# AGE AND FACE AMOUNT REQUIREMENTS

Transamerica Financial Foundation IUL® II ¹,²

|  FACE AMOUNTS ³,⁴,⁹,¹⁰,¹¹,¹² |   | ISSUE AGE ⁷,⁸  |   |   |   |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  Min. | Max. | 0-17 ¹,⁶ | 18-40 | 41-45 | 46-55 | 56-60 | 61-70 | 71-75 | 76-80 | 81-85  |
|  $25,000 | $50,000 | * MVR | * MVR | * | * | * | Vitals BCP HOS | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR  |
|  $50,001 | $75,000 | * MVR | * MVR | * | * | * | Vitals BCP HOS | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR  |
|  $75,001 | $99,999 | * MVR | * MVR | * | * | Vitals BCP HOS | Vitals BCP HOS | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR  |
|  $100,000 | $249,999 | * MVR | * MVR | * | * | Vitals BCP HOS | Vitals BCP HOS | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR  |
|  $250,000 | $500,000 | * MVR | * MVR | * MVR | * MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR  |
|  $500,001 | $1,000,000 | * MVR | * MVR | * MVR | * MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR | Vitals BCP HOS CS MVR  |
|  $1,000,001 | $2,000,000 | * MVR | * MVR | * MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS CS PFS MVR | Vitals BCP HOS CS PFS MVR | Vitals BCP HOS ECG CS PFS MVR  |
|  $2,000,001 | $3,500,000 | N/A | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS MVR | Vitals BCP HOS CS PFS MVR | Vitals BCP HOS CS PFS MVR | Vitals BCP HOS ECG CS PFS MVR  |
|  $3,500,001 | $5,000,000 | N/A | Vitals BCP HOS MVR IR | Vitals BCP HOS MVR IR | Vitals BCP HOS MVR IR | Vitals BCP HOS MVR IR | Vitals BCP HOS MVR IR | Vitals BCP HOS CS PFS MVR IR | Vitals BCP HOS CS PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR  |
|  $5,000,001 | $10,000,000 | N/A | Vitals BCP HOS PFS MVR IR | Vitals BCP HOS PFS MVR IR | Vitals BCP HOS PFS MVR IR | Vitals BCP HOS PFS MVR IR | Vitals BCP HOS PFS MVR IR | Vitals BCP HOS CS PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR  |
|  $10,000,001 | and higher | N/A | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR | Vitals BCP HOS ECG CS PFS MVR IR  |

* Highlighted cells indicate potential eligibility for fluidless processing.

¹ Applicants receiving a digital underwriting decision will not be reconsidered for a better rate classification.

² Transamerica reserves the right to request additional evidence of insurability.

³ Requests to reduce face amount received during Underwriting will not alter the medical requirements.

⁴ Paper applications require a Vendor conducted Tele-interview.

⁵ Juvenile must reside in the U.S. for consideration.

⁶ MVR ordered at ages 16 and 17 for juveniles with a valid driver's license.

⁷ CS required at age 70 on face amounts ≥ $100,000.

⁸ If LTC Rider is applied for, the Cognitive Screen (CS) is a face-to-face assessment.

⁹ IRS Form 4506-C is required with all applications ≥ $5,000,000 or at Underwriter discretion.

¹⁰ Electronic Inspection Report (EIR) ordered on all face amounts > $5,000,000 through age 70 and face amounts > $3,000,000 ages 71 and up.

¹¹ Business Beneficiary Inspection Report (BBIR) ordered for business coverages > $5,000,000.

¹² Cover Letters and third-party financial verification required for face amounts ≥ $10,000,000 and/or total line over jumbo limits.

Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at the time of the application, we reserve the right to rescind the policy.

For Agent Use Only. Not for Use With the Public.

9

---

# AVAILABLE RIDERS AND BENEFITS BY PRODUCT

|  PRODUCT | ACCIDENTAL DEATH BENEFIT (ADB) RIDER | BASE INSURED RIDER (BIR)^{1,2} | CHILDREN'S BENEFIT RIDER/ CHILDREN'S INSURANCE RIDER (CBR/CIR)^{1} | CHRONIC ILLNESS RIDER^{1} | CRITICAL ILLNESS RIDER^{1} | DISABILITY WAIVER OF PREMIUM (DWP) RIDER^{1}  |
| --- | --- | --- | --- | --- | --- | --- |
|  *Trendsetter® Super* | Yes | N/A | Yes | N/A | N/A | Yes  |
|  *Trendsetter® LB* | Yes | N/A | Yes | Yes^{3} | Yes^{3} | Yes  |
|  FFIUL II | Yes | Yes | Yes | Yes | Yes | Yes  |
|  FCIUL II | Yes | Yes | Yes | Yes | Yes | Yes  |

|  PRODUCT | ADDITIONAL SERVICES RIDER^{1} / EVEREST | GUARANTEED INSURABILITY (GIR) RIDER | INCOME PROTECTION OPTION (IPO) RIDER | LONG TERM CARE (LTC) RIDER^{1} | MONTHLY DISABILITY INCOME (MDI)^{1} | TERMINAL ILLNESS RIDER/ ACCELERATED DEATH BENEFIT | DISABILITY WAIVER OF MONTHLY DEDUCTIONS RIDER^{1}  |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  *Trendsetter Super* | N/A | N/A | Yes | N/A | N/A | Yes^{3} | N/A  |
|  *Trendsetter LB* | N/A | N/A | Yes | N/A | Yes | Yes^{3} | N/A  |
|  FFIUL II | Yes | Yes | Yes | Yes | N/A | Yes^{3} | Yes  |
|  FCIUL II | Yes | N/A | Yes | N/A | N/A | Yes^{3} | Yes  |

$^{1}$ Additional Underwriting may be required.

$^{2}$ Amount of Base Insured Rider (BIR) should be added to the base face amount to determine initial age/amount requirements.

$^{3}$ Rider is inherent in product.

$^{4}$ In California, Florida, and Maryland, this is known as the *Concierge Planning Benefit*$^{1}$.

Note: Not all riders are available in every state.

For Agent Use Only. Not for Use With the Public.

10

---

# ADDITIONAL RIDER INFORMATION

## ACCIDENTAL DEATH BENEFIT RIDER (ADB)

Provides an additional death benefit if the primary insured dies as a result of an accident, or if the death occurs within 180 days of accidental bodily injury

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  15-55 years (IUL); 18-55 years (term) | - - Not available if base is higher than Table D - - Total benefit in force cannot exceed $300,000 with all Transamerica policies  |

## ADDITIONAL SERVICES RIDER

Marketed as the *Concierge Planning Rider*$^{SM}$, this rider provides funeral concierge services through an independent, third-party service provider, Everest Funeral Package, LLC (Everest$^{1}$). Availability of the additional services rider is subject to state approval and it is not available in all states. In California, Florida, and Maryland, this benefit is called the *Concierge Planning Benefit*$^{SM}$. In those states, the benefits services are not provided through a contractual rider; they are offered outside of the life insurance policy.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  Same as base policy | - - Minimum face amount $250,000 - - No maximum face amount. Expedited claims payout process not qualified at $2 million and above.  |

## BASE INSURED RIDER (BIR)

Provides additional level term insurance coverage at term insurance rates on the primary insured

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  18-85 years, varies by rate class and writing state | - - Available at time of issue, may be added after issue if no Long Term Care Rider is present, subject to Underwriting - - Minimum face amount $100,000 - - Maximum face amount varies depending on LTC Rider  |

## CHILDREN'S BENEFIT RIDER/CHILDREN'S INSURANCE RIDER (CBR/CIR)

Pays level death benefit upon death of any children of the insured. Rider is not rated.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  15 days to 18 years old (actual age of child) 18-80 years old insured | - - Children with a risk profile greater than Table B will not be accepted for coverage - - Minimum $1,000 CIR/CBR; max lesser of $99,000 or total coverage on the primary insured  |

## CHRONIC ILLNESS RIDER

If the insured becomes chronically ill, they may elect to receive a portion of the death benefit that can be accelerated in advance of death. The insured must have the inability to perform at least two of the six activities of daily living for a period of 90 consecutive days or have a severe cognitive impairment.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  Varies by risk class, product, and issue state | - - Not available if base is higher than Table D - - Not available if base is rated higher than $2.50 flat extra - - The sum of all living benefit coverages (including Chronic Illness Rider), under all Transamerica policies, cannot exceed the lesser of 90% of the available death benefit or $1,500,000 - - Electable at issue, not automatically attached to the base product - - Underwriting reserves the right to deny coverage under the Chronic Illness Rider on individuals with certain pre-existing conditions, impairments, or diseases. - - Not available with the LTC Rider - - Not available to Medicaid recipients  |

## CRITICAL ILLNESS RIDER

If the insured suffered a critical health condition (state specific) while the policy and rider are in effect, they may elect to receive an accelerated death payment subject to certain provisions.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  Varies by risk class, product, and issue state | - - Not available if base is higher than Table D - - Not available if base is rated higher than $2.50 flat extra - - The sum of all living benefit coverages (including Chronic Illness Rider), under all Transamerica policies, cannot exceed the lesser of 90% of the available death benefit or $1,500,000 - - Electable at issue, not automatically attached to the base product - - Underwriting reserves the right to deny coverage under the Critical Illness Rider on individuals with certain pre-existing conditions, impairments, or diseases.  |

Note: Not all riders are available in every state.

$^{1}$ All services are offered by Everest, which is not an affiliate of Transamerica.

For Agent Use Only. Not for Use With the Public.

11

---

# ADDITIONAL RIDER INFORMATION

## DISABILITY WAIVER OF MONTHLY DEDUCTIONS

The benefit waives monthly deductions for the base and all riders if the base insured is disabled prior to age 65.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  18-55 years | - Not available if base is rated higher than Table D - Flat extras are allowed up to $2.50  |

## DISABILITY WAIVER OF PREMIUM (DWP) RIDER

Provides premium into the policy if the base insured becomes totally disabled and remains totally disabled for at least six months. A retroactive payment will be made for the number of months following the date of total disability for up to one year.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  18-55 years | - Not available if base is rated higher than Table D - Flat extras up to $2.50 allowed - $5 million maximum aggregate face amount across all Transamerica policies  |

## GUARANTEED INSURABILITY RIDER (GIR)

This benefit provides the opportunity to buy a new policy or increase a specified amount at certain defined ages and/or events with no underwriting.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  0-37 years old; issue age must be at least 15 days old | - Not available if base is rated - Not available with the Disability Waiver of Monthly Deductions Rider - Not available with the Long Term Care Rider  |

## INCOME PROTECTION OPTION (IPO)

The owner can choose to have the death benefit paid out in any combination of an initial lump sum, monthly payments, and a final lump sum (after the monthly payments). If the policy's death benefit at the time of death is greater than the Total Face Amount, the excess will be paid as a lump sum in addition to any initial lump-sum payment amount. If the death benefit is less than the Total Face Amount, all designated payment amounts will be proportionately reduced.

Note: Not all riders are available in every state.

## LONG TERM CARE (LTC) RIDER

Designed to accelerate payment of the face amount of the base policy to provide policy owners with certain benefits to help offset expenses that arise in connection with long term care for the insured. Provides a benefit for long term care equal to the base face amount. The LTC Rider rate class is the same as the base policy. See the LTC Rider Agent guide for additional details.

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  18-75 years, subject to policy issue age maximums | - Not available if base is rated over Table D or $2.50/1,000 - Not available if base is rated over Table D or with a flat extra over $2.50/1,000 - Minimum face amount $100,000 - Maximum face amount varies depending on Base Insured Rider elected - Not available with the Chronic Illness Rider - Underwriting reserves the right to deny coverage under the LTC Rider on individuals with certain pre-existing conditions, impairments, or diseases  |

|  ISSUE AGES: | INITIAL LTC U/W REQUIREMENTS:  |
| --- | --- |
|  18-65 | Medical Information Bureau (MIB), Prescription History (RX)  |
|  66-69 | Medical Information Bureau (MIB), Medical Records, Prescription History (RX)  |
|  70-75 | Face-to-Face Assessment (F2F), Medical Information Bureau (MIB), Medical Records, Prescription History (RX)  |

## MONTHLY DISABILITY INCOME (MDI) RIDER

Provides a monthly income to the insured in the event the insured becomes totally disabled

|  ISSUE AGES: | ISSUE LIMITS:  |
| --- | --- |
|  18-50 years | - Not available if base is rated - Available only at time of issue - Offers up to $2,000 per month in disability income protection with a 2-year benefit period - Certain occupations are ineligible for coverage  |

## TERMINAL ILLNESS ACCELERATED DEATH BENEFIT RIDER

While the policy is in force and conditions are met, we will pay an Accelerated Death Benefit (Terminal Illness only) upon request (life expectancy less than 12 months), minus the loan balance, minus an administrative charge, and minus any amount necessary to provide insurance to the date of the Accelerated Death Benefit payment if we make the payment during a grace period.

This rider is automatically attached to all new issues and is not rated.

For Agent Use Only. Not for Use With the Public.

12

---

# BLENDED BODY MASS INDEX (BMI) CHARTS

|  AGES 16-59  |   |   |
| --- | --- | --- |
|  BMI RANGE | TRENDSETTER* SUPER TRENDSETTER* LB | FFIUL II/FFIUL FCIUL II/FCIUL  |
|  </= 16 | Decline | Decline  |
|  16.0001-17.0000 | Standard (S/NS) | Nontobacco & Tobacco  |
|  17.0001-28.0000 | Preferred Plus | Preferred Elite  |
|  28.0001-30.0000 | Preferred (S/NS) | Preferred Plus/Preferred Tobacco  |
|  30.0001-32.0000 | Standard Plus | Preferred  |
|  32.0001-35.0000 | Standard (S/NS) | Nontobacco & Tobacco  |
|  35.0001-37.0000 | Table A | Table A  |
|  37.0001-39.0000 | Table B | Table B  |
|  39.0001-41.0000 | Table C | Table C  |
|  41.0001-42.0000 | Table D | Table D  |
|  42.0001-43.0000 | Table E | Table E  |
|  43.0001-44.0000 | Table F | Table F  |
|  44.0001-46.0000 | Table H | Table H  |
|  >46 | Decline | Decline  |

In order to calculate Adult BMI, please click here.

|  AGES 60+  |   |   |
| --- | --- | --- |
|  BMI RANGE | TRENDSETTER SUPER TRENDSETTER LB | FFIUL II/FFIUL FCIUL II/FCIUL  |
|  </= 16 | Decline | Decline  |
|  16.0001-18.0000 | Individual Consideration | Individual Consideration  |
|  18.0001-28.0000 | Preferred Plus | Preferred Elite  |
|  28.0001-30.0000 | Preferred (S/NS) | Preferred Plus/Preferred Tobacco  |
|  30.0001-32.0000 | Standard Plus | Preferred  |
|  32.0001-35.0000 | Standard (S/NS) | Nontobacco & Tobacco  |
|  35.0001-37.0000 | Table A | Table A  |
|  37.0001-39.0000 | Table B | Table B  |
|  39.0001-41.0000 | Table C | Table C  |
|  41.0001-42.0000 | Table D | Table D  |
|  42.0001-43.0000 | Table E | Table E  |
|  43.0001-44.0000 | Table F | Table F  |
|  44.0001-46.0000 | Table H | Table H  |
|  >46 | Decline | Decline  |

## JUVENILE — AGES 2 THROUGH 15*

|  AGE | JUVENILE STANDARD  |
| --- | --- |
|  2 | 13.9-30.0  |
|  3 | 13.9-29.0  |
|  4 | 12.9-29.0  |
|  5 | 12.9-29.0  |
|  6 | 12.9-29.0  |
|  7 | 12.9-30.0  |
|  8 | 12.9-31.0  |
|  9 | 12.9-32.0  |
|  10 | 12.9-33.0  |
|  11 | 13.9-34.0  |
|  12 | 13.9-35.0  |
|  13 | 14.9-36.0  |
|  14 | 14.9-37.0  |
|  15 | 15.9-38.0  |

In order to calculate Juvenile BMI, please click here.

* Ages under two years old generally OK unless premature. Ages over 15 — see adult body mass index charts.

For Agent Use Only. Not for Use With the Public.

13

---

# UNDERWRITING TIPS

## LIVING BENEFIT COVERAGE

Certain medical conditions will impact an individual's eligibility for living benefit coverage, and Transamerica reserves the right to decline living benefit riders or products based on an individual's medical history.

The following are some conditions that may not be eligible for chronic illness and/or critical illness living benefit coverage (this list is not all-inclusive):

- Drug and alcohol abuse
- Cancer (other than nonmelanoma skin cancer)
- Coronary artery disease
- Diabetes with insulin use
- Inability to perform activities of daily living (ADL's)
- Motor neuron disease
- Multiple sclerosis
- Muscular dystrophy
- Parkinson's disease
- Stroke or transient ischemic attack
- Systemic lupus erythematosus

Do Not Use Dine Norms Use With the Public.

14

---

# DETERMINING COVERAGE AMOUNTS FOR INDIVIDUALS

|  PURPOSE | FORMULA |   | REQUIREMENTS  |
| --- | --- | --- | --- |
|  Income replacement | Ages | Income Factor | - Income stated must be reasonable for the stated occupation. - Income source considered will be that of the proposed insured, not the household income or that of the policy owner. - Earned income includes salary, bonuses, commissions, and deferred compensation and excludes income from investments.  |
|   |  18-35 | 40  |   |
|   |  36-70 | 75 minus current age  |   |
|   |  71+ | Individual consideration  |   |

|  PURPOSE | COVERAGE AMOUNT | REQUIREMENTS  |
| --- | --- | --- |
|  Non-income earning spouse/partner | Up to $500,000 | - Household income - Total line of insurance in force - All requirements as indicated above for face amounts through $500,000, plus: - Household net worth - Spouse/partner total line of personal coverage in force - Up to equal coverage of income-earning spouse/partner  |
|   |  $500,001-$5,000,000 IC for amounts > $5,000,000  |   |

|  PURPOSE | COVERAGE AMOUNT | REQUIREMENTS  |
| --- | --- | --- |
|  College student | Up to $2,000,000 | - Annual earned income - Total line of coverage in force - Depending on amount applied for, we may ask for graduation date and field of study  |

|  PURPOSE | FORMULA |   | REQUIREMENTS  |
| --- | --- | --- | --- |
|  Estate planning - projected future estate tax liability | Ages | Maximum projection years | - A current value of the applicant's estate, which includes a personal balance sheet listing all assets and liabilities and an estate analysis - The estate projection rate and/or number of projected years may be adjusted, up or down, taking into consideration what is reasonable in the current environment  |
|   |  18-50 | 25  |   |
|   |  51-60 | 20  |   |
|   |  61-70 | 15  |   |
|   |  71-75 | 10  |   |
|   |  76+ | 5  |   |

For Agent Use Only. Not for Use With the Public.

15

---

# DETERMINING COVERAGE AMOUNTS FOR INDIVIDUALS

|  PURPOSE | FORMULA |   | REQUIREMENTS  |
| --- | --- | --- | --- |
|  Juvenile coverage | Ages | Coverage amount |   |
|  Total juvenile insurance coverage with all carriers cannot exceed $2,000,000. | 15 days through 17 years | Amounts through $250,000 | - Coverage on all siblings should be similar. - Parent(s) or Guardian(s) must witness the applications and complete the medical history declarations for the juvenile applicant. - The policy owner must be the parent, legal guardian, or grandparent. For legal guardianship where the guardian is not the parent, we require a copy of the guardianship papers. - The parent/legal guardian, juvenile, and owner must be residing in the U.S. permanently, either as a U.S. citizen or a visa type that is not considered temporary or uninsurable based on our international underwriting guidelines.  |
|   |   |  $250,001-$1,000,000 | **All requirements as indicated above for face amounts through $250,000, plus:** - Equal coverage* for parent(s) or legal guardian is allow up to $1,000,000.****For amounts $500,000 and greater:** - Underwriting will obtain the child's medical records. - Minimum household income must be ≥ $100,000.  |
|   |   |  $1,000,001-$2,000,000 | **All requirements as indicated above for face amounts through $1,000,000, plus:** - At least one parent or legal guardian needs to have 2x the total line of coverage, in force and applied for, pending, as the amount applied for on the juvenile.  |
|  Washington State | 15 days through 17 years | Total line of coverage cannot exceed the U.S. household income. | **All requirements as indicated above for the appropriate face amount, plus:** - Juveniles 15 years or older must sign the application.  |

For Agent Use Only. Not for Use With the Public.

16

---

# PREMIUM TO INCOME GUIDELINES

While each of your clients have different financial needs, these guidelines are intended to provide a general formula to help calculate suggested maximum amounts of life insurance.

- What does the client do for a living?
- What is their annual income and net worth?
- Do they already own a life insurance policy?
- If so, what is the face amount? Is it being replaced?
- What is the purpose of the life insurance being applied for?
- Do they have any medical issues that may result in a higher premium?

|  PURPOSE | FORMULA |   | REQUIREMENTS  |
| --- | --- | --- | --- |
|  **Affordability Guidelines** | Below Formula – Annual premium for all policies ÷ Annual income = %. The premium to income ratio should not exceed the percentages below. |   | - There should not be a significant adverse change in financial status or financial flexibility as a result of the purchase of the policy(ies). - For annual incomes less than $15,000, details supporting the need and purpose of the insurance may be necessary. Adjustments (upwards) for family size (when known) should be considered to align with U.S. Federal Poverty Guidelines published by the U.S. Department of Health & Human Services. - Premium affordability should be demonstrated for the total premiums being paid on all policies, by the payer(s). This includes all policies on the payer(s) life and all policies on the lives of others for which they are paying.  |
|   |  Annual Income | Premium to Income  |   |
|   |  ≤ $30,000 | 15%  |   |
|   |  > or = $30,001 | 20%  |   |

## HIGH NET WORTH APPLICANTS

In circumstances where the premiums exceed the above guidelines, such as a client with demonstrable high liquid assets and low/moderate income, further consideration beyond the guidelines may be given. A cover letter of explanation and supporting financial evidence will be required for face amounts $3 million and higher.

For Agent Use Only. Not for Use With the Public.

17

---

# DETERMINING COVERAGE AMOUNTS FOR BUSINESS PLANNING

|  PURPOSE | FORMULA |   | REQUIREMENTS  |
| --- | --- | --- | --- |
|  Key Person | Ages | Factor x Income | - The key person's value to the company - How the coverage amount was determined - Whether the key person has ownership in the company and the percentage of ownership - A list of all other key persons, the amount of key person coverage, and percentage ownership for each key person - Business Beneficiary Report (BBIR) on amounts > $5,000,000  |
|   |  Under 65 65+ | 10 5  |   |
|  Buy-Sell/Business Continuation | % Ownership x Corporate Value |   | - The fair market value of the business and how the amount of insurance was determined - A copy of the buy-sell agreement or the details of the buy-sell agreement - The proposed insured's ownership percentage, the number of other partners, and their ownership percentage - The amount of buy-sell coverage on each partner and the amount and purpose of all in force business coverage - Business Beneficiary Report (BBIR) on amounts > $5,000,000 All partners must apply for or have in force buy-sell coverage. Corporate balance sheets, income statements and/or business valuation may be requested at Underwriter discretion.  |
|  Business Loan | An amount up to the outstanding principal of the loan |   | - The business must be the owner of the policy - Cover letter must include the purpose, duration of the loan, collateral pledged, its value, and the loan interest rate - The term of the loan must be five years or more - If creditor is designated beneficiary, it should be stated 'as its interest may appear' with balance of proceeds to go to another designated personal beneficiary. A collateral assignment would also be acceptable. - Business Beneficiary Report (BBIR) on amounts > $5,000,000  |

For Agent Use Only. Not for Use With the Public.

18

---

# LIFESTYLE AND HEALTH HISTORY

## Impact on Risk Class

|  Trendsetter® Super Trendsetter® LB | Preferred Plus | Preferred Nonsmoker | Standard Plus | Nonmed Standard Nonsmoker (Trendsetter LB Bands 1&2 Only) | Standard Nonsmoker | Preferred Smoker | Nonmed Standard Smoker (Trendsetter LB Bands 1 & 2) | Standard Smoker  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  **FFIUL II & FCIUL II** | Preferred Elite | Preferred Plus | Preferred | N/A | Nontobacco | Preferred Tobacco | N/A | Tobacco  |
|  **Tobacco Usage^{1}** | None in the past 5 years | None in the past 2 years | None in the past 2 years | None in the past year | None in the past 2 years | Tobacco permitted | Tobacco permitted | Tobacco permitted  |
|  **Incidental cigar usage** | Available subject to: -Admitted on application -HOS neg for cotinine -No more than 1 per month | Available subject to: -Admitted on application -HOS neg for cotinine -No more than 1 per month | Available subject to: -Admitted on application -HOS neg for cotinine -No more than 1 per month | Available subject to: -Admitted on application -HOS neg for cotinine -No more than 1 per month | Available subject to: -Admitted on application -HOS neg for cotinine -No more than 1 per month | Permitted | Permitted | Permitted  |
|  **Cholesterol with or without treatment** | 230 | 260 | 300 | N/A | N/A | 260 | N/A | N/A  |
|  **Chol/HDL** | 5.0 for ages ≤70 | 5.5 for ages ≤70 | 6.2 for ages ≤70 | N/A | 7.0 for ages ≤70 | 5.5 for ages ≤70 | N/A | 7.0 for ages ≤70  |
|   |  5.5 for ages 71+ | 6.0 for ages 71+ | 6.7 for ages 71+ |  | 7.5 for ages 71+ | 6.0 for ages 71+ |  | 7.5 for ages 71+  |
|  **Blood pressure** | 135/85 for ages ≤70 | 145/85 for ages ≤70 | 148/88 for ages ≤70 | N/A | N/A | 145/85 for ages ≤70 | N/A | N/A  |
|   |  145/85 for ages 71+ | 150/90 for ages 71+ | 152/88 for ages 71+ | N/A | N/A | 150/90 for ages 71+ |  | N/A  |
|  **Treatment for blood pressure** | Through age 49: Without treatment Ages 50–80: With treatment, as long as readings fit criteria above Ages 81+: Without treatment | With or without treatment | With or without treatment | N/A | N/A | With or without treatment | N/A | N/A  |
|  **Family history^{2}** Ages 18–64 - Includes cardiovascular disease or the following cancers: breast, ovarian, melanoma, prostate, and colon - Some cancers may require evidence of routine surveillance screening | No Death in Parent or Sibling prior to age 60 | No Death in Parent or Sibling prior to age 60 | No more than one Parent or Sibling death prior to age 60 | N/A | N/A | No Death in Parent or Sibling prior to age 60 | N/A | N/A  |

$^{1}$ Tobacco usage is defined as using any tobacco products (cigarettes, cigars, chewing tobacco, nicotine patch/lozenge/gum, e-cigarettes, vapes (with or without nicotine)), etc., within the past 24 months.

$^{2}$ Some gender-specific cancers may qualify for preferred rates.

For Agent Use Only. Not for Use With the Public.

19

---

# LIFESTYLE AND HEALTH HISTORY

## Lifestyle and Health History — Impact on Risk Class

|  Trendsetter® Super Trendsetter® LB | Preferred Plus | Preferred Nonsmoker | Standard Plus | Nonmed Standard Nonsmoker (Trendsetter LB Bands 1 & 2 Only) | Standard Nonsmoker | Preferred Smoker | Nonmed Standard Smoker (Trendsetter LB Bands 1 & 2) | Standard Smoker  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  **FFIUL II & FCIUL II** | Preferred Elite | Preferred Plus | Preferred | N/A | Nontobacco | Preferred Tobacco | N/A | Tobacco  |
|  **Personal history** | No heart or vascular disease, diabetes, or cancer (except some skin cancers) | No heart or vascular disease, diabetes, or cancer (except some skin cancers) | No heart or vascular disease, diabetes, or cancer (except some skin cancers) | N/A | No ratable impairments | No heart or vascular disease, diabetes, or cancer (except some skin cancers) | N/A | No ratable impairments  |
|  **MVR - DUI** | None in the past 5 years |   |   | N/A | N/A | None in past 5 years | N/A | N/A  |
|  **MVR-serious violations** | No more than 1 serious violation in the past 3 years and NONE in the past 12 months | No more than 1 serious violation in past 3 years |   | N/A | N/A | No more than 1 serious violation in past 3 years | N/A | N/A  |
|  **MVR-minor violations** | Up to 2 minor violations within the last year |   |   | N/A | N/A | Up to 2 minor violations within the last year | N/A | N/A  |
|  **Private aviation** | N/A | Preferred can be offered with or without ratable aviation | Can be offered with or without ratable aviation | N/A | Available as qualifies | Preferred can be offered with or without ratable aviation | N/A | Available as qualifies  |
|  **Avocation (hazardous)^{1}** | No participation in activities listed below | No participation in activities listed below | No participation in activities listed below | N/A | Can be offered with or without ratable avocation | No participation in activities listed below | N/A | Can be offered with or without ratable avocation  |
|  **Alcohol/substance abuse** | No history or treatment at any time | No history or treatment at any time | No history or treatment in the past 10 years | N/A | No history or treatment in the past 7 years | No history or treatment at any time | N/A | No history or treatment in the past 7 years  |
|  **Citizenship/residence** | U.S. citizen or legal permanent resident/green card residing in the U.S. — all others, contact Underwriting for individual consideration  |   |   |   |   |   |   |   |
|  **Foreign travel (high risk)^{2}** | No traveling to dangerous areas of the world where the State Department has issued travel advisories.  |   |   |   |   |   |   |   |
|  **Military^{3}** | Active military duty is acceptable provided the proposed insured is not serving in a hazardous area or does not have orders to serve in a hazardous area.  |   |   |   |   |   |   |   |

$^{1}$ Avocation: Prohibited activities involving aeronautics (e.g., hang gliding, ultralight, soaring, skydiving, ballooning, etc.), power racing, competitive vehicles, mountain climbing, rodeos, competitive skiing, or scuba/skin diving at a depth greater than 75 feet. Individual consideration on a case-by-case basis — may or may not be eligible.

$^{2}$ Foreign travel: Unless otherwise prohibited by statute

$^{3}$ Military: Unless otherwise prohibited by statute

For Agent Use Only. Not for Use With the Public.

20

---

# MEDICAL IMPAIRMENTS

|  IMPAIRMENT | BEST POSSIBLE RATE CLASS AVAILABLE |   |   | RIDER AVAILABILITY  |   |
| --- | --- | --- | --- | --- | --- |
|   |  PREFERRED RATE CLASS | STANDARD RATE CLASS | DECLINE | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER / LONG TERM CARE RIDER  |
|  Impacted ADL's | Yes |  |  |  |   |
|  ADD/ADHD (age 8 and under) |  |  | Yes |  |   |
|  AIDS |  |  | Yes |  |   |
|  Alcoholism |  |  | Yes |  |   |
|  ALS (Lou Gehrig's disease) |  |  | Yes |  |   |
|  Alzheimer's disease/dementia |  |  | Yes |  |   |
|  Amputations, not due to disease | Yes |  |  | ✓ | ✓  |
|  Anemia | Yes |  |  | ✓ | ✓  |
|  Aneurysm |  | Yes |  |  |   |
|  Anxiety | Yes |  |  | ✓ | ✓  |
|  Arthritis, osteo | Yes |  |  | ✓ | ✓  |
|  Arthritis, rheumatoid |  | Yes |  | ✓ |   |
|  Asthma | Yes |  |  | ✓ | ✓  |
|  Atrial fibrillation |  | Yes |  | ✓ | ✓  |
|  Autism |  | Individual consideration |  | ✓ |   |
|  Barrett's esophagus |  | Yes |  | ✓ | ✓  |
|  Bell's palsy | Yes |  |  | ✓ | ✓  |
|  Bipolar disorder |  | Yes |  |  |   |
|  Blindness | Yes |  |  |  |   |
|  Benign Prostatic Hypertrophy (BPH) | Yes |  |  | ✓ | ✓  |
|  Broken bone | Yes |  |  | ✓ | ✓  |
|  Bronchitis, chronic (COPD) |  | Yes |  |  | ✓  |
|  Bundle branch block, right | Yes |  |  | ✓ | ✓  |
|  Bundle branch block, left |  | Yes |  | ✓ | ✓  |
|  Cancer (internal organ) |  | Yes |  | ✓ |   |
|  Cancer, skin (not melanoma) | Yes |  |  | ✓ | ✓  |
|  Cancer (undergoing treatment) |  |  | Yes |  |   |
|  Cardiomyopathy |  | Yes |  |  |   |
|  Cerebral palsy |  | Yes |  |  |   |
|  Cerebrovascular accident, stroke (CVA) |  | Yes |  |  |   |
|  Chronic fatigue syndrome | Yes |  |  | ✓ | ✓  |
|  Chronic obstructive pulmonary disorder (COPD) |  | Yes |  |  | ✓  |
|  Chronic pain |  | Yes |  | ✓ |   |
|  Cirrhosis |  |  | Yes |  |   |
|  Colitis, ulcerative |  | Yes |  |  |   |
|  Colitis, other than ulcerative | Yes |  |  | ✓ | ✓  |
|  Concussion (head injury) | Yes |  |  | ✓ | ✓  |

Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.

Potential morbidity assessments may differ.

MDIR - Some conditions for monthly disability income rider may require an exclusion for that condition.

For Agent Use Only. Not for Use With the Public.

21

---

# MEDICAL IMPAIRMENTS

|  IMPAIRMENT | BEST POSSIBLE RATE CLASS AVAILABLE |   |   | RIDER AVAILABILITY  |   |
| --- | --- | --- | --- | --- | --- |
|   |  PREFERRED RATE CLASS | STANDARD RATE CLASS | DECLINE | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER / LONG TERM CARE RIDER  |
|  Congestive heart failure (CHF) |  |  | Yes |  |   |
|  Coronary artery disease |  | Yes |  |  | ✓  |
|  Criminal activity | Yes |  |  | ✓ | ✓  |
|  Crohn's disease |  | Yes |  |  |   |
|  Cystic fibrosis |  |  | Yes |  |   |
|  Depression | Yes |  |  | ✓ | ✓  |
|  Diabetes |  | Yes |  | ✓ | ✓  |
|  Down syndrome |  |  | Yes |  |   |
|  Emphysema |  | Yes |  |  | ✓  |
|  Endocarditis |  | Yes |  | ✓ | ✓  |
|  Epilepsy (greater than age 3) |  | Yes |  | ✓ | ✓  |
|  Fibromyalgia, fibrositis | Yes |  |  | ✓ | ✓  |
|  Gastric banding, sleeve or bypass surgery | Yes |  |  | ✓ | ✓  |
|  Gastroesophageal reflux disease (GERD) | Yes |  |  | ✓ | ✓  |
|  Glomerulonephritis |  | Yes |  | ✓ | ✓  |
|  Headache, migraine or tension | Yes |  |  | ✓ | ✓  |
|  Heart attack |  | Yes |  |  | ✓  |
|  Heart, lung, or liver transplant |  |  | Yes |  |   |
|  Heart valve surgery |  | Yes |  |  | ✓  |
|  Hepatitis B |  | Yes |  |  |   |
|  Hepatitis C |  | Yes |  |  |   |
|  Hernia | Yes |  |  | ✓ | ✓  |
|  High blood pressure/hypertension | Yes |  |  | ✓ | ✓  |
|  Histoplasmosis |  | Yes |  | ✓ | ✓  |
|  Hodgkin's disease |  | Yes |  |  | ✓  |
|  Huntington's disease |  |  | Yes |  |   |
|  Hydronephrosis |  | Yes |  | ✓ | ✓  |
|  Kidney failure, dialysis |  |  | Yes |  |   |
|  Kidney removal | Yes |  |  | ✓ | ✓  |
|  Leukemia |  | Yes |  |  |   |
|  Lou Gehrig's disease (ALS) |  |  | Yes |  |   |
|  Lupus |  | Yes |  |  |   |
|  Marijuana use | Yes |  |  | ✓ | ✓  |
|  Melanoma (less than 2, including melanoma in situ) |  | Yes |  |  | ✓  |
|  Meniere's disease | Yes |  |  | ✓ | ✓  |
|  Meningioma | Yes |  |  | ✓ | ✓  |
|  Meningitis, history of | Yes |  |  |  | ✓  |

Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.

Potential morbidity assessments may differ.

MDIR - Some conditions for monthly disability income rider may require an exclusion for that condition.

For Agent Use Only. Not for Use With the Public.

22

---

# MEDICAL IMPAIRMENTS

|  IMPAIRMENT | BEST POSSIBLE RATE CLASS AVAILABLE |   |   | RIDER AVAILABILITY  |   |
| --- | --- | --- | --- | --- | --- |
|   |  PREFERRED RATE CLASS | STANDARD RATE CLASS | DECLINE | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER / LONG TERM CARE RIDER  |
|  Mental retardation and/or intellectual disability |  | Yes |  |  |   |
|  Mitral insufficiency, Mitral valve prolapse (MVP) |  | Yes |  | ✓ | ✓  |
|  Mitral stenosis |  | Yes |  | ✓ | ✓  |
|  Multiple sclerosis (MS) |  | Yes |  |  |   |
|  Muscular dystrophy |  | Yes |  |  |   |
|  Myasthenia gravis |  | Yes |  |  |   |
|  Myocarditis |  | Yes |  | ✓ | ✓  |
|  Nephrectomy | Yes |  |  | ✓ | ✓  |
|  Non-Hodgkin's lymphoma |  | Yes |  |  | ✓  |
|  Occupations with special hazards | Yes |  |  | ✓ | ✓  |
|  Pacemaker |  | Yes |  | ✓ | ✓  |
|  Pancreatitis (resolved) |  | Yes |  | ✓ | ✓  |
|  Paralysis, spinal cord injury |  | Yes |  |  |   |
|  Parkinson's disease |  | Yes |  |  |   |
|  Pericarditis |  | Yes |  | ✓ | ✓  |
|  Peripheral vascular disease (PVD) |  | Yes |  | ✓ |   |
|  Phlebitis, thrombosis, blood clot |  | Yes |  | ✓ | ✓  |
|  Pituitary adenoma |  | Yes |  | ✓ | ✓  |
|  Pleurisy | Yes |  |  | ✓ | ✓  |
|  Pregnancy, no history of or current complications | Yes |  |  | ✓ | ✓  |
|  Prostatitis, with normal PSA | Yes |  |  | ✓ | ✓  |
|  Psychosis |  | Yes |  |  |   |
|  Pulmonary fibrosis |  |  | Yes |  |   |
|  Pyelonephritis, acute | Yes |  |  | ✓ | ✓  |
|  Pyelonephritis, chronic |  | Yes |  |  |   |
|  Rheumatic fever, no heart complications | Yes |  |  | ✓ | ✓  |
|  Sarcoidosis |  | Yes |  | ✓ |   |
|  Schizophrenia |  | Yes |  |  |   |
|  Sleep apnea | Yes |  |  | ✓ | ✓  |
|  Stroke |  | Yes |  |  |   |
|  Suicide attempt (more than 2 years ago) |  | Yes |  |  |   |
|  Terminal illnesses |  |  | Yes |  |   |
|  Thyroid disorder | Yes |  |  | ✓ | ✓  |
|  Transient ischemic attack (TIA) |  | Yes |  |  |   |
|  Tuberculosis, recovered | Yes |  |  | ✓ | ✓  |
|  Tumors, benign | Yes |  |  | ✓ | ✓  |
|  Tumors, malignant, history of |  | Yes |  |  | ✓  |

Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.

Potential morbidity assessments may differ.

MDIR - Some conditions for monthly disability income rider may require an exclusion for that condition.

For Agent Use Only. Not for Use With the Public.

23

---

# MEDICAL IMPAIRMENTS

|  IMPAIRMENT | BEST POSSIBLE RATE CLASS AVAILABLE |   |   | RIDER AVAILABILITY  |   |
| --- | --- | --- | --- | --- | --- |
|   |  PREFERRED RATE CLASS | STANDARD RATE CLASS | DECLINE | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER / LONG TERM CARE RIDER  |
|  Ulcerative colitis |  | Yes |  |  |   |
|  Ulcer, stomach | Yes |  |  | ✓ | ✓  |
|  Vascular Ehlers-Danlos syndrome |  |  | Yes |  |   |
|  Wasting syndrome |  |  | Yes |  |   |

Rate classes shown are not guaranteed but are a best case scenario. Actual offer is subject to underwriting and may vary based on age, date of diagnosis, and severity of condition.

Potential morbidity assessments may differ.

MDIR - Some conditions for monthly disability income rider may require an exclusion for that condition.

For Agent Use Only. Not for Use With the Public.

24

---

THE PAST TRACK TO FASTER SALES

## CASE SCENARIOS

**Henry, a 55-year-old male**, was diagnosed with high blood pressure three years ago and has since been prescribed Ramipril. At his last doctor's appointment, he was 5 foot, 10 inches and 199 pounds, and he had a blood pressure reading of 136/86. He had a speeding ticket within the last year for driving 10 mph over the limit. Henry applied for a $1 million FFIUL II with Accidental Death Benefit and Disability Waiver of Premium Riders. He qualified for Preferred Elite.

**Tina, a 37-year-old accountant**, had a physical two years ago where her labs were drawn. The lab results showed high cholesterol and high triglycerides. She has since been diagnosed with hypercholesterolemia and was prescribed Atorvastatin. Tina is 5 foot, 7 inches and 192 pounds. She applied for a $75K 30-year *Trendsetter® Super* policy and got approved at Standard Plus due to her BMI of 30.1.

**Phil, a 72-year-old male**, was prescribed Donepezil for dementia treatment five years ago. He lives alone, requires no assistance, and has a clear driving record. He is 5 foot, 6 inches and 142 pounds. Phil applied for a $250K FFIUL II policy, but he was declined due to dementia treatment.

**Kim, a 23-year-old nurse**, was recently diagnosed with iron deficient anemia. The doctor was not concerned, thought it was due to her menstrual cycle and she was advised to take an iron supplement. Kim's on the smaller side at 5 feet, 3 inches and 120 pounds. She applied for a $1.5 million FCIUL II policy and got approved at a Preferred Elite risk class.

For Agent Use Only. Not for Use With the Public.

25

---

# SUBSTANDARD TABLE RATINGS

Substandard ratings may be attributable to health, occupation, or avocation characteristics that result in higher than average mortality risks.

Our competitive underwriting allows us to offer substandard table ratings using the following guide:

|  TABLE RATING GUIDE  |
| --- |
|  Standard = 100%  |
|  1/A = 125%  |
|  2/B = 150%  |
|  3/C = 175%  |
|  4/D = 200%  |
|  5/E = 225%  |
|  6/F = 250%  |
|  8/H = 300%  |

For Agent Use Only. Not for Use With the Public.

26

---

# WHAT IF THE CLIENT IS NOT A U.S. CITIZEN?

A client who is not a U.S. citizen may still qualify for life insurance coverage if they meet certain special requirements and comply with all relevant items (which may vary based on their status) listed below:

- • The client must have significant business and/or financial ties to the United States;
- • The client must present either a(n): Social Security number (SSN); Individual Tax Identification Number (ITIN/TIN); appropriate version of IRS Form W8 for those without an SSN or TIN; or (for the ITIN Program) IRS ITIN letter issued as a result of a W-7 Application;
- • The client must be physically present in the United States at the time of application;
- • ITIN applicants will require ITIN forms (CP565) or Social Security card. Submit copy with the file;
- • Visa holders: Indicate the specific visa type (e.g., H1, F1, etc.) or exact immigration status (e.g., refugee, asylum, etc.) on the application and submit a copy of the valid visa;$^{1,2}$
- • Employment Authorization Card ('EAC') holders: compare the category code, located in the center of the EAC to determine if the candidate is eligible to apply for insurance and submit a copy of the valid EAC;
- • Immigration documents pending expiration within 60 days of the application date may affect insurability or delay processing while we confirm renewal;
- • Fully expired visas must show proof of renewal or extension (I-797, I-797A, or other confirmation document from USCIS that is acceptable to Underwriting);
- • EB-5 visa holders transitioning to a green card status may be asked for additional documentation to confirm that process;
- • A copy of all required documentation will be asked for in iGO at the time of application. For paper applications, use the image upload tool on the agent portals to submit copies of images, and indicate this in the agent comments section;
- • Only U.S. residents are eligible to apply for the Living Benefit Riders (Chronic Illness, Critical Illness) and/or Long Term Care Rider, approval is subject to Underwriting.
- • A separate international underwriting guide is available for information on submitting nonresident foreign national and U.S. expatriate business. All international risk guidelines are subject to change without prior notice.

For further details, please refer to our Resident Foreign Nationals Travel Guidelines flyer, HNW Nonresident FN UW Guidelines (111955), and Foreign National Individual Taxpayer Identification Number Guidelines (117754).

$^{1}$ Not all visa types or immigration statuses are eligible. Note also that the Matricula Consular document is not recognized to be valid as a visa by the U.S. government.

$^{2}$ List 'Permanent Resident' on the application if the client is a valid green card holder residing in the U.S.

For Agent Use Only. Not for Use With the Public.

27

---

# INITIAL UNDERWRITING REQUIREMENTS FOR NON-U.S. RESIDENTS

*Transamerica Financial Foundation IUL® II*$^{1,2}$

|  FACE AMOUNT^{2,4,5,7,8,9} | ISSUE AGE^{4}  |   |   |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|   |  0-17^{9} | 18-40 | 41-50 | 51-60 | 61-70 | 71-75 | 76-80^{10} | 81-85^{10}  |
|  $25,000-$50,000 | N/A | Vitals, BCP, HOS, PFS | Vitals, BCP, HOS, PFS | Vitals, BCP, HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS  |
|  $50,001-$75,000 | N/A | Vitals, BCP, HOS, PFS | Vitals, BCP, HOS, PFS | Vitals, BCP, HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS  |
|  $75,001-$99,999 | N/A | Vitals, BCP, HOS, PFS | Vitals, BCP, HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS  |
|  $100,000-$250,000 | N/A | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS  |
|  $250,001-$500,000 | N/A | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS  |
|  $500,001-$1,000,000 | N/A | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS  |
|  $1,000,001-$2,000,000 | N/A | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS ECG CS PFS  |
|  $2,000,001-$3,500,000 | N/A | Vitals BCP HOS PFS | Vitals BCP HOS PFS | Vitals BCP HOS PFS | Vitals BCP HOS PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS ECG CS PFS  |
|  $3,500,001-$5,000,000 | N/A | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS CS PFS IR | Vitals BCP HOS CS PFS IR | Vitals BCP HOS ECG CS PFS IR  |
|  $5,000,001-$10,000,000 | N/A | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS CS PFS IR | Vitals BCP HOS ECG CS PFS IR | Vitals BCP HOS ECG CS PFS IR  |
|  $10,000,001 and higher | N/A | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR  |

$^{1}$ Use this chart for non-U.S. residents.

$^{2}$ Transamerica reserves the right to request other evidence of insurability as it deems necessary.

$^{3}$ Requests to reduce face amount received during underwriting will not alter the medical requirements.

$^{4}$ Available with $5,000 Minimum No Lapse Premium (MNLP) and higher

$^{5}$ The Long Term Care (LTC) Rider is not available to individuals residing outside the U.S.

$^{6}$ Cognitive Screen (CS) required at ages ≥ 70 for face amounts ≥ $100,000.

$^{7}$ Third-party financial verification for face amounts > $3,000,000 and/or total line over jumbo limits

$^{8}$ IRS Form 4506-C is required with all applications ≥ $5,000,000 or at underwriter discretion.

$^{9}$ Business Beneficiary Inspection Report (BBIR) ordered for business coverage over $5,000,000.

$^{10}$ IC/Individual Consideration at these ages

Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at the time of the application, we reserve the right to rescind the policy.

For Agent Use Only. Not for Use With the Public.

28

---

# INITIAL UNDERWRITING REQUIREMENTS FOR NON-U.S. RESIDENTS

*Transamerica Financial Choice IUL II$^{SM 1,2}$*

|  FACE AMOUNTS ^{3,4,6,7,8} | ISSUE AGE ^{7}  |   |   |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|   |  0-17 | 18-40 | 41-50 | 51-60 | 61-70 | 71-75 | 76-80^{9} | 81-85^{9}  |
|  $250,000-$500,000 | N/A | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS  |
|  $500,001-$1,000,000 | N/A | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS  |
|  $1,000,001-$2,000,000 | N/A | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS ECG CS PFS  |
|  $2,000,001-$3,500,000 | N/A | Vitals BCP HOS PFS | Vitals BCP HOS PFS | Vitals BCP HOS PFS | Vitals BCP HOS PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS ECG CS PFS  |
|  $3,500,001-$5,000,000 | N/A | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS CS PFS IR | Vitals BCP HOS CS PFS IR | Vitals BCP HOS ECG CS PFS IR  |
|  $5,000,001-$10,000,000 | N/A | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS PFS IR | Vitals BCP HOS CS PFS IR | Vitals BCP HOS ECG CS PFS IR | Vitals BCP HOS ECG CS PFS IR  |
|  $10,000,001 and higher | N/A | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG CS PFS IR | Vitals BCP HOS ECG CS PFS IR | Vitals BCP HOS ECG CS PFS IR  |

$^{1}$ Use this chart for non-U.S. residents.

$^{2}$ Transamerica reserves the right to request other evidence of insurability as it deems necessary.

$^{3}$ Requests to reduce face amount received during underwriting will not alter the medical requirements.

$^{4}$ Available with $5,000 Minimum No Lapse Premium (MNLP) and higher

$^{5}$ Cognitive Screen (CS) required at ages ≥ 70 for face amounts ≥ $250,000.

$^{6}$ Third-party financial verification for face amounts > $3,000,000 and/or total line over jumbo limits.

$^{7}$ IRS Form 4506-C is required with all applications ≥ $5,000,000 or at underwriter discretion.

$^{8}$ Business Beneficiary Inspection Report (BBIR) ordered for business coverage over $5,000,000.

$^{9}$ IC/Individual Consideration at these ages

Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at the time of the application, we reserve the right to rescind the policy.

For Agent Use Only. Not for Use With the Public.

29

---

# INITIAL UNDERWRITING REQUIREMENTS FOR NON-U.S. RESIDENTS

Trendsetter® Super 1,2

|  FACE AMOUNT ^{2, 4, 5, 7, 8, 9} | ISSUE AGE ^{4}  |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- |
|   |  18-40 | 41-50 | 51-60 | 61-70 | 71-75 | 76-80^{10}  |
|  $25,000-$50,000 | Vitals, BCP, HOS, PFS | Vitals, BCP, HOS, PFS | Vitals, BCP, HOS, PFS | Vitals, BCP, HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS  |
|  $50,001-$99,999 | Vitals, BCP, HOS, PFS | Vitals, BCP, HOS, PFS | Vitals, BCP, HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS  |
|  $100,000-$250,000 | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS  |
|  $250,001-$500,000 | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS CS, PFS | Vitals BCP HOS CS, PFS  |
|  $500,001-$1,000,000 | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS CS, PFS  |
|  $1,000,001-$2,000,000 | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS ECG CS PFS  |
|  $2,000,001-$3,500,000 | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS ECG CS PFS  |
|  $3,500,001-$5,000,000 | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS, PFS | Vitals BCP HOS PFS | Vitals BCP HOS CS PFS | Vitals BCP HOS ECG CS PFS  |
|  $5,000,001-$10,000,000 | Vitals BCP HOS PFS | Vitals BCP HOS PFS | Vitals BCP HOS PFS | Vitals BCP HOS PFS | Vitals BCP HOS ECG CS PFS | Vitals BCP HOS ECG CS PFS  |
|  $10,000,001 and higher | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG PFS IR | Vitals BCP HOS ECG CS PFS IR | Vitals BCP HOS ECG CS PFS IR  |

$^{1}$ Use this chart for non-U.S. residents.

$^{2}$ Transamerica reserves the right to request other evidence of insurability as it deems necessary.

$^{3}$ Requests to reduce face amount received during underwriting will not alter the medical requirements.

$^{4}$ Available with $5,000 Minimum No Lapse Premium (MNLP) and higher

$^{5}$ The Long Term Care (LTC) Rider is not available to individuals residing outside the U.S.

$^{6}$ Cognitive Screen (CS) required at ages ≥ 70 for face amounts ≥ = $100,000.

$^{7}$ Third-party financial verification for face amounts > $3,000,000 and/or total line over jumbo limits

$^{8}$ IRS Form 4506-C is required with all applications ≥ $5,000,000 or at underwriter discretion.

$^{9}$ Business Beneficiary Inspection Report (BBIR) ordered for business coverage over $5,000,000.

$^{10}$ IC/Individual consideration at these ages

Transamerica performs post-issue audits on cases put in force to validate our underwriting assessment and models. If we develop material information that was not disclosed at the time of the application, we reserve the right to rescind the policy.

For Agent Use Only. Not for Use With the Public.

30

---

****DOCUMENTATION NEEDED FOR NON U.S. CITIZENS****

Your client will need to provide on the application their resident status, country of citizenship, date of entry into U.S. (mm/yyyy) and green card expiration date. Copies of visas and Employment Authorization Cards (EAC) should be uploaded. Please see the visa or EAC category code/type for potential rates (see pages 32-35). Green cards are not routinely needed but may be requested at Underwriter discretion.

For Agent Use Only. Not for Use With the Public.

31

---

# ELIGIBILITY BY EMPLOYEE AUTHORIZATION CARD CATEGORY CODE

|  CATEGORY CODE | DESCRIPTION | ELIGIBILITY  |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- |
|   |   |  LIFE | LONG TERM CARE RIDER | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER | JUVENILES (INCLUDES PARENT/ OWNER STATUS)  |
|  A2 | Lawful temporary resident - Special Agricultural Workers | Up to best class | Yes | Yes | Yes | Yes  |
|  A3 | Refugee | Up to best class | Yes | Yes | Yes | Yes  |
|  A4 | Paroled refugee | Up to best class | Yes | Yes | Yes | Yes  |
|  A5 | Asylee | Up to best class | Yes | Yes | Yes | Yes  |
|  A6 | Fiancé(e) (K-1 or K-2 nonimmigrant) | Up to best class | Yes | Yes | Yes | Yes  |
|  A7 | N-8 or N-9 | Based on country of origin | Yes | Yes | Yes | Yes  |
|  A8 | Citizen of Micronesia, Marshall Islands, or Palau | Up to best class | Yes | Yes | Yes | Yes  |
|  A9 | K-3 or K-4 | Up to best class | Yes | Yes | Yes | Yes  |
|  A10 | Withholding of deportation or removal granted | Eligible under the ITIN program | Yes | Yes | Yes | Yes  |
|  A11 | Deferred Enforced Departure | Decline | No | No | No | No  |
|  A12 | Temporary Protected Status granted | Based on country of origin | Yes | Yes | Yes | Yes  |
|  A13 | Family Unity Program (Section 301 of the Immigration Act of 1990) | Up to best class | Yes | Yes | Yes | Yes  |
|  A14 | LIFE Legalization (Section 1504 of the Legal Immigrant Family Equity (LIFE) Act Amendments) | Up to best class | Yes | Yes | Yes | Yes  |
|  A15 | V visa nonimmigrant | Based on country of origin | Yes | Yes | Yes | Yes  |
|  A16 | T-1 nonimmigrant | Decline | No | No | No | No  |
|  A17 | Spouse of an E nonimmigrant | Up to best class | Yes | Yes | Yes | Yes  |
|  A18 | Spouse of an L nonimmigrant | Decline | Yes | Yes | Yes | Yes  |
|  A19 | U-1 nonimmigrant | Based on country of origin | Yes | Yes | Yes | No  |
|  A20 | U-2, U-3, U-4, or U-5 nonimmigrant | Based on country of origin | Yes | Yes | Yes | No  |
|  C1 | Spouse/dependent of A-1 or A-2 visa nonimmigrant | Decline | No | No | No | No  |
|  C2 | Spouse/dependent of Coordination Council for North American Affairs (E-1)/Taipei Economic and Cultural Representative Office (TECRO) | Up to best class | Yes | Yes | Yes | Yes  |
|  C3 | F-1 student, pre-completion Optional Practical Training | Up to best class | Yes | Yes | Yes | Yes  |
|  C4 | Spouse/dependent of G-1, G-3, or G-4 | Based on country of origin | Yes | Yes | Yes | Yes  |
|  C5 | J-2 spouse or child of J-1 exchange visitor | Based on country of origin | Yes | Yes | Yes | Yes  |
|  C6 | M-1 student, Practical Training | Up to best class | Yes | Yes | Yes | Yes  |
|  C7 | Dependent of NATO-1 through NATO-6 | Based on country of origin | Yes | Yes | Yes | Yes  |
|  C8 | Asylum application pending filed | Eligible under the ITIN program | Yes | Yes | Yes | Yes  |

For Agent Use Only. Not for Use With the Public.

32

---

# ELIGIBILITY BY EMPLOYEE AUTHORIZATION CARD CATEGORY CODE

> Continued from previous page

|  CATEGORY CODE | DESCRIPTION | ELIGIBILITY  |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- |
|   |   |  LIFE | LONG TERM CARE RIDER | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER | JUVENILES (INCLUDES PARENT/ OWNER STATUS)  |
|  C9 | Pending adjustment of status under Section 245 of the Act | Up to best class | Yes | Yes | Yes | Yes  |
|  C10 | Suspension of deportation applicants (filed before April 1, 1997) | Eligible under the ITIN program | Yes | Yes | Yes | Yes  |
|  C11 | Public Interest parolee | Based on country of origin | Yes | Yes | Yes | Yes  |
|  C12 | Spouse of an E-2 CNMI investor | Up to best class | Yes | Yes | Yes | Yes  |
|  C14 | Deferred action | Eligible under the ITIN program | Yes | Yes | Yes | Yes  |
|  C15 | Not in use | N/A | No | Yes | Yes | Yes  |
|  C16 | Creation of record (adjustment based on continuous residence since January 1, 1972) | Up to best class | Yes | Yes | Yes | Yes  |
|  C17 | B-1 domestic servant of certain nonimmigrants | Decline | No | No | No | No  |
|  C18 | Order of supervision | Decline | No | No | No | No  |
|  C19 | Certain pending TPS applicants whom USCIS has determined are prima facie eligible for TPS and who may then receive an EAD as a 'temporary treatment benefit' under 8 C.F.R. 244.10(a). | Based on country of origin | Yes | Yes | Yes | Yes  |
|  C20 | Section 210 legalization (pending I-700) Special Agricultural Workers | Up to best class | Yes | Yes | Yes | Yes  |
|  C21 | S visa nonimmigrant | Decline | No | No | No | No  |
|  C22 | Section 245A legalization (pending I-687) | Up to best class | Yes | Yes | Yes | Yes  |
|  C23 | Irish peace process (Q-2) | Up to best class | Yes | Yes | Yes | Yes  |
|  C24 | LIFE legalization | Up to best class | Yes | Yes | Yes | Yes  |
|  C25 | T-2, T-3, T-4, T-5, or T-6 nonimmigrant | Decline | No | No | No | No  |
|  C26 | Spouse of an H-1B nonimmigrant | Up to best class | Yes | Yes | Yes | Yes  |
|  C31 | VAWA self-petitioners with an approved Form I-360 | Up to best class | Yes | Yes | Yes | Yes  |
|  C33 | Consideration of Deferred Action for Childhood Arrivals | Eligible under the ITIN program | Yes | Yes | Yes | Yes  |
|  C35 | Principal beneficiary of an approved employment-based immigrant petition facing compelling circumstances | Up to best class | Yes | Yes | Yes | Yes  |
|  C36 | Spouse or unmarried child of a principal beneficiary of an approved employment-based immigrant petition facing compelling circumstances | Up to best class | Yes | Yes | Yes | Yes  |

The purpose of this document is to outline risks that are considered uninsurable based on immigration status. It is not possible to include every scenario and the contents of this document are subject to change without notice. This is not an offer guaranteeing any predetermined rate for any applicant.

For Agent Use Only. Not for Use With the Public.

33

---

# ELIGIBILITY BY VISA TYPES

|  CATEGORY CODE | DESCRIPTION | DOCUMENTATION REQUIRED | ELIGIBILITY  |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- |
|   |   |   |  LIFE | LONG TERM CARE RIDER | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER | JUVENILES (INCLUDES PARENT/ OWNER STATUS)  |
|  **A** | Government Official | N/A | Decline | No | No | No | No  |
|  **A5** | Asylum | Proof of asylum approval (copy immigration court document or EAD category A5) | Up to best class | Yes | Yes | Yes | Yes  |
|  **B** | Visitor (B1, B2, B1/B2, BCC) | Copy of visa and proof of U.S. entry | Underwritten according to country of legal residence | No | No | No | No  |
|  **C** | Transit | N/A | Decline | No | No | No | No  |
|  **D** | Crewman | N/A | Decline | No | No | No | No  |
|  **E** | Investor | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **E** | Employment Auth. Card | Copy of employee authorization card | Based on category code | See code chart | See code chart | See code chart | See code chart  |
|  **F** | Student/ academic | Copy of visa and I-20 from college | Up to best class | Yes | Yes | Yes | Yes  |
|  **G** | Representative to international organization | Copy of visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **GC** | Green Card, Permanent Resident Card | Copy of green card at underwriter discretion | Up to best class | Yes | Yes | Yes | Yes  |
|  **H** | Work/occupation | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **I** | Media | N/A | Decline | No | No | No | No  |
|  **J** | Cultural Exchange | Copy of visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **K** | Fiancée/fiancé | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **L** | Executive | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **M** | Vocational/non-academic | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **MC** | Matricula Consular ID | N/A | Decline | No | No | No | No  |
|  **NATO** | Government workers | Copy of green card at underwriter discretion, copy of visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **O** | Science/art extraordinary ability | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |

The purpose of this document is to outline risks that are considered uninsurable based on immigration status. It is not possible to include every scenario and the contents of this document are subject to change without notice. This is not an offer guaranteeing any predetermined rate for any applicant.

For Agent Use Only. Not for Distribution to the Public.

Continued >

34

---

# ELIGIBILITY BY VISA TYPES

> Continued from previous page

|  CATEGORY CODE | DESCRIPTION | DOCUMENTATION REQUIRED | ELIGIBILITY  |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- |
|   |   |   |  LIFE | LONG TERM CARE RIDER | CRITICAL ILLNESS RIDER | CHRONIC ILLNESS RIDER | JUVENILES (INCLUDES PARENT/ OWNER STATUS)  |
|  **P** | Professional athlete/ entertainer | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **Q** | Cultural exchange | Copy of visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **R** | Religious | Copy of visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **RE** | Refugee | Proof of refugee status (I-94) | Up to best class | Yes | Yes | Yes | Yes  |
|  **S** | Witness/ informant | N/A | Decline | No | No | No | No  |
|  **T** | Victims of trafficking | N/A | Decline | No | No | No | No  |
|  **TN/TD** | Trades (NAFTA ) | Copy of visa | Up to best class | Yes | Yes | Yes | Yes  |
|  **TPS** | Temporary protection status | Proof of status (I-94) | Based on country of origin | Yes | Yes | Yes | No  |
|  **TWOV** | Transit without a visa | N/A | Decline | No | No | No | No  |
|  **U** | Victims of certain criminal activity | Valid current visa and proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **V** | Certain second preference beneficiaries | Copy of visa, proof of U.S. entry | Based on country of origin | Yes | Yes | Yes | No  |
|  **VWP** | Visa Waiver Program | Copy of visa, proof of U.S. entry | Underwritten according to country of legal residence | No | No | No | No  |

The purpose of this document is to outline risks that are considered uninsurable based on immigration status. It is not possible to include every scenario and the contents of this document are subject to change without notice. This is not an offer guaranteeing any predetermined rate for any applicant.

For Agent Use Only. Not for Distribution to the Public.

35

---

TRANSAMERICA®

Let's get started today.

![info icon]() **Visit:** transamerica.com

Underwriting requirements are subject to change without notice.

Life insurance products are issued by Transamerica Life Insurance Company, Cedar Rapids, IA, or Transamerica Financial Life Insurance Company, Harrison, NY. Transamerica Financial Life Insurance Company is authorized to conduct business in New York. Transamerica Life Insurance Company is authorized to conduct business in all other states. All products may not be available in all jurisdictions.

**For Agent Use Only. Not for Use With the Public.**

3422452R6

© 2025 Transamerica Corporation. All Rights Reserved.

08/25


<!-- source:LIFETIME_UNDERWRITING_GUIDE.md -->

# Transamerica Lifetime℠ — Underwriting Guide

**Source:** [Lifetime Whole Life Underwriting Guide](https://cdn.brandfolder.io/86JM1UOD/as/qf8bz4-977wsw-5emcas/Lifetime_Whole_Life_Underwriting_Guide_Brochure.pdf)  
**Local:** `source_pdfs/Lifetime_Whole_Life_Underwriting_Guide_Brochure.pdf` (33 pages) + `.txt` + upload extract  
**Key pages extract:** `source_pdfs/Lifetime_UW_key_pages_3-28.txt`  
**Extracted:** 2026-07-22 · Agent only  

## Express Protect Underwriting®

- **iGO e-App** recommended — possible POS Express Protect decision  
- **Paper:** Part 1 only; **teleinterview always** required after good-order receipt  
- Fluidless ≠ GI — MIB, MVR, Rx, medical data, Part 2 still apply; **no GI products**  
- App valid **180 days**; close after **45 days** if outstanding (can reopen within validity)  
- Non-U.S. residents **not** eligible for automated/fluidless decisioning  

## Fluidless acceleration (marketing caps — also on Spec Sheet)

| Ages | Up to face |
|------|------------|
| 0–65 | $499,999 |
| 0–55 | $999,999 |
| 18–45 | $1,999,999 |

Fluidless decision: **not reconsidered** for a better class.

## Age & amount requirements (initial — summary)

Grid by age band (15d–17 · 18–45 · 46–55 · 56–65 · 66–69 · 70–80) and face bands from $25k–$99,999 through $3.5M–$5M. Lower ages/amounts often **Medical History Part II** only; higher ages/amounts add **teleinterview**, BCP, HOS, vitals, CS, IR as needed. Full table: guide p.4 / Agent Guide p.16 / UW extract.

## Guide contents (for RAG retrieval)

- Underwriting tips / delicate subjects  
- Field underwriting  
- Requirements & APS / vendors  
- Coverage amount guidelines · premium-to-income · juveniles · business  
- Adult blended **BMI** charts  
- Lifestyle & medical impairment guidelines  
- Substandard table ratings  
- Rider UW notes  
- Conditional receipt  
- Non–U.S. citizen rules  
- Employee Authorization Card eligibility  

## RAG / Julie

Full charts are ingested in `LIFETIME_UNDERWRITING_CHARTS.md` and `LIFETIME_UNDERWRITING_FULL_EXTRACT.md` (RAG). Use with `LIFETIME_AGENT_GUIDE.md`. Do not invent table ratings — cite those excerpts or defer to underwriter/illustration.


<!-- source:TERM_IUL_UNDERWRITING_GUIDE.md -->

# Term & IUL Underwriting Guide (ICC States)

**Source:** [Term and IUL Underwriting Guide for ICC States](https://cdn.bfldr.com/86JM1UOD/as/vsg5vfmmm63rmms8gwt6nw/Transamerica_Term_and_IUL_Underwriting_Guide_for_ICC_States)  
**Local:** `source_pdfs/Transamerica_Term_and_IUL_Underwriting_Guide_for_ICC_States.pdf` (36 pages) + `.txt` + upload extract  
**Full page extract:** `source_pdfs/Term_IUL_UW_Guide_pages.txt`  
**Dated:** **08/25** · Agent only  
**Extracted:** 2026-07-22  

## Products covered

- Trendsetter® Super  
- Trendsetter® LB  
- Transamerica Financial Foundation IUL® II (FFIUL II)  
- Transamerica Financial Choice IUL℠ II (FCIUL II)  

**Scope note:** Matches Articulate course disclaimer — digital UW for **Term and IUL** (excl. NY framing in related materials). **Not** Final Expense whole life / FE Express. Lifetime WL has its own guide.

## Contents map

| Topic | Guide section |
|-------|----------------|
| Digital underwriting / iGO | p.3 |
| Requirements definitions (vitals, HOS, BCP, ECG, CS, IR) | p.4–6 |
| Requirement validity / APS | p.6 |
| Age & face grids — Super/LB | p.7 |
| Age & face — FCIUL II | p.8 |
| Age & face — FFIUL II | p.9 |
| Riders by product | p.10–11 |
| Blended BMI charts | p.13 |
| UW tips / coverage amounts / PTI / HNW / business | p.14–18 |
| Lifestyle & impairments / scenarios / tables | p.19–26 |
| Non–U.S. citizen | p.27 |
| Non–U.S. resident initial requirements | p.28+ |
| Employee Authorization Card eligibility | p.32 |
| Visa type eligibility | p.34 |

## Digital UW highlights

- Carrier **orders all** requirements via approved vendors  
- iGO e-App: LexisNexis prefill, reflexive questions, more good-order submissions  
- Goal: fewer traditional requirements; faster decisions  

## RAG / Julie

Primary Term UW reference for Trendsetter. Full grids are ingested in `TERM_UNDERWRITING_CHARTS.md` and `TERM_UNDERWRITING_FULL_EXTRACT.md` (RAG). Pair with `TRENDSETTER_PROFESSIONAL_FIELD_GUIDE.md` and `UW_TOBACCO_NICOTINE_MARIJUANA.md` / `UW_FOREIGN_NATIONALS_TRAVEL.md`. Do not invent age/amount cells.


<!-- source:UW_CONSUMER_GUIDE.md -->

# Consumer Guide to the Underwriting Process

**Source:** [Consumer Guide to Underwriting Process](https://cdn.bfldr.com/86JM1UOD/as/qfaewj-g849qw-62x59u/Consumer_Guide_to_Underwriting_Process)  
**Local:** `source_pdfs/Consumer_Guide_to_Underwriting_Process.pdf` (2 pages)  
**Revision:** **109378R3** · **06/26** · ©2026 · Consumer  
**Extracted:** 2026-07-22  

## Timing

Typical UW: **2 days to 5 weeks** depending on complexity; longer if incomplete app, phone interview delays, or slow medical records.

## What may be ordered

- Rx / diagnosis databases · MIB  
- Paramed exam · blood/urine · ECG  
- Phone interview · special questionnaires (sports, travel, finances)  
- APS / medical records (always ages **70+**) — often **2–4 weeks** from doctor  

## Exam / labs tips

- 12-hour water-only fast preferred before blood draw  
- Lab results via paramed form Slip ID / site; often text when ready (~**15 days**)  

## Interviews

- Phone: ~**10–15 minutes**; cognitive questions possible; interviewer may **not** have app copy  
- Face-to-face (some LTC Rider): ID, health/ADLs, cognitive + mobility, vitals; **40–60 minutes**  
- Prefer primary residence; applicant answers (interpreter OK if disinterested third party)  

## Decision outcomes

- Approved as applied → policy + letter  
- Other than applied → policy + amendment to sign  
- Decline → letter with reasons; premium returned; agent notified  

## RAG / Julie

Client-facing explanation of “what happens after I apply.” Product-specific fluidless/express paths → product UW guides.


<!-- source:UW_FOREIGN_NATIONALS_TRAVEL.md -->

# Resident Foreign Nationals & Foreign Travel Underwriting

**Source:** [Resident Foreign Nationals Travel Guidelines](https://cdn.bfldr.com/86JM1UOD/as/qfxz3k-fcr8oo-8vwrvt/Resident_Foreign_Nationals_Travel_Guidelines_Flyer)  
**Local:** `source_pdfs/Resident_Foreign_Nationals_Travel_Guidelines_Flyer.pdf` (8 pages) + `.txt`  
**Dated:** **04/25**  
**Extracted:** 2026-07-22  

## Scope

UW for applicants **traveling outside the U.S.** or living/working in the U.S. on a **visa**. Subject to change; some states restrict travel UW — Transamerica complies.

## Foreign travel method

1. Each country rated **A–E** (lists in flyer)  
2. Match country code × **days traveled per year**  
3. Multiple destinations → use **riskiest** location  
4. Urban = city pop ≥ **250,000** (incl. suburbs)

### Travel decision grid (Country Codes A–D / E)

| Code | ≤14 days | ≤60 | 61–120 | 121–365 |
|------|----------|-----|--------|---------|
| **A** | Best class | Best | Best | Best |
| **B** | Best class | Best | Best | Best |
| **C** | Best class | Best | **$1.50/M** | **$1.50/M** |
| **D** | IC | Decline | Decline | Decline |
| **E** | Decline | Decline | Decline | Decline |

Full country letter lists and visa / EAC / non-resident requirement pages are in the PDF/TXT (also cross-referenced in Term/IUL UW guide pp.27–34).

## RAG / Julie

Travel class / flat-extra / decline guidance. For Julie’s NE/KS/CO/NV clients traveling abroad, apply grid; defer complex visa/non-resident cases to `international@transamerica.com` / LCU materials.


<!-- source:UW_LARGE_CASE_UNIT.md -->

# Large Case Unit (LCU) & International Underwriting

**Source:** [Large Case Unit Underwriting Flyer](https://cdn.bfldr.com/86JM1UOD/as/qf8h8q-3uoovs-fg1w5d/Large_Case_Unit_Underwriting_Flyer)  
**Local:** `source_pdfs/Large_Case_Unit_Underwriting_Flyer.pdf` (2 pages)  
**Revision:** **250813R11** · ©2026 · Agent only  
**Extracted:** 2026-07-22  

## When LCU auto-qualifies

- Face **≥ $5,000,000** (no premium threshold), **or**  
- FFIUL / FCIUL / FFIUL II / FCIUL II with target premium **≥ $25,000**, **or**  
- Trendsetter Super / LB with paid annualized premium **≥ $25,000**  

International program: primarily HNW with global net worth ≥ **USD $1M**.

## Contacts

| Need | Channel |
|------|---------|
| Pending large/intl case | Assigned underwriter (buddy coverage) |
| General large case | **LCU@transamerica.com** (1 business day) |
| General international / risk assessment | **international@transamerica.com** (1 business day) |
| Sales / illustrations | WFG: TLDsalesdesk@ · Brokerage: lifesales@ · TAN: tansalesdesk@ |

Named LCU/International roster (phones/emails) in PDF — Richard Rice (LCU mgr), Shelly Mumm (Intl mgr), etc.

Foreign nationals program page: https://www.transamerica.com/financial-pro/insurance/foreign-nationals-life-insurance  

## RAG / Julie

Route large/international questions to these mailboxes; don’t invent capacity beyond `UW_RETENTION_LIMITS.md`.


<!-- source:UW_RETENTION_LIMITS.md -->

# Internal Retention & Autobind Limits

**Source:** [Internal Retention Limits Flyer](https://cdn.bfldr.com/86JM1UOD/as/tks7xgpwjbfngct7kk9jp/Internal_Retention_Limits_Flyer)  
**Local:** `source_pdfs/Internal_Retention_Limits_Flyer.pdf` (2 pages)  
**Code:** **121443R3** · **01/25** · ©2025 · Agent only  
**Extracted:** 2026-07-22  

## Capacity headline

Domestic UW capacity up to **$50M** · A countries **$25M** · B **$20M** · C **$7M**.

### Definitions

- **Retention** — risk Transamerica keeps (by age/class)  
- **Automatic Binding** — max reinsurers take without their own UW  
- **Automatic Issue** — retention + autobind  
- **Facultative** — outside auto pool; full file to reinsurer; future apps often facultative  
- **Jumbo** — in-force ultimate + applied (all cos.) − 1035 to TA: **$65M** through age 80 · **$50M** ages 81–85 · **$35M** non–U.S. residents  

## Domestic single life Term & IUL (regular risks, excl. aviation) — Std through Table D

| Ages | Retention | Autobind | Auto issue |
|------|-----------|----------|------------|
| 0–17 | $10M | $0 | $10M |
| 18–75 | $10M | $40M | **$50M** |
| 76–80 | $10M | $15M | $25M |
| 81–85 | $5M | $5M | $10M |

Higher tables (E–H, J–P) and A/B/C country grids: see flyer (lower or zero autobind).

## RAG / Julie

Large-case capacity context — not FE Express (small face). Prefer LCU contacts for $5M+ cases.


<!-- source:UW_TOBACCO_NICOTINE_MARIJUANA.md -->

# Underwriting — Tobacco, Nicotine & Marijuana Guidelines

**Source:** [UW Sales Enablement Flyer](https://cdn.brandfolder.io/86JM1UOD/as/hz6x3gwx8995vs6cr969br/Underwriting_Sales_Enablement_Flyer_for_tobacco_nicotine_marijuana)  
**Local:** `source_pdfs/UW_Tobacco_Nicotine_Marijuana_Flyer.pdf` (2 pages)  
**Code:** **263447R5** · **09/25** · ©2025 · Agent only  
**Extracted:** 2026-07-22  

## Marijuana (ages 18+)

- Qualifies for **Nonsmoker / Nontobacco** rates  
- Up to **Preferred Plus** on IUL · up to **Preferred Nonsmoker** on term  
- **Medical marijuana:** rates based on the **impairment** it’s prescribed for  
- Living benefits / LTC rider eligible if base risk ≤ **Table D** and flat extra ≤ **$2.50/1000** (no knock-out impairments)

## Nicotine (all forms = tobacco*)

\* Cigarettes, cigar, pipe, chew, snuff, gum/patch, e-cigs, vaping, etc.

| Rule | Detail |
|------|--------|
| Best NS/NT class | No use in past **5 years** |
| Current tobacco | Use within past **2 years** → best Smoker/Tobacco class for product |
| Incidental cigars | ≤ **12 cigars/year** → may qualify best NS/NT (product rules) |
| **Lifetime℠ exception** | **Any** tobacco use including incidental cigar in past **24 months** → **Tobacco** rates |

### Trendsetter / IUL class table (summary)

Tobacco usage lookbacks by class (Preferred Plus often **5 years** clean; Preferred/Standard Plus/NS often **2 years**; LB nonmed Std NS Band 1–2: **1 year**). Incidental cigar: admitted on app, **HOS negative for cotinine**, typically **≤1/month** for preferred/NS classes.

### Lifetime class table

Preferred Elite: none past **5 years** · Preferred Plus / Preferred / Nontobacco: none past **2 years** · Pref Tobacco / Tobacco: tobacco permitted.

## Age Last Birthday

Transamerica uses **Age Last Birthday** (not Age Nearest) for all life policies.

## RAG / Julie

Quick class guidance for nicotine/marijuana. Confirm product-specific tables in Term/IUL or Lifetime UW guides before quoting.


<!-- source:FE_EDELIVERY_ESIGNATURE_FLYER.md -->

# Transamerica — DocuSign® & Policy eDelivery Flyer (TAN/BKG)

**Source:** [TAN BKG eSignature and eDelivery Flyer](https://cdn.bfldr.com/86JM1UOD/as/x4nqqpjwjtm8brqxhkxwrtg/TAN__BKG_eSignature_and_eDelivery_Flyer)  
**Local PDF:** `source_pdfs/TAN_BKG_eSignature_and_eDelivery_Flyer.pdf` (~158 KB, 2 pages)  
**Full text:** `source_pdfs/TAN_BKG_eSignature_and_eDelivery_Flyer.txt`  
**Revision:** **2862274R1** · dated **06/24** · ©2024  
**Extracted:** 2026-07-22  
**Audience:** Agents (selling experience / ops)

## Scope

Policy **eDelivery** for **IUL, term, and final expense** via **iGO® e-App** + **DocuSign®** + **DocFast®** (iPipeline). Faster delivery → faster pay (flyer claim).

**Related but separate:** FE Express remote sign / PIN-to-sign — see `FE_EXPRESS_SIGNATURE_PROCESS.md` and `FE_EXPRESS_PIN_TO_SIGN.md`. This flyer is the broader DocFast eDelivery path.

## Benefits listed

| Theme | Detail |
|-------|--------|
| Easy | Opt-in in iGO e-App |
| Convenient | Sign 24/7 with DocuSign |
| Fast | Policy docs in inbox when complete |
| Secure | Encrypted |
| Up to date | Status throughout process |
| Control | Agent can review before sharing with client |

## Process (5 steps · 1–20 calendar days)

**Steps 3–5 must finish within 20 calendar days** or policy is **automatically mailed**.

1. Opt in through iGO e-App *(agent)*  
2. Submit application *(agent)*  
3. Agent and client get email to access/review policy  
4. Create **Transamerica DocFast®** account *(first-time users need a Transamerica-specific account even if they have DocFast elsewhere)*  
5. Client accepts & signs in DocuSign  

Then: final policy emailed to client; copy in agent DocFast dashboard. Agent notified when client views/signs.

## Quick tips

**First-time DocFast (Transamerica)**  
- Watch for email from **schnbedelivery@transamerica.com**  
- Sender: “New Business”  
- Subject: `Policy [Policy Number] was delivered`  
- Flyer references a short setup video (not linked in text extract)

**Existing users**  
- Portal: https://policyexpartnerportal.ipipeline.com — alerts, status, client emails, password reset

## When eDelivery is **not** available

iGO alerts ineligible cases. Exclusions include:

- Issue state: **NY, GU, PR, VI**  
- Owner or insured residence: **NY, GU, PR, VI**, or any **foreign** state/country  
- Juvenile insured and owner is **not** legal guardian  
- **Contingent owner** present  
- Insured and/or owner is **not a U.S. citizen**

## RAG / Julie use

Ops FAQ for eDelivery eligibility and DocFast setup. For FE Express–specific signing, prefer Express signature/PIN docs. Julie licensed in NE/KS/CO/NV — those states are not in the NY/GU/PR/VI exclusion list for issue/residence (citizenship and other rules still apply).


<!-- source:FE_EXPRESS_AGENT_GUIDE.md -->

# Transamerica FE Express Solution — Agent & Underwriting Guide

**Source:** [Transamerica FE Express Solution Agent Guide](https://cdn.bfldr.com/86JM1UOD/as/m7q69ngk78kw39p7w5923h/Transamerica_FE_Express_Solution_Agent_Guide)  
**Local PDF:** `source_pdfs/Transamerica_FE_Express_Solution_Agent_Guide.pdf` (28 pages)  
**Full text:** `source_pdfs/Transamerica_FE_Express_Solution_Agent_Guide.txt`  
**UW pages extract:** `source_pdfs/FE_Express_UW_charts_pages_9-17.txt`  
**Rates CSV:** `fe_express_rates.csv` (**1,436** rows)  
**Revision:** **3247945R11** ©2026  
**Extracted:** 2026-07-22  
**Agent use only**

## Products covered

| | FE Express Solution℠ | Graded FE Express Solution℠ |
|--|----------------------|------------------------------|
| Form | ICC23 TPWL14IC-0123 | ICC23 TPWL15IC-0123 |
| Type | Nonparticipating whole life | Nonparticipating whole life |
| Death benefit | Level from day 1 | Graded: first 2 years = **110% of premiums** (non-accidental); then full face |
| Issue ages | **18–85** | **18–80** |
| Face | Min **$5,000** (**$10,000** Premier); max **$100,000** ages 18–75 / **$25,000** ages 76–85 | Min **$5,000**; max **$25,000** all ages |
| Risk classes | Select NT/T + **Premier** (Premier not in CA) | Nontobacco / Tobacco |
| Owner | Insured = owner | Insured = owner |
| Premium period | Level to age **121** | Level to age **121** |
| Modal | Annual 1.000 · Monthly **0.0860** | Same |
| Policy fee | **$42 / year** | **$42 / year** |
| State exclusions | GU, NY, PR, VI | Same |
| Conversion | Not allowed | Not allowed |
| Citizenship | US citizen or green card not expiring within 90 days | Same |

Issuer: Transamerica Life Insurance Company, Cedar Rapids, IA. **Not available in New York.**

### Rate formula (FE Express)

1. Annual rate per $1,000 from band table × (face / 1000)  
2. \+ **$42** policy fee  
3. × modal factor (**0.0860** monthly) → round to nearest cent  

**Worked example (guide p.27):** Male 55, $15,000, Select Nonsmoker, monthly EFT  
`$57.63 × 15 + $42 = $906.45` → `× 0.0860 = $77.95/mo` ✅ matches CSV.

### Face bands (annual $ per $1,000)

| Band | Face amount |
|------|-------------|
| 1 | $5,000–$9,999 (Select NT/T only; no Premier column) |
| 2 | $10,000–$24,999 (Premier / Select NT / Select T) |
| 3 | $25,000–$49,999 (same classes; ages 76–85 max face $25k noted) |
| 4 | $50,000–$100,000 (through age **75** only in table) |

**CSV note:** Band 1 male Select Smoker ages **80** and **82** extracted as `24.34` / `15.64` — likely PDF text-extract errors; flagged `VERIFY_OCR_possible_error` in CSV. Visually verify those two cells before quoting.

**Gap:** This R11 guide’s published **rate charts are for FE Express** (Premier/Select). A separate full **Graded FE Express** rate-per-thousand table was **not** found as its own chart in this PDF extract — Graded UW classes are Nontobacco/Tobacco. Confirm Graded premiums via live quoter / next toolkit PDF if needed.

---

## Underwriting (summary)

- **100% digital / instant** decision; **never referred** to an underwriter (per guide).  
- Application valid **60 days**.  
- Data: personal history + diagnostic/Rx (Milliman etc.). Client can request health data from Milliman: FCRAReport@milliman.com · 877-211-4816.  
- Does **not stack** nonrelated medical conditions for best rate.  
- Class logic (p.9): Premier / Select / Graded / Decline rules; comorbidity = interacting conditions (e.g. tobacco + O2).  
- Full **adult single-condition decision chart**, **cancer decision chart**, **Rx that preclude coverage**, and **adult build/BMI chart** are ingested in `FE_EXPRESS_UNDERWRITING_CHARTS.md` (RAG).

---

## Riders (subject to state availability)

FE Express may include Concierge Planning, ADB w/ Nursing Home (not CA/FL), FL-only ADB, CA-only Terminal Illness ADB. Graded: Concierge Planning primarily. See `RIDER_STATE_AVAILABILITY.md` for NE/KS/CO/NV.

---

## Files for database / RAG ingest

1. This markdown (product + rules)  
2. `fe_express_rates.csv` — band rates for quoting engine / RAG  
3. Full guide TXT + UW chart pages for chatbot retrieval  

## Source URL

https://cdn.bfldr.com/86JM1UOD/as/m7q69ngk78kw39p7w5923h/Transamerica_FE_Express_Solution_Agent_Guide


<!-- source:FE_EXPRESS_AGENT_VIDEO.md -->

# Transamerica FE Express Solution — Agent Video

**Source:** [Transamerica FE Express Solutions Agent Video](https://cdn.bfldr.com/86JM1UOD/as/ff5z7qhcbbn5jg6hnb9fjp/Transamerica_FE_Express_Solutions_Agent_Video_3303796_0524)  
**Type:** `video/mp4` (~**149 MB** / 155,731,015 bytes)  
**Asset id / code:** **3303796** · filename suffix **0524** (May 2024)  
**Brandfolder last-modified:** 2024-05-31  
**Captured:** 2026-07-22  
**Audience:** Agent / advisor marketing (toolkit “Agent video”)

## Status

- **Not downloaded / not stored** in the repo (too large for knowledge git).  
- No transcript extracted this session.  
- Confirmed via CDN headers: `content-type: video/mp4`, resource key `ff5z7qhcbbn5jg6hnb9fjp`.

## Likely content (inferred — not verified from playback)

Agent-facing overview of FE Express sales process: digital app, instant decision, Concierge, commissions/placement messaging. Prefer Agent Guide / Spec Sheet / Benefit Flyer / Comparison Flyer for authoritative facts.

## For RAG / Julie

Treat as **reference link only** until a transcript exists. Do not invent spoken claims from this file.

## Related

- Consumer video (URL only): `FE_EXPRESS_CONSUMER_VIDEO.md`

## Source URL

https://cdn.bfldr.com/86JM1UOD/as/ff5z7qhcbbn5jg6hnb9fjp/Transamerica_FE_Express_Solutions_Agent_Video_3303796_0524


<!-- source:FE_EXPRESS_BENEFIT_FLYER.md -->

# Transamerica FE Express Solution — Benefit Flyer (Agent)

**Source:** [Transamerica FE Express Solution Benefit Flyer](https://cdn.bfldr.com/86JM1UOD/as/mh2595g64thmrk3j29rf7kcs/Transamerica_FE_Express_Solution_Benefit_Flyer_3479452_0324)  
**Local PDF:** `source_pdfs/Transamerica_FE_Express_Solution_Benefit_Flyer.pdf` (~302 KB, 2 pages)  
**Full text:** `source_pdfs/Transamerica_FE_Express_Solution_Benefit_Flyer.txt`  
**Revision:** **3479452R2** · dated **08/24** on cover · ©2025  
**Extracted:** 2026-07-22  
**Audience:** **For Agent Use Only. Not for Use With the Public.**

## Positioning

Agent leave-behind / sales-enablement one-pager: FE Express as a “game-changing” final expense product — guaranteed permanent coverage¹ with a more efficient sales process.

## Agent advantages listed

### 10-minute process
- Digital application with **instant decision on every case**
- App → eDelivery in as fast as **10 minutes**
- Integrated **prequalification** tool
- Text and email signature options

### Convenient payment options
- ACH (checking/savings), credit card, debit card, Social Security **Direct Express®** Debit MasterCard®
- Expiring cards or cards canceled for fraud are **usually updated automatically** to maintain payment

### Opportunity to upsell
- If approved, carrier informs agent if insured **qualifies for more coverage** so quote/app can be updated instantly

### Faster commissions
- Competitive commissions scheduled to be paid **daily via EFT**

### Optional funeral planning benefit (no additional premium)
- Policy owners: **24/7/365** access to licensed funeral directors, will preparation, document storage, and funeral pricing comparisons at **no additional cost**

## Compliance notes in flyer

- Death benefit not guaranteed during contestability and suicide exclusion periods
- Agent-only distribution

## RAG / Julie use

Ops and agent talking points (speed, payments, upsell flag, daily EFT commissions, Concierge). Prefer Agent Guide / Consumer Brochure for product specs and state limits. No rates in this flyer.


<!-- source:FE_EXPRESS_COMPARISON_FLYER.md -->

# Transamerica FE Express vs Final Expense Immediate — Comparison Flyer

**Source:** [Transamerica FE Express Solution Comparison Flyer](https://cdn.bfldr.com/86JM1UOD/as/5928r6ph3w7m8x7p9xnp/Transamerica_FE_Express_Solution_Comparison_Flyer)  
**Local PDF:** `source_pdfs/Transamerica_FE_Express_Solution_Comparison_Flyer.pdf` (~195 KB, 2 pages)  
**Full text:** `source_pdfs/Transamerica_FE_Express_Solution_Comparison_Flyer.txt`  
**Revision:** **3433215R7** · dated **07/26** · ©2026  
**Extracted:** 2026-07-22  
**Audience:** **For Agent Use Only. Not for Use With the Public.**

Side-by-side: **FE Express Solution℠** vs **Final Expense Immediate Solution** (portfolio FE). Positioning: FE Express = faster digital platform + optional Concierge funeral planning.

## Comparison matrix

| | FE Express Solution | Final Expense Immediate Solution |
|--|---------------------|----------------------------------|
| **Payment modes** | Monthly, annually | Monthly, quarterly, semiannually, annually |
| **Payment methods** | ACH, credit, debit, SS Direct Express® Debit MasterCard® | ACH, credit, debit, EFT, SS billing option; **direct billing** all modes except monthly |
| **State exclusions** | **GU, NY, PR, VI** | **PR, VI** (NY available via TFLIC paper path — see forms) |
| **Application** | **Digital only** (no paper); text/email signature | Digital¹ or paper |
| **Underwriting** | **Instant** in-application decision | Digitally enabled; real-time in most cases; **may refer** to UW |
| **In-force access** | Transamerica My Life Access℠ | Same |
| **Ownership** | Insured = owner | Owner **may differ** from insured |
| **Issue ages**² | **18–85** | **0–85** |
| **Risk classes**³ | Select NT / Select T / Premier | Preferred NT/T/Juvenile · Standard NT/T/Juvenile |
| **Premium duration** | To age **121** | Immediate: to **121** · **10-Pay Solution: 10 years** |
| **Min face** | **$5,000** ($10,000 Premier) | **$1,000** |
| **Max face**⁴˒⁵ | 18–75: **$100,000** · 76–85: **$25,000** | 0–55: $50k · 56–65: $40k · 66–75: $30k · 76–85: $25k |
| **Riders** | ADB+NH⁶ · ADB (FL)⁷ · Concierge⁸ · Terminal Illness (CA)⁹ | ADB+NH⁶ · ADB (FL)⁷ · **Accidental Death** · **Children’s/Grandchildren’s** · Terminal Illness (CA)⁹ |
| **Replacements** | Available all states | Available all states |
| **App validity** | **60 days** | **90 days** |
| **Decision delivery** | Instant within e-App | Sent via email |
| **Customize face after UW approval** | **Yes**, during application | Yes (additional UW may be required) |
| **Citizenship** | US citizen **or** green card not expiring within 90 days | US citizens (flyer wording — no green-card clause listed) |

### Graded siblings (footnotes)

- Max issue age **80** on both **Graded FE Express** and **Easy Solution**
- Graded FE Express: distinct **NT / Tobacco** rates · Easy Solution (graded): **uni-smoke** rates
- Max face **$25,000** all ages on Graded FE Express and Easy Solution
- Graded DB years 1–2 (non-accidental): **110% of premiums** − loans (same rule family as FE Express Graded / Easy)

### Rider footnotes (same as Spec Sheet)

6. ADB with Nursing Home not in CA/FL  
7. ADB Florida only  
8. CA/FL/MD = Concierge Planning Benefit outside policy  
9. Terminal Illness ADB California only  

¹ Digital app **not** available in NY (paper only) for Immediate path.

## Policy forms

| Product | Form | Issuer notes |
|---------|------|----------------|
| FE Express | ICC23 TPWL14IC-0123 | Transamerica Life (Cedar Rapids, IA) |
| FE Immediate | ICC18 TPWL10IC-1018 | Transamerica Life |
| FE Immediate (NY) | FPWL10NY-1018 | **Transamerica Financial Life** (authorized in NY) |

**FE Express / Graded FE Express are not available in New York.**

## Agent takeaway (Julie / product fit)

| Prefer FE Express when… | Prefer Immediate / portfolio FE when… |
|-------------------------|----------------------------------------|
| Need speed (instant decision, digital-only, Concierge) | Need **juvenile / ages 0–17**, lower min face ($1k), owner ≠ insured |
| Client wants Direct Express debit card convenience | Need **quarterly/semiannual**, direct bill, or **10-Pay** |
| Max face up to $100k (18–75) | Need Accidental Death or Children’s/Grandchildren’s riders |
| OK with 60-day app window | Need 90-day app validity or possible UW referral path |
| Client in NE/KS/CO/NV (Express available) | Client needs **NY** coverage (Express unavailable) |

## RAG / Julie use

Product-selection guide between Express and classic Immediate/Easy/10-Pay. No premium rates in this flyer.


<!-- source:FE_EXPRESS_COMPETITIVE_ADVANTAGE_FLYER.md -->

# Transamerica FE Express — Competitive Advantage Flyer (BKG)

**Source:** [Transamerica FE Express Competitive Advantage Flyer BKG](https://cdn.bfldr.com/86JM1UOD/as/rt2mbskvsbj8nbnpk5jfftr5/Transamerica_FE_Express_Competitive_Advantage_Flyer_BKG)  
**Local PDF:** `source_pdfs/Transamerica_FE_Express_Competitive_Advantage_Flyer_BKG.pdf` (~367 KB, 3 pages)  
**Full text:** `source_pdfs/Transamerica_FE_Express_Competitive_Advantage_Flyer_BKG.txt`  
**Revision:** **3541066BKGR2** · dates on art **06/25** / **04/26** · ©2026  
**Extracted:** 2026-07-22  
**Audience:** **For Agent Use Only. Not for Use With the Public.**

Competitor figures are **Transamerica marketing claims** as of this flyer — verify against live carrier materials before quoting competitors to clients.

## Agent advantages (p.1 — overlaps Benefit Flyer)

| Theme | Points |
|-------|--------|
| **10-minute process** | Digital app; instant decision every case; app → eDelivery as fast as 10 min; prequalification tool |
| **Payments** | ACH, credit, debit, SS Direct Express®; expired/fraud-canceled cards usually auto-updated |
| **Upsell** | If approved and qualifies for more face → update quote/app instantly |
| **Commissions** | Competitive commissions paid via **EFT** (comparison table: **daily**, depending on channel) |
| **Concierge** | 24/7/365 funeral directors, will prep, document storage, funeral price comparisons — **no additional premium** |

¹ DB not guaranteed during contestability/suicide periods.

## Competitive comparison at-a-glance (p.2)

Columns: **FE Express / Graded** · **Transamerica Immediate / 10-Pay / Easy** · **Americo Eagle Select FE** · **Mutual of Omaha Living Promise** *(flyer spelling “Ohamha”)* · **American-Amicable Senior Choice** · **Corebridge SimpliNow Legacy** · **CVS (Accendo) Final Expense**

| Feature | FE Express / Graded | TA Immediate / 10-Pay / Easy | Americo | Mutual of Omaha | AmAm Senior Choice | Corebridge | CVS Accendo |
|---------|---------------------|------------------------------|---------|-----------------|--------------------|------------|-------------|
| Issue ages | **18–85** | **0–85** | 40–85 | 45–85 Imm / 45–80 Graded | 50–85 | 50–80 | 40–89 Imm / 40–75 Graded |
| Tele-interview | **No** | No | No | Yes: Random | Yes (payor rules; ages 71–85; not in Rx DB) | No | No |
| Instant decision | **Yes** | Yes | Yes | Yes | Potentially | Yes | Yes |
| Instant eDelivery | **Yes** | **No** | Yes | No | No | No | No |
| Risk classes | **Select** | Preferred, Standard | Preferred, Standard | Standard | Standard | Standard | Preferred, Standard |
| Min face | **$5,000** | $1,000 | $5,000 | $2,000 | $2,500 | $5,000 | $2,000 |
| Max face (immediate DB) | **18–75: $100k · 76–85: $25k** | 0–55 $50k · 56–65 $40k · 66–75 $30k · 76–85 $25k | $50k | $50k | 50–75 $50k · 76–85 $25k | 50–60 $25k · 61–70 $30k · 71–80 $35k | 40–55 $50k · 56–65 $40k · 66–75 $30k · **76–89 $25k** |
| Max face (graded/mod) | **$25,000** | $25,000 | $25,000 | $20,000 | $25,000 | $25,000 | $25,000 |
| Graded/mod DB | GDB 2 yrs | GDB 2 yrs | GDB 2 yrs | GDB 2 yrs | GDB 2 yrs; ROP 3 yrs (50–64) / 2 yrs (65+) | GDB 2 yrs | MDB 2 yrs |
| Concierge funeral benefit | **Yes** | No | No | No | No | No | No |
| ADBR nursing home included | **Yes — Immediate DB only** | Yes — Immediate or 10-Pay | No | Yes | Yes — Imm DB only | Yes | No |
| Credit card pay | **Yes** | Yes | Yes | No | No | Yes | No |
| SS Direct Express | **Yes** | Yes | Unknown | No | No | Yes | No |
| Commission pay | Daily (by channel) | Daily (by channel) | Daily | Daily | Unknown | Unknown | 2×/week |

### Flyer “differentiators” vs peers (as claimed)

- Only product in the table with **Concierge Planning Funeral Benefit**  
- **$100k** max (18–75) vs peers often capped at $35k–$50k  
- Instant **eDelivery** (most peers No; Americo Yes)  
- No tele-interview (vs Mutual / AmAm in some cases)  
- Credit card + Direct Express vs several peers lacking one or both  

## Forms / compliance

- FE Express **ICC23 TPWL14IC-0123** · Graded **ICC23 TPWL15IC-0123**  
- Transamerica Life, Cedar Rapids, IA 52499  
- Not GI; UW may request exams/data · **Not available in New York**

## RAG / Julie use

Agent competitive positioning and high-level peer matrix. Prefer Spec Sheet / Agent Guide for Transamerica product truth. Competitor columns are snapshot marketing — do not treat as live underwriting without re-verification. Related: `FE_EXPRESS_BENEFIT_FLYER.md`, `FE_EXPRESS_COMPARISON_FLYER.md`.


<!-- source:FE_EXPRESS_CONSUMER_BROCHURE.md -->

# Transamerica FE Express Solution — Consumer Brochure

**Source:** [Transamerica FE Express Solution Consumer Brochure](https://cdn.bfldr.com/86JM1UOD/as/pwhj7hm97rmb2r8tmmpsx9bg/Transamerica_FE_Express_Solution_Consumer_Brochure)  
**Local PDF:** `source_pdfs/Transamerica_FE_Express_Solution_Consumer_Brochure.pdf` (~1.5 MB, 8 pages)  
**Full text:** `source_pdfs/Transamerica_FE_Express_Solution_Consumer_Brochure.txt`  
**Revision:** **3247964R6** · 07/26 · ©2026  
**Extracted:** 2026-07-22  
**Audience:** Consumer / prospect leave-behind (agent use for talking points)

## Products named

- **Transamerica FE Express Solution℠** — form **ICC23 TPWL14IC-0123**
- **Transamerica Graded FE Express Solution℠** — form **ICC23 TPWL15IC-0123**  
Issuer: Transamerica Life Insurance Company, Cedar Rapids, IA. **Not available in New York.**

## Consumer value props (brochure messaging)

- Final expense whole life; apply in **as few as 10 minutes**; **no medical exam**
- Hassle-free, budget-friendly coverage; all-digital app with agent; email/text sign; e-delivery
- **Concierge Planning** funeral services at **no additional premium** (where available) — guidance, funeral home selection, secure storage of personal info, legal-doc assistance
- Predictable **level premiums**; permanent lifetime protection
- Policy management online (docs, billing, payment preferences)
- Expedited claims (qualifying policies): portion of DB in as fast as **72 hours**; up to **$25,000** for funeral/other qualifying expenses (subject to contestability / qualifications)

## Feature comparison (p.5)

| | FE Express Solution | Graded FE Express Solution |
|--|---------------------|----------------------------|
| Premium period | Level to age **121** | Level to age **121** |
| Issue ages | **18–85** (ALB) | **18–80** (ALB) |
| Face | Min **$5,000** / **$10,000** Premier; max **$100,000** (18–75) / **$25,000** (76–85) | Min **$5,000**; max **$25,000** all ages |
| Death benefit | Full guaranteed face (excl. contestability/suicide periods) | Years 1–2 non-accidental: **110% of premiums** paid − loans; thereafter full face |
| Policy loans | Variable rate, **not to exceed 8%**; loans reduce DB/CSV/RPU | Same |
| Modes | Monthly or Annual | Monthly or Annual |
| Payment options | ACH, credit card, debit card, Social Security **Direct Express®** Debit MasterCard® | Same |
| Policy fee | **$42 / year** | **$42 / year** |

## Cost-of-funeral talking points (p.4 — cited sources Dec 2025)

- Social Security lump sum often only **$255** (if qualify)
- VA (non-service-related, if qualify): plot **$796** + burial allowance **$300** or **$796** depending on VA hospitalization at death
- NFDA median funeral itemization total shown: **$9,820** (services + metal casket + vault)
- Cemetery / cremation ranges; brochure **range of estimated final expenses: $13,720–$32,520**

## Permanent protection bullets (marketing)

- Federal income tax-free death benefit to beneficiaries (general; tax situation varies)
- Won’t cancel for health changes if premiums paid on time
- Riders for additional services/protection
- Tax-deferred cash value; loans reduce DB
- Option for **reduced paid-up** if situation changes

## Concierge Planning Rider℠ (p.6–7)

- Intended **24/7/365** funeral planning / concierge at **no extra premium** where available
- **Cannot be added post-issue**; may reinstate with policy if consent resigned
- Terminates on lapse or surrender (reinstatement path noted)
- Services highlighted: advisor assistance, legacy planning (will, healthcare directive, POA), document cloud storage, funeral-home price comparisons
- Provider named in closing: **Empathy**
- **State notes:** Not available in **AK, MI, OR, VA** (rider). In **CA, FL, MD** = Concierge Planning **Benefit** outside the policy (not a contractual rider). Rider not available in Oregon (repeated).

## Accelerated Death Benefit riders (FE Express only — not Graded)

- Available on FE Express at **no additional premium**; **admin fees apply** on acceleration
- **Not available** if applicant needs ADL assistance at application
- **ADB with Nursing Home** — not CA or FL
- **ADB (Florida only)** — qualifying event; tax note on accelerated benefits
- **Terminal Illness ADB (California only)** — accelerate up to 100% of face (less discount/loans/admin/next-year premiums) if death expected within **12 months** per physician statement

## Form numbers (p.8)

| Item | Form |
|------|------|
| FE Express | ICC23 TPWL14IC-0123 |
| Graded FE Express | ICC23 TPWL15IC-0123 |
| Concierge Planning Rider | PRGU1000-0320 / TRGU1000-0320 |
| Concierge Planning Benefit (FL/CA path) | DISCADSRV-FLCA-0820 |
| ADB w/ Nursing Home | ICC18 TRAC10IC-0818 |
| ADB (FL) | ICC18 TRAC11IC-0818 |
| Terminal Illness ADB (CA) | TI08 CA-0119 |

## Compliance / disclosure highlights

- This is **life insurance**, not a prepaid funeral; proceeds may be used for any purpose; face may not keep pace with funeral inflation
- Suicide / material misrep: benefits often limited to return of premium − loans (most states)
- Not available in all states; eligibility/premiums subject to UW
- **Not available in New York**

## RAG / Julie use

Consumer-facing explanations of Graded vs level DB, fees, payment methods, Concierge limitations by state, and funeral-cost objection handling. **Do not use for rates** — use `fe_express_rates.csv` / Agent Guide.


<!-- source:FE_EXPRESS_CONSUMER_VIDEO.md -->

# Transamerica FE Express Solution — Consumer Video

**Source:** [Transamerica FE Express Solution Consumer Video](https://cdn.bfldr.com/86JM1UOD/as/pcszv5bvgqjrb7rj4wvtz9g/Transamerica_FE_Express_Solution_Consumer_Video_3461067_0524)  
**Type:** `video/mp4` (~**166 MB** / 174,324,517 bytes)  
**Asset id / code:** **3461067** · filename suffix **0524** (May 2024)  
**Brandfolder last-modified:** 2024-06-03  
**Captured:** 2026-07-22  
**Audience:** Consumer / public marketing (toolkit “Consumer video”)

## Status

- **Not downloaded / not stored** in the repo (too large for knowledge git).  
- No transcript extracted this session.  
- Confirmed via CDN headers: `content-type: video/mp4`, resource key `pcszv5bvgqjrb7rj4wvtz9g`.

## Likely content (inferred — not verified from playback)

Consumer-facing overview of FE Express / Graded FE Express: speed of application, final-expense protection, Concierge funeral planning. Prefer printed Agent Guide / Spec Sheet / Consumer Brochure for authoritative product facts.

## For RAG / Julie

Treat as **reference link only** until a transcript exists. Do not invent spoken claims from this file.

## Source URL

https://cdn.bfldr.com/86JM1UOD/as/pcszv5bvgqjrb7rj4wvtz9g/Transamerica_FE_Express_Solution_Consumer_Video_3461067_0524


<!-- source:FE_EXPRESS_EVEREST_PROSPECTING_FLYER.md -->

# Transamerica FE Express — Everest Prospecting Flyer

**Source:** [Transamerica FE Express Everest Prospecting Flyer](https://cdn.bfldr.com/86JM1UOD/as/hc74ktxn9cwkns8z2kwh35/Transamerica_FE_Express_Everest_Prospecting_Flyer)  
**Local PDF:** `source_pdfs/Transamerica_FE_Express_Everest_Prospecting_Flyer.pdf` (~191 KB, 2 pages)  
**Full text:** `source_pdfs/Transamerica_FE_Express_Everest_Prospecting_Flyer.txt`  
**Revision / code:** **3625643** · dated **07/25** · ©2025  
**Brandfolder last-modified:** 2025-08-12  
**Extracted:** 2026-07-22  
**Audience:** Consumer prospecting leave-behind (agent fills name/phone/office on p.2)

## Positioning

Final expense WL (**FE Express** / **Graded FE Express**) with optional **Concierge Planning Rider℠** at **no additional premium** — funeral planning support so family can focus on celebrating life.

## Everest as concierge provider

Flyer states **Everest** is the optional funeral planning / concierge service on FE Express & Graded FE Express policies.

- **24/7 advisors**; personalize funeral plan; compare/negotiate prices  
- Works with Transamerica to get death benefit to loved ones in as few as **48 hours** after passing (flyer claim; other collateral cites expedited claims up to ~72 hrs / $25k — treat as marketing, confirm with claims ops)  
- Independent; **not** tied to any funeral home / burial / cremation provider  
- Usable at **any funeral home anywhere in the world**  
- Services & warranty by **Everest Funeral Package, LLC** — **not** by Transamerica or affiliates  
- If Transamerica ends relationship with Everest (or Everest ceases), Transamerica will look for a suitable replacement  

**Note:** Consumer Brochure closing copy referenced **Empathy** as provider; this flyer names **Everest**. Prefer **current** carrier/toolkit materials and state of appointment when answering clients; both may reflect vendor transitions over time.

## Everest offers (service menu)

| Feature | Details |
|---------|---------|
| **24/7 Advisor planning** | Consumer advocate; personalized family assistance |
| **At-need family support** | Decisions from home; clear pricing; negotiates with local funeral homes |
| **Online planning / storage** | **Tenzing™** secure vault; Personal Profile, 10-Key Decisions, My Wishes Plan, etc. |
| **PriceFinder℠** | On-demand funeral home price comparison database via Everest site |
| **Will Prep℠** | Will, healthcare directive, power of attorney; create/save/print/sign/update online |

## State / product notes

- Concierge availability subject to state approval; not all states  
- **CA, FL, MD:** Concierge Planning **Benefit** outside the policy (not contractual rider)  
- Everest services **not available in AK, MI, OR, VA**  
- Forms: FE Express **ICC23 TPWL14IC-0123** · Graded **ICC23 TPWL15IC-0123** · Concierge Rider **PRGU1000-0320**  
- **Not available in New York**  
- Standard “this is life insurance, not prepaid funeral” disclosures

## RAG / Julie use

Client-facing Everest Concierge talking points and service list. Cross-check state availability with Spec Sheet / `RIDER_STATE_AVAILABILITY.md`. No rates.


<!-- source:FE_EXPRESS_FEATURES_TRAINING_DECK.md -->

# Transamerica FE Express — Features training deck (enhancements)

**Source file:** `4865974R2_Transamerica FE Express Features Training Deck (6).pptx` (user Downloads)  
**Local copy:** `source_pdfs/Transamerica_FE_Express_Features_Training_Deck.pptx`  
**Text extract:** `source_pdfs/Transamerica_FE_Express_Features_Training_Deck.txt` (46 slides)  
**Doc code:** 4865974R2 · ©2025 · slide footer **01/25**  
**Policy forms:** FE Express `ICC23 TPWL14IC-0123` · Graded FE Express `ICC23 TPWL15IC-0123`  
**Issuer:** Transamerica Life Insurance Company, Cedar Rapids, IA — **Not available in New York**  
**Extracted:** 2026-07-22  
**Audience:** Agent use only

## Critical product update (rates / quoting)

### Face amount increase — effective **January 21, 2026**

| Product | Prior max (deck context) | New max |
|---------|--------------------------|---------|
| **FE Express Solution** | $50,000 | **$100,000** |
| **Graded FE Express Solution** | $25,000 | **$25,000** (unchanged) |

**Coverage availability (post change):**
- Issue ages **18–75:** up to **$100,000**
- Issue ages **76+** **or** Graded risk approval: **$25,000**
- Minimum still **$5,000** (per slide)

Deck says: for complete issue age / eligibility, use the **FE Express Agent and Underwriting Guide**.

---

## Multi-policy rules — effective **October 16, 2025**

Clients may buy multiple “express” policies, subject to **combined max face per product**:

| Product | Combined max face |
|---------|-------------------|
| FE Express | **$100,000** |
| FFIUL II Express | **$500,000** |

Example: two FE Express policies OK if **combined** face ≤ $100,000 (and within age rules in product guide).

---

## Underwriting enhancements (decline reduction ~5–10%)

| Topic | Change | Production date |
|-------|--------|-----------------|
| **Comorbids** | Independent comorbids removed (e.g. diabetes + kidney failure). Irregular heartbeat, chest pain, CAD removed as comorbid. Comorbid decline path now needs **3+** comorbidities. Ex: stroke + CHF → **Select** (was Decline). | **2025-02-19** |
| **Hospitalization** | Was: 2+ consecutive hospital nights → stop. Now: “yes” can continue; verified against overall risk score (two decision points). | **2025-02-18** |
| **Memory loss** | Decline only for chronic memory / memory loss **within last 2 years** (not “ever”). | **2025-02-04** |
| **Milliman** | No longer decline on a **single** Milliman condition/Rx alone; also requires higher overall risk score. | **2025-03-07** |

---

## Ops / e-app enhancements (for agent RAG)

### Third-party payor — effective **2025-10-16**
- Anyone **outside owner or insured** uses **PIN-to-Sign** for payor forms.
- Secondary window questionnaire; interaction type; save billing.
- Bank ACH → bank verification terms; else debit/credit.
- Delivery email or text; payor reviews consent / premium payor supplement / privacy; agent reads authorization script on screen, then collects PIN; then finalize with insured.

### PIN-to-Sign (Parts 1 & 2)
- Choose email or text; confirm phone; accept T&Cs; send.
- Client gets back-to-back texts from **(469)** area code; opens link to review forms; provides PIN.
- Agent confirms script read → enter PIN → Agree and sign → Part B.
- FAQ via QR (see also `FE_EXPRESS_PIN_TO_SIGN.md`).

### Policy Promise
- After approval + payment scheduled: download for records / send to client.
- **New sales only**; immediate on Policy Page; up to **90 days** via FE Express Agent Dashboard.
- Statuses: Payment Pending, Payment Scheduled, Policy Issued.
- Everest messaging when Everest included (opt-in / opt-out examples).

### Additional docs from Policy Promise page — effective **December 2025**
- Application Part A, Part B, Agent Report downloadable for agent records.

### Initial draft / ACH / email — effective **December 2025**
- Reschedule **initial** draft after sale: Customer Service **(800) 453-1448**.
- ACH failures: auto-retry once after **5 days**; failure emails every **7 days** until bind / manual retry / stale **60 days**.
- Failure emails include last name, last 4 of policy #, decline reason, retry info.
- Incomplete purchase emails to agent every 7 days until payment method or stale 60 days.

### Payment improvements — effective **2025-03-28**
- Confirm bank account number twice (no copy/paste on confirm).
- “Account not found” → verify with client or continue anyway.
- Extra Social Security billing question for uncommon situations → recommended schedule (can override).

### Agent Sync & Resources
- **Agent Sync** via NIPR: daily license/appointment updates; reduces holds ~50%; shows last sync under agent name on dashboard.
- Resources page via “?” → Agent Resources on dashboard.

---

## RAG priority facts

1. Quote FE Express to **$100k** (ages 18–75) after **2026-01-21**; Graded still **$25k**.  
2. Multi-policy combined cap **$100k** FE Express.  
3. UW is more permissive on comorbids / hospital / memory / Milliman (2025 dates above).  
4. Third-party payors must PIN-to-Sign; use owner contact rules from PIN FAQ.  
5. CS for draft date changes: **800-453-1448**.

## Still need from toolkit

Full **Agent and Underwriting Guide** PDF (rate tables + impairment charts) and **Spec Sheet** CDN links.


<!-- source:FE_EXPRESS_MEET_UNDERWRITER_WEBINAR.md -->

# Transamerica FE Express — Meet the Underwriter webinar (media)

**Source:** [Transamerica FE Express Meet the Underwriter BKG Webinar](https://cdn.bfldr.com/86JM1UOD/as/hqh8xm7w7khx2vkh7cg6jxv/Transamerica_FE_Express_Meet_the_Underwriter_BKG_Webinar_WEB)  
**Type:** `video/mp4` (~334 MB)  
**Brandfolder last-modified:** 2024-10-08  
**Extracted:** 2026-07-22  

## Status

- **Not downloaded / not stored** in the repo (too large for knowledge git).  
- No transcript extracted this session.  
- Likely covers FE Express underwriting Q&A for brokerage agents (“Meet the Underwriter”).

## For RAG / Julie

Until a transcript exists, treat this as a **reference link only**. Prefer the FE Express Agent Guide / Spec Sheet for authoritative underwriting rules and rates.

## Related links still needed

- FE Express Agent / Advisor Guide (rate charts + impairment charts)  
- FE Express Spec Sheet  
- Comparison flyer (FE Express vs Immediate Solution)

## Source URL

https://cdn.bfldr.com/86JM1UOD/as/hqh8xm7w7khx2vkh7cg6jxv/Transamerica_FE_Express_Meet_the_Underwriter_BKG_Webinar_WEB


<!-- source:FE_EXPRESS_PIN_TO_SIGN.md -->

# Transamerica FE Express — PIN to Sign / remote signature ops

**Extracted:** 2026-07-22  
**Products:** Transamerica FE Express Solution℠ (remote / PIN signing)

## Sources

| Asset | URL | Local | Notes |
|-------|-----|-------|-------|
| PIN to Sign FAQs (PDF) | https://cdn.bfldr.com/86JM1UOD/as/b4r5qjnb9k4mk9x6ssmg3ks3/Transamerica_FE_Express_PIN_to_Sign_FAQs | `source_pdfs/Transamerica_FE_Express_PIN_to_Sign_FAQs.pdf` | Rev **4796960 09/25** — full text below |
| PIN to Sign training video (MP4) | https://cdn.bfldr.com/86JM1UOD/as/6g8v9t3qjn8mbvtfbkvc2g2s/Pin_to_Sign_-_FE_Express_Training_Video | *not stored* (~28MB) | Agent training video; URL only |
| Brokerage FE Express National Launch Webinar 9/19/24 | https://cdn.bfldr.com/86JM1UOD/as/n6sccfkpwpp3qnm5pptfwv/Transamerica_Brokerage_FE_Express_National_Launch_Webinar_91924 | *not stored* (large media) | Launch webinar; URL only |
| Related: Remote signature flyer | see `FE_EXPRESS_SIGNATURE_PROCESS.md` | | Client walkthrough (text link → DOB + last 4 SSN → sign) |

---

## PIN to Sign FAQs — extracted content (agent use only)

### Overview — Socure contact validation

When clients use **PIN to Sign**, **Socure** (third-party) verifies each **phone number and email** belong to the applicant. Goal: reduce fraud and bad contact data.

- If verified → PIN to Sign continues normally.  
- If issues detected → prompt to **re-verify** contact info.

**Most common failure:** policy owner’s phone/email was **not** used. Always use the **policy owner’s** phone and email before submit.

Agent is prompted to re-enter phone or email (e.g. fix typo).  
**If invalid info is provided 3 times**, the applicant may be **blocked** and must contact **Customer Experience (CX)**.

### If applicant is blocked

- Agents call **CX: 800-476-0198**  
- CX may validate with a second tool and/or request documentation  
- If CX cannot resolve phone/email → application may need to be **canceled and re-applied** using the **other signing method**  
- Applicant may also be blocked outright after too many failed retries (ineligible screen)

### FAQ answers (from PDF)

**What is Socure?**  
Identity verification during PIN to Sign. Compares phone/email to consumer data to flag fraudulent or incorrect entries. Invalid/risky data → retry prompt or block.

**Why flag/block a phone or email?**  
Most common: number doesn’t belong to the **policy owner**. Also:
- Temporary / newly established phone numbers  
- Invalid or disposable email domains  
- Typos / misspellings  
- Toll-free numbers, unlinked numbers, or numbers tied to suspicious IPs (proxy/TOR)  
- Contact details from **OFAC-sanctioned** countries  

**What if blocked?**  
Message that verification failed. Call CX **800-476-0198**. CX may override or request docs (e.g. recent phone bill). Else cancel/re-apply with other signing method.

**Documentation for overrides?**  
- Phone: recent **phone bill** with applicant name + number (sometimes)  
- Email: no extra docs; CX uses second validation tool  

**False positives?**  
Contact CX to dispute; if confirmed accurate, CX can override.

**How many retries?**  
**3** chances to enter a new/corrected phone or email. Then fully blocked online. Tip: if phone fails, try email (and vice versa).

**Can client use spouse’s contact info?**  
**No** — use policy owner’s own phone/email. Spouse/third-party info can trigger high-risk codes / blocks.

**Can typos cause a block?**  
**Yes** — double-check digits and spelling.

**Who to call?**  
CX **800-476-0198** for overrides / false-positive review.

---

## RAG use

- Good for agent chatbot: “client blocked on PIN to Sign,” “Socure,” “can we use spouse’s phone,” CX number.  
- **Not** product rates / underwriting.  
- Pair with remote signature flyer steps in `FE_EXPRESS_SIGNATURE_PROCESS.md`.

## Media not ingested as text

Training video + launch webinar kept as **URL references only** (too large for repo; no transcript extracted this session). Ask later if a transcript is needed.


<!-- source:FE_EXPRESS_PROMO_TRAINING_VIDEO.md -->

# Transamerica FE Express — Promo Training Video

**Source:** [Transamerica FE Express Promo Training Video](https://cdn.bfldr.com/86JM1UOD/as/kvv4k7c7t54rn9j4tjwgkh7x/Transamerica_FE_Express_Promo_Training_Video)  
**Type:** `video/mp4` (~**103 MB** / 107,691,173 bytes)  
**Brandfolder last-modified:** **2026-01-21**  
**Captured:** 2026-07-22  
**Audience:** Agent / training promo (likely launch or enhancement messaging)

## Status

- **Not downloaded / not stored** in the repo (too large for knowledge git).  
- No transcript extracted this session.  
- Confirmed via CDN headers: `content-type: video/mp4`, resource key `kvv4k7c7t54rn9j4tjwgkh7x`.

## Likely content (inferred — not verified from playback)

Promotional training clip for FE Express (process speed, Concierge, product updates). Date **2026-01-21** aligns with the face-amount increase window noted in `FE_EXPRESS_FEATURES_TRAINING_DECK.md` ($50k→$100k effective ~2026-01-21) — may or may not cover that change; do not assume without a transcript.

## For RAG / Julie

Treat as **reference link only** until a transcript exists. Prefer Agent Guide / Spec Sheet / Features Training Deck for product facts.

## Related videos (URL only)

- `FE_EXPRESS_AGENT_VIDEO.md`  
- `FE_EXPRESS_CONSUMER_VIDEO.md`  
- `FE_EXPRESS_MEET_UNDERWRITER_WEBINAR.md`

## Source URL

https://cdn.bfldr.com/86JM1UOD/as/kvv4k7c7t54rn9j4tjwgkh7x/Transamerica_FE_Express_Promo_Training_Video


<!-- source:FE_EXPRESS_SIGNATURE_PROCESS.md -->

# Transamerica FE Express — Remote signature process

**Source:** [Transamerica FE Express Signature Process Flyer](https://cdn.bfldr.com/86JM1UOD/as/gbhg7j4gjrkqh3bp9v42qw5/Transamerica_FE_Express_Signature_Process_Flyer)  
**Document:** Remote signature guide — Transamerica FE Express Solution℠  
**Revision:** 09/25 (3479717R2 ©2025)  
**Local copy:** `source_pdfs/Transamerica_FE_Express_Signature_Process_Flyer.pdf`  
**Extracted:** 2026-07-22  
**Type:** Agent process / sales ops (not product rates)

## Purpose

Short step-by-step guide for walking a client through **remote e-signature** on FE Express (virtual and telephone sales).

## Client steps (as published)

1. **Getting started** — Client opens the text message and selects the link.  
2. **Verify identity** — Client enters **date of birth** and **last four digits of SSN**, then taps Continue.  
3. **Review & sign** — Client reviews documents/authorizations, selects the acknowledgement box, then taps to sign.

## RAG notes

- Useful for chatbot answers like “How does the Transamerica FE Express remote signature work?”
- Does **not** contain rates, underwriting, or face amounts.
- Remind agents: for agent use only; not for public distribution (per flyer).

## Source URL

https://cdn.bfldr.com/86JM1UOD/as/gbhg7j4gjrkqh3bp9v42qw5/Transamerica_FE_Express_Signature_Process_Flyer


<!-- source:FE_EXPRESS_SPEC_SHEET.md -->

# Transamerica FE Express Solution — Product Spec Sheet

**Source:** [Transamerica FE Express Solution Spec Sheet](https://cdn.bfldr.com/86JM1UOD/as/bq6jb32fxcnmqnkxw4g4qs9m/Transamerica_FE_Express_Solution_Spec_Sheet)  
**Local PDF:** `source_pdfs/Transamerica_FE_Express_Solution_Spec_Sheet.pdf` (~390 KB, 2 pages)  
**Full text:** `source_pdfs/Transamerica_FE_Express_Solution_Spec_Sheet.txt`  
**Revision:** **3247989R9** · cover dated **07/26** · ©2026  
**Extracted:** 2026-07-22  
**Audience:** **For Agent Use Only. Not for Use With the Public.**

## Headline specs (marketing face)

- Streamlined all-digital experience; **100% instant decisions**; text/email signature; e-delivery in as fast as **10 minutes**
- Up to **$100,000** permanent coverage with **guaranteed level premiums**
- Funeral planning services at **no additional cost** (not available in **AK, MI, OR, VA**)
- Forms: FE Express **ICC23 TPWL14IC-0123** · Graded **ICC23 TPWL15IC-0123**  
- Issuer: Transamerica Life Insurance Company, Cedar Rapids, IA  
- **Not available in New York** · Not GI; UW may request additional exams/data · Not all applicants qualify for nonmedical UW

## Products at-a-glance

| | FE Express Solution℠ | Graded FE Express Solution℠ |
|--|----------------------|------------------------------|
| Type | Nonparticipating whole life | Nonparticipating whole life |
| Description | Immediate level DB from day 1; Concierge at no add’l cost | Graded DB first **2** policy years; Concierge at no add’l cost |
| Premium period | Level to age **121** | Level to age **121** |
| Risk classes | Select NT · Select T · **Premier** | Nontobacco · Tobacco |
| Issue ages | **18–85** (ALB) | **18–80** (ALB) |
| Ownership | Insured = owner | Insured = owner |
| Face | Min **$5,000** (**$10,000** Premier); max **$100,000** (18–75) / **$25,000** (76–85) | Min **$5,000**; max **$25,000** all ages |
| Maturity | Age **121** | Age **121** |
| Death benefit | Guaranteed face¹ | Yrs 1–2 non-accidental: **110% of premiums** received − loans; then full face |
| Policy loans | Variable, **≤ 8%** | Variable, **≤ 8%** |
| Riders (state availability) | ADB w/ Nursing Home² · ADB (FL only)³ · Concierge Planning⁴ · Terminal Illness ADB (CA only)⁵ | Concierge Planning⁴ |
| Modes | Monthly or Annual | Monthly or Annual |
| Payment | ACH · credit · debit · SS Direct Express® Debit MasterCard® | Same |
| Modal factors | Annual **1.000** · Monthly **0.0860** | Same |
| Policy fee | **$42 / year** | **$42 / year** |
| State exclusions | **GU, NY, PR, VI** | Same |
| Conversion | Not allowed | Not allowed |
| Citizenship | US citizen, or green card not expiring within **90 days** | Same |

### Footnotes from sheet

1. DB paid minus any loan balance; not guaranteed during contestability/suicide periods  
2. ADB with Nursing Home **not** available in **CA** or **FL**  
3. ADB rider **Florida only**  
4. In **CA, FL, MD** = Concierge Planning **Benefit** outside the policy (not a contractual rider)  
5. Terminal Illness ADB **California only**

## RAG / Julie use

Canonical **quick-reference product matrix** (face, ages, modes, fee, modal factor, state exclusions, riders). Aligns with Agent Guide and Consumer Brochure. Rates → `fe_express_rates.csv`.


<!-- source:FE_PORTFOLIO_AGENT_GUIDE.md -->

# Transamerica Final Expense Solutions Portfolio — Agent Rate & Underwriting Guide

**Source:** [Final Expense Agent Guide with New Underwriting Experience](https://cdn.bfldr.com/86JM1UOD/as/v4fxfsf795f87m5mffm77/Final_Expense_Agent_Guide_with_New_Underwriting_Experience)  
**Local PDF:** `source_pdfs/Final_Expense_Agent_Guide_with_New_Underwriting_Experience.pdf` (~3.7 MB, 28 pages)  
**Full text:** `source_pdfs/Final_Expense_Agent_Guide_with_New_Underwriting_Experience.txt`  
**UW extract:** `source_pdfs/FE_Portfolio_UW_charts_pages_8-17.txt`  
**Rates CSV:** `fe_portfolio_rates.csv` (**1,411** rows)  
**Revision:** **2644970R5** · **12/23** · ©2023  
**Extracted:** 2026-07-22  
**Audience:** **For Agent Use Only. Not for Public Distribution.**

## Scope (important)

**Portfolio FE** — Immediate Solution, 10-Pay Solution, Easy Solution (forms **TPWL10IC-0818** / **TPWL10-0818** family).  

**Not** FE Express / Graded FE Express (`FE_EXPRESS_AGENT_GUIDE.md` / `fe_express_rates.csv`). Use Comparison Flyer for product fit.

---

## Products at-a-glance (p.5)

| | Immediate Solution | 10-Pay Solution | Easy Solution |
|--|--------------------|-----------------|---------------|
| Premium period | Level to age **121** | Level for **10 years** | Level to age **121** |
| Issue ages (ALB) | **0–85** | **0–85** | **18–80** |
| Face min | **$1,000** | **$1,000** | **$1,000** |
| Face max | 0–55 **$50k** · 56–65 **$40k** · 66–75 **$30k** · 76–85 **$25k** | Same | **$25,000** |
| Death benefit | Full face day one | Full face day one | Graded 2 yrs: accidental = face; else **110% of premiums** − loans; then full face |
| Maturity | Age 121 | Age 121 | Age 121 |
| Policy loans | Variable ≤ **8%** | Same | Same |
| Included ADB riders | ADB+NH² · ADB (FL)³ · Terminal Illness (CA)⁴ | Same | **None** |
| Optional riders (extra cost) | **ADR** · **CGR** | None | None |

² ADB+NH not CA/FL · ³ ADB Florida only · ⁴ Terminal Illness CA only  

Issuers: Transamerica Life (non-NY) or Transamerica Financial Life (NY). Not GI; UW may request exams/data.

---

## Process / UW ops (p.4, 8)

- **iGO® e-App** (iPipeline) → digitally enabled UW → email decision  
- App valid **90 days**; cases close after **45 days** if outstanding requirements (can reopen if reqs arrive within 90)  
- Electronic medical data via Milliman etc.; client FCRA: FCRAReport@milliman.com · 877-211-4816  
- Insurable interest required  

### Activity Credit (p.9 — adults 18+)

- Activity ≥ **3 days/week**, ≥ **10 consecutive minutes** each  
- Can improve Standard → Preferred in defined scenarios (e.g. COPD/stroke/hospitalization + Preferred build; or build-only risk)  

### Class logic (p.10+)

Preferred / Standard / Graded / Decline from medical + lifestyle + build. Full **Adult Single Condition Decision Chart**, cancer, Rx, and build charts are ingested in `FE_PORTFOLIO_UNDERWRITING_CHARTS.md` (RAG). See also `FE_PORTFOLIO_ENHANCEMENTS_FLYER.md` for 2023 class improvements summary.

---

## Optional riders (Immediate only)

**ADR (p.7, rates p.23):** ages **18–70**; death within **90 days** of accident; amount = base face; annual $/1000 in CSV as `ADR Rider`.  

**CGR (p.7):** **$2.00** annual per unit ($1,000) per child; parent/GP **18–75**; child **15 days–18**; max **9** children; face $1,000–min(base, $5,000); same face all kids; terminates rider anniversary after age **25**; conversion rules apply.

---

## Rate formula (p.27)

| Mode | Policy fee &lt; $5,000 face | Policy fee ≥ $5,000 | Modal factor |
|------|----------------------------|---------------------|--------------|
| Annual | **$60.00** | **$42.00** | **1.00** |
| Semiannual | N/A | N/A | **0.51** |
| Quarterly | N/A | N/A | **0.2575** |
| EFT monthly | N/A | N/A | **0.086** |

1. Annual rate/$1,000 × units  
2. \+ policy fee  
3. × modal factor → round nearest cent  

**Worked example (guide):** Male 55, Immediate, Preferred Nontobacco, $15,000, monthly EFT  
`$37.38 × 15 + $42 = $602.70` → `× 0.086 = $51.83/mo` ✅ matches CSV.

**Montana:** Unisex-Male rates (footnote on rate pages).

### CSV contents (`fe_portfolio_rates.csv`)

| Product | Classes | Ages covered |
|---------|---------|----------------|
| Immediate | Preferred & Standard | Juvenile 0–17 (M/F); Adult 18–85 NT/T M/F |
| 10-Pay | Preferred & Standard | Same |
| Easy | Uni-smoke | 18–80 M/F |
| Immediate ADR Rider | Unisex | 18–70 |

**1,411** rows · source tag `Final_Expense_Agent_Guide_2644970R5` · no age-decrease OCR anomalies flagged in parse.

---

## RAG / Julie use

1. This markdown — product/UW/ops  
2. `fe_portfolio_rates.csv` — quoting  
3. UW chart TXT — condition decisions  
4. Prefer live quoter if guide superseded; this PDF last-modified **2023-12-20**

## Source URL

https://cdn.bfldr.com/86JM1UOD/as/v4fxfsf795f87m5mffm77/Final_Expense_Agent_Guide_with_New_Underwriting_Experience


<!-- source:FE_PORTFOLIO_AGENT_GUIDE_FULL_EXTRACT.md -->

# Transamerica FE Portfolio Agent Guide — Full Text Extract

**Product focus:** Immediate / 10-Pay / Easy
**Source:** `source_pdfs/Final_Expense_Agent_Guide_upload_extract.md`
**Audience:** Agent use only — full PDF text extract for internal RAG underwriting retrieval.

Source URL: https://cdn.bfldr.com/86JM1UOD/as/v4fxfsf795f87m5mffm77/Final_Expense_Agent_Guide_with_New_Underwriting_Experience
Title: LIVE SMART

## LIVE SMART

FINAL EXPENSE SOLUTIONS PORTFOLIO
PRODUCT RATE AND UNDERWRITING GUIDE

TRANSAMERICA®

---

## EASY FOR YOU, EASY FOR THEM

**Your clients are looking to you for a quick, easy solution so they can forget about unexpected financial burdens and get back to living.**

You look to us for fast, straightforward options to help protect them. That's why Transamerica has been working hard to evolve our *Final Expense Solutions Portfolio* so we can deliver just that: a fast, easy solution for you and your clients.

With final expense, you get a fast, simple, straightforward digital application experience with the potential for more real-time underwriting decisions and a client-friendly application process. Your clients get the reassurance of a guaranteed death benefit up to $50,000 and predictable, level premium whole life insurance. Protecting your clients today from the unpredictability of tomorrow has never been easier — or faster — with Transamerica Final Expense products.

**REAL-TIME UNDERWRITING DECISIONS**

Help clients secure a whole life policy from a highly rated carrier with no exams or labs so their family can cover burial and other end-of-life expenses. With the electronic application, your clients have the potential to receive a final decision within minutes of application submission.

**GUARANTEED LEVEL PREMIUMS**

Premiums remain level and never change regardless of your client's age or health. Retirees have the added convenience to pay with a credit card or their Social Security benefits through Social Security Direct Express®.

**PERMANENT LIFETIME PROTECTION**

Clients between the ages of 0 and 85 can expect a permanent death benefit that is guaranteed to never change regardless of their health. The Accelerated Death Benefit Rider with Nursing Home Benefit, Accidental Death Benefit Rider, and Children/Grandchildren Benefit Rider provide additional protection in one policy.

2

---

# TABLE OF CONTENTS

|  **FINAL EXPENSE EXPERIENCE AND REAL-TIME DECISIONS** | **4**  |
| --- | --- |
|  **PRODUCTS AT-A-GLANCE** | **5**  |
|  - *Immediate Solution* | 5  |
|  - *10-Pay Solution* | 5  |
|  - *Easy Solution* | 5  |
|  **ADDITIONAL BENEFITS AND RIDERS** | **6**  |
|  - Accelerated Death Benefit Riders | 6  |
|  - Accidental Death Benefit Rider | 7  |
|  - Children's and Grandchildren's Benefit Rider | 7  |
|  **UNDERWRITING GUIDELINES** | **8**  |
|  - Activity Credit | 9  |
|  - Adults | 10  |
|  - Juveniles | 16  |
|  - Hypothetical Case Studies | 18  |
|  **RATE CHARTS** | **20**  |
|  - *Immediate Solution* | 20  |
|  - *10-Pay Solution* | 24  |
|  - *Easy Solution* | 26  |
|  - Calculating a Rate | 27  |

3

---

# FINAL EXPENSE EXPERIENCE

## REAL-TIME DECISIONS WITH DIGITAL APPLICATION

Transamerica's Final Expense products provide an underwriting process that is faster, simpler, and smarter, featuring a higher rate of real-time underwriting decisions. There are no invasive underwriting requirements, and an immediate underwriting decision is made using a no-touch underwriter review. Minimal health questions and quick decisions improve the application experience for both you and your clients.

## REAL-TIME DECISIONS

- Decisions provided within a few minutes of electronic application submission
- Consistent underwriting decisions leveraging digital medical data increase the opportunity for real-time decisions
- Situations referred to an underwriter will be limited and mainly focused on nonmedical risks (e.g., insurable interest-all parties, total coverage line, or immigration status)

## FEWER HEALTH QUESTIONS, MORE CLIENT-FRIENDLY PROCESS

- Short, straightforward medical and lifestyle questions along with an upfront eligibility question quickly help determine insurability
- Reduces the hassle and barriers to purchase for clients
- Spares agents from asking intrusive, in-depth client questions during the application process

## FAST, EASY EXPERIENCE

- Start the sales process from anywhere — on the go or from the office
- Quick premium quote tool (transamerica.com/quote-fe) that works on any digital device without having to log in
- Short, guided application through iGO® e-App
- Policy eDelivery available for added flexibility and convenience

**iGO e-App**

Agent completes the electronic application with client using iPipeline®.

**Evaluation**

Application and medical data reviewed through a digitally-enabled underwriting approach.

**Decision**

Agent receives email notification with decision.

Omissions and misstatements in an application could cause an otherwise valid claim to be denied.

4

---

# PRODUCTS AT-A-GLANCE

|   | IMMEDIATE SOLUTION | 10-PAY SOLUTION | EASY SOLUTION  |
| --- | --- | --- | --- |
|  Premium Paying Period | Level premiums to age 121 | Level premiums for 10 years | Level premiums to age 121  |
|  Issue Ages (Age last birthday) | 0-85 | 0-85 | 18-80  |
|  Face Amounts | **Minimum:** $1,000 **Maximum:** Ages 0-55: $50,000 Ages 56-65: $40,000 Ages 66-75: $30,000 Ages 76-85: $25,000 | **Minimum:** $1,000 **Maximum:** Ages 0-55: $50,000 Ages 56-65: $40,000 Ages 66-75: $30,000 Ages 76-85: $25,000 | **Minimum:** $1,000 **Maximum:** $25,000  |
|  Death Benefit^{1} | Full death benefit available day one | Full death benefit available day one | **Graded death benefit during first two policy years:** • Based on the face amount for accidental death, OR • Will be limited to 110% of sum of premiums paid Full death benefit available after first two policy years regardless of cause of death  |
|  Benefit Period | Matures at age 121 | Matures at age 121 | Matures at age 121  |
|  Policy Loans | Policy loan rate variable, not to exceed 8% | Policy loan rate variable, not to exceed 8% | Policy loan rate variable, not to exceed 8%  |
|  Additional Benefits | • Accelerated Death Benefit Rider with Nursing Home Benefit^{2} • Accelerated Death Benefit Rider^{3} • Terminal Illness Accelerated Death Benefit Rider^{4} | • Accelerated Death Benefit Rider with Nursing Home Benefit^{2} • Accelerated Death Benefit Rider^{3} • Terminal Illness Accelerated Death Benefit Rider^{4} | None  |
|  Optional Riders (For an additional cost) | • Accidental Death Benefit Rider • Children's and Grandchildren's Benefit Rider | None | None  |

$^{1}$ Any death benefits paid will be paid minus the loan balance, if any.

$^{2}$ Accelerated Death Benefit Rider with Nursing Home Benefit is not available in California and Florida.

$^{3}$ Accelerated Death Benefit Rider is available for Florida only.

$^{4}$ Terminal Illness Accelerated Death Benefit Rider is available for California only.

5

---

# ADDITIONAL BENEFITS AND RIDERS

## ACCELERATED DEATH BENEFIT RIDERS¹

Transamerica's Accelerated Death Benefit Rider (ADBR) provides an accelerated death benefit that is paid instead of the cash value or death benefit on an insured's policy. The ADBR can be used to help pay for medical or nursing home expenses resulting from a medical condition from an injury or illness as determined by a physician.

Transamerica's ADBRs require proof of the insured's qualifying event while the policy and rider are in force. This proof shall include a completed request and a physician's statement. We may request additional medical information from the physician who submits the statement.

**Accelerated Death Benefit Rider with Nursing Home Benefit (NHB) (Not available in California and Florida)**

**Eligibility requirements:** The insured is required to be continuously confined in an eligible nursing home for 90 days and have a physician certify that he or she will continuously remain there until death. Confinement to an eligible institution must be the result of:

- An accident that occurs on or after the effective date of the rider
- A specifically diagnosed illness that first manifests itself more than 30 days following the effective date of the rider

The NHB is not available if the applicant needs assistance in the activities of daily living at the time of application or two years prior to the application.

**Accelerated Death Benefit Rider (ADBR) – Florida only**

This rider is available when the insured can reasonably expect death within 12 months of receipt of a physician's statement.

**Terminal Illness Accelerated Death Benefit Rider (TIR) – California Only**

The insured can accelerate up to 100% of the face amount, less an interest discount, less any loans, less any administrative charge, less any premiums that would be due in the next year, if death is expected within 12 months receipt of a physician's statement.

## HOW THE BENEFIT IS DETERMINED

¹ Accelerated death benefits will be available when the insured has been diagnosed with a qualifying event, as described in the rider, while the policy and the rider are in force. Benefits advanced under this rider may be subject to taxation. Limitations and exclusions apply. Refer to the rider for complete details.

6

---

## OPTIONAL RIDERS

(Available for *Immediate Solution* product only)

**ACCIDENTAL DEATH BENEFIT RIDER (ADR)**

The ADR provides for payment of an amount in addition to the face amount of the policy in the event of death resulting directly from an accident and independent of other causes, subject to the exceptions set out in the rider.

- Issue ages 18 through 70
- Death must occur within 90 days from the accidental bodily injury and while the policy is in force

**CHILDREN'S AND GRANDCHILDREN'S BENEFIT RIDER (CGR)**

This rider provides level term insurance for the children/grandchildren named in the rider.

- Annual premium per unit per child is $2.00
- Issue ages of parent/grandparent 18 through 75
- Issue ages 15 days through 18 years (actual age of the child/grandchild)
- No more than nine children/grandchildren may be covered under this rider
- The minimum face amount is $1,000
- The maximum face amount is equal to the minimum of the base policy face amount or $5,000 per child/grandchild
- The face amount has to be the same for all children/grandchildren covered under this rider
- Children or grandchildren are not eligible for coverage if diagnosed by a member of the medical profession with a terminal illness expected to result in death within 24 months
- Child/Grandchild cannot have more than $5,000 across all Transamerica Final Expense Child/Grandchild Riders
- The rider terminates on the rider anniversary following the children/grandchildren's 25th birthdays

This rider may be converted to a new policy of permanent insurance we make available at time of conversion.

- Ages 0 (15 days) through 17 can only qualify for juvenile standard
- Ages 18 through 25 can only qualify for standard nontobacco
- The children/grandchildren must be insured for two years under the rider to convert

7

---

# UNDERWRITING GUIDELINES

## OUR APPROACH

Transamerica utilizes a digitally-enabled underwriting process built to deliver quick and more consistent decisions. This process provides a streamlined approach to underwriting risk selection, focusing on applicant-specific data such as personal history, height/weight, and health conditions.

## ELECTRONIC MEDICAL DATA

We want to create as simple and seamless of an experience as possible for you and your client when it comes to collecting their health information.

- Our straightforward personal history and lifestyle questions coupled with diagnostic and prescription data direct from the healthcare provider eliminates the need for lengthy, intrusive health questions and traditional medical records.
- All electronic medical data will be ordered through Transamerica and will be administered through Transamerica-approved vendors, safely and securely.

## INSURABLE INTEREST

Insurable interest must exist between the proposed insured, policy owner, payor, and beneficiary or beneficiaries. Underwriting reserves the right to make the final determination on the issuance of any policy.

## AN APPLICATION IS VALID FOR 90 DAYS

Cases will close after 45 days if there are outstanding requirements but, if the requirements are received within 90 days, the case can be reopened for processing. A new application will be needed after 90 days.

**DID YOU KNOW?**

Your client may request more information about the health data we received in making our decision by contacting Milliman:

**Email:** FCRAReport@milliman.com

**Phone:** 877-211-4816

**Mail:** P.O. Box 2223, Brookfield, WI 53008

8

---

# ACTIVITY CREDIT

APPLIES ONLY TO ADULTS
(AGES 18 AND OVER)

## EVALUATING PHYSICAL ACTIVITY

We recognize regular physical activity performed during a few days of the week can lead to positive impacts on an individual's health and well-being, which is why it is part of our holistic evaluation process. In some situations, we provide an Activity Credit, which can positively affect your client's rating.

**QUALIFICATIONS FOR ACTIVITY CREDIT**

|  **Type of activity:** | This can include routine activities such as walking the dog, gardening, mowing the yard, or other jobs requiring manual labor. Activity can also include jogging, running, using an elliptical, rowing machine, stationary bike, lifting weights, or other common exercises.  |
| --- | --- |
|  **Frequency and duration:** | Three or more days a week, for at least 10 consecutive minutes each time  |

## WHEN DOES THE ACTIVITY CREDIT IMPACT THE UNDERWRITING DECISION?

An Activity Credit may qualify your client for a better rating outcome, depending on a number of factors, combined with the total evaluation of your client's health profile. Below are two general scenarios where an Activity Credit may positively influence a decision. See Adult Single Condition Decision Chart for more specific details and examples.

**Scenario #1**

The proposed insured's height/weight is Preferred and they have **only one** of the following medical conditions:

- Respiratory diseases or disorders such as COPD, black lung, or chronic bronchitis
- Stroke or Transient Ischemic Attack (TIA)
- Hospitalization within the last 12 months

**NOTE:** For the above medical conditions, the proposed insured rating would improve from Standard to Preferred.

**Scenario #2**

The proposed insured's height/weight is the only risk factor. For example, if the proposed insured is a male, 5'6" 250 pounds with no health conditions or other risk factors, exercises at least three days a week for 10 minutes each time, their rating could improve from Standard to Preferred.

9

---

# ADULT PERSONAL HISTORY

## GENERAL UNDERWRITING RULES (AGES 18 AND OVER)

The proposed insured will most likely be PREFERRED if ...

- Their medical conditions, lifestyle factors¹, and height/weight are ALL Preferred

The proposed insured will most likely be STANDARD if ...

- ALL their medical conditions are Preferred and ALL lifestyle factors and height/weight are Standard OR
- They have one medical condition (rated Standard), height/weight are Preferred, and ALL lifestyle factors are Preferred or Standard

The proposed insured will most likely be GRADED if ...

- They have one medical condition (rated Graded), height/weight are Standard or Preferred, and ALL lifestyle factors are Graded or better OR
- They have two medical conditions that are Standard, height/weight are Standard or Preferred, and ALL lifestyle factors are Graded or better OR
- ALL their lifestyle factors and height/weight are Graded and ALL medical conditions (if any) are Preferred

The proposed insured will most likely be DECLINED if ...

- They have one medical condition or one lifestyle factor that is rated as a Decline OR
- Their height/weight is rated as a Decline OR
- They have four or more medical conditions that are either Standard or Graded

¹ Lifestyle factors include questions related to alcohol/drug use, driving record, and felonies. See Adult Single Condition Decision Chart for specific Lifestyle ratings.

10

---

## ADULT SINGLE CONDITION DECISION CHART — Subject to underwriting and change without notice

The following decisions are based on proposed insured having only one medical condition or lifestyle factor:

|  MEDICAL CONDITION OR LIFESTYLE FACTOR | DECISION (SUBJECT TO ALL OTHER FACTORS)  |
| --- | --- |
|  **AIDS/HIV/ARC** | DECLINE  |
|  **Alcoholism/Alcohol Abuse** - Used or been diagnosed with, treated, tested positive for, or been given medical advice by a member of medical profession | Within 2 years - DECLINE Within 2-4 years - GRADED Within 4-10 years - STANDARD Over 10 years - PREFERRED  |
|  **ALS** (Lou Gehrig's disease) or other motor neuron disease | DECLINE  |
|  **Alzheimer's/Dementia/Memory Loss/Cognitive Disorders** | DECLINE  |
|  **Amputation** (other than due to accident/trauma) | DECLINE  |
|  **Anemia** (other than Sickle Cell Anemia) | GRADED With Activity Credit - STANDARD No treatment for last 3 months - PREFERRED  |
|  **Aneurysm** | PREFERRED  |
|  **Angina** | See Heart Disease  |
|  **Angioplasty** (of any kind) | See Heart Disease  |
|  **Arrhythmia** | See Heart Disease  |
|  **Assisted Living/Long Term Care Facility** - Home healthcare is defined as medical care provided by a medical professional, friends, or family member, including — but not limited to — arranging medications, taking blood pressure or sugar readings, administering medications, wound care, feeding tube, etc. | Current - DECLINE  |
|  **Asthma** | Mild (no daily symptoms, no limitations to daily activities, no reduced lung function, no regular use of steroids and no ER visits or hospitalizations due to asthma in last 5 years - PREFERRED Chronic - STANDARD with Activity Credit - PREFERRED  |
|  **Atrial Fibrillation** | See Heart Disease  |
|  **Autism** | Mild (Highly Functional): - PREFERRED All others - DECLINE  |
|  **Bipolar** | PREFERRED  |
|  **Black Lung** | STANDARD With Activity Credit - PREFERRED  |
|  **Blood Clots** (no complications/time since resolved) | PREFERRED  |
|  **Blood Disorder** (excluding Iron Deficiency Anemia and Sickle Cell Anemia): Polycythemia, Thrombocytopenia, Hemophilia, and other coagulation disorders | PREFERRED  |
|  **Bone Marrow Transplant** (Including donor stem cells) | DECLINE  |
|  **Bronchitis** (chronic) | STANDARD With Activity Credit - PREFERRED  |
|  **Build** | See Adult Height and Weight Chart page 15  |
|  **Bypass** | See Heart Disease  |

11

---

|  MEDICAL CONDITION OR LIFESTYLE FACTOR | DECISION (SUBJECT TO ALL OTHER FACTORS)  |
| --- | --- |
|  Cancer (other than Basal Cell) | Any onset within 2 years – DECLINE Metastatic – DECLINE Recurrent – DECLINE Multiple cancers – DECLINE With metastasis to lymph nodes – DECLINE Cancer free and no treatment within last 2 years – STANDARD  |
|  Cardiac Surgery | See Heart Disease  |
|  Cardiomyopathy | See Heart Disease  |
|  Cerebral Palsy | DECLINE  |
|  Chest Pain | See Heart Disease  |
|  Chronic Pain | PREFERRED  |
|  Circulatory Disorder | PREFERRED  |
|  Cirrhosis | STANDARD  |
|  Clotting Disorder | PREFERRED  |
|  Cognitive Disorder | DECLINE  |
|  Congestive Heart Failure/Heart Failure/Diastolic Heart Failure | STANDARD  |
|  COPD (Chronic Obstructive Pulmonary Disease) | STANDARD With Activity Credit – PREFERRED  |
|  Coronary Artery Disease | See Heart Disease  |
|  Creutzfeldt-Jakob Disease | DECLINE  |
|  Crohn's Disease | PREFERRED  |
|  Cystic Fibrosis | DECLINE  |
|  Defibrillator Implant | See Heart Disease  |
|  Dementia | DECLINE  |
|  Depression | PREFERRED  |
|  Diabetes (Type 1 and 2) | STANDARD Only during pregnancy – PREFERRED  |
|  Diabetic Coma | DECLINE  |
|  Dialysis | STANDARD  |
|  Diastolic Heart Failure | See Congestive Heart Failure  |
|  Down Syndrome | DECLINE  |
|  Driving (including: reckless driving, DUI/DWI/OWI) | Within 2 years – DECLINE Within 2–5 years – STANDARD > 5 years – PREFERRED Multiple offenses in last 5 years – DECLINE  |
|  Drug Use/Abuse (including prescription drugs) Used or been diagnosed with, treated, tested positive for, or been given medical advice by a member of medical profession | Within 2 years – DECLINE Within 2–4 years – GRADED Within 4–10 years – STANDARD Over 10 years – PREFERRED  |
|  Electric Scooter/Cart | See Wheelchair/Scooter/Cart  |
|  Emphysema | STANDARD With Activity Credit – PREFERRED  |
|  Employment (in the cannabis industry or a cannabis-related business) | DECLINE  |

12

---

|  MEDICAL CONDITION OR LIFESTYLE FACTOR | DECISION (SUBJECT TO ALL OTHER FACTORS)  |
| --- | --- |
|  Encephalitis | PREFERRED  |
|  Epilepsy | See Seizures  |
|  Felony Offense (convicted of or pleaded no contest) | Within 3 years - DECLINE Within 3-5 years - GRADED Within 5-10 years - STANDARD Over 10 years - PREFERRED Multiple offenses in last 10 years - DECLINE  |
|  Gaucher's Disease | DECLINE  |
|  Heart Attack | See Heart Disease  |
|  Heart Disease | PREFERRED  |
|  Heart Failure | See Congestive Heart Failure  |
|  Heart Murmur | See Heart Disease  |
|  Heart Valve Replacement | See Heart Disease  |
|  Hepatitis | See Liver Disease/Disorder  |
|  Hodgkin's/Non-Hodgkin's/Lymphoma | See Cancer  |
|  Home Healthcare | See Assisted Living  |
|  Hospice | DECLINE  |
|  Hospitalization | Currently - DECLINE Within last 12 months - STANDARD With Activity Credit - PREFERRED  |
|  Hunter Syndrome | DECLINE  |
|  Huntington's Disease | DECLINE  |
|  Illegal Drugs | See Drug Use/Abuse  |
|  Incarceration | Current - DECLINE  |
|  Iron Deficiency Anemia | See Anemia  |
|  Irregular Heartbeat | See Heart Disease  |
|  Kidney Disease/Disorder (Chronic Kidney Disease) | STANDARD  |
|  Kidney Failure | STANDARD  |
|  Liver Disease/Disorder (excluding Fatty Liver Disease) | STANDARD  |
|  Long Term Care | See Assisted Living  |
|  Lou Gehrig Disease | See ALS  |
|  Lupus | See Systemic Lupus Erythematosus (SLE)  |
|  Marijuana use | PREFERRED  |
|  Memory Loss | See Alzheimer's  |
|  Mental Incapacity | DECLINE  |
|  Mental Retardation | DECLINE  |
|  Myocardial Infarction | See Heart Disease  |
|  Niemann-Pick Disease | DECLINE  |
|  Nursing Home | See Assisted Living  |
|  Oxygen | See Respiratory Disease or Disorder  |
|  Pacemaker/Defibrillator Implant | See Heart Disease  |
|  Pancreatitis (nonalcoholic) | Diagnosed and/or received treatment within 2 years - STANDARD Treated and resolved > 2 years - PREFERRED  |

13

---

|  MEDICAL CONDITION OR LIFESTYLE FACTOR | DECISION (SUBJECT TO ALL OTHER FACTORS)  |
| --- | --- |
|  Parole/Probation (currently) | Within 2 years - DECLINE  |
|  Peripheral Artery/Vascular Disease (PAD/PVD) | See Circulatory Disorder  |
|  Phlebitis | See Blood Clots  |
|  Pompe Disease | DECLINE  |
|  Post-Traumatic Stress Disorder (PTSD) | See Depression  |
|  Prison (within 2 years) | See Incarceration  |
|  Pulmonary Fibrosis | DECLINE  |
|  Pulmonary Hypertension | See Circulatory Disorder  |
|  Respiratory Disease or Disorder (Chronic) | STANDARD With Activity Credit - PREFERRED  |
|  Rheumatoid Arthritis | PREFERRED  |
|  Sarcoidosis | Not affecting the lungs - PREFERRED Affecting the lungs - See Respiratory Disease or Disorder  |
|  Schizophrenia | PREFERRED  |
|  Seizures | PREFERRED  |
|  Sickle Cell Anemia | DECLINE  |
|  Sleep Apnea | CPAP/treatment with supplemental oxygen/oxygen concentrator use - STANDARD With Activity Credit - PREFERRED CPAP/treatment without supplemental oxygen - PREFERRED  |
|  Stent Implant (Heart) | See Heart Disease  |
|  Stroke | STANDARD With Activity Credit - PREFERRED  |
|  Suicide (attempted) | Within 2 years - DECLINE  |
|  Surgery (Been advised or planning to have surgery requiring general anesthesia) | DECLINE  |
|  Systemic Lupus Erythematosus (SLE) | PREFERRED  |
|  Terminal Illness (death expected within 18 months) | DECLINE  |
|  Tobacco/Nicotine use (This includes cigarettes, e-cigarettes/vapes, chewing tobacco/smokeless tobacco, pipe, cigar, nicotine gum/patch or other nicotine delivery system.) | Within last 12 months will receive Tobacco Rating  |
|  Transplant Recipient | Organ or Stem Cell - DECLINE  |
|  Transient Ischemic Attack (TIA) | STANDARD With Activity Credit - PREFERRED  |
|  Tuberculosis | See Respiratory Disease or Disorder  |
|  Ulcerative Colitis | PREFERRED  |
|  Wasting Syndrome | DECLINE  |
|  Wheelchair/Electric Scooter/Electric Cart | PREFERRED If any assistance is required, see Assisted Living  |
|  Wilson's Disease | DECLINE  |
|  Wiskott-Aldrich Syndrome | DECLINE  |

14

---

## ADULT HEIGHT AND WEIGHT CHART

Rate classes represent best possible decision for the height/weight without taking into consideration any additional medical conditions or lifestyle factors. If the build for the insured exceeds the maximum weight listed for graded, no coverage will be available.

|  HEIGHT | MINIMUM WEIGHT PREFERRED AND STANDARD (BMI greater than 18.5) | MAXIMUM WEIGHT PREFERRED (BMI less than 40) | MAXIMUM WEIGHT STANDARD (BMI less than 45) | MAXIMUM WEIGHT GRADED (BMI less than 48)  |
| --- | --- | --- | --- | --- |
|  4'5' | 74 | 159 | 179 | 191  |
|  4'6' | 77 | 165 | 186 | 199  |
|  4'7' | 80 | 172 | 193 | 206  |
|  4'8' | 83 | 178 | 200 | 214  |
|  4'9' | 86 | 184 | 207 | 221  |
|  4'10' | 89 | 191 | 215 | 229  |
|  4'11' | 92 | 198 | 222 | 237  |
|  5'0' | 95 | 204 | 230 | 245  |
|  5'1' | 98 | 211 | 238 | 254  |
|  5'2' | 102 | 218 | 246 | 262  |
|  5'3' | 105 | 225 | 254 | 270  |
|  5'4' | 108 | 233 | 262 | 279  |
|  5'5' | 112 | 240 | 270 | 288  |
|  5'6' | 115 | 247 | 278 | 297  |
|  5'7' | 119 | 255 | 287 | 306  |
|  5'8' | 122 | 263 | 295 | 315  |
|  5'9' | 126 | 270 | 304 | 325  |
|  5'10' | 129 | 278 | 313 | 334  |
|  5'11' | 133 | 286 | 322 | 344  |
|  6'0' | 137 | 294 | 331 | 353  |
|  6'1' | 141 | 303 | 341 | 363  |
|  6'2' | 145 | 311 | 350 | 373  |
|  6'3' | 149 | 320 | 360 | 384  |
|  6'4' | 152 | 328 | 369 | 394  |
|  6'5' | 157 | 337 | 379 | 404  |
|  6'6' | 161 | 346 | 389 | 415  |
|  6'7' | 165 | 355 | 399 | 426  |
|  6'8' | 169 | 364 | 409 | 436  |
|  6'9' | 173 | 373 | 419 | 447  |
|  6'10' | 177 | 382 | 430 | 459  |
|  6'11' | 182 | 391 | 440 | 470  |
|  7'0' | 186 | 401 | 451 | 481  |

15

---

## JUVENILES (AGES 0 THROUGH 17) COVERAGE ELIGIBILITY

Medical conditions or personal history that will not be eligible for coverage with *Final Expense Solutions Portfolio products*$^{1}$ include, but may not be limited to:

- • Cognitive impairment
- • Memory loss
- • Mental incapacity
- • Motor neuron disease
- • Cerebral palsy
- • Cystic fibrosis
- • Huntington's disease
- • Amputation (other than due to accident/trauma)
- • Bone marrow, stem cell, or organ transplant (other than corneal)
- • Cancer
- • Pulmonary fibrosis
- • Sickle cell anemia
- • Down syndrome
- • Autism
- • Depression
- • Bipolar
- • Schizophrenia
- • Eating disorder
- • Suicide attempt
- • Cardiac surgery
- • Diabetes Type I or II
- • Chronic pain
- • Muscular dystrophy
- • Paralysis
- • Heart failure
- • Pending surgery requiring general anesthesia
- • Hospice, palliative, or home healthcare
- • Terminal medical condition
- • Diagnosis of HIV/AIDS
- • Currently incarcerated
- • Alcohol and or drug treatment
- • Drug use
- • Reckless driving, DUI, OWI, and DWI
- • Felony (convicted of or pleaded no contest)
- • Proposed insured, owner, or payor is employed in the cannabis industry or a cannabis-related business.

$^{1}$ Subject to underwriting and change without notice

## JUVENILE MEDICAL CONDITIONS

Juvenile applicants will not be eligible for coverage when two or more medical categories have a “yes” answer.

|  MEDICAL CATEGORIES | MEDICAL CONDITIONS | DECISION (Subject to all other factors)  |
| --- | --- | --- |
|  Heart or blood vessels disorder | • Congenital heart disease • Irregular heartbeat/arrhythmia • Murmur • Any other disease or disorder of the heart or blood vessels | Standard  |
|  Brain or nervous system disorder | • Epilepsy/Seizures • Any other disease or disorder of the brain or nervous system | Standard  |
|  Blood disorder | • Platelet disorders • Any other abnormality of the spleen, bone marrow, or blood | Standard  |
|  Digestive disorder | • Any disease or disorder of the esophagus, stomach, liver, pancreas, intestine, or colon | Standard  |
|  Lung disorder | • Asthma • Any other disease or disorder of the lungs or respiratory system | Standard  |
|  Renal and reproductive disorder | • Disease or disorder of the bladder • Disease or disorder of the kidney • Any other disease or disorder of the urinary or reproductive organs | Standard  |
|  Mental health disorder | • Anxiety • Attention deficit disorder (ADD/ADHD) • Any other psychiatric mental or emotional condition or disorder | Standard  |
|  Muscles, skin, joints, bones, connective tissue, eyes, and ears disorder | • Rheumatoid arthritis (JRA) • Autoimmune disorder • Any other disease or disorder of the musculoskeletal system, skin, or spine | Standard  |
|  Childhood cancers |  | Decline  |

16

---

## JUVENILE HEIGHT AND WEIGHT CHART

**Ages 0 through 13:** If the build for the proposed insured does not fall within the ranges listed, no coverage will be available.

|  AGE | MIN AND MAX HEIGHT IN INCHES | MIN AND MAX WEIGHT IN LBS  |
| --- | --- | --- |
|  15 days—less than 1 year | 18–35' | 5–32lbs  |
|  1 | 26–42' | 14–50lbs  |
|  2–4 | 30–45' | 19–71lbs  |
|  5–8 | 38–56' | 27–120lbs  |
|  9–11 | 44–70' | 40–160lbs  |
|  12–13 | 52–73' | 60–195lbs  |

**Ages 14 through 17:** See adult weight chart on page 15. If weight exceeds the maximum weight for the Standard product, no coverage will be available.

17

---

# HYPOTHETICAL CASE STUDY

NO. 1

## MEET MICHAEL, AGE 45

Michael is married, lives in Florida, and works as a customer service representative.

**Build:** 5' 11", 200 pounds

**Medications:** Humira for Crohn's disease, Lisinopril for high blood pressure, Tramadol for chronic pain and Citalopram for depression

**Activities:** None

**Other factors:** history of reckless driving identified over five years ago

**DECISION:** Preferred Nontobacco

**Product:** *Immediate Solution*

**Accelerated Death Benefit:** Qualifies

**Summary:**

- Michael is seeking to cover his final expenses and pay off outstanding loans. He wants the peace of mind that his passing will not be a financial burden on his spouse. He values having the additional flexibility of the Accelerated Death Benefit Rider that allows him to accelerate a portion of the death benefit if he receives a terminal diagnosis that only leaves him 12 months or less to live.
- Based on his build, medications, and personal history, he is approved with our best possible rate class of Preferred Nontobacco.
- Michael's lack of physical activity does not have any impact with the decision.

# HYPOTHETICAL CASE STUDY

NO. 2

## MEET SUSAN, AGE 65

Single, lives in Texas, and is retired with two adult children and three grandchildren

**Build:** 5' 6", 120 pounds

**Medications:** Lisinopril for high blood pressure, insulin for Type 1 diabetes and Lipitor for cholesterol.

**Activities:** Walks her dog around her neighborhood three times a week for more than 10 minutes each time.

**DECISION:** Standard Nontobacco

**Product:** *Immediate Solution*

**Accelerated Death benefit with Nursing Home Benefit:** Qualifies

**Summary:**

- Susan qualifies for *Immediate Solution* with a Standard rating and is eligible for the Accelerated Death Benefit Rider¹ for Nursing Home.
- Based on Susan's build, medication, and impairments, she would most likely be table rated or potentially graded with other carriers, but with *Immediate Solution* she can get the protection she needs at a more affordable rate.
- Despite her qualifying for the Activity Credit, it does not affect the outcome of the decision.

¹ Included automatically to eligible in states where applicable. The rider pays the face amount, less an interest discount, less any loans, less any administrative charge, less any premiums that would be due in the next year upon diagnosis of a qualifying event or confinement in a qualified nursing facility. Eligibility requirements apply.

18

---

# HYPOTHETICAL CASE STUDY

NO. 3

MEET ALEX, AGE 55

Married and lives in Kansas, where he works as an accountant

**Build:** 5' 8", 275 pounds

**Medications:** BiDil for congestive heart failure

**Activities:** None

**Other factors:** None

**DECISION:** Graded

**Product:** *Easy Solution*

WITH ACTIVITY CREDIT

Walks 3 times a week,
10 minutes each time

**DECISION:** Standard Nontobacco

**Product:** *Immediate Solution*

Summary:

- This scenario shows how a client's physical activity level can influence how Transamerica evaluates the client.
- Alex is taking medication for congestive heart failure and because of the condition, he only qualifies for our graded product, despite having no other medical risk factors.
- Currently, Alex has very limited or no physical activity, but let's assume he has the same medical history with a more active lifestyle through walking three times a week, 10 minutes each time. He now is eligible to receive an Activity Credit, which based on his current risk factors, qualify him for our *Immediate Solution* product with a Standard Nontobacco rating — leaving him with immediate coverage and a much lower premium.

19

---

# RATE CHARTS

## IMMEDIATE SOLUTION

**PREFERRED PREMIUMS$^{1}$** Annual premiums per unit ($1,000) of insurance

|  AGE | MALE | FEMALE  |
| --- | --- | --- |
|  0 | 13.68 | 11.86  |
|  1 | 13.79 | 11.94  |
|  2 | 13.89 | 12.04  |
|  3 | 14.01 | 12.12  |
|  4 | 14.12 | 12.24  |
|  5 | 14.22 | 12.33  |
|  6 | 14.52 | 12.51  |
|  7 | 14.82 | 12.69  |
|  8 | 15.14 | 12.89  |
|  9 | 15.44 | 13.08  |
|  10 | 15.74 | 13.26  |
|  11 | 16.17 | 13.51  |
|  12 | 16.63 | 13.52  |
|  13 | 17.05 | 13.74  |
|  14 | 17.50 | 14.00  |
|  15 | 17.93 | 14.24  |
|  16 | 18.12 | 14.28  |
|  17 | 18.20 | 14.33  |
|   | **NONTOBACCO** | **TOBACCO**  |
|  18 | 14.54 | 21.62  |
|  19 | 14.59 | 21.68  |
|  20 | 14.70 | 21.84  |
|  21 | 14.96 | 22.20  |
|  22 | 15.21 | 22.56  |
|  23 | 15.47 | 22.92  |
|  24 | 15.72 | 23.30  |
|  25 | 15.97 | 23.66  |
|  26 | 16.29 | 24.16  |
|  27 | 16.67 | 24.72  |
|  28 | 17.03 | 25.31  |
|  29 | 17.45 | 25.97  |
|  30 | 17.90 | 26.69  |
|  31 | 18.33 | 27.37  |
|  32 | 18.82 | 28.18  |
|  33 | 19.37 | 29.06  |
|  34 | 20.00 | 30.04  |
|  35 | 20.63 | 31.07  |
|  36 | 21.39 | 32.18  |
|  37 | 22.14 | 33.30  |
|  38 | 22.94 | 34.51  |
|  39 | 23.80 | 35.78  |
|  40 | 24.71 | 37.14  |
|  41 | 25.44 | 38.04  |
|  42 | 26.21 | 38.43  |

|  AGE | MALE | FEMALE  |
| --- | --- | --- |
|   | NONTOBACCO | TOBACCO  |
|   | NONTOBACCO | TOBACCO  |
|  43 | 26.95 | 38.81  |
|  44 | 27.69 | 38.94  |
|  45 | 27.97 | 39.89  |
|  46 | 28.64 | 40.45  |
|  47 | 29.31 | 42.33  |
|  48 | 29.98 | 43.14  |
|  49 | 30.65 | 44.09  |
|  50 | 31.32 | 44.93  |
|  51 | 32.53 | 46.98  |
|  52 | 33.74 | 48.94  |
|  53 | 34.96 | 51.01  |
|  54 | 36.17 | 53.09  |
|  55 | 37.38 | 55.49  |
|  56 | 39.18 | 58.21  |
|  57 | 40.98 | 60.84  |
|  58 | 42.77 | 63.59  |
|  59 | 44.57 | 66.69  |
|  60 | 46.37 | 70.35  |
|  61 | 49.30 | 75.41  |
|  62 | 52.23 | 80.49  |
|  63 | 55.16 | 85.54  |
|  64 | 58.09 | 90.60  |
|  65 | 58.56 | 95.67  |
|  66 | 62.24 | 102.68  |
|  67 | 65.91 | 109.70  |
|  68 | 69.59 | 116.73  |
|  69 | 73.26 | 123.74  |
|  70 | 76.94 | 130.76  |
|  71 | 83.34 | 140.07  |
|  72 | 89.74 | 149.39  |
|  73 | 96.14 | 158.68  |
|  74 | 102.54 | 167.99  |
|  75 | 108.94 | 177.29  |
|  76 | 119.82 | 192.68  |
|  77 | 129.99 | 206.76  |
|  78 | 140.53 | 220.85  |
|  79 | 147.44 | 234.93  |
|  80 | 154.34 | 249.01  |
|  81 | 180.77 | 269.57  |
|  82 | 198.75 | 290.11  |
|  83 | 213.76 | 310.66  |
|  84 | 229.05 | 331.20  |
|  85 | 244.57 | 351.76  |

|  AGE | MALE | FEMALE  |   |
| --- | --- | --- | --- |
|   | NONTOBACCO | TOBACCO  |   |
|   | NONTOBACCO | TOBACCO  |   |
|  43 | 26.95 | 38.81 | 22.04  |
|  44 | 27.69 | 38.94 | 22.53  |
|  45 | 27.97 | 39.89 | 22.63  |
|  46 | 28.64 | 40.45 | 22.90  |
|  47 | 29.31 | 42.33 | 23.17  |
|  48 | 29.98 | 43.14 | 23.44  |
|  49 | 30.65 | 44.09 | 23.71  |
|  50 | 31.32 | 44.93 | 23.98  |
|  51 | 32.53 | 46.98 | 24.76  |
|  52 | 33.74 | 48.94 | 25.54  |
|  53 | 34.96 | 51.01 | 26.33  |
|  54 | 36.17 | 53.09 | 27.11  |
|  55 | 37.38 | 55.49 | 27.89  |
|  56 | 39.18 | 58.21 | 29.08  |
|  57 | 40.98 | 60.84 | 30.27  |
|  58 | 42.77 | 63.59 | 31.45  |
|  59 | 44.57 | 66.69 | 32.64  |
|  60 | 46.37 | 70.35 | 33.83  |
|  61 | 49.30 | 75.41 | 35.71  |
|  62 | 52.23 | 80.49 | 37.58  |
|  63 | 55.16 | 85.54 | 39.46  |
|  64 | 58.09 | 90.60 | 41.33  |
|  65 | 58.56 | 95.67 | 43.21  |
|  66 | 62.24 | 102.68 | 46.03  |
|  67 | 65.91 | 109.70 | 48.84  |
|  68 | 69.59 | 116.73 | 51.66  |
|  69 | 73.26 | 123.74 | 54.47  |
|  70 | 76.94 | 130.76 | 57.29  |
|  71 | 83.34 | 140.07 | 61.49  |
|  72 | 89.74 | 149.39 | 65.69  |
|  73 | 96.14 | 158.68 | 69.89  |
|  74 | 102.54 | 167.99 | 74.09  |
|  75 | 108.94 | 177.29 | 78.29  |
|  76 | 119.82 | 192.68 | 86.61  |
|  77 | 129.99 | 206.76 | 94.44  |
|  78 | 140.53 | 220.85 | 102.58  |
|  79 | 147.44 | 234.93 | 108.06  |
|  80 | 154.34 | 249.01 | 113.55  |
|  81 | 180.77 | 269.57 | 133.04  |
|  82 | 198.75 | 290.11 | 146.32  |
|  83 | 213.76 | 310.66 | 157.45  |
|  84 | 229.05 | 331.20 | 168.73  |
|  85 | 244.57 | 351.76 | 180.21  |

|  85 | 246.65  |
| --- | --- |

|  20  |
| --- |

|   | ^{1}Unisex-Male rates for Montana  |
| --- | --- |

---

# LIVE WITH EASE

Growth

Support

Simplicity to Live your Best Life

Efficiency

Tools

21

---

## IMMEDIATE SOLUTION

**STANDARD PREMIUMS$^{1}$**

Annual premiums per unit ($1,000) of insurance

|  AGE | MALE |   | FEMALE  |   |
| --- | --- | --- | --- | --- |
|  0 | 15.69 |   | 12.88  |   |
|  1 | 15.70 |   | 12.91  |   |
|  2 | 15.72 |   | 12.96  |   |
|  3 | 15.74 |   | 12.98  |   |
|  4 | 15.75 |   | 13.01  |   |
|  5 | 15.77 |   | 13.06  |   |
|  6 | 16.22 |   | 13.30  |   |
|  7 | 16.68 |   | 13.55  |   |
|  8 | 17.14 |   | 13.80  |   |
|  9 | 17.59 |   | 14.04  |   |
|  10 | 18.05 |   | 14.28  |   |
|  11 | 18.87 |   | 14.59  |   |
|  12 | 19.69 |   | 14.64  |   |
|  13 | 20.49 |   | 14.92  |   |
|  14 | 21.30 |   | 15.23  |   |
|  15 | 22.12 |   | 15.52  |   |
|  16 | 22.43 |   | 15.63  |   |
|  17 | 22.52 |   | 15.68  |   |
|   | **NONTOBACCO** | **TOBACCO** | **NONTOBACCO** | **TOBACCO**  |
|  18 | 17.03 | 26.72 | 12.44 | 16.29  |
|  19 | 17.05 | 26.76 | 12.48 | 16.32  |
|  20 | 17.07 | 26.78 | 12.58 | 16.45  |
|  21 | 17.26 | 27.03 | 12.88 | 16.85  |
|  22 | 17.46 | 27.29 | 13.19 | 17.22  |
|  23 | 17.64 | 27.54 | 13.49 | 17.62  |
|  24 | 17.86 | 27.81 | 13.80 | 18.00  |
|  25 | 18.04 | 28.06 | 14.10 | 18.37  |
|  26 | 18.35 | 28.51 | 14.42 | 18.86  |
|  27 | 18.68 | 29.04 | 14.74 | 19.37  |
|  28 | 19.06 | 29.64 | 15.09 | 19.93  |
|  29 | 19.49 | 30.31 | 15.47 | 20.53  |
|  30 | 19.96 | 31.08 | 15.93 | 21.24  |
|  31 | 20.42 | 31.86 | 16.42 | 21.96  |
|  32 | 20.99 | 32.80 | 16.97 | 22.77  |
|  33 | 21.63 | 33.86 | 17.59 | 23.69  |
|  34 | 22.37 | 35.10 | 18.28 | 24.72  |
|  35 | 23.14 | 36.38 | 19.01 | 25.79  |
|  36 | 24.06 | 37.83 | 19.76 | 26.89  |
|  37 | 25.00 | 39.32 | 20.52 | 27.98  |
|  38 | 26.02 | 40.94 | 21.33 | 29.14  |
|  39 | 27.11 | 42.67 | 22.18 | 30.33  |
|  40 | 28.29 | 44.55 | 23.06 | 31.55  |
|  41 | 29.30 | 45.87 | 23.87 | 33.21  |
|  42 | 30.36 | 47.26 | 24.70 | 34.88  |

|  AGE | MALE |   | FEMALE  |   |
| --- | --- | --- | --- | --- |
|   | NONTOBACCO | TOBACCO | NONTOBACCO | TOBACCO  |
|  43 | 31.40 | 48.65 | 25.58 | 36.49  |
|  44 | 32.46 | 50.02 | 26.47 | 38.05  |
|  45 | 33.35 | 51.69 | 26.72 | 40.11  |
|  46 | 33.90 | 52.84 | 26.97 | 41.22  |
|  47 | 34.45 | 54.23 | 27.22 | 42.58  |
|  48 | 35.00 | 55.77 | 27.48 | 44.04  |
|  49 | 35.55 | 57.50 | 27.73 | 45.70  |
|  50 | 36.10 | 59.10 | 27.98 | 47.16  |
|  51 | 38.17 | 62.98 | 29.48 | 50.00  |
|  52 | 40.24 | 66.78 | 30.98 | 52.65  |
|  53 | 41.90 | 70.83 | 32.49 | 55.44  |
|  54 | 43.50 | 75.00 | 33.98 | 58.24  |
|  55 | 45.07 | 78.30 | 35.48 | 59.85  |
|  56 | 46.72 | 82.66 | 36.71 | 62.19  |
|  57 | 48.85 | 86.90 | 37.94 | 64.28  |
|  58 | 50.98 | 91.33 | 39.18 | 66.36  |
|  59 | 53.11 | 96.25 | 40.41 | 68.67  |
|  60 | 55.23 | 101.95 | 41.64 | 71.44  |
|  61 | 58.79 | 109.62 | 43.83 | 75.27  |
|  62 | 62.35 | 117.29 | 46.03 | 79.10  |
|  63 | 65.91 | 124.95 | 48.23 | 82.95  |
|  64 | 69.48 | 132.61 | 50.43 | 86.78  |
|  65 | 73.04 | 140.28 | 53.18 | 90.61  |
|  66 | 81.28 | 150.64 | 57.91 | 96.72  |
|  67 | 89.54 | 161.01 | 62.64 | 102.81  |
|  68 | 97.79 | 171.38 | 67.36 | 108.90  |
|  69 | 106.04 | 181.75 | 72.09 | 114.99  |
|  70 | 114.29 | 192.11 | 76.82 | 121.08  |
|  71 | 121.99 | 204.19 | 82.42 | 130.21  |
|  72 | 129.69 | 213.29 | 88.01 | 139.36  |
|  73 | 137.38 | 222.39 | 93.61 | 148.48  |
|  74 | 145.08 | 231.51 | 99.21 | 157.63  |
|  75 | 152.78 | 240.63 | 104.80 | 166.76  |
|  76 | 168.04 | 259.51 | 116.06 | 179.00  |
|  77 | 182.36 | 278.40 | 126.73 | 194.73  |
|  78 | 197.22 | 297.28 | 137.80 | 212.75  |
|  79 | 207.18 | 316.17 | 145.48 | 225.54  |
|  80 | 217.13 | 335.05 | 153.15 | 238.34  |
|  81 | 247.61 | 366.88 | 174.37 | 252.95  |
|  82 | 267.54 | 398.71 | 188.19 | 271.90  |
|  83 | 287.83 | 430.55 | 202.21 | 290.83  |
|  84 | 308.43 | 462.38 | 216.49 | 308.20  |
|  85 | 322.08 | 494.22 | 230.97 | 325.58  |

$^{1}$ Unisex-Male rates for Montana

22

---

## IMMEDIATE SOLUTION

**ACCIDENTAL DEATH BENEFIT RIDER (ADR) PREMIUMS**

Annual premiums per unit ($1,000) of insurance

|  AGE | ANNUAL  |
| --- | --- |
|  18 | 2.20  |
|  19 | 2.21  |
|  20 | 2.22  |
|  21 | 2.23  |
|  22 | 2.24  |
|  23 | 2.26  |
|  24 | 2.27  |
|  25 | 2.28  |
|  26 | 2.29  |
|  27 | 2.30  |
|  28 | 2.31  |
|  29 | 2.32  |
|  30 | 2.33  |
|  31 | 2.34  |

|  AGE | ANNUAL  |
| --- | --- |
|  32 | 2.35  |
|  33 | 2.37  |
|  34 | 2.38  |
|  35 | 2.39  |
|  36 | 2.41  |
|  37 | 2.43  |
|  38 | 2.45  |
|  39 | 2.48  |
|  40 | 2.50  |
|  41 | 2.52  |
|  42 | 2.54  |
|  43 | 2.56  |
|  44 | 2.59  |
|  45 | 2.61  |

|  AGE | ANNUAL  |
| --- | --- |
|  46 | 2.63  |
|  47 | 2.65  |
|  48 | 2.67  |
|  49 | 2.71  |
|  50 | 2.73  |
|  51 | 2.76  |
|  52 | 2.79  |
|  53 | 2.84  |
|  54 | 2.89  |
|  55 | 2.95  |
|  56 | 3.01  |
|  57 | 3.08  |
|  58 | 3.16  |
|  59 | 3.25  |

|  AGE | ANNUAL  |
| --- | --- |
|  60 | 3.33  |
|  61 | 3.44  |
|  62 | 3.56  |
|  63 | 3.71  |
|  64 | 3.86  |
|  65 | 4.03  |
|  66 | 4.24  |
|  67 | 4.49  |
|  68 | 4.79  |
|  69 | 5.09  |
|  70 | 5.46  |

23

---

## 10-PAY SOLUTION

**PREFERRED PREMIUMS$^{1}$**

Annual premiums per unit ($1,000) of insurance

|  AGE | MALE | FEMALE  |
| --- | --- | --- |
|  0 | 18.23 | 16.44  |
|  1 | 18.55 | 16.72  |
|  2 | 18.85 | 16.99  |
|  3 | 19.17 | 17.27  |
|  4 | 19.48 | 17.54  |
|  5 | 19.80 | 17.82  |
|  6 | 20.34 | 18.23  |
|  7 | 20.88 | 18.64  |
|  8 | 21.43 | 19.06  |
|  9 | 21.96 | 19.47  |
|  10 | 22.51 | 19.88  |
|  11 | 23.29 | 20.39  |
|  12 | 24.08 | 20.90  |
|  13 | 24.85 | 21.42  |
|  14 | 25.64 | 21.93  |
|  15 | 26.42 | 22.44  |
|  16 | 28.37 | 23.64  |
|  17 | 30.32 | 24.85  |
|   | **NONTOBACCO** | **TOBACCO**  |
|  18 | 25.49 | 32.28  |
|  19 | 25.94 | 34.22  |
|  20 | 26.39 | 36.17  |
|  21 | 28.07 | 37.21  |
|  22 | 29.75 | 38.25  |
|  23 | 31.43 | 39.29  |
|  24 | 33.11 | 40.33  |
|  25 | 34.79 | 41.37  |
|  26 | 35.58 | 42.78  |
|  27 | 36.36 | 44.19  |
|  28 | 37.16 | 45.61  |
|  29 | 37.95 | 47.02  |
|  30 | 38.74 | 48.43  |
|  31 | 39.50 | 49.45  |
|  32 | 40.27 | 50.47  |
|  33 | 41.03 | 51.49  |
|  34 | 41.80 | 52.51  |
|  35 | 42.57 | 53.53  |
|  36 | 43.21 | 54.76  |
|  37 | 43.85 | 55.99  |
|  38 | 44.51 | 57.23  |
|  39 | 45.15 | 58.45  |
|  40 | 45.79 | 59.68  |
|  41 | 48.52 | 62.99  |
|  42 | 51.25 | 66.28  |

|   | **NONTOBACCO** | **TOBACCO** | **NONTOBACCO** | **TOBACCO**  |
| --- | --- | --- | --- | --- |
|  43 | 53.98 | 69.58 | 45.57 | 59.00  |
|  44 | 56.72 | 72.87 | 47.16 | 61.74  |
|  45 | 59.44 | 76.18 | 48.76 | 64.47  |
|  46 | 61.38 | 78.11 | 50.73 | 66.14  |
|  47 | 63.32 | 80.04 | 52.68 | 67.81  |
|  48 | 65.25 | 81.96 | 54.65 | 69.48  |
|  49 | 67.19 | 83.89 | 56.61 | 71.16  |
|  50 | 69.13 | 85.82 | 58.58 | 72.83  |
|  51 | 71.10 | 88.17 | 60.36 | 74.74  |
|  52 | 73.07 | 90.51 | 62.15 | 76.65  |
|  53 | 75.03 | 92.84 | 63.95 | 78.57  |
|  54 | 77.00 | 95.18 | 65.73 | 80.48  |
|  55 | 78.97 | 97.53 | 67.52 | 82.39  |
|  56 | 80.23 | 98.47 | 68.78 | 83.16  |
|  57 | 81.48 | 99.41 | 70.04 | 83.94  |
|  58 | 82.74 | 100.36 | 71.31 | 84.73  |
|  59 | 84.00 | 101.30 | 72.57 | 85.51  |
|  60 | 85.26 | 102.24 | 73.83 | 86.28  |
|  61 | 88.15 | 105.66 | 75.92 | 88.34  |
|  62 | 91.04 | 109.08 | 78.01 | 90.40  |
|  63 | 93.93 | 112.48 | 80.09 | 92.46  |
|  64 | 96.82 | 115.90 | 82.19 | 94.52  |
|  65 | 99.71 | 119.32 | 84.27 | 96.58  |
|  66 | 103.48 | 124.18 | 86.84 | 99.86  |
|  67 | 107.26 | 129.02 | 89.41 | 103.14  |
|  68 | 111.03 | 133.88 | 91.98 | 106.44  |
|  69 | 114.82 | 138.73 | 94.55 | 109.72  |
|  70 | 118.59 | 143.59 | 97.12 | 113.00  |
|  71 | 122.83 | 149.51 | 100.74 | 117.50  |
|  72 | 127.08 | 155.42 | 104.36 | 122.01  |
|  73 | 131.33 | 161.35 | 107.98 | 126.52  |
|  74 | 135.57 | 174.23 | 111.60 | 131.02  |
|  75 | 139.81 | 180.40 | 115.22 | 135.52  |
|  76 | 148.70 | 194.63 | 121.97 | 145.16  |
|  77 | 157.58 | 208.85 | 128.72 | 154.81  |
|  78 | 166.47 | 223.08 | 135.48 | 164.45  |
|  79 | 175.35 | 237.30 | 142.22 | 174.10  |
|  80 | 184.24 | 251.53 | 148.97 | 183.73  |
|  81 | 195.31 | 272.29 | 156.40 | 195.39  |
|  82 | 206.39 | 293.04 | 163.83 | 207.04  |
|  83 | 217.46 | 313.80 | 171.27 | 218.69  |
|  84 | 238.06 | 334.55 | 178.70 | 239.94  |
|  85 | 249.59 | 355.31 | 186.13 | 252.08  |

$^{1}$ Unisex-Male rates for Montana

24

---

## 10-PAY SOLUTION

**STANDARD PREMIUMS$^{1}$**

Annual premiums per unit ($1,000) of insurance[{"box_2d": [80, 112, 483, 927], "label": "table", "caption": "|  AGE | MALE | FEMALE  |
| --- | --- | --- |
|  0 | 20.68 | 17.85  |
|  1 | 20.84 | 18.02  |
|  2 | 21.01 | 18.19  |
|  3 | 21.18 | 18.37  |
|  4 | 21.35 | 18.55  |
|  5 | 21.51 | 18.72  |
|  6 | 22.23 | 19.18  |
|  7 | 22.95 | 19.64  |
|  8 | 23.66 | 20.10  |
|  9 | 24.38 | 20.56  |
|  10 | 25.10 | 21.02  |
|  11 | 26.26 | 21.62  |
|  12 | 27.42 | 22.21  |
|  13 | 28.57 | 22.81  |
|  14 | 29.73 | 23.40  |
|  15 | 30.88 | 24.00  |
|  16 | 32.45 | 25.56  |
|  17 | 34.00 | 27.11  |
|   | **NONTOBACCO** | **TOBACCO**  |
|  18 | 26.57 | 35.57  |
|  19 | 27.00 | 37.12  |
|  20 | 27.32 | 38.69  |
|  21 | 29.18 | 40.00  |
|  22 | 31.05 | 41.32  |
|  23 | 32.91 | 42.64  |
|  24 | 34.77 | 43.96  |
|  25 | 36.63 | 45.27  |
|  26 | 37.38 | 46.93  |
|  27 | 38.12 | 48.60  |
|  28 | 38.87 | 50.25  |
|  29 | 39.61 | 51.91  |
|  30 | 40.36 | 53.57  |
|  31 | 41.20 | 54.46  |
|  32 | 42.05 | 55.35  |
|  33 | 42.89 | 56.26  |
|  34 | 43.74 | 57.15  |
|  35 | 44.58 | 58.04  |
|  36 | 45.41 | 59.46  |
|  37 | 46.23 | 60.88  |
|  38 | 47.06 | 62.30  |
|  39 | 47.88 | 63.72  |
|  40 | 48.71 | 65.15  |
|  41 | 52.14 | 69.75  |
|  42 | 55.56 | 74.37  |

|  AGE | MALE | FEMALE  |
| --- | --- | --- |
|   | **NONTOBACCO** | **TOBACCO**  |
|  43 | 58.98 | 78.98  |
|  44 | 62.40 | 83.60  |
|  45 | 65.83 | 88.20  |
|  46 | 68.16 | 90.75  |
|  47 | 70.49 | 93.29  |
|  48 | 72.84 | 95.84  |
|  49 | 75.17 | 98.38  |
|  50 | 77.50 | 100.92  |
|  51 | 79.96 | 104.14  |
|  52 | 82.42 | 107.36  |
|  53 | 84.87 | 110.57  |
|  54 | 87.33 | 113.79  |
|  55 | 89.79 | 117.00  |
|  56 | 92.29 | 118.92  |
|  57 | 94.79 | 120.85  |
|  58 | 97.30 | 122.77  |
|  59 | 99.79 | 124.70  |
|  60 | 102.30 | 126.62  |
|  61 | 106.54 | 132.21  |
|  62 | 110.78 | 137.80  |
|  63 | 115.04 | 143.39  |
|  64 | 119.28 | 148.97  |
|  65 | 123.52 | 154.56  |
|  66 | 128.53 | 161.47  |
|  67 | 133.54 | 168.39  |
|  68 | 138.55 | 175.31  |
|  69 | 143.55 | 182.23  |
|  70 | 148.56 | 197.02  |
|  71 | 154.51 | 206.23  |
|  72 | 160.46 | 215.44  |
|  73 | 166.41 | 224.64  |
|  74 | 172.36 | 233.85  |
|  75 | 178.31 | 243.06  |
|  76 | 189.09 | 262.13  |
|  77 | 199.87 | 281.21  |
|  78 | 210.66 | 300.28  |
|  79 | 221.44 | 319.36  |
|  80 | 232.22 | 338.43  |
|  81 | 248.25 | 370.59  |
|  82 | 275.27 | 402.74  |
|  83 | 291.96 | 434.90  |
|  84 | 308.64 | 467.05  |
|  85 | 325.33 | 499.21  |

|  AGE | MALE | FEMALE  |
| --- | --- | --- |
|   | **NONTOBACCO** | **TOBACCO**  |
|  43 | 58.98 | 78.98  |
|  44 | 62.40 | 83.60  |
|  45 | 65.83 | 88.20  |
|  46 | 68.16 | 90.75  |
|  47 | 70.49 | 93.29  |
|  48 | 72.84 | 95.84  |
|  49 | 75.17 | 98.38  |
|  50 | 77.50 | 100.92  |
|  51 | 79.96 | 104.14  |
|  52 | 82.42 | 107.36  |
|  53 | 84.87 | 110.57  |
|  54 | 87.33 | 113.79  |
|  55 | 89.79 | 117.00  |
|  56 | 92.29 | 118.92  |
|  57 | 94.79 | 120.85  |
|  58 | 97.30 | 122.77  |
|  59 | 99.79 | 124.70  |
|  60 | 102.30 | 126.62  |
|  61 | 106.54 | 132.21  |
|  62 | 110.78 | 137.80  |
|  63 | 115.04 | 143.39  |
|  64 | 119.28 | 148.97  |
|  65 | 123.52 | 154.56  |
|  66 | 128.53 | 161.47  |
|  67 | 133.54 | 168.39  |
|  68 | 138.55 | 175.31  |
|  69 | 143.55 | 182.23  |
|  70 | 148.56 | 197.02  |
|  71 | 154.51 | 206.23  |
|  72 | 160.46 | 215.44  |
|  73 | 166.41 | 224.64  |
|  74 | 172.36 | 233.85  |
|  75 | 178.31 | 243.06  |
|  76 | 189.09 | 262.13  |
|  77 | 199.87 | 281.21  |
|  78 | 210.66 | 300.28  |
|  79 | 221.44 | 319.36  |
|  80 | 232.22 | 338.43  |
|  81 | 248.25 | 370.59  |
|  82 | 275.27 | 402.74  |
|  83 | 291.96 | 434.90  |
|  84 | 308.64 | 467.05  |
|  85 | 325.33 | 499.21  |

|  AGE | MALE | FEMALE  |   |
| --- | --- | --- | --- |
|   | **NONTOBACCO** | **TOBACCO**  |   |
|  43 | 58.98 | 78.98  |   |
|  44 | 62.40 | 83.60 | 58.41  |
|  45 | 65.83 | 88.20 | 52.20  |
|  46 | 68.16 | 90.75 | 52.37  |
|  47 | 70.49 | 93.29 | 57.54  |
|  48 | 72.84 | 95.84 | 59.71  |
|  49 | 75.17 | 98.38 | 61.88  |
|  50 | 77.50 | 100.92 | 64.05  |
|  51 | 79.96 | 104.14 | 66.03  |
|  52 | 82.42 | 107.36 | 68.02  |
|  53 | 84.87 | 110.57 | 69.99  |
|  54 | 87.33 | 113.79 | 71.98  |
|  55 | 89.79 | 117.00 | 73.96  |
|  56 | 92.29 | 118.92 | 75.83  |
|  57 | 94.79 | 120.85 | 77.70  |
|  58 | 97.30 | 122.77 | 79.58  |
|  59 | 99.79 | 124.70 | 81.46  |
|  60 | 102.30 | 126.62 | 83.33  |
|  61 | 106.54 | 132.21 | 86.04  |
|  62 | 110.78 | 137.80 | 88.75  |
|  63 | 115.04 | 143.39 | 91.47  |
|  64 | 119.28 | 148.97 | 94.18  |
|  65 | 123.52 | 154.56 | 96.89  |
|  66 | 128.53 | 161.47 | 100.44  |
|  67 | 133.54 | 168.39 | 103.98  |
|  68 | 138.55 | 175.31 | 107.53  |
|  69 | 143.55 | 182.23 | 111.07  |
|  70 | 148.56 | 197.02 | 114.61  |
|  71 | 154.51 | 206.23 | 119.55  |
|  72 | 160.46 | 215.44 | 124.48  |
|  73 | 166.41 | 224.64 | 129.42  |
|  74 | 172.36 | 233.85 | 134.35  |
|  75 | 178.31 | 243.06 | 139.29  |
|  76 | 189.09 | 262.13 | 147.24  |
|  77 | 199.87 | 281.21 | 155.17  |
|  78 | 210.66 | 300.28 | 163.12  |
|  79 | 221.44 | 319.36 | 171.06  |
|  80 | 232.22 | 338.43 | 179.01  |
|  81 | 248.25 | 370.59 | 189.14  |
|  82 | 275.27 | 402.74 | 199.28  |
|  83 | 291.96 | 434.90 | 209.40  |
|  84 | 308.64 | 467.05 | 219.54  |
|  85 | 325.33 | 499.21 | 239.24  |

|  85 | 325.33 | 499.21  |
| --- | --- | --- |<tr><td>100.44</td><td>122.22</td></tr><tr><td>103.98</td><td>126.50</td></tr><tr><td>107.53</td><td>130.79</td></tr><tr><td>110.07</td><td>135.07</td></tr><tr><td>115.07</td><td>135.07</td></tr><tr><td>119.35</td><td>139.35</td></tr><tr><td>119.55</td><td>145.80</td></tr><tr><td>124.48</td><td>152.24</td></tr><tr><td>129.42</td><td>158.67</td></tr><tr><td>134.35</td><td>165.11</td></tr><tr><td>139.29</td><td>171.55</td></tr><tr><td>144.24</td><td>183.53</td></tr><tr><td>149.51</td><td>195.51</td></tr><tr><td>155.17</td><td>195.51</td></tr><tr><td>163.12</td><td>216.13</td></tr><tr><td>171.06</td><td>228.61</td></tr><tr><td>178.01</td><td>241.09</td></tr><tr><td>181.14</td><td>258.65</td></tr><tr><td>188.14</td><td>258.65</td></tr><tr><td>196.20</td><td>276.20</td></tr><tr><td>199.28</td><td>293.76</td></tr><tr><td>206.40</td><td>311.31</td></tr><tr><td>213.31</td><td>328.87</td></tr></table>|  AGE | MALE | FEMALE  |   |
| --- | --- | --- | --- |
|   | **NONTOBACCO** | **TOBACCO**  |   |
|  43 | 58.98 | 78.98 | 48.76  |
|  44 | 62.40 | 83.60 | 50.99  |
|  45 | 65.83 | 88.20 | 53.20  |
|  46 | 68.16 | 90.75 | 55.37  |
|  47 | 70.49 | 93.29 | 57.54  |
|  48 | 72.84 | 95.84 | 59.71  |
|  49 | 75.17 | 98.38 | 61.88  |
|  50 | 77.50 | 100.92 | 64.05  |
|  51 | 79.96 | 104.14 | 66.03  |
|  52 | 82.42 | 107.36 | 68.02  |
|  53 | 84.87 | 110.57 | 69.99  |
|  54 | 87.33 | 113.79 | 71.98  |
|  55 | 89.79 | 117.00 | 73.96  |
|  56 | 92.29 | 118.92 | 75.83  |
|  57 | 94.79 | 120.85 | 77.70  |
|  58 | 97.30 | 122.77 | 79.58  |
|  59 | 99.79 | 124.70 | 81.46  |
|  60 | 102.30 | 126.62 | 83.33  |
|  61 | 106.54 | 132.21 | 86.04  |
|  62 | 110.78 | 137.80 | 88.75  |
|  63 | 115.04 | 143.39 | 91.47  |
|  64 | 119.28 | 148.97 | 94.18  |
|  65 | 123.52 | 154.56 | 96.89  |
|  66 | 128.53 | 161.47 | 100.44  |
|  67 | 133.54 | 168.39 | 103.98  |
|  68 | 138.55 | 175.31 | 107.53  |
|  69 | 143.55 | 182.23 | 111.07  |
|  70 | 148.56 | 197.02 | 114.61  |
|  71 | 154.51 | 206.23 | 119.55  |
|  72 | 160.46 | 215.44 | 124.48  |
|  73 | 166.41 | 224.64 | 129.42  |
|  74 | 172.36 | 233.85 | 134.35  |
|  75 | 178.31 | 243.06 | 139.29  |
|  76 | 189.09 | 262.13 | 147.24  |
|  77 | 199.87 | 281.21 | 155.17  |
|  78 | 210.66 | 300.28 | 163.12  |
|  79 | 221.44 | 319.36 | 171.06  |
|  80 | 232.22 | 338.43 | 179.01  |
|  81 | 248.25 | 370.59 | 189.14  |
|  82 | 275.27 | 402.74 | 199.28  |
|  83 | 291.96 | 434.90 | 209.40  |
|  84 | 308.64 | 467.05 | 219.54  |
|  85 | 325.33 | 499.21 | 239.24  |

|  85 | 325.33 | 499.21  |
| --- | --- | --- |<tr><td>100.44</td><td>122.22</td></tr><tr><td>103.98</td><td>126.50</td></tr><tr><td>107.53</td><td>130.79</td></tr><tr><td>110.07</td><td>135.07</td></tr><tr><td>115.07</td><td>135.07</td></tr><tr><td>119.35</td><td>139.35</td></tr><tr><td>124.80</td><td>145.80</td></tr><tr><td>129.42</td><td>152.24</td></tr><tr><td>134.35</td><td>158.67</td></tr><tr><td>139.29</td><td>165.11</td></tr><tr><td>144.24</td><td>171.55</td></tr><tr><td>149.51</td><td>178.31</td></tr><tr><td>155.17</td><td>195.51</td></tr><tr><td>160.46</td><td>218.13</td></tr><tr><td>165.12</td><td>216.13</td></tr><tr><td>171.06</td><td>228.61</td></tr><tr><td>178.01</td><td>241.09</td></tr><tr><td>181.14</td><td>258.65</td></tr><tr><td>188.14</td><td>258.65</td></tr><tr><td>196.20</td><td>276.20</td></tr><tr><td>199.28</td><td>293.76</td></tr><tr><td>206.40</td><td>311.31</td></tr><tr><td>213.31</td><td>328.87</td></tr></table>|  AGE | MALE | FEMALE  |   |
| --- | --- | --- | --- |
|   | **NONTOBACCO** | **TOBACCO**  |   |
|  43 | 58.98 | 78.98 | 48.76  |
|  44 | 62.40 | 83.60 | 50.99  |
|  45 | 65.83 | 88.20 | 53.20  |
|  46 | 68.16 | 90.75 | 55.37  |
|  47 | 70.49 | 93.29 | 57.54  |
|  48 | 72.84 | 95.84 | 59.71  |
|  49 | 75.17 | 98.38 | 61.88  |
|  50 | 77.50 | 100.92 | 64.05  |
|  51 | 79.96 | 104.14 | 66.03  |
|  52 | 82.42 | 107.36 | 68.02  |
|  53 | 84.87 | 110.57 | 69.99  |
|  54 | 87.33 | 113.79 | 71.98  |
|  55 | 89.79 | 117.00 | 73.96  |
|  56 | 92.29 | 118.92 | 75.83  |
|  57 | 94.79 | 120.85 | 77.70  |
|  58 | 97.30 | 122.77 | 79.58  |
|  59 | 99.79 | 124.70 | 81.46  |
|  60 | 102.30 | 126.62 | 83.33  |
|  61 | 106.54 | 132.21 | 86.04  |
|  62 | 110.78 | 137.80 | 88.75  |
|  63 | 115.04 | 143.39 | 91.47  |
|  64 | 119.28 | 148.97 | 94.18  |
|  65 | 123.52 | 154.56 | 96.89  |
|  66 | 128.53 | 161.47 | 100.44  |
|  67 | 133.54 | 168.39 | 103.98  |
|  68 | 138.55 | 175.31 | 107.53  |
|  69 | 143.55 | 182.23 | 111.07  |
|  70 | 148.56 | 197.02 | 114.61  |
|  71 | 154.51 | 206.23 | 119.55  |
|  72 | 160.46 | 215.44 | 124.48  |
|  73 | 166.41 | 224.64 | 129.42  |
|  74 | 172.36 | 233.85 | 134.35  |
|  75 | 178.31 | 243.06 | 139.29  |
|  76 | 189.09 | 262.13 | 147.24  |
|  77 | 199.87 | 281.21 | 155.17  |
|  78 | 210.66 | 300.28 | 163.12  |
|  79 | 221.44 | 319.36 | 171.06  |
|  80 | 232.22 | 338.43 | 179.01  |
|  81 | 248.25 | 370.59 | 189.14  |
|  82 | 275.27 | 402.74 | 199.28  |
|  83 | 291.96 | 434.90 | 209.40  |
|  84 | 308.64 | 467.05 | 219.54  |
|  85 | 325.33 | 499.21 | 239.24  |

|  85 | 325.33 | 499.21  |
| --- | --- | --- |<tr><td>100.44</td><td>122.22</td></tr><tr><td>103.98</td><td>126.50</td></tr><tr><td>107.53</td><td>130.79</td></tr><tr><td>110.07</td><td>135.07</td></tr><tr><td>115.07</td><td>135.07</td></tr><tr><td>119.35</td><td>139.35</td></tr><tr><td>124.80</td><td>145.80</td></tr><tr><td>129.42</td><td>152.24</td></tr><tr><td>134.35</td><td>158.67</td></tr><tr><td>139.29</td><td>165.11</td></tr><tr><td>144.24</td><td>171.55</td></tr><tr><td>149.51</td><td>178.31</td></tr><tr><td>155.17</td><td>195.51</td></tr><tr><td>160.46</td><td>218.13</td></tr><tr><td>165.12</td><td>216.13</td></tr><tr><td>171.06</td><td>228.61</td></tr><tr><td>178.01</td><td>241.09</td></tr><tr><td>181.14</td><td>258.65</td></tr><tr><td>188.14</td><td>258.65</td></tr><tr><td>196.20</td><td>276.20</td></tr><tr><td>199.28</td><td>293.76</td></tr><tr><td>206.40</td><td>311.31</td></tr><tr><td>213.31</td><td>328.87</td></tr></table>|  AGE | MALE | FEMALE  |   |
| --- | --- | --- | --- |
|   | **NONTOBACCO** | **TOBACCO**  |   |
|  43 | 58.98 | 78.98 | 48.76  |
|  44 | 62.40 | 83.60 | 50.99  |
|  45 | 65.83 | 88.20 | 53.20  |
|  46 | 68.16 | 90.75 | 55.37  |
|  47 | 70.49 | 93.29 | 57.54  |
|  48 | 72.84 | 95.84 | 59.71  |
|  49 | 75.17 | 98.38 | 61.88  |
|  50 | 77.50 | 100.92 | 64.05  |
|  51 | 79.96 | 104.14 | 66.03  |
|  52 | 82.42 | 107.36 | 68.02  |
|  53 | 84.87 | 110.57 | 69.99  |
|  54 | 87.33 | 113.79 | 71.98  |
|  55 | 89.79 | 117.00 | 73.96  |
|  56 | 92.29 | 118.92 | 75.83  |
|  57 | 94.79 | 120.85 | 77.70  |
|  58 | 97.30 | 122.77 | 79.58  |
|  59 | 99.79 | 124.70 | 81.46  |
|  60 | 102.30 | 126.62 | 83.33  |
|  61 | 106.54 | 132.21 | 86.04  |
|  62 | 110.78 | 137.80 | 88.75  |
|  63 | 115.04 | 143.39 | 91.47  |
|  64 | 119.28 | 148.97 | 94.18  |
|  65 | 123.52 | 154.56 | 96.89  |
|  66 | 128.53 | 161.47 | 100.44  |
|  67 | 133.54 | 168.39 | 103.98  |
|  68 | 138.55 | 175.31 | 107.53  |
|  69 | 143.55 | 182.23 | 111.07  |
|  70 | 148.56 | 197.02 | 114.61  |
|  71 | 154.51 | 206.23 | 119.55  |
|  72 | 160.46 | 215.44 | 124.48  |
|  73 | 166.41 | 224.64 | 129.42  |
|  74 | 172.36 | 233.85 | 134.35  |
|  75 | 178.31 | 243.06 | 139.29  |
|  76 | 189.09 | 262.13 | 147.24  |
|  77 | 199.87 | 281.21 | 155.17  |
|  78 | 210.66 | 300.28 | 163.12  |
|  79 | 221.44 | 319.36 | 171.06  |
|  80 | 232.22 | 338.43 | 179.01  |
|  81 | 248.25 | 370.59 | 189.14  |
|  82 | 275.27 | 402.74 | 199.28  |
|  83 | 291.96 | 434.90 | 209.40  |
|  84 | 308.64 | 467.05 | 219.54  |
|  85 | 325.33 | 499.21 | 239.24  |

|  |   |   |
| --- | --- | --- |
|  85 | 325.33 | 499.21  |<tr><td>100.44</td><td>122.22</td></tr></table>|  102.22 | 126.50  |
| --- | --- |

|  104.35 | 129.42  |
| --- | --- |
|  107.53 | 130.79  |
|  110.78 | 135.07  |
|  113.74 | 139.35  |
|  116.87 | 145.80  |
|  119.55 | 145.80  |
|  124.48 | 152.24  |
|  128.67 | 158.67  |
|  134.35 | 165.11  |
|  139.29 | 171.55  |
|  144.24 | 183.53  |
|  149.51 | 195.51  |
|  155.17 | 195.51  |
|  160.46 | 218.13  |
|  165.12 | 216.13  |
|  171.06 | 228.61  |
|  178.01 | 241.09  |
|  181.14 | 258.65  |
|  188.14 | 258.65  |
|  196.20 | 276.20  |
|  199.28 | 293.76  |
|  206.40 | 311.31  |
|  213.31 | 328.87  |

|  AGE | MALE | FEMALE  |   |   |
| --- | --- | --- | --- | --- |
|   | **NONTOBACCO** | **TOBACCO**  |   |   |
|  43 | 58.98 | 78.98  |   |   |
|  44 | 62.40 | 83.60  |   |   |
|  45 | 65.83 | 88.20  |   |   |
|  46 | 68.16 | 90.75  |   |   |
|  47 | 70.49 | 93.29  |   |   |
|  48 | 72.84 | 95.84  |   |   |
|  49 | 75.17 | 98.38  |   |   |
|  50 | 77.50 | 100.92  |   |   |
|  51 | 79.96 | 104.14  |   |   |
|  52 | 82.42 | 107.36  |   |   |
|  53 | 84.87 | 110.57  |   |   |
|  54 | 87.33 | 113.79  |   |   |
|  55 | 89.79 | 117.00  |   |   |
|  56 | 92.29 | 118.92  |   |   |
|  57 | 94.79 | 120.85  |   |   |
|  58 | 97.30 | 122.77  |   |   |
|  59 | 99.79 | 124.70  |   |   |
|  60 | 102.30 | 126.62  |   |   |
|  61 | 106.54 | 132.21  |   |   |
|  62 | 110.78 | 137.80  |   |   |
|  63 | 115.04 | 143.39  |   |   |
|  64 | 119.28 | 148.97  |   |   |
|  65 | 123.52 | 154.56  |   |   |
|  66 | 128.53 | 161.47  |   |   |
|  67 | 133.54 | 168.39  |   |   |
|  68 | 138.55 | 175.31  |   |   |
|  69 | 143.55 | 182.23  |   |   |
|  70 | 148.56 | 197.02  |   |   |
|  71 | 154.51 | 206.23  |   |   |
|  72 | 160.46 | 215.44  |   |   |
|  73 | 166.41 | 224.64  |   |   |
|  74 | 172.36 | 233.85  |   |   |
|  75 | 178.31 | 243.06  |   |   |
|  76 | 189.09 | 262.13  |   |   |
|  77 | 199.87 | 281.21  |   |   |
|  78 | 210.66 | 300.28  |   |   |
|  79 | 221.44 | 319.36  |   |   |
|  80 | 232.22 | 338.43 | 179.01  |   |
|  81 | 248.25 | 370.59 | 189.14  |   |
|  82 | 275.27 | 402.74 | 199.28  |   |
|  83 | 291.96 | 434.90 | 209.40  |   |
|  84 | 308.64 | 467.05 | 219.54 | 311.31  |
|  85 | 325.33 | 499.21 | 239.24 | 328.87  |

|  85 | 325.33 | 499.21 | 239.24 | 328.87  |
| --- | --- | --- | --- | --- |<t<thead><tr><th>N

---

## EASY SOLUTION

**PREMIUMS$^{1}$**

Annual premiums per unit ($1,000) of insurance

|  AGE | MALE | FEMALE  |
| --- | --- | --- |
|  18 | 37.74 | 28.48  |
|  19 | 38.29 | 29.05  |
|  20 | 38.83 | 29.61  |
|  21 | 39.38 | 30.17  |
|  22 | 39.93 | 30.75  |
|  23 | 40.48 | 31.30  |
|  24 | 41.04 | 31.87  |
|  25 | 41.59 | 32.43  |
|  26 | 42.19 | 32.95  |
|  27 | 42.85 | 33.44  |
|  28 | 43.50 | 33.97  |
|  29 | 44.06 | 34.56  |
|  30 | 44.52 | 35.30  |
|  31 | 44.63 | 36.07  |
|  32 | 44.74 | 37.01  |
|  33 | 44.86 | 38.13  |
|  34 | 45.01 | 39.47  |
|  35 | 45.33 | 40.81  |
|  36 | 47.79 | 42.67  |
|  37 | 49.91 | 44.43  |
|  38 | 52.36 | 46.31  |
|  39 | 55.44 | 48.66  |
|  40 | 59.04 | 51.17  |
|  41 | 61.48 | 53.26  |
|  42 | 64.26 | 55.43  |
|  43 | 66.94 | 57.50  |
|  44 | 69.51 | 59.46  |
|  45 | 72.13 | 61.48  |
|  46 | 74.58 | 63.09  |
|  47 | 77.17 | 64.81  |
|  48 | 79.84 | 66.52  |
|  49 | 81.94 | 67.70  |

|  AGE | MALE | FEMALE  |
| --- | --- | --- |
|  50 | 83.93 | 68.76  |
|  51 | 87.47 | 70.99  |
|  52 | 90.91 | 73.13  |
|  53 | 94.45 | 75.38  |
|  54 | 98.02 | 77.65  |
|  55 | 102.11 | 80.25  |
|  56 | 105.45 | 82.50  |
|  57 | 108.54 | 84.61  |
|  58 | 111.73 | 86.84  |
|  59 | 115.47 | 89.39  |
|  60 | 120.10 | 92.45  |
|  61 | 126.98 | 96.78  |
|  62 | 133.86 | 101.13  |
|  63 | 140.71 | 105.48  |
|  64 | 147.59 | 109.82  |
|  65 | 154.47 | 114.16  |
|  66 | 161.38 | 119.68  |
|  67 | 168.30 | 125.22  |
|  68 | 175.20 | 130.74  |
|  69 | 182.11 | 136.26  |
|  70 | 201.71 | 141.79  |
|  71 | 214.40 | 148.84  |
|  72 | 227.10 | 155.89  |
|  73 | 239.78 | 162.95  |
|  74 | 252.49 | 169.99  |
|  75 | 265.18 | 177.05  |
|  76 | 285.79 | 189.04  |
|  77 | 311.96 | 201.04  |
|  78 | 341.84 | 213.05  |
|  79 | 363.37 | 236.82  |
|  80 | 384.91 | 250.26  |

$^{1}$Unisex-Male rates for Montana

26

---

## CALCULATING A RATE

|  MODE OF PAYMENT^{1} | POLICY FEE (Face amounts less than $5,000) | POLICY FEE (Face amounts $5,000+) | MODAL FACTOR  |
| --- | --- | --- | --- |
|  Annual | $60.00 | $42.00 | 1.00  |
|  Semiannual | N/A | N/A | 0.51  |
|  Quarterly | N/A | N/A | 0.2575  |
|  EFT (monthly) | N/A | N/A | 0.086  |

$^{1}$You must calculate the total annual cost first to properly calculate the other modes of payment (see below example).

**EXAMPLE USING THE IMMEDIATE SOLUTION PRODUCT:**

Male, age 55, face amount $15,000 (15 units), preferred nontobacco, monthly EFT

1. Take the annual rate per $1,000 (unit) from rate table $37.38
2. Multiply by the number of units $37.38 x 15 = $560.70
3. Add policy fee $42.00
4. Add the sums of steps 2 and 3 for total annual cost $560.70 + $42.00 = $602.70
5. Multiply by modal factor and round to nearest cent $602.70 x 0.086 = $51.83 per month

**To add optional Accidental Death Benefit Rider (ADR)**

- Please note: The ADR amount must equal the corresponding policy face amount. Thus, in our example above, the available rider amount would be $15,000 (15 units).
1. Take the annual rate per unit ($1,000) from ADR rate table on page 23 $2.95
2. Multiply by number of units $2.95 x 15 = $44.25
3. Multiply by modal factor and round to nearest cent $44.25 x 0.086 = $3.81
4. Add the monthly ADR amount to the premium calculated in step five above $3.81 + $51.83 = $55.64

**To add the optional Children's and Grandchildren's Benefit Rider (CGR)**

- For this example, we will be adding $5,000 (5 units) of coverage for four children/grandchildren to the policy.
1. Multiply the child/grandchild rider annual rate of $2.00 by the number of units $2.00 x 5 = $10.00
2. Multiply by modal factor and round to nearest cent $10.00 x 0.086 = $0.86
3. Multiply by the number of children/grandchildren $0.86 x 4 = $3.44
4. Add the modal amount for child/grandchild rider to the amount in step four above $3.44 + $55.64 = $59.08 (per month)

27

---

## Fast, easy protection so everyone can get back to life.

Let's get started today.

![info icon]() **Visit:** transamerica.com/insurance/final-expense-life-insurance

![info icon]() **Quote:** transamerica.com/quote-fe

SCAN ME

DIGITAL AGENT BROCHURE** [103, [103, [103,[SEAL]ME"}]

SCAN ME

CONSUMER BROCHURE**

**For Agent Use Only. Not for Public Distribution.**

*Immediate Solution, 10-Pay Solution, and the Easy Solution* are whole life insurance policies issued by Transamerica Financial Life Insurance Company, Harrison, NY 10528 in New York or by Transamerica Life Insurance Company, Cedar Rapids, IA 52499 in all other jurisdictions. Policy form and number may vary, and this product and riders may not be available in all jurisdictions. Policy Form # TPWL10IC-0818 or TPWL10-0818. Insurance eligibility and premiums are subject to underwriting.

Not all applicants will qualify for nonmedical underwriting. It is not guaranteed issue and the underwriter reserves the right to request additional medical exams and data.

2644970R5

© 2023 Transamerica Corporation. All Rights Reserved. | 12/23

**TRANSAMERICA®**


<!-- source:FE_PORTFOLIO_CONSUMER_BROCHURE.md -->

# Transamerica Final Expense Solutions Portfolio — Consumer Brochure

**Source:** [Final Expense Consumer Brochure](https://cdn.brandfolder.io/86JM1UOD/as/qf9nis-a2apt4-7ntwm0/Final_Expense_Consumer_Brochure)  
**Local PDF:** `source_pdfs/Final_Expense_Consumer_Brochure.pdf` (~969 KB, 8 pages)  
**Full text:** `source_pdfs/Final_Expense_Consumer_Brochure.txt`  
**Revision:** **126671R6** · dated **04/26** · ©2026  
**Extracted:** 2026-07-22  
**Audience:** Consumer  

## Scope

**Portfolio FE only** — Immediate Solution, 10-Pay Solution, Easy Solution. **Not** FE Express (see `FE_EXPRESS_CONSUMER_BROCHURE.md`).

| Product | Form (brochure) |
|---------|-----------------|
| Immediate / 10-Pay | ICC18 TPWL10IC-0818 |
| Easy Solution | ICC18 TPWL11IC-0818 |
| ADB + Nursing Home | ICC18 TRAC10IC-0818 |
| Accidental Death | ICC18 TRAD10IC-0818 |
| Children’s/Grandchildren’s | ICC18 TRCR10IC-0818 |

Issuers: Transamerica Life (Cedar Rapids, IA) or Transamerica Financial Life (Harrison, NY).

## Objection / cost talking points

- Social Security lump sum: **$255** if qualify (SSA 2026 cite)  
- VA nonservice-related burial benefit: **$978** if qualify (VA 2025) — brochure states this as a single figure (Veterans flyer breaks out plot + allowance)  
- Estimated funeral range: **$16,295–$31,495** (NFDA 2023 + cemetery estimates)  
- Includes blank needs worksheet (recommended coverage, existing LI, dependents)

## Product features (p.5)

| | Immediate | 10-Pay | Easy (graded) |
|--|-----------|--------|---------------|
| Issue ages | **0–85** (paid-up age 121) | **0–85** (10 years premiums) | **18–80**; **NY: 50–75** only for graded |
| Min DB | **$1,000** | **$1,000** | **$1,000** |
| Max DB | Age-banded: 0–55 **$50k** · 56–65 **$40k** · 66–75 **$30k** · 76–85 **$25k** | Same | **$25,000** all ages |
| Death benefit | Full face day one (all states) | Full face day one | Yrs 1–2: full face if **accidental**; else **110% of premiums** − loans; then full face |

### Safe & predictable / flexible / speed

- Guaranteed fixed premiums; Direct Express® Debit MasterCard® for SS benefits  
- Won’t cancel if premiums paid (**2-year contestability**)  
- Cash value / loans / RPU option; income tax-free DB (general)  
- No exam/labs; automated UW; same-day approval possible; coverage can begin immediately  

## Riders (p.6)

**On Immediate & 10-Pay (no additional premium):**  
- **ADB + Nursing Home** (state availability); not if ADL assistance needed at app  
- **ADB (Florida only)**  

**CA only:** Terminal Illness ADB — accelerate up to 100% of face (less discounts/fees) if death expected within **12 months** of physician statement  

**Optional (additional premium):**  
- **Accidental Death (ADR)** — Immediate only; ages **18–70**; equal to base face; death within **90 days** of accident  
- **Children’s/Grandchildren’s (CGR)** — Immediate only; parent/GP **18–75**; child **15 days–18**; min $1,000; max lesser of base face or **$5,000**; level term with conversion  

## Disclosures

- Life insurance ≠ prepaid funeral; proceeds may be used for any purpose  
- Suicide (most states, first 2 years): return of premiums only  

## RAG / Julie use

Consumer specs for Immediate / 10-Pay / Easy and rider menu. Cross-check Comparison Flyer for Express vs Immediate fit. No premium rates. Prefer Agent/UW guide when available for UW detail.


<!-- source:FE_PORTFOLIO_ENHANCEMENTS_FLYER.md -->

# Transamerica Final Expense — Selling Experience Enhancements Flyer

**Source:** [Final Expense Enhancements Flyer](https://cdn.bfldr.com/86JM1UOD/as/4jprgq9bq5f9fb3wghn8fcp5/Final_Expense_Enhancements_Flyer)  
**Local PDF:** `source_pdfs/Final_Expense_Enhancements_Flyer.pdf` (~191 KB, 2 pages)  
**Full text:** `source_pdfs/Final_Expense_Enhancements_Flyer.txt`  
**Code:** **3023903** · dated **07/23** · ©**2023**  
**Extracted:** 2026-07-22  
**Audience:** **For Agent Use Only. Not for Public Distribution.**

## Scope (important)

Applies to the **Final Expense Solutions Portfolio** — **Immediate Solution**, **10-Pay Solution**, and **Easy Solution** (forms **TPWL10IC-0818** / **TPWL10-0818**).  

**Not** the FE Express / Graded FE Express product line (ICC23 TPWL14/15). Do not mix these UW class improvements with Express Select/Premier/Graded charts in the Agent Guide.

## Positioning

Carrier pitch: improved streamlined UW so agents sell more / place faster; digital app with more real-time decisions.

## Improved adult risk class* (condition → new vs old)

\* Subject to all other factors. “With activity credit” noted where listed.

| Condition | New rating | Old rating |
|-----------|------------|------------|
| Anemia (other than sickle cell) + activity credit | Graded / Standard | Graded / N/A |
| Asthma (chronic) + activity credit | Standard / Preferred | Graded / N/A |
| Bronchitis (chronic) + activity credit | Standard / Preferred | Graded / Standard |
| Heart disease | Preferred | Standard |
| Heart failure (CHF or diastolic) + activity credit | Standard / N/A | Graded / Standard |
| Hospitalization (within last 12 months – excludes currently) + activity credit | Standard / Preferred | Standard / N/A |
| Liver disease or cirrhosis + activity credit | Standard / N/A | Graded / Standard |
| Respiratory disease (black lung, COPD, emphysema) + activity credit | Standard / Preferred | Graded / Standard |
| Supplemental oxygen use + activity credit | Standard / Preferred | Graded / Standard |
| Stroke or TIA + activity credit | Standard / Preferred | Standard / N/A |

*(Two-column “NEW/OLD” cells in the PDF often show Preferred vs Standard class pairs; treat as marketing summary — confirm in current portfolio UW guide before quoting.)*

## Other portfolio features (p.2)

- Real-time UW¹ via **iGO® e-App** (**not available in New York**)
- **eDelivery** opt-in via iGO; email notifications; download policy — not all cases eligible; **DocFast®** by iPipeline®
- **Social Security benefit billing** — aligns draft to benefit deposit; setup ~**3 days** from app to benefit deposit date

## Issuer / forms

- NY: Transamerica Financial Life, Harrison, NY  
- Other jurisdictions: Transamerica Life, Cedar Rapids, IA  
- Policy Form # **TPWL10IC-0818** or **TPWL10-0818**  
- Not GI; UW may request exams/data

## Links in flyer

- Product page: https://www.transamerica.com/insurance/final-expense-life-insurance  
- Quote: https://www.transamerica.com/quote-fe  

## RAG / Julie use

Historical/portfolio FE UW relaxation snapshot (2023). Prefer current **portfolio Agent & Underwriting guide** when available. For Express, use `FE_EXPRESS_AGENT_GUIDE.md` UW charts instead.


<!-- source:FE_PORTFOLIO_VETERANS_FLYER.md -->

# Transamerica Final Expense — Flyer for Veterans

**Source:** [Final Expense Flyer for Veterans](https://cdn.bfldr.com/86JM1UOD/as/j9fsxh96jsjq895tpk6c4njk/Final_Expense_Flyer_for_Veterans)  
**Local PDF:** `source_pdfs/Final_Expense_Flyer_for_Veterans.pdf` (~279 KB, 2 pages)  
**Full text:** `source_pdfs/Final_Expense_Flyer_for_Veterans.txt`  
**Revision:** **3026934R1** · dated **11/25** · ©2025  
**Extracted:** 2026-07-22  
**Audience:** Consumer / veteran prospecting

## Scope

**Final Expense Solutions Portfolio** (not FE Express):

| Product | Form |
|---------|------|
| 10-Pay & Immediate Solution | ICC18 TPWL10IC-1018 or TPWL10IC-1018 |
| Easy Solution | ICC18 TPWL11IC-0818 or TPWL11IC-0818 |

Issuers: Transamerica Life (Cedar Rapids, IA) or Transamerica Financial Life (Harrison, NY). Eligibility/premiums subject to UW.

## Messaging

- Level-premium whole life; flexible face; guaranteed DB; digital app + real-time UW decisions  
- Bridge gap when VA / existing coverage is too small for expected final expenses  
- Premiums don’t change with age/health after issue; younger issue → typically better rate  

### Veteran UW talking point (flyer claim)

> “We don’t count **most common service-related conditions** against you, including **most mental health diagnoses**.”

Treat as marketing summary — confirm details in current portfolio Agent/UW guide before advising a specific condition.

## VA benefit objection (flyer figures, 2025)

If qualify, VA final expense for **nonservice-related** death: **$978** plot + **$978** burial allowance (whether or not hospitalized by VA at death).¹  
Source cited: VA “Burial Benefits,” 2025.

*(FE Express Consumer Brochure used older $796/$300/$796 figures — prefer this flyer’s 2025 numbers when discussing VA for portfolio FE, and re-check VA.gov for live amounts.)*

## Cost estimates (flyer)

| Item | Amount |
|------|--------|
| Professional services, embalming, visitation, etc. (median) | $8,300 |
| Metal casket | $2,500 |
| Burial vault | $1,695 |
| Cemetery plot | $500–$15,000 |
| Monument | $3,000 |
| Opening/closing grave | $300–$1,000 |
| **Range of estimated funeral costs** | **$16,295–$31,495** |
| Other | Household expenses, car loans, loss of income |

Sources: NFDA 2023 GPL study; End-of-Life Planning burial plot article 2025.

## CTA

https://www.transamerica.com/insurance/final-expense-life-insurance

## RAG / Julie use

Veteran objection handling (VA burial amounts too low; service-related / mental health UW claim). Product line = portfolio Immediate/10-Pay/Easy — not Express. No rates in flyer.


<!-- source:LIFETIME_AGENT_GUIDE.md -->

# Transamerica Lifetime℠ — Agent Guide

**Source:** [Transamerica Lifetime Agent Guide](https://cdn.brandfolder.io/86JM1UOD/as/qfaexd-50m55s-d8nsns/Transamerica_Lifetime_-_Agent_Guide.pdf)  
**Local:** `source_pdfs/Transamerica_Lifetime_Agent_Guide.pdf` (21 pages) + `.txt` + upload extract  
**Revision:** **126939R3** · **04/26** · ©2026 · Agent only  
**Form:** **ICC19 TPWL12IC-1018** · **Not available in New York**  
**Extracted:** 2026-07-22  

## Product design

- Non-participating whole life · **level** death benefit  
- Guaranteed level premiums; payable to age **100**, or **10 / 20 / 30**-year paid-up options  
- Matures at attained age **121**  
- Cash value; loans available (reduce DB/CSV)  
- **Conversion from this product: not allowed**  
- Declared **non-illustratable**  

## Quick facts

| Item | Detail |
|------|--------|
| Issue ages (ALB) | To-100: **15 days–80** · 10-pay: 15d–80 · 20-pay: 15d–**79** · 30-pay: 15d–**69** |
| Face | Ages 0–17: **$25k–$2M** · Ages 18+: **$100k–$5M** (**CA max $2M**) |
| Premium bands | Juv Band1 $25–99,999 · Adult Band2 $100–249,999 · Band3 $250–499,999 · Band4 $500k–$5M |
| Policy fee | **$30 / year** |
| Modal | Annual 1.000 · Semi 0.510 · Quarterly 0.2575 · Monthly **0.0860** · Semi-monthly / Biweekly (×12/24 or ×12/26) |
| Classes | Preferred Elite · Preferred Plus · Preferred Nontobacco · Preferred Tobacco · Tobacco · Juvenile (preferred classes min **$100k**) |

## Riders / options (highlights)

| Rider | Notes |
|-------|--------|
| Terminal Illness ADB | Included; LE ≤12 months |
| Critical Illness ADB | Elect at app |
| Chronic Illness ADB | Elect at app; 2 of 6 ADLs × 90 days or severe cognitive impairment |
| Disability Waiver | Optional |
| IPO | No extra premium; structure DB (lump / monthly 5–25 yrs / final lump); issue only, modifiable before death |
| Guaranteed Insurability | Ages 15 days–37; +$2,500–$50,000 per event |
| Term Insurance Rider | ≤ **3×** base; base+term ≤ **$5M** lifetime max |
| Children’s Benefit | Units $1,000; ages 15 days–18; max $99k / ≤ base; converts to Lifetime up to 5× / **$50k**; auto covers newborns at 15 days w/ CIR |
| Accidental Death | Issue ages **15–55**; death within **180 days** of accident |

### ADB admin charges

- **$350** per acceleration (**CA:** $750 first / $400 subsequent)  
- Chronic annual recert after first: **$100** (**CA $400**)  
- Chronic max accelerate in any 12 months: lesser of **24%** of eligible DB or IRS limit  

## Digital / Express Protect UW (summary)

- iGO® e-App recommended; paper → teleinterview required  
- Fluidless acceleration possible within age/amount grids (see UW guide)  
- Spec sheet fluidless caps: 0–65 up to **$499,999** · 0–55 up to **$999,999** · 18–45 up to **$1,999,999**  
- App valid **180 days** (UW guide); cases close **45 days** if outstanding requirements  

Full age/amount requirement grid → `LIFETIME_UNDERWRITING_GUIDE.md` + `source_pdfs/Lifetime_UW_key_pages_3-28.txt`.

## Ops notes (agent guide)

- Free-look / grace / reinstatement / nonforfeiture / loans / policy changes / redate rules in guide  
- Redate: after place **not** allowed; “current date” = first of month after approval if no age/premium change  

## Rates

**Not in PDF.** Use illustration system / sales desk.

## RAG / Julie

Canonical Lifetime product matrix for permanent WL (vs FE Express/portfolio FE and Trendsetter term). Cross-link conversion *into* Lifetime from term via `TERM_LIFE_CONVERSION_GUIDE.md`.


<!-- source:LIFETIME_CONSUMER_BROCHURE.md -->

# Transamerica Lifetime℠ — Consumer Brochure

**Source:** [Lifetime Consumer Brochure](https://cdn.brandfolder.io/86JM1UOD/as/qfaexh-3er7tk-f41tpw/Transamerica_Lifetime_-_Consumer_Brochure)  
**Local:** `source_pdfs/Transamerica_Lifetime_Consumer_Brochure.pdf` (6 pages)  
**Code:** **126940R2** · **04/26** · ©2026 · Consumer  
**Extracted:** 2026-07-22  

## Positioning

“Guaranteed. Level. Simple.” Permanent WL: death benefit, cash value, guarantees, tax advantages. Long-term product — not short-term savings. **Not available in New York.**

### Three G’s

1. Guaranteed federal income tax-free level DB (face; loans/assignments reduce)  
2. Guaranteed level premium & payment period  
3. Guaranteed tax-deferred cash value  

Enhanced **iGO® e-App** with **Express Protect Underwriting℠** — some same-day approvals.

## Living benefit riders (consumer)

| Rider | When elected |
|-------|----------------|
| Critical Illness ADB | At application |
| Chronic Illness ADB | At application |
| Terminal Illness ADB | **Automatically included** (LE ≤12 months) |

CA disclosures: not LTC / not Partnership / not Medigap; tax notes per §101(g) / §104 as applicable.

## Other customization

Disability Waiver · IPO (lump / monthly ≤25 yrs / final lump) · Guaranteed Insurability · Term Insurance Rider · Children’s Benefit · Accidental Death  

Free-look: typically **10 days** (some states **20**).

## Forms (brochure)

Lifetime ICC19 TPWL12IC-1018 · ADR ICC16 ADR12 · Children’s ICC16 CR15 · Waiver ICC16 DWP03 · GIR GIR02 1006 · IPO ICC11 IPO02 · Term Rider ICC19 TRTL10IC-1018  

## RAG / Julie

Consumer WL explainer. Specs/UW → Agent Guide + UW Guide.


<!-- source:LIFETIME_PRODUCT_SPEC_SHEET.md -->

# Transamerica Lifetime℠ — Product Spec Sheet

**Source:** [Lifetime Product Spec Sheet](https://cdn.brandfolder.io/86JM1UOD/as/qfaexg-1royao-2tv5fn/Transamerica_Lifetime_-_Product_Spec_sheet)  
**Local:** `source_pdfs/Transamerica_Lifetime_Product_Spec_Sheet.pdf` (2 pages)  
**Revision:** **126941R2** · **04/26** · ©2026 · Agent only  
**Extracted:** 2026-07-22  

Triple guarantee pitch: level DB · level premiums · cash value (+ living benefit riders).

| Spec | Value |
|------|--------|
| Face | 0–17: $25k–$2M · 18+: $100k–$5M (**CA $2M max**) |
| Issue ages | To-100: 15d–80 · 10-pay: 15d–80 · 20-pay: 15d–79 · 30-pay: 15d–69 |
| Premium period | To age 100 · 10/20/30-year paid-up |
| Maturity | Age 121 |
| Classes | Pref Elite / Pref Plus / Preferred / Nontobacco / Pref Tobacco / Tobacco / Juvenile |
| Fluidless accel limits | 0–65 ≤$499,999 · 0–55 ≤$999,999 · 18–45 ≤$1,999,999 |
| Term rider | ≤3× base; base+term ≤$5M |

Digital UW bullets: iGO, automation, fluidless, best preferred classes via fluidless/express protect, carrier-ordered labs only when needed, 24/7 teleinterview.

Form ICC19 TPWL12IC-1018. Full detail → `LIFETIME_AGENT_GUIDE.md`.


<!-- source:MYTRANSWARE_FE_QUOTE_TOOL.md -->

# myTransware — Final Expense Solutions Quote Tool (WL3)

**Source:** [myTransware Final Expense quote](https://mytranswarequote.transamerica.com/Wl3.html?id=WL3IM)  
**Captured:** 2026-07-22  
**UI version footer:** `v.4181.DC55.9A72.6384`  
**Audience:** Agent use only — quote only, not an offer of coverage  
**Page title:** myTransware - Final Expense Solutions  

## What this is

Public **lite** myTransware illustration/quote UI for the **Final Expense Solutions Portfolio (2021 WL3 series)**:

| Product ID | Label in tool | Default deep link |
|------------|---------------|-------------------|
| **WL3IM** | Immediate Solution (2021) | `Wl3.html?id=WL3IM` ← user link |
| **WL310** | 10 Pay Solution (2021) | `Wl3.html?id=WL310` |
| **WL3EY** | Easy Solution (2021) | `Wl3.html?id=WL3EY` |

Uses anonymous lite credentials (`litesitecode` / `liteProducer`) — no Agent Home login required for this lite page.

## Critical: FE Express is **not** in this tool

`Products.json` links include Trendsetter term, Living Benefit, older WL1/WL2 FE vintages, and **WL3** portfolio FE — **no FE Express / Graded FE Express product IDs**.  

For Express rates use `fe_express_rates.csv` / Agent Guide, or WELIS/Agent Home if Transamerica hosts Express elsewhere.

## Quote UI fields (from Wl3.html)

- Product (Immediate / 10-Pay / Easy)  
- Age, State, Gender, Risk Class  
- Solve for face **or** premium  
- Premium mode: Annual, Semi-Annual, Quarterly, Monthly EFT (lite default Monthly EFT)  
- Accidental Death Benefit Rider (Yes/No) — Immediate path  
- Child/Grandchild rider amount + number of children — Immediate path  
- Outputs: Annual / Semi-Annual / Quarterly / Monthly EFT + premium breakdown (base / ADR / CGR)

## Rules from VData (WL3 JSON)

### Immediate (WL3IM) & 10-Pay (WL310)

| Age band | Face min–max (most states) | Washington min–max |
|----------|----------------------------|--------------------|
| 0–55 | $1,000–$50,000 | $5,000–$50,000 |
| 56–65 | $1,000–$40,000 | $5,000–$40,000 |
| 66–75 | $1,000–$30,000 | $5,000–$30,000 |
| 76–85 | $1,000–$25,000 | $5,000–$25,000 |

- Issue ages: **0–85**  
- Risk classes: Preferred/Standard Nontobacco & Tobacco (18–85); Juvenile Preferred/Standard (0–17)  
- ADR: ages **18–70** (Immediate)  
- CGR: parent ages **18–75**; **1–5** units ($1k–$5k); **1–9** children  

### Easy (WL3EY)

- Ages **18–80** (Else); NY ages **50–75** in `AgeStateList` but **New York is not in `StateApproved`** for this WL3 lite config  
- Face **$1,000–$25,000**  
- Risk class: **Graded** only (uni-smoke path in Agent Guide rates)  
- Riders section hidden  

### Julie states (NE / KS / CO / NV)

All four appear in **`StateApproved`** for WL3IM / WL310 / WL3EY.  
**New York:** not in WL3 `StateApproved` (use other Transamerica NY paths / forms if needed).

`RiderApprovals.ADB.State` / `CI.State` arrays are **empty** in downloaded VData — do not infer state rider bans from that alone; confirm in live UI / rider charts.

## Local files saved

| File | Purpose |
|------|---------|
| `source_pdfs/mytransware_Wl3_WL3IM.html` | Quote page HTML |
| `source_pdfs/mytransware_Products.json` | Product catalog + links |
| `source_pdfs/mytransware_Products-lite.js` | Lite loader |
| `source_pdfs/mytransware_WL3.json` | Form defaults / enums for WL3 UI |
| `source_pdfs/mytransware_WL3IM.json` | Immediate VData rules |
| `source_pdfs/mytransware_WL310.json` | 10-Pay VData rules |
| `source_pdfs/mytransware_WL3EY.json` | Easy VData rules |
| `source_pdfs/mytransware_WL3IM_Script.js` | Quote calc script (shared WL3.js) |
| `source_pdfs/mytransware_Enum.json` | Shared enums |

Premium math for offline quotes remains in `fe_portfolio_rates.csv` (Agent Guide). Use this tool as the **live check** against carrier calc.

## Related deep links

- Immediate: https://mytranswarequote.transamerica.com/Wl3.html?id=WL3IM  
- 10-Pay: https://mytranswarequote.transamerica.com/Wl3.html?id=WL310  
- Easy: https://mytranswarequote.transamerica.com/Wl3.html?id=WL3EY  
- Marketing quote hub often cited: https://www.transamerica.com/quote-fe  

## RAG / Julie use

Bookmark + product-ID map for portfolio FE quoting. Tell agents Express is a different product/app. Prefer Agent Guide CSV for offline premiums; myTransware for validation.


<!-- source:RIDER_STATE_AVAILABILITY.md -->

# Transamerica — Life product rider state availability (Julie focus)

**Source:** [Life Product Rider State Availability Chart](https://cdn.bfldr.com/86JM1UOD/as/gwkwbk6xpk3hggbb78vmpfb/Life_Product_Rider_State_Availability_Chart)  
**Document:** Life products rider state availability, revision **05/26** (3009064R6 ©2026)  
**Local copy:** `source_pdfs/Life_Product_Rider_State_Availability_Chart.pdf` (7 pages)  
**Extracted:** 2026-07-22  
**Agent:** Julie Braunsroth — NE, KS, CO, NV

## Julie states — summary (what matters for FE / term / WL)

For **Nebraska, Colorado, and Nevada**, riders Julie is most likely to use are generally **available**. Kansas matches except **Monthly Disability Income Rider on Trendsetter LB** is **NO**.

### Final expense / Concierge (pages 1–2)

| Rider | Product(s) | NE | KS | CO | NV |
|-------|------------|----|----|----|----|
| Accelerated Death Benefit (w/ Nursing Home) | Immediate + 10-Pay FE | YES | YES | YES | YES |
| Accelerated Death Benefit (w/ Nursing Home) | FE Express | YES | YES | YES | YES |
| Accidental Death Benefit | Lifetime, FE Immediate, Trendsetter Super/LB, FFIUL/FFIUL II/FCIUL II | YES | YES | YES | YES |
| Accidental Death Benefit | FFIUL II Express | NO | NO | NO | NO |
| Concierge Planning / Additional Services | FE Express + Graded FE Express | YES | YES | YES | YES |
| Concierge Planning | FFIUL / FFIUL II / FCIUL II | YES | YES | YES | YES |
| Concierge Planning | FFIUL II Express | YES | YES | YES | YES |
| Children’s & Grandchildren’s Rider | Immediate Solution only | YES | YES | YES | YES |
| Additional Insured Rider | FFIUL / FFIUL II / FCIUL II | NO | NO | NO | NO |
| Base Insured Rider | FFIUL II / FFIUL II Express | NO | NO | NO | NO |

**Footnote:** Concierge Planning Benefit naming differs in CA, FL, MD (not Julie states).

### Living benefits / term / WL riders (pages 3–6)

| Rider | Product(s) | NE | KS | CO | NV |
|-------|------------|----|----|----|----|
| Children’s Benefit Rider | Lifetime, Trendsetter Super/LB, FFIUL/II, FCIUL II | YES | YES | YES | YES |
| Chronic Illness ADB | Lifetime, Trendsetter LB, FFIUL/II, FCIUL II | YES | YES | YES | YES |
| Chronic Illness ADB | FFIUL II Express | YES | YES | YES | YES |
| Critical Illness ADB | Lifetime, Trendsetter LB, FFIUL/II, FCIUL II | YES | YES | YES | YES |
| Critical Illness ADB | FFIUL II Express | YES | YES | YES | YES |
| Disability Waiver of Monthly Deductions | FFIUL / FFIUL II / FCIUL II | YES | YES | YES | YES |
| Disability Waiver of Premium | Lifetime, Trendsetter Super/LB, FFIUL/II, FCIUL II | YES | YES | YES | YES |
| Guaranteed Insurability | Lifetime, FFIUL, FFIUL II | YES | YES | YES | YES |
| Income Protection Option | Lifetime, Trendsetter Super/LB, FFIUL/II, FCIUL II | YES | YES | YES | YES |
| Long Term Care Rider | FFIUL, FFIUL II | YES | YES | YES | YES |
| Monthly Disability Income | Trendsetter LB | YES | **NO** | YES | YES |
| Overloan Protection | FFIUL / FFIUL II / FCIUL II (+ FFIUL II Express) | YES | YES | YES | YES |
| Term Insurance Rider | Lifetime | YES | YES | YES | YES |
| Terminal Illness ADB | Lifetime, FE Immediate/10-Pay, Trendsetter Super/LB, FFIUL/II, FCIUL II | YES | YES | YES | YES |
| Terminal Illness ADB | FFIUL II Express | YES | YES | YES | YES |

## Takeaways for Julie

1. **FE Express Concierge Planning is YES** in all four licensed states.  
2. **Trendsetter LB living benefits** (chronic/critical/terminal) are YES in all four.  
3. **Kansas-only gap** among Julie states: Monthly Disability Income on Trendsetter LB = NO.  
4. Several IUL-only riders (Additional Insured, Base Insured) are NO in Julie states — fine if she is not quoting those riders.

## Source URL

https://cdn.bfldr.com/86JM1UOD/as/gwkwbk6xpk3hggbb78vmpfb/Life_Product_Rider_State_Availability_Chart


<!-- source:STATE_AVAILABILITY.md -->

# Transamerica — Life products state availability (Julie focus)

**Source:** [Product Availability Listing By State](https://cdn.bfldr.com/86JM1UOD/as/hwf3kqrbmrc3x6p8wgc75s55/Product_Availability_Listing_By_State)  
**Document:** Life products state availability, revision **07/26** (2636865R13 ©2026)  
**Local copy:** `source_pdfs/Product_Availability_Listing_By_State.pdf`  
**Extracted:** 2026-07-22  
**Agent:** Julie Braunsroth — prioritize NE, KS, CO, NV

Columns (left → right on chart):

1. FCIUL II  
2. FFIUL II  
3. TFLIC FFIUL (New York only product)  
4. FFIUL II Express  
5. Trendsetter Super  
6. Trendsetter LB  
7. Transamerica Lifetime  
8. FE Express / Graded FE Express / Juvenile Whole Life Express  
9. Immediate Solution / 10-Pay Solution / Easy Solution (Graded)

## Julie licensed states

| State | FCIUL II | FFIUL II | NY FFIUL | FFIUL II Express | Trendsetter Super | Trendsetter LB | Lifetime WL | FE Express / Graded / Juv WL Express | Immediate / 10-Pay / Easy |
|-------|----------|----------|----------|------------------|-------------------|----------------|-------------|--------------------------------------|---------------------------|
| Nebraska | YES | YES | NO | YES | YES | YES | YES | YES | YES |
| Kansas | YES | YES | NO | YES | YES | YES | YES | YES | YES |
| Colorado | YES | YES | NO | YES | YES | YES | YES | YES | YES |
| Nevada | YES | YES | NO | YES | YES | YES | YES | YES | YES |

**Takeaway for Julie:** In NE / KS / CO / NV, every major Transamerica life line on this chart is available except the New York–only FFIUL.

## Notes from PDF footnotes

1. Juvenile Whole Life Express is **not** available in California or Washington.  
2. WFG is not licensed to sell in Guam.  
3. New York: most non-NY products NO; TFLIC FFIUL available for certain distribution channels (not brokerage); Immediate/10-Pay/Easy YES.  
4. Puerto Rico: Lifetime available for conversions only at this time (per footnote on page 2).  
5. Virgin Islands: all NO.

## Source URL

https://cdn.bfldr.com/86JM1UOD/as/hwf3kqrbmrc3x6p8wgc75s55/Product_Availability_Listing_By_State


<!-- source:TERM_LIFE_CONVERSION_GUIDE.md -->

# Transamerica Term Life Conversion Guide

**Source:** [Term Life Conversion Guide](https://cdn.brandfolder.io/86JM1UOD/as/qf8c8t-fywgj4-6wjhrz/Term_Life_Conversion_Guide)  
**Local:** `source_pdfs/Term_Life_Conversion_Guide.pdf` (8 pages) + `.txt`  
**Code:** **131319821** · dated **04/26** · ©2026 · Agent only  
**Extracted:** 2026-07-22  

## Early conversion period (TL24 Super / TL23 LB)

Policies issued after **May 6, 2017** (CA: Super after **Jun 1, 2017**; LB after **Nov 17, 2018**). **Not NY.**

| Level term | Early conversion period |
|------------|-------------------------|
| 10 years | **5 years** from issue |
| 15 & 20 years | **10 years** from issue |
| 25 & 30 years | **15 years** from issue |

Ends at earlier of table period **or** age **75** Preferred Plus / age **70** other classes. Older Trendsetter / other term / riders: early period remains **5 years**.

Enhanced early options (not contractual; may change): **IUL + whole life at fully UW rates** — Lifetime℠, FFIUL II, FCIUL II.

## Conversion options by product

| Product | Within early period (exam/labs or Part II nonmed orig.) | After early (still in contractual window) |
|---------|--------------------------------------------------------|---------------------------------------------|
| Trendsetter LB / Super | Lifetime · FFIUL II · FCIUL II | Lifetime **conversion classes** |
| FlexTerm 7 & other term | Anytime in contractual window → Lifetime conversion classes | |

## Face mins / maxes (enhanced)

- **FCIUL II:** $250,000 min face  
- **Lifetime:** min **$100,000**; max **$5,000,000** fully UW classes / **$9,999,999** conversion classes (split policies if over)  
- Substandard table → **not** eligible for 8-year flat extra substitutions on conversion  

## Risk class mapping (summary)

Within early → Lifetime / FFIUL II / FCIUL II map Preferred Elite/Plus/etc. to current preferred classes. Anytime → **CNV** prefixed classes on Lifetime. Standard Express NS/S (discontinued May 2017) → CNV Nontobacco/Tobacco **w/ Table D**. Undefined class → Lifetime CNV Tobacco only.

## Rider conversions

AIR / Base Insured / Other Insured / Primary Insured / Term Insurance Rider: early 5 years may go Lifetime / FFIUL II / FCIUL II (up to $5M fully UW); later → Lifetime CNV. Children’s Insurance Rider → Lifetime only; juvenile → CNV Juvenile; over 18 from juvenile → CNV Tobacco.

Critical/chronic ADB can convert with base term; other riders per contract.

## Process

1. Confirm interest + eligibility  
2. Run IUL illustration or WL quote  
3. Download forms from agent portal  
4. Complete/sign; IUL needs signed illustration  

Need: existing policy #, insured name, owner name. Use solicitation-state forms (or original issue state if owner abroad).

## Partial conversion

Subject to new-policy min face; term face reduced. After early period, remainder can stay only if it doesn’t force a **lower rate band**. Early: >$2M partial OK; except TL23/TL24, partials often limited to Lifetime CNV classes.

## RAG / Julie

Conversion windows, product targets, class mapping. Always defer to **policy contract** language.


<!-- source:TRENDSETTER_IPO_FLYER.md -->

# Trendsetter — Income Protection Option (IPO) Flyer

**Source:** [IPO Flyer](https://cdn.bfldr.com/86JM1UOD/at/35hjg92pt59xsztrm538twnr/115196R2_0820_Transform_Income_Protection_Option_Flyer_FINAL_Digital)  
**Local:** `source_pdfs/Trendsetter_Income_Protection_Option_Flyer.pdf`  
**Code:** **115196R4** (flyer art) / filename 115196R2 · **06/25** · ©2025 · Agent only  
**Extracted:** 2026-07-22  

## What it is

Settlement/endorsement option: structure death benefit as controlled payouts (amounts, recipients, duration) instead of only a lump sum. Can support **lower face / lower premium** for a desired **total benefit** because payments earn interest over time.

## Owner controls

- Guaranteed\* payments after death (\*claims-paying ability)  
- Flexible payout structure  
- Designated payments  
- Long-term monthly income vs one-time lump  
- Lower premiums for same total DB (marketing claim)

## Structure (from field guide + flyer)

Optional combination of:

1. Initial lump sum at death  
2. Monthly payments for a Guaranteed Period (**5–25 years**)  
3. Final lump sum at end of period  

Minimums (field guide): lumps **$10,000**; monthly **$100**; period **5–25 years**. Illustration discount factor typically **2%** (TLIC; state variations).

## Hypothetical (flyer)

Jon → Michelle: immediate **$250,000**; **$3,000/mo** × 15 years; final **$500,000**. Face shown **$1,089,077** providing **>$1.2M** total benefits (2% guaranteed interest example). Portions of monthly/final payments taxable as interest income.

## RAG / Julie

Explain IPO as income-replacement design tool on Trendsetter; not a separate policy. Confirm election at issue / changeability before death per contract.


<!-- source:TRENDSETTER_LB_CONSUMER_BROCHURE.md -->

# Trendsetter® LB — Consumer Brochure (English)

**Source:** [Trendsetter LB Consumer Brochure](https://cdn.brandfolder.io/86JM1UOD/as/qf9nj0-45c77k-9u1639/Trendsetter_LB_Consumer_Brochure_English)  
**Local:** `source_pdfs/Trendsetter_LB_Consumer_Brochure_English.pdf` (~5.2 MB, 20 pages) + `.txt`  
**Revision:** **122982R6** · **05/26** · ©2026 · Consumer  
**Form:** ICC16 **TL23** / TL23 · Transamerica Life · **Not available in New York**  
**Extracted:** 2026-07-22  

## Positioning

Term with **living benefits** — early access to death benefit for qualifying **chronic, critical, or terminal** illness while living. Face up to **$2 million**.

## Product features (brochure)

| | |
|--|--|
| Issue ages | **18–80** (min **23** for $25k–$99,999 per sales flyer footnote) |
| Face | **$25,000–$2,000,000** |
| Terms | **10 / 15 / 20 / 25 / 30** years (then annual increases) |
| Included ADB | Terminal · Chronic · Critical |
| Optional | Monthly DI · IPO · Disability Waiver · Children’s · Accidental Death |

\* Living-benefit payouts are **less than** amounts accelerated (discount/admin).

## Illustrated claim examples (marketing; state/admin vary)

| Scenario | Profile | Face / term | Mo. premium | Event | Premiums paid pre-claim |
|----------|---------|-------------|-------------|-------|-------------------------|
| Chronic (Sarah) | F35 Pref Plus NS | $300k / 30-yr | **$28.64** | Accident 45 → chronic ~3 yrs later; LE 10 yrs | **$4,467.84** → example accel **$34,549** |
| Critical heart attack (Eva) | F40 Std NS | $250k / 25-yr | **$44.51** | Heart attack age 50; LE 10 yrs | **$5,341.20** |
| Terminal (Robert) | M45 Pref Plus NS | $500k / 20-yr | **$69.23** | Pancreatic ca age 55; LE 8 mo | **$8,307.60** |

Demo assumptions (brochure fine print): discount rate **8%** (CA **6%**); **$350** admin fee as of 1/1/2012 (CPI-adjustable); rate = greater of 90-day T-bill yield and Moody’s Corporate Bond Yield.

## FAQ highlights (for Julie)

- Living benefits = accelerated death benefits; paid to **policy owner**, not beneficiary  
- Payout depends on amount accelerated, remaining LE, interest/discount rate, admin fees — **longer LE → lower payout**  
- Pre-claim **quote** available before accepting acceleration  
- **Partial** acceleration OK; remaining face stays for beneficiaries  
- Critical/chronic: max accelerate typically **90%** face (or max allowed) → ≥**10%** remains; Terminal can accelerate **100%** or **$1.5M** (lesser) → nothing left if 100%  
- Critical Illness Rider terminates after **three** claims; chronic claims ≤ **annually**  
- Cannot claim critical **and** chronic on same event — choose one  
- Premiums level for initial term; after term, annual increases; after accel, premiums adjust to reduced face  
- Convert before earlier of end of level period or age **70** (Pref Plus **75**)  

CA chronic definition: 2 of 6 ADLs × 90 days or severe cognitive impairment needing supervision.

## Rider form #s (brochure)

Monthly DI MD108 OR · Waiver ICC16 DWP03 · Children’s ICC16 CR15 · ADR ICC18 TRAD10IC-0818 · IPO ICC11 IP002  

## RAG / Julie

Consumer LB FAQ + living-benefit rules of thumb. Authoritative UW/ages → `TRENDSETTER_PROFESSIONAL_FIELD_GUIDE.md`. Example premiums are illustrations only.


<!-- source:TRENDSETTER_LB_SALES_COMPARISON_FLYER.md -->

# Trendsetter® LB — Sales Comparison Flyer

**Source:** [Trendsetter LB Sales Comparison Flyer](https://cdn.brandfolder.io/86JM1UOD/as/qf89kq-3uf0w-g3br98/Trendsetter_LB_Sales_Comparison_Flyer)  
**Local:** `source_pdfs/Trendsetter_LB_Sales_Comparison_Flyer.pdf` (2 pages) + `.txt`  
**Code:** **133026R5** · **06/25** · ©2025 · Financial professional only  
**Extracted:** 2026-07-22  

## Why sell LB (agent pitch)

- Living benefits for qualifying chronic / critical / terminal illness (not “grandparents’ term”)  
- Premium gap vs term without living benefits can be small (claim)  
- Survey cite: **65%** of bankruptcies linked to medical expenses (Debt.org 2025)  

### Convenience / brand / flexibility

- Nonmed limits: up to **$2M** to age **45** · **$1M** to age **55** · **$249,999** to age **60** (vitals/labs may apply)  
- e-contract delivery in as little as **2–5 days**, some **24 hours**  
- Living benefit lifetime max **$1.5M**; conditions need not be permanent; use funds as owner wishes  
- Convertibility to FFIUL II / FCIUL II extended by level-term period  
- Monthly Disability Income rider available on same policy  
- Transamerica marketing living-benefit term since **2006**  

## Definitions (flyer; may vary by jurisdiction)

| Benefit | Meaning (general) |
|---------|-------------------|
| **Critical** | Heart attack, stroke, cancer, ESRD, ALS, major organ transplant, blindness, paralysis from specified causes. **CA:** condition that would result in death within **12 months** absent treatment |
| **Chronic** | Unable to perform ≥**2 of 6 ADLs** without substantial assistance for **≥90 days**. **CA:** same + severe cognitive impairment needing supervision |
| **Terminal** | Expected death within **12 months** of diagnosis |

## Product features box

- Ages **18\***–**80** (\* min **23** for face **$25k–$99,999**)  
- Face **$25k–$2M**  
- Terms 10/15/20/25/30  
- Included: Terminal / Chronic / Critical Illness  
- Optional: Monthly DI · IPO · Waiver · Children’s · ADR  

**Not available in New York.** Form ICC16 TL23.

## RAG / Julie

Agent sales points + CA definition variants. Pair with consumer brochure FAQs and professional field guide.


<!-- source:TRENDSETTER_PRODUCER_PRESENTATION.md -->

# Trendsetter Series — Producer Presentation (PPTX)

**Source file:** `Transamerica Trendsetter Series Producer Presentation_FINAL_133027R8_1025.pptx` (from Downloads)  
**Local:** `source_pdfs/Transamerica_Trendsetter_Series_Producer_Presentation_133027R8_1025.pptx` (~63 MB, **42 slides**)  
**Text extract:** `.txt` (speaker **notes** + limited on-slide text; many slides are graphics)  
**Revision hint:** **133027R8** · **10/25**  
**Extracted:** 2026-07-22 · Agent training deck  

## Themes from speaker notes

- Portfolio: **Trendsetter Super** + **Trendsetter LB** — protection, value, convenience; nonmed story  
- Nonmed: up to **$2M** through age **45**; up to **$1M** ages **46–55** (vitals/labs may apply)  
- Markets: young families, women breadwinners, business key-person  
- **IPO** walkthrough (Ron/Ann case) — income stream design  
- Business case (Jerry’s Custom Choppers) — LB key-person nonmed  
- Super **7** rate bands vs LB **4**; all policy fees compensated; LB no band-break fee discounts  
- Riders: Monthly DI (max lesser of **$2,000/mo** or **2%** of face, ≤66% income / **40% CA**); Waiver; living benefits on LB  
- Living benefits: chronic/critical/terminal; max accelerate **$1.5M** / 100% DB; ADL definitions  

## Status

Useful for sales narrative; authoritative product rules remain in the Professional Field Guide + Conversion Guide. On-slide tables not fully OCR’d from graphics.

## RAG / Julie

Training talking points only. Prefer field guide for ages/fees/rules.


<!-- source:TRENDSETTER_PROFESSIONAL_FIELD_GUIDE.md -->

# Trendsetter® Term — Professional Field Guide

**Source:** [Trendsetter Term Life Guide for Insurance Professionals](https://cdn.brandfolder.io/86JM1UOD/as/qf9niy-fhulrk-7kcn4t/Trendsetter_Term_Life_Guide_for_Insurance_Professionals)  
**Local:** `source_pdfs/Trendsetter_Term_Life_Guide_for_Insurance_Professionals.pdf` (30 pages) + `.txt` + upload extract  
**Dated:** **12/25** · Agent use only  
**Extracted:** 2026-07-22  

Forms: **Trendsetter Super** ICC16 **TL24** / TL24 · **Trendsetter LB** **TL23**. Issuer: Transamerica Life. **Not available in New York** (typical Super/LB footprint; confirm state charts).

**Rates:** Guaranteed quotes via Transamerica illustration software — **no full $/1000 tables in this PDF**.

---

## Trendsetter® Super (TL24)

### Quick facts

| Item | Detail |
|------|--------|
| Product | Level DB term; renewable to age **105**; level premium periods **10 / 15 / 20 / 25 / 30** then ART increases |
| Classes | Preferred Plus, Preferred NS, Preferred Smoker, Standard Plus, Standard NS, Standard Smoker |
| Face bands | 1: $25k–99,999 · 2: $100k–249,999 · 3: $250k–499,999 · 4: $500k–999,999 · 5: $1M–3M · 6: $3,000,001–10M · 7: $10,000,001+ |
| Policy fee (commissionable) | Band 1 **$60** · Bands 2–7 **$30** |
| Modal (TLIC) | Annual 1.00 · Semi 0.51 · Quarterly 0.2575 · Monthly PAC/Direct **0.085*** |
| Non-illustratable | Yes — only guaranteed elements; no multi-year NG presentations in year 1 |
| Included | Terminal Illness ADB rider (where approved) |
| Optional riders | ADR, Children’s Benefit, Disability Waiver of Premium |

\* Monthly Direct only if basic premium ≥ **$1,000** (excl. fees, extras, riders).

### Issue ages (ALB) — Super

| Plan | Under $100k | $100k+ |
|------|-------------|--------|
| TS-10 | 18–80 NS/S | 18–80 NS/S |
| TS-15 | 18–75 NS / 18–70 S | 18–78 NS / 18–73 S |
| TS-20 | 18–65 NS/S | 18–70 NS / 18–65 S |
| TS-25 | 18–60 NS / 18–55 S | 18–65 NS / 18–60 S |
| TS-30 | 18–50 NS / 18–45 S | 18–58 NS / 18–53 S |

### UW / class mins (Super)

| Class | Min face | Flat extra (non-aviation) |
|-------|----------|---------------------------|
| Preferred Plus | $100,000 | No |
| Preferred NS / Preferred Smoker / Standard Plus | $100,000 | No (aviation extras vary) |
| Standard NS / Standard Smoker | $25,000 | Yes |

Substandard through **Table H** (25% per table on Standard NS/S rates). No face **increases**; decreases OK to min face. Grace **31 days** (CA **61**). Reinstatement within **3 years** if not surrendered.

### Conversion (Super)

Exercise by earlier of end of level period or age **70** (Preferred Plus **75**). Early conversion window (TL24 after May 2017 rules): 10-yr → 5 yrs; 15/20 → 10 yrs; 25/30 → 15 yrs (or age 70/75 cap). Early: Lifetime / FFIUL II / FCIUL II. See `TERM_LIFE_CONVERSION_GUIDE.md`.

### Terminal Illness ADB (included)

Accelerate lesser of 100% face or **$1,500,000**; min **$5,000**; expected death within **12 months**.

### ADR (optional, issue only)

Ages **18–55**; death within 90 days, before age 70; common-carrier double; max participation **$300,000** Transamerica ADR total. Limits: under $200k face → lesser of 2.5× face or $200k; ≥$200k → lesser of face or $300k. Base ≤ Table D.

### Disability Waiver (optional, issue only)

Ages **18–55**; 6-month wait; before anniversary nearest age 60; not over Table D; not on nonmed faces over rules / >$5M face limits per guide.

### Income Protection Option (endorsement)

See `TRENDSETTER_IPO_FLYER.md` — structure DB as initial lump / monthly 5–25 yrs / final lump; mins $10k lump, $100/mo; software uses **2%** discount factor.

---

## Trendsetter® LB (TL23)

### Quick facts

| Item | Detail |
|------|--------|
| Face | Min **$25,000** · Max **$2,000,000** |
| Bands | 1: $25–99,999 · 2: $100–249,999 · 3: $250–499,999 · 4: $500k–$2M |
| Policy fee | Band 1 **$60** · Bands 2–4 **$30** |
| Modal | Annual 1 · Semi 0.51 · Q 0.2575 · Monthly PAC **0.086** · Semi-monthly / Biweekly (Federal Allotment; **not on Super**) |
| Included living benefits* | Terminal + **Chronic** + **Critical** Illness ADB |
| Optional | ADR, Children’s, **Monthly Disability Income**, Disability Waiver |
| Substandard | Through **Table D** only (higher → consider Super) |
| Flat extras | Cannot exceed **$2.50 / $1000** |

\* State availability; some medical histories ineligible for living benefits (e.g. Parkinson’s, MS, ratable cancer, chemo/radiation cancer hx, >Table D or flat >$2.50).

### Issue ages (ALB) — LB by band (summary)

Band 1 often starts age **23**; longer terms have lower max ages for smokers. Full grid in guide p.14 / upload extract. Bands 2–4 typically allow from age **18** with duration-specific maxes (e.g. 10-yr to 80; 30-yr NS to ~57–58).

### Nonmed (producer deck / consumer messaging)

Up to **$2M** through age **45**; up to **$1M** ages **46–55** (vitals/labs may still be requested). Consumer guide: through **$2M** without exam at certain ages.

### Living benefits caps

Max accelerate lesser of 100% DB or **$1,500,000**. Chronic: typically 2 of 6 ADLs for 90 days or substantial supervision (see guide for full defs). Benefits paid to owner; not reimbursement-restricted.

---

## RAG / Julie

Use for term product selection (Super vs LB), ages, fees, riders, conversion windows. **Do not invent premiums** — point to illustration system or WELIS. Montana: unisex → use male rates (per LB premiums note).


<!-- source:TRENDSETTER_SUPER_CONSUMER_GUIDE.md -->

# Trendsetter Super — Consumer Guide

**Source:** [Consumer Guide to Trendsetter Super Series](https://cdn.brandfolder.io/86JM1UOD/as/qf8byr-2txu74-f11pfq/Consumer_Guide_to_Transamericas_Trendsetter_Super_Series)  
**Local:** `source_pdfs/Consumer_Guide_to_Transamericas_Trendsetter_Super_Series.pdf` (8 pages; image-heavy)  
**Extracted:** 2026-07-22 · Consumer audience  

## Product talking points

- Term for mortgage, college, final expenses, everyday needs  
- Early access via **terminal illness** ADB (qualifying)  
- Issue ages **18–80**; face **$25,000 to $10M+**  
- **Nonmed** through **$2M** at certain ages (history-dependent)  
- Level terms: **10 / 15 / 20 / 25 / 30** years; premiums guaranteed level for initial period  
- Conversion to permanent without new medical exam (per rules)  

### Automatically included

Terminal Illness Accelerated Death Benefit Endorsement/Rider  

### Additional (often extra cost)

Disability Waiver · Income Protection Option · Children’s Benefit · Accidental Death  

## RAG / Julie

Consumer-facing Super overview. Specs/ops → `TRENDSETTER_PROFESSIONAL_FIELD_GUIDE.md`.


<!-- source:TRENDSETTER_SUPER_TRANSITION_RULES.md -->

# Trendsetter Super — Transition Rules (Mar 2025 reprice)

**Source:** [Transition Rules](https://cdn.bfldr.com/86JM1UOD/as/757hw5rxbjwbstrmgcbj3r5f/Transamerica_Trendsetter_Super_Transition_Rules)  
**Local:** `source_pdfs/Transamerica_Trendsetter_Super_Transition_Rules.pdf` (1 page)  
**Code:** **4298038** · **03/25** · ©2025 · Financial professional only  
**Extracted:** 2026-07-22  

| | |
|--|--|
| Product | Trendsetter Super (TL24) |
| New rate effective | **March 22, 2025** |
| Apps issued/printed **on or before 4 p.m. ET Mar 21, 2025** | **Old** rates |
| Apps issued/printed **Mar 22 – Apr 28, 2025** | Automatically **most favorable** base plan rates for applicant |
| Apps issued/printed **after Apr 28, 2025** | **New** rates (no new app required) |

Not available in **NY, PR, VI**.

## RAG / Julie

Historical transition window — now past (captured Jul 2026). Prefer current illustration rates; cite only if discussing in-flight cases from that period.


<!-- source:TRENDSETTER_WHERE_WE_WIN.md -->

# Trendsetter Super — Where We Win (reprice competitive flyer)

**Source:** [Where We Win Brochure](https://cdn.bfldr.com/86JM1UOD/as/hsm3mj4pk4ws8vjhk4mn9kx/Transamerica_Trendsetter_Where_We_Win_Brochure)  
**Local:** `source_pdfs/Transamerica_Trendsetter_Where_We_Win_Brochure.pdf` (4 pages)  
**Code:** **4280811** · **03/25** · ©2025 · Agent only  
**Extracted:** 2026-07-22  

## Reprice focus

Improving rates for **10 / 20 / 30**-year durations, Standard Nonsmoker and better, especially:

- **$500k–$999k**, ages **30–60** (10/20/30)  
- **$1M–$3M**, ages **30–50** (20-year)

## Sample competitive quotes (as of ~Mar 6–22, 2025 — marketing snapshot)

| Scenario | TA TS Super Reprice monthly | Rank claim |
|----------|----------------------------|------------|
| M35 Pref Best · 20-yr · $500k | **$19.98** | #1 |
| M35 Pref Best · 30-yr · $500k | **$34.00** | #1 |
| F35 Pref Best · 20-yr · $500k | **$17.00** | #1 |
| F35 Pref Best · 30-yr · $500k | **$28.48** | #1 |
| M40 Pref Best · 20-yr · $1M | **$48.45** | #1 |
| F40 Pref Best · 20-yr · $1M | **$39.95** | #1 |

Band ranking claims: $500k ages 30–60 → ~96% top-3 / 98% top-5 across Pref Plus / Pref NS / Std NS cells; $1M 20-yr ages 30–50 → ~97% top-3 / 100% top-5.

Form: ICC16 **TL24**. **Not NY / PR / VI.** Competitors’ premiums from public sources — verify before quoting peers.

## RAG / Julie

Competitive positioning only. Live premiums from illustration system.


## FE Express — rate tables (from CSV)
Source CSV: `fe_express_rates.csv` · rows=1436. Use rate formula from Agent Guide (× units + fee × modal). Montana often Unisex-Male. Verify before binding.

## FE Express rates — fe_express_solution band= sex=female class= state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 51.53 |
| 18 | 53.87 |
| 19 | 57.13 |
| 19 | 59.95 |
| 20 | 58.53 |
| 20 | 61.47 |
| 21 | 59.0 |
| 21 | 62.18 |
| 22 | 59.46 |
| 22 | 62.9 |
| 23 | 59.92 |
| 23 | 63.61 |
| 24 | 60.38 |
| 24 | 64.33 |
| 25 | 60.85 |
| 25 | 65.04 |
| 26 | 63.01 |
| 26 | 67.64 |
| 27 | 65.17 |
| 27 | 70.24 |
| 28 | 67.33 |
| 28 | 72.83 |
| 29 | 69.49 |
| 29 | 75.43 |
| 30 | 71.65 |
| 30 | 78.03 |
| 31 | 72.23 |
| 31 | 79.06 |
| 32 | 72.81 |
| 32 | 80.08 |
| 33 | 73.4 |
| 33 | 81.11 |
| 34 | 73.98 |
| 34 | 82.13 |
| 35 | 74.56 |
| 35 | 83.16 |
| 36 | 74.41 |
| 36 | 83.64 |
| 37 | 74.25 |
| 37 | 84.12 |
| 38 | 74.1 |
| 38 | 84.6 |
| 39 | 73.95 |
| 39 | 85.08 |
| 40 | 73.8 |
| 40 | 85.56 |
| 41 | 75.44 |
| 41 | 88.61 |
| 42 | 77.08 |
| 42 | 91.66 |
| 43 | 78.72 |
| 43 | 94.71 |
| 44 | 80.36 |
| 44 | 97.76 |
| 45 | 82.0 |
| 45 | 100.81 |
| 46 | 79.07 |
| 46 | 98.68 |
| 47 | 76.14 |
| 47 | 96.55 |
| 48 | 73.21 |
| 48 | 94.43 |
| 49 | 70.28 |
| 49 | 92.3 |
| 50 | 67.34 |
| 50 | 90.17 |
| 51 | 68.77 |
| 51 | 92.66 |
| 52 | 70.19 |
| 52 | 95.15 |
| 53 | 71.61 |
| 53 | 97.64 |
| 54 | 73.04 |
| 54 | 100.14 |
| 55 | 74.46 |
| 55 | 102.63 |
| 56 | 74.44 |
| 56 | 102.82 |
| 57 | 74.43 |
| 57 | 103.0 |
| 58 | 74.41 |
| 58 | 103.19 |
| 59 | 74.39 |
| 59 | 103.38 |
| 60 | 74.38 |
| 60 | 103.57 |
| 61 | 77.06 |
| 61 | 106.56 |
| 62 | 79.75 |
| 62 | 109.55 |
| 63 | 82.44 |
| 63 | 112.53 |
| 64 | 85.13 |
| 64 | 115.52 |
| 65 | 87.81 |
| 65 | 118.51 |
| 66 | 90.44 |
| 66 | 121.02 |
| 67 | 93.07 |
| 67 | 123.53 |
| 68 | 95.7 |
| 68 | 126.03 |
| 69 | 98.33 |
| 69 | 128.54 |
| 70 | 100.95 |
| 70 | 131.05 |
| 71 | 107.72 |
| 71 | 138.14 |
| 72 | 114.49 |
| 72 | 145.23 |
| 73 | 121.26 |
| 73 | 152.33 |
| 74 | 128.03 |
| 74 | 159.42 |
| 75 | 134.8 |
| 75 | 166.51 |
| 76 | 144.93 |
| 76 | 177.53 |
| 77 | 155.07 |
| 77 | 188.54 |
| 78 | 165.2 |
| 78 | 199.56 |
| 79 | 175.34 |
| 79 | 210.57 |
| 80 | 185.47 |
| 80 | 221.59 |
| 81 | 206.83 |
| 81 | 248.69 |
| 82 | 228.19 |
| 82 | 275.78 |
| 83 | 249.55 |
| 83 | 302.88 |
| 84 | 270.91 |
| 84 | 329.98 |
| 85 | 292.27 |
| 85 | 357.08 |
| 18 | 17.73 |
| 18 | 19.38 |
| 18 | 33.04 |
| 19 | 19.01 |
| 19 | 20.79 |
| 19 | 35.41 |
| 20 | 19.66 |
| 20 | 21.5 |
| 20 | 37.77 |
| 21 | 19.93 |
| 21 | 21.88 |
| 21 | 38.45 |
| 22 | 20.19 |
| 22 | 22.26 |
| 22 | 39.13 |
| 23 | 20.46 |
| 23 | 22.64 |
| 23 | 39.81 |
| 24 | 20.73 |
| 24 | 23.02 |
| 24 | 40.48 |
| 25 | 21.0 |
| 25 | 23.4 |
| 25 | 41.16 |
| 26 | 21.78 |
| 26 | 24.29 |
| 26 | 42.95 |
| 27 | 22.55 |
| 27 | 25.19 |
| 27 | 44.75 |
| 28 | 23.33 |
| 28 | 26.08 |
| 28 | 46.54 |
| 29 | 24.11 |
| 29 | 26.97 |
| 29 | 48.33 |
| 30 | 24.89 |
| 30 | 27.87 |
| 30 | 50.12 |
| 31 | 25.27 |
| 31 | 28.39 |
| 31 | 51.08 |
| 32 | 25.65 |
| 32 | 28.9 |
| 32 | 52.04 |
| 33 | 26.04 |
| 33 | 29.42 |
| 33 | 52.99 |
| 34 | 26.42 |
| 34 | 29.94 |
| 34 | 53.95 |
| 35 | 26.8 |
| 35 | 30.46 |
| 35 | 54.91 |
| 36 | 27.04 |
| 36 | 30.95 |
| 36 | 55.76 |
| 37 | 27.28 |
| 37 | 31.44 |
| 37 | 56.62 |
| 38 | 27.52 |
| 38 | 31.93 |
| 38 | 57.47 |
| 39 | 27.76 |
| 39 | 32.42 |
| 39 | 58.32 |
| 40 | 24.84 |
| 40 | 40.78 |
| 40 | 59.18 |
| 41 | 25.3 |
| 41 | 41.21 |
| 41 | 61.99 |
| 42 | 25.77 |
| 42 | 41.65 |
| 42 | 64.81 |
| 43 | 26.24 |
| 43 | 42.09 |
| 43 | 67.62 |
| 44 | 26.71 |
| 44 | 42.53 |
| 44 | 70.44 |
| 45 | 27.17 |
| 45 | 42.96 |
| 45 | 73.25 |
| 46 | 27.65 |
| 46 | 43.53 |
| 46 | 72.92 |
| 47 | 28.13 |
| 47 | 44.11 |
| 47 | 72.59 |
| 48 | 28.6 |
| 48 | 44.68 |
| 48 | 72.26 |
| 49 | 29.08 |
| 49 | 45.25 |
| 49 | 71.93 |
| 50 | 29.56 |
| 50 | 45.82 |
| 50 | 71.6 |
| 51 | 30.45 |
| 51 | 46.42 |
| 51 | 73.99 |
| 52 | 31.34 |
| 52 | 47.01 |
| 52 | 76.38 |
| 53 | 32.23 |
| 53 | 47.61 |
| 53 | 78.78 |
| 54 | 33.12 |
| 54 | 48.2 |
| 54 | 81.17 |
| 55 | 34.01 |
| 55 | 48.8 |
| 55 | 83.56 |
| 56 | 35.23 |
| 56 | 50.08 |
| 56 | 84.46 |
| 57 | 36.45 |
| 57 | 51.36 |
| 57 | 85.35 |
| 58 | 37.67 |
| 58 | 52.64 |
| 58 | 86.25 |
| 59 | 38.89 |
| 59 | 53.93 |
| 59 | 87.14 |
| 60 | 40.11 |
| 60 | 55.21 |
| 60 | 88.04 |
| 61 | 41.69 |
| 61 | 57.56 |
| 61 | 90.91 |
| 62 | 43.27 |
| 62 | 59.91 |
| 62 | 93.79 |
| 63 | 44.85 |
| 63 | 62.26 |
| 63 | 96.67 |
| 64 | 46.43 |
| 64 | 64.61 |
| 64 | 99.54 |
| 65 | 48.01 |
| 65 | 66.96 |
| 65 | 102.42 |
| 66 | 50.68 |
| 66 | 70.65 |
| 66 | 105.0 |
| 67 | 53.36 |
| 67 | 74.34 |
| 67 | 107.59 |
| 68 | 56.03 |
| 68 | 78.03 |
| 68 | 110.18 |
| 69 | 58.71 |
| 69 | 81.73 |
| 69 | 112.76 |
| 70 | 61.38 |
| 70 | 85.42 |
| 70 | 115.35 |
| 71 | 67.54 |
| 71 | 94.68 |
| 71 | 122.14 |
| 72 | 73.7 |
| 72 | 103.94 |
| 72 | 128.94 |
| 73 | 79.85 |
| 73 | 113.2 |
| 73 | 135.73 |
| 74 | 86.01 |
| 74 | 122.46 |
| 74 | 142.53 |
| 75 | 92.17 |
| 75 | 131.72 |
| 75 | 149.33 |
| 76 | 98.82 |
| 76 | 144.91 |
| 76 | 159.3 |
| 77 | 105.48 |
| 77 | 155.07 |
| 77 | 169.28 |
| 78 | 112.14 |
| 78 | 165.2 |
| 78 | 179.26 |
| 79 | 118.79 |
| 79 | 175.34 |
| 79 | 189.24 |
| 80 | 125.45 |
| 80 | 185.47 |
| 80 | 199.22 |
| 81 | 139.74 |
| 81 | 206.83 |
| 81 | 219.77 |
| 82 | 154.02 |
| 82 | 228.19 |
| 82 | 240.32 |
| 83 | 168.31 |
| 83 | 249.55 |
| 83 | 260.87 |
| 84 | 182.59 |
| 84 | 267.15 |
| 84 | 281.42 |
| 85 | 196.88 |
| 85 | 284.52 |
| 85 | 301.96 |
| 18 | 9.56 |
| 18 | 11.13 |
| 18 | 18.98 |
| 19 | 10.27 |
| 19 | 11.96 |
| 19 | 20.36 |
| 20 | 10.63 |
| 20 | 12.38 |
| 20 | 21.75 |
| 21 | 10.89 |
| 21 | 12.74 |
| 21 | 22.4 |
| 22 | 11.15 |
| 22 | 13.11 |
| 22 | 23.05 |
| 23 | 11.41 |
| 23 | 13.47 |
| 23 | 23.7 |
| 24 | 11.67 |
| 24 | 13.84 |
| 24 | 24.35 |
| 25 | 11.93 |
| 25 | 14.2 |
| 25 | 25.0 |
| 26 | 12.42 |
| 26 | 14.79 |
| 26 | 26.25 |
| 27 | 12.9 |
| 27 | 15.38 |
| 27 | 27.5 |
| 28 | 13.38 |
| 28 | 15.97 |
| 28 | 28.74 |
| 29 | 13.86 |
| 29 | 16.55 |
| 29 | 29.99 |
| 30 | 14.34 |
| 30 | 17.14 |
| 30 | 31.24 |
| 31 | 14.71 |
| 31 | 17.64 |
| 31 | 32.15 |
| 32 | 15.08 |
| 32 | 18.14 |
| 32 | 33.07 |
| 33 | 15.45 |
| 33 | 18.64 |
| 33 | 33.98 |
| 34 | 15.82 |
| 34 | 19.13 |
| 34 | 34.9 |
| 35 | 16.19 |
| 35 | 19.63 |
| 35 | 35.81 |
| 36 | 16.6 |
| 36 | 20.27 |
| 36 | 36.92 |
| 37 | 17.01 |
| 37 | 20.91 |
| 37 | 38.03 |
| 38 | 17.41 |
| 38 | 21.56 |
| 38 | 39.14 |
| 39 | 17.82 |
| 39 | 22.2 |
| 39 | 40.25 |
| 40 | 23.23 |
| 40 | 35.48 |
| 40 | 41.36 |
| 41 | 23.69 |
| 41 | 35.92 |
| 41 | 44.01 |
| 42 | 24.16 |
| 42 | 36.36 |
| 42 | 46.66 |
| 43 | 24.63 |
| 43 | 36.79 |
| 43 | 49.32 |
| 44 | 25.1 |
| 44 | 37.23 |
| 44 | 51.97 |
| 45 | 25.56 |
| 45 | 37.67 |
| 45 | 54.62 |
| 46 | 26.04 |
| 46 | 38.24 |
| 46 | 55.5 |
| 47 | 26.52 |
| 47 | 38.81 |
| 47 | 56.38 |
| 48 | 26.99 |
| 48 | 39.39 |
| 48 | 57.26 |
| 49 | 27.47 |
| 49 | 39.96 |
| 49 | 58.13 |
| 50 | 27.95 |
| 50 | 40.53 |
| 50 | 59.01 |
| 51 | 28.84 |
| 51 | 41.12 |
| 51 | 61.32 |
| 52 | 29.73 |
| 52 | 41.72 |
| 52 | 63.63 |
| 53 | 30.62 |
| 53 | 42.32 |
| 53 | 65.94 |
| 54 | 31.51 |
| 54 | 42.91 |
| 54 | 68.24 |
| 55 | 32.4 |
| 55 | 43.51 |
| 55 | 70.55 |
| 56 | 33.62 |
| 56 | 44.79 |
| 56 | 71.92 |
| 57 | 34.84 |
| 57 | 46.07 |
| 57 | 73.28 |
| 58 | 36.06 |
| 58 | 47.35 |
| 58 | 74.64 |
| 59 | 37.29 |
| 59 | 48.63 |
| 59 | 76.01 |
| 60 | 38.51 |
| 60 | 49.91 |
| 60 | 77.37 |
| 61 | 39.43 |
| 61 | 52.26 |
| 61 | 80.16 |
| 62 | 40.36 |
| 62 | 54.62 |
| 62 | 82.94 |
| 63 | 41.29 |
| 63 | 56.97 |
| 63 | 85.73 |
| 64 | 42.22 |
| 64 | 59.32 |
| 64 | 88.51 |
| 65 | 43.15 |
| 65 | 61.67 |
| 65 | 91.3 |
| 66 | 46.47 |
| 66 | 65.36 |
| 66 | 94.07 |
| 67 | 49.8 |
| 67 | 69.05 |
| 67 | 96.84 |
| 68 | 53.12 |
| 68 | 72.74 |
| 68 | 99.62 |
| 69 | 56.45 |
| 69 | 76.43 |
| 69 | 102.39 |
| 70 | 59.77 |
| 70 | 80.12 |
| 70 | 105.16 |
| 71 | 65.9 |
| 71 | 89.28 |
| 71 | 111.76 |
| 72 | 72.02 |
| 72 | 98.43 |
| 72 | 118.35 |
| 73 | 78.15 |
| 73 | 107.58 |
| 73 | 124.94 |
| 74 | 84.27 |
| 74 | 116.74 |
| 74 | 131.53 |
| 75 | 90.4 |
| 75 | 125.89 |
| 75 | 138.12 |
| 76 | 98.82 |
| 76 | 144.91 |
| 76 | 159.3 |
| 77 | 105.48 |
| 77 | 155.07 |
| 77 | 169.28 |
| 78 | 112.14 |
| 78 | 165.2 |
| 78 | 179.26 |
| 79 | 118.79 |
| 79 | 175.34 |
| 79 | 189.24 |
| 80 | 125.45 |
| 80 | 185.47 |
| 80 | 199.22 |
| 81 | 139.74 |
| 81 | 206.83 |
| 81 | 219.77 |
| 82 | 154.02 |
| 82 | 228.19 |
| 82 | 240.32 |
| 83 | 168.31 |
| 83 | 249.55 |
| 83 | 260.87 |
| 84 | 182.59 |
| 84 | 267.15 |
| 84 | 281.42 |
| 85 | 196.88 |
| 85 | 284.52 |
| 85 | 301.96 |
| 18 | 9.56 |
| 18 | 11.13 |
| 18 | 18.98 |
| 19 | 10.27 |
| 19 | 11.96 |
| 19 | 20.36 |
| 20 | 10.63 |
| 20 | 12.38 |
| 20 | 21.75 |
| 21 | 10.89 |
| 21 | 12.74 |
| 21 | 22.4 |
| 22 | 11.15 |
| 22 | 13.11 |
| 22 | 23.05 |
| 23 | 11.41 |
| 23 | 13.47 |
| 23 | 23.7 |
| 24 | 11.67 |
| 24 | 13.84 |
| 24 | 24.35 |
| 25 | 11.93 |
| 25 | 14.2 |
| 25 | 25.0 |
| 26 | 12.42 |
| 26 | 14.79 |
| 26 | 26.25 |
| 27 | 12.9 |
| 27 | 15.38 |
| 27 | 27.5 |
| 28 | 13.38 |
| 28 | 15.97 |
| 28 | 28.74 |
| 29 | 13.86 |
| 29 | 16.55 |
| 29 | 29.99 |
| 30 | 14.34 |
| 30 | 17.14 |
| 30 | 31.24 |
| 31 | 14.71 |
| 31 | 17.64 |
| 31 | 32.15 |
| 32 | 15.08 |
| 32 | 18.14 |
| 32 | 33.07 |
| 33 | 15.45 |
| 33 | 18.64 |
| 33 | 33.98 |
| 34 | 15.82 |
| 34 | 19.13 |
| 34 | 34.9 |
| 35 | 16.19 |
| 35 | 19.63 |
| 35 | 35.81 |
| 36 | 16.6 |
| 36 | 20.27 |
| 36 | 36.92 |
| 37 | 17.01 |
| 37 | 20.91 |
| 37 | 38.03 |
| 38 | 17.41 |
| 38 | 21.56 |
| 38 | 39.14 |
| 39 | 17.82 |
| 39 | 22.2 |
| 39 | 40.25 |
| 40 | 23.23 |
| 40 | 35.48 |
| 40 | 41.36 |
| 41 | 23.69 |
| 41 | 35.92 |
| 41 | 44.01 |
| 42 | 24.16 |
| 42 | 36.36 |
| 42 | 46.66 |
| 43 | 24.63 |
| 43 | 36.79 |
| 43 | 49.32 |
| 44 | 25.1 |
| 44 | 37.23 |
| 44 | 51.97 |
| 45 | 25.56 |
| 45 | 37.67 |
| 45 | 54.62 |
| 46 | 26.04 |
| 46 | 38.24 |
| 46 | 55.5 |
| 47 | 26.52 |
| 47 | 38.81 |
| 47 | 56.38 |
| 48 | 26.99 |
| 48 | 39.39 |
| 48 | 57.26 |
| 49 | 27.47 |
| 49 | 39.96 |
| 49 | 58.13 |
| 50 | 27.95 |
| 50 | 40.53 |
| 50 | 59.01 |
| 51 | 28.84 |
| 51 | 41.12 |
| 51 | 61.32 |
| 52 | 29.73 |
| 52 | 41.72 |
| 52 | 63.63 |
| 53 | 30.62 |
| 53 | 42.32 |
| 53 | 65.94 |
| 54 | 31.51 |
| 54 | 42.91 |
| 54 | 68.24 |
| 55 | 32.4 |
| 55 | 43.51 |
| 55 | 70.55 |
| 56 | 33.62 |
| 56 | 44.79 |
| 56 | 71.92 |
| 57 | 34.84 |
| 57 | 46.07 |
| 57 | 73.28 |
| 58 | 36.06 |
| 58 | 47.35 |
| 58 | 74.64 |
| 59 | 37.29 |
| 59 | 48.63 |
| 59 | 76.01 |
| 60 | 38.51 |
| 60 | 49.91 |
| 60 | 77.37 |
| 61 | 39.43 |
| 61 | 52.26 |
| 61 | 80.16 |
| 62 | 40.36 |
| 62 | 54.62 |
| 62 | 82.94 |
| 63 | 41.29 |
| 63 | 56.97 |
| 63 | 85.73 |
| 64 | 42.22 |
| 64 | 59.32 |
| 64 | 88.51 |
| 65 | 43.15 |
| 65 | 61.67 |
| 65 | 91.3 |
| 66 | 46.47 |
| 66 | 65.36 |
| 66 | 94.07 |
| 67 | 49.8 |
| 67 | 69.05 |
| 67 | 96.84 |
| 68 | 53.12 |
| 68 | 72.74 |
| 68 | 99.62 |
| 69 | 56.45 |
| 69 | 76.43 |
| 69 | 102.39 |
| 70 | 59.77 |
| 70 | 80.12 |
| 70 | 105.16 |
| 71 | 65.9 |
| 71 | 89.28 |
| 71 | 111.76 |
| 72 | 72.02 |
| 72 | 98.43 |
| 72 | 118.35 |
| 73 | 78.15 |
| 73 | 107.58 |
| 73 | 124.94 |
| 74 | 84.27 |
| 74 | 116.74 |
| 74 | 131.53 |
| 75 | 90.4 |
| 75 | 125.89 |
| 75 | 138.12 |

## FE Express rates — fe_express_solution band= sex=male class= state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 54.68 |
| 18 | 57.07 |
| 19 | 60.73 |
| 19 | 63.34 |
| 20 | 62.25 |
| 20 | 64.91 |
| 21 | 62.48 |
| 21 | 65.41 |
| 22 | 62.71 |
| 22 | 65.91 |
| 23 | 62.95 |
| 23 | 66.41 |
| 24 | 63.18 |
| 24 | 66.91 |
| 25 | 63.42 |
| 25 | 67.41 |
| 26 | 65.5 |
| 26 | 69.94 |
| 27 | 67.58 |
| 27 | 72.48 |
| 28 | 69.66 |
| 28 | 75.01 |
| 29 | 71.74 |
| 29 | 77.54 |
| 30 | 73.82 |
| 30 | 80.08 |
| 31 | 74.55 |
| 31 | 81.46 |
| 32 | 75.27 |
| 32 | 82.83 |
| 33 | 76.0 |
| 33 | 84.21 |
| 34 | 76.73 |
| 34 | 85.59 |
| 35 | 77.46 |
| 35 | 86.97 |
| 36 | 77.32 |
| 36 | 87.51 |
| 37 | 77.19 |
| 37 | 88.04 |
| 38 | 77.06 |
| 38 | 88.58 |
| 39 | 76.93 |
| 39 | 89.11 |
| 40 | 76.79 |
| 40 | 89.65 |
| 41 | 78.64 |
| 41 | 92.94 |
| 42 | 80.49 |
| 42 | 96.24 |
| 43 | 82.34 |
| 43 | 99.53 |
| 44 | 84.19 |
| 44 | 102.83 |
| 45 | 86.04 |
| 45 | 106.13 |
| 46 | 83.5 |
| 46 | 104.62 |
| 47 | 80.96 |
| 47 | 103.12 |
| 48 | 78.42 |
| 48 | 101.62 |
| 49 | 75.88 |
| 49 | 100.11 |
| 50 | 73.34 |
| 50 | 98.61 |
| 51 | 75.63 |
| 51 | 102.64 |
| 52 | 77.92 |
| 52 | 106.67 |
| 53 | 80.21 |
| 53 | 110.71 |
| 54 | 82.5 |
| 54 | 114.74 |
| 55 | 84.79 |
| 55 | 118.77 |
| 56 | 85.95 |
| 56 | 121.38 |
| 57 | 87.1 |
| 57 | 124.0 |
| 58 | 88.26 |
| 58 | 126.62 |
| 59 | 89.41 |
| 59 | 129.23 |
| 60 | 90.57 |
| 60 | 131.85 |
| 61 | 94.46 |
| 61 | 137.23 |
| 62 | 98.36 |
| 62 | 142.6 |
| 63 | 102.25 |
| 63 | 147.98 |
| 64 | 106.15 |
| 64 | 153.35 |
| 65 | 110.04 |
| 65 | 158.73 |
| 66 | 113.77 |
| 66 | 162.6 |
| 67 | 117.51 |
| 67 | 166.48 |
| 68 | 121.24 |
| 68 | 170.36 |
| 69 | 124.97 |
| 69 | 174.24 |
| 70 | 128.7 |
| 70 | 178.11 |
| 71 | 138.12 |
| 71 | 188.84 |
| 72 | 147.53 |
| 72 | 199.57 |
| 73 | 156.95 |
| 73 | 210.3 |
| 74 | 166.37 |
| 74 | 221.02 |
| 75 | 176.61 |
| 75 | 231.75 |
| 76 | 191.61 |
| 76 | 250.27 |
| 77 | 207.43 |
| 77 | 268.78 |
| 78 | 223.25 |
| 78 | 287.3 |
| 79 | 239.08 |
| 79 | 305.82 |
| 80 | 254.9 |
| 80 | 24.34 |
| 81 | 289.38 |
| 81 | 369.99 |
| 82 | 323.86 |
| 82 | 15.64 |
| 83 | 360.62 |
| 83 | 461.29 |
| 84 | 397.69 |
| 84 | 506.94 |
| 85 | 434.77 |
| 85 | 552.59 |
| 18 | 19.03 |
| 18 | 21.92 |
| 18 | 36.08 |
| 19 | 20.39 |
| 19 | 23.48 |
| 19 | 38.55 |
| 20 | 21.08 |
| 20 | 24.26 |
| 20 | 41.01 |
| 21 | 21.27 |
| 21 | 24.46 |
| 21 | 41.49 |
| 22 | 21.47 |
| 22 | 24.65 |
| 22 | 41.97 |
| 23 | 21.67 |
| 23 | 24.84 |
| 23 | 42.46 |
| 24 | 21.87 |
| 24 | 25.03 |
| 24 | 42.94 |
| 25 | 22.07 |
| 25 | 25.23 |
| 25 | 43.42 |
| 26 | 22.85 |
| 26 | 26.06 |
| 26 | 45.15 |
| 27 | 23.62 |
| 27 | 26.89 |
| 27 | 46.88 |
| 28 | 24.4 |
| 28 | 27.72 |
| 28 | 48.61 |
| 29 | 25.18 |
| 29 | 28.56 |
| 29 | 50.34 |
| 30 | 25.96 |
| 30 | 29.39 |
| 30 | 52.07 |
| 31 | 26.4 |
| 31 | 30.02 |
| 31 | 53.36 |
| 32 | 26.85 |
| 32 | 30.64 |
| 32 | 54.65 |
| 33 | 27.3 |
| 33 | 31.27 |
| 33 | 55.94 |
| 34 | 27.74 |
| 34 | 31.9 |
| 34 | 57.23 |
| 35 | 28.19 |
| 35 | 32.52 |
| 35 | 58.53 |
| 36 | 28.47 |
| 36 | 33.07 |
| 36 | 59.43 |
| 37 | 28.75 |
| 37 | 33.61 |
| 37 | 60.33 |
| 38 | 29.04 |
| 38 | 34.15 |
| 38 | 61.23 |
| 39 | 29.32 |
| 39 | 34.7 |
| 39 | 62.13 |
| 40 | 27.68 |
| 40 | 43.86 |
| 40 | 63.03 |
| 41 | 28.37 |
| 41 | 44.51 |
| 41 | 66.07 |
| 42 | 29.06 |
| 42 | 45.16 |
| 42 | 69.11 |
| 43 | 29.74 |
| 43 | 45.8 |
| 43 | 72.14 |
| 44 | 30.43 |
| 44 | 46.45 |
| 44 | 75.18 |
| 45 | 31.11 |
| 45 | 47.1 |
| 45 | 78.22 |
| 46 | 31.94 |
| 46 | 47.93 |
| 46 | 78.5 |
| 47 | 32.78 |
| 47 | 48.77 |
| 47 | 78.78 |
| 48 | 33.61 |
| 48 | 49.6 |
| 48 | 79.07 |
| 49 | 34.44 |
| 49 | 50.43 |
| 49 | 79.35 |
| 50 | 35.27 |
| 50 | 51.27 |
| 50 | 79.63 |
| 51 | 36.49 |
| 51 | 52.54 |
| 51 | 83.48 |
| 52 | 37.72 |
| 52 | 53.81 |
| 52 | 87.32 |
| 53 | 38.94 |
| 53 | 55.08 |
| 53 | 91.17 |
| 54 | 40.17 |
| 54 | 56.35 |
| 54 | 95.02 |
| 55 | 41.39 |
| 55 | 57.63 |
| 55 | 98.86 |
| 56 | 43.06 |
| 56 | 59.8 |
| 56 | 102.11 |
| 57 | 44.73 |
| 57 | 61.98 |
| 57 | 105.37 |
| 58 | 46.4 |
| 58 | 64.16 |
| 58 | 108.62 |
| 59 | 48.07 |
| 59 | 66.33 |
| 59 | 111.87 |
| 60 | 49.74 |
| 60 | 68.51 |
| 60 | 115.12 |
| 61 | 52.31 |
| 61 | 72.06 |
| 61 | 120.3 |
| 62 | 54.87 |
| 62 | 75.62 |
| 62 | 125.47 |
| 63 | 57.44 |
| 63 | 79.17 |
| 63 | 130.65 |
| 64 | 60.0 |
| 64 | 82.72 |
| 64 | 135.83 |
| 65 | 62.57 |
| 65 | 86.28 |
| 65 | 141.0 |
| 66 | 66.47 |
| 66 | 91.67 |
| 66 | 144.88 |
| 67 | 70.38 |
| 67 | 97.06 |
| 67 | 148.76 |
| 68 | 74.28 |
| 68 | 102.45 |
| 68 | 152.63 |
| 69 | 78.19 |
| 69 | 107.84 |
| 69 | 156.51 |
| 70 | 82.09 |
| 70 | 113.23 |
| 70 | 160.39 |
| 71 | 90.43 |
| 71 | 125.91 |
| 71 | 170.71 |
| 72 | 98.76 |
| 72 | 138.58 |
| 72 | 181.02 |
| 73 | 107.09 |
| 73 | 151.26 |
| 73 | 191.34 |
| 74 | 115.43 |
| 74 | 163.94 |
| 74 | 201.66 |
| 75 | 123.76 |
| 75 | 176.61 |
| 75 | 211.98 |
| 76 | 133.66 |
| 76 | 191.17 |
| 76 | 229.09 |
| 77 | 143.55 |
| 77 | 205.73 |
| 77 | 246.21 |
| 78 | 153.45 |
| 78 | 220.29 |
| 78 | 263.32 |
| 79 | 163.34 |
| 79 | 234.84 |
| 79 | 280.44 |
| 80 | 173.24 |
| 80 | 249.4 |
| 80 | 297.55 |
| 81 | 191.85 |
| 81 | 286.48 |
| 81 | 331.53 |
| 82 | 210.46 |
| 82 | 323.55 |
| 82 | 365.51 |
| 83 | 229.07 |
| 83 | 360.62 |
| 83 | 399.49 |
| 84 | 247.69 |
| 84 | 397.69 |
| 84 | 433.48 |
| 85 | 266.3 |
| 85 | 434.77 |
| 85 | 467.46 |
| 18 | 10.81 |
| 18 | 13.56 |
| 18 | 21.87 |
| 19 | 11.6 |
| 19 | 14.53 |
| 19 | 23.34 |
| 20 | 11.99 |
| 20 | 15.01 |
| 20 | 24.8 |
| 21 | 12.19 |
| 21 | 15.2 |
| 21 | 25.27 |
| 22 | 12.38 |
| 22 | 15.39 |
| 22 | 25.75 |
| 23 | 12.58 |
| 23 | 15.58 |
| 23 | 26.22 |
| 24 | 12.77 |
| 24 | 15.77 |
| 24 | 26.69 |
| 25 | 12.97 |
| 25 | 15.96 |
| 25 | 27.16 |
| 26 | 13.45 |
| 26 | 16.49 |
| 26 | 28.34 |
| 27 | 13.94 |
| 27 | 17.02 |
| 27 | 29.53 |
| 28 | 14.42 |
| 28 | 17.55 |
| 28 | 30.72 |
| 29 | 14.9 |
| 29 | 18.08 |
| 29 | 31.91 |
| 30 | 15.38 |
| 30 | 18.61 |
| 30 | 33.1 |
| 31 | 15.81 |
| 31 | 19.21 |
| 31 | 34.33 |
| 32 | 16.24 |
| 32 | 19.81 |
| 32 | 35.56 |
| 33 | 16.68 |
| 33 | 20.41 |
| 33 | 36.79 |
| 34 | 17.11 |
| 34 | 21.01 |
| 34 | 38.02 |
| 35 | 17.54 |
| 35 | 21.61 |
| 35 | 39.25 |
| 36 | 17.98 |
| 36 | 22.3 |
| 36 | 40.41 |
| 37 | 18.43 |
| 37 | 22.99 |
| 37 | 41.56 |
| 38 | 18.88 |
| 38 | 23.69 |
| 38 | 42.72 |
| 39 | 19.32 |
| 39 | 24.38 |
| 39 | 43.87 |
| 40 | 26.08 |
| 40 | 38.56 |
| 40 | 45.03 |
| 41 | 26.76 |
| 41 | 39.21 |
| 41 | 47.89 |
| 42 | 27.45 |
| 42 | 39.86 |
| 42 | 50.75 |
| 43 | 28.13 |
| 43 | 40.51 |
| 43 | 53.61 |
| 44 | 28.82 |
| 44 | 41.16 |
| 44 | 56.47 |
| 45 | 29.51 |
| 45 | 41.81 |
| 45 | 59.34 |
| 46 | 30.34 |
| 46 | 42.64 |
| 46 | 60.82 |
| 47 | 31.17 |
| 47 | 43.47 |
| 47 | 62.29 |
| 48 | 32.0 |
| 48 | 44.31 |
| 48 | 63.77 |
| 49 | 32.83 |
| 49 | 45.14 |
| 49 | 65.25 |
| 50 | 33.66 |
| 50 | 45.97 |
| 50 | 66.73 |
| 51 | 34.88 |
| 51 | 47.24 |
| 51 | 70.43 |
| 52 | 36.11 |
| 52 | 48.52 |
| 52 | 74.12 |
| 53 | 37.33 |
| 53 | 49.79 |
| 53 | 77.82 |
| 54 | 38.56 |
| 54 | 51.06 |
| 54 | 81.51 |
| 55 | 39.79 |
| 55 | 52.33 |
| 55 | 85.21 |
| 56 | 41.45 |
| 56 | 54.51 |
| 56 | 88.86 |
| 57 | 43.12 |
| 57 | 56.69 |
| 57 | 92.51 |
| 58 | 44.79 |
| 58 | 58.86 |
| 58 | 96.16 |
| 59 | 46.46 |
| 59 | 61.04 |
| 59 | 99.81 |
| 60 | 48.13 |
| 60 | 63.22 |
| 60 | 103.47 |
| 61 | 50.05 |
| 61 | 66.77 |
| 61 | 108.47 |
| 62 | 51.96 |
| 62 | 70.32 |
| 62 | 113.47 |
| 63 | 53.88 |
| 63 | 73.88 |
| 63 | 118.47 |
| 64 | 55.79 |
| 64 | 77.43 |
| 64 | 123.47 |
| 65 | 57.7 |
| 65 | 80.98 |
| 65 | 128.47 |
| 66 | 62.26 |
| 66 | 86.37 |
| 66 | 132.51 |
| 67 | 66.82 |
| 67 | 91.76 |
| 67 | 136.55 |
| 68 | 71.37 |
| 68 | 97.15 |
| 68 | 140.59 |
| 69 | 75.93 |
| 69 | 102.55 |
| 69 | 144.63 |
| 70 | 80.48 |
| 70 | 107.94 |
| 70 | 148.67 |
| 71 | 88.78 |
| 71 | 120.51 |
| 71 | 158.67 |
| 72 | 97.09 |
| 72 | 133.08 |
| 72 | 168.66 |
| 73 | 105.39 |
| 73 | 145.65 |
| 73 | 178.65 |
| 74 | 113.69 |
| 74 | 158.22 |
| 74 | 188.64 |
| 75 | 121.99 |
| 75 | 170.79 |
| 75 | 198.64 |
| 76 | 133.66 |
| 76 | 191.17 |
| 76 | 229.09 |
| 77 | 143.55 |
| 77 | 205.73 |
| 77 | 246.21 |
| 78 | 153.45 |
| 78 | 220.29 |
| 78 | 263.32 |
| 79 | 163.34 |
| 79 | 234.84 |
| 79 | 280.44 |
| 80 | 173.24 |
| 80 | 249.4 |
| 80 | 297.55 |
| 81 | 191.85 |
| 81 | 286.48 |
| 81 | 331.53 |
| 82 | 210.46 |
| 82 | 323.55 |
| 82 | 365.51 |
| 83 | 229.07 |
| 83 | 360.62 |
| 83 | 399.49 |
| 84 | 247.69 |
| 84 | 397.69 |
| 84 | 433.48 |
| 85 | 266.3 |
| 85 | 434.77 |
| 85 | 467.46 |
| 18 | 10.81 |
| 18 | 13.56 |
| 18 | 21.87 |
| 19 | 11.6 |
| 19 | 14.53 |
| 19 | 23.34 |
| 20 | 11.99 |
| 20 | 15.01 |
| 20 | 24.8 |
| 21 | 12.19 |
| 21 | 15.2 |
| 21 | 25.27 |
| 22 | 12.38 |
| 22 | 15.39 |
| 22 | 25.75 |
| 23 | 12.58 |
| 23 | 15.58 |
| 23 | 26.22 |
| 24 | 12.77 |
| 24 | 15.77 |
| 24 | 26.69 |
| 25 | 12.97 |
| 25 | 15.96 |
| 25 | 27.16 |
| 26 | 13.45 |
| 26 | 16.49 |
| 26 | 28.34 |
| 27 | 13.94 |
| 27 | 17.02 |
| 27 | 29.53 |
| 28 | 14.42 |
| 28 | 17.55 |
| 28 | 30.72 |
| 29 | 14.9 |
| 29 | 18.08 |
| 29 | 31.91 |
| 30 | 15.38 |
| 30 | 18.61 |
| 30 | 33.1 |
| 31 | 15.81 |
| 31 | 19.21 |
| 31 | 34.33 |
| 32 | 16.24 |
| 32 | 19.81 |
| 32 | 35.56 |
| 33 | 16.68 |
| 33 | 20.41 |
| 33 | 36.79 |
| 34 | 17.11 |
| 34 | 21.01 |
| 34 | 38.02 |
| 35 | 17.54 |
| 35 | 21.61 |
| 35 | 39.25 |
| 36 | 17.98 |
| 36 | 22.3 |
| 36 | 40.41 |
| 37 | 18.43 |
| 37 | 22.99 |
| 37 | 41.56 |
| 38 | 18.88 |
| 38 | 23.69 |
| 38 | 42.72 |
| 39 | 19.32 |
| 39 | 24.38 |
| 39 | 43.87 |
| 40 | 26.08 |
| 40 | 38.56 |
| 40 | 45.03 |
| 41 | 26.76 |
| 41 | 39.21 |
| 41 | 47.89 |
| 42 | 27.45 |
| 42 | 39.86 |
| 42 | 50.75 |
| 43 | 28.13 |
| 43 | 40.51 |
| 43 | 53.61 |
| 44 | 28.82 |
| 44 | 41.16 |
| 44 | 56.47 |
| 45 | 29.51 |
| 45 | 41.81 |
| 45 | 59.34 |
| 46 | 30.34 |
| 46 | 42.64 |
| 46 | 60.82 |
| 47 | 31.17 |
| 47 | 43.47 |
| 47 | 62.29 |
| 48 | 32.0 |
| 48 | 44.31 |
| 48 | 63.77 |
| 49 | 32.83 |
| 49 | 45.14 |
| 49 | 65.25 |
| 50 | 33.66 |
| 50 | 45.97 |
| 50 | 66.73 |
| 51 | 34.88 |
| 51 | 47.24 |
| 51 | 70.43 |
| 52 | 36.11 |
| 52 | 48.52 |
| 52 | 74.12 |
| 53 | 37.33 |
| 53 | 49.79 |
| 53 | 77.82 |
| 54 | 38.56 |
| 54 | 51.06 |
| 54 | 81.51 |
| 55 | 39.79 |
| 55 | 52.33 |
| 55 | 85.21 |
| 56 | 41.45 |
| 56 | 54.51 |
| 56 | 88.86 |
| 57 | 43.12 |
| 57 | 56.69 |
| 57 | 92.51 |
| 58 | 44.79 |
| 58 | 58.86 |
| 58 | 96.16 |
| 59 | 46.46 |
| 59 | 61.04 |
| 59 | 99.81 |
| 60 | 48.13 |
| 60 | 63.22 |
| 60 | 103.47 |
| 61 | 50.05 |
| 61 | 66.77 |
| 61 | 108.47 |
| 62 | 51.96 |
| 62 | 70.32 |
| 62 | 113.47 |
| 63 | 53.88 |
| 63 | 73.88 |
| 63 | 118.47 |
| 64 | 55.79 |
| 64 | 77.43 |
| 64 | 123.47 |
| 65 | 57.7 |
| 65 | 80.98 |
| 65 | 128.47 |
| 66 | 62.26 |
| 66 | 86.37 |
| 66 | 132.51 |
| 67 | 66.82 |
| 67 | 91.76 |
| 67 | 136.55 |
| 68 | 71.37 |
| 68 | 97.15 |
| 68 | 140.59 |
| 69 | 75.93 |
| 69 | 102.55 |
| 69 | 144.63 |
| 70 | 80.48 |
| 70 | 107.94 |
| 70 | 148.67 |
| 71 | 88.78 |
| 71 | 120.51 |
| 71 | 158.67 |
| 72 | 97.09 |
| 72 | 133.08 |
| 72 | 168.66 |
| 73 | 105.39 |
| 73 | 145.65 |
| 73 | 178.65 |
| 74 | 113.69 |
| 74 | 158.22 |
| 74 | 188.64 |
| 75 | 121.99 |
| 75 | 170.79 |
| 75 | 198.64 |


## FE Portfolio — rate tables (from CSV)
Source CSV: `fe_portfolio_rates.csv` · rows=1411. Use rate formula from Agent Guide (× units + fee × modal). Montana often Unisex-Male. Verify before binding.

## FE Portfolio rates — 10-Pay band= sex=Female class=Juvenile state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 0 | 16.44 |
| 1 | 16.72 |
| 2 | 16.99 |
| 3 | 17.27 |
| 4 | 17.54 |
| 5 | 17.82 |
| 6 | 18.23 |
| 7 | 18.64 |
| 8 | 19.06 |
| 9 | 19.47 |
| 10 | 19.88 |
| 11 | 20.39 |
| 12 | 20.9 |
| 13 | 21.42 |
| 14 | 21.93 |
| 15 | 22.44 |
| 16 | 23.64 |
| 17 | 24.85 |
| 0 | 17.85 |
| 1 | 18.02 |
| 2 | 18.19 |
| 3 | 18.37 |
| 4 | 18.55 |
| 5 | 18.72 |
| 6 | 19.18 |
| 7 | 19.64 |
| 8 | 20.1 |
| 9 | 20.56 |
| 10 | 21.02 |
| 11 | 21.62 |
| 12 | 22.21 |
| 13 | 22.81 |
| 14 | 23.4 |
| 15 | 24.0 |
| 16 | 25.56 |
| 17 | 27.11 |

## FE Portfolio rates — 10-Pay band= sex=Female class=Nontobacco state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 19.61 |
| 19 | 19.96 |
| 20 | 20.4 |
| 21 | 21.03 |
| 22 | 21.67 |
| 23 | 22.3 |
| 24 | 22.93 |
| 25 | 23.57 |
| 26 | 25.36 |
| 27 | 27.16 |
| 28 | 28.94 |
| 29 | 30.74 |
| 30 | 32.53 |
| 31 | 33.3 |
| 32 | 34.07 |
| 33 | 34.85 |
| 34 | 35.62 |
| 35 | 36.38 |
| 36 | 37.27 |
| 37 | 38.15 |
| 38 | 39.03 |
| 39 | 39.92 |
| 40 | 40.8 |
| 41 | 42.39 |
| 42 | 43.99 |
| 43 | 45.57 |
| 44 | 47.16 |
| 45 | 48.76 |
| 46 | 50.73 |
| 47 | 52.68 |
| 48 | 54.65 |
| 49 | 56.61 |
| 50 | 58.58 |
| 51 | 60.36 |
| 52 | 62.15 |
| 53 | 63.95 |
| 54 | 65.73 |
| 55 | 67.52 |
| 56 | 68.78 |
| 57 | 70.04 |
| 58 | 71.31 |
| 59 | 72.57 |
| 60 | 73.83 |
| 61 | 75.92 |
| 62 | 78.01 |
| 63 | 80.09 |
| 64 | 82.19 |
| 65 | 84.27 |
| 66 | 86.84 |
| 67 | 89.41 |
| 68 | 91.98 |
| 69 | 94.55 |
| 70 | 97.12 |
| 71 | 100.74 |
| 72 | 104.36 |
| 73 | 107.98 |
| 74 | 111.6 |
| 75 | 115.22 |
| 76 | 121.97 |
| 77 | 128.72 |
| 78 | 135.48 |
| 79 | 142.22 |
| 80 | 148.97 |
| 81 | 156.4 |
| 82 | 163.83 |
| 83 | 171.27 |
| 84 | 178.7 |
| 85 | 186.13 |
| 18 | 20.64 |
| 19 | 21.0 |
| 20 | 21.46 |
| 21 | 22.31 |
| 22 | 23.17 |
| 23 | 24.03 |
| 24 | 24.89 |
| 25 | 25.75 |
| 26 | 27.64 |
| 27 | 29.53 |
| 28 | 31.42 |
| 29 | 33.31 |
| 30 | 35.2 |
| 31 | 35.71 |
| 32 | 36.22 |
| 33 | 36.73 |
| 34 | 37.24 |
| 35 | 37.75 |
| 36 | 38.62 |
| 37 | 39.48 |
| 38 | 40.36 |
| 39 | 41.22 |
| 40 | 42.1 |
| 41 | 44.31 |
| 42 | 46.54 |
| 43 | 48.76 |
| 44 | 50.99 |
| 45 | 53.2 |
| 46 | 55.37 |
| 47 | 57.54 |
| 48 | 59.71 |
| 49 | 61.88 |
| 50 | 64.05 |
| 51 | 66.03 |
| 52 | 68.02 |
| 53 | 69.99 |
| 54 | 71.98 |
| 55 | 73.96 |
| 56 | 75.83 |
| 57 | 77.7 |
| 58 | 79.58 |
| 59 | 81.46 |
| 60 | 83.33 |
| 61 | 86.04 |
| 62 | 88.75 |
| 63 | 91.47 |
| 64 | 94.18 |
| 65 | 96.89 |
| 66 | 100.44 |
| 67 | 103.98 |
| 68 | 107.53 |
| 69 | 111.07 |
| 70 | 114.61 |
| 71 | 119.55 |
| 72 | 124.48 |
| 73 | 129.42 |
| 74 | 134.35 |
| 75 | 139.29 |
| 76 | 147.24 |
| 77 | 155.17 |
| 78 | 163.12 |
| 79 | 171.06 |
| 80 | 179.01 |
| 81 | 189.14 |
| 82 | 199.28 |
| 83 | 209.4 |
| 84 | 219.54 |
| 85 | 239.24 |

## FE Portfolio rates — 10-Pay band= sex=Female class=Tobacco state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 26.07 |
| 19 | 27.28 |
| 20 | 28.49 |
| 21 | 29.4 |
| 22 | 30.3 |
| 23 | 31.19 |
| 24 | 32.09 |
| 25 | 33.0 |
| 26 | 34.85 |
| 27 | 36.7 |
| 28 | 38.54 |
| 29 | 40.4 |
| 30 | 42.25 |
| 31 | 43.05 |
| 32 | 43.84 |
| 33 | 44.64 |
| 34 | 45.44 |
| 35 | 46.23 |
| 36 | 47.15 |
| 37 | 48.06 |
| 38 | 48.97 |
| 39 | 49.88 |
| 40 | 50.79 |
| 41 | 53.53 |
| 42 | 56.27 |
| 43 | 59.0 |
| 44 | 61.74 |
| 45 | 64.47 |
| 46 | 66.14 |
| 47 | 67.81 |
| 48 | 69.48 |
| 49 | 71.16 |
| 50 | 72.83 |
| 51 | 74.74 |
| 52 | 76.65 |
| 53 | 78.57 |
| 54 | 80.48 |
| 55 | 82.39 |
| 56 | 83.16 |
| 57 | 83.94 |
| 58 | 84.73 |
| 59 | 85.51 |
| 60 | 86.28 |
| 61 | 88.34 |
| 62 | 90.4 |
| 63 | 92.46 |
| 64 | 94.52 |
| 65 | 96.58 |
| 66 | 99.86 |
| 67 | 103.14 |
| 68 | 106.44 |
| 69 | 109.72 |
| 70 | 113.0 |
| 71 | 117.5 |
| 72 | 122.01 |
| 73 | 126.52 |
| 74 | 131.02 |
| 75 | 135.52 |
| 76 | 145.16 |
| 77 | 154.81 |
| 78 | 164.45 |
| 79 | 174.1 |
| 80 | 183.73 |
| 81 | 195.39 |
| 82 | 207.04 |
| 83 | 218.69 |
| 84 | 239.94 |
| 85 | 252.08 |
| 18 | 28.66 |
| 19 | 30.21 |
| 20 | 31.77 |
| 21 | 32.79 |
| 22 | 33.82 |
| 23 | 34.85 |
| 24 | 35.88 |
| 25 | 36.9 |
| 26 | 38.23 |
| 27 | 39.55 |
| 28 | 40.87 |
| 29 | 42.19 |
| 30 | 43.52 |
| 31 | 45.01 |
| 32 | 46.5 |
| 33 | 48.0 |
| 34 | 49.49 |
| 35 | 50.99 |
| 36 | 51.57 |
| 37 | 52.15 |
| 38 | 52.73 |
| 39 | 53.31 |
| 40 | 53.89 |
| 41 | 57.52 |
| 42 | 61.15 |
| 43 | 64.78 |
| 44 | 68.41 |
| 45 | 72.04 |
| 46 | 73.97 |
| 47 | 75.9 |
| 48 | 77.83 |
| 49 | 79.76 |
| 50 | 81.69 |
| 51 | 84.04 |
| 52 | 86.39 |
| 53 | 88.73 |
| 54 | 91.08 |
| 55 | 93.44 |
| 56 | 95.31 |
| 57 | 97.18 |
| 58 | 99.06 |
| 59 | 100.93 |
| 60 | 102.81 |
| 61 | 105.83 |
| 62 | 108.85 |
| 63 | 111.89 |
| 64 | 114.91 |
| 65 | 117.94 |
| 66 | 122.22 |
| 67 | 126.5 |
| 68 | 130.79 |
| 69 | 135.07 |
| 70 | 139.35 |
| 71 | 145.8 |
| 72 | 152.24 |
| 73 | 158.67 |
| 74 | 165.11 |
| 75 | 171.55 |
| 76 | 183.53 |
| 77 | 195.51 |
| 78 | 216.13 |
| 79 | 228.61 |
| 80 | 241.09 |
| 81 | 258.65 |
| 82 | 276.2 |
| 83 | 293.76 |
| 84 | 311.31 |
| 85 | 328.87 |

## FE Portfolio rates — 10-Pay band= sex=Male class=Juvenile state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 0 | 18.23 |
| 1 | 18.55 |
| 2 | 18.85 |
| 3 | 19.17 |
| 4 | 19.48 |
| 5 | 19.8 |
| 6 | 20.34 |
| 7 | 20.88 |
| 8 | 21.43 |
| 9 | 21.96 |
| 10 | 22.51 |
| 11 | 23.29 |
| 12 | 24.08 |
| 13 | 24.85 |
| 14 | 25.64 |
| 15 | 26.42 |
| 16 | 28.37 |
| 17 | 30.32 |
| 0 | 20.68 |
| 1 | 20.84 |
| 2 | 21.01 |
| 3 | 21.18 |
| 4 | 21.35 |
| 5 | 21.51 |
| 6 | 22.23 |
| 7 | 22.95 |
| 8 | 23.66 |
| 9 | 24.38 |
| 10 | 25.1 |
| 11 | 26.26 |
| 12 | 27.42 |
| 13 | 28.57 |
| 14 | 29.73 |
| 15 | 30.88 |
| 16 | 32.45 |
| 17 | 34.0 |

## FE Portfolio rates — 10-Pay band= sex=Male class=Nontobacco state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 25.49 |
| 19 | 25.94 |
| 20 | 26.39 |
| 21 | 28.07 |
| 22 | 29.75 |
| 23 | 31.43 |
| 24 | 33.11 |
| 25 | 34.79 |
| 26 | 35.58 |
| 27 | 36.36 |
| 28 | 37.16 |
| 29 | 37.95 |
| 30 | 38.74 |
| 31 | 39.5 |
| 32 | 40.27 |
| 33 | 41.03 |
| 34 | 41.8 |
| 35 | 42.57 |
| 36 | 43.21 |
| 37 | 43.85 |
| 38 | 44.51 |
| 39 | 45.15 |
| 40 | 45.79 |
| 41 | 48.52 |
| 42 | 51.25 |
| 43 | 53.98 |
| 44 | 56.72 |
| 45 | 59.44 |
| 46 | 61.38 |
| 47 | 63.32 |
| 48 | 65.25 |
| 49 | 67.19 |
| 50 | 69.13 |
| 51 | 71.1 |
| 52 | 73.07 |
| 53 | 75.03 |
| 54 | 77.0 |
| 55 | 78.97 |
| 56 | 80.23 |
| 57 | 81.48 |
| 58 | 82.74 |
| 59 | 84.0 |
| 60 | 85.26 |
| 61 | 88.15 |
| 62 | 91.04 |
| 63 | 93.93 |
| 64 | 96.82 |
| 65 | 99.71 |
| 66 | 103.48 |
| 67 | 107.26 |
| 68 | 111.03 |
| 69 | 114.82 |
| 70 | 118.59 |
| 71 | 122.83 |
| 72 | 127.08 |
| 73 | 131.33 |
| 74 | 135.57 |
| 75 | 139.81 |
| 76 | 148.7 |
| 77 | 157.58 |
| 78 | 166.47 |
| 79 | 175.35 |
| 80 | 184.24 |
| 81 | 195.31 |
| 82 | 206.39 |
| 83 | 217.46 |
| 84 | 238.06 |
| 85 | 249.59 |
| 18 | 26.57 |
| 19 | 27.0 |
| 20 | 27.32 |
| 21 | 29.18 |
| 22 | 31.05 |
| 23 | 32.91 |
| 24 | 34.77 |
| 25 | 36.63 |
| 26 | 37.38 |
| 27 | 38.12 |
| 28 | 38.87 |
| 29 | 39.61 |
| 30 | 40.36 |
| 31 | 41.2 |
| 32 | 42.05 |
| 33 | 42.89 |
| 34 | 43.74 |
| 35 | 44.58 |
| 36 | 45.41 |
| 37 | 46.23 |
| 38 | 47.06 |
| 39 | 47.88 |
| 40 | 48.71 |
| 41 | 52.14 |
| 42 | 55.56 |
| 43 | 58.98 |
| 44 | 62.4 |
| 45 | 65.83 |
| 46 | 68.16 |
| 47 | 70.49 |
| 48 | 72.84 |
| 49 | 75.17 |
| 50 | 77.5 |
| 51 | 79.96 |
| 52 | 82.42 |
| 53 | 84.87 |
| 54 | 87.33 |
| 55 | 89.79 |
| 56 | 92.29 |
| 57 | 94.79 |
| 58 | 97.3 |
| 59 | 99.79 |
| 60 | 102.3 |
| 61 | 106.54 |
| 62 | 110.78 |
| 63 | 115.04 |
| 64 | 119.28 |
| 65 | 123.52 |
| 66 | 128.53 |
| 67 | 133.54 |
| 68 | 138.55 |
| 69 | 143.55 |
| 70 | 148.56 |
| 71 | 154.51 |
| 72 | 160.46 |
| 73 | 166.41 |
| 74 | 172.36 |
| 75 | 178.31 |
| 76 | 189.09 |
| 77 | 199.87 |
| 78 | 210.66 |
| 79 | 221.44 |
| 80 | 232.22 |
| 81 | 248.25 |
| 82 | 275.27 |
| 83 | 291.96 |
| 84 | 308.64 |
| 85 | 325.33 |

## FE Portfolio rates — 10-Pay band= sex=Male class=Tobacco state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 32.28 |
| 19 | 34.22 |
| 20 | 36.17 |
| 21 | 37.21 |
| 22 | 38.25 |
| 23 | 39.29 |
| 24 | 40.33 |
| 25 | 41.37 |
| 26 | 42.78 |
| 27 | 44.19 |
| 28 | 45.61 |
| 29 | 47.02 |
| 30 | 48.43 |
| 31 | 49.45 |
| 32 | 50.47 |
| 33 | 51.49 |
| 34 | 52.51 |
| 35 | 53.53 |
| 36 | 54.76 |
| 37 | 55.99 |
| 38 | 57.23 |
| 39 | 58.45 |
| 40 | 59.68 |
| 41 | 62.99 |
| 42 | 66.28 |
| 43 | 69.58 |
| 44 | 72.87 |
| 45 | 76.18 |
| 46 | 78.11 |
| 47 | 80.04 |
| 48 | 81.96 |
| 49 | 83.89 |
| 50 | 85.82 |
| 51 | 88.17 |
| 52 | 90.51 |
| 53 | 92.84 |
| 54 | 95.18 |
| 55 | 97.53 |
| 56 | 98.47 |
| 57 | 99.41 |
| 58 | 100.36 |
| 59 | 101.3 |
| 60 | 102.24 |
| 61 | 105.66 |
| 62 | 109.08 |
| 63 | 112.48 |
| 64 | 115.9 |
| 65 | 119.32 |
| 66 | 124.18 |
| 67 | 129.02 |
| 68 | 133.88 |
| 69 | 138.73 |
| 70 | 143.59 |
| 71 | 149.51 |
| 72 | 155.42 |
| 73 | 161.35 |
| 74 | 174.23 |
| 75 | 180.4 |
| 76 | 194.63 |
| 77 | 208.85 |
| 78 | 223.08 |
| 79 | 237.3 |
| 80 | 251.53 |
| 81 | 272.29 |
| 82 | 293.04 |
| 83 | 313.8 |
| 84 | 334.55 |
| 85 | 355.31 |
| 18 | 35.57 |
| 19 | 37.12 |
| 20 | 38.69 |
| 21 | 40.0 |
| 22 | 41.32 |
| 23 | 42.64 |
| 24 | 43.96 |
| 25 | 45.27 |
| 26 | 46.93 |
| 27 | 48.6 |
| 28 | 50.25 |
| 29 | 51.91 |
| 30 | 53.57 |
| 31 | 54.46 |
| 32 | 55.35 |
| 33 | 56.26 |
| 34 | 57.15 |
| 35 | 58.04 |
| 36 | 59.46 |
| 37 | 60.88 |
| 38 | 62.3 |
| 39 | 63.72 |
| 40 | 65.15 |
| 41 | 69.75 |
| 42 | 74.37 |
| 43 | 78.98 |
| 44 | 83.6 |
| 45 | 88.2 |
| 46 | 90.75 |
| 47 | 93.29 |
| 48 | 95.84 |
| 49 | 98.38 |
| 50 | 100.92 |
| 51 | 104.14 |
| 52 | 107.36 |
| 53 | 110.57 |
| 54 | 113.79 |
| 55 | 117.0 |
| 56 | 118.92 |
| 57 | 120.85 |
| 58 | 122.77 |
| 59 | 124.7 |
| 60 | 126.62 |
| 61 | 132.21 |
| 62 | 137.8 |
| 63 | 143.39 |
| 64 | 148.97 |
| 65 | 154.56 |
| 66 | 161.47 |
| 67 | 168.39 |
| 68 | 175.31 |
| 69 | 182.23 |
| 70 | 197.02 |
| 71 | 206.23 |
| 72 | 215.44 |
| 73 | 224.64 |
| 74 | 233.85 |
| 75 | 243.06 |
| 76 | 262.13 |
| 77 | 281.21 |
| 78 | 300.28 |
| 79 | 319.36 |
| 80 | 338.43 |
| 81 | 370.59 |
| 82 | 402.74 |
| 83 | 434.9 |
| 84 | 467.05 |
| 85 | 499.21 |

## FE Portfolio rates — Easy band= sex=Female class=Uni-smoke state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 28.48 |
| 19 | 29.05 |
| 20 | 29.61 |
| 21 | 30.17 |
| 22 | 30.75 |
| 23 | 31.3 |
| 24 | 31.87 |
| 25 | 32.43 |
| 26 | 32.95 |
| 27 | 33.44 |
| 28 | 33.97 |
| 29 | 34.56 |
| 30 | 35.3 |
| 31 | 36.07 |
| 32 | 37.01 |
| 33 | 38.13 |
| 34 | 39.47 |
| 35 | 40.81 |
| 36 | 42.67 |
| 37 | 44.43 |
| 38 | 46.31 |
| 39 | 48.66 |
| 40 | 51.17 |
| 41 | 53.26 |
| 42 | 55.43 |
| 43 | 57.5 |
| 44 | 59.46 |
| 45 | 61.48 |
| 46 | 63.09 |
| 47 | 64.81 |
| 48 | 66.52 |
| 49 | 67.7 |
| 50 | 68.76 |
| 51 | 70.99 |
| 52 | 73.13 |
| 53 | 75.38 |
| 54 | 77.65 |
| 55 | 80.25 |
| 56 | 82.5 |
| 57 | 84.61 |
| 58 | 86.84 |
| 59 | 89.39 |
| 60 | 92.45 |
| 61 | 96.78 |
| 62 | 101.13 |
| 63 | 105.48 |
| 64 | 109.82 |
| 65 | 114.16 |
| 66 | 119.68 |
| 67 | 125.22 |
| 68 | 130.74 |
| 69 | 136.26 |
| 70 | 141.79 |
| 71 | 148.84 |
| 72 | 155.89 |
| 73 | 162.95 |
| 74 | 169.99 |
| 75 | 177.05 |
| 76 | 189.04 |
| 77 | 201.04 |
| 78 | 213.05 |
| 79 | 236.82 |
| 80 | 250.26 |

## FE Portfolio rates — Easy band= sex=Male class=Uni-smoke state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 37.74 |
| 19 | 38.29 |
| 20 | 38.83 |
| 21 | 39.38 |
| 22 | 39.93 |
| 23 | 40.48 |
| 24 | 41.04 |
| 25 | 41.59 |
| 26 | 42.19 |
| 27 | 42.85 |
| 28 | 43.5 |
| 29 | 44.06 |
| 30 | 44.52 |
| 31 | 44.63 |
| 32 | 44.74 |
| 33 | 44.86 |
| 34 | 45.01 |
| 35 | 45.33 |
| 36 | 47.79 |
| 37 | 49.91 |
| 38 | 52.36 |
| 39 | 55.44 |
| 40 | 59.04 |
| 41 | 61.48 |
| 42 | 64.26 |
| 43 | 66.94 |
| 44 | 69.51 |
| 45 | 72.13 |
| 46 | 74.58 |
| 47 | 77.17 |
| 48 | 79.84 |
| 49 | 81.94 |
| 50 | 83.93 |
| 51 | 87.47 |
| 52 | 90.91 |
| 53 | 94.45 |
| 54 | 98.02 |
| 55 | 102.11 |
| 56 | 105.45 |
| 57 | 108.54 |
| 58 | 111.73 |
| 59 | 115.47 |
| 60 | 120.1 |
| 61 | 126.98 |
| 62 | 133.86 |
| 63 | 140.71 |
| 64 | 147.59 |
| 65 | 154.47 |
| 66 | 161.38 |
| 67 | 168.3 |
| 68 | 175.2 |
| 69 | 182.11 |
| 70 | 201.71 |
| 71 | 214.4 |
| 72 | 227.1 |
| 73 | 239.78 |
| 74 | 252.49 |
| 75 | 265.18 |
| 76 | 285.79 |
| 77 | 311.96 |
| 78 | 341.84 |
| 79 | 363.37 |
| 80 | 384.91 |

## FE Portfolio rates — Immediate band= sex=Female class=Juvenile state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 0 | 11.86 |
| 1 | 11.94 |
| 2 | 12.04 |
| 3 | 12.12 |
| 4 | 12.24 |
| 5 | 12.33 |
| 6 | 12.51 |
| 7 | 12.69 |
| 8 | 12.89 |
| 9 | 13.08 |
| 10 | 13.26 |
| 11 | 13.51 |
| 12 | 13.52 |
| 13 | 13.74 |
| 14 | 14.0 |
| 15 | 14.24 |
| 16 | 14.28 |
| 17 | 14.33 |
| 0 | 12.88 |
| 1 | 12.91 |
| 2 | 12.96 |
| 3 | 12.98 |
| 4 | 13.01 |
| 5 | 13.06 |
| 6 | 13.3 |
| 7 | 13.55 |
| 8 | 13.8 |
| 9 | 14.04 |
| 10 | 14.28 |
| 11 | 14.59 |
| 12 | 14.64 |
| 13 | 14.92 |
| 14 | 15.23 |
| 15 | 15.52 |
| 16 | 15.63 |
| 17 | 15.68 |

## FE Portfolio rates — Immediate band= sex=Female class=Nontobacco state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 11.78 |
| 19 | 11.83 |
| 20 | 11.88 |
| 21 | 12.12 |
| 22 | 12.37 |
| 23 | 12.63 |
| 24 | 12.88 |
| 25 | 13.12 |
| 26 | 13.42 |
| 27 | 13.74 |
| 28 | 14.07 |
| 29 | 14.41 |
| 30 | 14.8 |
| 31 | 15.18 |
| 32 | 15.62 |
| 33 | 16.11 |
| 34 | 16.64 |
| 35 | 17.18 |
| 36 | 17.8 |
| 37 | 18.38 |
| 38 | 19.04 |
| 39 | 19.7 |
| 40 | 20.38 |
| 41 | 20.96 |
| 42 | 21.52 |
| 43 | 22.04 |
| 44 | 22.53 |
| 45 | 22.63 |
| 46 | 22.9 |
| 47 | 23.17 |
| 48 | 23.44 |
| 49 | 23.71 |
| 50 | 23.98 |
| 51 | 24.76 |
| 52 | 25.54 |
| 53 | 26.33 |
| 54 | 27.11 |
| 55 | 27.89 |
| 56 | 29.08 |
| 57 | 30.27 |
| 58 | 31.45 |
| 59 | 32.64 |
| 60 | 33.83 |
| 61 | 35.71 |
| 62 | 37.58 |
| 63 | 39.46 |
| 64 | 41.33 |
| 65 | 43.21 |
| 66 | 46.03 |
| 67 | 48.84 |
| 68 | 51.66 |
| 69 | 54.47 |
| 70 | 57.29 |
| 71 | 61.49 |
| 72 | 65.69 |
| 73 | 69.89 |
| 74 | 74.09 |
| 75 | 78.29 |
| 76 | 86.61 |
| 77 | 94.44 |
| 78 | 102.58 |
| 79 | 108.06 |
| 80 | 113.55 |
| 81 | 133.04 |
| 82 | 146.32 |
| 83 | 157.45 |
| 84 | 168.73 |
| 85 | 180.21 |
| 18 | 12.44 |
| 19 | 12.48 |
| 20 | 12.58 |
| 21 | 12.88 |
| 22 | 13.19 |
| 23 | 13.49 |
| 24 | 13.8 |
| 25 | 14.1 |
| 26 | 14.42 |
| 27 | 14.74 |
| 28 | 15.09 |
| 29 | 15.47 |
| 30 | 15.93 |
| 31 | 16.42 |
| 32 | 16.97 |
| 33 | 17.59 |
| 34 | 18.28 |
| 35 | 19.01 |
| 36 | 19.76 |
| 37 | 20.52 |
| 38 | 21.33 |
| 39 | 22.18 |
| 40 | 23.06 |
| 41 | 23.87 |
| 42 | 24.7 |
| 43 | 25.58 |
| 44 | 26.47 |
| 45 | 26.72 |
| 46 | 26.97 |
| 47 | 27.22 |
| 48 | 27.48 |
| 49 | 27.73 |
| 50 | 27.98 |
| 51 | 29.48 |
| 52 | 30.98 |
| 53 | 32.49 |
| 54 | 33.98 |
| 55 | 35.48 |
| 56 | 36.71 |
| 57 | 37.94 |
| 58 | 39.18 |
| 59 | 40.41 |
| 60 | 41.64 |
| 61 | 43.83 |
| 62 | 46.03 |
| 63 | 48.23 |
| 64 | 50.43 |
| 65 | 53.18 |
| 66 | 57.91 |
| 67 | 62.64 |
| 68 | 67.36 |
| 69 | 72.09 |
| 70 | 76.82 |
| 71 | 82.42 |
| 72 | 88.01 |
| 73 | 93.61 |
| 74 | 99.21 |
| 75 | 104.8 |
| 76 | 116.06 |
| 77 | 126.73 |
| 78 | 137.8 |
| 79 | 145.48 |
| 80 | 153.15 |
| 81 | 174.37 |
| 82 | 188.19 |
| 83 | 202.21 |
| 84 | 216.49 |
| 85 | 230.97 |

## FE Portfolio rates — Immediate band= sex=Female class=Tobacco state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 14.85 |
| 19 | 14.85 |
| 20 | 14.96 |
| 21 | 15.32 |
| 22 | 15.68 |
| 23 | 16.03 |
| 24 | 16.38 |
| 25 | 16.74 |
| 26 | 17.16 |
| 27 | 17.61 |
| 28 | 18.08 |
| 29 | 18.59 |
| 30 | 19.14 |
| 31 | 19.71 |
| 32 | 20.35 |
| 33 | 21.06 |
| 34 | 21.85 |
| 35 | 22.65 |
| 36 | 23.42 |
| 37 | 24.17 |
| 38 | 24.97 |
| 39 | 25.79 |
| 40 | 26.62 |
| 41 | 27.85 |
| 42 | 29.11 |
| 43 | 30.33 |
| 44 | 31.54 |
| 45 | 32.86 |
| 46 | 33.28 |
| 47 | 33.87 |
| 48 | 34.47 |
| 49 | 35.19 |
| 50 | 35.77 |
| 51 | 37.58 |
| 52 | 39.28 |
| 53 | 41.07 |
| 54 | 42.89 |
| 55 | 43.82 |
| 56 | 45.38 |
| 57 | 46.77 |
| 58 | 48.18 |
| 59 | 49.8 |
| 60 | 51.76 |
| 61 | 54.61 |
| 62 | 57.47 |
| 63 | 60.31 |
| 64 | 63.16 |
| 65 | 66.01 |
| 66 | 70.44 |
| 67 | 74.87 |
| 68 | 79.3 |
| 69 | 83.73 |
| 70 | 88.16 |
| 71 | 94.48 |
| 72 | 100.82 |
| 73 | 107.15 |
| 74 | 113.48 |
| 75 | 119.81 |
| 76 | 133.04 |
| 77 | 145.6 |
| 78 | 158.65 |
| 79 | 167.8 |
| 80 | 176.95 |
| 81 | 187.8 |
| 82 | 201.89 |
| 83 | 215.96 |
| 84 | 232.18 |
| 85 | 248.65 |
| 18 | 16.29 |
| 19 | 16.32 |
| 20 | 16.45 |
| 21 | 16.85 |
| 22 | 17.22 |
| 23 | 17.62 |
| 24 | 18.0 |
| 25 | 18.37 |
| 26 | 18.86 |
| 27 | 19.37 |
| 28 | 19.93 |
| 29 | 20.53 |
| 30 | 21.24 |
| 31 | 21.96 |
| 32 | 22.77 |
| 33 | 23.69 |
| 34 | 24.72 |
| 35 | 25.79 |
| 36 | 26.89 |
| 37 | 27.98 |
| 38 | 29.14 |
| 39 | 30.33 |
| 40 | 31.55 |
| 41 | 33.21 |
| 42 | 34.88 |
| 43 | 36.49 |
| 44 | 38.05 |
| 45 | 40.11 |
| 46 | 41.22 |
| 47 | 42.58 |
| 48 | 44.04 |
| 49 | 45.7 |
| 50 | 47.16 |
| 51 | 50.0 |
| 52 | 52.65 |
| 53 | 55.44 |
| 54 | 58.24 |
| 55 | 59.85 |
| 56 | 62.19 |
| 57 | 64.28 |
| 58 | 66.36 |
| 59 | 68.67 |
| 60 | 71.44 |
| 61 | 75.27 |
| 62 | 79.1 |
| 63 | 82.95 |
| 64 | 86.78 |
| 65 | 90.61 |
| 66 | 96.72 |
| 67 | 102.81 |
| 68 | 108.9 |
| 69 | 114.99 |
| 70 | 121.08 |
| 71 | 130.21 |
| 72 | 139.36 |
| 73 | 148.48 |
| 74 | 157.63 |
| 75 | 166.76 |
| 76 | 179.0 |
| 77 | 194.73 |
| 78 | 212.75 |
| 79 | 225.54 |
| 80 | 238.34 |
| 81 | 252.95 |
| 82 | 271.9 |
| 83 | 290.83 |
| 84 | 308.2 |
| 85 | 325.58 |

## FE Portfolio rates — Immediate band= sex=Male class=Juvenile state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 0 | 13.68 |
| 1 | 13.79 |
| 2 | 13.89 |
| 3 | 14.01 |
| 4 | 14.12 |
| 5 | 14.22 |
| 6 | 14.52 |
| 7 | 14.82 |
| 8 | 15.14 |
| 9 | 15.44 |
| 10 | 15.74 |
| 11 | 16.17 |
| 12 | 16.63 |
| 13 | 17.05 |
| 14 | 17.5 |
| 15 | 17.93 |
| 16 | 18.12 |
| 17 | 18.2 |
| 0 | 15.69 |
| 1 | 15.7 |
| 2 | 15.72 |
| 3 | 15.74 |
| 4 | 15.75 |
| 5 | 15.77 |
| 6 | 16.22 |
| 7 | 16.68 |
| 8 | 17.14 |
| 9 | 17.59 |
| 10 | 18.05 |
| 11 | 18.87 |
| 12 | 19.69 |
| 13 | 20.49 |
| 14 | 21.3 |
| 15 | 22.12 |
| 16 | 22.43 |
| 17 | 22.52 |

## FE Portfolio rates — Immediate band= sex=Male class=Nontobacco state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 14.54 |
| 19 | 14.59 |
| 20 | 14.7 |
| 21 | 14.96 |
| 22 | 15.21 |
| 23 | 15.47 |
| 24 | 15.72 |
| 25 | 15.97 |
| 26 | 16.29 |
| 27 | 16.67 |
| 28 | 17.03 |
| 29 | 17.45 |
| 30 | 17.9 |
| 31 | 18.33 |
| 32 | 18.82 |
| 33 | 19.37 |
| 34 | 20.0 |
| 35 | 20.63 |
| 36 | 21.39 |
| 37 | 22.14 |
| 38 | 22.94 |
| 39 | 23.8 |
| 40 | 24.71 |
| 41 | 25.44 |
| 42 | 26.21 |
| 43 | 26.95 |
| 44 | 27.69 |
| 45 | 27.97 |
| 46 | 28.64 |
| 47 | 29.31 |
| 48 | 29.98 |
| 49 | 30.65 |
| 50 | 31.32 |
| 51 | 32.53 |
| 52 | 33.74 |
| 53 | 34.96 |
| 54 | 36.17 |
| 55 | 37.38 |
| 56 | 39.18 |
| 57 | 40.98 |
| 58 | 42.77 |
| 59 | 44.57 |
| 60 | 46.37 |
| 61 | 49.3 |
| 62 | 52.23 |
| 63 | 55.16 |
| 64 | 58.09 |
| 65 | 58.56 |
| 66 | 62.24 |
| 67 | 65.91 |
| 68 | 69.59 |
| 69 | 73.26 |
| 70 | 76.94 |
| 71 | 83.34 |
| 72 | 89.74 |
| 73 | 96.14 |
| 74 | 102.54 |
| 75 | 108.94 |
| 76 | 119.82 |
| 77 | 129.99 |
| 78 | 140.53 |
| 79 | 147.44 |
| 80 | 154.34 |
| 81 | 180.77 |
| 82 | 198.75 |
| 83 | 213.76 |
| 84 | 229.05 |
| 85 | 244.57 |
| 18 | 17.03 |
| 19 | 17.05 |
| 20 | 17.07 |
| 21 | 17.26 |
| 22 | 17.46 |
| 23 | 17.64 |
| 24 | 17.86 |
| 25 | 18.04 |
| 26 | 18.35 |
| 27 | 18.68 |
| 28 | 19.06 |
| 29 | 19.49 |
| 30 | 19.96 |
| 31 | 20.42 |
| 32 | 20.99 |
| 33 | 21.63 |
| 34 | 22.37 |
| 35 | 23.14 |
| 36 | 24.06 |
| 37 | 25.0 |
| 38 | 26.02 |
| 39 | 27.11 |
| 40 | 28.29 |
| 41 | 29.3 |
| 42 | 30.36 |
| 43 | 31.4 |
| 44 | 32.46 |
| 45 | 33.35 |
| 46 | 33.9 |
| 47 | 34.45 |
| 48 | 35.0 |
| 49 | 35.55 |
| 50 | 36.1 |
| 51 | 38.17 |
| 52 | 40.24 |
| 53 | 41.9 |
| 54 | 43.5 |
| 55 | 45.07 |
| 56 | 46.72 |
| 57 | 48.85 |
| 58 | 50.98 |
| 59 | 53.11 |
| 60 | 55.23 |
| 61 | 58.79 |
| 62 | 62.35 |
| 63 | 65.91 |
| 64 | 69.48 |
| 65 | 73.04 |
| 66 | 81.28 |
| 67 | 89.54 |
| 68 | 97.79 |
| 69 | 106.04 |
| 70 | 114.29 |
| 71 | 121.99 |
| 72 | 129.69 |
| 73 | 137.38 |
| 74 | 145.08 |
| 75 | 152.78 |
| 76 | 168.04 |
| 77 | 182.36 |
| 78 | 197.22 |
| 79 | 207.18 |
| 80 | 217.13 |
| 81 | 247.61 |
| 82 | 267.54 |
| 83 | 287.83 |
| 84 | 308.43 |
| 85 | 322.08 |

## FE Portfolio rates — Immediate band= sex=Male class=Tobacco state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 21.62 |
| 19 | 21.68 |
| 20 | 21.84 |
| 21 | 22.2 |
| 22 | 22.56 |
| 23 | 22.92 |
| 24 | 23.3 |
| 25 | 23.66 |
| 26 | 24.16 |
| 27 | 24.72 |
| 28 | 25.31 |
| 29 | 25.97 |
| 30 | 26.69 |
| 31 | 27.37 |
| 32 | 28.18 |
| 33 | 29.06 |
| 34 | 30.04 |
| 35 | 31.07 |
| 36 | 32.18 |
| 37 | 33.3 |
| 38 | 34.51 |
| 39 | 35.78 |
| 40 | 37.14 |
| 41 | 38.04 |
| 42 | 38.43 |
| 43 | 38.81 |
| 44 | 38.94 |
| 45 | 39.89 |
| 46 | 40.45 |
| 47 | 42.33 |
| 48 | 43.14 |
| 49 | 44.09 |
| 50 | 44.93 |
| 51 | 46.98 |
| 52 | 48.94 |
| 53 | 51.01 |
| 54 | 53.09 |
| 55 | 55.49 |
| 56 | 58.21 |
| 57 | 60.84 |
| 58 | 63.59 |
| 59 | 66.69 |
| 60 | 70.35 |
| 61 | 75.41 |
| 62 | 80.49 |
| 63 | 85.54 |
| 64 | 90.6 |
| 65 | 95.67 |
| 66 | 102.68 |
| 67 | 109.7 |
| 68 | 116.73 |
| 69 | 123.74 |
| 70 | 130.76 |
| 71 | 140.07 |
| 72 | 149.39 |
| 73 | 158.68 |
| 74 | 167.99 |
| 75 | 177.29 |
| 76 | 192.68 |
| 77 | 206.76 |
| 78 | 220.85 |
| 79 | 234.93 |
| 80 | 249.01 |
| 81 | 269.57 |
| 82 | 290.11 |
| 83 | 310.66 |
| 84 | 331.2 |
| 85 | 351.76 |
| 18 | 26.72 |
| 19 | 26.76 |
| 20 | 26.78 |
| 21 | 27.03 |
| 22 | 27.29 |
| 23 | 27.54 |
| 24 | 27.81 |
| 25 | 28.06 |
| 26 | 28.51 |
| 27 | 29.04 |
| 28 | 29.64 |
| 29 | 30.31 |
| 30 | 31.08 |
| 31 | 31.86 |
| 32 | 32.8 |
| 33 | 33.86 |
| 34 | 35.1 |
| 35 | 36.38 |
| 36 | 37.83 |
| 37 | 39.32 |
| 38 | 40.94 |
| 39 | 42.67 |
| 40 | 44.55 |
| 41 | 45.87 |
| 42 | 47.26 |
| 43 | 48.65 |
| 44 | 50.02 |
| 45 | 51.69 |
| 46 | 52.84 |
| 47 | 54.23 |
| 48 | 55.77 |
| 49 | 57.5 |
| 50 | 59.1 |
| 51 | 62.98 |
| 52 | 66.78 |
| 53 | 70.83 |
| 54 | 75.0 |
| 55 | 78.3 |
| 56 | 82.66 |
| 57 | 86.9 |
| 58 | 91.33 |
| 59 | 96.25 |
| 60 | 101.95 |
| 61 | 109.62 |
| 62 | 117.29 |
| 63 | 124.95 |
| 64 | 132.61 |
| 65 | 140.28 |
| 66 | 150.64 |
| 67 | 161.01 |
| 68 | 171.38 |
| 69 | 181.75 |
| 70 | 192.11 |
| 71 | 204.19 |
| 72 | 213.29 |
| 73 | 222.39 |
| 74 | 231.51 |
| 75 | 240.63 |
| 76 | 259.51 |
| 77 | 278.4 |
| 78 | 297.28 |
| 79 | 316.17 |
| 80 | 335.05 |
| 81 | 366.88 |
| 82 | 398.71 |
| 83 | 430.55 |
| 84 | 462.38 |
| 85 | 494.22 |

## FE Portfolio rates — Immediate band= sex=Unisex class=N/A state=ALL
| age | rate_per_thousand_annual |
|-----|--------------------------|
| 18 | 2.2 |
| 19 | 2.21 |
| 20 | 2.22 |
| 21 | 2.23 |
| 22 | 2.24 |
| 23 | 2.26 |
| 24 | 2.27 |
| 25 | 2.28 |
| 26 | 2.29 |
| 27 | 2.3 |
| 28 | 2.31 |
| 29 | 2.32 |
| 30 | 2.33 |
| 31 | 2.34 |
| 32 | 2.35 |
| 33 | 2.37 |
| 34 | 2.38 |
| 35 | 2.39 |
| 36 | 2.41 |
| 37 | 2.43 |
| 38 | 2.45 |
| 39 | 2.48 |
| 40 | 2.5 |
| 41 | 2.52 |
| 42 | 2.54 |
| 43 | 2.56 |
| 44 | 2.59 |
| 45 | 2.61 |
| 46 | 2.63 |
| 47 | 2.65 |
| 48 | 2.67 |
| 49 | 2.71 |
| 50 | 2.73 |
| 51 | 2.76 |
| 52 | 2.79 |
| 53 | 2.84 |
| 54 | 2.89 |
| 55 | 2.95 |
| 56 | 3.01 |
| 57 | 3.08 |
| 58 | 3.16 |
| 59 | 3.25 |
| 60 | 3.33 |
| 61 | 3.44 |
| 62 | 3.56 |
| 63 | 3.71 |
| 64 | 3.86 |
| 65 | 4.03 |
| 66 | 4.24 |
| 67 | 4.49 |
| 68 | 4.79 |
| 69 | 5.09 |
| 70 | 5.46 |
