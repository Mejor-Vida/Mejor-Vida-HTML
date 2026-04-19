# CURSOR PROMPT: Mejor Vida Insurance — Backend Setup

Copy everything below this line and paste it into Cursor as your prompt.

---

## PROJECT OVERVIEW

I'm building a WhatsApp chatbot for Mejor Vida Insurance using ManyChat. The chatbot collects lead information and needs a backend to store leads, answer questions using RAG, and sync with HubSpot CRM.

I need you to set up the full backend. Here's what I need:

## 1. PROJECT SETUP

- Create a new **private GitHub repo** called `mejor-vida-backend` (or use my existing one if I already have it)
- Set up a **Vercel project** using **Node.js runtime** (NOT Edge) with the following structure:

```
mejor-vida-backend/
├── api/
│   ├── lead-capture.js          # Phase 3: Save lead to Supabase + HubSpot
│   ├── rag-answer.js            # Phase 4: RAG Q&A for off-script questions
│   └── dropoff-capture.js       # Drop-off: Capture partial leads
├── lib/
│   ├── supabase.js              # Supabase client helper
│   ├── hubspot.js               # HubSpot client helper
│   └── openai.js                # OpenAI client helper
├── .env.example                 # Template for environment variables
├── .gitignore                   # Ignore .env, node_modules
├── package.json
├── vercel.json
└── README.md
```

## 2. ENVIRONMENT VARIABLES

Create a `.env.example` with these (NO actual values — just placeholders):

```
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# HubSpot
HUBSPOT_ACCESS_TOKEN=your_hubspot_private_app_token

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# ManyChat Webhook Security
MANYCHAT_WEBHOOK_SECRET=your_webhook_secret
```

**IMPORTANT:** Check my existing Vercel project — I may already have some of these env vars set up (especially HubSpot). Don't overwrite anything that exists.

## 3. SUPABASE SCHEMA

### Leads table (`leads`)

```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT,
  phone TEXT,
  email TEXT,
  age INTEGER,
  sex TEXT,
  tobacco BOOLEAN,
  language TEXT DEFAULT 'English',
  tag TEXT DEFAULT 'Lead_NE',
  pipeline_stage TEXT DEFAULT 'new',
  source TEXT DEFAULT 'whatsapp',
  drop_off BOOLEAN DEFAULT false,
  drop_off_stage TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Only service role can write
CREATE POLICY "Service role full access" ON leads
  FOR ALL USING (auth.role() = 'service_role');
```

### Check for existing RAG table

I may already have a RAG table in Supabase for carrier/marketing content. Look for tables that have columns like `content`, `embedding`, `metadata`, or `chunk`. If one exists, use it. If not, create one:

```sql
CREATE TABLE rag_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON rag_documents
  FOR ALL USING (auth.role() = 'service_role');

-- Index for vector similarity search
CREATE INDEX ON rag_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Unanswered questions table (`unanswered_questions`)

For tracking questions the AI couldn't answer (Phase 4, NO_ANSWER scenario):

```sql
CREATE TABLE unanswered_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  phone TEXT,
  question TEXT NOT NULL,
  language TEXT,
  flow_stage TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. API ROUTES

### A. `/api/lead-capture.js` — Phase 3: Lead Capture

**Called by:** ManyChat External Request after user provides email (Box 12)

**Security:** Verify `X-App-Secret` header matches `MANYCHAT_WEBHOOK_SECRET`. Return 401 if mismatch.

**Input (JSON body from ManyChat):**
```json
{
  "first_name": "Carlos",
  "phone": "+14025551234",
  "email": "carlos@email.com",
  "age": 55,
  "sex": "Male",
  "tobacco": false,
  "language": "Spanish"
}
```

**What it does:**
1. Verify webhook secret
2. In parallel:
   - **Supabase:** Insert into `leads` table with tag `Lead_NE`, pipeline_stage `qualified`
   - **HubSpot:** Create or update contact using the HubSpot Contacts API. Map fields: firstname, phone, email, and set custom properties for age, sex, tobacco, language if they exist in HubSpot (don't fail if custom properties don't exist yet)
3. Return `{ "success": true, "lead_id": "uuid" }` to ManyChat

