-- Staff CRM — MVI virtual mailbox (scanned business mail).

CREATE TABLE IF NOT EXISTS public.staff_mailbox_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  from_name         text,
  received_on       date NOT NULL DEFAULT (CURRENT_DATE),
  filename          text NOT NULL,
  content_type      text NOT NULL DEFAULT 'application/pdf',
  storage_path      text NOT NULL,
  file_size_bytes   integer,
  source_id         text,
  notes             text,
  uploaded_by       text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_mailbox_items_received
  ON public.staff_mailbox_items (received_on DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_staff_mailbox_items_title_lower
  ON public.staff_mailbox_items (lower(title));

CREATE INDEX IF NOT EXISTS idx_staff_mailbox_items_from_lower
  ON public.staff_mailbox_items (lower(from_name));

CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_mailbox_items_source_id
  ON public.staff_mailbox_items (source_id)
  WHERE source_id IS NOT NULL;

COMMENT ON TABLE public.staff_mailbox_items IS
  'Scanned virtual-mailbox PDFs for MVI — files in private Supabase Storage bucket staff-mailbox.';

ALTER TABLE public.staff_mailbox_items ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'staff-mailbox',
  'staff-mailbox',
  false,
  15728640,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
