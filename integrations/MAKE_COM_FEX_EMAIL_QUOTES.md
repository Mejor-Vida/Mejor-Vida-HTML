# FEX quote emails → Supabase + HubSpot (Make.com / webhook)

This flow ingests **FEX notification emails** sent to `quotes@mejorvidainsurance.com`, parses them, and sends structured JSON to **`POST /api/fex-email-quote-webhook`** on your Vercel site.

## Architecture

1. **Google Workspace / Gmail** — Something must deliver messages to a mailbox Make can read. Typical setups:
   - **Group forwards to a real inbox** (e.g. `quotes@` → `julie@mejorvidainsurance.com`), then connect **Gmail** in Make to that inbox with a filter `to:quotes@mejorvidainsurance.com` **or** `from` FEX / subject contains “quote”.
   - **Google Workspace routing** — Route inbound mail for `quotes@` to a user mailbox; use that mailbox in Make.
2. **Make.com** — Trigger on new email → parse fields → **HTTP** module `POST` JSON to your webhook.
3. **Vercel** — `api/fex-email-quote-webhook.js` validates a shared secret, inserts **`fex_email_quotes`** in Supabase, upserts **HubSpot contact**, optionally creates a **deal** (if pipeline/stage env vars are set).

**Zapier:** Same idea: Email Received by Zapier Email Parser (or Gmail) → Webhooks by Zapier → POST to the same URL and body shape.

---

## 1. Supabase: apply migration

Run the SQL in **`integrations/supabase/migrations/005_fex_email_quotes.sql`** in the Supabase SQL editor (or your migration runner). This creates table **`fex_email_quotes`**.

If you prefer a view named `quotes`, you can add:

```sql
CREATE VIEW quotes AS SELECT * FROM fex_email_quotes;
```

(Service role used by the API bypasses RLS; add policies if you expose this table to the browser, which you should not.)

---

## 2. Vercel environment variables

Add these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | Yes | Same as existing site |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Same as existing site |
| `HUBSPOT_ACCESS_TOKEN` | Yes for CRM | Private app token with **contacts** and **deals** scopes |
| `FEX_EMAIL_WEBHOOK_SECRET` | Yes | Long random string; Make sends it as `Authorization: Bearer …` or header `X-Webhook-Secret` |
| `HUBSPOT_FEX_PIPELINE_ID` | No | Deal pipeline internal ID (HubSpot **Settings → Objects → Deals → Pipelines**) |
| `HUBSPOT_FEX_DEAL_STAGE_ID` | No | Stage internal ID in that pipeline |

If **`HUBSPOT_FEX_PIPELINE_ID`** or **`HUBSPOT_FEX_DEAL_STAGE_ID`** is missing, the webhook still **creates/updates the contact** and stores the row in Supabase, but **skips deal creation**.

**HubSpot private app scopes (minimum):** `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.deals.read`, `crm.objects.deals.write`.

---

## 3. Webhook URL and authentication

- **URL:** `https://www.mejorvidainsurance.com/api/fex-email-quote-webhook` (or your Vercel domain).
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <FEX_EMAIL_WEBHOOK_SECRET>` **or** `X-Webhook-Secret: <FEX_EMAIL_WEBHOOK_SECRET>`

---

## 4. Request body (JSON) — contract for Make

Send **one JSON object** per email. The handler expects:

| Field | Required | Description |
|-------|----------|-------------|
| `senderEmail` | Yes | Prospect email (from FEX form / reply-to) |
| `senderName` | Recommended | Full name; split if `parsed` names missing |
| `subject` | No | Email subject |
| `emailMessageId` | No | Provider message id (dedupe later if you want) |
| `bodyPlain` | No | Plain body (stored + used as fallback summary) |
| `bodyHtml` | No | HTML body |
| `receivedAt` | No | ISO timestamp of the email (defaults to now) |
| `parsed` | Yes* | Object with structured fields (see below) |

**`parsed` object** (map from your FEX email template):

| Key | Description |
|-----|-------------|
| `firstName`, `lastName` | If missing, name is split from `senderName` |
| `phone` | Optional |
| `age` | Number |
| `gender` | String |
| `tobacco` | String |
| `coverage` or `coverageAmount` | Number |
| `state` or `stateCode` | 2-letter |
| `quoteSummary` | Short text of carriers / premiums if you extract them |

Example:

```json
{
  "senderEmail": "prospect@example.com",
  "senderName": "Jane Doe",
  "subject": "Your FEX quote results",
  "bodyPlain": "…full email…",
  "receivedAt": "2026-03-27T18:00:00.000Z",
  "parsed": {
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "4025550100",
    "age": 67,
    "gender": "Female",
    "tobacco": "Non-tobacco",
    "coverageAmount": 10000,
    "state": "NE",
    "quoteSummary": "Mutual of Omaha $X/mo; Assurity $Y/mo"
  }
}
```

---

## 5. Make.com scenario (step-by-step)

1. **Create scenario** → **Gmail** (or **Google Workspace Email**) → **Watch emails** (or **New email**).
2. **Connection:** OAuth to the mailbox that actually receives `quotes@` traffic (after group forward or routing).
3. **Filter** (in the Gmail module or a **Router**):
   - **To:** contains `quotes@mejorvidainsurance.com`, and/or
   - **From** / **Subject** matches FEX’s pattern (inspect one real message and lock the rule).
4. **Text parser** (optional): **Text parser** app or **Tools → Set variable** + **replace** / **regex** to pull age, state, etc. from `Text` / `HTML body`. FEX layouts vary — **save one real email** and build regex around it.
5. **HTTP → Make a request:**
   - **URL:** `https://www.mejorvidainsurance.com/api/fex-email-quote-webhook`
   - **Method:** POST
   - **Body type:** Raw / JSON
   - **Headers:** `Authorization: Bearer {{your_secret}}` (store secret in Make **Connections** or **Data store**, not in plain text in scenario name).
   - **Body:** Map fields from Gmail module into the JSON shape above using Make’s **JSON** object builder.

