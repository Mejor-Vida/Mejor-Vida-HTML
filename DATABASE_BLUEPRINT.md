# Mejor Vida Insurance — Database & System Blueprint
**Version 2.0 | May 2026**

This document is the **single pre-read** before changing Supabase schema, Vercel API routes, or Staff Portal UI. It merges the original architecture narrative with an **authoritative schema inventory** (from production `information_schema` at doc build time), **API field naming**, **UI bindings**, **phone matching**, and **known gotchas**.

---

## ARCHITECTURE OVERVIEW

The system operates across three distinct layers, each with a single responsibility:

| Layer | Tool | Role |
|---|---|---|
| **Memory** | Supabase | Permanent source of truth — everything that has ever happened |
| **Brain** | Vercel (API routes) | All business logic and decision-making |
| **Sales View** | HubSpot | Clean pipeline — qualified leads and active deals only |

**Core Rules:**
1. Supabase is the system of record — prefer append-only patterns for audit (`events`); some staff actions **do** hard-delete or update rows (see Known Gotchas).
2. HubSpot is derived data — everything in HubSpot comes from a Supabase decision
3. Vercel owns all logic — no business logic lives inside HubSpot
4. Idempotency is required — never create duplicate contacts or deals
5. Phone number is the primary identifier (WhatsApp-first system)

---

## PIPELINE STAGES

Every lead enters HubSpot and is placed in the correct stage based on their WhatsApp progress. All interactions are documented with date and timestamp.

| Stage | Trigger | Next Goal |
|---|---|---|
| **1. New Contact** | Sent first WhatsApp message (phone captured) | Get them to pick a language |
| **2. Engaged** | Picked a language (idioma set) | Get them to answer questions |
| **3. Partially Qualified** | Answered age, smoker status, gender | Get them to complete quote flow |
| **4. Quoted** | Received a quote, no call scheduled | Get them to schedule a call |
| **5. Call Scheduled** | Booked a call with Julie | Complete the call |
| **6. Call Completed** | Call happened with Julie | Issue policy |
| **7. Policy Issued** | Closed Won — policy purchased | Retention / referrals |
| **8. Closed Lost** | Stopped responding / not interested | Re-engagement campaign |

**Database note:** `lead_state.pipeline_stage` and related fields use **snake_case** values such as `new_contact`, `engaged`, `partially_qualified`, `quoted` (not necessarily 1:1 with HubSpot stage labels). ManyChat-sourced `manychat_leads.pipeline_stage` may use **different** string conventions (e.g. `nebraska_lead`); do not assume parity without checking both tables.

---

## DATA OWNERSHIP (WHICH TABLE WINS)

| Concept | Canonical / primary owner | Also appears in | Notes |
|--------|---------------------------|----------------|-------|
| Person identity (phone as key) | `contacts` | `manychat_leads`, `quote_lead_submissions`, `whatsapp_leads`, `unified_leads` (view) | Staff list uses `unified_leads.id` which is **not always** `contacts.id`. |
| US state for residency / KB | `contacts.us_state` | `profile_ext.state` in API / `staff_lead_profiles`, `knowledge_gaps.us_state`, `quote_lead_submissions.state_code` | **`lead_state` has NO `us_state` in production.** |
| Age / gender / smoker (pipeline) | `lead_state` (`age`, `gender`, `is_smoker`) | `manychat_leads` (`age`, `sex`, `tobacco`), `quote_lead_submissions` (`age`, `gender`, `tobacco`) | Staff API exposes **`sex`** and **`tobacco`**, not `gender` / `is_smoker`. |
| Pipeline stage (automation) | `lead_state.pipeline_stage` | `manychat_leads.pipeline_stage`, API `detail.pipeline_stage` | **Two merge layers:** (1) Cross-source shaping uses `mergePreferSource` — blanks on the ManyChat-shaped `detail` are filled from `lead_state` / contact overlays. (2) Final staff `detail` uses `mergePreferCanonical` in `composeMergedLeadDetail` — **non-blank `staff_lead_profiles` (canonical) values win** over source `detail` for `pipeline_stage` and other top-level keys. |
| Staff-edited profile overlay | `staff_lead_profiles.profile_data` | Merged into `/api/staff/leads` `detail` | PATCH **does not** `UPDATE manychat_leads` / `contacts` directly; it updates canonical JSON (+ PHI). |
| Underwriting / health PHI | `lead_underwriting_phi.encrypted_payload` | API `detail.phi` (decrypted server-side) | Keys in `phi` are snake_case (e.g. `terminal_illness`). |
| Product selector session | `product_selector_sessions` | Augments API `detail.profile_ext` / top-level `age` etc. | See `api/staff/product-selector.js`. |
| OOS website referrals | `out_of_state_referrals` | — | Separate from `contacts`. |

---

## SCHEMA — COLUMN INVENTORY (PUBLIC)

The tables below reflect **production PostgreSQL** (`information_schema.columns`) as captured when this doc was built (**May 2026**). After migrations, re-query `information_schema.columns` for `table_schema = 'public'` (Supabase SQL editor or local `psycopg` using `integrations/supabase/config.py` + `DATABASE_URL`) and replace the **Full column list** subsection so defaults/nullable/generated stay exact.

**Generated columns (stored):**
- `contacts.phone_last_10` — `RIGHT(regexp_replace(COALESCE(phone,''), '[^0-9]', '', 'g'), 10)` per migration `041_contacts_phone_last10.sql`.
- `contacts.full_name` — trimmed concat of `first_name` + `last_name` per `020_contacts_name_split.sql`.

**Per-table gotchas (schema-level):**
- **`lead_state`:** No `us_state` column in production (despite early migration comments in `017_nurture_pipeline_v2.sql` listing it — later DB state removed it or never applied that column). **Do not** `SELECT lead_state.us_state` in API code.
- **`contacts.phone`:** **`UNIQUE NOT NULL`** per `017_nurture_pipeline_v2.sql` (one row per phone); re-verify in `information_schema` if migrations diverge.
- **`unified_leads`:** A **VIEW**, not a physical table; columns are all nullable in `information_schema`.
- **`quote_lead_funnel`:** VIEW (nullable metadata in inventory).

