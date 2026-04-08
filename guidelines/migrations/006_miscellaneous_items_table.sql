-- =============================================================================
-- Migration 006 — Create miscellaneous_items Table
-- =============================================================================
-- Standalone lookup table for miscellaneous item categories shown on the
-- Miscellaneous step of the booking form.
--
-- Run in Supabase: SQL Editor → paste → Run
-- =============================================================================

CREATE TABLE IF NOT EXISTS miscellaneous_items (
  id     integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name   text    NOT NULL,
  ratio  numeric NOT NULL DEFAULT 1,
  active integer NOT NULL DEFAULT 1
);

-- Seed with the six default categories
INSERT INTO miscellaneous_items (name, ratio, active) VALUES
  ('Lighting',         1, 1),
  ('Cleaning',         1, 1),
  ('TVs and Monitors', 1, 1),
  ('Music Equipment',  1, 1),
  ('Sporting Goods',   1, 1),
  ('Kids Stuff',       1, 1);
