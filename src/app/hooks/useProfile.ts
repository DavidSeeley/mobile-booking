import { useState, useEffect, useCallback } from 'react';
import { supabase, type ProfileRow, type BuildingRow, type BuildingAptSizeRow, type MemberRow } from '@/lib/supabase';
import { DEFAULT_APARTMENT_SIZES } from '@/mocks/AdminVar';

export interface BuildingWithApts extends BuildingRow {
  apartment_sizes: BuildingAptSizeRow[];
}

export function useProfile() {
  const [profile,  setProfile]  = useState<ProfileRow | null>(null);
  const [member,   setMember]   = useState<MemberRow | null>(null);
  const [buildings, setBuildings] = useState<BuildingWithApts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      // Load profile first — buildings are scoped to it via payee_id
      const { data: profileData, error: profileErr } = await supabase
        .from('profile')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (profileErr) throw profileErr;

      setProfile(profileData);

      // Fetch linked member (account manager)
      if (profileData?.trumuv_member_id) {
        const { data: memberData } = await supabase
          .from('member')
          .select('*')
          .eq('trumuv_member_id', profileData.trumuv_member_id)
          .maybeSingle();
        setMember(memberData as MemberRow | null);
      }

      if (profileData) {
        // Fetch buildings belonging to this profile, or not yet assigned (null)
        const { data: buildingsData, error: buildingsErr } = await supabase
          .from('buildings')
          .select('*, apartment_sizes:building_apartment_sizes(*)')
          .or(`payee_id.eq.${profileData.id},payee_id.is.null`)
          .order('sort_order');
        if (buildingsErr) {
          console.error('[useProfile] buildings query error:', buildingsErr);
          throw buildingsErr;
        }
        console.log('[useProfile] buildings fetched:', buildingsData?.length ?? 0, buildingsData);

        setBuildings((buildingsData ?? []) as BuildingWithApts[]);

        // Backfill any buildings that predate the payee_id column
        const unlinked = (buildingsData ?? []).filter(b => !b.payee_id);
        if (unlinked.length > 0) {
          await supabase
            .from('buildings')
            .update({ payee_id: profileData.id })
            .is('payee_id', null);
        }
      } else {
        setBuildings([]);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveProfile = useCallback(async (data: Omit<ProfileRow, 'id'>) => {
    if (!supabase) return;
    if (profile?.id) {
      const { error: err } = await supabase.from('profile').update(data).eq('id', profile.id);
      if (err) throw err;
      setProfile(prev => prev ? { ...prev, ...data } : prev);
    } else {
      const { data: inserted, error: err } = await supabase
        .from('profile').insert(data).select().single();
      if (err) throw err;
      setProfile(inserted as ProfileRow);
    }
  }, [profile]);

  const addBuilding = useCallback(async (data: Omit<BuildingRow, 'id' | 'sort_order' | 'payee_id'>) => {
    if (!supabase || !profile?.id) throw new Error('No profile loaded');
    const sort_order = buildings.length;
    const { data: building, error: buildingErr } = await supabase
      .from('buildings')
      .insert({ ...data, sort_order, payee_id: profile.id })
      .select()
      .single();
    if (buildingErr) throw buildingErr;

    const defaultApts = DEFAULT_APARTMENT_SIZES.map(apt => ({
      building_id: building.id,
      apt_id: apt.id,
      name: apt.name,
      allowance: apt.allowance,
    }));
    const { data: aptData, error: aptErr } = await supabase
      .from('building_apartment_sizes').insert(defaultApts).select();
    if (aptErr) throw aptErr;

    setBuildings(prev => [...prev, { ...(building as BuildingRow), apartment_sizes: (aptData ?? []) as BuildingAptSizeRow[] }]);
  }, [buildings.length, profile]);

  const updateBuilding = useCallback(async (id: string, data: Partial<Omit<BuildingRow, 'id' | 'payee_id'>>) => {
    if (!supabase) return;
    const { error: err } = await supabase.from('buildings').update(data).eq('id', id);
    if (err) throw err;
    setBuildings(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  }, []);

  const deleteBuilding = useCallback(async (id: string) => {
    if (!supabase) return;
    const { error: err } = await supabase.from('buildings').delete().eq('id', id);
    if (err) throw err;
    setBuildings(prev => prev.filter(b => b.id !== id));
  }, []);

  const saveApartmentSizes = useCallback(async (buildingId: string, sizes: BuildingAptSizeRow[]) => {
    if (!supabase) return;
    for (const size of sizes) {
      const { error: err } = await supabase
        .from('building_apartment_sizes')
        .update({ name: size.name, allowance: size.allowance })
        .eq('id', size.id);
      if (err) throw err;
    }
    setBuildings(prev =>
      prev.map(b => b.id === buildingId ? { ...b, apartment_sizes: sizes } : b)
    );
  }, []);

  const addApartmentSize = useCallback(async (buildingId: string, name: string, allowance: number) => {
    if (!supabase) return;
    const apt_id = name.toLowerCase().replace(/\s+/g, '-');
    const { data, error: err } = await supabase
      .from('building_apartment_sizes')
      .insert({ building_id: buildingId, apt_id, name, allowance })
      .select()
      .single();
    if (err) throw err;
    setBuildings(prev =>
      prev.map(b => b.id === buildingId
        ? { ...b, apartment_sizes: [...b.apartment_sizes, data as BuildingAptSizeRow] }
        : b)
    );
  }, []);

  const deleteApartmentSize = useCallback(async (buildingId: string, aptId: string) => {
    if (!supabase) return;
    const { error: err } = await supabase
      .from('building_apartment_sizes')
      .delete()
      .eq('id', aptId);
    if (err) throw err;
    setBuildings(prev =>
      prev.map(b => b.id === buildingId
        ? { ...b, apartment_sizes: b.apartment_sizes.filter(a => a.id !== aptId) }
        : b)
    );
  }, []);

  return { profile, member, buildings, loading, error, saveProfile, addBuilding, updateBuilding, deleteBuilding, saveApartmentSizes, addApartmentSize, deleteApartmentSize };
}
