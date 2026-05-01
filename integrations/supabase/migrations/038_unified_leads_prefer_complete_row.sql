-- When several sources share the same dedupe partition (e.g. same phone), prefer the
-- row with more contact fields filled — not only the newest created_at, which favored
-- repeated sparse WhatsApp "initial" captures over older rows with email + last name.

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
    COALESCE(email_key, phone_key, name_key, source_table || ':' || source_id::text) AS dedupe_key,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(email_key, phone_key, name_key, source_table || ':' || source_id::text)
      ORDER BY
        (
          (CASE WHEN NULLIF(BTRIM(COALESCE(email, '')), '') IS NOT NULL THEN 8 ELSE 0 END) +
          (CASE WHEN NULLIF(BTRIM(COALESCE(last_name, '')), '') IS NOT NULL THEN 4 ELSE 0 END) +
          (CASE WHEN NULLIF(BTRIM(COALESCE(first_name, '')), '') IS NOT NULL THEN 1 ELSE 0 END)
        ) DESC,
        CASE
          WHEN COALESCE(first_name, '') ~ '^\{\{' OR COALESCE(last_name, '') ~ '^\{\{'
            OR COALESCE(phone, '') ~ '^\{\{' THEN 1
          ELSE 0
        END ASC,
        CASE source_table
          WHEN 'manychat_leads' THEN 1
          WHEN 'contacts' THEN 2
          WHEN 'quote_lead_submissions' THEN 3
          WHEN 'whatsapp_leads' THEN 4
          WHEN 'fex_email_quotes' THEN 5
          ELSE 9
        END,
        lead_updated_at DESC NULLS LAST,
        lead_created_at DESC NULLS LAST
    ) AS rn
  FROM ranked
),
filtered AS (
  SELECT d.*
  FROM deduped d
  LEFT JOIN public.staff_hidden_leads h ON (
    (h.source_table IS NOT NULL
     AND h.source_id IS NOT NULL
     AND h.source_table = d.source_table
     AND h.source_id = d.source_id)
    OR (
      (h.source_table IS NULL OR h.source_id IS NULL)
      AND h.dedupe_key = d.dedupe_key
    )
  )
  WHERE d.rn = 1
    AND h.id IS NULL
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
FROM filtered
ORDER BY LOWER(display_name), LOWER(email), LOWER(phone);

COMMENT ON VIEW public.unified_leads IS
  'Read-only lead directory for staff compose. Dedupes by email/phone/name; within a partition prefers the most complete row, then manychat/contacts priority, then recency.';
