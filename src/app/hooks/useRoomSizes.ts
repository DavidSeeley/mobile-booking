import { useState, useEffect, useCallback } from 'react';
import { supabase, type RoomSizeRow } from '@/lib/supabase';
import { DEFAULT_ROOM_SIZES } from '@/mocks/AdminVar';

export function useRoomSizes() {
  const [roomSizes, setRoomSizes] = useState<RoomSizeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!supabase) {
      setRoomSizes(DEFAULT_ROOM_SIZES as RoomSizeRow[]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('room_sizes')
      .select('*')
      .order('sort_order');
    if (!error && data && data.length > 0) {
      setRoomSizes(data as RoomSizeRow[]);
    } else {
      setRoomSizes(DEFAULT_ROOM_SIZES as RoomSizeRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveRoomSizes = useCallback(async (rows: RoomSizeRow[]) => {
    if (!supabase) return;
    for (const row of rows) {
      const { error } = await supabase
        .from('room_sizes')
        .upsert({ id: row.id, name: row.name, ratio: row.ratio, fur: row.fur, sort_order: row.sort_order ?? 0 });
      if (error) console.error('saveRoomSizes error for row', row.id, error);
    }
    setRoomSizes(rows);
  }, []);

  return { roomSizes, loading, saveRoomSizes };
}
