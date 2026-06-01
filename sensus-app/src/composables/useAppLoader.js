import { readonly, ref } from 'vue'

const SHOW_DELAY_MS = 300
const MIN_VISIBLE_MS = 500

const isLoaderVisible = ref(false)

let activeRequests = 0
let showTimer = null
let hideTimer = null
let visibleSince = 0

function clearShowTimer() {
  if (!showTimer) return

  globalThis.clearTimeout(showTimer)
  showTimer = null
}

function clearHideTimer() {
  if (!hideTimer) return

  globalThis.clearTimeout(hideTimer)
  hideTimer = null
}

function setLoaderVisible(value) {
  if (isLoaderVisible.value === value) return

  isLoaderVisible.value = value
  visibleSince = value ? Date.now() : 0
}

export function showLoader() {
  activeRequests += 1
  clearHideTimer()

  if (isLoaderVisible.value || showTimer) return

  showTimer = globalThis.setTimeout(() => {
    showTimer = null

    if (activeRequests > 0) {
      setLoaderVisible(true)
    }
  }, SHOW_DELAY_MS)
}

export function hideLoader() {
  activeRequests = Math.max(0, activeRequests - 1)

  if (activeRequests > 0) return

  clearShowTimer()

  if (!isLoaderVisible.value) return

  const elapsedVisibleTime = Date.now() - visibleSince
  const remainingVisibleTime = Math.max(0, MIN_VISIBLE_MS - elapsedVisibleTime)

  clearHideTimer()
  hideTimer = globalThis.setTimeout(() => {
    hideTimer = null

    if (activeRequests === 0) {
      setLoaderVisible(false)
    }
  }, remainingVisibleTime)
}

export async function withLoader(task) {
  showLoader()

  try {
    return await task()
  } finally {
    hideLoader()
  }
}

export function useAppLoader() {
  return {
    isLoaderVisible: readonly(isLoaderVisible),
    showLoader,
    hideLoader,
    withLoader,
  }
}
