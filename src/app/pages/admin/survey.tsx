/**
 * =========================================================================
 * Survey Page — Admin
 * =========================================================================
 * Editable list of survey questions pulled from Supabase.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, Save, Check, ClipboardList, Users, ShieldCheck } from 'lucide-react';
import { DetailCard } from '../../components/detail-card';
import { useSurvey } from '@/hooks/useSurvey';
import type { SurveyRow } from '@/lib/supabase';

export default function Survey() {
  const navigate = useNavigate();
  const { questions, loading, addQuestion, deleteQuestion, saveAll } = useSurvey();

  const [local, setLocal]   = useState<SurveyRow[]>([]);
  const [saved, setSaved]   = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => { setLocal(questions); }, [questions]);

  function handleChange(id: number, field: keyof SurveyRow, value: string | boolean | number) {
    setLocal(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  }

  async function handleAdd() {
    setAdding(true);
    await addQuestion();
    setAdding(false);
  }

  async function handleSave() {
    await saveAll(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <ClipboardList className="h-5 w-5 text-gray-500" />
          <h1 className="text-gray-900 font-bold text-lg">Survey</h1>
        </div>

        {/* Admin button */}
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51]"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Admin</span>
        </button>

        {/* Payees button */}
        <button
          type="button"
          onClick={() => navigate('/admin/payees')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51]"
        >
          <Users className="h-4 w-4" />
          <span>Payees</span>
        </button>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-white ${saved ? 'bg-green-500' : 'bg-[#3d5068] hover:bg-[#2e3d51]'}`}
        >
          {saved ? <><Check className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save</>}
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 md:px-8 py-8">
        <DetailCard className="admin-table-card">

          {/* Column headers */}
          <div className="admin-table-header grid grid-cols-[48px_1fr_80px_80px_36px] px-4 py-2">
            <span className="admin-table-cell font-bold text-white text-center">#</span>
            <span className="admin-table-cell font-bold text-white">Question</span>
            <span className="admin-table-cell font-bold text-white text-center">Yes/No</span>
            <span className="admin-table-cell font-bold text-white text-center">Active</span>
            <span />
          </div>

          {/* Rows */}
          {loading ? (
            <p className="text-gray-400 text-sm px-4 py-6">Loading questions…</p>
          ) : local.length === 0 ? (
            <p className="text-gray-400 text-sm px-4 py-6">No questions yet. Click Add Question to get started.</p>
          ) : local.map((row, index) => (
            <div key={row.id}>
              <div className="grid grid-cols-[48px_1fr_80px_80px_36px] px-4 py-3 bg-white items-center gap-2">

                {/* Order */}
                <input
                  type="number"
                  value={row.order}
                  onChange={e => handleChange(row.id, 'order', parseInt(e.target.value) || 0)}
                  className="admin-table-cell text-gray-800 text-center bg-transparent border-b border-gray-200 outline-none w-full focus:border-blue-500"
                />

                {/* Question */}
                <input
                  type="text"
                  value={row.question}
                  onChange={e => handleChange(row.id, 'question', e.target.value)}
                  placeholder="Enter question…"
                  className="admin-table-cell text-gray-800 bg-transparent border-b border-gray-200 outline-none w-full focus:border-blue-500"
                />

                {/* Yes/No toggle */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleChange(row.id, 'yes_no', !row.yes_no)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${row.yes_no ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {row.yes_no ? 'Yes/No' : 'Open'}
                  </button>
                </div>

                {/* Active toggle */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleChange(row.id, 'active', row.active === 1 ? 0 : 1)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${row.active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {row.active === 1 ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => deleteQuestion(row.id)}
                  className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {index < local.length - 1 && (
                <div className="grid grid-cols-[48px_1fr_80px_80px_36px] px-4">
                  <div className="border-t border-gray-200" />
                  <div className="border-t border-gray-200" />
                  <div className="border-t border-gray-200" />
                  <div className="border-t border-gray-200" />
                  <div className="border-t border-gray-200" />
                </div>
              )}
            </div>
          ))}

          {/* Add row */}
          <div className="px-4 pt-3 pb-2 border-t border-gray-200 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Question
            </button>
          </div>

        </DetailCard>
      </div>

    </div>
  );
}
