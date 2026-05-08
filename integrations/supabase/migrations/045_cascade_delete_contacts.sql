-- Ensure contact_id → contacts(id) uses ON DELETE CASCADE on pipeline-related tables.
-- When a contact is deleted (e.g. from Lead Profile), dependent rows are removed automatically.
-- Idempotent: only replaces FKs that are not already CASCADE.

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT
      c.conname,
      n.nspname AS schema_name,
      rel.relname AS table_name
    FROM pg_constraint c
    INNER JOIN pg_class rel ON rel.oid = c.conrelid
    INNER JOIN pg_namespace n ON n.oid = rel.relnamespace
    INNER JOIN pg_class cref ON cref.oid = c.confrelid
    INNER JOIN pg_namespace nref ON nref.oid = cref.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND nref.nspname = 'public'
      AND cref.relname = 'contacts'
      AND rel.relname IN (
        'lead_state',
        'events',
        'nurture_sequence',
        'nurture_delivery_log',
        'nurture_message_overrides'
      )
      AND c.confdeltype IS DISTINCT FROM 'c'
      AND c.conkey IS NOT NULL
      AND array_length(c.conkey, 1) = 1
      AND EXISTS (
        SELECT 1
        FROM unnest(c.conkey) AS u(attnum)
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = u.attnum
        WHERE a.attname = 'contact_id'
      )
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I DROP CONSTRAINT %I',
      rec.schema_name, rec.table_name, rec.conname
    );
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE',
      rec.schema_name, rec.table_name, rec.conname
    );
    RAISE NOTICE '045: set ON DELETE CASCADE on %.% (constraint %)',
      rec.schema_name, rec.table_name, rec.conname;
  END LOOP;
END $$;
