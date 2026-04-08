-- =============================================================================
-- Migration 004 — Move Member Data Out of Profile
-- =============================================================================
-- The sales_* fields were incorrectly stored on the profile table.
-- Member info now lives in the member table, linked via trumuv_member_id.
--
-- Run in Supabase: SQL Editor → paste → Run
-- =============================================================================

-- Remove sales_* columns from profile (no longer needed)
ALTER TABLE profile
  DROP COLUMN IF EXISTS sales_first_name,
  DROP COLUMN IF EXISTS sales_last_name,
  DROP COLUMN IF EXISTS sales_email,
  DROP COLUMN IF EXISTS sales_phone;

-- Ensure trumuv_member_id remains on profile as the FK reference
ALTER TABLE profile
  ADD COLUMN IF NOT EXISTS trumuv_member_id integer;
