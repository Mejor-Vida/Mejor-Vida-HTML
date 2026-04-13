# Mejor Vida Insurance — Database Blueprint
**Version 1.0 | April 2026**

---

## ARCHITECTURE OVERVIEW

The system operates across three distinct layers, each with a single responsibility:

| Layer | Tool | Role |
|---|---|---|
| **Memory** | Supabase | Permanent source of truth — everything that has ever happened |
| **Brain** | Vercel (API routes) | All business logic and decision-making |
| **Sales View** | HubSpot | Clean pipeline — qualified leads and active deals only |

**Core Rules:**
1. Supabase is never overwritten — events are always appended, never deleted
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

---

## DATABASE TABLES

### 1. `contacts`
One row per real person. Phone number is the unique identifier.

```sql
CREATE TABLE contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           TEXT UNIQUE NOT NULL,        -- WhatsApp number, primary ID
  full_name       TEXT,                         -- From ManyChat if available
  email           TEXT,                         -- Optional, collected later
  language        TEXT,                         -- 'english' | 'spanish'
  source          TEXT DEFAULT 'whatsapp',      -- 'whatsapp' | 'facebook' | 'website' | 'referral'
  whatsapp_id     TEXT,                         -- ManyChat contact ID
  us_state        TEXT DEFAULT 'NE',            -- State for KB filtering
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2. `lead_state`
Current snapshot of where the lead is right now. One row per contact. Updated as they progress. This is what the system reads to make decisions.

```sql
CREATE TABLE lead_state (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id            UUID REFERENCES contacts(id) ON DELETE CASCADE,
  pipeline_stage        TEXT NOT NULL DEFAULT 'new_contact',
                        -- 'new_contact' | 'engaged' | 'partially_qualified'
                        -- 'quoted' | 'call_scheduled' | 'call_completed'
                        -- 'policy_issued' | 'closed_lost'
  whatsapp_drop_off     TEXT,                   -- Last completed step in ManyChat flow
  -- Questionnaire data
  age                   INTEGER,
  is_smoker             BOOLEAN,
  gender                TEXT,                   -- 'male' | 'female'
  coverage_amount       INTEGER,                -- Requested coverage in dollars
  monthly_premium       NUMERIC(10,2),          -- Calculated quote amount
  quote_generated_at    TIMESTAMPTZ,
  -- Journey milestones
  language_picked_at    TIMESTAMPTZ,
  questions_completed_at TIMESTAMPTZ,
  call_scheduled_at     TIMESTAMPTZ,
  call_completed_at     TIMESTAMPTZ,
  policy_issued_at      TIMESTAMPTZ,
  -- HubSpot sync
  hubspot_contact_id    TEXT,                   -- Stored after HubSpot sync
  hubspot_deal_id       TEXT,                   -- Stored after deal created
  hubspot_synced_at     TIMESTAMPTZ,
  -- Activity tracking
  last_activity_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3. `events`
Append-only audit trail. Nothing is ever deleted from this table. This is the complete memory of everything that has ever happened with every lead.

```sql
CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id    UUID REFERENCES contacts(id) ON DELETE CASCADE,
  event_type    TEXT NOT NULL,
  event_data    JSONB DEFAULT '{}',
  channel       TEXT DEFAULT 'whatsapp',        -- 'whatsapp' | 'email' | 'phone' | 'website'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**Valid event_type values:**
```
lead_created              -- First message received
language_selected         -- Picked English or Spanish
age_answered              -- Answered age question
smoker_answered           -- Answered smoker question
gender_answered           -- Answered gender question
coverage_selected         -- Chose coverage amount
quote_generated           -- Quote calculated and sent
call_scheduled            -- Booked appointment with Julie
call_completed            -- Call happened
call_no_show              -- Did not attend scheduled call
email_sent                -- Nurture email delivered
sms_sent                  -- Text message sent
stage_changed             -- Pipeline stage updated (includes old + new stage in event_data)
knowledge_gap_flagged     -- RAG could not answer a question
whatsapp_message_received -- Incoming WhatsApp message logged
whatsapp_message_sent     -- Outgoing WhatsApp message logged
note_added                -- Julie or system added a note
policy_issued             -- Policy purchased
deal_closed_lost          -- Lead marked as not interested
hubspot_synced            -- Contact/deal pushed to HubSpot
```

---

### 4. `call_transcripts`
Stores transcripts and recordings of all calls with Julie. Linked to the contact. AI summary generated automatically.

```sql
CREATE TABLE call_transcripts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID REFERENCES contacts(id) ON DELETE CASCADE,
  call_date       TIMESTAMPTZ NOT NULL,
  duration_secs   INTEGER,                      -- Call length in seconds
  recording_url   TEXT,                         -- Link to recording file
  transcript_text TEXT,                         -- Full transcript
  ai_summary      TEXT,                         -- Auto-generated summary
  call_outcome    TEXT,                         -- 'policy_issued' | 'follow_up_needed'
                                                -- | 'not_interested' | 'no_show'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5. `notes`
Human-entered (Julie) or AI-generated notes attached to a contact. Visible in their lead profile.

```sql
CREATE TABLE notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id    UUID REFERENCES contacts(id) ON DELETE CASCADE,
  note          TEXT NOT NULL,
  note_type     TEXT DEFAULT 'manual',          -- 'manual' | 'ai_summary' | 'system'
  created_by    TEXT DEFAULT 'julie',           -- 'julie' | 'system' | 'ai'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6. `knowledge_chunks` *(existing table — needs update)*
The RAG knowledge base. Needs a `state` column added for state-based filtering. Nebraska-specific content is tagged `'NE'`. Content valid everywhere is tagged `'general'`.

```sql
-- Add to existing table:
ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS us_state TEXT DEFAULT 'general';
  -- 'general' | 'NE' | 'CA' | 'TX' (expand as licensed in new states)
ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS kb_language TEXT DEFAULT 'both';
  -- 'english' | 'spanish' | 'both'

-- RAG query filter logic:
-- WHERE us_state IN ('general', 'NE')   ← for Nebraska users
-- WHERE us_state = 'general'            ← for non-Nebraska users
```

**State-based KB rules:**
- Nebraska users → see `general` + `NE` tagged content
- Out-of-state users → see `general` content only
- No pricing, quotes, or state-specific product info from RAG — ever
- Expanding to new state → add new chunks tagged to that state, existing system requires no changes

---

### 7. `knowledge_gaps` *(existing table — needs enhancement)*
Stores questions the RAG system could not answer. Triggers Julie notification workflow.

```sql
-- Enhance existing table with these columns if not present:
ALTER TABLE knowledge_gaps ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);
ALTER TABLE knowledge_gaps ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE knowledge_gaps ADD COLUMN IF NOT EXISTS us_state TEXT DEFAULT 'NE';
ALTER TABLE knowledge_gaps ADD COLUMN IF NOT EXISTS julie_notified_at TIMESTAMPTZ;
ALTER TABLE knowledge_gaps ADD COLUMN IF NOT EXISTS julie_decision TEXT;
  -- NULL (pending) | 'add_to_kb' | 'do_not_add'
