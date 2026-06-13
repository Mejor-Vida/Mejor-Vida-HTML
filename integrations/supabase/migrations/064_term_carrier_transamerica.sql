-- Migration 064: allow Transamerica in term_carrier_premiums
ALTER TABLE term_carrier_premiums DROP CONSTRAINT IF EXISTS term_carrier_premiums_carrier_check;
ALTER TABLE term_carrier_premiums ADD CONSTRAINT term_carrier_premiums_carrier_check
  CHECK (carrier IN ('moo', 'amam', 'assurity', 'transamerica'));

COMMENT ON TABLE term_carrier_premiums IS 'Raw term life rates — NE public quoter (Transamerica, AmAm, MOO, Assurity)';
