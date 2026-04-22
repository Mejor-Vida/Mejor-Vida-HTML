-- Phase 2 staff inbox fields for unresolved question triage workflow.
-- Safe to run multiple times.

ALTER TABLE unanswered_questions
  ADD COLUMN IF NOT EXISTS edited_question text,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_by text,
  ADD COLUMN IF NOT EXISTS rag_pushed boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_unanswered_questions_resolved
  ON unanswered_questions (resolved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_unanswered_questions_rag_pushed
  ON unanswered_questions (rag_pushed, created_at DESC);
