-- Temporary holding for Julie's camera takes (iPhone MOVs are often well
-- over 50 MB). Store the original until the lesson is edited and on YouTube;
-- then delete it. The CRM extracts a small WAV for Whisper comparison.

UPDATE storage.buckets
SET file_size_limit = 536870912
WHERE id = 'youtube-recordings';
