# Mejor Vida Insurance — Website Chatbot (Cursor Build)

## Overview
Build a conversational AI chatbot for mejorvidainsurance.com that mirrors the ManyChat WhatsApp bot. This chatbot will:
- Answer insurance questions using a RAG-powered backend
- Maintain conversation history (last 4–6 messages) for context
- Support both English and Spanish
- Never store personal information
- Integrate with backend endpoints that will be ready by 7pm ET

## User Experience Flow

1. **User visits website** → Chatbot widget appears (bottom-right corner, collapsible)
2. **User sends a message** → "Thinking..." indicator shows while backend searches
3. **Backend responds** → Answer appears in chat with language detection
4. **Conversation continues** → Last 4–6 messages stay in memory for context
5. **Session persists** → User can close/reopen chat, messages stay for that session
6. **No personal data stored** → Chat history auto-deletes after X hours OR when browser closes (your choice)

---

## Technical Specification

### Frontend (What You're Building)

#### 1. **Chatbot Widget Component**
- **Framework:** React (or vanilla JS if you prefer, but React recommended)
- **Location:** Embed on website as a reusable component
- **Appearance:**
  - Floating button (bottom-right corner) with unread count badge
  - Click to expand to chat window (350px wide, 500px tall, responsive)
  - Header with title "Mejor Vida Assistant" + language toggle (EN/ES)
  - Message display area (scrollable)
  - Text input field + Send button
  - Typing indicators when waiting for response

#### 2. **Session Management**
- **Session ID:** Generate a unique session ID on first visit
  - Store in `sessionStorage` (cleared on browser close) OR
  - Store in `localStorage` (persists across sessions) — your choice
- **Language preference:** Store in sessionStorage/localStorage
  - Default to user's browser language or IP geolocation
  - Allow user to toggle EN/ES in chatbot header

#### 3. **Message Display**
- **User messages:** Right-aligned, light background
- **Assistant messages:** Left-aligned, darker background
- **Typing indicator:** "Assistant is typing..." with animated dots
- **Error states:** Show "Sorry, I couldn't reach the server. Please try again."
- **Expandable answers:** If answer is long, show summary + "Read more" button

#### 4. **API Integration**
**Endpoint:** `POST /api/website-chat` (Claude will build this)

**Request body:**
```json
{
  "session_id": "uuid-or-timestamp-string",
  "message": "What is your coverage limit?",
  "language": "English"
}
```

**Response:**
```json
{
  "status": "answered",
  "answer": "Our final expense insurance covers up to $25,000 in funeral and burial costs...",
  "message_id": "abc123"
}
```

or

```json
{
  "status": "no_answer",
  "answer": "I don't have that information yet. Julie will get back to you soon.",
  "message_id": "abc123"
}
```

#### 5. **State Management**
Keep track of:
- `session_id` (current conversation ID)
- `messages` (array of { role: "user" | "assistant", content, timestamp })
- `language` (EN | ES)
- `loading` (true while waiting for response)
- `error` (null or error message)

#### 6. **Styling**
- Clean, modern design matching mejorvidainsurance.com branding
- Mobile-responsive
- Accessible (ARIA labels, keyboard navigation)
- Dark mode friendly (optional but nice)

---

## Implementation Details

### Component Structure
```
ChatbotWidget (main)
  ├── ChatbotButton (floating, collapsed state)
  ├── ChatbotWindow (expanded state)
  │   ├── ChatHeader (title + language toggle)
  │   ├── MessageList (displays all messages)
  │   │   ├── UserMessage
  │   │   ├── AssistantMessage
  │   │   └── TypingIndicator
  │   └── MessageInput (text field + send button)
  └── (optional) ChatNotification (unread badge)
```

### Key Functions
1. **`initializeSession()`** — Generate or retrieve session ID
2. **`sendMessage(text)`** — POST to backend, handle response
3. **`displayMessage(role, content)`** — Add message to UI
4. **`toggleLanguage()`** — Switch EN ↔ ES
5. **`getLastMessages()`** — Return last 4-6 messages for backend context
6. **`clearChat()`** — (Optional) Clear conversation history
7. **`handleError(error)`** — Display error message to user

### LocalStorage / SessionStorage Keys
- `chatbot_session_id` — Session identifier
- `chatbot_language` — Current language preference
- `chatbot_messages` — Array of { role, content, timestamp }

---

## Behavior Details

### On Load
1. Check if session ID exists in storage
2. If not, generate new UUID
3. Load conversation history from storage (if exists)
4. Display widget with last few messages (or empty if new session)
5. Detect language from browser → set language preference

