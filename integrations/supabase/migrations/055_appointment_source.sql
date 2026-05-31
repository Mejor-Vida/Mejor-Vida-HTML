-- ============================================================
-- 055_appointment_source.sql
-- HubSpot scheduler appointment bookings (source: hubspot_scheduler)
-- Note: requested as 047 in spec; 047 is nurture_sequence_converted_at.
-- ============================================================

-- contacts.source is plain text (not an enum). Document the scheduler value.
COMMENT ON COLUMN contacts.source IS
  'Lead origin. Common values: whatsapp, facebook_landing_gastos_finales, nebraska_quote_page, hubspot_scheduler (HubSpot meeting booked).';

-- Idempotent safety — column exists from 017_nurture_pipeline_v2.sql
ALTER TABLE lead_state
  ADD COLUMN IF NOT EXISTS call_scheduled_at timestamptz;

COMMENT ON COLUMN lead_state.call_scheduled_at IS
  'ISO timestamp when the lead booked a call (HubSpot scheduler, Calendly, ManyChat, etc.).';
