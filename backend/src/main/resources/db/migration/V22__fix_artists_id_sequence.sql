-- Fix Postgres sequence drift for artists.id.
--
-- Symptom:
--   ERROR: duplicate key value violates unique constraint "artists_pkey"
--   Detail: Key (id)=(X) already exists.
--
-- Cause:
--   Past migrations/data loads inserted explicit IDs, but the underlying
--   serial sequence was not advanced. The next INSERT without an explicit
--   id can then reuse an existing id.
--
-- This sets the sequence to MAX(id)+1 (or 1 if table is empty).

SELECT setval(
    pg_get_serial_sequence('artists', 'id'),
    COALESCE((SELECT MAX(id) FROM artists), 0) + 1,
    false
);

