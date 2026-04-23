-- Staff inbox: facts/context for AI (separate from the verbatim customer question).

ALTER TABLE unanswered_questions
  ADD COLUMN IF NOT EXISTS staff_context text;

COMMENT ON COLUMN unanswered_questions.staff_context IS
  'Optional notes from staff (facts, corrections) for draft generation and RAG push; not a rewrite of the customer question.';

-- Preserve anything previously stored as "edited question" into the new field when empty.
UPDATE unanswered_questions
SET staff_context = NULLIF(trim(edited_question), '')
WHERE (staff_context IS NULL OR trim(staff_context) = '')
  AND edited_question IS NOT NULL
  AND trim(edited_question) <> '';
