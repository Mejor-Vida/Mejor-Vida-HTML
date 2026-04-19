# MEJOR VIDA: FULL CHAT WORKFLOW BLUEPRINT

_Last updated: 2026-04-08. Reference this file at the start of every session._

---

## OVERVIEW

A WhatsApp chatbot powered by "Julie" and her virtual assistant — a friendly, polite insurance helper. Five phases:
1. Language selection + Nebraska filter
2. Data collection + lead capture + range + scheduler (includes the close)
3. Invisible lead sync → Vercel → Supabase + HubSpot
4. Smart AI safety net — RAG answers from Supabase + flow recovery (mid-flow + post-flow)
5. Priority keyword fast-track to scheduler

---

## ENTRY POINT

Two sources feed into the same flow:
1. **Facebook Ads** → Click-to-WhatsApp → pre-written message appears → user hits Send → triggers flow. Ads are geo-targeted to Nebraska but not exclusively.
2. **Website** (mejorvidainsurance.com) → WhatsApp button → same flow. Website gets traffic from all over the USA.

Because of the website traffic, the Nebraska filter (Phase 1) is essential — not everyone will be from Nebraska.

---

## PHASE 1: LANGUAGE SELECTION + NEBRASKA FILTER (FINAL COPY — approved by ChatGPT rewrite)

### Box 1 — Language Selection (ONE single bilingual message)

> "¡Hola! Bienvenido a Mejor Vida Insurance 😊 Vamos a comenzar — elige tu idioma aquí abajo.
>
> Hi! Welcome to Mejor Vida Insurance 😊 Let's get you started — choose your language below."

Buttons:
- 🇲🇽 Español
- 🇺🇸 English

Everything after this point is delivered in the chosen language.

---

### Box 2 — Julie's Welcome + State Question

English:
> "Hey! I'm Julie from Mejor Vida Insurance 😊 I help families find affordable coverage that actually fits their needs.
> Quick question — what state are you in?"

Spanish:
> "¡Hola! Soy Julie de Mejor Vida Insurance 😊 Ayudo a familias a encontrar cobertura que sí se ajuste a su presupuesto y necesidades.
> Una preguntita — ¿en qué estado estás?"

Buttons:
- Nebraska
- Other State / Otro Estado

Logic:
- Nebraska → Tag `Lead_NE` → Phase 2
- Other State → Box 3 (Other State Path)

---

### Box 3 — Other State Offer

English:
> "Got it! I'm currently licensed in Nebraska, but I do work with trusted agents across the country.
> Would you like me to connect you with someone in your area?"

Spanish:
> "Perfecto. Por ahora solo tengo licencia en Nebraska, pero trabajo con agentes de confianza en todo el país.
> ¿Te gustaría que te conecte con alguien en tu área?"

Buttons:
- Yes, please! / ¡Sí, por favor!
- No thanks / No, gracias

---

### Box 4a — Other State YES — Collect Name

English: "Awesome! What's your name?"
Spanish: "¡Perfecto! ¿Cómo te llamas?"

### Box 5a — Collect Email

English: "And what's the best email to reach you?"
Spanish: "¿Cuál es el mejor correo electrónico para contactarte?"

*(Phone is already captured automatically from WhatsApp — no need to ask.)*

### Box 6a — Goodbye + Send to referrals@

Action: Send name, email, phone (from WhatsApp) to `referrals@mejorvidainsurance.com` via existing Google Apps Script alias.

English:
> "Perfect, thank you! 🙌 I'll have someone reach out to you soon.
> If you ever need anything else, I'm always here 😊"

Spanish:
> "¡Perfecto, gracias! 🙌 Alguien se comunicará contigo muy pronto.
> Y si necesitas algo más, aquí estoy para ayudarte 😊"

---

### Box 4b — Other State NO — Goodbye

English: "No worries at all! If anything comes up in the future, feel free to reach out 😊"
Spanish: "¡No hay problema! Si en el futuro necesitas algo, solo déjame saber 😊"

---

## PHASE 2: DATA COLLECTION + LEAD CAPTURE + RANGE + SCHEDULER (FINAL COPY — approved by ChatGPT rewrite)

**Goal:** Collect age, sex, tobacco → capture name & email (lead secured) → show price range → push for scheduler (main goal). Lead is captured BEFORE the quote, so scheduler is pure upside.

