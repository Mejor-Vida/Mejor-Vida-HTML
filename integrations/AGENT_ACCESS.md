# Agent Access — Mejor Vida Data Sources

How the MVS Agent (or any automation) can access your data. **Google Sheets is not wired in this repo** — use HubSpot, Supabase, Make, or ManyChat instead.

---

## 1. Leads and CRM

| Source | How to access |
|--------|----------------|
| **HubSpot** | REST API — `HUBSPOT_ACCESS_TOKEN` in `.env.local`. See `integrations/hubspot/setup_hubspot_fe.py` for bootstrap patterns. |
| **Supabase** | Website quote follow-up and FEX email pipeline — REST from Vercel (`api/quote-lead-sync.js`, `api/fex-email-quote-webhook.js`) or Postgres via `integrations/supabase/` migrations. |
| **Make.com** | REST API — `MAKE_API_TOKEN`, `MAKE_ORG_ID` in `.env.local`. |

---

## 2. Make.com

- **API:** Make has a REST API. Use `MAKE_API_TOKEN` and `MAKE_ORG_ID` from `.env.local`.
- **Agent access:** If the agent can call HTTP APIs, it can trigger scenarios or fetch data from Make.

---

## 3. ManyChat

- **API:** ManyChat REST API. Use `MANYCHAT_API_KEY` from `.env.local`.
- **Agent access:** Same as Make — agent calls ManyChat API for contacts, flows, etc.

---

## 4. HubSpot

- **API:** HubSpot REST API (Private App). Use `HUBSPOT_ACCESS_TOKEN` from `.env.local`. Scopes must match what you enable on the private app (contacts, deals, conversations, forms, etc.).
- **Agent access:** HTTP requests to `https://api.hubapi.com/...` from scripts or terminal; see `integrations/hubspot/setup_hubspot_fe.py` for CRM bootstrap.

---

## Summary for MVS Agent

| Data source | How agent accesses it |
|-------------|------------------------|
| HubSpot | `HUBSPOT_ACCESS_TOKEN` + REST API |
| Supabase | Vercel serverless routes or direct Postgres (migrations in `integrations/supabase/`) |
| Make.com | `MAKE_API_TOKEN` + HTTP API |
| ManyChat | `MANYCHAT_API_KEY` + HTTP API |

**Note:** The agent's browser cannot see your Chrome tabs. Use the API/script methods above.

---

## Browser Workflow (Playwright + Screenshots)

When the agent has Playwright and screenshot capability, see **`BROWSER_WORKFLOW.md`** for:
- Tool selection (API vs browser)
- Screenshot → Analyze → Act loop
- Failure handling and escalation