### B. `/api/rag-answer.js` — Phase 4: RAG Q&A

**Called by:** ManyChat External Request when user asks an off-script question

**Security:** Verify `X-App-Secret` header.

**Input (JSON body from ManyChat):**
```json
{
  "question": "does this cover diabetes?",
  "language": "English",
  "phone": "+14025551234",
  "flow_stage": "box_9"
}
```

**What it does:**
1. Verify webhook secret
2. Generate embedding for the question using OpenAI `text-embedding-3-small`
3. Query Supabase RAG table for top 3 most similar chunks using vector similarity search
4. If similarity score is too low (below 0.7 threshold), return NO_ANSWER
5. Send the chunks + question to OpenAI `gpt-4o-mini` with this system prompt:

```
You are Julie's virtual assistant at Mejor Vida Insurance. You are friendly, polite, and conversational.

STRICT RULES:
- ONLY answer using the provided context below.
- If the context does not contain enough information to answer confidently, respond with exactly: NO_ANSWER
- Match the user's language (English or Spanish)
- Keep it short and conversational — 2-3 sentences max
- Never make up information, never guess, never hallucinate
```

6. If OpenAI returns `NO_ANSWER`:
   - Save the question to `unanswered_questions` table in Supabase
   - Optionally create a HubSpot task for follow-up
   - Return `{ "answer": null, "status": "no_answer" }`

7. If OpenAI returns an answer:
   - Return `{ "answer": "Yes, most plans do cover...", "status": "answered" }`

### C. `/api/dropoff-capture.js` — Drop-Off Capture

**Called by:** ManyChat after 10 minutes of no response (via Smart Delay + External Request)

**Security:** Verify `X-App-Secret` header.

**Input (JSON body from ManyChat):**
```json
{
  "first_name": "Carlos",
  "phone": "+14025551234",
  "language": "Spanish",
  "drop_off_stage": "box_9"
}
```

**What it does:**
1. Verify webhook secret
2. Check if lead already exists in Supabase (by phone number) — if they already completed the flow and were captured, skip
3. If not already captured:
   - **Supabase:** Insert into `leads` with `drop_off: true`, `drop_off_stage: "box_9"`, `tag: "Lead_DropOff"`, `pipeline_stage: "dropped"`
   - **HubSpot:** Create or update contact with lifecycle stage set appropriately for a drop-off lead
4. Return `{ "success": true }`

## 5. SHARED HELPERS (in `/lib/`)

### `supabase.js`
- Create Supabase client using service role key
- Export helper functions: `insertLead()`, `searchRAG()`, `saveUnansweredQuestion()`, `checkExistingLead()`

### `hubspot.js`
- Create HubSpot client using access token
- Export helper functions: `createOrUpdateContact()`
- Handle the case where custom properties (age, sex, tobacco) don't exist yet in HubSpot — don't fail, just skip those fields

### `openai.js`
- Create OpenAI client
- Export helper functions: `generateEmbedding()`, `getRAGAnswer()`

## 6. SECURITY

- **Every API route** must check `X-App-Secret` header first. Return 401 immediately if it doesn't match.
- **Never log sensitive data** (API keys, full phone numbers) in console
- **Rate limiting:** Add basic rate limiting if Vercel supports it, or at minimum log requests for monitoring
- **CORS:** Only allow requests from ManyChat's known IP ranges if possible, otherwise restrict to POST only

## 7. TESTING

Create a simple test script or instructions so I can test each endpoint with curl:

```bash
# Test lead capture
curl -X POST https://your-vercel-url.vercel.app/api/lead-capture \
  -H "Content-Type: application/json" \
  -H "X-App-Secret: your_secret" \
  -d '{"first_name":"Test","phone":"+10000000000","email":"test@test.com","age":55,"sex":"Male","tobacco":false,"language":"English"}'

# Test RAG answer
curl -X POST https://your-vercel-url.vercel.app/api/rag-answer \
  -H "Content-Type: application/json" \
  -H "X-App-Secret: your_secret" \
  -d '{"question":"does this cover diabetes?","language":"English","phone":"+10000000000","flow_stage":"box_9"}'

# Test drop-off capture
curl -X POST https://your-vercel-url.vercel.app/api/dropoff-capture \
  -H "Content-Type: application/json" \
  -H "X-App-Secret: your_secret" \
  -d '{"first_name":"Test","phone":"+10000000000","language":"English","drop_off_stage":"box_9"}'
```

