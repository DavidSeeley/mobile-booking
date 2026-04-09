-- =============================================================================
-- Migration 007 — Row Level Security (RLS)
-- =============================================================================
-- Run this in the Supabase SQL editor.
-- Locks down all tables so anonymous users can only access what is explicitly
-- permitted. PIN validation is handled by the Edge Function (validate-pin),
-- NOT by direct table queries.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- profile
-- -----------------------------------------------------------------------------
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- No anon access — profile data is admin-only
-- Authenticated users (admins) can read/write their own record
CREATE POLICY "Admins can manage profiles"
ON profile FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- -----------------------------------------------------------------------------
-- buildings
-- -----------------------------------------------------------------------------
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- No anon SELECT — the Edge Function uses the service role key to look up by PIN.
-- Authenticated admins can manage all buildings.
CREATE POLICY "Admins can manage buildings"
ON buildings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- -----------------------------------------------------------------------------
-- building_apartment_sizes
-- -----------------------------------------------------------------------------
ALTER TABLE building_apartment_sizes ENABLE ROW LEVEL SECURITY;

-- No anon access. Authenticated admins only.
CREATE POLICY "Admins can manage apartment sizes"
ON building_apartment_sizes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- -----------------------------------------------------------------------------
-- member
-- -----------------------------------------------------------------------------
ALTER TABLE member ENABLE ROW LEVEL SECURITY;

-- No anon access. Authenticated admins only.
CREATE POLICY "Admins can manage members"
ON member FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- -----------------------------------------------------------------------------
-- stop_types
-- -----------------------------------------------------------------------------
ALTER TABLE stop_types ENABLE ROW LEVEL SECURITY;

-- Anon users need to read stop_types to populate the home type dropdown
-- on the address page. Read-only, no PII exposed.
CREATE POLICY "Anon can read stop types"
ON stop_types FOR SELECT
TO anon
USING (active = 1);

CREATE POLICY "Admins can manage stop types"
ON stop_types FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- -----------------------------------------------------------------------------
-- miscellaneous_items
-- -----------------------------------------------------------------------------
ALTER TABLE miscellaneous_items ENABLE ROW LEVEL SECURITY;

-- Anon users need to read misc items for the miscellaneous page.
-- Read-only, no PII exposed.
CREATE POLICY "Anon can read miscellaneous items"
ON miscellaneous_items FOR SELECT
TO anon
USING (active = 1);

CREATE POLICY "Admins can manage miscellaneous items"
ON miscellaneous_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- -----------------------------------------------------------------------------
-- room_sizes (if exists)
-- -----------------------------------------------------------------------------
ALTER TABLE room_sizes ENABLE ROW LEVEL SECURITY;

-- Anon users need room_sizes to calculate inventory scores.
CREATE POLICY "Anon can read room sizes"
ON room_sizes FOR SELECT
TO anon
USING (true);

CREATE POLICY "Admins can manage room sizes"
ON room_sizes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
