-- Queue for the three weekly Facebook posts (Sunday after live blog, Tue 10am, Thu 10am Chicago).
-- RLS on, no anon/authenticated policies — service_role only.

CREATE TABLE IF NOT EXISTS public.weekly_facebook_queue (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_key        date NOT NULL,
  slot            smallint NOT NULL CHECK (slot IN (1, 2, 3)),
  story_url       text NOT NULL,
  image_url       text NOT NULL,
  title           text,
  main_caption    text NOT NULL,
  first_comment   text NOT NULL,
  publish_at      timestamptz NOT NULL,
  published_at    timestamptz,
  fb_post_id      text,
  comment_at      timestamptz,
  commented_at    timestamptz,
  fb_comment_id   text,
  status          text NOT NULL DEFAULT 'queued'
                    CHECK (status IN ('queued', 'posted', 'commented', 'error')),
  error_message   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_key, slot)
);

CREATE INDEX IF NOT EXISTS weekly_facebook_queue_due_idx
  ON public.weekly_facebook_queue (status, publish_at);

CREATE INDEX IF NOT EXISTS weekly_facebook_queue_comment_due_idx
  ON public.weekly_facebook_queue (status, comment_at);

COMMENT ON TABLE public.weekly_facebook_queue IS
  'Staff-only queue: weekly Spanish Facebook posts from the live digest. Not for public APIs.';

ALTER TABLE public.weekly_facebook_queue ENABLE ROW LEVEL SECURITY;
