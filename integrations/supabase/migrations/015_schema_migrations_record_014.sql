-- If 014 was applied in the Supabase SQL editor (not via apply_migrations.py), insert the tracker row.
INSERT INTO schema_migrations (filename) VALUES ('014_quote_ranges.sql') ON CONFLICT DO NOTHING;
