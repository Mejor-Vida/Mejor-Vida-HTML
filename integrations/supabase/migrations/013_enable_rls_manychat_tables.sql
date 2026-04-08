-- Tables added after 010; keep Supabase Advisor clean (anon blocked; service role bypasses RLS).

ALTER TABLE manychat_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE unanswered_questions ENABLE ROW LEVEL SECURITY;
