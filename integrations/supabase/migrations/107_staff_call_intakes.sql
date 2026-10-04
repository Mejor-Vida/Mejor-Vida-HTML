-- Phone call drop: staff uploads or pastes a recorded-call transcript,
-- the server extracts client fields, and Julie applies them to a CRM lead.
-- Audio files stay in a private bucket (not public, not RAG).

CREATE TABLE IF NOT EXISTS public.staff_call_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by text,
  status text NOT NULL DEFAULT 'received'
    CHECK (status IN (
      'received', 'uploaded', 'processing', 'ready', 'applied', 'discarded', 'error'
    )),
  source text NOT NULL DEFAULT 'upload'
    CHECK (source IN ('upload', 'paste', 'mms')),
  source_ref text,
  hint_phone text,
  recording_path text,
  recording_mime text,
  transcript_text text,
  extracted jsonb NOT NULL DEFAULT '{}'::jsonb,
  matched_lead_id uuid,
  matched_lead_source_table text,
  match_label text,
  applied_fields jsonb,
  error_text text,
  applied_at timestamptz,
  applied_by text
);

CREATE INDEX IF NOT EXISTS idx_staff_call_intakes_created
  ON public.staff_call_intakes (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_staff_call_intakes_status
  ON public.staff_call_intakes (status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_call_intakes_source_ref
  ON public.staff_call_intakes (source_ref)
  WHERE source_ref IS NOT NULL AND source_ref <> '';

COMMENT ON TABLE public.staff_call_intakes IS
  'Staff-only call recordings/transcripts waiting to fill CRM client fields. Service role only.';

ALTER TABLE public.staff_call_intakes ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'call-intakes',
  'call-intakes',
  false,
  52428800,
  ARRAY[
    'audio/mpeg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/m4a',
    'audio/wav',
    'audio/x-wav',
    'audio/webm',
    'audio/ogg',
    'audio/aac',
    'audio/3gpp',
    'audio/amr',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS call_intakes_service ON storage.objects;
CREATE POLICY call_intakes_service
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'call-intakes')
  WITH CHECK (bucket_id = 'call-intakes');
