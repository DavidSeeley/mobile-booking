-- =============================================================================
-- Migration 010 — Building Contacts
-- =============================================================================
-- Stores additional contacts per building (managers, leasing agents, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS building_contacts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid        NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  phone       text,
  email       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE building_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read building contacts"
ON building_contacts FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon can insert building contacts"
ON building_contacts FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can delete building contacts"
ON building_contacts FOR DELETE
TO anon
USING (true);

CREATE POLICY "Admins can manage building contacts"
ON building_contacts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
