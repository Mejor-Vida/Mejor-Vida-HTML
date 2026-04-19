# ManyChat Default Reply Automation Setup — Phase 4

## Overview
This automation catches **any unhandled message** in WhatsApp and sends it through the RAG-powered AI system. If the AI has an answer (or a cached FAQ), it sends the answer. If not, it notifies Julie for manual review.

## Step-by-Step Setup

### 1. Navigate to Automations
- In ManyChat, go to **Automations** (left sidebar)
- Click **+ Create Automation** (or **+ New** button)
- Select **Automation type: Default Reply**
- Name it: `Phase 4: AI Safety Net - Default Reply`

### 2. Set the Trigger
**Trigger:** Default Reply (catches all unhandled messages)
- This automation runs when a contact sends a message that **doesn't match any keyword** or **flow trigger**
- Leave trigger settings as default (applies to all channels)

### 3. Add the First Block — Send "Thinking..." Message

**Block 1: Send Message**
- Type: Send Message
- Content:
  ```
  Let me search our knowledge base for that... ⏳
  ```
- This shows the contact a visual indicator while the backend processes their question

---

### 4. Add External Request Block — Call `/api/rag-answer`

**Block 2: External Request (Action)**
- **URL:** `https://www.mejorvidainsurance.com/api/rag-answer`
- **Method:** POST
- **Headers:**
  ```
  X-App-Secret: [PASTE YOUR MANYCHAT_WEBHOOK_SECRET HERE]
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "question": "{{last_input_text}}",
    "language": "{{language}}",
    "phone": "{{phone}}"
  }
  ```

  **Explanation:**
  - `{{last_input_text}}` — The contact's message
  - `{{language}}` — Their language custom field (English/Spanish)
  - `{{phone}}` — Their phone number (for logging)

- **Save Response Variables:**
  - ✅ Check "Save response in variables"
  - Variable name: `ai_response`
  - Response format: JSON

---

### 5. Add Conditional Block — Check Response Status

**Block 3: Condition (If/Else)**
- **Condition Type:** Check variable
- **Variable:** `ai_response.status`
- **Operator:** `equals`
- **Value:** `answered`

This splits into two branches:

#### Branch A: Status = "answered" (AI found an answer)
- Continue to Block 4a below

#### Branch B: Status = "no_answer" (AI couldn't find an answer)
- Continue to Block 5 below

---

### 6a. If Answered — Send AI Response + Save to FAQ

**Block 4a: Send Message (on answered branch)**
- Type: Send Message
- Content:
  ```
  {{ai_response.answer}}
  ```
  (The AI-generated answer from the RAG pipeline)

**Optional: Log to Google Sheets or Custom Field**
- You can optionally save this to a custom field `last_ai_answer` or log it to Google Sheets
- This isn't critical but helps track what answers were given

---

### 6b. If No Answer — Notify Julie + Save for Review

**Block 5: Send Message (on no_answer branch)**
- Type: Send Message
- Content:
  ```
  I don't have that information in our system yet. A member of our team will get back to you shortly. 📞
  ```

**Block 6: External Request — Notify Julie (Optional)**
- You can send a webhook to notify Julie or save to a table
- **URL:** `https://www.mejorvidainsurance.com/api/notify-unanswered` (or wherever you want to route this)
- **Body:**
  ```json
  {
    "question": "{{last_input_text}}",
    "phone": "{{phone}}",
    "language": "{{language}}"
  }
  ```

**Alternative: Let Backend Handle It**
- The `/api/rag-answer` endpoint already saves unanswered questions to the `unanswered_questions` table
- No additional setup needed if you just want them saved to Supabase

---

### 7. Optional: Add a Follow-Up Question (Patience Message)

After some time, you can add:

**Block 7: Wait (conditional)**
- Wait: 5 minutes
- Then send:
  ```
  Still looking into that for you... We'll be in touch soon! ✨
  ```

This keeps the conversation feeling alive if Julie takes a while to respond.

---

## Configuration Checklist

### Before You Save:

- [ ] Default Reply trigger is selected
- [ ] "Thinking..." message block exists (optional but recommended)
- [ ] External Request to `/api/rag-answer` is configured with:
  - [ ] Correct URL: `https://www.mejorvidainsurance.com/api/rag-answer`
  - [ ] Correct method: POST
  - [ ] Headers include: `X-App-Secret` + `Content-Type: application/json`
  - [ ] Body includes: `question`, `language`, `phone`
  - [ ] Response variables saved as `ai_response`
- [ ] Condition block checks `ai_response.status == "answered"`
- [ ] Answered branch sends `{{ai_response.answer}}`
- [ ] No answer branch sends fallback message
- [ ] Automation is **enabled** and **saved**

---

## Variables You'll Need

### Custom Fields (Make Sure These Exist in ManyChat)
- `language` — "English" or "Spanish" (create if missing)
- `phone` — Contact's phone number (usually auto-populated)

### ManyChat Built-In Variables
- `{{last_input_text}}` — The user's last message
- `{{phone}}` — Contact's phone number
- `{{language}}` — Custom field (if you've created it)

### Response Variables
- `{{ai_response.status}}` — "answered" or "no_answer"
- `{{ai_response.answer}}` — The actual answer text

---

## Testing the Automation

### Test 1: Ask a Question That Should Have an Answer
1. Send a test message via WhatsApp: `"What is final expense insurance?"`
2. Expected flow:
   - "Let me search..." message appears
   - 3-5 seconds later, the AI answer is sent
   - Answer should be in the contact's language

### Test 2: Ask a Question That Shouldn't Have an Answer
1. Send: `"How much do you charge for purple elephant insurance?"`
2. Expected flow:
   - "Let me search..." message appears
   - "I don't have that info..." fallback message is sent
   - Question is logged to `unanswered_questions` table

### Test 3: Test Language Detection
1. Create a contact with `language = "Spanish"`
2. Send a question in Spanish
3. Expected: Answer comes back in Spanish

---

## Troubleshooting

### Issue: Automation doesn't trigger
- Check that it's **enabled** (toggle in automation settings)
- Check that it's set to **Default Reply** (not a keyword or flow)
- Make sure message doesn't match other keywords/flows (those take priority)

### Issue: External Request fails (500 error)
- Verify `X-App-Secret` header matches your `MANYCHAT_WEBHOOK_SECRET` env var
- Check that endpoint is actually deployed on Vercel
- Check Vercel logs for errors

### Issue: Response not saved or `ai_response` is empty
- Make sure "Save response in variables" is checked
- Verify response is valid JSON
- Check that variable name matches: `ai_response`

### Issue: Answer is in wrong language
- Verify `language` custom field is set correctly
- Check that language is "English" or "Spanish" (exactly)
- Review the prompt in `lib/openai.js` to see language forcing logic

---

## After Setup

Once this automation is live:

1. **FAQ Table Grows:** Every successful answer is cached in the `faqs` table
2. **Second Hits Are Instant:** Subsequent similar questions hit the FAQ cache (no LLM call)
3. **Unanswered Questions Pile Up:** Check the `unanswered_questions` table daily
4. **Julie Reviews:** Manual answers get added to FAQs manually or via a future admin tool
5. **Cost Decreases Over Time:** More FAQ hits = fewer OpenAI API calls

---

## Summary

**The Default Reply automation is the "safety net" that:**
- Catches all unhandled messages
- Checks FAQ cache (instant)
- Falls back to RAG + GPT (slower but comprehensive)
- Logs failures for manual review
- Self-improves as FAQs grow

This completes **Phase 4: Smart AI Safety Net** for the ManyChat WhatsApp bot. 🎯
