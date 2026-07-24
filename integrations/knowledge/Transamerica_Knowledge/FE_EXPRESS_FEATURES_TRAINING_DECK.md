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
