import { useState, useEffect, useCallback } from 'react';
import { supabase, type SurveyRow } from '@/lib/supabase';

export function useSurvey() {
  const [questions, setQuestions] = useState<SurveyRow[]>([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('survey')
      .select('*')
      .order('order');
    if (!error && data) setQuestions(data as SurveyRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveQuestion = useCallback(async (row: SurveyRow) => {
    if (!supabase) return;
    await supabase.from('survey').upsert(row);
    setQuestions(prev => prev.map(q => q.id === row.id ? row : q));
  }, []);

  const addQuestion = useCallback(async (): Promise<SurveyRow | null> => {
    if (!supabase) return null;
    const maxOrder = questions.reduce((m, q) => Math.max(m, q.order), 0);
    const { data, error } = await supabase
      .from('survey')
      .insert({ order: maxOrder + 1, question: '', yes_no: true, note: null, active: 1 })
      .select()
      .single();
    if (error || !data) return null;
    const newRow = data as SurveyRow;
    setQuestions(prev => [...prev, newRow]);
    return newRow;
  }, [questions]);

  const deleteQuestion = useCallback(async (id: number) => {
    if (!supabase) return;
    await supabase.from('survey').delete().eq('id', id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const saveAll = useCallback(async (rows: SurveyRow[]) => {
    if (!supabase) return;
    for (const row of rows) {
      await supabase.from('survey').upsert(row);
    }
    setQuestions(rows);
  }, []);

  return { questions, loading, saveQuestion, addQuestion, deleteQuestion, saveAll };
}