## 8. DEPLOYMENT

- Connect GitHub repo to Vercel for auto-deploy on push
- Set all environment variables in Vercel dashboard
- Make sure `.env` is in `.gitignore` — never commit API keys
- After deploy, test all 3 endpoints with curl commands above

## 9. QUOTE ENGINE (`/api/quote.js`)

### Overview
Deterministic quote lookup — NO AI involved. ManyChat sends age, sex, and smoker status; the endpoint returns a Low/High/Anchor price range from the `quote_ranges` Supabase table.

**Carriers included:** Mutual of Omaha (Living Promise) + American Amicable (GS)
**Assurity:** Excluded from quoting (RAG knowledge base only)
**Coverage:** $10,000 face amount. Prices scale proportionally for other amounts.

### How the ranges work
- **Low** = cheapest good-health (Level/Immediate) monthly premium across both carriers
- **High** = cheapest bad-health (Graded) monthly premium across both carriers
- **Anchor** = midpoint of Low and High
- No health questions asked. No carrier names shown to user.

### Table: `quote_ranges`
```sql
CREATE TABLE quote_ranges (
  id          serial PRIMARY KEY,
  age         smallint     NOT NULL,           -- 45-85
  sex         text         NOT NULL,           -- 'male' or 'female'
  smoker      boolean      NOT NULL DEFAULT false,
  low         numeric(7,2) NOT NULL,           -- cheapest good-health monthly ($10K)
  high        numeric(7,2) NOT NULL,           -- cheapest bad-health monthly ($10K)
  anchor      numeric(7,2) NOT NULL,           -- midpoint
  created_at  timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (age, sex, smoker)
);
```
164 rows, seeded via migration `014_quote_ranges.sql`.

### Endpoint: `POST /api/quote`
**Called by:** ManyChat External Request after collecting age, sex, smoker

**Security:** `X-App-Secret` header (same as other endpoints)

**Input:**
```json
{ "age": 65, "sex": "male", "smoker": "no" }
```

**Response (ManyChat custom fields):**
```json
{
  "version": "v2",
  "content": {
    "type": "show_dynamic_block",
    "messages": [],
    "set_field_values": [
      { "field_name": "quote_low",    "value": "$56.48" },
      { "field_name": "quote_high",   "value": "$68.44" },
      { "field_name": "quote_anchor", "value": "$62.46" },
      { "field_name": "quote_status", "value": "ok" }
    ]
  }
}
```

**Edge cases:**
- Age < 45 or > 85 → `quote_status: "out_of_range"` with message
- Missing/invalid sex → `quote_status: "error"` with message
- No data found → `quote_status: "no_data"`

### Key data notes
- MOO age range: 45-85. MOO graded plan is **non-tobacco only**.
- AmAm age range: 50-85. AmAm smoker rates are **identical** to non-smoker rates (verified).
- Ages 45-49 have MOO data only (AmAm starts at 50).
- For smokers needing graded (bad health): only AmAm graded is available (MOO graded = non-tobacco only).

### ManyChat custom fields needed
Create these in ManyChat before connecting:
- `quote_low` (text)
- `quote_high` (text)
- `quote_anchor` (text)
- `quote_status` (text) — "ok", "out_of_range", "no_data", "error"
- `quote_error` (text) — human-readable error message

### Test
```bash
curl -X POST https://your-vercel-url.vercel.app/api/quote \
  -H "Content-Type: application/json" \
  -H "X-App-Secret: your_secret" \
  -d '{"age":65,"sex":"male","smoker":"no"}'
```

## IMPORTANT NOTES

- Use **Node.js runtime** for all functions, NOT Edge runtime. Edge will be used later for the live quote engine only.
- All functions should handle errors gracefully — return proper error messages, never crash
- Keep responses fast — ManyChat has a 10-second timeout. The RAG function is the slowest (embedding + vector search + OpenAI), so optimize where possible.
- Use `Promise.all()` to run Supabase and HubSpot writes in parallel wherever possible
