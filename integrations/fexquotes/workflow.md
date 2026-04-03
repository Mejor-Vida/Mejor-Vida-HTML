# FEX Quotes → Supabase → HubSpot (planned)

This iframe does **not** POST to our backend. To mirror leads into Supabase and HubSpot:

1. Confirm with FEX how leads are exposed (**API**, **webhook**, or **export**).
2. Map fields to `quote_lead_submissions` (`integrations/supabase/migrations/002_quote_lead_submissions.sql` and `003_*`).
3. Implement a server-side sync (e.g. Vercel serverless + HubSpot API) using env vars—never service keys in static HTML.

**Status:** Not wired yet; embed-only on `quote.html`.
