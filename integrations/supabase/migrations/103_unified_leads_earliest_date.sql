-- Date added = earliest row in the person partition.
-- Dedupe by last-10 phone digits first so adding an email later does not
-- split the same WhatsApp lead into a second Clients-list card.

CREATE OR REPLACE VIEW public.unified_leads AS
WITH ranked AS (
  SELECT
    r.*,
    COALESCE(NULLIF(LOWER(BTRIM(r.email)), ''), NULL) AS email_key,
    CASE
      WHEN LENGTH(REGEXP_REPLACE(COALESCE(r.phone, ''), '\D', '', 'g')) >= 10
        THEN RIGHT(REGEXP_REPLACE(COALESCE(r.phone, ''), '\D', '', 'g'), 10)
      ELSE NULL
    END AS phone_key,
    COALESCE(NULLIF(LOWER(BTRIM(r.display_name)), ''), NULL) AS name_key
  FROM public.unified_leads_rows() r
),
ranked_keyed AS (
  SELECT
    r.*,
    COALESCE(r.phone_key, r.email_key, r.name_key, r.source_table || ':' || r.source_id::text) AS dedupe_key
  FROM ranked r
),
ranked_visible AS (
  SELECT r.*
  FROM ranked_keyed r
  LEFT JOIN public.staff_hidden_leads h ON (
    (h.source_table IS NOT NULL
     AND h.source_id IS NOT NULL
     AND h.source_table = r.source_table
     AND h.source_id = r.source_id)
    OR (
      (h.source_table IS NULL OR h.source_id IS NULL)
      AND h.dedupe_key = r.dedupe_key
    )
  )
  WHERE h.id IS NULL
),
with_first_seen AS (
  SELECT
    r.*,
    MIN(r.lead_created_at) OVER (PARTITION BY r.dedupe_key) AS first_seen_at,
    COUNT(*) OVER (PARTITION BY r.dedupe_key) AS partition_count
  FROM ranked_visible r
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
        lead_created_at ASC NULLS LAST
    ) AS rn
  FROM with_first_seen
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
  first_seen_at AS created_at,
  lead_updated_at AS updated_at
FROM deduped
WHERE rn = 1
ORDER BY LOWER(display_name), LOWER(email), LOWER(phone);

ALTER VIEW public.unified_leads SET (security_invoker = on);

COMMENT ON VIEW public.unified_leads IS
  'Staff Clients directory. One row per phone (last 10) or email. Date added is the earliest source row in that person partition.';
