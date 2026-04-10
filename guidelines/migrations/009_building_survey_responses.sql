-- =============================================================================
-- Migration 009 — Building Survey Responses
-- =============================================================================
-- Tracks per-building answers to survey questions.
-- Each row = one building's answer to one question.
-- =============================================================================

CREATE TABLE IF NOT EXISTS building_survey_responses (
  id          bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  building_id uuid      NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  question_id bigint    NOT NULL REFERENCES survey(id)    ON DELETE CASCADE,
  yes_no      boolean,
  note        text,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (building_id, question_id)
);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE building_survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read building survey responses"
ON building_survey_responses FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon can upsert building survey responses"
ON building_survey_responses FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can update building survey responses"
ON building_survey_responses FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can manage building survey responses"
ON building_survey_responses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