**Flow order:** Qualify → Name → Email → Quote → Schedule

---

### Box 8 — Age (Nebraska path continues here)

User types their age. ManyChat validates: 2-digit number, 40–85. If invalid → error message asking them to try again.

English:
> "Alright 😊 let's start putting some options together for you
> When you have a second, could you let me know how old you are?"

Spanish:
> "Perfecto 😊 vamos a empezar a ver qué opciones pueden funcionar para ti
> Cuando puedas, ¿me podrías compartir cuántos años tienes?"

---

### Box 9 — Sex

Buttons: Male / Female (English) | Hombre / Mujer (Spanish)

English:
> "Perfect, thank you — that really helps
> And just to make sure I'm looking at the right options for you, would you mind letting me know if you're male or female?"

Spanish:
> "Perfecto, gracias — eso me ayuda mucho
> Y para asegurarme de ver bien las opciones para ti, ¿me podrías indicar si eres hombre o mujer?"

---

### Box 10 — Tobacco

Buttons: Yes / No (English) | Sí / No (Spanish)

English:
> "Got it. One more quick question before I check everything for you — do you currently use any tobacco products?"

Spanish:
> "Perfecto. Una pregunta más antes de revisar todo para ti — ¿actualmente usas algún producto de tabaco?"

---

### Box 11 — Name (casual, after qualification)

User types first name.

English:
> "By the way, I didn't catch your first name 😊 What's your first name?"

Spanish:
> "Por cierto, no alcancé a ver tu nombre 😊 ¿Cuál es tu nombre?"

---

### Box 12 — Use name + ask for email (with reason)

User types email. **At this point → triggers Phase 3: invisible lead capture + admin alert.** We now have name, phone (from WhatsApp), and email — full lead secured.

English:
> "Nice to meet you, {{first_name}} 😊
> I'll put together a few options for you, and I can send them over so you have everything in one place. What's the best email to send that to?"

Spanish:
> "Mucho gusto, {{first_name}} 😊
> Voy a prepararte unas opciones y te las puedo enviar para que tengas todo en un solo lugar. ¿Cuál es el mejor correo para mandártelo?"

---

### Box 13 — The Range (personalized with name)

Static placeholder: $35–$85/mo for $10,000 coverage. Will be replaced with live quotes when quote API is decided.

English:
> "Alright {{first_name}}, based on what you shared with me, most people in a similar situation are usually somewhere around $35–$85 per month for about $10,000 in coverage.
> The exact number just depends on a couple of details, which I can walk you through really quickly."

Spanish:
> "Bueno {{first_name}}, con lo que me compartiste, la mayoría de las personas en una situación similar están más o menos entre $35–$85 al mes por unos $10,000 de cobertura.
> El precio exacto depende de algunos detalles que puedo explicarte rápidamente."

---

### Box 14 — Push for Scheduler (MAIN GOAL)

English:
> "The easiest way to make sure you get the best option is to go over it together on a quick call — it usually only takes about 10 minutes.
> You can pick a time that works best for you here 👇"

Spanish:
> "La forma más fácil de asegurarnos de encontrar la mejor opción para ti es revisarlo juntos en una llamada rápida — normalmente toma unos 10 minutos.
> Puedes elegir el horario que mejor te funcione aquí 👇"

Buttons:
- **Schedule my call** / **Agendar mi llamada** → HubSpot Power Link: `https://meetings.hubspot.com/mejorvidainsurance?email={{user_email}}&phone={{phone}}&firstname={{first_name}}` (pre-fills their info, they just pick a time)
- **I need to think about it** / **Necesito pensarlo** → Box 15

---

### Box 15 — Scheduler declined → Friendly close (lead already captured)

Since we already have name, phone, and email, this is just a warm goodbye. The lead is in the funnel either way.

English:
> "No problem at all, {{first_name}} 😊
> I'll send everything over to your email so you can take a look when you have time. And if you have any questions, feel free to message me anytime — I'm happy to help."

Spanish:
> "No te preocupes, {{first_name}} 😊
> Te voy a enviar todo por correo para que lo puedas revisar con calma. Y si tienes alguna pregunta, puedes escribirme cuando quieras — con gusto te ayudo."

---

**Why this flow works:**
- Lead is captured BEFORE the quote (name + phone + email)
- Every message gives context, asks, then moves forward — feels like real conversation
- Scheduler push is pure upside — you already own the lead regardless
- No surveys, no scripts, just someone guiding them step by step

