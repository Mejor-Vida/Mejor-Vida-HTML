-- Optional language alias (e.g. ManyChat {{idioma}}). App prefers idioma over language when set.
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS idioma text;
COMMENT ON COLUMN contacts.idioma IS 'Language preference (english|spanish); optional mirror of language.';
