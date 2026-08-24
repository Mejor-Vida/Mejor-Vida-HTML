-- Public-comment AI replies on the Facebook Page (service role only).

CREATE TABLE IF NOT EXISTS public.facebook_comment_replies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id      text NOT NULL UNIQUE,
  post_id         text,
  from_id         text,
  comment_text    text,
  intent          text,
  reply_text      text,
  reply_id        text,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'replied', 'skipped', 'error')),
  skip_reason     text,
  error_message   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS facebook_comment_replies_post_idx
  ON public.facebook_comment_replies (post_id);

COMMENT ON TABLE public.facebook_comment_replies IS
  'Staff-only log of AI replies to Facebook Page comments. Not for public APIs.';

ALTER TABLE public.facebook_comment_replies ENABLE ROW LEVEL SECURITY;