---

## PHASE 3: THE INVISIBLE CAPTURE & LEAD SYNC (FINAL — approved)

**Goal:** Store the full lead and sync to CRM — invisibly, while Julie keeps talking.

**Trigger:** User types email in Box 12.

**What happens (user sees nothing):**

ManyChat fires an External Request to a **Vercel Function (Node.js runtime)**, which does two things in parallel:

1. **Supabase** — writes to `manychat_leads` table:
   - first_name, phone (from WhatsApp `{{phone}}`), email, age, sex, tobacco, language (English/Spanish), tag (`Lead_NE`), pipeline_stage (`qualified`), timestamp

2. **HubSpot** — creates/updates contact with the same data (custom fields: age, gender, tobacco_user, preferred_language)
   - HubSpot's built-in notifications alert admin automatically when a new lead is created

**API endpoint:** `POST https://<vercel-domain>/api/lead-capture`
**Security:** ManyChat sends `X-App-Secret` header verified against `MANYCHAT_WEBHOOK_SECRET`

**Admin alert:** Handled by HubSpot's native new-contact notification — no custom email needed from Vercel.

**After this fires:** Julie continues straight to Box 13 (the range). Zero delay for the user.

---

### FUTURE: Lead Nurturing Email (TBD — depends on HubSpot pipeline setup)

A follow-up email should be sent to the lead after their info is stored. Details TBD until HubSpot deal stages/pipeline are configured.

**What we know so far:**
- **Sent to:** lead's email (captured in Box 12)
- **Should include:** their quote range, what happens next, how to schedule if they change their mind
- **Tone:** still Julie — warm, conversational, not a corporate drip email
- **Future:** content should match the lead's deal stage / funnel position in HubSpot
- **Build this when:** HubSpot pipeline and deal stages are set up

---

## PHASE 4: SMART SAFETY NET — AI ANSWERS + FLOW RECOVERY (FINAL — approved)

**Goal:** Handle off-script input mid-flow and post-flow. Never hallucinate — only answer from Supabase data. Always return to the scripted flow.

**IMPORTANT — Bot persona:** The chatbot is **Julie's virtual assistant**, NOT Julie herself. This creates a natural distinction so when the assistant says "I'll send this to Julie," the user understands there's a real person (Julie) behind the scenes who will follow up. Julie is the licensed agent; the bot is her helpful, polite assistant.

---

### HOW IT WORKS: Three scenarios when user goes off-script

**Scenario 1 — Wrong format answer (NOT a question)**
Example: Box 8 asks for age, user types "sixty two" instead of "62"

- ManyChat validation catches it
- Julie gently corrects: "Oops! Can you type that as a number? Like 62"
- **3 tries max.** After 3 failed attempts → safety valve:
  > "No worries! Let me get Julie to help you directly."
  > → HubSpot scheduler link

**Scenario 2 — Actual question mid-flow**
Example: Box 9 asks male/female, user types "does this cover diabetes?"

- ManyChat detects it's a question (contains ?, or starts with who/what/when/where/why/how/does/can/is)
- Fires External Request to `POST https://<vercel-domain>/api/rag-answer` (Node.js):
  1. Vercel generates embedding, then queries **Supabase `knowledge_chunks`** table via `match_knowledge_chunks` RPC (cosine similarity ≥ 0.7)
  2. Sends top 3 matching chunks + question to **OpenAI `gpt-4o-mini`** with strict prompt:
     - *"You are Julie's virtual assistant at Mejor Vida Insurance. You are friendly, polite, and conversational. Only answer using the provided context. If the context does not contain enough information to answer confidently, respond with NO_ANSWER. Match the user's language (English or Spanish). Keep it short and conversational."*
  3. **If answer found** → assistant answers the question, then resumes the scripted flow
  4. **If NO_ANSWER** → assistant says: "That's a really good question — I don't want to guess on that. I'll send it over so Julie can take a look 👍 For now, let's keep going —" → unanswered question flagged in Supabase/HubSpot for real Julie to follow up → scripted flow resumes

