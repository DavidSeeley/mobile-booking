import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------------------------------------------------------------------
// Row types matching Supabase tables
// ---------------------------------------------------------------------------

export interface ProfileRow {
  id: string;
  company: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface BuildingRow {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  sort_order: number;
}

export interface BuildingAptSizeRow {
  id: string;
  building_id: string;
  apt_id: string;
  name: string;
  ratio: number;
  box: number;
  allowance: number;
}
