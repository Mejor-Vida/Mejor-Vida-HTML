# Facebook Instant Forms (Lead Ads) → Supabase + Staff CRM + IC CSV email

Route Meta Lead Ads through **your Vercel API** — no Make.com.

```
FB Instant Form submitted
  → Meta webhook POST /api/meta-leadgen-webhook
  → Graph API fetch lead field_data (leads_retrieval)
  → INSERT quote_lead_submissions (source: facebook_instant_form)
  → Gmail IC CSV → admin@ + julie@ (lib/ic-lead-notify.js)
  → Staff CRM inbox (unified_leads view)
  → optional HubSpot contact upsert
```

## 1. Meta App permissions

In [developers.facebook.com](https://developers.facebook.com) → your app:

| Permission | Why |
|------------|-----|
| **`leads_retrieval`** | Download instant-form answers |
| **`pages_manage_metadata`** | Subscribe Page to webhooks |
| **`pages_read_engagement`** | Page webhook delivery |
| **`pages_show_list`** | Pick the Mejor Vida Page |

App must be **Live** (not Development-only) for production leads.

Generate a **Page access token** for **Mejor Vida Insurance** with the permissions above. Store as:

- `META_LEADGEN_PAGE_ACCESS_TOKEN` (recommended), or reuse `FACEBOOK_PAGE_ACCESS_TOKEN` if it includes `leads_retrieval`

Posting-only tokens from `facebook-posting/` may **not** include leads — generate a dedicated token if needed.

## 2. Environment variables

Add to **`.env.local`** (local) and **Vercel → Project → Settings → Environment Variables** (Production):

| Variable | Required | Notes |
|----------|----------|--------|
| `META_LEADGEN_VERIFY_TOKEN` | Yes | Any random string you choose; Meta sends it back on subscribe |
| `FACEBOOK_APP_SECRET` | Yes | App → Settings → Basic → App Secret |
| `FACEBOOK_PAGE_ID` | Recommended | Numeric Page ID (reject webhooks from other pages) |
| `META_LEADGEN_PAGE_ACCESS_TOKEN` | Yes* | Page token with `leads_retrieval` |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Alt* | Used if `META_LEADGEN_PAGE_ACCESS_TOKEN` unset |
| `SUPABASE_URL` | Yes | Already configured |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Already configured |
| `GMAIL_CLIENT_ID` | Yes | IC CSV email (same as quote tool) |
| `GMAIL_CLIENT_SECRET` | Yes | |
| `GMAIL_REFRESH_TOKEN` | Yes | |
| `GMAIL_FROM_EMAIL` | Yes | Usually `julie@mejorvidainsurance.com` |
| `HUBSPOT_ACCESS_TOKEN` | Optional | Contact upsert |
| `META_LEADGEN_DEFAULT_LANG` | Optional | `es` (default) or `en` |
| `META_LEADGEN_SKIP_SIGNATURE` | Dev only | `1` to skip signature check locally — **never in production** |

\* At least one Page access token with leads scope.

## 3. Subscribe the webhook in Meta

1. App → **Webhooks** → **Page** → **Subscribe to this object**
2. **Callback URL:**
   ```
   https://www.mejorvidainsurance.com/api/meta-leadgen-webhook
   ```
3. **Verify token:** same value as `META_LEADGEN_VERIFY_TOKEN`
4. Click **Verify and save** (Meta sends GET with `hub.challenge`)
5. Subscribe to field: **`leadgen`**
6. Select your **Mejor Vida Insurance** Page

After deploy, verification only works if the route is live on Vercel with env vars set.

## 4. Instant Form field names

The webhook maps common English/Spanish question labels to CRM fields (`lib/meta-leadgen.js`):

| CRM field | Recognized form labels (examples) |
|-----------|-----------------------------------|
| First name | `first_name`, `nombre` |
| Last name | `last_name`, `apellido` |
| Full name | `full_name`, `nombre_completo` (split automatically) |
| Email | `email`, `correo` |
| Phone | `phone`, `teléfono`, `phone_number` |
| Age | `age`, `edad` |
| Gender | `gender`, `sexo` |
| Tobacco | `tobacco`, `tabaco`, `smoker` |
| State / ZIP | `state`, `estado`, `zip`, `código_postal` |

If your form uses custom labels, either rename questions in Meta to match, or extend `FIELD_ALIASES` in `lib/meta-leadgen.js`.

## 5. What happens on each lead

1. Meta POSTs `{ leadgen_id, form_id, ad_id, ... }`
2. API verifies `X-Hub-Signature-256` with `FACEBOOK_APP_SECRET`
3. Graph API returns `field_data`
4. Row inserted into **`quote_lead_submissions`** with `source = facebook_instant_form`
5. **IC email** sent to `admin@mejorvidainsurance.com, julie@mejorvidainsurance.com` with CSV attachment
6. Lead appears in **Staff CRM** (`/staff/crm.html`) via `unified_leads`
7. Duplicate `leadgen_id` is ignored (idempotent)

Webhook payloads are logged to **`webhook_logs`** (`source: meta_leadgen`).

## 6. Test locally

```bash
# Terminal 1
npm run dev:local

# Terminal 2 — simulate Meta subscription verify
curl "http://localhost:3000/api/meta-leadgen-webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=12345"
# Should return: 12345

# Simulate webhook POST (signature skipped when META_LEADGEN_SKIP_SIGNATURE=1)
curl -X POST http://localhost:3000/api/meta-leadgen-webhook \
  -H "Content-Type: application/json" \
  -d '{"object":"page","entry":[{"id":"YOUR_PAGE_ID","changes":[{"field":"leadgen","value":{"leadgen_id":"REAL_LEADGEN_ID_FROM_META_TEST"}}]}]}'
```

For a real end-to-end test, use Meta Ads Manager → your form → **Create test lead**.

## 7. Deploy

```bash
git add api/meta-leadgen-webhook.js lib/meta-leadgen.js lib/ic-lead-notify.js docs/META-FB-INSTANT-FORMS-LEADS.md
git commit -m "Add Meta Lead Ads webhook for instant forms (Supabase + IC email)"
git push
```

Then complete Meta webhook subscription (step 3) against production URL.

## 8. Troubleshooting

| Symptom | Check |
|---------|--------|
| Verify fails | `META_LEADGEN_VERIFY_TOKEN` matches Meta UI; route deployed |
| 403 Invalid signature | `FACEBOOK_APP_SECRET` correct; raw body intact |
| Graph API 403 on lead fetch | Page token missing **`leads_retrieval`** |
| No IC email | `GMAIL_*` env on Vercel; check function logs `[NOTIFY]` |
| Lead not in CRM | Supabase insert error in logs; check `webhook_logs` |
| Wrong field mapping | Inspect `request_raw.mapped` on the row; update `FIELD_ALIASES` |

## Related code

- `api/meta-leadgen-webhook.js` — HTTP handler
- `lib/meta-leadgen.js` — Graph fetch, mapping, Supabase, HubSpot
- `lib/ic-lead-notify.js` — IC CSV email to admin + Julie
- `api/staff/leads.js` — Staff CRM reads `unified_leads`