**Scenario 3 — Question after scripted flow is complete (Default Reply)**
- Same RAG pipeline as Scenario 2
- If answer found → Julie answers
- If NO_ANSWER → safety valve:
  > "That's a really good question — I want to make sure I get that 100% right for you. Want to hop on a quick call so I can look into it personally?"
  > Buttons: **Schedule a call** / **Agendar una llamada** → HubSpot scheduler | **I'm okay for now** / **Estoy bien por ahora** → friendly close

---

### KEY RULES

- **Zero hallucination policy:** OpenAI ONLY uses context from Supabase. No guessing, no making things up.
- **Only questions trigger Vercel.** Wrong-format answers are handled locally by ManyChat (retry logic, 3 tries max).
- **Flow always resumes.** Mid-flow questions never derail the scripted conversation — Julie answers (or escalates) and picks right back up.
- **Unanswered questions are tracked.** When OpenAI returns NO_ANSWER, the question is saved to Supabase and/or flagged as a HubSpot task so the real Julie can follow up.
- **Language matching:** OpenAI responds in whatever language the user is using.

---

### PATIENCE MESSAGE (sent instantly before API call)

English:
> "Great question! Let me look into that real quick..."

Spanish:
> "¡Buena pregunta! Déjame revisar eso rápido..."

---

### PHASE 4 COPY (FINAL — approved by ChatGPT rewrite)

**Retry messages (wrong format, 3 tries):**

Try 1 (gentle):
- English: "Hey, can you type that as a number for me? Like 62 😊"
- Spanish: "Oye, ¿me lo puedes escribir como número? Por ejemplo, 62 😊"

Try 2 (still friendly, clearer):
- English: "Almost got it — just need the number by itself. Like 55 👍"
- Spanish: "Casi — solo necesito el número por sí solo. Como 55 👍"

Try 3 (soft escalation — handoff, not failure):
- English: "No worries — let me have Julie help you with this 👍"
- Spanish: "No te preocupes — mejor déjame que Julie te ayude con esto 👍"
- → HubSpot scheduler link

**Patience message (before AI lookup):**
- English: "That's a good question — give me a second to check that for you 😊"
- Spanish: "Buena pregunta — déjame checar eso rapidito 😊"

**AI answered → return to flow:**
- English: "[AI answer] And going back to what I was asking — [repeat scripted question]"
- Spanish: "[AI answer] Y regresando a lo que te estaba preguntando — [repeat scripted question]"

**AI can't answer → escalate + continue flow:**
- English: "That's a really good question — I don't want to guess on that. I'll send it over so Julie can take a look 👍 For now, let's keep going —"
- Spanish: "Muy buena pregunta — no quiero adivinar en eso. Se lo voy a pasar a Julie para que lo revise 👍 Por ahora, seguimos —"

**Post-flow safety valve (no answer, flow done):**
- English: "That's a really good question — I'd rather go over that with you real quick to make sure you get the right info. Want to hop on a quick call?"
- Spanish: "Muy buena pregunta — prefiero explicártelo bien en una llamada rápida para que tengas la información correcta. ¿Te gustaría agendar una llamada?"
- Buttons: **Schedule a call** / **Agendar una llamada** → HubSpot scheduler | **I'm okay for now** / **Estoy bien por ahora** → friendly close

---

## PHASE 5: PRIORITY KEYWORDS — FAST TRACK (FINAL COPY — approved by ChatGPT rewrite)

**Goal:** Catch high-intent requests for a human immediately. Skip everything, go straight to scheduler.

**Trigger Keywords:** Human, Agent, Help, Call me, Person

**Lives in:** ManyChat's Keywords section (separate from main flow)

English:
> "Got it — I can help you with that 😊
> The quickest way is to jump on a call with Julie so she can walk you through everything. Go ahead and pick the soonest time available here 👇"

Spanish:
> "Perfecto — te ayudo con eso 😊
> Lo más rápido es una llamada con Julie para que te pueda explicar todo. Elige el horario más pronto que veas disponible aquí 👇"

**Action:** Displays pre-filled HubSpot Scheduler link:
`https://meetings.hubspot.com/mejorvidainsurance?email={{user_email}}&phone={{phone}}&firstname={{first_name}}`

---

## SYSTEM DESIGN PRINCIPLES

