-- Contacts directory names: use first_name + last_name (migration 020),
-- not full_name first-token only. The Clients list was dropping last names
-- such as Orozco when the unified winner row came from contacts.

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
SET search_path = public
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
      CASE
        WHEN strpos(COALESCE(f.sender_name, ''), ' ') > 0
          THEN NULLIF(BTRIM(substring(f.sender_name FROM strpos(f.sender_name, ' ') + 1)), '')
        ELSE ''
      END AS last_name,
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
      COALESCE(
        NULLIF(BTRIM(c.first_name), ''),
        NULLIF(BTRIM(SPLIT_PART(COALESCE(c.full_name, ''), ' ', 1)), ''),
        ''
      ) AS first_name,
      COALESCE(
        NULLIF(BTRIM(c.last_name), ''),
        CASE
          WHEN strpos(COALESCE(c.full_name, ''), ' ') > 0
            THEN NULLIF(BTRIM(substring(c.full_name FROM strpos(c.full_name, ' ') + 1)), '')
          ELSE NULL
        END,
        ''
      ) AS last_name,
      COALESCE(
        NULLIF(BTRIM(c.full_name), ''),
        NULLIF(BTRIM(CONCAT_WS(' ', c.first_name, c.last_name)), ''),
        'Unknown'
      ) AS display_name,
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
