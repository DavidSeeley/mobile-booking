/**
 * =========================================================================
 * Admin Payees — Manage all enrolled payees
 * =========================================================================
 * Lists all payees with activate/deactivate toggle.
 * Expandable rows show buildings and unit allowances (inline editable).
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, ChevronDown, ChevronUp, ChevronRight, Building2,
  LayoutList, Check, Save, Power, PowerOff, Trash2,
  UserCircle, UserSquare, MapPin, Loader2, Plus, X, ClipboardList,
} from 'lucide-react';
import { DetailCard } from '../../components/detail-card';
import { usePayees } from '@/hooks/usePayees';
import { formatPhone } from '@/utils/formatPhone';
import type { BuildingAptSizeRow } from '@/lib/supabase';
import type { BuildingPanelProps, PayeeRowProps } from '@/types/payee';

// ── Allowance table for one building ───────────────────────────────────────


function BuildingCard({ payeeId, building, onAddApt, onSaveApt, onUpdateBuilding, onDeleteBuilding, onDeleteApt }: BuildingPanelProps) {
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [edits, setEdits] = useState<Record<string, BuildingAptSizeRow>>(
    Object.fromEntries(building.apartment_sizes.map(a => [a.id, { ...a }]))
  );
  const [aptSaved,    setAptSaved]    = useState<Record<string, boolean>>({});
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitAmt,  setNewUnitAmt]  = useState('');
  const [addingUnit,  setAddingUnit]  = useState(false);
  const [fields, setFields] = useState({
    name: building.name, address: building.address,
    city: building.city, state: building.state, zip: building.zip,
    pin_code: building.pin_code ?? '',
    trumuv_member_id: building.trumuv_member_id ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  async function handleSaveBuilding() {
    setSaving(true);
    try {
      await onUpdateBuilding(payeeId, building.id, fields);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function handleAptChange(aptId: string, field: 'name' | 'allowance', value: string) {
    setEdits(prev => {
      const row = prev[aptId];
      if (!row) return prev;
      if (field === 'allowance') {
        const num = value === '' ? 0 : parseFloat(value);
        return { ...prev, [aptId]: { ...row, allowance: isNaN(num) ? 0 : num } };
      }
      return { ...prev, [aptId]: { ...row, name: value } };
    });
  }

  async function handleSaveApt(aptId: string) {
    const row = edits[aptId];
    if (!row) return;
    await onSaveApt(payeeId, building.id, aptId, { name: row.name, allowance: row.allowance });
    setAptSaved(prev => ({ ...prev, [aptId]: true }));
    setTimeout(() => setAptSaved(prev => ({ ...prev, [aptId]: false })), 2000);
  }

  async function handleAddUnit() {
    if (!newUnitName.trim()) return;
    setAddingUnit(true);
    try {
      await onAddApt(payeeId, building.id, {
        name:      newUnitName.trim(),
        allowance: parseFloat(newUnitAmt) || 0,
      });
      setNewUnitName('');
      setNewUnitAmt('');
    } finally {
      setAddingUnit(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <Building2 className="h-4 w-4 text-orange-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{fields.name || '—'}</p>
          <p className="text-xs text-gray-400 truncate">
            {[fields.address, fields.city, fields.state, fields.zip].filter(Boolean).join(', ') || 'No address'}
          </p>
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <LayoutList className="h-3.5 w-3.5" />
          {building.apartment_sizes.length}
        </span>
        <button
          type="button"
          onClick={() => setUnitsOpen(o => !o)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          title="Toggle units"
        >
          {unitsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => { if (confirm(`Delete "${building.name}"? This will also delete all its unit types.`)) onDeleteBuilding(payeeId, building.id); }}
          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
          title="Delete building"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editable fields */}
      <div className="px-4 pb-3 grid grid-cols-1 gap-2 border-t border-gray-100 pt-3">
        <input
          type="text" placeholder="Building name"
          value={fields.name} onChange={e => setFields(p => ({ ...p, name: e.target.value }))}
          className={inputCls}
        />
        <input
          type="text" placeholder="Address"
          value={fields.address} onChange={e => setFields(p => ({ ...p, address: e.target.value }))}
          className={inputCls}
        />
        <div className="grid grid-cols-3 gap-2">
          <input type="text" placeholder="City" value={fields.city} onChange={e => setFields(p => ({ ...p, city: e.target.value }))} className={inputCls} />
          <input type="text" placeholder="ST" maxLength={2} value={fields.state} onChange={e => setFields(p => ({ ...p, state: e.target.value }))} className={inputCls} />
          <input type="text" placeholder="Zip" maxLength={10} value={fields.zip} onChange={e => setFields(p => ({ ...p, zip: e.target.value }))} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="PIN Code (4 digits)"
            inputMode="numeric"
            maxLength={4}
            value={fields.pin_code}
            onChange={e => setFields(p => ({ ...p, pin_code: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Member ID"
            value={fields.trumuv_member_id || ''}
            onChange={e => setFields(p => ({ ...p, trumuv_member_id: e.target.value === '' ? 0 : parseInt(e.target.value, 10) }))}
            className={inputCls}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button" onClick={handleSaveBuilding} disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${saved ? 'bg-green-500' : 'bg-[#3d5068] hover:bg-[#2e3d51]'}`}
          >
            {saving ? <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>
              : saved ? <><Check className="h-3 w-3" /> Saved</>
              : <><Save className="h-3 w-3" /> Save</>}
          </button>
        </div>
      </div>

      {/* Units accordion */}
      {unitsOpen && (
        <div className="border-t border-gray-100">
          <div className="admin-table-header grid grid-cols-[1fr_100px_80px_36px] px-4 py-2">
            <span className="text-xs font-bold text-white">Unit Type</span>
            <span className="text-xs font-bold text-white text-center">Allowance</span>
            <span /><span />
          </div>

          {building.apartment_sizes.length === 0 && (
            <p className="px-4 py-2 text-xs text-gray-400">No unit types yet.</p>
          )}

          {building.apartment_sizes.map((apt, i) => {
            const row = edits[apt.id] ?? apt;
            return (
              <div key={apt.id}>
                <div className="grid grid-cols-[1fr_100px_80px_36px] px-4 py-2 bg-white items-center gap-2">
                  <input type="text" value={row.name} onChange={e => handleAptChange(apt.id, 'name', e.target.value)} className="text-sm text-gray-800 bg-transparent border-none outline-none w-full" />
                  <input type="number" value={row.allowance ?? 0} onChange={e => handleAptChange(apt.id, 'allowance', e.target.value)} className="text-sm text-gray-800 text-center bg-transparent border-none outline-none w-full" />
                  <button
                    type="button" onClick={() => handleSaveApt(apt.id)}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium text-white transition-colors ${aptSaved[apt.id] ? 'bg-green-500' : 'bg-[#3d5068] hover:bg-[#2e3d51]'}`}
                  >
                    {aptSaved[apt.id] ? <><Check className="h-3 w-3" /> Saved</> : <><Save className="h-3 w-3" /> Save</>}
                  </button>
                  <button type="button" onClick={() => { if (confirm(`Delete "${apt.name}"?`)) onDeleteApt(payeeId, building.id, apt.id); }} className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors" title="Delete unit"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                {i < building.apartment_sizes.length - 1 && <div className="px-4"><div className="border-t border-gray-100" /></div>}
              </div>
            );
          })}

          {/* Add unit row */}
          <div className="border-t border-gray-100 grid grid-cols-[1fr_100px_80px_36px] px-4 py-2 bg-gray-50 items-center gap-2">
            <input
              type="text" placeholder="Unit type name"
              value={newUnitName} onChange={e => setNewUnitName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddUnit()}
              className="text-sm text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 w-full"
            />
            <input
              type="number" placeholder="0"
              value={newUnitAmt} onChange={e => setNewUnitAmt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddUnit()}
              className="text-sm text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 text-center w-full"
            />
            <button
              type="button" onClick={handleAddUnit} disabled={addingUnit || !newUnitName.trim()}
              className="flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51] disabled:opacity-40 transition-colors"
            >
              {addingUnit ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plus className="h-3 w-3" /> Add</>}
            </button>
            <span />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Payee row ───────────────────────────────────────────────────────────────

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white';

function PanelField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}


function PayeeRow({ payee, onToggleActive, onAddBuilding, onAddApt, onSaveApt, onUpdateBuilding, onDeleteBuilding, onDeleteApt, onUpdateProfile, onUpsertMember, onDeletePayee }: PayeeRowProps) {
  const [expanded,        setExpanded]        = useState(false);
  const [contactOpen,     setContactOpen]     = useState(false);
  const [billingOpen,     setBillingOpen]     = useState(false);
  const [toggling,        setToggling]        = useState(false);
  const [toggleHovered,   setToggleHovered]   = useState(false);
  const [toggleError,     setToggleError]     = useState<string | null>(null);
  const [salesOpen,       setSalesOpen]       = useState(false);
  const [salesSaving,     setSalesSaving]     = useState(false);
  const [salesSaved,      setSalesSaved]      = useState(false);
  const [salesError,      setSalesError]      = useState<string | null>(null);
  const [contactSaving,   setContactSaving]   = useState(false);
  const [contactSaved,    setContactSaved]    = useState(false);
  const [billingSaving,   setBillingSaving]   = useState(false);
  const [billingSaved,    setBillingSaved]    = useState(false);

  const isActive = payee.active !== false;

  // Local edit state — contact
  const [contactEdit, setContactEdit] = useState({
    company:          payee.company          ?? '',
    first_name:       payee.first_name       ?? '',
    last_name:        payee.last_name        ?? '',
    email:            payee.email            ?? '',
    phone:            payee.phone            ?? '',
    trumuv_payee_id:  payee.trumuv_payee_id  ?? 0,
    remit_address1:   payee.remit_address1   ?? '',
    remit_address2:   payee.remit_address2   ?? '',
    remit_city:       payee.remit_city       ?? '',
    remit_state:      payee.remit_state      ?? '',
    remit_zip:        payee.remit_zip        ?? '',
  });

  const [salesEdit, setSalesEdit] = useState({
    trumuv_member_id: payee.member?.trumuv_member_id ?? payee.trumuv_member_id ?? 0,
    first_name:       payee.member?.first_name ?? '',
    last_name:        payee.member?.last_name  ?? '',
    email:            payee.member?.email      ?? '',
    phone:            payee.member?.phone      ?? '',
  });

  // Local edit state — buildings (name + address per building)
  const [buildingEdits, setBuildingEdits] = useState<Record<string, { name: string; address: string; city: string; state: string; zip: string }>>(
    Object.fromEntries(payee.buildings.map(b => [b.id, { name: b.name, address: b.address, city: b.city, state: b.state, zip: b.zip }]))
  );
  const [unitsOpen, setUnitsOpen] = useState<Record<string, boolean>>({});

  async function handleToggle() {
    setToggling(true);
    setToggleError(null);
    try { await onToggleActive(payee.id, !isActive); }
    catch (err) { setToggleError((err as Error).message); }
    finally { setToggling(false); }
  }

  async function handleSaveSales() {
    if (!salesEdit.trumuv_member_id) {
      setSalesError('Account Manager ID is required.');
      return;
    }
    setSalesSaving(true);
    setSalesError(null);
    try {
      await onUpsertMember(payee.id, {
        trumuv_member_id: salesEdit.trumuv_member_id,
        first_name:       salesEdit.first_name,
        last_name:        salesEdit.last_name,
        email:            salesEdit.email,
        phone:            salesEdit.phone,
      });
      setSalesSaved(true);
      setTimeout(() => setSalesSaved(false), 2000);
    } catch (err) {
      setSalesError((err as Error).message);
    } finally {
      setSalesSaving(false);
    }
  }

  function toggleSales() {
    setSalesOpen(o => !o);
    if (contactOpen) setContactOpen(false);
    if (billingOpen) setBillingOpen(false);
  }

  async function handleSaveContact() {
    setContactSaving(true);
    try {
      await onUpdateProfile(payee.id, contactEdit);
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 2000);
    } finally {
      setContactSaving(false);
    }
  }

  async function handleSaveBilling() {
    setBillingSaving(true);
    try {
      for (const b of payee.buildings) {
        const edit = buildingEdits[b.id];
        if (edit) await onUpdateBuilding(payee.id, b.id, edit);
      }
      setBillingSaved(true);
      setTimeout(() => setBillingSaved(false), 2000);
    } finally {
      setBillingSaving(false);
    }
  }

  function setBuildingField(buildingId: string, field: string, value: string) {
    setBuildingEdits(prev => ({ ...prev, [buildingId]: { ...prev[buildingId], [field]: value } }));
  }

  function toggleContact() {
    setContactOpen(o => !o);
    if (billingOpen) setBillingOpen(false);
    if (salesOpen) setSalesOpen(false);
  }

  function toggleBilling() {
    setBillingOpen(o => !o);
    if (contactOpen) setContactOpen(false);
    if (salesOpen) setSalesOpen(false);
  }

  return (
    <DetailCard className="admin-table-card overflow-hidden">
      {/* Payee header row */}
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Status indicator */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-green-400' : 'bg-gray-300'}`} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
            {payee.company || '—'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {[payee.first_name, payee.last_name].filter(Boolean).join(' ')}
            {payee.email ? ` · ${payee.email}` : ''}
          </p>
        </div>

        {/* Building count — click to expand/collapse */}
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className={`flex items-center gap-1 text-xs mr-2 p-1.5 rounded-lg transition-colors ${
            expanded ? 'bg-gray-100 text-gray-600' : 'hover:bg-gray-100 text-gray-400'
          }`}
          title="Toggle buildings"
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>{payee.buildings.length}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {/* Sales contact chevron */}
        <button
          type="button"
          onClick={toggleSales}
          title="Edit account manager"
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
            salesOpen ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100 text-gray-400'
          }`}
        >
          <UserSquare className="h-4 w-4" />
          {salesOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {/* Contact chevron */}
        <button
          type="button"
          onClick={toggleContact}
          title="Edit contact"
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
            contactOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-400'
          }`}
        >
          <UserCircle className="h-4 w-4" />
          {contactOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {/* Billing chevron */}
        <button
          type="button"
          onClick={toggleBilling}
          title="Edit billing address"
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
            billingOpen ? 'bg-orange-50 text-orange-500' : 'hover:bg-gray-100 text-gray-400'
          }`}
        >
          <MapPin className="h-4 w-4" />
          {billingOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {/* Toggle active */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          onMouseEnter={() => setToggleHovered(true)}
          onMouseLeave={() => setToggleHovered(false)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors min-w-[84px] justify-center ${
            toggling
              ? 'bg-gray-100 text-gray-400'
              : isActive
                ? toggleHovered
                  ? 'bg-red-50 text-red-500'
                  : 'bg-green-50 text-green-600'
                : toggleHovered
                  ? 'bg-green-50 text-green-600'
                  : 'bg-gray-100 text-gray-400'
          }`}
        >
          {toggling
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : isActive
              ? toggleHovered
                ? <><PowerOff className="h-3.5 w-3.5" /> Deactivate</>
                : <><Power className="h-3.5 w-3.5" /> Active</>
              : toggleHovered
                ? <><Power className="h-3.5 w-3.5" /> Activate</>
                : <><PowerOff className="h-3.5 w-3.5" /> Inactive</>
          }
        </button>

        {toggleError && (
          <span className="text-xs text-red-500 max-w-[160px] truncate" title={toggleError}>
            {toggleError}
          </span>
        )}

        {/* Delete payee */}
        <button
          type="button"
          onClick={() => { if (confirm(`Delete "${payee.company || [payee.first_name, payee.last_name].filter(Boolean).join(' ')}"? This cannot be undone.`)) onDeletePayee(payee.id); }}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
          title="Delete payee"
        >
          <Trash2 className="h-4 w-4" />
        </button>

      </div>

      {/* Sales contact panel */}
      {salesOpen && (
        <div className="border-t border-gray-100 px-4 py-4 bg-purple-50/40">
          <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">Account Manager</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PanelField label="Account Manager ID">
              <input type="number" value={salesEdit.trumuv_member_id || ''} onChange={e => setSalesEdit(p => ({ ...p, trumuv_member_id: e.target.value === '' ? 0 : parseInt(e.target.value, 10) }))} className={inputCls} />
            </PanelField>
            <PanelField label="First Name">
              <input type="text" value={salesEdit.first_name} onChange={e => setSalesEdit(p => ({ ...p, first_name: e.target.value }))} className={inputCls} />
            </PanelField>
            <PanelField label="Last Name">
              <input type="text" value={salesEdit.last_name} onChange={e => setSalesEdit(p => ({ ...p, last_name: e.target.value }))} className={inputCls} />
            </PanelField>
            <PanelField label="Email">
              <input type="email" value={salesEdit.email} onChange={e => setSalesEdit(p => ({ ...p, email: e.target.value }))} className={inputCls} />
            </PanelField>
            <PanelField label="Phone">
              <input type="tel" inputMode="numeric" maxLength={14} value={salesEdit.phone} onChange={e => setSalesEdit(p => ({ ...p, phone: formatPhone(e.target.value) }))} className={inputCls} />
            </PanelField>
          </div>
          {salesError && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{salesError}</p>
          )}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSales}
              disabled={salesSaving}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors ${
                salesSaved ? 'bg-green-500' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {salesSaving
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                : salesSaved
                  ? <><Check className="h-3.5 w-3.5" /> Saved</>
                  : <><Save className="h-3.5 w-3.5" /> Save</>
              }
            </button>
          </div>
        </div>
      )}

      {/* Contact edit panel */}
      {contactOpen && (
        <div className="border-t border-gray-100 px-4 py-4 bg-blue-50/40">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-3">Contact Information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PanelField label="Company">
              <input type="text" value={contactEdit.company} onChange={e => setContactEdit(p => ({ ...p, company: e.target.value }))} className={inputCls} />
            </PanelField>
            <div className="grid grid-cols-2 gap-3">
              <PanelField label="First Name">
                <input type="text" value={contactEdit.first_name} onChange={e => setContactEdit(p => ({ ...p, first_name: e.target.value }))} className={inputCls} />
              </PanelField>
              <PanelField label="Last Name">
                <input type="text" value={contactEdit.last_name} onChange={e => setContactEdit(p => ({ ...p, last_name: e.target.value }))} className={inputCls} />
              </PanelField>
            </div>
            <PanelField label="Email">
              <input type="email" value={contactEdit.email} onChange={e => setContactEdit(p => ({ ...p, email: e.target.value }))} className={inputCls} />
            </PanelField>
            <PanelField label="Phone">
              <input type="tel" inputMode="numeric" maxLength={14} value={contactEdit.phone} onChange={e => setContactEdit(p => ({ ...p, phone: formatPhone(e.target.value) }))} className={inputCls} />
            </PanelField>
            <PanelField label="TruMuv Payee ID">
              <input type="number" value={contactEdit.trumuv_payee_id || ''} onChange={e => setContactEdit(p => ({ ...p, trumuv_payee_id: e.target.value === '' ? 0 : parseInt(e.target.value, 10) }))} className={inputCls} />
            </PanelField>
            <div className="md:col-span-2 border-t border-blue-100 pt-1">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Billing Address</p>
            </div>
            <div className="md:col-span-2">
              <PanelField label="Address 1">
                <input type="text" value={contactEdit.remit_address1} onChange={e => setContactEdit(p => ({ ...p, remit_address1: e.target.value }))} className={inputCls} />
              </PanelField>
            </div>
            <div className="md:col-span-2">
              <PanelField label="Address 2">
                <input type="text" value={contactEdit.remit_address2} onChange={e => setContactEdit(p => ({ ...p, remit_address2: e.target.value }))} className={inputCls} />
              </PanelField>
            </div>
            <PanelField label="City">
              <input type="text" value={contactEdit.remit_city} onChange={e => setContactEdit(p => ({ ...p, remit_city: e.target.value }))} className={inputCls} />
            </PanelField>
            <div className="grid grid-cols-2 gap-3">
              <PanelField label="State">
                <input type="text" maxLength={2} value={contactEdit.remit_state} onChange={e => setContactEdit(p => ({ ...p, remit_state: e.target.value }))} className={inputCls} />
              </PanelField>
              <PanelField label="Zip">
                <input type="text" maxLength={10} value={contactEdit.remit_zip} onChange={e => setContactEdit(p => ({ ...p, remit_zip: e.target.value }))} className={inputCls} />
              </PanelField>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSaveContact}
              disabled={contactSaving}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors ${
                contactSaved ? 'bg-green-500' : 'bg-[#3d5068] hover:bg-[#2e3d51]'
              }`}
            >
              {contactSaved ? <><Check className="h-3.5 w-3.5" /> Saved</> : <><Save className="h-3.5 w-3.5" /> Save</>}
            </button>
          </div>
        </div>
      )}

      {/* Buildings edit panel */}
      {billingOpen && (
        <div className="border-t border-gray-100 px-4 py-4 bg-orange-50/40">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-3">Buildings</p>
          <div className="space-y-3">
            {payee.buildings.map(b => {
              const edit = buildingEdits[b.id] ?? { name: b.name, address: b.address, city: b.city, state: b.state, zip: b.zip };
              const isUnitsOpen = unitsOpen[b.id] ?? false;
              return (
                <div key={b.id} className="bg-white rounded-lg border border-orange-100 overflow-hidden">
                  {/* Building fields */}
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <PanelField label="Building Name">
                        <input type="text" value={edit.name} onChange={e => setBuildingField(b.id, 'name', e.target.value)} className={inputCls} />
                      </PanelField>
                    </div>
                    <div className="md:col-span-2">
                      <PanelField label="Address">
                        <input type="text" value={edit.address} onChange={e => setBuildingField(b.id, 'address', e.target.value)} className={inputCls} />
                      </PanelField>
                    </div>
                    <PanelField label="City">
                      <input type="text" value={edit.city} onChange={e => setBuildingField(b.id, 'city', e.target.value)} className={inputCls} />
                    </PanelField>
                    <div className="grid grid-cols-2 gap-3">
                      <PanelField label="State">
                        <input type="text" maxLength={2} value={edit.state} onChange={e => setBuildingField(b.id, 'state', e.target.value)} className={inputCls} />
                      </PanelField>
                      <PanelField label="Zip">
                        <input type="text" maxLength={10} value={edit.zip} onChange={e => setBuildingField(b.id, 'zip', e.target.value)} className={inputCls} />
                      </PanelField>
                    </div>
                  </div>

                  {/* Units & Allowances toggle */}
                  <button
                    type="button"
                    onClick={() => setUnitsOpen(prev => ({ ...prev, [b.id]: !isUnitsOpen }))}
                    className={`w-full flex items-center gap-2 px-3 py-2 border-t border-orange-100 text-xs font-semibold transition-colors ${
                      isUnitsOpen ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-orange-500'
                    }`}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    Units & Allowances
                    <span className="ml-auto">{isUnitsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</span>
                  </button>

                  {/* Units dropdown */}
                  {isUnitsOpen && (
                    <div className="border-t border-orange-100">
                      {b.apartment_sizes.length === 0 ? (
                        <p className="px-3 py-3 text-xs text-gray-400">No unit types configured.</p>
                      ) : (
                        <>
                          <div className="admin-table-header grid grid-cols-2 px-3 py-1.5">
                            <span className="text-xs font-bold text-white">Unit Type</span>
                            <span className="text-xs font-bold text-white">Allowance</span>
                          </div>
                          {b.apartment_sizes.map(apt => (
                            <div key={apt.id} className="grid grid-cols-2 px-3 py-2 border-t border-gray-100">
                              <span className="text-xs text-gray-700">{apt.name}</span>
                              <span className="text-xs text-gray-500">${apt.allowance}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSaveBilling}
              disabled={billingSaving}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors ${
                billingSaved ? 'bg-green-500' : 'bg-[#3d5068] hover:bg-[#2e3d51]'
              }`}
            >
              {billingSaved ? <><Check className="h-3.5 w-3.5" /> Saved</> : <><Save className="h-3.5 w-3.5" /> Save</>}
            </button>
          </div>
        </div>
      )}

      {/* Expanded: building cards */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-3">
          {payee.buildings.length === 0 && (
            <p className="text-xs text-gray-400">No buildings enrolled yet.</p>
          )}
          {payee.buildings.map(b => (
            <BuildingCard
              key={b.id}
              payeeId={payee.id}
              building={b}
              onAddApt={onAddApt}
              onSaveApt={onSaveApt}
              onUpdateBuilding={onUpdateBuilding}
              onDeleteBuilding={onDeleteBuilding}
              onDeleteApt={onDeleteApt}
            />
          ))}
          <button
            type="button"
            onClick={() => onAddBuilding(payee.id, 'New Building')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Building
          </button>
        </div>
      )}
    </DetailCard>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

const emptyNewPayee = {
  company: '', first_name: '', last_name: '', email: '', phone: '',
  trumuv_payee_id: 0, remit_address1: '', remit_address2: '',
  remit_city: '', remit_state: '', remit_zip: '',
};

export default function Payees() {
  const navigate = useNavigate();
  const { payees, loading, error, setActive, updateApartmentSize, addApartmentSize, updateBuilding, updateProfile, upsertMember, createPayee, addBuilding, deleteBuilding, deleteApartmentSize, deletePayee } = usePayees();

  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [addOpen,   setAddOpen]   = useState(false);
  const [addForm,   setAddForm]   = useState({ ...emptyNewPayee });
  const [addSaving, setAddSaving] = useState(false);
  const [addError,  setAddError]  = useState<string | null>(null);

  async function handleAddPayee(e: React.FormEvent) {
    e.preventDefault();
    setAddSaving(true);
    setAddError(null);
    try {
      await createPayee(addForm);
      setAddOpen(false);
      setAddForm({ ...emptyNewPayee });
    } catch (err) {
      setAddError((err as Error).message);
    } finally {
      setAddSaving(false);
    }
  }

  const filtered = payees.filter(p => {
    if (filter === 'active')   return p.active !== false;
    if (filter === 'inactive') return p.active === false;
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">

      <header className="w-full px-6 md:px-8 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <h1 className="text-gray-900 font-bold flex-1 text-lg">Payees</h1>

        {/* Survey button */}
        <button
          type="button"
          onClick={() => navigate('/admin/survey')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51]"
        >
          <ClipboardList className="h-4 w-4" />
          <span className="admin-back-label">Survey</span>
        </button>

        {/* Admin button */}
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="admin-back-label">Admin</span>
        </button>

        {/* Add Payee */}
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#3d5068] text-white hover:bg-[#2e3d51] transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Payee
        </button>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Add Payee Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Add Payee</h2>
              <button type="button" onClick={() => setAddOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddPayee} className="px-6 py-5 space-y-4">
              {addError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{addError}</p>
              )}
              <div className="grid grid-cols-1 gap-3">
                <PanelField label="Company">
                  <input required type="text" value={addForm.company} onChange={e => setAddForm(p => ({ ...p, company: e.target.value }))} className={inputCls} />
                </PanelField>
                <div className="grid grid-cols-2 gap-3">
                  <PanelField label="First Name">
                    <input type="text" value={addForm.first_name} onChange={e => setAddForm(p => ({ ...p, first_name: e.target.value }))} className={inputCls} />
                  </PanelField>
                  <PanelField label="Last Name">
                    <input type="text" value={addForm.last_name} onChange={e => setAddForm(p => ({ ...p, last_name: e.target.value }))} className={inputCls} />
                  </PanelField>
                </div>
                <PanelField label="Email">
                  <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className={inputCls} />
                </PanelField>
                <PanelField label="Phone">
                  <input type="tel" inputMode="numeric" maxLength={14} value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: formatPhone(e.target.value) }))} className={inputCls} />
                </PanelField>
                <PanelField label="TruMuv Payee ID">
                  <input type="number" value={addForm.trumuv_payee_id || ''} onChange={e => setAddForm(p => ({ ...p, trumuv_payee_id: e.target.value === '' ? 0 : parseInt(e.target.value, 10) }))} className={inputCls} />
                </PanelField>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={addSaving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51] transition-colors disabled:opacity-60">
                  {addSaving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</> : <><Plus className="h-3.5 w-3.5" /> Add Payee</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 px-6 md:px-8 py-8 max-w-4xl w-full mx-auto space-y-3">

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-16">Loading payees…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <LayoutList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {filter === 'all' ? 'No payees enrolled yet.' : `No ${filter} payees.`}
            </p>
          </div>
        ) : (
          filtered.map(payee => (
            <PayeeRow
              key={payee.id}
              payee={payee}
              onToggleActive={setActive}
              onAddBuilding={addBuilding}
              onAddApt={addApartmentSize}
              onSaveApt={updateApartmentSize}
              onUpdateBuilding={updateBuilding}
              onDeleteBuilding={deleteBuilding}
              onDeleteApt={deleteApartmentSize}
              onUpdateProfile={updateProfile}
              onUpsertMember={upsertMember}
              onDeletePayee={deletePayee}
            />
          ))
        )}

      </div>
    </div>
  );
}
