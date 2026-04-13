/**
 * POST /api/call-transcript
 *
 * Stores a call recording, transcript, and AI summary for a lead.
 * Called after a call completes — either from a calling tool webhook
 * (e.g. JustCall, CallRail) or manually by Julie.
 *
 * Also advances the lead's pipeline_stage to 'call_completed' if it
 * isn't already further along.
 *
 * Sends:
 *   phone              (required) WhatsApp phone number of the lead
 *   call_date          (required) ISO datetime of the call
 *   duration_secs      (optional) call length in seconds
 *   recording_url      (optional) link to the audio recording
 *   transcript_text    (optional) full text transcript
 *   ai_summary         (optional) AI-generated call summary
 *   call_outcome       (optional) 'interested' | 'not_interested' | 'scheduled_followup' | 'policy_sold' | 'no_answer'
 *   auto_summarize     (optional) true — if transcript_text is given but ai_summary is not,
 *                                 generate an AI summary automatically
 *
 * Returns:
 *   { success: true, transcript_id: "...", contact_id: "..." }
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET,
 *      OPENAI_API_KEY (only needed if auto_summarize=true)
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const {
  getContactByPhone,
  insertCallTranscript,
  updateLeadState,
  insertEvent,
  logWebhook,
} = require("../lib/contacts-db");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

async function generateCallSummary(openAiKey, transcript, contactName) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a sales call summarizer for a final expense insurance agency. " +
            "Summarize the call in 3-5 bullet points. Include: customer's situation, " +
            "their interest level, any objections raised, and agreed next steps. " +
            "Be concise and factual. No fluff.",
        },
        {
          role: "user",
          content: `Customer name: ${contactName || "Unknown"}\n\nCall transcript:\n${transcript.slice(0, 8000)}`,
        },
      ],
      max_tokens: 400,
      temperature: 0.3,
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`OpenAI summary ${r.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data.choices[0].message.content.trim();
}

module.exports = async function handler(req, res) {
  logRequest("call-transcript");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, error: "Method Not Allowed" });
  }

  const auth = verifyManychatSecret(req);
  if (!auth.ok) {
    return json(res, auth.status, { success: false, error: auth.error });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { success: false, error: "Server missing Supabase env vars" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  const phone = String(body.phone || "").trim();
  const callDate = String(body.call_date || "").trim();

  if (!phone) return json(res, 400, { success: false, error: "phone is required" });
  if (!callDate) return json(res, 400, { success: false, error: "call_date is required" });

  logWebhook(supabaseUrl, supabaseKey, "call_system", "/api/call-transcript", { phone, call_date: callDate });

  try {
    // 1. Find contact
    const contact = await getContactByPhone(supabaseUrl, supabaseKey, phone);
    if (!contact) {
      return json(res, 404, { success: false, error: "Contact not found" });
    }

    let aiSummary = String(body.ai_summary || "").trim() || null;
    const transcriptText = String(body.transcript_text || "").trim() || null;

    // 2. Auto-generate summary if requested and transcript is available
    if (body.auto_summarize && transcriptText && !aiSummary && openAiKey) {
      try {
        aiSummary = await generateCallSummary(openAiKey, transcriptText, contact.full_name);
      } catch (e) {
        console.warn("call-transcript: AI summary failed:", e.message);
        // Non-fatal — continue without summary
      }
    }

    // 3. Insert transcript record
    const transcript = await insertCallTranscript(supabaseUrl, supabaseKey, contact.id, {
      callDate,
      durationSecs: body.duration_secs ? parseInt(body.duration_secs, 10) : null,
      recordingUrl: String(body.recording_url || "").trim() || null,
      transcriptText,
      aiSummary,
      callOutcome: String(body.call_outcome || "").trim() || null,
    });

    // 4. Update lead_state
    const stateUpdate = {
      call_completed_at: callDate,
      pipeline_stage: "call_completed",
    };
    if (body.call_outcome === "policy_sold") {
      stateUpdate.policy_issued_at = new Date().toISOString();
      stateUpdate.pipeline_stage = "policy_issued";
    }
    await updateLeadState(supabaseUrl, supabaseKey, contact.id, stateUpdate);

    // 5. Append event
    await insertEvent(supabaseUrl, supabaseKey, contact.id, "call_completed", {
      call_date: callDate,
      duration_secs: body.duration_secs || null,
      call_outcome: body.call_outcome || null,
      transcript_id: transcript.id,
    }, "phone");

    return json(res, 200, {
      success: true,
      transcript_id: transcript.id,
      contact_id: contact.id,
      ai_summary: aiSummary,
    });
  } catch (e) {
    console.error("call-transcript error:", e.message);
    return json(res, 500, { success: false, error: "Server error storing call transcript" });
  }
};