---

### Full column list (all `public` tables / views)
#### `analytics_events`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `event_type` | text | NO |  | — |
| `event_data` | jsonb | NO | '{}'::jsonb | — |
| `session_client_id` | text | YES |  | — |
| `source` | text | NO | 'website'::text | — |
| `quote_lead_submission_id` | uuid | YES |  | — |
| `contact_id` | uuid | YES |  | — |

#### `api_ingestion_log`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `destination` | text | YES |  | — |
| `endpoint` | text | YES |  | — |
| `method` | text | YES |  | — |
| `request_body` | jsonb | YES |  | — |
| `response_status` | integer | YES |  | — |
| `response_body` | jsonb | YES |  | — |
| `duration_ms` | integer | YES |  | — |
| `created_at` | timestamp with time zone | YES | now() | — |

#### `approved_answers`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `question_normalized` | text | YES |  | — |
| `question_original` | text | YES |  | — |
| `answer_text` | text | NO |  | — |
| `locale` | text | NO | 'en'::text | — |
| `status` | text | NO | 'approved'::text | — |
| `source_id` | uuid | YES |  | — |
| `derived_from_escalation_id` | uuid | YES |  | — |

#### `call_transcripts`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `contact_id` | uuid | YES |  | — |
| `call_date` | timestamp with time zone | NO |  | — |
| `duration_secs` | integer | YES |  | — |
| `recording_url` | text | YES |  | — |
| `transcript_text` | text | YES |  | — |
| `ai_summary` | text | YES |  | — |
| `call_outcome` | text | YES |  | — |
| `created_at` | timestamp with time zone | YES | now() | — |

#### `carriers`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `name` | text | NO |  | — |
| `slug` | text | YES |  | — |
| `status` | text | NO | 'active'::text | — |
| `notes` | text | YES |  | — |

#### `chat_messages`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `session_id` | text | NO |  | — |
| `role` | text | NO |  | — |
| `content` | text | NO |  | — |
| `created_at` | timestamp with time zone | YES | CURRENT_TIMESTAMP | — |

#### `chat_sessions`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `session_id` | text | NO |  | — |
| `language` | text | NO | 'English'::text | — |
| `created_at` | timestamp with time zone | YES | CURRENT_TIMESTAMP | — |
| `last_activity` | timestamp with time zone | YES | CURRENT_TIMESTAMP | — |

#### `compose_drafts`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `created_by` | text | NO |  | — |
| `lead_id` | uuid | YES |  | — |
| `recipient_name` | text | YES |  | — |
| `email` | text | YES |  | — |
| `phone` | text | YES |  | — |
| `language` | text | NO | 'English'::text | — |
| `customer_issue` | text | YES |  | — |
| `staff_notes` | text | YES |  | — |

#### `contacts`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `phone` | text | NO |  | — |
| `email` | text | YES |  | — |
| `language` | text | YES |  | — |
| `source` | text | YES | 'whatsapp'::text | — |
| `whatsapp_id` | text | YES |  | — |
| `us_state` | text | YES | 'NE'::text | — |
| `created_at` | timestamp with time zone | YES | now() | — |
| `updated_at` | timestamp with time zone | YES | now() | — |
| `pending_sms_intent` | text | YES |  | — |
| `vcf_sent_at` | timestamp with time zone | YES |  | — |
| `first_name` | text | YES |  | — |
| `last_name` | text | YES |  | — |
| `full_name` | text | YES |  | ALWAYS `NULLIF(btrim(((COALESCE(first_name, ''::text) || ' '::text) || COALESCE(last_name, ''::text))), ''::text)` |
| `idioma` | text | YES |  | — |
| `manychat_subscriber_id` | text | YES |  | — |
| `phone_last_10` | text | YES |  | ALWAYS `"right"(regexp_replace(COALESCE(phone, ''::text), '[^0-9]'::text, ''::text, 'g'::text), 10)` |

#### `escalated_questions`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `chat_session_id` | uuid | YES |  | — |
| `user_question` | text | NO |  | — |
| `locale` | text | NO | 'es'::text | — |
| `status` | text | NO | 'open'::text | — |
| `retrieval_debug` | jsonb | NO | '{}'::jsonb | — |
| `resolved_answer_id` | uuid | YES |  | — |

#### `events`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `contact_id` | uuid | YES |  | — |
| `event_type` | text | NO |  | — |
| `event_data` | jsonb | YES | '{}'::jsonb | — |
| `channel` | text | YES | 'whatsapp'::text | — |
| `created_at` | timestamp with time zone | YES | now() | — |

#### `faq_entries`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `question` | text | YES |  | — |
| `answer` | text | NO |  | — |
| `locale` | text | NO | 'en'::text | — |
| `status` | text | NO | 'draft'::text | — |
| `content_class` | text | NO | 'faq'::text | — |
| `reviewed_at` | timestamp with time zone | YES |  | — |
| `reviewed_by` | text | YES |  | — |
| `source_id` | uuid | YES |  | — |

#### `faqs`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `question` | text | NO |  | — |
| `answer` | text | NO |  | — |
| `language` | text | NO | 'English'::text | — |
| `created_at` | timestamp with time zone | YES | CURRENT_TIMESTAMP | — |
| `usage_count` | integer | YES | 0 | — |
| `embedding` | USER-DEFINED | YES |  | — |
| `metadata` | jsonb | YES |  | — |

#### `integration_audit_events`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `stage` | text | NO |  | — |
| `endpoint` | text | YES |  | — |
| `outcome` | text | NO |  | — |
| `phone_last4` | text | YES |  | — |
| `message` | text | YES |  | — |
| `detail` | jsonb | YES |  | — |
| `manychat_lead_id` | uuid | YES |  | — |
| `contact_id` | uuid | YES |  | — |

#### `internal_knowledge_chunks`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `carrier` | text | NO |  | — |
| `product` | text | NO | 'general'::text | — |
| `category` | text | NO | 'general'::text | — |
| `content` | text | NO |  | — |
| `embedding` | USER-DEFINED | YES |  | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `chunk_fingerprint` | text | NO |  | — |

