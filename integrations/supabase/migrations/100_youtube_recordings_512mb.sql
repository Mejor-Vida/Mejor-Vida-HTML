-- iPhone camera MOVs are often well over 50 MB. Store the original;
-- the CRM extracts a small WAV for Whisper comparison.

UPDATE storage.buckets
SET file_size_limit = 536870912
WHERE id = 'youtube-recordings';