ALTER TABLE knowledge_gaps ADD COLUMN IF NOT EXISTS julie_answer TEXT;
ALTER TABLE knowledge_gaps ADD COLUMN IF NOT EXISTS julie_decided_at TIMESTAMPTZ;
ALTER TABLE knowledge_gaps ADD COLUMN IF NOT EXISTS added_to_kb_at TIMESTAMPTZ;
ALTER TABLE knowledge_gaps ADD COLUMN IF NOT EXISTS kb_chunk_id UUID;
  -- FK to knowledge_chunks once added
```

**Knowledge Gap Workflow:**
```
1. RAG cannot answer user question
2. Question stored in knowledge_gaps table
3. Email sent to whatsapp@mejorvidainsurance.com with:
   - The question
   - User's WhatsApp number
   - Conversation context
   - Link to simple approval form (Vercel internal page)
4. Julie answers user directly on WhatsApp
5. Julie submits answer via approval form:
   - Pastes her answer
   - Clicks "Add to KB" or "Don't Add"
6. If "Add to KB":
   - Answer cleaned of personal data
   - Formatted as neutral FAQ entry
   - Auto-ingested into knowledge_chunks
   - Tagged with correct state + language
7. knowledge_gaps row updated with julie_decision + timestamp
```

---

### 8. `webhook_logs`
Logs all incoming webhooks for debugging. Never deleted.

```sql
CREATE TABLE webhook_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source          TEXT,                         -- 'manychat' | 'hubspot' | 'calendly'
  endpoint        TEXT,                         -- Which Vercel route received it
  payload         JSONB,                        -- Raw incoming data
  status          TEXT DEFAULT 'received',      -- 'received' | 'processed' | 'failed'
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 9. `api_ingestion_log`
Logs all outgoing API calls (to HubSpot, ManyChat, etc.) for debugging and auditing.

```sql
CREATE TABLE api_ingestion_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination     TEXT,                         -- 'hubspot' | 'manychat' | 'openai'
  endpoint        TEXT,
  method          TEXT,
  request_body    JSONB,
  response_status INTEGER,
  response_body   JSONB,
  duration_ms     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## DATA FLOW — END TO END

```
1. LEAD ENTERS SYSTEM
   WhatsApp first message received
   → Vercel /api/lead-intake
   → Write to: contacts + lead_state + events (lead_created)
   → HubSpot: contact created + deal created in Stage 1

2. LEAD PROGRESSES THROUGH MANCYCHAT FLOW
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

## VERCEL API ROUTES NEEDED

| Route | Purpose |
|---|---|
| `POST /api/lead-intake` | Receive new lead from ManyChat |
| `POST /api/lead-update` | Update lead as they progress through flow |
| `POST /api/knowledge-gap` | Store unanswered RAG question + notify Julie |
| `GET /api/julie-review` | Julie's approval form (internal only) |
| `POST /api/julie-decision` | Submit Julie's KB decision |
| `POST /api/hubspot-sync` | Push contact + deal to HubSpot |
| `POST /api/call-transcript` | Store call recording + transcript |

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
