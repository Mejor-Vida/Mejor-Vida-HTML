-- Website chatbot + retrieval knowledge (RAG). Separate from quote_lead_submissions / fex_email_quotes.
-- Requires pgvector for knowledge_chunks.embedding (OpenAI embeddings, 1536 dims).

CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- Provenance for imports (Google Sheets, manual, Julie-approved, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE knowledge_sources (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  name         text NOT NULL,
  source_type  text NOT NULL DEFAULT 'manual',
  external_ref text,
  notes        text
);

CREATE INDEX idx_knowledge_sources_created ON knowledge_sources (created_at DESC);

COMMENT ON TABLE knowledge_sources IS 'Where knowledge rows came from (sheet import, Julie, carrier doc, etc.).';

-- ---------------------------------------------------------------------------
-- Structured carrier / product facts (not the legacy quote-engine tables)
-- ---------------------------------------------------------------------------
CREATE TABLE carriers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name       text NOT NULL,
  slug       text UNIQUE,
  status     text NOT NULL DEFAULT 'active',
  notes      text
);

CREATE INDEX idx_carriers_status ON carriers (status);

CREATE TABLE products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  carrier_id   uuid NOT NULL REFERENCES carriers (id) ON DELETE CASCADE,
  name         text NOT NULL,
  product_line text,
  status       text NOT NULL DEFAULT 'active',
  notes        text
);

CREATE INDEX idx_products_carrier ON products (carrier_id);

CREATE TABLE state_availability (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  product_id  uuid NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  state_code  char(2) NOT NULL,
  available   boolean NOT NULL DEFAULT true,
  notes       text,
  UNIQUE (product_id, state_code)
);

CREATE INDEX idx_state_availability_state ON state_availability (state_code);

CREATE TABLE underwriting_rules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  product_id  uuid NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  rule_key    text NOT NULL,
  rule_value  jsonb NOT NULL DEFAULT '{}',
  notes       text
);

CREATE INDEX idx_underwriting_rules_product ON underwriting_rules (product_id);

-- ---------------------------------------------------------------------------
-- FAQ (short Q/A) + marketing copy (separate table for clear retrieval filters)
-- ---------------------------------------------------------------------------
CREATE TABLE faq_entries (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  question       text,
  answer         text NOT NULL,
  locale         text NOT NULL DEFAULT 'en',
  status         text NOT NULL DEFAULT 'draft',
  content_class  text NOT NULL DEFAULT 'faq',
  reviewed_at    timestamptz,
  reviewed_by    text,
  source_id      uuid REFERENCES knowledge_sources (id) ON DELETE SET NULL
);

CREATE INDEX idx_faq_entries_status ON faq_entries (status);
CREATE INDEX idx_faq_entries_locale ON faq_entries (locale);

CREATE TABLE marketing_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  title       text NOT NULL,
  body        text NOT NULL,
  source_id   uuid REFERENCES knowledge_sources (id) ON DELETE SET NULL,
  status      text NOT NULL DEFAULT 'draft',
  reviewed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Long-form docs split into chunks for embedding + retrieval
-- ---------------------------------------------------------------------------
CREATE TABLE knowledge_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  title       text NOT NULL,
  source_id   uuid REFERENCES knowledge_sources (id) ON DELETE SET NULL,
  status      text NOT NULL DEFAULT 'draft',
  reviewed_at timestamptz
);

CREATE INDEX idx_knowledge_documents_status ON knowledge_documents (status);

CREATE TABLE knowledge_chunks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  document_id  uuid NOT NULL REFERENCES knowledge_documents (id) ON DELETE CASCADE,
  chunk_index  int NOT NULL DEFAULT 0,
  content      text NOT NULL,
  embedding    vector(1536),
  metadata     jsonb NOT NULL DEFAULT '{}',
  status       text NOT NULL DEFAULT 'draft',
  reviewed_at  timestamptz,
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX idx_knowledge_chunks_document ON knowledge_chunks (document_id);
CREATE INDEX idx_knowledge_chunks_status ON knowledge_chunks (status);

COMMENT ON COLUMN knowledge_chunks.embedding IS 'OpenAI text-embedding-3-small / ada-002 compatible dimension 1536.';

-- ---------------------------------------------------------------------------
-- Julie-approved canonical answers (can feed into chunks + faq on approve)
-- ---------------------------------------------------------------------------
CREATE TABLE approved_answers (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now(),
  question_normalized        text,
  question_original          text,
  answer_text                text NOT NULL,
  locale                     text NOT NULL DEFAULT 'en',
  status                     text NOT NULL DEFAULT 'approved',
  source_id                  uuid REFERENCES knowledge_sources (id) ON DELETE SET NULL,
  derived_from_escalation_id uuid
);

CREATE INDEX idx_approved_answers_locale ON approved_answers (locale);
CREATE INDEX idx_approved_answers_status ON approved_answers (status);

-- ---------------------------------------------------------------------------
-- Website chat session (before/after link to quote_lead_submissions)
-- ---------------------------------------------------------------------------
CREATE TABLE website_chat_sessions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  lead_submission_id   uuid REFERENCES quote_lead_submissions (id) ON DELETE SET NULL,
  first_name           text,
  last_name            text,
  captured_email       text,
  captured_phone       text,
  phase                text NOT NULL DEFAULT 'collecting_contact',
  locale               text NOT NULL DEFAULT 'es',
  metadata             jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_website_chat_sessions_created ON website_chat_sessions (created_at DESC);
CREATE INDEX idx_website_chat_sessions_email ON website_chat_sessions (captured_email);
CREATE INDEX idx_website_chat_sessions_lead ON website_chat_sessions (lead_submission_id);

COMMENT ON COLUMN website_chat_sessions.phase IS 'collecting_contact | ready_for_qa | closed';

-- ---------------------------------------------------------------------------
-- Escalations when retrieval cannot ground an answer
-- ---------------------------------------------------------------------------
CREATE TABLE escalated_questions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  chat_session_id     uuid REFERENCES website_chat_sessions (id) ON DELETE SET NULL,
  user_question       text NOT NULL,
  locale              text NOT NULL DEFAULT 'es',
  status              text NOT NULL DEFAULT 'open',
  retrieval_debug     jsonb NOT NULL DEFAULT '{}',
  resolved_answer_id  uuid REFERENCES approved_answers (id) ON DELETE SET NULL
);

CREATE INDEX idx_escalated_questions_session ON escalated_questions (chat_session_id);
CREATE INDEX idx_escalated_questions_status ON escalated_questions (status);

COMMENT ON COLUMN escalated_questions.retrieval_debug IS 'Optional: top-k scores, chunk ids, for audit.';

-- Link approved answers back to escalations (optional)
ALTER TABLE approved_answers
  ADD CONSTRAINT fk_approved_from_escalation
  FOREIGN KEY (derived_from_escalation_id)
  REFERENCES escalated_questions (id)
  ON DELETE SET NULL;

CREATE INDEX idx_approved_answers_escalation ON approved_answers (derived_from_escalation_id);

-- Vector ANN index: add in a follow-up migration after chunks have embeddings, e.g.:
-- CREATE INDEX idx_knowledge_chunks_embedding_hnsw ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
