import { ref } from 'vue'
import { completeSession, createSession, markSessionStart } from '../services/analyticsService'

const sessionId = ref('')
const sessionStartedAt = ref('')
const sessionPromise = ref(null)
const completedSessionId = ref('')

function clearLegacySessionStorage() {
  try {
    localStorage.removeItem('sessionId')
    sessionStorage.removeItem('sessionId')
  } catch (error) {
    console.warn('[Analytics] could not clear legacy session storage', error)
  }
}

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem('profile') || '{}')
  } catch (error) {
    console.warn('[Analytics] could not read profile from localStorage', error)
    return {}
  }
}

function persistSessionId(value) {
  sessionId.value = value || ''
}

function markSessionCompleted(value) {
  completedSessionId.value = value || ''
}

clearLegacySessionStorage()

export function useAnalyticsSession() {
  async function ensureSession({ scenarioId, totalSteps }) {
    if (sessionId.value) {
      return { ok: true, data: { id: sessionId.value }, error: null }
    }

    if (sessionPromise.value) {
      return sessionPromise.value
    }

    const profile = readProfile()

    sessionPromise.value = (async () => {
      try {
        const result = await createSession({
          scenarioId,
          age: profile.age ?? null,
          gender: profile.gender ?? 'unknown',
          totalSteps,
        })

        if (!result.ok) {
          console.warn('[Analytics] ensureSession failed', result.error)
          return result
        }

        const createdSessionId = result.data?.id ?? ''
        persistSessionId(createdSessionId)
        sessionStartedAt.value = result.data?.started_at ?? ''

        if (createdSessionId) {
          markSessionStart(createdSessionId, result.data?.started_at)
        }

        return result
      } catch (error) {
        console.warn('[Analytics] ensureSession threw', error)
        return { ok: false, data: null, error }
      } finally {
        sessionPromise.value = null
      }
    })()

    return sessionPromise.value
  }

  async function completeCurrentSession({ completedSteps, totalSteps } = {}) {
    if (sessionPromise.value) {
      await sessionPromise.value
    }

    const activeSessionId = sessionId.value || ''
    if (!activeSessionId) {
      return { ok: false, data: null, error: new Error('Missing sessionId') }
    }

    if (completedSessionId.value === activeSessionId) {
      return { ok: true, data: { id: activeSessionId }, error: null, alreadyCompleted: true }
    }

    const result = await completeSession({
      sessionId: activeSessionId,
      completedSteps,
      totalSteps,
    })

    if (result.ok) {
      markSessionCompleted(activeSessionId)
    }

    return result
  }

  function getSessionId() {
    return sessionId.value || ''
  }

  function getSessionStartedAt() {
    return sessionStartedAt.value || ''
  }

  function clearSessionId() {
    persistSessionId('')
    sessionStartedAt.value = ''
    markSessionCompleted('')
  }

  return {
    ensureSession,
    completeCurrentSession,
    getSessionId,
    getSessionStartedAt,
    clearSessionId,
  }
}