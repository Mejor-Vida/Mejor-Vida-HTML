-- Human-readable descriptions for Supabase / Beekeeper / any client that shows pg_description.
-- Renaming tables is disruptive; comments document purpose without breaking code.

COMMENT ON TABLE schema_migrations IS 'Internal: which SQL migration files have been applied. Do not edit manually.';

COMMENT ON TABLE quote_lead_submissions IS 'Leads: website quote tool + Vercel POST /api/quote-lead-sync (and related flows). Not the chatbot UI.';

COMMENT ON TABLE fex_email_quotes IS 'Leads: FEX quote emails ingested via Make/webhook → api/fex-email-quote-webhook.js.';

COMMENT ON TABLE knowledge_sources IS 'Chatbot/RAG: where imported knowledge came from (e.g. Google Sheet import, manual, Julie).';

COMMENT ON TABLE carriers IS 'Chatbot/RAG: carrier reference facts (knowledge—not legacy pricing engine).';

COMMENT ON TABLE products IS 'Chatbot/RAG: products per carrier (final expense, etc.).';

COMMENT ON TABLE state_availability IS 'Chatbot/RAG: which products apply in which states.';

COMMENT ON TABLE underwriting_rules IS 'Chatbot/RAG: structured underwriting notes per product.';

COMMENT ON TABLE faq_entries IS 'Chatbot/RAG: short FAQ Q/A for retrieval.';

COMMENT ON TABLE marketing_notes IS 'Chatbot/RAG: marketing copy; tag separately from hard facts when retrieving.';

COMMENT ON TABLE knowledge_documents IS 'Chatbot/RAG: long-form source documents (split into chunks).';

COMMENT ON TABLE knowledge_chunks IS 'Chatbot/RAG: text segments + embeddings for semantic search.';

COMMENT ON TABLE approved_answers IS 'Chatbot/RAG: Julie-approved answers; can feed chunks for future retrieval.';

COMMENT ON TABLE website_chat_sessions IS 'Website chatbot: one row per visitor session (contact capture then Q&A).';

COMMENT ON TABLE escalated_questions IS 'Chatbot/RAG: user questions the bot could not ground; Julie resolves.';

-- whatsapp_leads / out_of_state_referrals: add COMMENT manually in SQL if those tables exist (not in repo migrations).
