-- Staff CRM: personal to-do lists for Julie and Justin.

CREATE TABLE IF NOT EXISTS public.staff_todo_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner      text NOT NULL CHECK (owner IN ('julie', 'justin')),
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text
);

CREATE INDEX IF NOT EXISTS idx_staff_todo_items_owner_created
  ON public.staff_todo_items (owner, created_at DESC);

COMMENT ON TABLE public.staff_todo_items IS
  'Staff CRM personal to-do items per owner (julie | justin).';

ALTER TABLE public.staff_todo_items ENABLE ROW LEVEL SECURITY;
