import { ref } from 'vue'
import { createSession, markSessionStart } from '../services/analyticsService'

const sessionId = ref(localStorage.getItem('sessionId') || '')
const sessionPromise = ref(null)

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

  try {
    if (value) {
      localStorage.setItem('sessionId', value)
    } else {
      localStorage.removeItem('sessionId')
    }
  } catch (error) {
    console.warn('[Analytics] could not persist sessionId', error)
  }
}

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

  function getSessionId() {
    return sessionId.value || ''
  }

  function clearSessionId() {
    persistSessionId('')
  }

  return {
    ensureSession,
    getSessionId,
    clearSessionId,
  }
}