- **Polite & Friendly:** Julie (and her virtual assistant) are always polite, warm, and conversational — never pushy, never robotic
- **Peer-to-Peer Tone:** Julie feels like a helpful neighbor, not a sales bot
- **Zero Friction:** Pre-filling phone number and email saves the user effort
- **High Control:** The smart safety net prevents user frustration — questions get answered or escalated, never ignored
- **Immediate ROI:** Lead's contact info hits your CRM even if they don't finish booking
- **No Lead Left Behind:** If a lead drops off before providing info, they get a follow-up message. If they still don't respond, their WhatsApp name and phone are captured into the funnel automatically (see Drop-Off Handling below)

---

## BUILD STATUS

| Phase | Description | Copy | Build |
|-------|-------------|------|-------|
| 1 | Language + Nebraska filter | ✅ Final | ❌ Not built |
| 2 | Data + lead capture + range + scheduler | ✅ Final | ❌ Not built |
| 3 | Invisible Vercel → Supabase + HubSpot sync | ✅ Final (structure) | ❌ Not built |
| 4 | Smart AI safety net + flow recovery | ✅ Final | ❌ Not built |
| 5 | Priority keyword fast track | ✅ Final | ❌ Not built |

**All copy finalized. All previous flows deleted. Ready to build from scratch, one box at a time.**

### BUILD RULES

1. **Backend (Vercel, Supabase, HubSpot, OpenAI)** → Built in **Cursor**. This includes API routes, database schemas, webhook handlers, RAG pipeline, and all server-side code.
2. **ManyChat flow** → Built together with **Claude (browser controller) + Justin**. One box at a time. **Claude will NEVER attach more than one box without Justin's review and approval.** Each box is added, reviewed, and approved before moving to the next.
3. **Build order:** Backend first (so the webhooks exist when ManyChat needs to call them), then ManyChat flow box by box.

---

## DROP-OFF HANDLING (applies to all phases)

**Goal:** Never lose a lead who started the flow but stopped responding.

### Step 1 — First follow-up (5 minutes after drop-off)

If the user stops responding mid-flow, after 5 minutes Julie's assistant sends a re-engagement message that repeats the last question they were asked:

English:
> "Hey 😊 I think we got cut off for a second
> I was just working on your quote and finding what would fit you best
> Can you help me with this real quick?
> [REPEAT LAST QUESTION HERE]"

Spanish:
> "Oye 😊 creo que se nos cortó un poquito
> Ya estaba viendo tu cotización y lo que mejor te conviene
> ¿Me ayudas con esto rapidito?
> [REPEAT LAST QUESTION HERE]"

→ If they respond, the flow resumes from where they left off.

### Step 2 — Silent capture (5 more minutes with no response)

If after another 5 minutes (10 total) they still haven't responded:

**Action:** ManyChat fires External Request to `POST https://<vercel-domain>/api/dropoff-capture`

- **Supabase** — writes to `manychat_leads` with `drop_off: true`, `drop_off_stage` = wherever they stopped, tag `Lead_DropOff`, pipeline_stage `dropped`
- **HubSpot** — creates/updates contact at the appropriate pipeline stage so they enter the funnel for follow-up
- Checks if lead already exists (by phone) — skips if they already completed the flow

**No message is sent to the user.** They've already been given a chance to re-engage. Their info is quietly captured so the real Julie can follow up later.

### Drop-off copy: ✅ Final (approved by ChatGPT rewrite)

---

## GOLD STANDARD ARCHITECTURE (Target State)

**Stack:** ManyChat → Vercel Function (Node.js runtime for webhooks, Edge for future quote engine) → [OpenAI + Supabase + HubSpot] → ManyChat

### Security: Triple-Lock System
- **API Keys:** All keys (OpenAI, Supabase Service Role, HubSpot Token) stored in Vercel Environment Variables — never hardcoded
- **Webhook Secret:** ManyChat sends custom header `X-App-Secret: [password]` on every External Request. Vercel checks this first — returns `401` if it doesn't match
- **Supabase RLS:** Row Level Security enabled on carrier and lead tables. Only the Service Role key (in Vercel) has Write/Update access

### ManyChat Performance Setup
- **Vercel Edge Functions** (not Serverless) — eliminates cold starts, stays within ManyChat's 10-second timeout
- **"Patience" Message:** Send "Checking the latest carrier rates for you..." immediately BEFORE the External Request block to reset user's internal clock
- **Concise Prompts:** Tell OpenAI "Return only the quote and a one-sentence explanation. Max 60 words."
- **Model:** `gpt-4o-mini` — fastest 2026 model, responds in ~3 seconds

