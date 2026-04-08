import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface StopTypeRow {
  id: number;
  name: string;
  ratio: number;
  active: number;
}

const DEFAULT_STOP_TYPES: StopTypeRow[] = [
  { id: 1,  name: 'Single Family', ratio: 1, active: 1 },
  { id: 2,  name: 'Apartment',     ratio: 1, active: 1 },
  { id: 6,  name: 'Condo',         ratio: 1, active: 1 },
  { id: 10, name: 'Duplex',        ratio: 1, active: 1 },
  { id: 11, name: 'Storage Unit',  ratio: 1, active: 1 },
  { id: 16, name: 'Rambler',       ratio: 1, active: 1 },
];

export function useStopTypes() {
  const [stopTypes, setStopTypes] = useState<StopTypeRow[]>([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    if (!supabase) {
      setStopTypes(DEFAULT_STOP_TYPES);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('stop_types')
      .select('*')
      .order('id');
    if (!error && data && data.length > 0) {
      setStopTypes(data as StopTypeRow[]);
    } else {
      setStopTypes(DEFAULT_STOP_TYPES);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveStopType = useCallback(async (row: StopTypeRow) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('stop_types')
      .upsert({ id: row.id, name: row.name, ratio: row.ratio, active: row.active });
    if (error) console.error('saveStopType error', error);
    else setStopTypes(prev => prev.map(r => r.id === row.id ? row : r));
  }, []);

  const addStopType = useCallback(async (name: string) => {
    if (!supabase) return;
    // Pick an id one higher than current max
    const maxId = stopTypes.reduce((m, r) => Math.max(m, r.id), 0);
    const newRow: StopTypeRow = { id: maxId + 1, name, ratio: 1, active: 1 };
    const { error } = await supabase.from('stop_types').insert(newRow);
    if (error) console.error('addStopType error', error);
    else setStopTypes(prev => [...prev, newRow]);
  }, [stopTypes]);

  const deleteStopType = useCallback(async (id: number) => {
    if (!supabase) return;
    const { error } = await supabase.from('stop_types').delete().eq('id', id);
    if (error) console.error('deleteStopType error', error);
    else setStopTypes(prev => prev.filter(r => r.id !== id));
  }, []);

  return { stopTypes, loading, saveStopType, addStopType, deleteStopType };
}
