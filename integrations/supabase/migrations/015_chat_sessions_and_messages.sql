-- Chat sessions: one per browser tab (identified by session_id)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE, -- Unique identifier from frontend (e.g., UUID or timestamp)
  language TEXT NOT NULL DEFAULT 'English', -- User's preferred language
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON public.chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON public.chat_sessions(created_at DESC);

COMMENT ON TABLE public.chat_sessions IS 'One row per unique chat session (browser tab). Links all messages in a conversation.';
COMMENT ON COLUMN public.chat_sessions.session_id IS 'Unique identifier from frontend (sessionStorage or localStorage).';

-- Chat messages: all messages in a session
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at);

COMMENT ON TABLE public.chat_messages IS 'All messages in a session. Store as plain text (no PII). Used to provide conversation history to RAG pipeline.';
COMMENT ON COLUMN public.chat_messages.role IS 'Either "user" (from contact) or "assistant" (from AI).';

-- Optional: Enable auto-deletion of old sessions (privacy)
-- Uncomment if you want to auto-delete sessions older than 7 days:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule(
--   'delete-old-chat-sessions',
--   '0 2 * * *', -- 2am daily
--   'DELETE FROM public.chat_sessions WHERE created_at < NOW() - INTERVAL ''7 days'''
-- );
