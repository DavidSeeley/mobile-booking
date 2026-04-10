-- =============================================================================
-- Migration 008 — Survey Table
-- =============================================================================
-- Run this in the Supabase SQL editor.
-- Creates the survey table to store survey questions with yes/no responses.
-- =============================================================================

CREATE TABLE IF NOT EXISTS survey (
  id        bigint        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "order"   integer       NOT NULL DEFAULT 0,
  question  text          NOT NULL,
  yes_no    boolean       NOT NULL DEFAULT true,
  note      text,
  active    integer       NOT NULL DEFAULT 1
);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE survey ENABLE ROW LEVEL SECURITY;

-- Anon can read all survey questions (admin uses anon key)
CREATE POLICY "Anon can read survey questions"
ON survey FOR SELECT
TO anon
USING (true);

-- Admins can manage all survey records
CREATE POLICY "Admins can manage survey"
ON survey FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- Seed data
-- -----------------------------------------------------------------------------
INSERT INTO survey ("order", question, yes_no, note, active) VALUES
  (1,  'What promotions or incentives are you currently using to fill vacancies?',                                                        true, null, 1),
  (2,  'What is your average monthly move-in and move-out volume?',                                                                       true, null, 1),
  (3,  'Do you experience seasonal peaks in tenant turnover — and how do you manage that surge?',                                         true, null, 1),
  (4,  'What is your average lease term, and how far in advance do tenants typically notify you of a move?',                              true, null, 1),
  (5,  'Walk me through your current move-in and move-out process from start to finish — who owns each step?',                            true, null, 1),
  (6,  'Who is responsible for hanging and removing the protective elevator wall covers during a move?',                                   true, null, 1),
  (7,  'How are move times and elevator access currently scheduled and communicated to tenants?',                                          true, null, 1),
  (8,  'Do you have a designated loading dock or move-in entrance, and how is access managed?',                                           true, null, 1),
  (9,  'Do discarded boxes and packing materials cause issues in common areas or the trash room?',                                        true, null, 1),
  (10, 'What is your biggest frustration with the current move process?',                                                                 true, null, 1),
  (11, 'Have you experienced property damage during moves — and how was that handled?',                                                   true, null, 1),
  (12, 'Are there recurring complaints from tenants or staff around moving activity?',                                                    true, null, 1),
  (13, 'Do you currently have a preferred or exclusive moving company relationship in place?',                                            true, null, 1),
  (14, 'Has a moving company ever been part of your leasing package or tenant welcome offer?',                                            true, null, 1),
  (15, 'What does your current vendor approval process look like for a company like Local Motion?',                                       true, null, 1),
  (16, 'Do you have a dedicated storage area for moving supplies, equipment, or building materials?',                                     true, null, 1),
  (17, 'Who currently manages debris removal after a move is completed?',                                                                 true, null, 1),
  (18, 'Is there a service elevator or restricted access area we would need to coordinate around?',                                       true, null, 1),
  (19, 'How do you currently handle supply restocking for common area consumables during high-turnover periods?',                         true, null, 1),
  (20, 'If you could change one thing about the way moves are handled at this property today, what would it be?',                         true, null, 1);
