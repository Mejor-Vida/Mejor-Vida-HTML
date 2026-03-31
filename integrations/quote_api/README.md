# Mejor Vida — website quote API

Small HTTP service used by `quote.html`: reads **Carrier Rate Charts** from Google Sheets, appends to **Lead List**, upserts **HubSpot** contacts, and optionally emails the lead via **Resend**.

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

In production, serve the site over HTTPS and point `MVS_QUOTE_API` at your deployed API URL. Set `QUOTE_CORS_ORIGINS` to your site origin(s), comma-separated.

## Environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `GOOGLE_SHEETS_CREDENTIALS` | Yes | Path to OAuth or service account JSON |
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
  "consentText": false
}
```

Validation: `consentEmail`, `consentCall`, and `consentText` must all be true.
`healthCondition` must be one of the server allowlisted slugs (see `server.py`). If `healthCondition` is `other`, `healthConditionOther` must be at least 2 characters.

Optional HubSpot properties: `mvs_fe_health_condition`, `mvs_fe_health_other` (create in HubSpot or the API retries without custom fields that fail).