#### `knowledge_chunks`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `document_id` | uuid | NO |  | — |
| `chunk_index` | integer | NO | 0 | — |
| `content` | text | NO |  | — |
| `embedding` | USER-DEFINED | YES |  | — |
| `metadata` | jsonb | NO | '{}'::jsonb | — |
| `status` | text | NO | 'draft'::text | — |
| `reviewed_at` | timestamp with time zone | YES |  | — |

#### `knowledge_documents`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `title` | text | NO |  | — |
| `source_id` | uuid | YES |  | — |
| `status` | text | NO | 'draft'::text | — |
| `reviewed_at` | timestamp with time zone | YES |  | — |

#### `knowledge_gaps`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `question` | text | NO |  | — |
| `contact_id` | uuid | YES |  | — |
| `phone` | text | YES |  | — |
| `us_state` | text | YES | 'NE'::text | — |
| `channel` | text | YES | 'whatsapp'::text | — |
| `conversation_context` | text | YES |  | — |
| `julie_notified_at` | timestamp with time zone | YES |  | — |
| `julie_decision` | text | YES |  | — |
| `julie_answer` | text | YES |  | — |
| `julie_decided_at` | timestamp with time zone | YES |  | — |
| `added_to_kb_at` | timestamp with time zone | YES |  | — |
| `kb_chunk_id` | uuid | YES |  | — |
| `created_at` | timestamp with time zone | YES | now() | — |

#### `knowledge_sources`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `name` | text | NO |  | — |
| `source_type` | text | NO | 'manual'::text | — |
| `external_ref` | text | YES |  | — |
| `notes` | text | YES |  | — |

#### `lead_state`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `contact_id` | uuid | YES |  | — |
| `pipeline_stage` | text | NO | 'new_contact'::text | — |
| `whatsapp_drop_off` | text | YES |  | — |
| `age` | integer | YES |  | — |
| `is_smoker` | boolean | YES |  | — |
| `gender` | text | YES |  | — |
| `coverage_amount` | integer | YES |  | — |
| `monthly_premium` | numeric | YES |  | — |
| `quote_generated_at` | timestamp with time zone | YES |  | — |
| `language_picked_at` | timestamp with time zone | YES |  | — |
| `questions_completed_at` | timestamp with time zone | YES |  | — |
| `call_scheduled_at` | timestamp with time zone | YES |  | — |
| `call_completed_at` | timestamp with time zone | YES |  | — |
| `policy_issued_at` | timestamp with time zone | YES |  | — |
| `hubspot_contact_id` | text | YES |  | — |
| `hubspot_deal_id` | text | YES |  | — |
| `hubspot_synced_at` | timestamp with time zone | YES |  | — |
| `last_activity_at` | timestamp with time zone | YES | now() | — |
| `updated_at` | timestamp with time zone | YES | now() | — |
| `quote_low` | text | YES |  | — |
| `quote_high` | text | YES |  | — |

#### `lead_underwriting_phi`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `lead_id` | uuid | NO |  | — |
| `lead_source_table` | text | NO |  | — |
| `encrypted_payload` | text | NO |  | — |
| `phi_version` | integer | NO | 1 | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `updated_by` | text | YES |  | — |

#### `manychat_leads`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `first_name` | text | YES |  | — |
| `phone` | text | YES |  | — |
| `email` | text | YES |  | — |
| `age` | integer | YES |  | — |
| `sex` | text | YES |  | — |
| `tobacco` | boolean | YES |  | — |
| `language` | text | YES | 'English'::text | — |
| `tag` | text | YES | 'Lead_NE'::text | — |
| `pipeline_stage` | text | YES | 'new'::text | — |
| `source` | text | YES | 'whatsapp'::text | — |
| `drop_off` | boolean | NO | false | — |
| `drop_off_stage` | text | YES |  | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `last_name` | text | YES |  | — |
| `opt_in` | boolean | NO | false | — |
| `opt_in_at` | timestamp with time zone | YES |  | — |
| `manychat_subscriber_id` | text | YES |  | — |
| `staff_hidden_at` | timestamp with time zone | YES |  | — |

#### `marketing_notes`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `title` | text | NO |  | — |
| `body` | text | NO |  | — |
| `source_id` | uuid | YES |  | — |
| `status` | text | NO | 'draft'::text | — |
| `reviewed_at` | timestamp with time zone | YES |  | — |

#### `notes`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `contact_id` | uuid | YES |  | — |
| `note` | text | NO |  | — |
| `note_type` | text | YES | 'manual'::text | — |
| `created_by` | text | YES | 'julie'::text | — |
| `created_at` | timestamp with time zone | YES | now() | — |

#### `nurture_sequence`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `contact_id` | uuid | NO |  | — |
| `phase` | smallint | NO | 1 | — |
| `step` | smallint | NO | 0 | — |
| `status` | text | NO | 'active'::text | — |
| `enrolled_at` | timestamp with time zone | NO | now() | — |
| `last_sent_at` | timestamp with time zone | YES |  | — |
| `next_send_at` | timestamp with time zone | YES |  | — |
| `completed_at` | timestamp with time zone | YES |  | — |
| `manychat_subscriber_id` | text | YES |  | — |
| `twilio_opt_out` | boolean | NO | false | — |
| `email_opt_out` | boolean | NO | false | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |

#### `oos_agents`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `state_code` | character | NO |  | — |
| `display_name` | text | NO |  | — |
| `company_name` | text | YES |  | — |
| `email` | text | NO |  | — |
| `phone` | text | YES |  | — |
| `business_address` | text | YES |  | — |
| `notes` | text | YES |  | — |
| `active` | boolean | NO | true | — |
| `source` | text | NO | 'staff'::text | — |

