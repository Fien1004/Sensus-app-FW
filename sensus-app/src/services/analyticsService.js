import { supabase } from '../lib/supabase'
import { withLoader } from '../composables/useAppLoader'

const SESSIONS_TABLE = 'sessions'
const EVENTS_TABLE = 'events'
const SESSION_STARTED_AT_KEY = 'analyticsSessionStartedAt'
const STEP_STARTED_AT_KEY_PREFIX = 'analyticsStepStartedAt:'

function nowIso() {
  return new Date().toISOString()
}

function getLocalStorageValue(key) {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    warnAnalyticsError(`Analytics: unable to read localStorage key ${key}`, error)
    return null
  }
}

function setLocalStorageValue(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    warnAnalyticsError(`Analytics: unable to write localStorage key ${key}`, error)
  }
}

function removeLocalStorageValue(key) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    warnAnalyticsError(`Analytics: unable to clear localStorage key ${key}`, error)
  }
}

function warnAnalyticsError(message, error) {
  console.error(message, error)
}

function getDurationSeconds(startedAt, endedAt) {
  if (!startedAt || !endedAt) {
    return null
  }

  const startTime = new Date(startedAt).getTime()
  const endTime = new Date(endedAt).getTime()

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return null
  }

  return Math.max(1, Math.round((endTime - startTime) / 1000))
}

function getStepStartKey(sessionId, stepId) {
  return `${STEP_STARTED_AT_KEY_PREFIX}${sessionId}:${stepId}`
}

function toSafeDurationSeconds(durationSeconds) {
  const parsed = Number(durationSeconds)
  return Number.isFinite(parsed) && parsed > 0 ? Math.max(1, Math.round(parsed)) : 1
}

export function markSessionStart(sessionId, startedAt = nowIso()) {
  if (!sessionId) {
    return { ok: false, error: new Error('Missing sessionId') }
  }

  setLocalStorageValue(SESSION_STARTED_AT_KEY, startedAt)
  console.debug('[Analytics] session start marked', { sessionId, startedAt })

  return { ok: true, data: startedAt, error: null }
}

export function markStepStart(sessionId, stepId, startedAt = nowIso()) {
  if (!sessionId || !stepId) {
    return { ok: false, error: new Error('Missing sessionId or stepId') }
  }

  setLocalStorageValue(getStepStartKey(sessionId, stepId), startedAt)
  console.debug('[Analytics] step start marked', { sessionId, stepId, startedAt })

  return { ok: true, data: startedAt, error: null }
}

function getStepStartedAt(sessionId, stepId) {
  if (!sessionId || !stepId) {
    return null
  }

  return getLocalStorageValue(getStepStartKey(sessionId, stepId))
}

export async function createSession({ scenarioId, age, gender, totalSteps }) {
  return withLoader(async () => {
    if (!scenarioId) {
      const error = new Error('Missing scenarioId')
      warnAnalyticsError('Analytics: createSession missing scenarioId', error)
      return { ok: false, data: null, error }
    }

    const payload = {
      scenario_id: scenarioId,
      age: age ?? null,
      gender: gender ?? null,
      started_at: nowIso(),
      ended_at: null,
      status: 'active',
      duration_seconds: null,
      completed: false,
      stopped_reason: null,
      completed_steps: 0,
      total_steps: totalSteps ?? null,
    }

    const { data, error } = await supabase
      .from(SESSIONS_TABLE)
      .insert(payload)
      .select('id, started_at')
      .single()

    if (error) {
      warnAnalyticsError('Analytics: createSession failed', error)
      return { ok: false, data: null, error }
    }

    markSessionStart(data?.id ?? null, data?.started_at ?? payload.started_at)
    console.log('Created Supabase session:', data?.id)
    console.info('[Analytics] createSession result', {
      ok: true,
      sessionId: data?.id ?? null,
      scenarioId,
      totalSteps: payload.total_steps,
    })
    console.info('[Analytics] createSession inserted id', data?.id ?? null)

    return { ok: true, data, error: null }
  })
}

