/**
 * =========================================================================
 * Admin Page - Administrative Settings
 * =========================================================================
 * Separate admin page (not part of multi-step form)
 * Layout: 2-column grid of DetailCards
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Save, Check, Users, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { DetailCard } from '../../components/detail-card';
import {
  loadAdminVars,
  saveAdminVars,
  DEFAULT_CONVERTER,
} from '../../mocks/AdminVar';
import { useRoomSizes } from '../../hooks/useRoomSizes';
import { useStopTypes } from '../../hooks/useStopTypes';
import { useMiscItems } from '../../hooks/useMiscItems';

export default function Admin() {
  const navigate = useNavigate();

  const { roomSizes, saveRoomSizes } = useRoomSizes();
  const { stopTypes, saveStopType, addStopType, deleteStopType } = useStopTypes();
  const [localStopTypes, setLocalStopTypes] = useState(stopTypes);
  const [newStopName, setNewStopName] = useState('');
  useEffect(() => { setLocalStopTypes(stopTypes); }, [stopTypes]);

  const { miscItems, saveMiscItem, addMiscItem, deleteMiscItem } = useMiscItems();
  const [localMiscItems, setLocalMiscItems] = useState(miscItems);
  const [newMiscName, setNewMiscName] = useState('');
  useEffect(() => { setLocalMiscItems(miscItems); }, [miscItems]);
  const _initial = loadAdminVars();
  const [addedItems, setAddedItems] = useState(_initial.addedItems);
  const [converter, setConverter]   = useState(_initial.converter);
  const [saved, setSaved]           = useState(false);
  const [localRoomSizes, setLocalRoomSizes] = useState(roomSizes);

  // Mirror ref — always holds committed state; safe to read in event handlers
  const latestRef = useRef({ ..._initial, addedItems, converter });
  useEffect(() => {
    latestRef.current = { ..._initial, addedItems, converter };
  });

  useEffect(() => { setLocalRoomSizes(roomSizes); }, [roomSizes]);

  // Explicit save — called by the Save button
  const handleSave = useCallback(() => {
    saveAdminVars(latestRef.current);
    saveRoomSizes(localRoomSizes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [saveRoomSizes, localRoomSizes]);

  // Auto-save on field blur (secondary safety net)
  function handleBlur() {
    saveAdminVars(latestRef.current);
    saveRoomSizes(localRoomSizes);
  }

  function handleRoomChange(id: string, value: string) {
    const num = value === '' ? 0 : parseFloat(value);
    setLocalRoomSizes(prev =>
      prev.map(row => row.id === id ? { ...row, fur: isNaN(num) ? 0 : num } : row)
    );
  }

  function handleAddedItemRatioChange(id: string, value: string) {
    const num = value === '' ? 0 : parseFloat(value);
    setAddedItems(prev =>
      prev.map(row => row.id === id ? { ...row, ratio: isNaN(num) ? 0 : num } : row)
    );
  }

  function handleConverterRatioChange(id: string, value: string) {
    const num = value === '' ? 0 : parseFloat(value);
    setConverter(prev =>
      prev.map(row => row.id === id ? { ...row, ratio: isNaN(num) ? 0 : num } : row)
    );
  }

  const furnitureRow = converter.find(r => r.id === 'furniture');
  const ratingIdRow  = DEFAULT_CONVERTER.find(r => r.id === 'rating_id')!

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      <header className="w-full px-6 md:px-8 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <div className="flex-1" />

        {/* Admin button */}
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51]"
        >
          <ShieldCheck className="h-4 w-4" />
          <span className="admin-back-label">Admin</span>
        </button>

        {/* Payees button */}
        <button
          type="button"
          onClick={() => navigate('/admin/payees')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51]"
        >
          <Users className="h-4 w-4" />
          <span className="admin-back-label">Payees</span>
        </button>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-white ${saved ? 'bg-green-500' : 'bg-[#3d5068] hover:bg-[#2e3d51]'}`}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              <span className="admin-back-label">Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span className="admin-back-label">Save</span>
            </>
          )}
        </button>
      </header>

      <div className="flex-1 px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* Rooms Card */}
          <DetailCard className="admin-table-card">
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="admin-card-title font-bold text-gray-900">Rooms</span>
            </div>
            <div className="admin-table-header grid grid-cols-2 px-4 py-2">
              <span className="admin-table-cell font-bold text-white">Name</span>
              <span className="admin-table-cell font-bold text-white text-center">Fur</span>
            </div>
            {localRoomSizes.map((row, index) => (
              <div key={row.id}>
                <div className="grid grid-cols-2 px-4 py-4 bg-white items-center">
                  <span className="admin-table-cell text-gray-800 text-center">{row.name}</span>
                  <input
                    type="number"
                    value={row.fur ?? 0}
                    onChange={(e) => handleRoomChange(row.id, e.target.value)}
                    onBlur={handleBlur}
                    className="admin-table-cell text-gray-800 text-center bg-transparent border-none outline-none w-full"
                  />
                </div>
                {index < localRoomSizes.length - 1 && (
                  <div className="grid grid-cols-2 px-4">
                    <div className="border-t border-gray-200"></div>
                    <div className="border-t border-gray-200"></div>
                  </div>
                )}
              </div>
            ))}
          </DetailCard>


          {/* Miscellaneous Items Card */}
          <DetailCard className="admin-table-card">
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="admin-card-title font-bold text-gray-900">Miscellaneous Items</span>
            </div>
            <div className="admin-table-header grid grid-cols-4 px-4 py-2">
              <span className="admin-table-cell font-bold text-white">ID</span>
              <span className="admin-table-cell font-bold text-white">Name</span>
              <span className="admin-table-cell font-bold text-white text-center">Ratio</span>
              <span className="admin-table-cell font-bold text-white text-center">Active</span>
            </div>
            {localMiscItems.map((row, index) => (
              <div key={row.id}>
                <div className="grid grid-cols-4 px-4 py-3 bg-white items-center gap-2">
                  <span className="admin-table-cell text-gray-400 text-center">{row.id}</span>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => setLocalMiscItems(prev => prev.map(r => r.id === row.id ? { ...r, name: e.target.value } : r))}
                    onBlur={() => { const current = localMiscItems.find(r => r.id === row.id); if (current) saveMiscItem(current); }}
                    className="admin-table-cell text-gray-800 bg-transparent border-b border-gray-200 outline-none w-full focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={row.ratio}
                    onChange={(e) => setLocalMiscItems(prev => prev.map(r => r.id === row.id ? { ...r, ratio: parseFloat(e.target.value) || 0 } : r))}
                    onBlur={() => { const current = localMiscItems.find(r => r.id === row.id); if (current) saveMiscItem(current); }}
                    className="admin-table-cell text-gray-800 text-center bg-transparent border-b border-gray-200 outline-none w-full focus:border-blue-500"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => { const updated = { ...row, active: row.active === 1 ? 0 : 1 }; setLocalMiscItems(prev => prev.map(r => r.id === row.id ? updated : r)); saveMiscItem(updated); }}
                      className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${row.active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {row.active === 1 ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMiscItem(row.id)}
                      className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {index < localMiscItems.length - 1 && (
                  <div className="grid grid-cols-4 px-4">
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                  </div>
                )}
              </div>
            ))}
            {/* Add new row */}
            <div className="px-4 pt-3 pb-2 border-t border-gray-200 flex items-center gap-2">
              <input
                type="text"
                value={newMiscName}
                onChange={(e) => setNewMiscName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newMiscName.trim()) { addMiscItem(newMiscName.trim()); setNewMiscName(''); } }}
                placeholder="New item name…"
                className="flex-1 text-sm border-b border-gray-200 outline-none py-1 text-gray-700 placeholder-gray-400 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => { if (newMiscName.trim()) { addMiscItem(newMiscName.trim()); setNewMiscName(''); } }}
                disabled={!newMiscName.trim()}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white transition-colors"
                aria-label="Add item"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </DetailCard>


          {/* Stop Types Card */}
          <DetailCard className="admin-table-card">
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="admin-card-title font-bold text-gray-900">Stop Types</span>
            </div>
            <div className="admin-table-header grid grid-cols-4 px-4 py-2">
              <span className="admin-table-cell font-bold text-white">ID</span>
              <span className="admin-table-cell font-bold text-white">Name</span>
              <span className="admin-table-cell font-bold text-white text-center">Ratio</span>
              <span className="admin-table-cell font-bold text-white text-center">Active</span>
            </div>
            {localStopTypes.map((row, index) => (
              <div key={row.id}>
                <div className="grid grid-cols-4 px-4 py-3 bg-white items-center gap-2">
                  <span className="admin-table-cell text-gray-400 text-center">{row.id}</span>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => setLocalStopTypes(prev => prev.map(r => r.id === row.id ? { ...r, name: e.target.value } : r))}
                    onBlur={() => { const current = localStopTypes.find(r => r.id === row.id); if (current) saveStopType(current); }}
                    className="admin-table-cell text-gray-800 bg-transparent border-b border-gray-200 outline-none w-full focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={row.ratio}
                    onChange={(e) => setLocalStopTypes(prev => prev.map(r => r.id === row.id ? { ...r, ratio: parseFloat(e.target.value) || 0 } : r))}
                    onBlur={() => { const current = localStopTypes.find(r => r.id === row.id); if (current) saveStopType(current); }}
                    className="admin-table-cell text-gray-800 text-center bg-transparent border-b border-gray-200 outline-none w-full focus:border-blue-500"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => { const updated = { ...row, active: row.active === 1 ? 0 : 1 }; setLocalStopTypes(prev => prev.map(r => r.id === row.id ? updated : r)); saveStopType(updated); }}
                      className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${row.active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {row.active === 1 ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteStopType(row.id)}
                      className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {index < localStopTypes.length - 1 && (
                  <div className="grid grid-cols-4 px-4">
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                  </div>
                )}
              </div>
            ))}
            {/* Add new row */}
            <div className="px-4 pt-3 pb-2 border-t border-gray-200 flex items-center gap-2">
              <input
                type="text"
                value={newStopName}
                onChange={(e) => setNewStopName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newStopName.trim()) { addStopType(newStopName.trim()); setNewStopName(''); } }}
                placeholder="New stop type name…"
                className="flex-1 text-sm border-b border-gray-200 outline-none py-1 text-gray-700 placeholder-gray-400 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => { if (newStopName.trim()) { addStopType(newStopName.trim()); setNewStopName(''); } }}
                disabled={!newStopName.trim()}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white transition-colors"
                aria-label="Add stop type"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </DetailCard>

          {/* Converter Card — Furniture only */}
          <div className="md:col-span-2">
            <DetailCard className="admin-table-card">
              <div className="px-4 py-3 border-b border-gray-200">
                <span className="admin-card-title font-bold text-gray-900">Converter</span>
              </div>
              <div className="admin-table-header admin-converter-grid grid px-4 py-2">
                <span className="admin-table-cell font-bold text-white">Name</span>
                <span className="admin-table-cell font-bold text-white">Count</span>
                <span className="admin-table-cell font-bold text-white">Formula</span>
              </div>
              {furnitureRow && (
                <div className="admin-converter-grid grid px-4 py-4 bg-white items-center border-b border-gray-100">
                  <span className="admin-table-cell text-gray-800 text-center">{furnitureRow.name}</span>
                  <input
                    type="number"
                    value={furnitureRow.ratio ?? 0}
                    onChange={e => handleConverterRatioChange(furnitureRow.id, e.target.value)}
                    onBlur={handleBlur}
                    className="admin-table-cell text-gray-800 text-center bg-transparent border-none outline-none w-full"
                  />
                  <span className="admin-formula-cell text-gray-500">
                    {DEFAULT_CONVERTER.find(d => d.id === 'furniture')?.formula ?? furnitureRow.formula}
                  </span>
                </div>
              )}
              {/* Rating ID — display-only formula row */}
              <div className="admin-converter-grid grid px-4 py-4 bg-white items-center">
                <span className="admin-table-cell text-gray-800 text-center">{ratingIdRow.name}</span>
                <span className="admin-table-cell text-gray-400 text-center text-xs">computed</span>
                <span className="admin-formula-cell text-gray-500">{ratingIdRow.formula}</span>
              </div>
            </DetailCard>
          </div>

        </div>
      </div>
    </div>
  );
}