# FEX email webhook — setup checklist

Use this after `005_fex_email_quotes.sql` is applied (see `integrations/supabase/apply_migrations.py`).

## Done in repo / by agent

- [x] Migration **`fex_email_quotes`** table (file: `integrations/supabase/migrations/005_fex_email_quotes.sql`)
- [x] API route **`/api/fex-email-quote-webhook`**
- [x] Docs: `integrations/MAKE_COM_FEX_EMAIL_QUOTES.md`

## You complete (dashboards only)

### 1. Vercel → Environment Variables

Add to the **production** project (same vars as `quote-lead-sync` where applicable):

| Variable | Value |
|----------|--------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `HUBSPOT_ACCESS_TOKEN` | Private app token |
| `FEX_EMAIL_WEBHOOK_SECRET` | Run locally: `openssl rand -hex 32` — paste once; copy the same value into Make |
| `HUBSPOT_FEX_PIPELINE_ID` | *(optional)* Deals → Pipelines → open pipeline → ID from URL or API |
| `HUBSPOT_FEX_DEAL_STAGE_ID` | *(optional)* Stage internal ID — without both, contacts still sync; deals are skipped |

Redeploy after saving env vars.

### 2. HubSpot → Private app

- Scopes: **crm.objects.contacts.read/write**, **crm.objects.deals.read/write**
- Copy token into `HUBSPOT_ACCESS_TOKEN` on Vercel

### 3. Make.com

1. New scenario: **Gmail** (or mailbox that receives `quotes@` forwards) → **Watch emails** with a filter.
2. **HTTP** → **Make a request**:
   - URL: `https://www.mejorvidainsurance.com/api/fex-email-quote-webhook`
   - Method: `POST`
   - Header: `Authorization: Bearer <same secret as FEX_EMAIL_WEBHOOK_SECRET>`
   - Header: `Content-Type: application/json`
   - Body: map fields into the JSON shape in `MAKE_COM_FEX_EMAIL_QUOTES.md`
3. Add **Text parser** / **regex** only after you paste **one real FEX email** into a note and match its layout.

### 4. Test

```bash
curl -sS -X POST "https://www.mejorvidainsurance.com/api/fex-email-quote-webhook" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{"senderEmail":"test@example.com","senderName":"Test User","parsed":{"firstName":"Test","lastName":"User","state":"NE"}}'
```

Expect `{"ok":true,"id":"..."}`. Check Supabase **`fex_email_quotes`** and HubSpot contact.
