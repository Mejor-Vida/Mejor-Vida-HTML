-- Staff CRM YouTube tab: scripts, recordings, cut plans, publish state.

CREATE TABLE IF NOT EXISTS public.youtube_page_scripts (
  slug            text PRIMARY KEY,
  title           text,
  group_id        text,
  url_es          text,
  url_en          text,
  breakdown       text NOT NULL DEFAULT '',
  script_en       text NOT NULL DEFAULT '',
  script_es       text NOT NULL DEFAULT '',
  status          text NOT NULL DEFAULT 'empty'
                    CHECK (status IN (
                      'empty', 'draft', 'approved', 'recorded', 'analyzed', 'review', 'ready', 'published'
                    )),
  chat            jsonb NOT NULL DEFAULT '[]'::jsonb,
  recording_path  text,
  recording_mime  text,
  transcript      text,
  cut_plan        jsonb,
  review_notes    text,
  youtube_id      text,
  updated_by      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'youtube-recordings',
  'youtube-recordings',
  false,
  52428800,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS youtube_recordings_service ON storage.objects;
CREATE POLICY youtube_recordings_service
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'youtube-recordings')
  WITH CHECK (bucket_id = 'youtube-recordings');

COMMENT ON TABLE public.youtube_page_scripts IS
  'Staff-only YouTube teaching scripts Julie records herself. Service role only.';

ALTER TABLE public.youtube_page_scripts ENABLE ROW LEVEL SECURITY;