#### `out_of_state_referrals`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `first_name` | text | YES |  | — |
| `last_name` | text | YES |  | — |
| `email` | text | NO |  | — |
| `phone` | text | YES |  | — |
| `state_code` | text | YES |  | — |
| `message` | text | YES |  | — |
| `consent_licensed_agent` | boolean | YES | false | — |
| `source` | text | YES | 'website_out_of_state_form'::text | — |
| `status` | text | YES | 'new'::text | — |
| `created_at` | timestamp with time zone | YES | now() | — |
| `matched_oos_agent_id` | uuid | YES |  | — |
| `referral_context` | text | YES |  | — |
| `ai_connection_email` | text | YES |  | — |
| `compensation_notes` | text | YES |  | — |
| `compensated_at` | timestamp with time zone | YES |  | — |

#### `product_selector_sessions`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `lead_id` | uuid | NO |  | — |
| `lead_source_table` | text | NO |  | — |
| `qualification_answers` | jsonb | NO | '{}'::jsonb | — |
| `risk_summary` | jsonb | NO | '{}'::jsonb | — |
| `recommendation` | jsonb | NO | '{}'::jsonb | — |
| `confidence` | jsonb | NO | '{}'::jsonb | — |
| `sales_enablement` | jsonb | NO | '{}'::jsonb | — |
| `workflow_state` | jsonb | NO | '{}'::jsonb | — |
| `created_by` | text | YES | 'staff_portal'::text | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |

#### `products`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `carrier_id` | uuid | NO |  | — |
| `name` | text | NO |  | — |
| `product_line` | text | YES |  | — |
| `status` | text | NO | 'active'::text | — |
| `notes` | text | YES |  | — |

#### `quote_lead_funnel`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | YES |  | — |
| `created_at` | timestamp with time zone | YES |  | — |
| `source` | text | YES |  | — |
| `email` | text | YES |  | — |
| `phone` | text | YES |  | — |
| `state_code` | character | YES |  | — |
| `lang` | text | YES |  | — |
| `quote_status` | text | YES |  | — |
| `has_quote` | boolean | YES |  | — |
| `viewed_results_page` | boolean | YES |  | — |
| `opened_schedule_modal` | boolean | YES |  | — |
| `scheduled_call_recorded` | boolean | YES |  | — |
| `quote_generated_at` | timestamp with time zone | YES |  | — |
| `quote_results_viewed_at` | timestamp with time zone | YES |  | — |
| `schedule_modal_opened_at` | timestamp with time zone | YES |  | — |
| `call_scheduled_at` | timestamp with time zone | YES |  | — |
| `origin_detail` | jsonb | YES |  | — |
| `session_client_id` | text | YES |  | — |
| `hubspot_contact_id` | text | YES |  | — |
| `hubspot_deal_id` | text | YES |  | — |
| `contact_id` | uuid | YES |  | — |

#### `quote_lead_submissions`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `source` | text | NO | 'website_quote_tool'::text | — |
| `first_name` | text | YES |  | — |
| `last_name` | text | YES |  | — |
| `email` | text | YES |  | — |
| `phone` | text | YES |  | — |
| `age` | integer | YES |  | — |
| `gender` | text | YES |  | — |
| `coverage` | integer | YES |  | — |
| `tobacco` | text | YES |  | — |
| `state_code` | character | YES |  | — |
| `zip` | text | YES |  | — |
| `lang` | text | YES |  | — |
| `health_condition` | text | YES |  | — |
| `health_other` | text | YES |  | — |
| `quote_summary` | text | YES |  | — |
| `consent_summary` | jsonb | YES |  | — |
| `payload` | jsonb | NO | '{}'::jsonb | — |
| `request_raw` | jsonb | NO | '{}'::jsonb | — |
| `quote_status` | text | NO | 'quote_requested'::text | — |
| `quote_error` | text | YES |  | — |
| `quote_generated_at` | timestamp with time zone | YES |  | — |
| `carriers_result` | jsonb | YES |  | — |
| `quote_grid_source` | text | YES |  | — |
| `crm_sync_needed` | boolean | NO | true | — |
| `hubspot_contact_id` | text | YES |  | — |
| `hubspot_sync_status` | text | YES |  | — |
| `hubspot_last_sync_at` | timestamp with time zone | YES |  | — |
| `hubspot_sync_error` | text | YES |  | — |
| `origin_detail` | jsonb | NO | '{}'::jsonb | — |
| `session_client_id` | text | YES |  | — |
| `quote_results_viewed_at` | timestamp with time zone | YES |  | — |
| `schedule_modal_opened_at` | timestamp with time zone | YES |  | — |
| `call_scheduled_at` | timestamp with time zone | YES |  | — |
| `contact_id` | uuid | YES |  | — |
| `hubspot_deal_id` | text | YES |  | — |

#### `quote_ranges`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | integer | NO | nextval('quote_ranges_id_seq'::regclass) | — |
| `age` | smallint | NO |  | — |
| `sex` | text | NO |  | — |
| `smoker` | boolean | NO | false | — |
| `low` | numeric | NO |  | — |
| `high` | numeric | NO |  | — |
| `anchor` | numeric | NO |  | — |
| `created_at` | timestamp with time zone | NO | now() | — |

#### `schema_migrations`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `filename` | text | NO |  | — |
| `applied_at` | timestamp with time zone | NO | now() | — |

#### `staff_hidden_leads`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `dedupe_key` | text | NO |  | — |
| `email_key` | text | YES |  | — |
| `phone_key` | text | YES |  | — |
| `name_key` | text | YES |  | — |
| `source_table` | text | YES |  | — |
| `source_id` | uuid | YES |  | — |
| `hidden_by` | text | YES |  | — |
| `hidden_at` | timestamp with time zone | NO | now() | — |

#### `staff_kb_gaps`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `question` | text | NO |  | — |
| `question_hash` | text | NO |  | — |
| `assistant_answer` | text | YES |  | — |
| `source` | text | NO | 'general_fallback'::text | — |
| `retrieval_count` | integer | NO | 0 | — |
| `max_similarity` | double precision | YES |  | — |
| `resolved` | boolean | NO | false | — |
| `resolved_at` | timestamp with time zone | YES |  | — |
| `resolved_by` | text | YES |  | — |
| `last_asked_at` | timestamp with time zone | NO | now() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |

