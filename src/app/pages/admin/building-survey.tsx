/**
 * =========================================================================
 * Building Survey Page — Admin
 * =========================================================================
 * Shows all active survey questions with per-building yes/no + note answers.
 */

import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { DetailCard } from '../../components/detail-card';
import { useBuildingSurvey } from '@/hooks/useBuildingSurvey';

export default function BuildingSurvey() {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const { questions, loading, saveResponse } = useBuildingSurvey(buildingId ?? '');

  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved,  setSaved]  = useState<Record<number, boolean>>({});
  const [notes,  setNotes]  = useState<Record<number, string>>({});

  function getNote(q: typeof questions[number]): string {
    if (notes[q.id] !== undefined) return notes[q.id];
    return q.response?.note ?? '';
  }

  async function handleToggle(questionId: number, current: boolean | null) {
    setSaving(prev => ({ ...prev, [questionId]: true }));
    const next = current === null ? true : current ? false : null;
    const note = notes[questionId] ?? questions.find(q => q.id === questionId)?.response?.note ?? null;
    await saveResponse(questionId, next, note || null);
    setSaving(prev => ({ ...prev, [questionId]: false }));
    setSaved(prev => ({ ...prev, [questionId]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [questionId]: false })), 1500);
  }

  async function handleNoteBlur(questionId: number) {
    const note = notes[questionId] ?? null;
    const q = questions.find(q => q.id === questionId);
    const yes_no = q?.response?.yes_no ?? null;
    await saveResponse(questionId, yes_no, note || null);
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/payees')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-white bg-[#3d5068] hover:bg-[#2e3d51]"
        >
          <ArrowLeft className="h-4 w-4" />
          Payees
        </button>
        <h1 className="text-gray-900 font-bold flex-1 text-lg">Building Survey</h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 md:px-8 py-8">
        <DetailCard className="admin-table-card">

          {/* Column headers */}
          <div className="admin-table-header grid grid-cols-[32px_1fr_120px_200px] px-4 py-2">
            <span className="admin-table-cell font-bold text-white text-center">#</span>
            <span className="admin-table-cell font-bold text-white">Question</span>
            <span className="admin-table-cell font-bold text-white text-center">Response</span>
            <span className="admin-table-cell font-bold text-white">Note</span>
          </div>

          {/* Rows */}
          {loading ? (
            <p className="text-gray-400 text-sm px-4 py-6">Loading questions…</p>
          ) : questions.length === 0 ? (
            <p className="text-gray-400 text-sm px-4 py-6">No survey questions configured.</p>
          ) : questions.map((q, index) => {
            const response = q.response?.yes_no ?? null;
            return (
              <div key={q.id}>
                <div className="grid grid-cols-[32px_1fr_120px_200px] px-4 py-3 bg-white items-center gap-3">

                  {/* Order */}
                  <span className="text-xs text-gray-400 text-center">{q.order}</span>

                  {/* Question */}
                  <span className="text-sm text-gray-800">{q.question}</span>

                  {/* Yes / No / — toggle */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggle(q.id, response)}
                      disabled={saving[q.id]}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        response === true  ? 'bg-green-500 text-white' :
                        response === false ? 'bg-red-400 text-white'   :
                                            'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {saving[q.id] ? '…' : saved[q.id] ? <Check className="h-3 w-3" /> : response === true ? 'Yes' : response === false ? 'No' : '—'}
                    </button>
                  </div>

                  {/* Note */}
                  <input
                    type="text"
                    value={getNote(q)}
                    onChange={e => setNotes(prev => ({ ...prev, [q.id]: e.target.value }))}
                    onBlur={() => handleNoteBlur(q.id)}
                    placeholder="Add note…"
                    className="text-sm text-gray-800 bg-transparent border-b border-gray-200 outline-none w-full focus:border-blue-500 placeholder:text-gray-300"
                  />
                </div>

                {index < questions.length - 1 && (
                  <div className="grid grid-cols-[32px_1fr_120px_200px] px-4">
                    <div className="border-t border-gray-100" />
                    <div className="border-t border-gray-100" />
                    <div className="border-t border-gray-100" />
                    <div className="border-t border-gray-100" />
                  </div>
                )}
              </div>
            );
          })}
        </DetailCard>
      </div>
    </div>
  );
}
