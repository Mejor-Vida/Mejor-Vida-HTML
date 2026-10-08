# Meta Stage 2 — optimize for Lead (locked plan)

**Do not change Stage 1 while visual testing is in progress.** Stage 2 hook testing uses a **new ad set** (or new campaign) with **Lead** as the performance goal. ManyChat / server wiring stays the same.

## Locked decisions (Oct 2026)

| Layer | Stage 1 (now) | Stage 2 (hooks) |
|--------|----------------|-----------------|
| **Meta ad set goal** | Maximize **messaging conversations** | Maximize **Leads** (CAPI **Lead** from Intent Lead) |
| **CRM cost per lead** | Funnel creative testing: **bell** (`call_scheduled_at`) ÷ spend, matched by `contacts.meta_ad_id` | Same CRM metric; Meta ad set optimizes on server **Lead** |
| **WhatsApp conversion** | ManyChat **Actions #13** → `POST /api/contact-capture` with `action: "intent_lead"` | Unchanged |
| **Attribution** | CTWA triggers → `meta_ad_id` / `meta_ctwa_clid`; Path B webhook `api/meta-whatsapp-webhook` | Unchanged |
| **Ad-level Tracking** (URL params / website events) | Not used for CTWA | Not used |

### ManyChat Actions #13 body (live)

- `action`: `intent_lead`
- `phone`: system **Phone** (often empty in test contacts; server falls back to `whatsapp_id`)
- `whatsapp_id`: **WhatsApp ID**
- `subscriber_id`: **Contact Id**
- `estado`: custom `estado`
- `meta_ad_id`, `meta_ctwa_clid`: custom fields (filled only for CTWA ad entry)
- Header: `X-App-Secret` = `MANYCHAT_WEBHOOK_SECRET`

### Server

- `lib/intent-lead.js` — CRM + one **Lead** CAPI per contact (`lead_state.intent_lead_at`)
- `lib/meta-capi.js` — `sendMetaCapiIntentLeadEvent` (`action_source: business_messaging`, `messaging_channel: whatsapp`, `user_data.ctwa_clid` when present)
- Migration `108_intent_lead_attribution.sql` — `contacts.estado_response`, `lead_state.intent_lead_at`

### Stage 1 references (Ads Manager)

- Campaign: **Creative test Stage 1 - visuals - WhatsApp**
- Ad set: **Stage 1 visuals – WhatsApp** — keep **conversations** until Stage 1 winners are picked

## Before Stage 2 API work

1. **Events Manager** — **Lead** event receiving from CAPI (WhatsApp / business messaging). Intent Lead fires once per contact.
2. **Vercel** — `META_CAPI_ACCESS_TOKEN` set (required for CAPI; not optional for optimization).
3. **Supabase** — migration `108` applied on production.
4. **Deploy** — `intent_lead` handler on production (`api/contact-capture.js`).

## Stage 2 — agent runs via Marketing API

**Token:** `META_AD_ACCESS_TOKEN` (+ `META_AD_ACCOUNT_ID`) — same as Staff CRM creative testing (`lib/creative-testing.js`, `scripts/meta-ads-discover.js`). Needs `ads_management`.

**Workflow (human + agent):**

1. Julie finishes Stage 1 — pause or leave Stage 1 ad set as control.
2. Create **Stage 2** campaign/ad set in Ads Manager *or* use API script (below).
3. **Do not** try to change optimization goal on the live Stage 1 ad set — **duplicate** targeting into a new ad set with **Lead** goal.
4. New ads: Stage 2 hooks/wordings per Ad Builder; each new ad still needs ManyChat **CTWA trigger + Set `meta_ad_id`** (new Ad IDs).
5. Agent documents new `campaign_id` / `adset_id` in this file when created.

**Script:**

```bash
# Inspect current Stage 1 ad set (optimization_goal, promoted_object, targeting)
node scripts/meta-stage2-whatsapp-lead-adset.js inspect --adset-name "Stage 1 visuals"

# Dry-run: JSON plan for a Stage 2 LEAD ad set (no writes)
node scripts/meta-stage2-whatsapp-lead-adset.js plan --source-adset-name "Stage 1 visuals" --new-name "Stage 2 hooks – WhatsApp – Leads"

# After Julie approves plan — create paused ad set (Stage 2)
node scripts/meta-stage2-whatsapp-lead-adset.js create --source-adset-id <ID> --campaign-id <STAGE2_CAMPAIGN_ID> --name "Stage 2 hooks – WhatsApp – Leads"
```

Meta field names vary by API version; the script reads the source ad set and sets `optimization_goal` appropriate for **WhatsApp Lead** when creating the copy. If Graph returns an error, fix `promoted_object` / `destination_type` from the inspect output — do not guess in Ads Manager UI alone.

## What we do not do

- Repurpose `email_optin` on Actions #13 for Facebook Lead.
- Use ad **Tracking** URL parameters for WhatsApp.
- Switch Stage 1 ad set to Lead mid-test.

## Verify after Stage 2 ad set is live

1. Test ad click → ManyChat `meta_ad_id` + `meta_ctwa_clid` on contact (see Hernan pattern in CRM).
2. Answer state question → `intent_lead_at` set; Events Manager **Lead** (deduped).
3. Meta ad set **Results** column moves toward **Leads** (not only messaging conversations).
