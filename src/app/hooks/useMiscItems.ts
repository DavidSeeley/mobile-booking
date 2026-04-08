import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface MiscItemRow {
  id: number;
  name: string;
  ratio: number;
  active: number;
}

const DEFAULT_MISC_ITEMS: MiscItemRow[] = [
  { id: 1, name: 'Lighting',         ratio: 1, active: 1 },
  { id: 2, name: 'Cleaning',         ratio: 1, active: 1 },
  { id: 3, name: 'TVs and Monitors', ratio: 1, active: 1 },
  { id: 4, name: 'Music Equipment',  ratio: 1, active: 1 },
  { id: 5, name: 'Sporting Goods',   ratio: 1, active: 1 },
  { id: 6, name: 'Kids Stuff',       ratio: 1, active: 1 },
];

export function useMiscItems() {
  const [miscItems, setMiscItems] = useState<MiscItemRow[]>([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    if (!supabase) {
      setMiscItems(DEFAULT_MISC_ITEMS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('miscellaneous_items')
      .select('*')
      .order('id');
    if (!error && data && data.length > 0) {
      setMiscItems(data as MiscItemRow[]);
    } else {
      setMiscItems(DEFAULT_MISC_ITEMS);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveMiscItem = useCallback(async (row: MiscItemRow) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('miscellaneous_items')
      .upsert({ id: row.id, name: row.name, ratio: row.ratio, active: row.active });
    if (error) console.error('saveMiscItem error', error);
    else setMiscItems(prev => prev.map(r => r.id === row.id ? row : r));
  }, []);

  const addMiscItem = useCallback(async (name: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('miscellaneous_items')
      .insert({ name, ratio: 1, active: 1 })
      .select()
      .single();
    if (error) console.error('addMiscItem error', error);
    else if (data) setMiscItems(prev => [...prev, data as MiscItemRow]);
  }, []);

  const deleteMiscItem = useCallback(async (id: number) => {
    if (!supabase) return;
    const { error } = await supabase.from('miscellaneous_items').delete().eq('id', id);
    if (error) console.error('deleteMiscItem error', error);
    else setMiscItems(prev => prev.filter(r => r.id !== id));
  }, []);

  return { miscItems, loading, saveMiscItem, addMiscItem, deleteMiscItem };
}
