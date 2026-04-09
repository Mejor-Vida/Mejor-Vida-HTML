# ManyChat — `/api/quote` (WhatsApp quote engine)

## Vercel environment variables

Set these in the Vercel project (**Settings → Environment Variables**). `vercel.json` does not store secrets; the app reads `process.env` at runtime.

| Variable | Required | Notes |
|----------|----------|--------|
| `SUPABASE_URL` | Yes | Project URL (`https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (same as elsewhere in this repo) |
| `SUPABASE_SERVICE_KEY` | No | Optional alias; used only if `SUPABASE_SERVICE_ROLE_KEY` is unset |
| `MANYCHAT_WEBHOOK_SECRET` | Yes | Must match **External Request** header `X-App-Secret` |

## ManyChat custom fields (all **Text**)

Create these user/contact fields in ManyChat:

1. `quote_low`
2. `quote_high`
3. `quote_anchor`
4. `quote_status`
5. `quote_error`

## External Request

- **Method:** POST  
- **URL:** `https://www.mejorvidainsurance.com/api/quote` (or your Vercel URL)  
- **Header:** `X-App-Secret: <same value as MANYCHAT_WEBHOOK_SECRET>`  
- **Body (JSON),** merge fields from the flow:

```json
{ "age": "{{age}}", "sex": "{{sex}}", "smoker": "{{tobacco}}" }
```

Map `smoker` to yes/no or true/false as your flow stores (e.g. `{{tobacco}}` → `"yes"` / `"no"`). The API also accepts boolean `smoker: false`.

## Response shape

ManyChat **v2** dynamic block: `content.set_field_values` is an array of `{ field_name, value }`. Example success fields: `quote_status` = `ok`, dollar strings for low/high/anchor.

## Smoke test (after deploy)

```bash
curl -sS -X POST "https://www.mejorvidainsurance.com/api/quote" \
  -H "Content-Type: application/json" \
  -H "X-App-Secret: $MANYCHAT_WEBHOOK_SECRET" \
  -d '{"age":65,"sex":"male","smoker":false}' | jq .
```

Check `content.set_field_values` for `quote_low` ≈ `$56.48`, `quote_high` ≈ `$68.44`, `quote_anchor` ≈ `$62.46`, `quote_status` = `ok` (age 65, male, non-smoker).

## Migration tracker

Repo migration file: `014_quote_ranges.sql`. If you applied `014` only in the SQL editor, run `015_schema_migrations_record_014.sql` (or `python3 integrations/supabase/apply_migrations.py`) so `schema_migrations.filename` includes `014_quote_ranges.sql`.
