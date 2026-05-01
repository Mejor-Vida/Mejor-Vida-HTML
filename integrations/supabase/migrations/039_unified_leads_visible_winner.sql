-- Fix "disappearing" unified leads when a staff-hidden row or merge-token junk row
-- out-scored a real lead inside the same email/phone/name partition.

CREATE OR REPLACE VIEW public.unified_leads AS
WITH ranked AS (
  SELECT
    r.*,
    COALESCE(NULLIF(LOWER(BTRIM(r.email)), ''), NULL) AS email_key,
    COALESCE(NULLIF(REGEXP_REPLACE(COALESCE(r.phone, ''), '\D', '', 'g'), ''), NULL) AS phone_key,
    COALESCE(NULLIF(LOWER(BTRIM(r.display_name)), ''), NULL) AS name_key
  FROM public.unified_leads_rows() r
),
ranked_visible AS (
  SELECT
    r.*,
    COALESCE(r.email_key, r.phone_key, r.name_key, r.source_table || ':' || r.source_id::text) AS dedupe_key
  FROM ranked r
  LEFT JOIN public.staff_hidden_leads h ON (
    (h.source_table IS NOT NULL
     AND h.source_id IS NOT NULL
     AND h.source_table = r.source_table
     AND h.source_id = r.source_id)
    OR (
      (h.source_table IS NULL OR h.source_id IS NULL)
      AND h.dedupe_key = COALESCE(r.email_key, r.phone_key, r.name_key, r.source_table || ':' || r.source_id::text)
    )
  )
  WHERE h.id IS NULL
),
deduped AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY dedupe_key
      ORDER BY
        (
          (CASE
            WHEN NULLIF(BTRIM(COALESCE(email, '')), '') IS NOT NULL
              AND COALESCE(email, '') !~ '\{\{'
              AND COALESCE(email, '') !~ '\}\}'
              THEN 8
            ELSE 0
          END) +
          (CASE
            WHEN NULLIF(BTRIM(COALESCE(last_name, '')), '') IS NOT NULL
              AND COALESCE(last_name, '') !~ '\{\{'
              AND COALESCE(last_name, '') !~ '\}\}'
              THEN 4
            ELSE 0
          END) +
          (CASE
            WHEN NULLIF(BTRIM(COALESCE(first_name, '')), '') IS NOT NULL
              AND COALESCE(first_name, '') !~ '\{\{'
              AND COALESCE(first_name, '') !~ '\}\}'
              THEN 1
            ELSE 0
          END)
        ) DESC,
        CASE
          WHEN COALESCE(first_name, '') ~ '\{\{' OR COALESCE(last_name, '') ~ '\{\{'
            OR COALESCE(phone, '') ~ '\{\{'
            OR COALESCE(email, '') ~ '\{\{'
            THEN 1
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
  FROM ranked_visible
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
  'Read-only lead directory for staff compose. Dedupes by email/phone/name; winner chosen only among non-hidden rows, with completeness ignoring ManyChat merge tokens.';