### Development Workflow
- **Private GitHub repo** → linked to Vercel for auto-deploy on every `git push`
- **Local `.env` file** for keys during development (added to `.gitignore`)
- **Never commit API keys** to GitHub

### Data Flow (One Vercel Execution)
1. **Fetch:** Query Supabase for carrier rate data
2. **Process:** Send data + user question to OpenAI
3. **Sync:** Write lead info + AI answer to HubSpot and Supabase
4. **Respond:** Return AI answer to ManyChat for display

### Full System Diagram

```
[User on WhatsApp/FB Messenger]
            |
            v
      [ManyChat Flow]
  - Collects user info (age, ZIP, plan type)
  - Sends External Request to Vercel
            |
            v
     [Vercel Edge Function]
  - Receives user input
  - Verifies ManyChat secret header
  - Calls Quote API for real quote (see API STATUS below)
  - Optionally queries Supabase for additional info
  - Optionally sends quote + context to OpenAI for explanation
            |
            v
  [Quote API]  [Supabase]  [OpenAI API]
      |           |           |
      v           v           v
  Real quote   Carrier/    Friendly explanation
               lead info
            |
            v
      [Vercel Edge Function]
  - Combines results into JSON
  - Returns response to ManyChat
            |
            v
      [ManyChat Display]
  - Shows user: quote + optional AI explanation
```

### FB Ads Hybrid Approach (Pro Plan)
- Use **native ManyChat → HubSpot integration** for basic contact info (Name, Phone)
- Use **Vercel Bridge** specifically for the AI Quote logic
- This hybrid is the most stable approach for high-volume ads

---

## QUOTE API STATUS

**CSG Actuarial:** Too expensive — not pursuing.

**Compulife API:** Under consideration. Would replace Supabase pre-loaded rates with real-time quotes. Decision pending.

**In the meantime:** Phases 1–4 use pre-loaded rate ranges (static "The Range" estimate: $35–$85/mo for a typical Nebraska lead). This is a placeholder — good enough to qualify leads and book calls. When a quote API is chosen, the Vercel Edge Function will replace this with real-time data.

---

## MANYCHAT FIELD REFERENCE

_Validated 2026-04-11 through live test debugging. Use these exact names everywhere — in flow message copy, External Request bodies, and HubSpot Power Links._

---

### System Fields (always populated for real WhatsApp contacts)

These come from the subscriber's WhatsApp profile. Available immediately — no collection step needed.

| Display Name | `{{variable}}` syntax | Notes |
|---|---|---|
| First Name | `{{first_name}}` | ✅ Confirmed resolving |
| Last Name | `{{last_name}}` | ✅ Confirmed resolving |
| Phone | `{{phone}}` | WhatsApp number — always set for real contacts. Use System Field pill, NOT the `phone` custom field. |

---

### Custom Fields (set during the flow via "Set User Field" actions)

These are empty until explicitly collected. ManyChat sends the literal `{{field_name}}` text when the field has no value — the server strips these automatically.

| Custom Field Name | `{{variable}}` syntax | Collected in | Accepted values | Used for |
|---|---|---|---|---|
| `email` | `{{email}}` | Box 12 / Box 5a | valid email string | Lead capture, HubSpot contact, opt-in |
| `first_name` | `{{first_name}}` | Box 11 | free text | Mirrors system field after user types name |
| `last_name` | `{{last_name}}` | Box 4a (OOS path) | free text | Referral capture |
| `edad` | `{{edad}}` / `{{cuf_14460835}}` | Box 8 / SM 3 | number, 18–99 | Age for quote |
| `sexo` | `{{sexo}}` / `{{cuf_14435439}}` | Box 9 | `hombre` \| `mujer` | Sex for quote — stored as-is, use these exact button values |
| `tabaco` | `{{tabaco}}` / `{{cuf_14435341}}` | Box 10 | `sí` \| `no` | Tobacco use — server normalizes sí→true, no→false |
| `idioma` | `{{idioma}}` | Language selection | `español` \| `english` | Language preference |
| `estado` | `{{estado}}` | Not yet collected | 2-letter state code | State (future) |

#### Button value conventions (MUST match exactly — these are saved to ManyChat fields)

