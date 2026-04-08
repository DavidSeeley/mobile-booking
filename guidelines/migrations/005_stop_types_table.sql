-- =============================================================================
-- Migration 005 — Create stop_types Table
-- =============================================================================
-- Standalone lookup table for home/stop types used on the address step.
-- No foreign key links at this time.
--
-- Run in Supabase: SQL Editor → paste → Run
-- =============================================================================

CREATE TABLE IF NOT EXISTS stop_types (
  id     integer PRIMARY KEY,
  name   text    NOT NULL,
  ratio  integer NOT NULL DEFAULT 1,
  active integer NOT NULL DEFAULT 1
);

-- Seed with known stop types (IDs match existing data)
INSERT INTO stop_types (id, name, ratio, active) VALUES
  (1,  'Single Family', 1, 1),
  (2,  'Apartment',     1, 1),
  (6,  'Condo',         1, 1),
  (10, 'Duplex',        1, 1),
  (11, 'Storage Unit',  1, 1),
  (16, 'Rambler',       1, 1)
ON CONFLICT (id) DO NOTHING;