#### `staff_lead_profiles`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `lead_id` | uuid | NO |  | — |
| `lead_source_table` | text | NO |  | — |
| `profile_data` | jsonb | NO | '{}'::jsonb | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `updated_by` | text | YES |  | — |

#### `state_availability`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `product_id` | uuid | NO |  | — |
| `state_code` | character | NO |  | — |
| `available` | boolean | NO | true | — |
| `notes` | text | YES |  | — |

#### `unanswered_questions`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `lead_id` | uuid | YES |  | — |
| `phone` | text | YES |  | — |
| `question` | text | NO |  | — |
| `language` | text | YES |  | — |
| `flow_stage` | text | YES |  | — |
| `resolved` | boolean | NO | false | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `edited_question` | text | YES |  | — |
| `resolved_at` | timestamp with time zone | YES |  | — |
| `resolved_by` | text | YES |  | — |
| `rag_pushed` | boolean | YES | false | — |
| `email_sent` | boolean | NO | false | — |
| `staff_context` | text | YES |  | — |

#### `underwriting_rules`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `product_id` | uuid | NO |  | — |
| `rule_key` | text | NO |  | — |
| `rule_value` | jsonb | NO | '{}'::jsonb | — |
| `notes` | text | YES |  | — |

#### `unified_leads`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | YES |  | — |
| `source_table` | text | YES |  | — |
| `source` | text | YES |  | — |
| `first_name` | text | YES |  | — |
| `last_name` | text | YES |  | — |
| `display_name` | text | YES |  | — |
| `email` | text | YES |  | — |
| `phone` | text | YES |  | — |
| `language` | text | YES |  | — |
| `created_at` | timestamp with time zone | YES |  | — |
| `updated_at` | timestamp with time zone | YES |  | — |

#### `webhook_logs`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `source` | text | YES |  | — |
| `endpoint` | text | YES |  | — |
| `payload` | jsonb | YES |  | — |
| `status` | text | YES | 'received'::text | — |
| `error_message` | text | YES |  | — |
| `created_at` | timestamp with time zone | YES | now() | — |

#### `website_chat_sessions`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `created_at` | timestamp with time zone | NO | now() | — |
| `updated_at` | timestamp with time zone | NO | now() | — |
| `lead_submission_id` | uuid | YES |  | — |
| `first_name` | text | YES |  | — |
| `last_name` | text | YES |  | — |
| `captured_email` | text | YES |  | — |
| `captured_phone` | text | YES |  | — |
| `phase` | text | NO | 'collecting_contact'::text | — |
| `locale` | text | NO | 'es'::text | — |
| `metadata` | jsonb | NO | '{}'::jsonb | — |

#### `whatsapp_leads`

| Column | Type | Nullable | Default | Generated |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | — |
| `first_name` | text | YES |  | — |
| `last_name` | text | YES |  | — |
| `phone` | text | YES |  | — |
| `email` | text | YES |  | — |
| `language` | text | YES |  | — |
| `lead_source` | text | YES |  | — |
| `menu_selection` | text | YES |  | — |
| `hubspot_deal_id` | text | YES |  | — |
| `created_at` | timestamp with time zone | YES | now() | — |

---

## DATABASE TABLES — LEGACY NARRATIVE (RETAINED)

The following blocks are **kept from v1** for workflow context. If they conflict with the **column inventory** above, **trust the inventory + migrations** in `integrations/supabase/migrations/`.

### 1. `contacts` (conceptual)

One row per real person. Phone is the primary key in the **v2 pipeline** design. See column inventory for actual columns (`first_name`, `last_name`, `idioma`, `phone_last_10`, etc.).

### 2. `lead_state` (conceptual)

Current snapshot per `contact_id`. See inventory — **no `us_state`**.

### 3. `events`

Append-only audit trail. Valid `event_type` values (from original doc):

```
lead_created, language_selected, age_answered, smoker_answered, gender_answered,
coverage_selected, quote_generated, call_scheduled, call_completed, call_no_show,
email_sent, sms_sent, stage_changed, knowledge_gap_flagged, whatsapp_message_received,
whatsapp_message_sent, note_added, policy_issued, deal_closed_lost, hubspot_synced
```

### 4. `call_transcripts` / 5. `notes`

See column inventory.

### 6. `knowledge_chunks` / 7. `knowledge_gaps`

Original v1 suggested ALTERs; **actual** columns are in the inventory (`knowledge_chunks.metadata` jsonb, etc.). Staff KB gaps use `staff_kb_gaps` as well.

### 8. `webhook_logs` / 9. `api_ingestion_log`

See column inventory.

---

## API FIELD NAME REFERENCE

**Convention:** Vercel exposes one file per route: `/api/foo` → `api/foo.js` (and `/api/staff/foo` → `api/staff/foo.js`). All staff JSON APIs require `Authorization: Bearer <Supabase JWT>` unless noted.

### Route index (method → file)

