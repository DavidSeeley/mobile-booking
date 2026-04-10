import { useState, useEffect, useCallback } from 'react';
import { supabase, type BuildingContactRow } from '@/lib/supabase';

export function useBuildingContacts(buildingId: string) {
  const [contacts, setContacts] = useState<BuildingContactRow[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    if (!supabase || !buildingId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('building_contacts')
      .select('*')
      .eq('building_id', buildingId)
      .order('created_at');
    setContacts((data ?? []) as BuildingContactRow[]);
    setLoading(false);
  }, [buildingId]);

  useEffect(() => { load(); }, [load]);

  const addContact = useCallback(async (name: string, phone: string, email: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('building_contacts')
      .insert({ building_id: buildingId, name, phone: phone || null, email: email || null })
      .select()
      .single();
    if (data) setContacts(prev => [...prev, data as BuildingContactRow]);
  }, [buildingId]);

  const deleteContact = useCallback(async (id: string) => {
    if (!supabase) return;
    await supabase.from('building_contacts').delete().eq('id', id);
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  return { contacts, loading, addContact, deleteContact };
}
