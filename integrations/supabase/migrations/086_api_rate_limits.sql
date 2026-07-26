-- Distributed API rate limits for Vercel serverless (website chat / RAG).
-- Atomic counter per (bucket, client_key, fixed window) via consume_rate_limit().

CREATE TABLE IF NOT EXISTS api_rate_limits (
  bucket       text NOT NULL,
  client_key   text NOT NULL,
  window_start timestamptz NOT NULL,
  hit_count    integer NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (bucket, client_key, window_start)
);

CREATE INDEX IF NOT EXISTS api_rate_limits_window_start_idx
  ON api_rate_limits (window_start);

COMMENT ON TABLE api_rate_limits IS
  'Fixed-window request counters for serverless rate limiting (service role / RPC only)';

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: anon/authenticated cannot read or write; service role bypasses RLS.

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_bucket text,
  p_client_key text,
  p_max integer,
  p_window_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_seconds integer;
  v_max integer;
  v_now timestamptz := clock_timestamp();
  v_epoch double precision;
  v_window_start timestamptz;
  v_count integer;
  v_retry integer;
BEGIN
  v_window_seconds := GREATEST(COALESCE(p_window_seconds, 60), 1);
  v_max := GREATEST(COALESCE(p_max, 1), 1);

  IF p_bucket IS NULL OR length(trim(p_bucket)) = 0 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retry_after_seconds', v_window_seconds,
      'current_count', 0,
      'error', 'missing_bucket'
    );
  END IF;

  IF p_client_key IS NULL OR length(trim(p_client_key)) = 0 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retry_after_seconds', v_window_seconds,
      'current_count', 0,
      'error', 'missing_client_key'
    );
  END IF;

  v_epoch := extract(epoch FROM v_now);
  v_window_start := to_timestamp(
    floor(v_epoch / v_window_seconds) * v_window_seconds
  );

  INSERT INTO api_rate_limits AS r (bucket, client_key, window_start, hit_count, updated_at)
  VALUES (trim(p_bucket), trim(p_client_key), v_window_start, 1, v_now)
  ON CONFLICT (bucket, client_key, window_start)
  DO UPDATE SET
    hit_count = r.hit_count + 1,
    updated_at = EXCLUDED.updated_at
  RETURNING hit_count INTO v_count;

  v_retry := GREATEST(
    ceil(
      extract(epoch FROM (v_window_start + make_interval(secs => v_window_seconds) - v_now))
    )::integer,
    1
  );

  IF v_count > v_max THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retry_after_seconds', v_retry,
      'current_count', v_count,
      'window_start', v_window_start
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', GREATEST(v_max - v_count, 0),
    'retry_after_seconds', 0,
    'current_count', v_count,
    'window_start', v_window_start
  );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, text, integer, integer) TO service_role;

-- Opportunistic cleanup of old windows (safe if nothing matches).
CREATE OR REPLACE FUNCTION public.cleanup_api_rate_limits(p_older_than_seconds integer DEFAULT 86400)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM api_rate_limits
  WHERE window_start < now() - make_interval(secs => GREATEST(COALESCE(p_older_than_seconds, 86400), 3600));
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_api_rate_limits(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_api_rate_limits(integer) TO service_role;
