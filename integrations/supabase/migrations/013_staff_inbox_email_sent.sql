-- Phase 3 staff inbox: track whether response email was sent.
ALTER TABLE unanswered_questions
  ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_unanswered_questions_email_sent
  ON unanswered_questions (email_sent, created_at DESC);