6. **Error handling in Make:**
   - Turn on **Scenario settings → Allow storing of incomplete executions**.
   - Add **Error handler** route: on HTTP **4xx/5xx**, send yourself an email or Slack with the bundle.

7. **Run once** → open **Operations** → confirm **200** and check Supabase row + HubSpot.

---

## 6. HubSpot: pipeline and stage IDs

1. **Settings → Objects → Deals → Pipelines** → open your pipeline → click a stage → copy **internal ID** from URL or use HubSpot’s **API** / **Properties** tools.
2. Set `HUBSPOT_FEX_PIPELINE_ID` and `HUBSPOT_FEX_DEAL_STAGE_ID` in Vercel.
3. Redeploy if needed so serverless picks up new env.

**Tickets instead of deals:** Not implemented in the webhook yet; you can clone the pattern in `api/fex-email-quote-webhook.js` for `crm/v3/objects/tickets` or use Make’s native HubSpot module **after** the webhook only updates contact.

---

## 7. Testing

1. **Apply migration** `005_fex_email_quotes.sql`.
2. Set **`FEX_EMAIL_WEBHOOK_SECRET`** and redeploy.
3. **curl** (replace domain and secret):

```bash
curl -sS -X POST "https://www.mejorvidainsurance.com/api/fex-email-quote-webhook" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "senderEmail": "test@example.com",
    "senderName": "Test User",
    "subject": "Test FEX",
    "bodyPlain": "test body",
    "parsed": { "firstName": "Test", "lastName": "User", "age": 65, "state": "NE" }
  }'
```

4. Confirm **`fex_email_quotes`** row in Supabase and contact (and deal if envs set) in HubSpot.
5. Send a **real** email through the Gmail trigger or use Make’s **Run once** with a sample bundle.

---

## 8. Error handling recommendations

| Issue | Mitigation |
|-------|------------|
| Duplicate emails | Store `emailMessageId` in Supabase; add unique index + ignore duplicates in a future iteration |
| FEX changes email HTML | Version your Make **parser**; keep raw `bodyPlain` / `bodyHtml` in DB for reprocessing |
| HubSpot deal fails | Row still created; `hubspot_sync_error` and `hubspot_deal_id` updated; fix pipeline IDs / scopes |
| Invalid JSON from Make | Webhook returns **400**; Make incomplete execution queue |
| Secret leak | Rotate `FEX_EMAIL_WEBHOOK_SECRET` in Vercel and Make together |

---

## 9. Alternative: all-in Make (no custom webhook)

You can use **Supabase** module (HTTP to REST) and **HubSpot** module directly in Make. You would still need to **duplicate** business rules (contact search, deal association). The **webhook** keeps one source of truth in your repo and matches `quote-lead-sync` patterns.

---

## 10. Files in this repo

| File | Role |
|------|------|
| `api/fex-email-quote-webhook.js` | Vercel serverless handler |
| `integrations/supabase/migrations/005_fex_email_quotes.sql` | Table `fex_email_quotes` |
