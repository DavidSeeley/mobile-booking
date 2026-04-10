import { useState, useEffect, useCallback } from 'react';
import { supabase, type SurveyRow, type BuildingSurveyResponseRow } from '@/lib/supabase';

export interface BuildingSurveyQuestion extends SurveyRow {
  response: BuildingSurveyResponseRow | null;
}

export function useBuildingSurvey(buildingId: string) {
  const [questions, setQuestions] = useState<BuildingSurveyQuestion[]>([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    const [{ data: surveyData }, { data: responseData }] = await Promise.all([
      supabase.from('survey').select('*').eq('active', 1).order('order'),
      supabase.from('building_survey_responses').select('*').eq('building_id', buildingId),
    ]);

    const responseMap = new Map(
      (responseData ?? []).map((r: BuildingSurveyResponseRow) => [r.question_id, r])
    );

    setQuestions(
      (surveyData ?? []).map((q: SurveyRow) => ({
        ...q,
        response: responseMap.get(q.id) ?? null,
      }))
    );
    setLoading(false);
  }, [buildingId]);

  useEffect(() => { load(); }, [load]);

  const saveResponse = useCallback(async (
    questionId: number,
    yes_no: boolean | null,
    note: string | null
  ) => {
    if (!supabase) return;
    await supabase.from('building_survey_responses').upsert(
      { building_id: buildingId, question_id: questionId, yes_no, note, updated_at: new Date().toISOString() },
      { onConflict: 'building_id,question_id' }
    );
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, response: { building_id: buildingId, question_id: questionId, yes_no, note } }
        : q
    ));
  }, [buildingId]);

  return { questions, loading, saveResponse };
}