| Path | File | Methods |
|------|------|---------|
| `/api/analytics-event` | `api/analytics-event.js` | POST |
| `/api/call-scheduled-webhook` | `api/call-scheduled-webhook.js` | POST |
| `/api/call-transcript` | `api/call-transcript.js` | POST |
| `/api/contact-capture` | `api/contact-capture.js` | POST |
| `/api/dropoff-capture` | `api/dropoff-capture.js` | POST |
| `/api/feedback` | `api/feedback.js` | POST |
| `/api/generate-image` | `api/generate-image.js` | POST |
| `/api/hubspot-sync` | `api/hubspot-sync.js` | POST |
| `/api/julie-decision` | `api/julie-decision.js` | POST |
| `/api/julie-review` | `api/julie-review.js` | GET |
| `/api/knowledge-gap` | `api/knowledge-gap.js` | POST |
| `/api/lead-capture` | `api/lead-capture.js` | POST |
| `/api/lead-intake` | `api/lead-intake.js` | POST |
| `/api/lead-update` | `api/lead-update.js` | POST |
| `/api/nurture-cron` | `api/nurture-cron.js` | GET (Vercel Cron; `Authorization: Bearer CRON_SECRET`) |
| `/api/nurture-enroll-cron` | `api/nurture-enroll-cron.js` | GET (Vercel Cron; `Authorization: Bearer CRON_SECRET`) |
| `/api/out-of-state-referral` | `api/out-of-state-referral.js` | POST |
| `/api/post-quote-email` | `api/post-quote-email.js` | POST |
| `/api/quote` | `api/quote.js` | POST |
| `/api/quote-lead-sync` | `api/quote-lead-sync.js` | POST |
| `/api/quote-site` | `api/quote-site.js` | POST |
| `/api/rag-answer` | `api/rag-answer.js` | POST |
| `/api/rag-site` | `api/rag-site.js` | POST |
| `/api/telnyx-sms-webhook` | `api/telnyx-sms-webhook.js` | POST |
| `/api/staff-chat` | `api/staff-chat.js` | POST |
| `/api/staff-config` | `api/staff-config.js` | GET |
| `/api/website-chat` | `api/website-chat.js` | POST |
| `/api/whatsapp-lead-webhook` | `api/whatsapp-lead-webhook.js` | POST |
| `/api/staff/delete-kb-gap` | `api/staff/delete-kb-gap.js` | POST |
| `/api/staff/generate-answer` | `api/staff/generate-answer.js` | POST |
| `/api/staff/gmail-auth` | `api/staff/gmail-auth.js` | GET |
| `/api/staff/gmail-callback` | `api/staff/gmail-callback.js` | GET |
| `/api/staff/integration-audit` | `api/staff/integration-audit.js` | GET |
| `/api/staff/internal-rag` | `api/staff/internal-rag.js` | POST |
| `/api/staff/kb-gaps` | `api/staff/kb-gaps.js` | GET |
| `/api/staff/leads` | `api/staff/leads.js` | GET, POST, PATCH, DELETE |
| `/api/staff/oos-agents` | `api/staff/oos-agents.js` | GET, POST, PATCH |
| `/api/staff/oos-intro-email` | `api/staff/oos-intro-email.js` | POST |
| `/api/staff/oos-referrals` | `api/staff/oos-referrals.js` | GET, PATCH, DELETE |
| `/api/staff/product-selector` | `api/staff/product-selector.js` | GET, POST, PATCH, PUT |
| `/api/staff/push-kb-gap-to-rag` | `api/staff/push-kb-gap-to-rag.js` | POST |
| `/api/staff/push-to-rag` | `api/staff/push-to-rag.js` | POST |
| `/api/staff/questions` | `api/staff/questions.js` | GET |
| `/api/staff/resolve` | `api/staff/resolve.js` | POST |
| `/api/staff/resolve-kb-gap` | `api/staff/resolve-kb-gap.js` | POST |
| `/api/staff/save-compose-draft` | `api/staff/save-compose-draft.js` | POST |
| `/api/staff/send-email` | `api/staff/send-email.js` | POST |
| `/api/staff/update-question` | `api/staff/update-question.js` | POST |

For request/response **field-level** detail on routes not expanded below, open the file cited in the table; search for `json(res` and `readJsonBody`.

---

### `/api/lead-intake` (POST) — ManyChat → Supabase

**Request (documented in `api/lead-intake.js`):** Many aliases accepted, including Spanish keys.

| Request key(s) | Maps to Supabase / behavior |
|----------------|-----------------------------|
| `subscriber_id`, `manychat_subscriber_id`, `id`, `contact_id`, `manychat_id` | Identity / ManyChat pull |
| `whatsapp_id`, `phone`, `whatsapp_phone` | `contacts.phone`, matching |
| `first_name`, `last_name`, `full_name`, `name` | `contacts` / `manychat_leads` |
| `email` | `contacts.email` |
| `language` | `contacts.language` / intake normalization |
| `us_state` | **`contacts.us_state`** |
| `edad`, `age` | `lead_state.age` (via lib) |
| `sexo`, `gender`, `sex` | **`lead_state.gender`** (parsed to `male`/`female`) |
| `tabaco`, `tobacco`, `smoker`, `is_smoker` | **`lead_state.is_smoker`** |
| `quote_low`, `quoteHigh`, etc. | `lead_state.quote_low` / `quote_high` |

**Response:** `success`, `created`, `updated`, `contact_id`, `subscriber_id`, `pipeline_stage`, `saved_fields`, `missing_fields`.

---

### `/api/lead-update` (POST) — ManyChat progress

**Request (from `api/lead-update.js`):**

| Request key(s) | Supabase target |
|----------------|-----------------|
| `phone` | Lookup `contacts` |
| `age` / `edad` | `lead_state.age` |
| `gender` / `sexo` / `sex` | `lead_state.gender` |
| `is_smoker` / `tabaco` / `tobacco` / `smoker` | `lead_state.is_smoker` |
| `coverage_amount`, `monthly_premium`, `quote_low`, `quote_high`, `pipeline_stage`, milestone timestamps, `whatsapp_drop_off` | `lead_state` columns |

**Response:** `{ success, contact_id, pipeline_stage }` (see file for exact shape).

---

### `/api/staff/leads`

**GET** `?id=<uuid>` (optional)

- **No `id`:** Response `{ items: [...] }` — each item mirrors `unified_leads` + enriched email; fields: `id`, `first_name`, `last_name`, `display_name`, `phone`, `email`, `language`, `source`, `source_table`, `created_at`, `updated_at`.
- **With `id`:** Response `{ detail, can_access_phi }`.

**`detail` object (merged):** Keys include at least: `id`, `source_table`, `read_only`, `first_name`, `last_name`, `display_name`, `phone`, `email`, `language`, `age`, **`sex`**, **`tobacco`**, `tag`, `pipeline_stage`, `drop_off`, `drop_off_stage`, `opt_in`, `opt_in_at`, `manychat_subscriber_id`, `created_at`, `updated_at`, `staff_hidden_at`, `profile_ext` (object), `phi` (object, if allowed), `contact_id`, `contacts_contact_id`, quote fields when merged, etc.

