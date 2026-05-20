import { supabase } from '../lib/supabase'

const ANALYTICS_TABLE = 'scenario_analytics'

export async function saveAnonymousScenarioAnalytics({
  scenarioId,
  outcomePath,
  completionStatus,
  timestamp = new Date().toISOString(),
}) {
  if (!scenarioId || !outcomePath || !completionStatus) {
    return {
      ok: false,
      error: new Error('Missing required analytics fields'),
    }
  }

  const { error } = await supabase.from(ANALYTICS_TABLE).insert([
    {
      scenario_id: scenarioId,
      outcome_path: outcomePath,
      completion_status: completionStatus,
      timestamp,
    },
  ])

  if (error) {
    console.error('Error saving anonymous scenario analytics:', error)
    return { ok: false, error }
  }

  return { ok: true, error: null }
}