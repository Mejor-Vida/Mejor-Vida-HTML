/**
 * contacts-db.js — Supabase REST helpers for the v2 lead pipeline tables.
 * Tables: contacts, lead_state, events, knowledge_gaps
 *
 * Architecture: Supabase is the permanent source of truth.
 * Phone number is the primary identifier for all WhatsApp leads.
 */

function restHeaders(serviceKey, prefer) {
  const h = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
  if (prefer) h.Prefer = prefer;
  return h;
}

function base(supabaseUrl) {
  return supabaseUrl.replace(/\/$/, "") + "/rest/v1";
}

// ─── CONTACTS ────────────────────────────────────────────────────────────────

/**
 * Find a contact by phone. Returns full row or null.
 */
async function getContactByPhone(supabaseUrl, serviceKey, phone) {
  const url = `${base(supabaseUrl)}/contacts?phone=eq.${encodeURIComponent(phone)}&limit=1`;
  const r = await fetch(url, { headers: restHeaders(serviceKey) });
  const text = await r.text();
  if (!r.ok) throw new Error(`contacts select ${r.status}: ${text.slice(0, 300)}`);
  const rows = JSON.parse(text);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Create a new contact. Returns the created row (with id).
 */
async function insertContact(supabaseUrl, serviceKey, fields) {
  const url = `${base(supabaseUrl)}/contacts`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey, "return=representation"),
    body: JSON.stringify(fields),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`contacts insert ${r.status}: ${text.slice(0, 400)}`);
  const data = JSON.parse(text);
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Update an existing contact by id.
 */
async function updateContact(supabaseUrl, serviceKey, contactId, fields) {
  const url = `${base(supabaseUrl)}/contacts?id=eq.${encodeURIComponent(contactId)}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify({ ...fields, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`contacts patch ${r.status}: ${t.slice(0, 300)}`);
  }
}

/**
 * Upsert contact by phone. Creates if not found, updates if found.
 * Returns { contactId, created }.
 */
async function upsertContact(supabaseUrl, serviceKey, phone, fields) {
  const existing = await getContactByPhone(supabaseUrl, serviceKey, phone);
  if (existing) {
    await updateContact(supabaseUrl, serviceKey, existing.id, fields);
    return { contactId: existing.id, created: false };
  }
  const row = await insertContact(supabaseUrl, serviceKey, { phone, ...fields });
  return { contactId: row.id, created: true };
}

// ─── LEAD_STATE ───────────────────────────────────────────────────────────────

/**
 * Get lead_state for a contact. Returns row or null.
 */
async function getLeadState(supabaseUrl, serviceKey, contactId) {
  const url = `${base(supabaseUrl)}/lead_state?contact_id=eq.${encodeURIComponent(contactId)}&limit=1`;
  const r = await fetch(url, { headers: restHeaders(serviceKey) });
  const text = await r.text();
  if (!r.ok) throw new Error(`lead_state select ${r.status}: ${text.slice(0, 300)}`);
  const rows = JSON.parse(text);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Create a new lead_state row for a contact.
 */
async function insertLeadState(supabaseUrl, serviceKey, contactId, fields) {
  const url = `${base(supabaseUrl)}/lead_state`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey, "return=representation"),
    body: JSON.stringify({ contact_id: contactId, ...fields }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`lead_state insert ${r.status}: ${text.slice(0, 400)}`);
  const data = JSON.parse(text);
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Update lead_state by contact_id.
 */
async function updateLeadState(supabaseUrl, serviceKey, contactId, fields) {
  const url = `${base(supabaseUrl)}/lead_state?contact_id=eq.${encodeURIComponent(contactId)}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify({ ...fields, last_activity_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`lead_state patch ${r.status}: ${t.slice(0, 300)}`);
  }
}

/**
 * Upsert lead_state — creates if not found, updates if found.
 */
