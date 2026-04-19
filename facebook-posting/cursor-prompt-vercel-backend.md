# Cursor Prompt: Mejor Vida WhatsApp Lead Backend (Vercel + Supabase + HubSpot)

---

## CONTEXT

I run an insurance agency called Mejor Vida. I have a ManyChat WhatsApp bot that collects quote leads. Right now, Nebraska in-state Spanish-speaking leads are being emailed to a routing alias and processed manually. I want to replace that with a direct API call from ManyChat → a secure Vercel serverless endpoint → Supabase (source of truth) → HubSpot (CRM).

Out-of-state leads will continue using the existing email alias flow — do NOT change anything about that.

---

## WHAT YOU NEED TO BUILD

Set up a new GitHub repository called `mejor-vida-backend` (private) with a Vercel serverless API. The repo should be production-ready with:

1. A Vercel serverless function at `POST /api/whatsapp-lead`
2. Supabase integration using the service role key
3. HubSpot integration to create/update contacts and deals
4. Shared secret validation for security
5. Full TypeScript

---

## REPOSITORY STRUCTURE

```
mejor-vida-backend/
├── api/
│   └── whatsapp-lead.ts       # Main Vercel serverless handler
├── lib/
│   ├── supabase.ts            # Supabase client (service role)
│   ├── hubspot.ts             # HubSpot API helpers
│   └── validate.ts            # Request validation helpers
├── types/
│   └── lead.ts                # TypeScript types
├── .env.example               # Template for required env vars
├── .gitignore
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## ENVIRONMENT VARIABLES

These will be set in Vercel's project settings (not committed to git). Create a `.env.example` file with these keys (empty values):

```
APP_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
HUBSPOT_ACCESS_TOKEN=
```

---

## EXISTING SUPABASE TABLE

The Supabase database already has a table called `quote_lead_submissions`. Do NOT create a new table. Use this existing table. Here is its schema:

```sql
-- Already exists. DO NOT run this. Reference only.
CREATE TABLE public.quote_lead_submissions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  source               TEXT NOT NULL DEFAULT 'website_quote_tool',
  first_name           TEXT,
  last_name            TEXT,
  email                TEXT,
  phone                TEXT,
  age                  INTEGER,
  gender               TEXT,
  coverage             INTEGER,
  tobacco              TEXT,
  state_code           CHARACTER,
  zip                  TEXT,
  lang                 TEXT,
  health_condition     TEXT,
  health_other         TEXT,
  quote_summary        TEXT,
  consent_summary      JSONB,
  payload              JSONB NOT NULL DEFAULT '{}',
  request_raw          JSONB NOT NULL DEFAULT '{}',
  quote_status         TEXT NOT NULL DEFAULT 'quote_requested',
  quote_error          TEXT,
  quote_generated_at   TIMESTAMPTZ,
  carriers_result      JSONB,
  quote_grid_source    TEXT,
  crm_sync_needed      BOOLEAN NOT NULL DEFAULT true,
  hubspot_contact_id   TEXT,
  hubspot_sync_status  TEXT,
  hubspot_last_sync_at TIMESTAMPTZ,
  hubspot_sync_error   TEXT
);
```

When inserting a WhatsApp lead, always set `source = 'whatsapp'`.

---

## ENDPOINT SPEC: `POST /api/whatsapp-lead`

### Security

Every request from ManyChat must include this header:

```
X-App-Secret: <value of APP_SECRET env var>
```

If the header is missing or incorrect, return `401 Unauthorized`.

### Request Body (JSON from ManyChat)

ManyChat will send all fields as strings. Cast appropriately on the server.

```json
{
  "first_name": "Maria",
  "last_name": "Garcia",
  "phone": "+14025551234",
  "email": "maria@example.com",
  "age": "42",
  "gender": "femenino",
  "tobacco": "no",
  "coverage": "10000",
  "lang": "ES",
  "state_code": "NE"
}
```

Field notes:
- `age`: integer, cast from string
- `coverage`: integer (dollar amount), cast from string
- `gender`: will be `"masculino"` or `"femenino"` — store as-is
- `tobacco`: will be `"si"` or `"no"` — store as-is
- `state_code`: always `"NE"` for this flow (Nebraska)
- `lang`: always `"ES"` for this flow (Spanish)
- `phone`: WhatsApp phone number including country code
- `email`: typed by user in chat — may occasionally be blank/missing, make it optional

### Processing Steps (in order)

1. **Validate the shared secret** — reject with 401 if wrong
2. **Validate required fields** — `first_name`, `phone` are required. Return 400 with error message if missing.
3. **Insert into Supabase** `quote_lead_submissions` with `source = 'whatsapp'`. Store the full raw request body in `request_raw`. Set `crm_sync_needed = true`.
4. **Sync to HubSpot** — create or update contact, then create a deal. Store the resulting `hubspot_contact_id` back on the Supabase row. Update `hubspot_sync_status` to `'synced'` on success or `'error'` with `hubspot_sync_error` message on failure. HubSpot sync failure should NOT cause the whole request to fail — log the error and continue.
5. **Return success** with the new record's `id`.

### Success Response (200)

```json
{
  "success": true,
  "id": "<uuid of new record>"
}
```

### Error Responses

- `401` — invalid or missing secret
- `400` — missing required fields (include `"error"` field with message)
- `500` — unexpected server error

---

## HUBSPOT INTEGRATION DETAILS

Use the HubSpot v3 Contacts and Deals API with a Private App access token (`HUBSPOT_ACCESS_TOKEN`).

### Contact

Search for existing contact by phone number first. If found, update. If not found, create.

Map fields like this:

| ManyChat field | HubSpot property |
|---|---|
| first_name | firstname |
| last_name | lastname |
| email | email |
| phone | phone |

### Deal

Always create a new deal (do not deduplicate deals). Associate it with the contact.

Deal properties:
- `dealname`: `"WhatsApp Lead - {first_name} {last_name}"`
- `pipeline`: `"default"` (use the default pipeline)
- `dealstage`: use whatever the first/earliest stage is in the default pipeline (typically `"appointmentscheduled"` or similar — you may need to leave a TODO comment here for me to fill in the correct stage ID)
- `amount`: the `coverage` value if provided
- `hs_lead_status`: `"NEW"`

Add a note on the deal:
```
WhatsApp lead (Nebraska/Spanish). Age: {age}, Gender: {gender}, Tobacco: {tobacco}, Coverage: ${coverage}, Language: ES
```

---

## VERCEL CONFIGURATION

`vercel.json`:
```json
{
  "functions": {
    "api/whatsapp-lead.ts": {
      "maxDuration": 15
    }
  }
}
```

---

## MANYCHAT NOTES (for my reference, not for you to build)

In ManyChat, the "Actions #1" step that currently fires the External Request (Google Apps Script URL) will be replaced with a new External Request pointing to the Vercel URL. The HTTP Request will be:

- Method: `POST`
- URL: `https://<your-vercel-project>.vercel.app/api/whatsapp-lead`
- Headers: `X-App-Secret: {{APP_SECRET_VALUE}}`
- Body (JSON): map each ManyChat custom field to the JSON keys above

The custom fields in ManyChat are: `edad` (age), `sexo` (gender), `tabaco` (tobacco). First name, last name, and phone come from the contact's WhatsApp profile. Email is asked in the flow.

---

## WHAT TO DO NOW (Cursor tasks)

1. Initialize the repo with `npm init`, install dependencies: `@supabase/supabase-js`, `@hubspot/api-client`, TypeScript, `@vercel/node` types
2. Create all files per the structure above
3. Implement `api/whatsapp-lead.ts` fully
4. Create `lib/supabase.ts` (singleton client with service role key)
5. Create `lib/hubspot.ts` (search contact, create/update contact, create deal, add note)
6. Create `lib/validate.ts` (secret check, required field check)
7. Create `types/lead.ts` (TypeScript interfaces)
8. Create `.env.example`, `.gitignore`, `vercel.json`, `tsconfig.json`
9. Add a `README.md` explaining how to deploy to Vercel and what env vars to set
10. Initialize a git repo, make initial commit

Do NOT deploy to Vercel — leave that for me to do manually after reviewing the code.
Do NOT create any Supabase tables — the table already exists.
Do NOT hardcode any secrets or API keys.
