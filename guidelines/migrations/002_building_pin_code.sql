-- =============================================================================
-- Migration 002 — Building PIN Code
-- =============================================================================
-- Adds a 4-digit PIN code field to each building record.
--
-- Run in Supabase: SQL Editor → paste → Run
-- =============================================================================

ALTER TABLE buildings
  ADD COLUMN IF NOT EXISTS pin_code char(4);
