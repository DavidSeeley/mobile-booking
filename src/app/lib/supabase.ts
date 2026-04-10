import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/env';
import type { MemberFields, MemberRow } from '@/types/member';
export type { MemberRow };

// Guard against empty credentials (not yet configured in .env)
let _client: ReturnType<typeof createClient> | null = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch {
  // credentials invalid — supabase will be null
}
export const supabase = _client;

// ---------------------------------------------------------------------------
// Table: profile
// One record per company. Parent of buildings (1 → many).
// ---------------------------------------------------------------------------

export interface ProfileRow extends MemberFields {
  id: string;
  company: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  active?: boolean;
  trumuv_payee_id?: number;
  remit_address1?: string;
  remit_address2?: string;
  remit_city?: string;
  remit_state?: string;
  remit_zip?: string;
}

// ---------------------------------------------------------------------------
// Table: buildings
// Each building belongs to one profile via payee_id (many → 1).
// Parent of building_apartment_sizes (1 → many).
// ---------------------------------------------------------------------------

export interface BuildingRow {
  id: string;
  payee_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  sort_order: number;
  trumuv_member_id?: number;  // FK → member.trumuv_member_id
  pin_code?: string;          // 4-digit access PIN
}

// ---------------------------------------------------------------------------
// Table: building_apartment_sizes
// Each row belongs to one building via building_id (many → 1).
// ---------------------------------------------------------------------------

export interface BuildingAptSizeRow {
  id: string;
  building_id: string;
  apt_id: string;
  name: string;
  allowance: number;
}

// ---------------------------------------------------------------------------
// Table: room_sizes
// Standalone reference table. Not linked to profile, buildings, or
// building_apartment_sizes.
// ---------------------------------------------------------------------------

export interface RoomSizeRow {
  id: string;
  name: string;
  ratio: number;
  fur: number;
  sort_order: number;
}

// ---------------------------------------------------------------------------
// Table: survey
// Survey questions shown during enrollment or sales calls.
// ---------------------------------------------------------------------------

export interface SurveyRow {
  id: number;
  order: number;
  question: string;
  yes_no: boolean;
  note: string | null;
  active: number;
}

// ---------------------------------------------------------------------------
// Table: building_survey_responses
// Per-building answers to survey questions.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Table: building_contacts
// Additional contacts per building (managers, leasing agents, etc.)
// ---------------------------------------------------------------------------

export interface BuildingContactRow {
  id: string;
  building_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at?: string;
}

export interface BuildingSurveyResponseRow {
  id?: number;
  building_id: string; // uuid
  question_id: number;
  yes_no: boolean | null;
  note: string | null;
  updated_at?: string;
}
