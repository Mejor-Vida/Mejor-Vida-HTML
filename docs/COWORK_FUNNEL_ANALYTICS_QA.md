# Cowork brief: Landing page → CRM Funnel Analytics QA

## Paste this block first (instructions for the agent)

You are QA-testing **Mejor Vida Insurance** first-party funnel tracking. Your job is to walk through the **Facebook landing page** in a real browser, then verify what appears in the **Staff CRM Funnel Analytics** dashboard. Report every mismatch so the coding agent can fix tracking or labels.

**Do not** POST fake events to `/api/funnel-event`. Only real browser interactions count.

**Do not** read or paste secrets (`.env.local`, passwords) in your report.

---

## Goal

Confirm that each landing-page step fires a `funnel_events` row and shows up correctly on the **LP Facebook** tab with the right **stage name**, **count**, and **session continuity** (one user = one session through the path).

---

## URLs

| What | Production | Local (if dev server running) |
|------|------------|-------------------------------|
| Landing (Facebook attribution) | `https://mejorvidainsurance.com/gastos-finales-ads-v2/?fbclid=cowork_qa_001&utm_source=facebook&utm_campaign=cowork_funnel_qa&utm_content=FE+Video+ad+-+Copy` | `http://localhost:3000/gastos-finales-ads-v2/?fbclid=cowork_qa_001&utm_source=facebook&utm_campaign=cowork_funnel_qa&utm_content=FE+Video+ad+-+Copy` |
| CRM Funnel Analytics | `https://mejorvidainsurance.com/staff/crm.html#/ga4` | `http://localhost:3000/staff/crm.html#/ga4` |

Use **production** unless the user tells you to test locally.

---

## Before you start

1. **Sign in** to Staff CRM when prompted (user provides credentials in the browser — do not log passwords in the report).
2. Open a **fresh incognito/private window** for the landing test (clean `sessionStorage`).
3. Open **DevTools → Network**, filter `funnel-event`. Every tracked step should produce `POST /api/funnel-event` with `{ "ok": true }`.
4. Note **start time in America/Chicago** (e.g. `2026-07-02 3:45 PM CT`) — the CRM date pickers use Central calendar days.
5. In CRM, set **From** and **To** to **today**, select tab **LP Facebook**, then refresh after each major step (or at the end).

---

## Test A — Get Quote path (primary)

Walk through in order. After each row, check Network for `funnel-event` and note the payload fields `tool`, `step_name`, `event_type`, `source`.

| # | User action on landing page | Expected POST payload | Expected CRM column / label |
|---|----------------------------|------------------------|----------------------------|
| A1 | Land on page (objective picker visible) | `tool=quote`, `step_name=landing`, `event_type=step_view`, `source=facebook` | **Get Quote** → **Landing Page View** count +1 |
| A2 | Click **Get Quote** objective card | `step_name=get_quote_click`, `event_type=click` | **Get Quote** → **Get Quote Click** +1 |
| A3 | Select **State** (e.g. Nebraska) and continue | `step_name=state`, `event_type=step_view` | **Get Quote** → **Step 1 — State** +1 |
| A4 | Select **Sex** | `step_name=sex`, `event_type=step_view` | **Step 2 — Sex** +1 |
| A5 | Enter **Date of birth** | `step_name=date_of_birth`, `event_type=step_view` | **Step 3 — Date of Birth** +1 |
| A6 | **Tobacco** answer | `step_name=tobacco`, `event_type=step_view` | **Step 4 — Tobacco** +1 |
| A7 | **Name** step | `step_name=name`, `event_type=step_view` | **Step 5 — Name** +1 |
| A8 | **Email** step (qualify_lead may fire here) | `step_name=email`, `event_type=step_view`; optional conversion `qualify_lead` / `lead_submitted` mapping | **Step 6 — Email** +1 |
| A9 | **Phone** step | `step_name=phone`, `event_type=step_view` | **Step 7 — Phone** +1 |
| A10 | Complete quote → **results** | `step_name=quote_result`, `event_type=step_view` | **Quote Result** +1 |
| A11 | Submit lead (if reachable without real PII, use obvious test data; stop before live SMS if unsure) | `step_name=lead_submitted`, `event_type=conversion` | **Lead Submitted** +1 |

**Session rule:** A1–A11 should share the **same `session_id`** in every POST body. Flag if the ID changes mid-flow.

**Drop-off rule:** If you completed step N but step N+1 shows 0 while your session clearly reached it, flag **tracking gap**. If you intentionally stopped early, **Dropped** on the next step should equal 1 (not a bogus number on branches you never entered).

---

## Test B — Other landing branches (shorter)

Use a **new incognito window** with the same Facebook URL query string.

