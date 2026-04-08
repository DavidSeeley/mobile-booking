// MemberRow — matches the `member` table in Supabase.
// One record per account manager. Referenced by profile and buildings via trumuv_member_id.
export interface MemberRow {
  id: string;
  trumuv_member_id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
}

// MemberFields — only the FK reference stored on profile/buildings.
export interface MemberFields {
  trumuv_member_id?: number;
}
