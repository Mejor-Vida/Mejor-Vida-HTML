-- ManyChat quote tool sends display strings (e.g. "$56.48") after qualification.
ALTER TABLE lead_state ADD COLUMN IF NOT EXISTS quote_low text;
ALTER TABLE lead_state ADD COLUMN IF NOT EXISTS quote_high text;

COMMENT ON COLUMN lead_state.quote_low IS 'Lower monthly premium bound from ManyChat / quote tool (display string).';
COMMENT ON COLUMN lead_state.quote_high IS 'Upper monthly premium bound from ManyChat / quote tool (display string).';
