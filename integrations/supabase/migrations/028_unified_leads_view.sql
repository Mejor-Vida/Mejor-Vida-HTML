-- Unified lead directory across lead pipelines.
-- Keeps source tables unchanged; this is read-only normalization for staff lookup UX.

CREATE OR REPLACE FUNCTION public.unified_leads_rows()
RETURNS TABLE (
  source_table text,
  source_id uuid,
  first_name text,
  last_name text,
  display_name text,
  email text,
  phone text,
  language text,
  source text,
  lead_created_at timestamptz,
  lead_updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  has_manychat_hidden boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'manychat_leads'
      AND column_name = 'staff_hidden_at'
  )
  INTO has_manychat_hidden;

  IF to_regclass('public.manychat_leads') IS NOT NULL THEN
    IF has_manychat_hidden THEN
      RETURN QUERY
      SELECT
        'manychat_leads'::text AS source_table,
        m.id AS source_id,
        COALESCE(m.first_name, '') AS first_name,
        COALESCE(m.last_name, '') AS last_name,
        COALESCE(NULLIF(BTRIM(CONCAT_WS(' ', m.first_name, m.last_name)), ''), 'Unknown') AS display_name,
        BTRIM(COALESCE(m.email, '')) AS email,
        BTRIM(COALESCE(m.phone, '')) AS phone,
        COALESCE(NULLIF(BTRIM(m.language), ''), 'English') AS language,
        COALESCE(NULLIF(BTRIM(m.source), ''), 'manychat_whatsapp') AS source,
        m.created_at AS lead_created_at,
        m.updated_at AS lead_updated_at
      FROM public.manychat_leads m
      WHERE m.staff_hidden_at IS NULL;
    ELSE
      RETURN QUERY
      SELECT
        'manychat_leads'::text AS source_table,
        m.id AS source_id,
        COALESCE(m.first_name, '') AS first_name,
        COALESCE(m.last_name, '') AS last_name,
        COALESCE(NULLIF(BTRIM(CONCAT_WS(' ', m.first_name, m.last_name)), ''), 'Unknown') AS display_name,
        BTRIM(COALESCE(m.email, '')) AS email,
        BTRIM(COALESCE(m.phone, '')) AS phone,
        COALESCE(NULLIF(BTRIM(m.language), ''), 'English') AS language,
        COALESCE(NULLIF(BTRIM(m.source), ''), 'manychat_whatsapp') AS source,
        m.created_at AS lead_created_at,
        m.updated_at AS lead_updated_at
      FROM public.manychat_leads m;
    END IF;
  END IF;

  IF to_regclass('public.quote_lead_submissions') IS NOT NULL THEN
    RETURN QUERY
    SELECT
      'quote_lead_submissions'::text AS source_table,
      q.id AS source_id,
      COALESCE(q.first_name, '') AS first_name,
      COALESCE(q.last_name, '') AS last_name,
      COALESCE(NULLIF(BTRIM(CONCAT_WS(' ', q.first_name, q.last_name)), ''), 'Unknown') AS display_name,
      BTRIM(COALESCE(q.email, '')) AS email,
      BTRIM(COALESCE(q.phone, '')) AS phone,
      COALESCE(NULLIF(BTRIM(q.lang), ''), 'English') AS language,
      COALESCE(NULLIF(BTRIM(q.source), ''), 'website_quote_tool') AS source,
      q.created_at AS lead_created_at,
      q.created_at AS lead_updated_at
    FROM public.quote_lead_submissions q;
  END IF;

  IF to_regclass('public.whatsapp_leads') IS NOT NULL THEN
    RETURN QUERY
    SELECT
      'whatsapp_leads'::text AS source_table,
      w.id AS source_id,
      COALESCE(w.first_name, '') AS first_name,
      COALESCE(w.last_name, '') AS last_name,
      COALESCE(NULLIF(BTRIM(CONCAT_WS(' ', w.first_name, w.last_name)), ''), 'Unknown') AS display_name,
      BTRIM(COALESCE(w.email, '')) AS email,
      BTRIM(COALESCE(w.phone, '')) AS phone,
      COALESCE(NULLIF(BTRIM(w.language), ''), 'English') AS language,
      COALESCE(NULLIF(BTRIM(w.lead_source), ''), 'whatsapp_webhook') AS source,
      w.created_at AS lead_created_at,
      w.created_at AS lead_updated_at
    FROM public.whatsapp_leads w;
  END IF;

  IF to_regclass('public.fex_email_quotes') IS NOT NULL THEN
    RETURN QUERY
    SELECT
      'fex_email_quotes'::text AS source_table,
      f.id AS source_id,
      COALESCE(NULLIF(BTRIM(SPLIT_PART(COALESCE(f.sender_name, ''), ' ', 1)), ''), '') AS first_name,
      ''::text AS last_name,
      COALESCE(NULLIF(BTRIM(f.sender_name), ''), 'Unknown') AS display_name,
      BTRIM(COALESCE(f.sender_email, '')) AS email,
      ''::text AS phone,
      'English'::text AS language,
      COALESCE(NULLIF(BTRIM(f.source), ''), 'fex_email') AS source,
      f.created_at AS lead_created_at,
      f.created_at AS lead_updated_at
    FROM public.fex_email_quotes f;
  END IF;

  IF to_regclass('public.contacts') IS NOT NULL THEN
    RETURN QUERY
    SELECT
      'contacts'::text AS source_table,
      c.id AS source_id,
      COALESCE(NULLIF(BTRIM(SPLIT_PART(COALESCE(c.full_name, ''), ' ', 1)), ''), '') AS first_name,
      ''::text AS last_name,
      COALESCE(NULLIF(BTRIM(c.full_name), ''), 'Unknown') AS display_name,
      BTRIM(COALESCE(c.email, '')) AS email,
      BTRIM(COALESCE(c.phone, '')) AS phone,
      COALESCE(NULLIF(BTRIM(c.language), ''), 'english') AS language,
      COALESCE(NULLIF(BTRIM(c.source), ''), 'contacts') AS source,
      c.created_at AS lead_created_at,
      c.updated_at AS lead_updated_at
    FROM public.contacts c;
  END IF;