export async function trackEvent({
  sessionId,
  stepId,
  type,
  value,
  path,
  durationSeconds,
  metadata,
}) {
  return withLoader(async () => {
    if (!sessionId || !type) {
      console.warn('Analytics skipped: no valid Supabase session id')
      const error = new Error('Missing sessionId or type')
      warnAnalyticsError('Analytics: trackEvent missing required fields', error)
      return { ok: false, data: null, error }
    }

    console.log('Tracking event with session:', sessionId)
    console.info('[Analytics] trackEvent sessionId', sessionId)

    const stepStartedAt = getStepStartedAt(sessionId, stepId)
    const computedDurationSeconds = getDurationSeconds(stepStartedAt, nowIso())
    const resolvedDurationSeconds = durationSeconds != null
      ? toSafeDurationSeconds(durationSeconds)
      : computedDurationSeconds ?? 1

    const payload = {
      session_id: sessionId,
      step_id: stepId ?? null,
      type,
      value: value ?? null,
      path: path ?? null,
      duration_seconds: resolvedDurationSeconds,
      metadata: metadata ?? null,
    }

    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .insert(payload)
      .select()
      .single()

    if (error) {
      warnAnalyticsError('Analytics: trackEvent failed', error)
      return { ok: false, data: null, error }
    }

    console.info('[Analytics] trackEvent result', {
      ok: true,
      sessionId,
      stepId: stepId ?? null,
      type,
      duration_seconds: resolvedDurationSeconds,
    })

    return { ok: true, data, error: null }
  })
}

export const saveEvent = trackEvent

export async function completeSession({ sessionId, completedSteps, totalSteps }) {
  return withLoader(async () => {
    if (!sessionId) {
      console.warn('Analytics skipped: no valid Supabase session id')
      const error = new Error('Missing sessionId')
      warnAnalyticsError('Analytics: completeSession missing sessionId', error)
      return { ok: false, data: null, error }
    }

    console.log('Completing session:', sessionId)

    const endedAt = nowIso()
    const startedAt = getLocalStorageValue(SESSION_STARTED_AT_KEY)
    const durationSeconds = getDurationSeconds(startedAt, endedAt) ?? 0

    const { data, error } = await supabase
      .from(SESSIONS_TABLE)
      .update({
        ended_at: endedAt,
        status: 'completed',
        duration_seconds: durationSeconds,
        completed: true,
        stopped_reason: null,
        completed_steps: completedSteps ?? totalSteps ?? 0,
        total_steps: totalSteps ?? 0,
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      warnAnalyticsError('Analytics: completeSession failed', error)
      return { ok: false, data: null, error }
    }

    removeLocalStorageValue(SESSION_STARTED_AT_KEY)
    console.info('[Analytics] completeSession sessionId', sessionId)
    console.info('[Analytics] completeSession result', {
      ok: true,
      sessionId,
      duration_seconds: durationSeconds,
      completed_steps: completedSteps ?? totalSteps ?? 0,
      total_steps: totalSteps ?? 0,
    })

    return { ok: true, data, error: null }
  })
}

export async function stopSession({ sessionId, stoppedReason, completedSteps, totalSteps }) {
  return withLoader(async () => {
    if (!sessionId) {
      console.warn('Analytics skipped: no valid Supabase session id')
      const error = new Error('Missing sessionId')
      warnAnalyticsError('Analytics: stopSession missing sessionId', error)
      return { ok: false, data: null, error }
    }

    const endedAt = nowIso()
    const startedAt = getLocalStorageValue(SESSION_STARTED_AT_KEY)
    const durationSeconds = getDurationSeconds(startedAt, endedAt) ?? 0

    const { data, error } = await supabase
      .from(SESSIONS_TABLE)
      .update({
        ended_at: endedAt,
        status: 'stopped',
        duration_seconds: durationSeconds,
        completed: false,
        stopped_reason: stoppedReason ?? 'stopped',
        completed_steps: completedSteps ?? 0,
        total_steps: totalSteps ?? 0,
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      warnAnalyticsError('Analytics: stopSession failed', error)
      return { ok: false, data: null, error }
    }

    removeLocalStorageValue(SESSION_STARTED_AT_KEY)
    console.info('[Analytics] stopSession result', {
      ok: true,
      sessionId,
      stoppedReason: stoppedReason ?? 'stopped',
      duration_seconds: durationSeconds,
      completed_steps: completedSteps ?? 0,
      total_steps: totalSteps ?? 0,
    })

    return { ok: true, data, error: null }
  })
}
