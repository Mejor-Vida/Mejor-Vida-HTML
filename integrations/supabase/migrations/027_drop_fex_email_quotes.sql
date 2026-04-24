-- Retire legacy FEX email webhook storage.
-- Safe to run repeatedly.

DROP TABLE IF EXISTS fex_email_quotes;