| API `detail` key | Typical Supabase origin |
|-------------------|-------------------------|
| `age`, `sex`, `tobacco` | `manychat_leads` OR `lead_state` (via merge) OR `staff_lead_profiles` OR product selector |
| `pipeline_stage` | Built from cross-source merge, then **canonical (`staff_lead_profiles`) overrides** non-blank source when `composeMergedLeadDetail` runs (`mergePreferCanonical`) |
| `profile_ext.state` | Canonical JSON; may sync from `contacts.us_state` in merges |
| `phi.*` | Decrypted from `lead_underwriting_phi` |

**POST** body: `name`, `email`, `phone`, `language` → creates **`manychat_leads`** row; returns `{ item }`.

**PATCH** body: `id` + any of `email`, `phone`, `language`, `first_name`, `last_name`, `age`, `sex`, `tobacco`, `tag`, `pipeline_stage`, `source`, `drop_off`, `drop_off_stage`, `opt_in`, `manychat_subscriber_id`, `phi`, `profile_ext`.  
Persists to **`staff_lead_profiles.profile_data`** (canonical merge) and **`lead_underwriting_phi`** when `phi` present — **does not** directly PATCH `manychat_leads` / `lead_state` in this handler (re-read merged row from DB for response).

**DELETE** query: `?id=` — hard-deletes source row and staff satellites (see `hardDeleteUnifiedSourceRow` in `api/staff/leads.js`).

---

### `/api/staff/oos-referrals`

| Method | Query / body | Response |
|--------|--------------|----------|
| GET | `?bucket=open\|completed` | `{ referrals, bucket }` — rows from `out_of_state_referrals` |
| PATCH | `?id=` + JSON body | Patches allowed columns per `api/staff/oos-referrals.js` (`first_name`, `last_name`, `email`, `phone`, `state_code`, `status`, `referral_context`, `ai_connection_email`, `compensation_notes`, `compensated_at`, `matched_oos_agent_id`) |
| DELETE | `?id=` | Hard delete row |

---

### `/api/staff/oos-agents`

GET / POST / PATCH — CRUD on `oos_agents` (see file for field names).

---

### `/api/staff/product-selector`

Large handler: GET loads session; POST/PATCH/PUT update `product_selector_sessions` (`qualification_answers`, `workflow_state`, etc.). See `api/staff/product-selector.js` near `req.method` checks.

---

## STAFF PORTAL UI BINDINGS (LEAD PROFILE)

Source: `staff/index.html` — `applyLeadProfileDetailToForm`, `serializeLeadProfileFromForm`, `buildLeadProfilePatchBody`.

### Section 1 — Identity

| UI label | Element ID | Reads API `detail` key | Writes PATCH / canonical key | Primary DB column(s) |
|----------|------------|------------------------|------------------------------|----------------------|
| Lead ID (read-only) | `lp-id` | `id` | — | `unified_leads.id` (source row PK) |
| First name | `lp-first-name` | `first_name` | `first_name` | `manychat_leads` / `contacts` / canonical |
| Last name | `lp-last-name` | `last_name` | `last_name` | same |
| Email | `lp-email` | `email` | `email` | same |
| Phone | `lp-phone` | `phone` | `phone` | same |
| Language | `lp-language` (+ `lp-language-en` / `lp-language-es` toggles) | `language` | `language` | `contacts.language` / `idioma` / `manychat_leads.language` |
| State | `lp-state` | `profile_ext.state` | `profile_ext.state` | **`contacts.us_state`** (merged into profile); not `lead_state` |

### Section 2 — Qualification essentials

| UI label | Element ID | Reads API `detail` key | Writes PATCH | DB / notes |
|----------|------------|------------------------|--------------|------------|
| Age | `lp-age` | `age` | `age` (number) | Canonical + merges from `lead_state.age` / `manychat_leads.age` |
| Birthdate | `lp-dob` | `profile_ext.date_of_birth` | `profile_ext.date_of_birth` | **`staff_lead_profiles.profile_data`** JSON only (not a dedicated `contacts` column) |
| Sex | `lp-sex` | **`sex`** | **`sex`** | Maps from `lead_state.gender` / `manychat_leads.sex` in API — UI **never** uses `gender` key |
| Tobacco | `lp-tobacco` | **`tobacco`** (bool → select string) | **`tobacco`** | Maps from `lead_state.is_smoker` / `manychat_leads.tobacco` |
| Living situation | `lp-living-situation` | `profile_ext.living_situation` | `profile_ext.living_situation` | Canonical JSON |
| Citizenship | `lp-citizenship-status` | `profile_ext.citizenship_status` | `profile_ext.citizenship_status` | Canonical JSON |
| Height | `lp-height` | `profile_ext.height` | `profile_ext.height` | Canonical JSON |
| Weight | `lp-weight` | `profile_ext.weight` | `profile_ext.weight` (number) | Canonical JSON |

---

## PHONE MATCHING RULES

### Last-10-digit rule

- **Postgres:** `contacts.phone_last_10` is **GENERATED STORED** as the last 10 characters of digits-only `phone` (`041_contacts_phone_last10.sql`).
- **JavaScript:** `lib/hubspot-phone-variants.js` → `phoneLast10Digits` strips non-digits, then if length > 10 takes **slice(-10)** (matches PG `RIGHT` behavior for longer strings).

**Why:** US numbers arrive as `+1402…`, `1402…`, or `402…`; comparing raw strings fails. Last-10 aligns national number with country-code variants.

**Where used (codebase):**
- `api/staff/leads.js` — `selectContactsRowsByPhone`, `enrichLeadEmailsFromContacts`, scoring `scoreContactForManychatLead`, `bestContactEmailForPhone`, `bestContactRowForPhone` (all use `phoneLast10Digits` and/or `phone_last_10.eq` PostgREST filter).
- `lib/hubspot-phone-variants.js` — definition + `hubspotPhoneSearchVariants` for alternate string forms (HubSpot / ManyChat).