### On Message Send
1. Display user message immediately in chat
2. Show "Thinking..." indicator
3. Call `/api/website-chat` with:
   - `session_id`
   - `message` (user's input)
   - `language` (EN or ES)
4. Wait for response (timeout after 30s)
5. Display assistant response
6. Save message + response to localStorage
7. Keep last 4–6 messages; older ones can be removed

### On Error
- Show user: "Sorry, I couldn't reach the server. Please try again."
- Log error to console (optional: send to error tracking)
- Allow user to retry

### Privacy / Auto-Delete
- **Option A:** Messages stay in sessionStorage (cleared on browser close)
- **Option B:** Messages stay in localStorage but auto-delete after 24 hours (use timestamp)
- Your choice — either is fine

---

## Design References / Inspiration

The chatbot should feel like:
- **Similar to:** Intercom, Zendesk, or HubSpot widget (but simpler)
- **Tone:** Professional, friendly, accessible
- **Spacing:** Clean padding, readable font sizes
- **Colors:** Match mejorvidainsurance.com brand (use existing color palette)

---

## Integration Points with Backend (Ready at 7pm ET)

These endpoints will be available by 7pm:

### 1. `/api/rag-answer` (ManyChat only, for reference)
- Used by WhatsApp bot
- Single question, no context
- Returns: `{ answer, status }`

### 2. `/api/website-chat` (What your chatbot calls)
- **NEW endpoint Claude will build**
- Accepts: `{ session_id, message, language }`
- Returns: `{ status, answer, message_id }`
- Backend handles:
  - Retrieving last 4–6 messages from `chat_messages` table
  - Generating embedding for user question
  - Checking FAQs first (fast lookup)
  - Searching knowledge base (RAG)
  - Sending to OpenAI with conversation history
  - Saving user + assistant messages to `chat_messages` table
  - Auto-caching answers as FAQs for next time

### 3. Database Tables (Claude will create)
- `chat_sessions` — session metadata
- `chat_messages` — user + assistant messages, linked to session
- `faqs` — cached Q&A pairs for instant retrieval

---

## Optional Enhancements (Nice-to-Have, Can Add Later)

1. **Typing speed animation** — Make responses type out character-by-character
2. **Copy to clipboard** — Button to copy assistant responses
3. **Rate answer** — Thumbs up/down for quality feedback
4. **Share transcript** — Email chat history to user
5. **Suggested questions** — Show 3 common questions user can click
6. **Search within chat** — Ctrl+F to search conversation
7. **Dark mode toggle** — User preference in header
8. **Minimize to tray** — Close without clearing conversation

---

## Testing Checklist (Before 7pm)

- [ ] Chat widget appears on page load
- [ ] Session ID generates and persists
- [ ] Can type and send messages (mock endpoint OK for now)
- [ ] Messages display correctly (user left, assistant right)
- [ ] Language toggle works (EN/ES)
- [ ] Typing indicator animates
- [ ] Responsive on mobile (375px width)
- [ ] No console errors
- [ ] localStorage/sessionStorage working as expected

---

## Files to Create

1. **`components/ChatbotWidget.jsx`** — Main component
2. **`hooks/useChat.js`** — Custom hook for chat state logic
3. **`hooks/useSession.js`** — Session ID + localStorage management
4. **`styles/chatbot.css`** (or Tailwind) — Styling
5. **`utils/api.js`** — API call wrapper for `/api/website-chat`
6. **`constants/config.js`** — API URL, timeouts, etc.

---

## Success Criteria

By the time Claude finishes the backend at 7pm ET:
- ✅ Chatbot widget renders on page with no errors
- ✅ Messages send to `/api/website-chat` and display responses
- ✅ Session ID persists across page reloads
- ✅ Language toggle switches between EN/ES
- ✅ Conversation history is readable and scrollable
- ✅ "Thinking..." indicator shows while waiting for response
- ✅ Error messages display gracefully
- ✅ Mobile-responsive and accessible

---

## Questions for You (After You Start)

1. **Widget position:** Bottom-right vs. bottom-center vs. side sliding panel?
2. **Auto-delete messages:** On browser close (sessionStorage) or after 24hrs (localStorage)?
3. **Suggested questions:** Should the chatbot show 3 example questions when chat opens?
4. **Animation style:** Smooth slide-in, fade-in, or pop?
5. **Color scheme:** Pull from mejorvidainsurance.com existing colors or create new palette?

---

## Claude's Part (After 7pm ET)

Claude will build:
1. `faqs` table in Supabase
2. `match_faqs` RPC (FAQ keyword search)
3. Updated `/api/rag-answer.js` (FAQ tier + answer caching)
4. **NEW** `/api/website-chat.js` (session + history + context)
5. `chat_sessions` + `chat_messages` table migrations
6. ManyChat Default Reply automation wired to updated endpoints

Then the two systems connect seamlessly. 🎯

---

## Repo Structure (For Reference)

```
mnt/Mejor-Vida-HTML/
├── components/
│   ├── ChatbotWidget.jsx          ← You build this
│   ├── ChatHeader.jsx              ← (sub-component)
│   ├── MessageList.jsx             ← (sub-component)
│   └── MessageInput.jsx            ← (sub-component)
├── hooks/
│   ├── useChat.js                  ← You build this
│   └── useSession.js               ← You build this
├── styles/
│   └── chatbot.css                 ← You build this
├── utils/
│   ├── api.js                      ← You build this
│   └── config.js                   ← You build this
├── api/
│   ├── rag-answer.js               ← Claude updates
│   ├── website-chat.js             ← Claude creates (NEW)
│   └── ...
├── lib/
│   ├── rag-pipeline.js             ← (existing, no changes)
│   ├── supabase.js                 ← Claude adds new helpers
│   └── ...
├── integrations/supabase/migrations/
│   ├── 012_match_knowledge_chunks_rpc.sql
│   ├── 013_faqs_table.sql          ← Claude creates (NEW)
│   ├── 014_match_faqs_rpc.sql      ← Claude creates (NEW)
│   ├── 015_chat_sessions_table.sql ← Claude creates (NEW)
│   ├── 016_chat_messages_table.sql ← Claude creates (NEW)
│   └── ...
└── ...
```

---

## Summary

**You (Cursor) build the UI that users interact with.** It talks to an API endpoint that Claude will finish at 7pm. By then, everything behind the scenes (FAQ caching, conversation history, embedding search, answer generation) will be ready. You just need to make it beautiful and responsive.

Good luck! 🚀
