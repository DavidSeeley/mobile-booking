-- =============================================================================
-- Migration 003 — Link Buildings to Member
-- =============================================================================
-- Adds trumuv_member_id to buildings (if not already present from migration 001)
-- and creates an index for fast lookups.
-- No FK constraint — member records may not exist yet when buildings are saved.
--
-- Run in Supabase: SQL Editor → paste → Run
-- =============================================================================

-- Add the column (safe to re-run)
ALTER TABLE buildings
  ADD COLUMN IF NOT EXISTS trumuv_member_id integer;

-- Index for fast member → buildings lookups
CREATE INDEX IF NOT EXISTS idx_buildings_trumuv_member_id
  ON buildings (trumuv_member_id);