| Question | Spanish button label | Saved value | English button label | Saved value |
|---|---|---|---|---|
| Sex | Hombre | `hombre` | Male | `male` |
| Sex | Mujer | `mujer` | Female | `female` |
| Tobacco | Sí | `sí` | Yes | `yes` |
| Tobacco | No | `no` | No | `no` |
| Nebraska | Nebraska | _(routes flow, not saved)_ | Nebraska | _(routes flow, not saved)_ |
| Other State | Otro Estado | _(routes flow, not saved)_ | Other State | _(routes flow, not saved)_ |
| Referral yes | ¡Sí, por favor! | _(routes flow, not saved)_ | Yes, please! | _(routes flow, not saved)_ |
| Referral no | No, gracias | _(routes flow, not saved)_ | No thanks | _(routes flow, not saved)_ |

> **⚠️ Important:** `phone` and `email` as custom fields are both "Not Set" until the flow explicitly sets them. Always use the **System Field pill** for phone in External Requests (resolves to WhatsApp number). Use the `email` custom field pill for email (resolves after Box 12).

#### Server-side field name mapping (how ManyChat fields map to API + Supabase + HubSpot)

| ManyChat field | API body key | Supabase column | HubSpot property |
|---|---|---|---|
| `{{first_name}}` (system) | `first_name` | `first_name` | `firstname` |
| `{{last_name}}` (system) | `last_name` | `last_name` | `lastname` |
| `{{phone}}` (system) | `phone` | `phone` | `phone` |
| `{{email}}` (custom) | `email` | `email` | `email` |
| `{{edad}}` (custom) | `age` | `age` | `age` |
| `{{sexo}}` (custom) | `sex` | `sex` | `gender` |
| `{{tabaco}}` (custom) | `tobacco` | `tobacco` | `tobacco_user` |
| hardcoded `"Spanish"` | `language` | `language` | `preferred_language` |

---

### External Request Bodies (exact JSON for each Actions block)

**Actions #13 — Nebraska opt-in** (fires when contact clicks "Nebraska" in SM 1):
```
{"action":"email_optin",
"lead_type":"nebraska",
"first_name":"{{first_name}}",
"last_name":"{{last_name}}",
"phone":"{{phone}}",
"email":"{{email}}",
"language":"Spanish"}
```

**Actions #14 — Out-of-state referral opt-in** (fires when contact clicks "¡Sí, por favor!"):
```
{"action":"email_optin",
"lead_type":"referral",
"first_name":"{{first_name}}",
"last_name":"{{last_name}}",
"phone":"{{phone}}",
"email":"{{email}}",
"language":"Spanish"}
```

**Lead capture** (fires after email is collected in Box 12):
```
{"action":"lead_capture",
"first_name":"{{first_name}}",
"phone":"{{phone}}",
"email":"{{email}}",
"age":"{{edad}}",
"sex":"{{sexo}}",
"tobacco":"{{tabaco}}",
"language":"Spanish"}
```

**Drop-off capture** (fires after 10 min of no response):
```
{"phone":"{{phone}}",
"first_name":"{{first_name}}",
"drop_off_stage":"[stage name]"}
```

**Endpoint for all:** `POST https://mejor-vida-html.vercel.app/api/contact-capture`
**Header:** `X-App-Secret: [MANYCHAT_WEBHOOK_SECRET value]`

---

### HubSpot Power Link (pre-filled scheduler)

```
https://meetings.hubspot.com/mejorvidainsurance?email={{email}}&phone={{phone}}&firstname={{first_name}}
```

> **Note:** Use `{{email}}` (custom field) and `{{phone}}` (system field pill) here — not `{{user_email}}`.

---

## NOTES

- The chatbot is Julie's **virtual assistant**, not Julie herself. This distinction matters for escalations ("I'll send this to Julie").
- All copy is bilingual — English and Spanish, based on language selection in Box 1
- Phase 4 (safety net) mid-flow handling also applies during ManyChat's WhatsApp Default Reply automation (post-flow)
- Phase 5 (priority keywords) lives in ManyChat's Keywords section
- HubSpot meeting link: `https://meetings.hubspot.com/mejorvidainsurance`
- HubSpot Power Link (pre-filled): `https://meetings.hubspot.com/mejorvidainsurance?email={{user_email}}&phone={{phone}}&firstname={{first_name}}`
- Admin email: `whatsapp@mejorvidainsurance.com`
