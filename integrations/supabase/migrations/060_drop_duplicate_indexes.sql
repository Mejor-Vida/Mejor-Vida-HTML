-- Performance Advisor: duplicate indexes (splinter 0009)
-- Extra indexes were created outside repo migrations with identical column definitions.

-- nurture_sequence: contact_id indexed twice
DROP INDEX IF EXISTS public.idx_nurture_contact_id;

-- nurture_sequence: next_send_at partial index duplicated
DROP INDEX IF EXISTS public.idx_nurture_active_due;

-- out_of_state_referrals: email indexed twice
DROP INDEX IF EXISTS public.idx_oos_referrals_email;
