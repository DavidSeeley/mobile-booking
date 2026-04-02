/**
 * =========================================================================
 * Profile Page - Payee Profile Management
 * =========================================================================
 * Contact card (company, first/last name, email, phone) persisted to Supabase.
 * Multi-building records, each with a per-building apartment pricing table.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Building2, Plus, Pencil, Trash2,
  Save, Check, ChevronDown, ChevronUp, X,
} from 'lucide-react';
import { DetailCard } from '../../components/detail-card';
import { useProfile, type BuildingWithApts } from '@/hooks/useProfile';
import type { BuildingAptSizeRow } from '@/lib/supabase';

const EMPTY_BUILDING = { name: '', address: '', city: '', state: '', zip: '' };

type ContactState = { company: string; first_name: string; last_name: string; email: string; phone: string };

export default function Profile() {
  const navigate = useNavigate();
  const {
    profile, buildings, loading, error,
    saveProfile, addBuilding, updateBuilding, deleteBuilding, saveApartmentSizes,
    addApartmentSize, deleteApartmentSize,
  } = useProfile();

  // ── Contact ──────────────────────────────────────────────────────────────
  const [contact, setContact] = useState<ContactState>({
    company: '', first_name: '', last_name: '', email: '', phone: '',
  });
  const [contactSaved, setContactSaved] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);

  // Sync contact fields once profile loads from Supabase
  useEffect(() => {
    if (profile) {
      setContact({
        company: profile.company ?? '',
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
      });
    }
  }, [profile]);

  async function handleSaveContact() {
    setContactSaving(true);
    try {
      await saveProfile(contact);
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 2000);
    } finally {
      setContactSaving(false);
    }
  }

  // ── Add building ─────────────────────────────────────────────────────────
  const [addingBuilding, setAddingBuilding] = useState(false);
  const [newBuilding, setNewBuilding] = useState(EMPTY_BUILDING);
  const [addingSaving, setAddingSaving] = useState(false);

  async function handleAddBuilding() {
    if (!newBuilding.name.trim()) return;
    setAddingSaving(true);
    try {
      await addBuilding(newBuilding);
      setNewBuilding(EMPTY_BUILDING);
      setAddingBuilding(false);
    } finally {
      setAddingSaving(false);
    }
  }

  // ── Edit building ────────────────────────────────────────────────────────
  const [editingBuildingId, setEditingBuildingId] = useState<string | null>(null);
  const [editBuilding, setEditBuilding] = useState(EMPTY_BUILDING);

  function startEditBuilding(b: BuildingWithApts) {
    setEditingBuildingId(b.id);
    setEditBuilding({ name: b.name, address: b.address, city: b.city, state: b.state, zip: b.zip });
  }

  async function handleSaveBuilding(id: string) {
    await updateBuilding(id, editBuilding);
    setEditingBuildingId(null);
  }

  // ── Apartment sizes ──────────────────────────────────────────────────────
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);
  const [aptEdits, setAptEdits] = useState<Record<string, BuildingAptSizeRow[]>>({});
  const [aptSaved, setAptSaved] = useState<Record<string, boolean>>({});
  const [newAptRow, setNewAptRow] = useState<Record<string, { name: string; allowance: string }>>({});

  // Keep aptEdits in sync when buildings are updated externally (e.g. after addApartmentSize)
  useEffect(() => {
    if (!expandedBuildingId) return;
    const building = buildings.find(b => b.id === expandedBuildingId);
    if (building) {
      setAptEdits(prev => ({ ...prev, [expandedBuildingId]: [...building.apartment_sizes] }));
    }
  }, [buildings, expandedBuildingId]);

  function toggleExpand(building: BuildingWithApts) {
    const id = building.id;
    if (expandedBuildingId === id) {
      setExpandedBuildingId(null);
    } else {
      setExpandedBuildingId(id);
      if (!aptEdits[id]) {
        setAptEdits(prev => ({ ...prev, [id]: [...building.apartment_sizes] }));
      }
    }
  }

  function handleAptChange(buildingId: string, aptRowId: string, field: 'name' | 'allowance', value: string) {
    setAptEdits(prev => ({
      ...prev,
      [buildingId]: (prev[buildingId] ?? []).map(row => {
        if (row.id !== aptRowId) return row;
        if (field === 'allowance') {
          const num = value === '' ? 0 : parseFloat(value);
          return { ...row, allowance: isNaN(num) ? 0 : num };
        }
        return { ...row, name: value };
      }),
    }));
  }

  async function handleDeleteApt(buildingId: string, aptRowId: string) {
    await deleteApartmentSize(buildingId, aptRowId);
    setAptEdits(prev => ({
      ...prev,
      [buildingId]: (prev[buildingId] ?? []).filter(r => r.id !== aptRowId),
    }));
  }

  async function handleAddAptRow(buildingId: string) {
    const row = newAptRow[buildingId];
    if (!row?.name?.trim()) return;
    const allowance = row.allowance === '' ? 0 : parseFloat(row.allowance);
    await addApartmentSize(buildingId, row.name.trim(), isNaN(allowance) ? 0 : allowance);
    // Sync aptEdits from updated buildings state via the hook — clear new row form
    setNewAptRow(prev => ({ ...prev, [buildingId]: { name: '', allowance: '' } }));
  }

  async function handleSaveApts(buildingId: string) {
    const sizes = aptEdits[buildingId] ?? [];
    await saveApartmentSizes(buildingId, sizes);
    setAptSaved(prev => ({ ...prev, [buildingId]: true }));
    setTimeout(() => setAptSaved(prev => ({ ...prev, [buildingId]: false })), 2000);
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Admin</span>
        </button>
        <h1 className="text-gray-900 font-bold flex-1 text-lg">Payee Profile</h1>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51] transition-colors"
        >
          Splash
        </button>
      </header>

      <div className="flex-1 px-6 md:px-8 py-8 max-w-3xl w-full mx-auto space-y-6">

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {/* ── Contact Card ── */}
        <DetailCard className="admin-table-card">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="admin-card-title font-bold text-gray-900">Contact</span>
            <button
              type="button"
              onClick={handleSaveContact}
              disabled={contactSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors ${
                contactSaved ? 'bg-green-500' : 'bg-[#3d5068] hover:bg-[#2e3d51]'
              }`}
            >
              {contactSaved
                ? <><Check className="h-3.5 w-3.5" /> Saved</>
                : <><Save className="h-3.5 w-3.5" /> Save</>}
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 gap-3">
            <input
              type="text"
              placeholder="Company"
              value={contact.company}
              onChange={e => setContact(p => ({ ...p, company: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name"
                value={contact.first_name}
                onChange={e => setContact(p => ({ ...p, first_name: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={contact.last_name}
                onChange={e => setContact(p => ({ ...p, last_name: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Email"
                value={contact.email}
                onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={contact.phone}
                onChange={e => setContact(p => ({ ...p, phone: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
              />
            </div>
          </div>
        </DetailCard>

        {/* ── Buildings ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-500" />
              <h2 className="font-bold text-gray-900">Buildings</h2>
            </div>
            <button
              type="button"
              onClick={() => { setAddingBuilding(true); setNewBuilding(EMPTY_BUILDING); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Building
            </button>
          </div>

          {/* Add Building inline form */}
          {addingBuilding && (
            <DetailCard className="admin-table-card mb-3">
              <div className="px-4 py-3 border-b border-gray-200">
                <span className="font-bold text-gray-900 text-sm">New Building</span>
              </div>
              <div className="p-4 grid grid-cols-1 gap-3">
                <input
                  type="text"
                  placeholder="Building Name *"
                  value={newBuilding.name}
                  onChange={e => setNewBuilding(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={newBuilding.address}
                  onChange={e => setNewBuilding(p => ({ ...p, address: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={newBuilding.city}
                    onChange={e => setNewBuilding(p => ({ ...p, city: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newBuilding.state}
                    onChange={e => setNewBuilding(p => ({ ...p, state: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Zip"
                    value={newBuilding.zip}
                    onChange={e => setNewBuilding(p => ({ ...p, zip: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setAddingBuilding(false)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddBuilding}
                    disabled={addingSaving || !newBuilding.name.trim()}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51] disabled:opacity-50 transition-colors"
                  >
                    {addingSaving ? 'Saving…' : 'Save Building'}
                  </button>
                </div>
              </div>
            </DetailCard>
          )}

          {/* Empty state */}
          {buildings.length === 0 && !addingBuilding && (
            <p className="text-sm text-gray-400 text-center py-10">
              No buildings yet. Click "Add Building" to get started.
            </p>
          )}

          {/* Building cards */}
          <div className="space-y-3">
            {buildings.map(building => {
              const isEditing  = editingBuildingId === building.id;
              const isExpanded = expandedBuildingId === building.id;
              const apts       = aptEdits[building.id] ?? building.apartment_sizes;

              return (
                <DetailCard key={building.id} className="admin-table-card overflow-hidden">

                  {/* Building header row */}
                  <div className="px-4 py-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="grid grid-cols-1 gap-2">
                          <input
                            type="text"
                            placeholder="Building Name *"
                            value={editBuilding.name}
                            onChange={e => setEditBuilding(p => ({ ...p, name: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Address"
                            value={editBuilding.address}
                            onChange={e => setEditBuilding(p => ({ ...p, address: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <input type="text" placeholder="City" value={editBuilding.city}
                              onChange={e => setEditBuilding(p => ({ ...p, city: e.target.value }))}
                              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white" />
                            <input type="text" placeholder="State" value={editBuilding.state}
                              onChange={e => setEditBuilding(p => ({ ...p, state: e.target.value }))}
                              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white" />
                            <input type="text" placeholder="Zip" value={editBuilding.zip}
                              onChange={e => setEditBuilding(p => ({ ...p, zip: e.target.value }))}
                              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-gray-900 text-sm">{building.name}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {[building.address, building.city, building.state, building.zip]
                              .filter(Boolean).join(', ')}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Action icons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <button type="button" onClick={() => setEditingBuildingId(null)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => handleSaveBuilding(building.id)}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors">
                            <Check className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEditBuilding(building)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => deleteBuilding(building.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => toggleExpand(building)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                            {isExpanded
                              ? <ChevronUp className="h-4 w-4" />
                              : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Apartment sizes table */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      <div className="admin-table-header grid grid-cols-[1fr_1fr_auto] px-4 py-2">
                        <span className="admin-table-cell font-bold text-white">Type</span>
                        <span className="admin-table-cell font-bold text-white text-center">Allowance</span>
                        <span className="w-7" />
                      </div>
                      {apts.map((row, index) => (
                        <div key={row.id}>
                          <div className="grid grid-cols-[1fr_1fr_auto] px-4 py-2 bg-white items-center gap-2">
                            <input
                              type="text"
                              value={row.name}
                              onChange={e => handleAptChange(building.id, row.id, 'name', e.target.value)}
                              className="admin-table-cell text-gray-800 bg-transparent border-none outline-none w-full"
                            />
                            <input
                              type="number"
                              value={row.allowance ?? 0}
                              onChange={e => handleAptChange(building.id, row.id, 'allowance', e.target.value)}
                              className="admin-table-cell text-gray-800 text-center bg-transparent border-none outline-none w-full"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteApt(building.id, row.id)}
                              className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {index < apts.length - 1 && (
                            <div className="grid grid-cols-[1fr_1fr_auto] px-4">
                              <div className="border-t border-gray-200" />
                              <div className="border-t border-gray-200" />
                              <div />
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add row */}
                      <div className="grid grid-cols-[1fr_1fr_auto] px-4 py-2 bg-gray-50 border-t border-gray-100 items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type name…"
                          value={newAptRow[building.id]?.name ?? ''}
                          onChange={e => setNewAptRow(prev => ({ ...prev, [building.id]: { ...prev[building.id] ?? { name: '', allowance: '' }, name: e.target.value } }))}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white"
                        />
                        <input
                          type="number"
                          placeholder="0"
                          value={newAptRow[building.id]?.allowance ?? ''}
                          onChange={e => setNewAptRow(prev => ({ ...prev, [building.id]: { ...prev[building.id] ?? { name: '', allowance: '' }, allowance: e.target.value } }))}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-800 text-center outline-none focus:border-blue-400 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddAptRow(building.id)}
                          disabled={!newAptRow[building.id]?.name?.trim()}
                          className="p-1 rounded hover:bg-green-50 text-green-600 disabled:opacity-30 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="px-4 py-3 flex justify-end border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleSaveApts(building.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors ${
                            aptSaved[building.id] ? 'bg-green-500' : 'bg-[#3d5068] hover:bg-[#2e3d51]'
                          }`}
                        >
                          {aptSaved[building.id]
                            ? <><Check className="h-3.5 w-3.5" /> Saved</>
                            : <><Save className="h-3.5 w-3.5" /> Save Sizes</>}
                        </button>
                      </div>
                    </div>
                  )}
                </DetailCard>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
