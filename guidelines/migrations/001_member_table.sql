-- =============================================================================
-- Migration 001 — Member Table & Building Link
-- =============================================================================
-- Creates the member table for account managers and links it to the
-- buildings and profile tables via trumuv_member_id.
--
-- Run in Supabase: SQL Editor → paste → Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Member table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trumuv_member_id integer UNIQUE NOT NULL,
  first_name       text,
  last_name        text,
  email            text,
  phone            text,
  created_at       timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2. Profile table — account manager fields
--    trumuv_member_id is stored as a plain integer (no FK) so profiles can be
--    saved before the corresponding member record exists.
-- -----------------------------------------------------------------------------
ALTER TABLE profile
  ADD COLUMN IF NOT EXISTS active            boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS trumuv_member_id  integer,
  ADD COLUMN IF NOT EXISTS sales_first_name  text,
  ADD COLUMN IF NOT EXISTS sales_last_name   text,
  ADD COLUMN IF NOT EXISTS sales_email       text,
  ADD COLUMN IF NOT EXISTS sales_phone       text;

-- -----------------------------------------------------------------------------
-- 3. Buildings table — plain integer reference to member (no FK constraint)
-- -----------------------------------------------------------------------------
ALTER TABLE buildings
  ADD COLUMN IF NOT EXISTS trumuv_member_id integer;

-- -----------------------------------------------------------------------------
-- 4. Indexes for FK lookups
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profile_trumuv_member_id  ON profile  (trumuv_member_id);
CREATE INDEX IF NOT EXISTS idx_buildings_trumuv_member_id ON buildings (trumuv_member_id);
