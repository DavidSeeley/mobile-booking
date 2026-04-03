import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/env';

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
  allowance: number;
}

export interface RoomSizeRow {
  id: string;
  name: string;
  ratio: number;
  fur: number;
  sort_order: number;
}
