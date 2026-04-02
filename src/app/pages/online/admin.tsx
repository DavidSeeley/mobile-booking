/**
 * =========================================================================
 * Admin Page - Administrative Settings
 * =========================================================================
 * Separate admin page (not part of multi-step form)
 * Layout: 2-column grid of DetailCards
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, Check } from 'lucide-react';
import { DetailCard } from '../../components/detail-card';
import {
  loadAdminVars,
  saveAdminVars,
  DEFAULT_CONVERTER,
} from '../../mocks/AdminVar';

export default function Admin() {
  const navigate = useNavigate();

  const _initial = loadAdminVars();
  const [roomSizes, setRoomSizes]   = useState(_initial.roomSizes);
  const [truckSizes, setTruckSizes] = useState(_initial.truckSizes);
  const [loadSizes, setLoadSizes]   = useState(_initial.loadSizes);
  const [addedItems, setAddedItems] = useState(_initial.addedItems);
  const [converter, setConverter]   = useState(_initial.converter);
  const [saved, setSaved]           = useState(false);

  // Mirror ref — always holds committed state; safe to read in event handlers
  const latestRef = useRef({ roomSizes, truckSizes, loadSizes, addedItems, converter });
  useEffect(() => {
    latestRef.current = { roomSizes, truckSizes, loadSizes, addedItems, converter };
  });

  // Explicit save — called by the Save button
  const handleSave = useCallback(() => {
    saveAdminVars(latestRef.current);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  // Auto-save on field blur (secondary safety net)
  function handleBlur() {
    saveAdminVars(latestRef.current);
  }

  function handleRoomChange(id: string, field: 'ratio' | 'fur', value: string) {
    const num = value === '' ? 0 : parseFloat(value);
    setRoomSizes(prev =>
      prev.map(row => row.id === id ? { ...row, [field]: isNaN(num) ? 0 : num } : row)
    );
  }

  function handleTruckChange(id: string, field: 'count' | 'mover', value: string) {
    const num = value === '' ? 0 : parseFloat(value);
    setTruckSizes(prev =>
      prev.map(row => row.id === id ? { ...row, [field]: isNaN(num) ? 0 : num } : row)
    );
  }

  function handleLoadRatioChange(id: string, value: string) {
    const num = value === '' ? 0 : parseFloat(value);
    setLoadSizes(prev =>
      prev.map(row => row.id === id ? { ...row, ratio: isNaN(num) ? 0 : num } : row)
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

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      <header className="w-full px-6 md:px-8 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-700"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="admin-back-label font-medium">Back to Home</span>
        </button>
        <h1 className="admin-title text-gray-900 font-bold flex-1">Admin</h1>

        {/* Payee Profile button */}
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51]"
        >
          <span className="admin-back-label">Payee Profile</span>
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
            <div className="admin-table-header grid grid-cols-3 px-4 py-2">
              <span className="admin-table-cell font-bold text-white">Name</span>
              <span className="admin-table-cell font-bold text-white text-center">Ratio</span>
              <span className="admin-table-cell font-bold text-white text-center">Fur</span>
            </div>
            {roomSizes.map((row, index) => (
              <div key={row.id}>
                <div className="grid grid-cols-3 px-4 py-4 bg-white items-center">
                  <span className="admin-table-cell text-gray-800 text-center">{row.name}</span>
                  <input
                    type="number"
                    value={row.ratio ?? 0}
                    onChange={(e) => handleRoomChange(row.id, 'ratio', e.target.value)}
                    onBlur={handleBlur}
                    className="admin-table-cell text-gray-800 text-center bg-transparent border-none outline-none w-full"
                  />
                  <input
                    type="number"
                    value={row.fur ?? 0}
                    onChange={(e) => handleRoomChange(row.id, 'fur', e.target.value)}
                    onBlur={handleBlur}
                    className="admin-table-cell text-gray-800 text-center bg-transparent border-none outline-none w-full"
                  />
                </div>
                {index < roomSizes.length - 1 && (
                  <div className="grid grid-cols-3 px-4">
                    <div className="border-t border-gray-200"></div>
                    <div className="border-t border-gray-200"></div>
                    <div className="border-t border-gray-200"></div>
                  </div>
                )}
              </div>
            ))}
          </DetailCard>

          {/* Truck Size Card */}
          <DetailCard className="admin-table-card">
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="admin-card-title font-bold text-gray-900">Truck Size</span>
            </div>
            <div className="admin-table-header grid grid-cols-3 px-4 py-2">
              <span className="admin-table-cell font-bold text-white">Name</span>
              <span className="admin-table-cell font-bold text-white text-center">Count</span>
              <span className="admin-table-cell font-bold text-white text-center">Mover</span>
            </div>
            {truckSizes.map((row, index) => (
              <div key={row.id}>
                <div className="grid grid-cols-3 px-4 py-4 bg-white items-center">
                  <span className="admin-table-cell text-gray-800 text-center">{row.name}</span>
                  <input
                    type="number"
                    value={row.count ?? 0}
                    onChange={(e) => handleTruckChange(row.id, 'count', e.target.value)}
                    onBlur={handleBlur}
                    className="admin-table-cell text-gray-800 text-center bg-transparent border-none outline-none w-full"
                  />
                  <input
                    type="number"
                    value={row.mover ?? 0}
                    onChange={(e) => handleTruckChange(row.id, 'mover', e.target.value)}
                    onBlur={handleBlur}
                    className="admin-table-cell text-gray-800 text-center bg-transparent border-none outline-none w-full"
                  />
                </div>
                {index < truckSizes.length - 1 && (
                  <div className="grid grid-cols-3 px-4">
                    <div className="border-t border-gray-200"></div>
                    <div className="border-t border-gray-200"></div>
                    <div className="border-t border-gray-200"></div>
                  </div>
                )}
              </div>
            ))}
          </DetailCard>

          {/* Load Size Card */}
          <DetailCard className="admin-table-card">
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="admin-card-title font-bold text-gray-900">Load Size</span>
            </div>
            <div className="admin-table-header grid grid-cols-2 px-4 py-2">
              <span className="admin-table-cell font-bold text-white">Name</span>
              <span className="admin-table-cell font-bold text-white text-center">Ratio</span>
            </div>
            {loadSizes.map((row, index) => (
              <div key={row.id}>
                <div className="grid grid-cols-2 px-4 py-4 bg-white items-center">
                  <span className="admin-table-cell text-gray-800 text-center">{row.name}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={row.ratio ?? 0}
                    onChange={(e) => handleLoadRatioChange(row.id, e.target.value)}
                    onBlur={handleBlur}
                    className="admin-table-cell text-gray-800 text-center bg-transparent border-none outline-none w-full"
                  />
                </div>
                {index < loadSizes.length - 1 && (
                  <div className="grid grid-cols-2 px-4">
                    <div className="border-t border-gray-200"></div>
                    <div className="border-t border-gray-200"></div>
                  </div>
                )}
              </div>
            ))}
          </DetailCard>

          {/* Added Items Card */}
          <DetailCard className="admin-table-card">
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="admin-card-title font-bold text-gray-900">Miscellaneous Items</span>
            </div>
            <div className="admin-table-header grid grid-cols-2 px-4 py-2">
              <span className="admin-table-cell font-bold text-white">Name</span>
              <span className="admin-table-cell font-bold text-white text-center">Ratio</span>
            </div>
            {addedItems.map((row, index) => (
              <div key={row.id}>
                <div className="grid grid-cols-2 px-4 py-4 bg-white items-center">
                  <span className="admin-table-cell text-gray-800 text-center">{row.name}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={row.ratio ?? 0}
                    onChange={(e) => handleAddedItemRatioChange(row.id, e.target.value)}
                    onBlur={handleBlur}
                    className="admin-table-cell text-gray-800 text-center bg-transparent border-none outline-none w-full"
                  />
                </div>
                {index < addedItems.length - 1 && (
                  <div className="grid grid-cols-2 px-4">
                    <div className="border-t border-gray-200"></div>
                    <div className="border-t border-gray-200"></div>
                  </div>
                )}
              </div>
            ))}
          </DetailCard>

          {/* Converter Card — full width, spans 2 columns */}
          <div className="md:col-span-2">
            <DetailCard className="admin-table-card">
              <div className="px-4 py-3 border-b border-gray-200">
                <span className="admin-card-title font-bold text-gray-900">Converter</span>
              </div>
              <div className="admin-table-header admin-converter-grid grid px-4 py-2">
                <span className="admin-table-cell font-bold text-white">Name</span>
                <span className="admin-table-cell font-bold text-white">Ratio</span>
                <span className="admin-table-cell font-bold text-white">Formula</span>
              </div>
              {converter.map((row, index) => (
                <div key={row.id}>
                  <div className="admin-converter-grid grid px-4 py-4 bg-white items-center">
                    <span className="admin-table-cell text-gray-800 text-center">{row.name}</span>
                    <input
                      type="number"
                      value={row.ratio ?? 0}
                      onChange={(e) => handleConverterRatioChange(row.id, e.target.value)}
                      onBlur={handleBlur}
                      className="admin-table-cell text-gray-800 text-center bg-transparent border-none outline-none w-full"
                    />
                    <span className="admin-formula-cell text-gray-500">
                      {DEFAULT_CONVERTER.find((d) => d.id === row.id)?.formula ?? row.formula}
                    </span>
                  </div>
                  {index < converter.length - 1 && (
                    <div className="admin-converter-grid grid px-4">
                      <div className="border-t border-gray-200"></div>
                      <div className="border-t border-gray-200"></div>
                      <div className="border-t border-gray-200"></div>
                    </div>
                  )}
                </div>
              ))}
            </DetailCard>
          </div>

        </div>
      </div>
    </div>
  );
}