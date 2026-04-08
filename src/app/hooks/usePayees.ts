import { useState, useEffect, useCallback } from 'react';
import { supabase, type ProfileRow, type BuildingRow, type BuildingAptSizeRow, type MemberRow } from '@/lib/supabase';

export interface BuildingWithApts extends BuildingRow {
  apartment_sizes: BuildingAptSizeRow[];
}

export interface PayeeWithBuildings extends ProfileRow {
  buildings: BuildingWithApts[];
  member?: MemberRow;
}

export function usePayees() {
  const [payees, setPayees] = useState<PayeeWithBuildings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: profiles, error: profileErr } = await supabase
        .from('profile')
        .select('*')
        .order('company');
      if (profileErr) throw profileErr;

      const profileList = profiles ?? [];

      // Fetch all buildings with apartment sizes in one query
      const { data: allBuildings, error: buildingsErr } = await supabase
        .from('buildings')
        .select('*, apartment_sizes:building_apartment_sizes(*)')
        .order('sort_order');
      if (buildingsErr) throw buildingsErr;

      // Group buildings by payee_id
      const buildingsByPayee: Record<string, BuildingWithApts[]> = {};
      for (const b of (allBuildings ?? []) as BuildingWithApts[]) {
        if (!buildingsByPayee[b.payee_id]) buildingsByPayee[b.payee_id] = [];
        buildingsByPayee[b.payee_id].push(b);
      }

      // Fetch all members
      const { data: allMembers } = await supabase.from('member').select('*');
      const membersById: Record<number, MemberRow> = {};
      for (const m of (allMembers ?? []) as MemberRow[]) {
        membersById[m.trumuv_member_id] = m;
      }

      setPayees(profileList.map(p => ({
        ...p,
        buildings: buildingsByPayee[p.id] ?? [],
        member: p.trumuv_member_id ? membersById[p.trumuv_member_id] : undefined,
      })));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setActive = useCallback(async (payeeId: string, active: boolean) => {
    // Optimistic update — flip immediately so the UI responds
    setPayees(prev => prev.map(p => p.id === payeeId ? { ...p, active } : p));
    if (!supabase) return;
    const { error: err } = await supabase
      .from('profile')
      .update({ active })
      .eq('id', payeeId);
    if (err) {
      // Revert on failure
      setPayees(prev => prev.map(p => p.id === payeeId ? { ...p, active: !active } : p));
      throw err;
    }
  }, []);

  const updateApartmentSize = useCallback(async (
    payeeId: string,
    buildingId: string,
    aptId: string,
    data: { name?: string; allowance?: number }
  ) => {
    if (!supabase) return;
    const { error: err } = await supabase
      .from('building_apartment_sizes')
      .update(data)
      .eq('id', aptId);
    if (err) throw err;
    setPayees(prev => prev.map(p => {
      if (p.id !== payeeId) return p;
      return {
        ...p,
        buildings: p.buildings.map(b => {
          if (b.id !== buildingId) return b;
          return {
            ...b,
            apartment_sizes: b.apartment_sizes.map(a =>
              a.id === aptId ? { ...a, ...data } : a
            ),
          };
        }),
      };
    }));
  }, []);

  const updateBuilding = useCallback(async (
    payeeId: string,
    buildingId: string,
    data: Partial<Pick<BuildingRow, 'name' | 'address' | 'city' | 'state' | 'zip'>>
  ) => {
    if (!supabase) return;
    const { error: err } = await supabase
      .from('buildings')
      .update(data)
      .eq('id', buildingId);
    if (err) throw err;
    setPayees(prev => prev.map(p => {
      if (p.id !== payeeId) return p;
      return {
        ...p,
        buildings: p.buildings.map(b => b.id === buildingId ? { ...b, ...data } : b),
      };
    }));
  }, []);

  const deletePayee = useCallback(async (payeeId: string) => {
    if (!supabase) return;
    // Cascade: delete apt sizes → buildings → profile
    const buildingIds = payees.find(p => p.id === payeeId)?.buildings.map(b => b.id) ?? [];
    if (buildingIds.length > 0) {
      const { error: aptErr } = await supabase
        .from('building_apartment_sizes')
        .delete()
        .in('building_id', buildingIds);
      if (aptErr) throw aptErr;
      const { error: bldErr } = await supabase
        .from('buildings')
        .delete()
        .in('id', buildingIds);
      if (bldErr) throw bldErr;
    }
    const { error: err } = await supabase.from('profile').delete().eq('id', payeeId);
    if (err) throw err;
    setPayees(prev => prev.filter(p => p.id !== payeeId));
  }, [payees]);

  const addBuilding = useCallback(async (payeeId: string, name: string) => {
    if (!supabase) return;
    const id = crypto.randomUUID();
    const sort_order = (payees.find(p => p.id === payeeId)?.buildings.length ?? 0) + 1;
    const newBuilding = { id, payee_id: payeeId, name, address: '', city: '', state: '', zip: '', sort_order };
    const { error: err } = await supabase.from('buildings').insert(newBuilding);
    if (err) throw err;
    setPayees(prev => prev.map(p =>
      p.id !== payeeId ? p : { ...p, buildings: [...p.buildings, { ...newBuilding, apartment_sizes: [] }] }
    ));
  }, [payees]);

  const deleteBuilding = useCallback(async (payeeId: string, buildingId: string) => {
    if (!supabase) return;
    const { error: aptErr } = await supabase
      .from('building_apartment_sizes')
      .delete()
      .eq('building_id', buildingId);
    if (aptErr) throw aptErr;
    const { error: err } = await supabase.from('buildings').delete().eq('id', buildingId);
    if (err) throw err;
    setPayees(prev => prev.map(p =>
      p.id !== payeeId ? p : { ...p, buildings: p.buildings.filter(b => b.id !== buildingId) }
    ));
  }, []);

  const updateProfile = useCallback(async (
    payeeId: string,
    data: Partial<Omit<ProfileRow, 'id'>>
  ) => {
    if (!supabase) return;
    const { error: err } = await supabase.from('profile').update(data).eq('id', payeeId);
    if (err) throw err;
    setPayees(prev => prev.map(p => p.id === payeeId ? { ...p, ...data } : p));
  }, []);

  const addApartmentSize = useCallback(async (
    payeeId: string,
    buildingId: string,
    data: { name: string; allowance: number }
  ) => {
    if (!supabase) return;
    const id  = crypto.randomUUID();
    const apt_id = crypto.randomUUID();
    const newApt = { id, building_id: buildingId, apt_id, name: data.name, allowance: data.allowance };
    const { error: err } = await supabase.from('building_apartment_sizes').insert(newApt);
    if (err) throw err;
    setPayees(prev => prev.map(p => {
      if (p.id !== payeeId) return p;
      return {
        ...p,
        buildings: p.buildings.map(b =>
          b.id !== buildingId ? b : { ...b, apartment_sizes: [...b.apartment_sizes, newApt] }
        ),
      };
    }));
  }, []);

  const deleteApartmentSize = useCallback(async (payeeId: string, buildingId: string, aptId: string) => {
    if (!supabase) return;
    const { error: err } = await supabase
      .from('building_apartment_sizes')
      .delete()
      .eq('id', aptId);
    if (err) throw err;
    setPayees(prev => prev.map(p => {
      if (p.id !== payeeId) return p;
      return {
        ...p,
        buildings: p.buildings.map(b =>
          b.id !== buildingId ? b : { ...b, apartment_sizes: b.apartment_sizes.filter(a => a.id !== aptId) }
        ),
      };
    }));
  }, []);

  const upsertMember = useCallback(async (
    payeeId: string,
    data: Pick<MemberRow, 'trumuv_member_id' | 'first_name' | 'last_name' | 'email' | 'phone'>
  ) => {
    if (!supabase) return;
    // Upsert into member table
    const { error: memberErr } = await supabase
      .from('member')
      .upsert({ ...data }, { onConflict: 'trumuv_member_id' });
    if (memberErr) throw memberErr;
    // Link profile to this member
    const { error: profileErr } = await supabase
      .from('profile')
      .update({ trumuv_member_id: data.trumuv_member_id })
      .eq('id', payeeId);
    if (profileErr) throw profileErr;
    setPayees(prev => prev.map(p =>
      p.id !== payeeId ? p : { ...p, trumuv_member_id: data.trumuv_member_id, member: { id: '', ...data } }
    ));
  }, []);

  const createPayee = useCallback(async (data: Omit<ProfileRow, 'id'>) => {
    if (!supabase) return;
    const id = crypto.randomUUID();
    const { error: err } = await supabase.from('profile').insert({ id, ...data });
    if (err) throw err;
    setPayees(prev => [...prev, { id, ...data, active: true, buildings: [] }]);
  }, []);

  return {
    payees, loading, error,
    setActive, updateApartmentSize, updateBuilding, updateProfile,
    createPayee, upsertMember, addBuilding, deletePayee, deleteBuilding, addApartmentSize, deleteApartmentSize,
    reload: load,
  };
}