**Other paths (not last-10):** `api/staff/questions.js` matches unanswered questions to `manychat_leads` / contacts using **`digitsOnly` full-string equality** on phone (`qPhoneDigits === cPhoneDigits`), plus WhatsApp / subscriber id string equality — not `phoneLast10Digits`.

**Additional matching:** `api/staff/leads.js` scoring uses exact digit-string equality and **WhatsApp / subscriber id** equality for bonus scoring (not last-10-only).

---

## KNOWN GOTCHAS

❌ **Wrong:** `lead_state` has a `us_state` column we can SELECT in API overlays.  
✅ **Right:** **Production `lead_state` has no `us_state`.** State lives on **`contacts.us_state`**. Querying `lead_state.us_state` makes PostgREST return 400 and **breaks** merging age/gender/smoker onto ManyChat-sourced leads (fixed in `selectLeadStatePipelineOverlay` in `api/staff/leads.js`).

❌ **Wrong:** Staff Lead Profile `PATCH` updates `manychat_leads.age` / `lead_state` inline like ManyChat webhooks.  
✅ **Right:** `PATCH /api/staff/leads` primarily updates **`staff_lead_profiles.profile_data`** (and **`phi`**). The **read path** merges canonical + `lead_state` + ManyChat; **`lead_state` may stay stale** until `/api/lead-update` or `/api/lead-intake` runs.

❌ **Wrong:** Use API field names `gender` and `is_smoker` because that is what Supabase stores.  
✅ **Right:** **`lead_state` stores `gender` and `is_smoker`**, but **`/api/staff/leads` uses `sex` and `tobacco`** end-to-end for the merged `detail` and PATCH body. ManyChat intake accepts **`is_smoker` / `tabaco`** and maps into **`lead_state.is_smoker`**.

❌ **Wrong:** `unified_leads.id` for a person is always `contacts.id`.
✅ **Right:** Unified row id is the **source table PK** (`manychat_leads.id`, `quote_lead_submissions.id`, `contacts.id`, …). Cross-source merge adds `contact_id` / `contacts_contact_id` on the API `detail` when linked.

❌ **Wrong:** The staff portal lead list uses `contacts.id` as the lead identifier.
✅ **Right:** The staff portal uses **`unified_leads`**, which points to **`manychat_leads.id`** as the source row (for ManyChat-sourced leads). **`contacts.id`** is linked as **`contacts_contact_id`** after the phone merge. Always use the **`unified_leads` id** when making API calls for a lead — never **`contacts.id`** directly.

❌ **Wrong:** `contacts.phone` uniqueness is optional.
✅ **Right:** Schema treats phone as identity; **`phone_last_10`** is for matching variants, not a substitute for business rules in `lib/contacts-db.js` / intake.

❌ **Wrong:** Core blueprint rule “Supabase is never overwritten.”  
✅ **Right:** **Staff hard-delete** and various PATCH flows **do** update or delete rows; **`events`** remains append-oriented. Read `api/staff/leads.js` `DELETE` and nurture code before assuming immutability.

---

## DATA FLOW — END TO END

```
1. LEAD ENTERS SYSTEM
   WhatsApp first message received
   → Vercel /api/lead-intake
   → Write to: contacts + lead_state + events (lead_created)
   → HubSpot: contact created + deal created in Stage 1

2. LEAD PROGRESSES THROUGH MANYCHAT FLOW
   Each step (language, age, smoker, gender, quote) triggers:
   → Vercel API update
   → events table: append new event
   → lead_state: update current snapshot + pipeline_stage
   → HubSpot: deal moves to correct stage

3. RAG QUESTION ASKED (off-script)
   → Default Reply fires (only if idioma has value)
   → RAG answers OR flags knowledge gap
   → If gap: knowledge_gaps table + email to Julie
   → If answered: events log (whatsapp_message_sent)

4. CALL SCHEDULED
   → lead_state: call_scheduled_at set
   → lead_state: pipeline_stage = 'call_scheduled'
   → events: call_scheduled appended
   → HubSpot: deal moved to Stage 5

5. CALL COMPLETED
   → Transcript stored in call_transcripts
   → AI summary generated
   → note added to notes table
   → lead_state: pipeline_stage updated
   → HubSpot: deal moved to Stage 6 or 7 or 8

6. ONGOING NURTURE
   → Pipeline stage determines email/text sequence
   → Every email/text logged in events table
   → All interactions documented with timestamp
```

---

## VERCEL API ROUTES NEEDED (ORIGINAL CHECKLIST)

| Route | Purpose |
|---|---|
| `POST /api/lead-intake` | Receive new lead from ManyChat |
| `POST /api/lead-update` | Update lead as they progress through flow |
| `POST /api/knowledge-gap` | Store unanswered RAG question + notify Julie |
| `GET /api/julie-review` | Julie's approval form (internal only) |
| `POST /api/julie-decision` | Submit Julie's KB decision |
| `POST /api/hubspot-sync` | Push contact + deal to HubSpot |
| `POST /api/call-transcript` | Store call recording + transcript |

*(Additional production routes are listed in **API FIELD NAME REFERENCE** above.)*

---

## FUTURE EXTENSIONS (NOT NOW)

- **Lead scoring** — when calendar is full, score determines who gets scheduled
- **Analytics layer** — conversion rates per source, funnel performance, cost per sale
- **Facebook Ads tracking** — connect ad spend to lead outcomes
- **Multi-state expansion** — add state-tagged KB content, no architecture changes needed
- **AI call analysis** — pattern detection across call transcripts

---

## KEY DESIGN PRINCIPLES

1. **Phone first** — WhatsApp number is identity. Everything else is optional at first.
2. **Never overwrite history** — events table is append-only, always.
3. **Every lead in HubSpot** — no filtering at entry. Stage determines treatment.
4. **Stage = email sequence** — pipeline stage is what determines nurture track.
5. **Supabase is truth** — HubSpot is always derived from Supabase data.
6. **RAG never quotes** — quotes come from MVI Chatflow only, never from AI.
7. **State-aware KB** — Nebraska users get NE content, others get general only.
8. **Julie is the closer** — goal of every stage is to get the lead to schedule with Julie.
