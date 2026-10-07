# ManyChat → CRM: Facebook ad ID (Stage 1 cost per lead)

## Path B — Meta WhatsApp webhook (recommended at scale)

ManyChat stays the only **messaging** handler. Mejor Vida adds a **read-only** webhook that captures CTWA `referral` on the first ad message.

| Item | Value |
|------|--------|
| **URL** | `https://www.mejorvidainsurance.com/api/meta-whatsapp-webhook` |
| **WABA ID** | `1643473203448152` |
| **Phone number ID** | `995924690274318` (+1 402-440-5438) |
| **Subscribe** | `POST /{WABA_ID}/subscribed_apps` on **MejorVidaAutomation** only **after** GET verify succeeds in production |

Env and migration: see `.env.example` (`META_WHATSAPP_*`) and `integrations/supabase/migrations/107_whatsapp_ctwa_attribution.sql`.

Do **not** put temporary Graph Explorer tokens on Vercel.

---

Staff CRM **Funnel → creative testing** counts **scheduled-call (bell) leads** per Meta ad when `contacts.meta_ad_id` is set. Meta **messaging conversations** on each ad card are separate (Ads API only).

## Custom fields (ManyChat)

Create **User Fields** (type **Text**):

| Field name | Purpose |
|------------|---------|
| `meta_ad_id` | Numeric Meta **ad** id (required for CRM CPL by ad) |
| `meta_ctwa_clid` | Optional Click-to-WhatsApp click id |

Names must match exactly — `lib/manychat-pull.js` maps these into `/api/lead-intake`.

## Flow: **Whatsapp MVI Chatflow**

### Entry points today

- **Keyword:** `Hola, quiero una cotización gratis de seguro de gastos finales.` (website `wa.me`, manual typing)
- **Another flow:** Default Reply, Nurture Day 1/2
- **Then → Actions #7:** External Request → `https://www.mejorvidainsurance.com/api/lead-intake` (first action)

Keyword / Default Reply **do not** set `meta_ad_id` (expected).

### What to add for Facebook ads

For **each live Stage 1 ad** (one trigger per ad):

1. **When… → + New Trigger** → WhatsApp → **User clicks a CTWA Ad**
2. Connect ad (**Ad account** dropdown or paste **Ad ID** from Ads Manager → ad → ⋯ → Copy Ad ID)
3. **New step** (only on this branch): **Actions → Set Custom Field**
   - Field: `meta_ad_id`
   - Value: same numeric **Ad ID** as the trigger
4. Connect: **CTWA trigger → Set meta_ad_id → Actions #7**
5. Leave **keyword / Default Reply** wired **directly** to **Actions #7** (no Set field)

```
Keyword / Default Reply ──────────────→ Actions #7
CTWA (ad A) → Set meta_ad_id = A ───→ Actions #7
CTWA (ad B) → Set meta_ad_id = B ───→ Actions #7
```

Duplicate ads in Ads Manager get **new Ad IDs** → add a **new CTWA trigger + Set field** each time.

### External Request (inside Actions #7)

- **URL:** `https://www.mejorvidainsurance.com/api/lead-intake`
- **Method:** POST
- **Headers:** `Content-Type: application/json`, `X-App-Secret` = `MANYCHAT_WEBHOOK_SECRET` (same as `/api/quote`)
- **Body** (keep existing fields; minimum):

```json
{
  "subscriber_id": "{{user_id}}",
  "meta_ad_id": "{{meta_ad_id}}"
}
```

Use the `{}` picker to insert `meta_ad_id` if needed. Empty `meta_ad_id` on keyword leads is OK.

Vercel must have **`MANYCHAT_API_KEY`** set so lead-intake can **pull** custom fields from `getInfo` when the body omits them.

### Optional: patch later in the flow

Any **External Request** to `/api/lead-update` can include:

```json
{
  "phone": "{{phone}}",
  "meta_ad_id": "{{meta_ad_id}}"
}
```

Use if intake ran before `meta_ad_id` was set (wrong order).

## Ad creative note

Plain prefilled text-only CTWA sometimes **does not** fire ManyChat’s CTWA trigger. If contacts show as unattributed, try Meta’s **suggested questions / FAQ-style** message template and [ManyChat’s CTWA trigger docs](https://help.manychat.com/hc/en-us/articles/17154181720476-WhatsApp-Ads-Trigger).

## Verify

1. ManyChat → **Contacts** → user from ad preview → **User Fields** → `meta_ad_id` filled
2. Staff CRM → client **Overview** → **Meta ad ID** (read-only)
3. Funnel → Stage 1 ad set → that ad shows **Cost per lead** after a **bell** lead in the selected date range

## Backfill (after ManyChat is fixed)

Contacts created before tracking won’t have ad ids unless ManyChat still has the field on the subscriber:

```bash
# loads .env.local — does not print secrets
node scripts/sync-manychat-meta-ad-ids.js
```

Dry run: `node scripts/sync-manychat-meta-ad-ids.js --dry-run`
