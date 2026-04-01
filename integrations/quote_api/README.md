# Mejor Vida — website quote API

Small HTTP service used by `quote.html`: loads **rate grids from Supabase** by default (**`QUOTE_DATA_SOURCE=supabase`**); Google Sheets are **not** read at runtime unless you set **`QUOTE_ALLOW_SHEET_FALLBACK=1`** (with `QUOTE_DATA_SOURCE=auto`) or **`QUOTE_DATA_SOURCE=sheets`**. **Leads** are stored in **`quote_lead_submissions`** in Supabase; optional **`LEAD_LIST_GOOGLE_SHEET_BACKUP=1`** mirrors a row to the Lead List tab. **HubSpot** + optional **Resend**. See `integrations/supabase/README.md`.

## Run locally

From the repo root:

```bash
pip install -r integrations/quote_api/requirements.txt
python3 integrations/quote_api/server.py --port 8765
```

The process loads `.env.local` from the repo root (same variables as `integrations/google_sheets`).

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/quote/health` | Liveness check |
| GET | `/api/quote/options` | `{ ageMin, ageMax, coverages[] }` for the form |
| POST | `/api/quote/submit` | JSON body → quotes + CRM + sheet |

## Front-end configuration

On `quote.html`, set the API base **before** `quote-form.js`:

```html
<script>
  window.MVS_QUOTE_API = 'http://127.0.0.1:8765';
  window.MVS_QUOTE_SECRET = ''; // optional; must match QUOTE_API_SHARED_SECRET
</script>
<script src="js/quote-form.js"></script>
```

In production, either:

- **Same domain (recommended):** Put the Python service behind your main site at **`/api/quote/`** (reverse proxy). `quote.html` already sets `window.MVS_QUOTE_API = location.origin` on `mejorvidainsurance.com` / `www`, so the browser calls `https://yoursite.com/api/quote/submit` etc. No CORS issue.
- **Separate host:** Set `window.MVS_QUOTE_API = 'https://quote-api.yourdomain.com'` **before** `quote-form.js`, and set `QUOTE_CORS_ORIGINS` on the API to your marketing site origin(s).

## Environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `QUOTE_DATA_SOURCE` | No | Default **`supabase`**. `auto` + `QUOTE_ALLOW_SHEET_FALLBACK=1` for Sheet fallback. `sheets` legacy only. |
| `DATABASE_URL` | Yes (quotes + leads) | Or `SUPABASE_URL` + `SUPABASE_DB_PASSWORD`; see `integrations/supabase/config.py` |
| `LEAD_LIST_GOOGLE_SHEET_BACKUP` | No | `1` to also append Lead List in Google Sheets after Supabase insert |
| `GOOGLE_SHEETS_CREDENTIALS` | Backup lead tab + `import_from_sheets` | Not required for quote *grids* if Supabase is live |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Yes | Workbook with rate chart + Lead List |
| `GOOGLE_SHEETS_TAB` | No | Defaults to `Lead List` for appends |
| `HUBSPOT_ACCESS_TOKEN` | No | If missing, HubSpot step is skipped |
| `MVS_SCHEDULE_CALL_URL` | No | Injected into confirmation email |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | No | If set, sends quote summary email |
| `QUOTE_API_PORT` | No | Default `8765` |
| `QUOTE_CORS_ORIGINS` | No | e.g. `https://mejorvidainsurance.com,https://www.mejorvidainsurance.com` or `*` |
| `QUOTE_API_SHARED_SECRET` | No | If set, client must send header `X-Quote-Secret` |

Custom HubSpot properties `mvs_fe_lead_source` and `mvs_fe_tobacco` are sent when the portal defines them; otherwise the API retries without those properties.

## Submit JSON shape

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "4025550100",
  "age": 65,
  "gender": "female",
  "coverage": 15000,
  "tobacco": "no",
  "healthCondition": "none",
  "healthConditionOther": "",
  "state": "NE",
  "zip": "",
  "lang": "es",
  "consentEmail": true,
  "consentCall": true,
  "consentText": true
}
```

Validation: `consentEmail`, `consentCall`, and `consentText` must all be true.
`coverage` must be one of **5000, 10000, 15000, 20000, 25000**, or any dollar amount between **2500 and 150000** (custom “other” amounts from the website form).
`healthCondition` must be one of the server allowlisted slugs (see `server.py`). If `healthCondition` is `other`, `healthConditionOther` must be at least 2 characters.

Optional HubSpot properties: `mvs_fe_health_condition`, `mvs_fe_health_other` (create in HubSpot or the API retries without custom fields that fail).
