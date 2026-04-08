import { useState } from 'react';
import { Plus, Trash2, Check, Save, LayoutList } from 'lucide-react';
import { DetailCard } from '../../../components/detail-card';
import type { BuildingWithApts } from '@/hooks/useProfile';
import type { BuildingAptSizeRow } from '@/lib/supabase';

interface Props {
  buildings: BuildingWithApts[];
  aptEdits: Record<string, BuildingAptSizeRow[]>;
  onAptChange: (buildingId: string, aptRowId: string, field: 'name' | 'allowance', value: string) => void;
  onAddAptRow: (buildingId: string, name: string, allowance: number) => Promise<void>;
  onDeleteApt: (buildingId: string, aptRowId: string) => Promise<void>;
  onSaveApts: (buildingId: string) => Promise<void>;
  aptSaved: Record<string, boolean>;
}

export function StepUnits({
  buildings, aptEdits, onAptChange, onAddAptRow, onDeleteApt, onSaveApts, aptSaved,
}: Props) {
  const [newRow, setNewRow] = useState<Record<string, { name: string; allowance: string }>>({});

  async function handleAdd(buildingId: string) {
    const row = newRow[buildingId];
    if (!row?.name?.trim()) return;
    const allowance = row.allowance === '' ? 0 : parseFloat(row.allowance);
    await onAddAptRow(buildingId, row.name.trim(), isNaN(allowance) ? 0 : allowance);
    setNewRow(prev => ({ ...prev, [buildingId]: { name: '', allowance: '' } }));
  }

  return (
    <div className="max-w-lg w-full mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <div className="bg-violet-50 rounded-xl p-2.5 mt-0.5">
          <LayoutList className="h-6 w-6 text-violet-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">What unit types are in each building?</h2>
          <p className="text-sm text-gray-500 mt-1">Enter each apartment type and its moving allowance. These are used to calculate resident quotes.</p>
        </div>
      </div>
      {buildings.map(building => {
        const apts = aptEdits[building.id] ?? building.apartment_sizes;
        return (
          <div key={building.id} className="space-y-2">
            <p className="font-semibold text-gray-900 text-sm">{building.name}</p>
            <DetailCard className="admin-table-card overflow-hidden">
              <div className="admin-table-header grid grid-cols-[1fr_1fr_auto] px-4 py-2">
                <span className="admin-table-cell font-bold text-white">Type</span>
                <span className="admin-table-cell font-bold text-white text-center">Allowance</span>
                <span className="w-7" />
              </div>

              {apts.map((row, index) => (
                <div key={row.id}>
                  <div className="grid grid-cols-[1fr_1fr_auto] px-4 py-2 bg-white items-center gap-2">
                    <input type="text" value={row.name}
                      onChange={e => onAptChange(building.id, row.id, 'name', e.target.value)}
                      className="admin-table-cell text-gray-800 bg-transparent border-none outline-none w-full" />
                    <input type="number" value={row.allowance ?? 0}
                      onChange={e => onAptChange(building.id, row.id, 'allowance', e.target.value)}
                      className="admin-table-cell text-gray-800 text-center bg-transparent border-none outline-none w-full" />
                    <button type="button" onClick={() => onDeleteApt(building.id, row.id)}
                      className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {index < apts.length - 1 && (
                    <div className="grid grid-cols-[1fr_1fr_auto] px-4">
                      <div className="border-t border-gray-200" /><div className="border-t border-gray-200" /><div />
                    </div>
                  )}
                </div>
              ))}

              <div className="grid grid-cols-[1fr_1fr_auto] px-4 py-2 bg-gray-50 border-t border-gray-100 items-center gap-2">
                <input type="text" placeholder="Type name…"
                  value={newRow[building.id]?.name ?? ''}
                  onChange={e => setNewRow(prev => ({ ...prev, [building.id]: { ...prev[building.id] ?? { name: '', allowance: '' }, name: e.target.value } }))}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white" />
                <input type="number" placeholder="0"
                  value={newRow[building.id]?.allowance ?? ''}
                  onChange={e => setNewRow(prev => ({ ...prev, [building.id]: { ...prev[building.id] ?? { name: '', allowance: '' }, allowance: e.target.value } }))}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-800 text-center outline-none focus:border-blue-400 bg-white" />
                <button type="button" onClick={() => handleAdd(building.id)}
                  disabled={!newRow[building.id]?.name?.trim()}
                  className="p-1 rounded hover:bg-green-50 text-green-600 disabled:opacity-30 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </DetailCard>

            <button type="button" onClick={() => onSaveApts(building.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors ${
                aptSaved[building.id] ? 'bg-green-500' : 'bg-[#3d5068] hover:bg-[#2e3d51]'
              }`}>
              {aptSaved[building.id]
                ? <><Check className="h-3.5 w-3.5" /> Saved</>
                : <><Save className="h-3.5 w-3.5" /> Save Units</>}
            </button>
          </div>
        );
      })}

    </div>
  );
}