END;
$$;

CREATE OR REPLACE VIEW public.unified_leads AS
WITH ranked AS (
  SELECT
    r.*,
    COALESCE(NULLIF(LOWER(BTRIM(r.email)), ''), NULL) AS email_key,
    COALESCE(NULLIF(REGEXP_REPLACE(COALESCE(r.phone, ''), '\D', '', 'g'), ''), NULL) AS phone_key,
    COALESCE(NULLIF(LOWER(BTRIM(r.display_name)), ''), NULL) AS name_key
  FROM public.unified_leads_rows() r
),
deduped AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(email_key, phone_key, name_key, source_table || ':' || source_id::text)
      ORDER BY
        CASE source_table
          WHEN 'manychat_leads' THEN 1
          WHEN 'contacts' THEN 2
          WHEN 'quote_lead_submissions' THEN 3
          WHEN 'whatsapp_leads' THEN 4
          WHEN 'fex_email_quotes' THEN 5
          ELSE 9
        END,
        lead_created_at DESC NULLS LAST
    ) AS rn
  FROM ranked
)
SELECT
  source_id AS id,
  source_table,
  COALESCE(NULLIF(source, ''), source_table) AS source,
  first_name,
  last_name,
  display_name,
  email,
  phone,
  language,
  lead_created_at AS created_at,
  lead_updated_at AS updated_at
FROM deduped
WHERE rn = 1
ORDER BY LOWER(display_name), LOWER(email), LOWER(phone);

COMMENT ON VIEW public.unified_leads IS
  'Read-only lead directory for staff compose. Dedupes manychat_leads, quote_lead_submissions, whatsapp_leads, fex_email_quotes, and contacts when present.';
