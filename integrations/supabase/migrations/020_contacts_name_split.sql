-- ============================================================
-- 020_contacts_name_split.sql
-- Split contacts.full_name into first_name + last_name columns;
-- full_name becomes GENERATED STORED (read-only).
--
-- Idempotent: safe if a prior partial run dropped full_name before
-- the generated column was added (recovery path included).
-- ============================================================

-- ── 1. Add split-name columns ─────────────────────────────────
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name  text;

COMMENT ON COLUMN contacts.first_name IS 'Given name. Primary column for personalization and HubSpot sync.';
COMMENT ON COLUMN contacts.last_name  IS 'Family name. Nullable — often blank for WhatsApp-sourced leads.';

-- ── 2. Backfill from plain full_name, then drop it (only if still a regular column) ─
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'contacts'
      AND column_name = 'full_name'
      AND (is_generated = 'NEVER' OR is_generated IS NULL)
  ) THEN
    UPDATE contacts
    SET
      first_name = COALESCE(first_name, NULLIF(trim(split_part(full_name, ' ', 1)), '')),
      last_name  = COALESCE(
                     last_name,
                     CASE
                       WHEN strpos(full_name, ' ') > 0
                         THEN NULLIF(trim(substring(full_name FROM strpos(full_name, ' ') + 1)), '')
                       ELSE NULL
                     END
                   )
    WHERE full_name IS NOT NULL
      AND (first_name IS NULL OR last_name IS NULL);

    ALTER TABLE contacts DROP COLUMN full_name;
  END IF;
END $$;

-- ── 3. Add full_name as GENERATED (btrim/coalesce/|| are IMMUTABLE) ─
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'contacts'
      AND column_name = 'full_name'
  ) THEN
    ALTER TABLE contacts
      ADD COLUMN full_name text
      GENERATED ALWAYS AS (
        NULLIF(btrim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '')
      ) STORED;
    COMMENT ON COLUMN contacts.full_name IS
      'Auto-computed from first_name + last_name. Read-only — do not write directly.';
  END IF;
END $$;

-- ── 4. Index first_name ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contacts_first_name ON contacts (first_name);
