import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, Building2 } from 'lucide-react';
import { DetailCard } from '../../../components/detail-card';
import type { BuildingWithApts } from '@/hooks/useProfile';

const EMPTY = { name: '', address: '', city: '', state: '', zip: '' };

interface Props {
  buildings: BuildingWithApts[];
  onAdd: (b: typeof EMPTY) => Promise<void>;
  onUpdate: (id: string, b: typeof EMPTY) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function BuildingForm({
  values,
  onChange,
}: {
  values: typeof EMPTY;
  onChange: (v: typeof EMPTY) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Field label="Building Name">
        <input type="text" placeholder="Riverside Apartments" value={values.name}
          onChange={e => onChange({ ...values, name: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Address">
        <input type="text" placeholder="123 Main St" value={values.address}
          onChange={e => onChange({ ...values, address: e.target.value })} className={inputCls} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="City">
          <input type="text" placeholder="Plymouth" value={values.city}
            onChange={e => onChange({ ...values, city: e.target.value })} className={inputCls} />
        </Field>
        <Field label="State">
          <input type="text" placeholder="MN" value={values.state}
            onChange={e => onChange({ ...values, state: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Zip">
          <input type="text" placeholder="55441" value={values.zip}
            onChange={e => onChange({ ...values, zip: e.target.value })} className={inputCls} />
        </Field>
      </div>
    </div>
  );
}

export function StepBuilding({ buildings, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [newB, setNewB] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editB, setEditB] = useState(EMPTY);

  async function handleAdd() {
    if (!newB.name.trim()) return;
    setSaving(true);
    try { await onAdd(newB); setNewB(EMPTY); setAdding(false); }
    finally { setSaving(false); }
  }

  async function handleSaveEdit(id: string) {
    await onUpdate(id, editB);
    setEditingId(null);
  }

  return (
    <div className="max-w-lg w-full mx-auto space-y-5">
      <div className="flex items-start gap-3">
        <div className="bg-orange-50 rounded-xl p-2.5 mt-0.5">
          <Building2 className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Which buildings do you manage?</h2>
          <p className="text-sm text-gray-500 mt-1">Add each property you'd like to set up pricing for. You can always add more later.</p>
        </div>
      </div>

      {adding && (
        <DetailCard className="admin-table-card">
          <div className="px-5 py-3 border-b border-gray-200">
            <span className="font-bold text-gray-900 text-sm">New Building</span>
          </div>
          <div className="p-5">
            <BuildingForm values={newB} onChange={setNewB} />
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" onClick={() => setAdding(false)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleAdd} disabled={saving || !newB.name.trim()}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51] disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : 'Save Building'}
              </button>
            </div>
          </div>
        </DetailCard>
      )}

      {buildings.length === 0 && !adding && (
        <p className="text-sm text-gray-400 text-center py-10">No buildings yet. Add one below.</p>
      )}

      <div className="space-y-3">
        {buildings.map(b => (
          <DetailCard key={b.id} className="admin-table-card overflow-hidden">
            <div className="px-4 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {editingId === b.id ? (
                  <BuildingForm values={editB} onChange={setEditB} />
                ) : (
                  <>
                    <p className="font-semibold text-gray-900 text-sm">{b.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {[b.address, b.city, b.state, b.zip].filter(Boolean).join(', ')}
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {editingId === b.id ? (
                  <>
                    <button type="button" onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleSaveEdit(b.id)}
                      className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors">
                      <Check className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { setEditingId(b.id); setEditB({ name: b.name, address: b.address, city: b.city, state: b.state, zip: b.zip }); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => onDelete(b.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </DetailCard>
        ))}
      </div>

      {!adding && (
        <button type="button" onClick={() => { setAdding(true); setNewB(EMPTY); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51] transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Building
        </button>
      )}

    </div>
  );
}