async function upsertLeadState(supabaseUrl, serviceKey, contactId, fields) {
  const existing = await getLeadState(supabaseUrl, serviceKey, contactId);
  if (existing) {
    await updateLeadState(supabaseUrl, serviceKey, contactId, fields);
    return existing.id;
  }
  const row = await insertLeadState(supabaseUrl, serviceKey, contactId, fields);
  return row.id;
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────

/**
 * Append an event to the audit trail. Never deleted.
 * event_type examples: language_picked, age_answered, smoker_answered,
 *   gender_answered, quote_generated, call_scheduled, call_completed, policy_issued
 */
async function insertEvent(supabaseUrl, serviceKey, contactId, eventType, eventData = {}, channel = "whatsapp") {
  const url = `${base(supabaseUrl)}/events`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify({
      contact_id: contactId,
      event_type: eventType,
      event_data: eventData,
      channel,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`events insert ${r.status}: ${t.slice(0, 400)}`);
  }
}

// ─── KNOWLEDGE GAPS ──────────────────────────────────────────────────────────

/**
 * Insert a knowledge gap (unanswered RAG question) for Julie to review.
 */
async function insertKnowledgeGap(supabaseUrl, serviceKey, { question, contactId, phone, us_state, channel, conversationContext }) {
  const url = `${base(supabaseUrl)}/knowledge_gaps`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey, "return=representation"),
    body: JSON.stringify({
      question,
      contact_id: contactId || null,
      phone: phone || null,
      us_state: us_state || "NE",
      channel: channel || "whatsapp",
      conversation_context: conversationContext || null,
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`knowledge_gaps insert ${r.status}: ${text.slice(0, 400)}`);
  const data = JSON.parse(text);
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Get pending knowledge gaps (not yet decided by Julie).
 */
async function getPendingKnowledgeGaps(supabaseUrl, serviceKey, limit = 50) {
  const url = `${base(supabaseUrl)}/knowledge_gaps?julie_decision=is.null&order=created_at.asc&limit=${limit}`;
  const r = await fetch(url, { headers: restHeaders(serviceKey) });
  const text = await r.text();
  if (!r.ok) throw new Error(`knowledge_gaps select ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

/**
 * Update a knowledge gap with Julie's decision.
 * decision: 'approved' | 'rejected'
 */
async function updateKnowledgeGapDecision(supabaseUrl, serviceKey, gapId, { decision, answer }) {
  const url = `${base(supabaseUrl)}/knowledge_gaps?id=eq.${encodeURIComponent(gapId)}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify({
      julie_decision: decision,
      julie_answer: answer || null,
      julie_decided_at: new Date().toISOString(),
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`knowledge_gaps patch ${r.status}: ${t.slice(0, 300)}`);
  }
}

/**
 * Mark a knowledge gap as added to the KB.
 */
async function markKnowledgeGapAdded(supabaseUrl, serviceKey, gapId, kbChunkId) {
  const url = `${base(supabaseUrl)}/knowledge_gaps?id=eq.${encodeURIComponent(gapId)}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify({
      added_to_kb_at: new Date().toISOString(),
      kb_chunk_id: kbChunkId || null,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`knowledge_gaps mark-added ${r.status}: ${t.slice(0, 300)}`);
  }
}

// ─── NOTES ───────────────────────────────────────────────────────────────────

/**
 * Insert a note on a contact.
 * note_type: 'manual' | 'ai_summary' | 'system'
 */
async function insertNote(supabaseUrl, serviceKey, contactId, { note, noteType = "manual", createdBy = "julie" }) {
  const url = `${base(supabaseUrl)}/notes`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify({
      contact_id: contactId,
      note,
      note_type: noteType,
      created_by: createdBy,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`notes insert ${r.status}: ${t.slice(0, 400)}`);
  }
}

// ─── CALL TRANSCRIPTS ────────────────────────────────────────────────────────

/**
 * Insert a call transcript record.
 */
async function insertCallTranscript(supabaseUrl, serviceKey, contactId, {
  callDate, durationSecs, recordingUrl, transcriptText, aiSummary, callOutcome,
}) {
  const url = `${base(supabaseUrl)}/call_transcripts`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey, "return=representation"),
    body: JSON.stringify({
      contact_id: contactId,
      call_date: callDate,
      duration_secs: durationSecs || null,
      recording_url: recordingUrl || null,
      transcript_text: transcriptText || null,
      ai_summary: aiSummary || null,
      call_outcome: callOutcome || null,
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`call_transcripts insert ${r.status}: ${text.slice(0, 400)}`);
  const data = JSON.parse(text);
  return Array.isArray(data) ? data[0] : data;
}

// ─── WEBHOOK LOG ─────────────────────────────────────────────────────────────

/**
 * Log an incoming webhook for debugging. Fire-and-forget (errors are swallowed).
 */
async function logWebhook(supabaseUrl, serviceKey, source, endpoint, payload, status = "received") {
  try {
    const url = `${base(supabaseUrl)}/webhook_logs`;
    await fetch(url, {
      method: "POST",
      headers: restHeaders(serviceKey, "return=minimal"),
      body: JSON.stringify({ source, endpoint, payload, status }),
    });
  } catch (_) {
    // Never let logging break the main flow
  }
}

module.exports = {
  // contacts
  getContactByPhone,
  insertContact,
  updateContact,
  upsertContact,
  // lead_state
  getLeadState,
  insertLeadState,
  updateLeadState,
  upsertLeadState,
  // events
  insertEvent,
  // knowledge_gaps
  insertKnowledgeGap,
  getPendingKnowledgeGaps,
  updateKnowledgeGapDecision,
  markKnowledgeGapAdded,
  // notes
  insertNote,
  // call_transcripts
  insertCallTranscript,
  // webhook_logs
  logWebhook,
};