| # | Action | Expected CRM branch / step |
|---|--------|----------------------------|
| B1 | Click **Calculator** objective | **FE Calculator** → **Calculator Click** +1, then calc steps |
| B2 | Walk calc steps through **Results Viewed** | `calc_state`, `calc_ceremony`, `calc_funeral_costs`, `calc_household`, `calc_results` |
| B3 | Click **Schedule** objective | **Schedule Call** → **Schedule Click** +1 |
| B4 | Open schedule modal | **Calendar Opened** +1 |
| B5 | Click **WhatsApp** (if shown) | **WhatsApp** → **WhatsApp Click** +1 |
| B6 | Click **agent/bio card** (if shown) | **Bio Page** → **Bio Page Click** +1 |

---

## Test C — CRM dashboard UX

| Check | Pass criteria |
|-------|---------------|
| Tab **LP Facebook** | Shows your session(s); **Entry context** shows Facebook 100% |
| Tab **LP Google ads** | Empty unless you retest with `?gclid=cowork_qa_002&utm_source=google` |
| **Top ads by clicks** | `utm_content` value appears (e.g. `FE Video ad - Copy`) if ad_name is populated |
| **Date range** | Today’s test events visible without shifting To to tomorrow |
| **Click a funnel node** | Detail panel opens with user count, source, device |
| **Other branches at 0 entry** | No red **Dropped** counts on calculator/schedule/bio when entry is 0 |

---

## Known mapping (tracker → dashboard)

Landing flow `stepNameMap` (in `landing-flow.js`) → funnel tracker (`mvi-funnel-track.js`) → CRM labels (`funnel-analytics-config.js`):

| Landing `step_name` (GA4) | Stored `step_name` | CRM label |
|---------------------------|-------------------|-----------|
| `objective_picker` | `landing` | Landing Page View |
| (objective_selected quote) | `get_quote_click` | Get Quote Click |
| `state` | `state` | Step 1 — State |
| `sex` | `sex` | Step 2 — Sex |
| `date_of_birth` | `date_of_birth` | Step 3 — Date of Birth |
| `tobacco` | `tobacco` | Step 4 — Tobacco |
| `name` | `name` | Step 5 — Name |
| `email` | `email` | Step 6 — Email |
| `phone` | `phone` | Step 7 — Phone |
| `results` | `quote_result` | Quote Result |
| `quote_submitted` / `qualify_lead` | `lead_submitted` | Lead Submitted |

---

## What to flag as issues

- **No POST** after a visible step change
- **POST returns non-200** or `{ "ok": false }`
- **`source` not `facebook`** when using `fbclid` URL
- **`session_id` changes** mid-flow
- **Wrong `step_name`** in POST vs table above
- **CRM label wrong** or step missing from funnel column
- **Count stuck at 0** while POST succeeded
- **Counts from different sessions merged** as one path (entry 1 but click from another session)
- **Misleading drop-off** on branches with 0 entry
- **Date range excludes today’s events** (timezone bug)

---

## Required deliverable — report back to the coding agent

Copy this template and fill it in:

```
# Funnel Analytics QA Report

**Environment:** production | localhost
**Test window (Central):** YYYY-MM-DD HH:MM – HH:MM CT
**Tester:** Cowork browser session
**Landing URL used:** (full URL with query string)

## Summary
- Tests completed: A (full/partial), B (which branches)
- Overall: PASS | FAIL | PARTIAL
- One-line summary:

## Results matrix

| Step | Action taken | POST fired? | step_name in payload | CRM step visible? | Count correct? | Notes |
|------|--------------|-------------|----------------------|-------------------|----------------|-------|
| A1   |              | Y/N         |                      | Y/N               | Y/N            |       |
| A2   |              |             |                      |                   |                |       |
| …    |              |             |                      |                   |                |       |

## Session integrity
- session_id at start:
- session_id at end:
- Changed mid-flow: Y/N

## Dashboard issues
- (bullets)

## Network / console errors
- (paste status codes, error messages — no secrets)

## Screenshots
- Landing step (filename or description)
- CRM funnel after test (filename or description)
- DevTools funnel-event payload example

## Recommended fixes for coding agent
1. (specific file/behavior if known)
2. …
```

---

## Reference (for coding agent, not required for Cowork)

- Tracker: `js/mvi-funnel-track.js`
- Landing wiring: `gastos-finales-ads-v2/js/landing-flow.js` → `trackGaEvent()`
- Ingest: `POST /api/funnel-event`
- Dashboard API: `GET /api/staff/funnel-analytics?view=facebook&date_from=…&date_to=…`
- Step definitions: `lib/funnel-analytics-config.js`
- CRM UI: `js/staff-crm-funnel-dashboard.js`

---

**Repo copy of this brief:** `docs/COWORK_FUNNEL_ANALYTICS_QA.md`
