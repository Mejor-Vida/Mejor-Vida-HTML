# FEX Quotes → Supabase → HubSpot

## Limitation (iframe)

The FEX embed runs on **`fexquotes.com`**. The parent page **cannot** read quote results or form fields inside the iframe (browser same-origin policy). There is **no** automatic “pipe FEX results into Supabase” unless FEX gives you a **server-side API or webhook** that your backend calls.

## What we implemented

1. **`POST /api/quote-lead-sync`** (Vercel serverless) — Inserts a row into **`quote_lead_submissions`**, then creates or updates a **HubSpot contact** (by email).
2. **`quote.html`** — A **follow-up form** after the iframe so visitors can submit name, email, phone, optional state, optional **pasted quote notes** (from what they saw in FEX), and consent.

Full quote text lives in **`quote_summary`** in Supabase when they paste it. HubSpot gets **standard contact fields** (name, email, phone); the detailed notes remain in Supabase unless you add HubSpot custom properties later.

## Vercel environment variables

Add these in the Vercel project (**Settings → Environment Variables**):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | `https://<project>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase **Settings → API** (service role — **never** put this in static HTML or the browser) |
| `HUBSPOT_ACCESS_TOKEN` | HubSpot private app token (contacts scope) |

Local `.env.local` can mirror these for testing with `vercel dev` if you use it.

## Future: automatic FEX data

If FEX exposes **webhooks** or a **leads API**, add a separate route (e.g. `/api/webhooks/fex`) that validates a secret and maps payloads into `quote_lead_submissions` + HubSpot—the table and CRM fields are already aligned for that pattern.
