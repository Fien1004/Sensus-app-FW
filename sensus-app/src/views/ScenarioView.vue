<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PenIcon from '../assets/icons/pen.svg'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { getScenarioBySlug } from '../services/scenarioService'
import { markStepStart, trackEvent } from '../services/analyticsService'
import { useAnalyticsSession } from '../composables/useAnalyticsSession'
import { useScenarioAI } from '../composables/useScenarioAI'
import { intentToNode } from '../utils/intentToNode'

const route = useRoute()
const router = useRouter()
const { analyzeResponse } = useScenarioAI()
const { ensureSession, getSessionId, completeCurrentSession } = useAnalyticsSession()

const scenarioId = computed(() => String(route.params.id ?? ''))
const slug = route.params.id
const queryStep = computed(() => route.query?.step)
const paramStep = computed(() => route.params?.step)

const scenario = ref(null)
const isLoading = ref(true)
const visitedStepIds = ref([])

const totalSteps = computed(() => scenario.value?.steps?.length ?? 0)

const currentStepId = computed(() => {
  return paramStep.value ?? queryStep.value ?? scenario.value?.steps?.[0]?.id ?? null
})

const currentStep = computed(() => {
  if (!scenario.value || !currentStepId.value) return null
  return scenario.value.steps.find((s) => s.id === currentStepId.value) || null
})

const progress = computed(() => currentStep.value?.progress ?? 0)
const isFallbackStep = computed(() => currentStepId.value === 'node_fallback')
const scenarioLayout = computed(() => {
  const stepLayout = String(currentStep.value?.layout ?? '').toLowerCase()
  if (stepLayout === 'narrative' || stepLayout === 'chat') {
    return stepLayout
  }

  const theme = String(scenario.value?.theme ?? '').toLowerCase()
  return theme === 'sociale situatie' ? 'narrative' : 'chat'
})

const fallbackChoices = [
  {
    label: 'Nog eens proberen',
    description: 'Terug naar het keuze-moment.',
    next: 'step-3',
  },
  {
    label: 'Verder praten',
    description: 'Kies de richting waarin je het gesprek wil sturen.',
    next: 'step-4a',
  },
  {
    label: 'Even afstand nemen',
    description: 'Laat wat ruimte vallen en kijk wat dat doet.',
    next: 'step-4b',
  },
  {
    label: 'Stoppen',
    description: 'Verlaat het scenario en kies voor een veilige pauze.',
    action: 'safe-exit',
  },
]

const textAnswer = ref('')

function getProfileData() {
  try {
    return JSON.parse(localStorage.getItem('profile') || '{}')
  } catch (error) {
    console.warn('Could not parse profile from localStorage', error)
    return {}
  }
}

function persistScenarioProgress() {
  localStorage.setItem('scenarioTotalSteps', String(totalSteps.value || 0))
  localStorage.setItem('scenarioCompletedSteps', String(visitedStepIds.value.length || 0))
}

function getCompletedStepCount() {
  return visitedStepIds.value.length || totalSteps.value || 0
}

function markVisitedStep(stepId) {
  if (!stepId || stepId === 'node_fallback') {
    persistScenarioProgress()
    return
  }

  if (!visitedStepIds.value.includes(stepId)) {
    visitedStepIds.value.push(stepId)
  }

  persistScenarioProgress()
}

watch(currentStepId, (stepId) => {
  markVisitedStep(stepId)
  const activeSessionId = getSessionId()
  if (activeSessionId && stepId) {
    markStepStart(activeSessionId, stepId)
  }
}, { immediate: true })

async function startSession() {
  const result = await ensureSession({
    scenarioId: scenarioId.value,
    totalSteps: totalSteps.value,
  })

  if (!result.ok) {
    console.warn('Analytics createSession failed; scenario flow continues without tracking')
    persistScenarioProgress()
    return
  }

  const activeSessionId = result.data?.id ?? ''

  if (activeSessionId && currentStepId.value) {
    markStepStart(activeSessionId, currentStepId.value)
  }

  persistScenarioProgress()
}

function showScenarioError() {
  router.replace({
    name: 'error',
    query: {
      retryTo: route.fullPath,
      icon: 'scenario',
    },
  })
}

onMounted(async () => {
  try {
    const s = await getScenarioBySlug(slug)
    console.debug('getScenarioBySlug result:', s)
    console.debug('engine_json:', s?.engine_json)
    console.debug('engine_json.steps count:', s?.engine_json?.steps?.length)
    // Use engine_json as the scenario data for steps/intro
    scenario.value = s?.engine_json ?? null
    console.debug('scenario.value set to:', scenario.value)
  } catch (err) {
    console.error('Error in onMounted:', err)
    scenario.value = null
    isLoading.value = false
    showScenarioError()
    return
  }

  if (!scenario.value) {
    isLoading.value = false
    showScenarioError()
    return
  }

  isLoading.value = false
  await startSession()
})

watchEffect(() => {
  if (currentStep.value?.type === 'reflection') {
    void navigateToStep(currentStep.value.id)
  }
})

function goSafeExit() {
  router.push({ name: 'safe-exit', query: { returnTo: route.fullPath } })
}

function goBack() {
  // If we're in an input step, go back to the choice step (remove '-input' suffix)
  const baseStepId = currentStepId.value?.replace('-input', '')
  router.push({ query: { step: baseStepId } })
}

async function navigateToStep(stepId) {
  console.log('=== navigateToStep CALLED with stepId:', stepId)

  if (stepId === 'node_fallback') {
    router.push({
      name: 'scenario',
      params: { id: scenarioId.value },
      query: { step: 'node_fallback' },
    })
    return
  }
  
  if (!stepId) {
    console.warn('navigateToStep: no stepId provided, using step-1')
    stepId = 'step-1'
  }
  
  let nextStep = scenario.value?.steps.find((s) => s.id === stepId)
  console.log('Found step:', nextStep?.id, 'type:', nextStep?.type)
  
  // Fallback to step-3 if step not found (first branching point)
  if (!nextStep) {
    console.warn('navigateToStep: step not found:', stepId, 'falling back to step-3')
    nextStep = scenario.value?.steps.find((s) => s.id === 'step-3')
  }
  
  // Last resort: use first step
  if (!nextStep) {
    console.warn('navigateToStep: no valid step found, using first step')
    nextStep = scenario.value?.steps?.[0]
  }
  
  if (!nextStep) {
    console.error('navigateToStep: could not find any step')
    return
  }
  
  console.log('Pushing to router:', nextStep.id)

  if (nextStep.type === 'reflection' || nextStep.type === 'end') {
    await completeCurrentSession({
      completedSteps: getCompletedStepCount(),
      totalSteps: totalSteps.value,
    })
  }
  
  if (nextStep.type === 'reflection') {
    router.push({ name: 'reflection', params: { id: scenarioId.value }, query: { step: nextStep.id } })
  } else if (nextStep.type === 'end') {
    router.push({ name: 'end', params: { id: scenarioId.value }, query: { step: nextStep.id } })
  } else {
    router.push({ name: 'scenario', params: { id: scenarioId.value }, query: { step: nextStep.id } })
  }
}

async function handleChoice(option) {
  const next = option?.next
  if (!next) return

  await startSession()
  const activeSessionId = getSessionId()
  if (!activeSessionId) {
    console.warn('Analytics skipped: no valid Supabase session id')
    return
  }

  const choiceValue = option?.label ?? option?.id ?? option?.text
  if (!choiceValue) return

  await trackEvent({
    sessionId: activeSessionId,
    stepId: currentStepId.value,
    type: 'choice',
    value: choiceValue,
    path: option?.path ?? option?.next ?? null,
    metadata: option,
  })
  await navigateToStep(next)
}

async function handleContinue() {
  const next = currentStep.value?.next
  if (!next) {
    console.warn('Continue step has no next defined', currentStep.value?.id)
    return
  }

  await startSession()
  const activeSessionId = getSessionId()
  if (activeSessionId) {
    await trackEvent({
      sessionId: activeSessionId,
      stepId: currentStepId.value,
      type: 'continue',
      value: currentStep.value?.button ?? 'Volgende',
      path: next,
      metadata: { stepId: currentStepId.value, next },
    })
  }

  await navigateToStep(next)
}

async function handleTextNext() {
  const userInput = textAnswer.value.trim()
  
  if (!userInput) {
    console.warn('No text input provided')
    return
  }

  console.log('=== handleTextNext CALLED ===')
  console.log('User input:', userInput)
  console.log('Current step ID:', currentStepId.value)
  
  try {
    console.log('Calling analyzeResponse...')
    
    // Create a timeout promise
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.warn('analyzeResponse timeout - using currentStep.next')
        resolve({
          sentiment: 'TIMEOUT',
          confidence: 0,
          intent: 'onduidelijk',
          nextNode: currentStep.value?.next || intentToNode['onduidelijk']
        })
      }, 3000) // 3 second timeout
    })
    
    // Race between analyzeResponse and timeout
    const result = await Promise.race([
      analyzeResponse(userInput),
      timeoutPromise
    ])
    
    console.log('AI Analysis Result:', result)
    // Keep logging for debugging, but do NOT let AI override scenario flow
    console.log('AI intent:', result?.intent, 'sentiment:', result?.sentiment, 'confidence:', result?.confidence)

    // If AI explicitly requests fallback, show fallback (branching step)
    if (result?.nextNode === 'node_fallback') {
      console.log('AI requested fallback, navigating to node_fallback')
      await startSession()
      const activeSessionId = getSessionId()
      if (!activeSessionId) {
        console.warn('Analytics skipped: no valid Supabase session id')
        textAnswer.value = ''
        navigateToStep('node_fallback')
        return
      }

      await trackEvent({
        sessionId: activeSessionId,
        stepId: currentStepId.value,
        type: 'custom_input',
        value: userInput,
        path: 'node_fallback',
        metadata: result,
      })
      textAnswer.value = ''
      await navigateToStep('node_fallback')
      return
    }

    await startSession()
    const activeSessionId = getSessionId()
    if (!activeSessionId) {
      console.warn('Analytics skipped: no valid Supabase session id')
      textAnswer.value = ''
      await navigateToStep(currentStep.value?.next)
      return
    }

    await trackEvent({
      sessionId: activeSessionId,
      stepId: currentStepId.value,
      type: 'custom_input',
      value: userInput,
      path: currentStep.value?.next ?? result?.nextNode ?? null,
      metadata: result,
    })

    // In all other cases, follow the scenario's defined next step
    const next = currentStep.value?.next
    if (!next) {
      console.warn('No currentStep.next defined, cannot navigate')
      return
    }

    textAnswer.value = ''
    await navigateToStep(next)
  } catch (error) {
    console.error('Error analyzing response:', error)
    // Fallback to default next step on error
    const next = currentStep.value?.next
    console.log('Fallback: currentStep.next =', next)
    if (!next) {
      console.warn('No next step available, cannot navigate')
      return
    }
    textAnswer.value = ''
    console.log('Navigating to fallback step:', next)
    await navigateToStep(next)
  }
}

async function handleFallbackChoice(choice) {
  if (!choice) return

  await startSession()
  const activeSessionId = getSessionId()
  if (!activeSessionId) {
    console.warn('Analytics skipped: no valid Supabase session id')
    return
  }

  await trackEvent({
    sessionId: activeSessionId,
    stepId: currentStepId.value,
    type: 'choice',
    value: choice.label,
    path: choice?.next ?? choice?.action ?? null,
    metadata: choice,
  })

  if (choice.action === 'safe-exit') {
    goSafeExit()
    return
  }

  await navigateToStep(choice.next)
}
</script>

<template>
  <ScreenContainer size="medium">
    <section class="scenario-step">
      <div v-if="isLoading">
        <h1>Laden…</h1>
      </div>

      <div v-else-if="!scenario">
        <h1>Scenario niet gevonden</h1>
      </div>

      <div v-else-if="isFallbackStep" class="scenario-step__inner">
        <div class="scenario-step__progress-wrap">
          <div class="scenario-step__progress" :style="{ width: '45%' }"></div>
        </div>

        <h1 class="scenario-step__title">Antwoord niet helemaal duidelijk</h1>
        <p class="scenario-step__description">
          Het antwoord was niet helemaal duidelijk. Kies zelf een richting om verder te gaan.
        </p>

        <div class="scenario-step__fallback-grid">
          <button
            v-for="choice in fallbackChoices"
            :key="choice.label"
            class="fallback-choice"
            @click="handleFallbackChoice(choice)"
          >
            <span class="fallback-choice__label">{{ choice.label }}</span>
            <span class="fallback-choice__description">{{ choice.description }}</span>
          </button>
        </div>
      </div>

      <div v-else-if="!currentStep">
        <h1>Stap niet gevonden</h1>
      </div>

      <div v-else class="scenario-step__inner">
        <div class="scenario-step__progress-wrap">
          <div class="scenario-step__progress" :style="{ width: progress + '%' }"></div>
        </div>

        <h1 class="scenario-step__title">{{ currentStep.title }}</h1>
        <p class="scenario-step__description">{{ currentStep.description }}</p>

        <div
          v-if="scenarioLayout === 'narrative' && (currentStep.contentCard || currentStep.chatMessages?.length)"
          class="narrative-content-card"
        >
          <p v-if="currentStep.contentCard?.text" class="narrative-content-card__text">
            {{ currentStep.contentCard.text }}
          </p>
          <p v-if="currentStep.contentCard?.note" class="narrative-content-card__note">
            {{ currentStep.contentCard.note }}
          </p>

          <div v-if="currentStep.chatMessages?.length" class="narrative-content-card__messages">
            <div
              v-for="(msg, idx) in currentStep.chatMessages"
              :key="idx"
              class="narrative-content-card__message"
            >
              <p class="narrative-content-card__text">{{ msg.text }}</p>
              <p v-if="msg.note" class="narrative-content-card__note">{{ msg.note }}</p>
            </div>
          </div>
        </div>

        <div v-else-if="scenarioLayout !== 'narrative' && currentStep.chatMessages" class="scenario-step__chat">
          <div class="scenario-step__chat-card">
            <div
              v-for="(msg, idx) in currentStep.chatMessages"
              :key="idx"
              class="chat-item"
            >
              <div v-if="msg.time" class="chat-item__time">{{ msg.time }}</div>

              <div
                :class="['chat-bubble', msg.sender === 'you' ? 'chat-bubble--you' : 'chat-bubble--other']"
              >
                <div class="chat-bubble__text">{{ msg.text }}</div>
              </div>

              <div v-if="msg.status" class="chat-item__status">{{ msg.status }}</div>
            </div>
          </div>
        </div>

        <div class="scenario-step__question">
          <p class="scenario-step__question-label">{{ currentStep.question }}</p>

          <div v-if="currentStep.inputType === 'choice'" class="scenario-step__choices">
            <button
              v-for="(opt, i) in currentStep.options"
              :key="i"
              class="choice-button"
              @click="handleChoice(opt)"
            >
              <img
                v-if="opt.label && opt.label.toLowerCase().includes('eigen')"
                :src="PenIcon"
                alt=""
                class="choice-icon"
                aria-hidden="true"
              />
              <span class="choice-label">{{ opt.label }}</span>
            </button>
          </div>

          <div v-else-if="currentStep.inputType === 'text'" class="scenario-step__text-input">
            <div class="text-card">
              <textarea v-model="textAnswer" rows="4" class="text-area" placeholder="Typ hier je antwoord..."></textarea>
            </div>

            <div class="scenario-step__text-actions">
              <BaseButton size="lg" variant="danger" class="text-action" @click="goBack">Annuleren</BaseButton>
              <BaseButton size="lg" variant="primary" class="text-action" @click="handleTextNext">Volgende</BaseButton>
            </div>
          </div>

          <div v-else-if="currentStep.type === 'continue'" class="scenario-step__continue">
            <BaseButton size="lg" fullWidth @click="handleContinue">{{ currentStep.button || 'Volgende' }}</BaseButton>
          </div>
        </div>
      </div>

      <div class="scenario-step__footer">
        <BaseButton fullWidth size="lg" variant="tertiary" @click="goSafeExit">Stoppen?</BaseButton>
      </div>
    </section>
  </ScreenContainer>
</template>

<style scoped>
.scenario-step {
  min-height: calc(100dvh - 64px);
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  padding-bottom: 24px;
}

.scenario-step__inner,
.scenario-step__footer {
  width: 100%;
}

.scenario-step__progress-wrap {
  background: var(--color-neutral-100, #f3f4f6);
  height: 8px;
  border-radius: 12px;
  margin-top: 20px;
  overflow: hidden;
}

.scenario-step__progress {
  height: 100%;
  background: var(--color-primary-600);
  width: 0%;
}

.scenario-step__title {
  margin-top: 18px;
  font-size: 1.5rem;
  font-weight: 700;
}

.scenario-step__description {
  margin-top: 10px;
  color: var(--color-text);
}

.narrative-content-card {
  margin-top: 24px;
  margin-bottom: 24px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(17,24,39,0.08);
  padding: 24px;
}

.narrative-content-card__text {
  margin: 0;
  font-size: 1.06rem;
  line-height: 1.6;
  color: var(--color-text);
}

.narrative-content-card__note {
  margin: 10px 0 0;
  font-size: 0.9rem;
  line-height: 1.45;
  font-style: italic;
  color: var(--color-text-muted);
}

.narrative-content-card__messages {
  margin-top: 8px;
  display: grid;
  gap: 12px;
}

.narrative-content-card__message .narrative-content-card__text {
  margin: 0;
}

.scenario-step__fallback-grid {
  margin-top: 24px;
  display: grid;
  gap: 14px;
}

.fallback-choice {
  appearance: none;
  border: 1px solid var(--color-neutral-200, #e5e7eb);
  border-radius: 20px;
  background: #fff;
  padding: 18px 16px;
  text-align: left;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
}

.fallback-choice__label {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.fallback-choice__description {
  display: block;
  margin-top: 6px;
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--color-neutral-700, #4b5563);
}

.scenario-step__chat {
  margin-top: 18px;
}

.scenario-step__chat-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(17,24,39,0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-bubble {
  display: block;
  padding: 10px 12px;
  border-radius: 14px;
  max-width: 75%;
  word-break: break-word;
}

.chat-bubble--you {
  background: var(--color-primary-600);
  color: #fff;
  align-self: flex-end;
  border-radius: 18px 18px 6px 18px;
}

.chat-bubble--other {
  background: #f3f4f6;
  color: var(--color-text);
  align-self: flex-start;
  border-radius: 18px 18px 18px 6px;
}

.chat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chat-item .chat-bubble--you {
  align-items: flex-end;
}

.chat-item__time {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.chat-item__status {
  margin-top: 6px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  align-self: flex-start;
}

.scenario-step__chat-time {
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.scenario-step__question {
  margin-top: 24px;
  margin-bottom: 24px;
}

.choice-button {
  display: block;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 14px 18px;
  border-radius: 14px;
  border: 1px solid rgba(17,24,39,0.08);
  background: #ffffff;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 1rem;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.06s ease;
  cursor: pointer;
}

.text-area {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(17,24,39,0.08);
  resize: vertical;
}

.scenario-step__text-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.text-cancel {
  background: transparent;
  border: none;
  color: var(--color-text);
  font-weight: 600;
  cursor: pointer;
}

.scenario-step__text-next {
  margin-top: 12px;
}

.text-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(17,24,39,0.04);
}

.scenario-step__text-actions .text-action {
  flex: 1 1 0;
}

.text-action + .text-action {
  margin-left: 0;
}

.choice-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  color: var(--color-text-muted);
}

.choice-label {
  display: inline-block;
}


.choice-button:hover:not(:disabled) {
  background-color: rgba(124,58,237,0.04); /* subtle purple tint */
  border-color: rgba(124,58,237,0.16);
  transform: translateY(-1px);
}

.choice-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.choice-button:active:not(:disabled) {
  transform: translateY(0);
}

.choice-button:focus-visible {
  outline: 3px solid rgba(59,130,246,0.12);
  outline-offset: 2px;
}
.scenario-step__footer {
  margin-top: auto;
  padding-top: 20px;
}

@media (min-width: 768px) {
  .scenario-step {
    max-width: 900px;
    margin: 0 auto;
    padding-top: 32px;
    padding-bottom: 32px;
    min-height: calc(100dvh - 32px);
  }

  .scenario-step__title {
    font-size: clamp(1.9rem, 2.8vw, 2.5rem);
  }

  .scenario-step__description {
    font-size: 1.05rem;
  }

  .scenario-step__fallback-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .scenario-step__chat {
    margin-top: 24px;
  }

  .scenario-step__chat-card {
    padding: 20px;
  }

  .scenario-step__question {
    margin-top: 28px;
    margin-bottom: 28px;
  }

  .scenario-step__question-label {
    font-size: 1.05rem;
  }

  .scenario-step__text-actions {
    justify-content: flex-start;
  }

  .scenario-step__text-actions .text-action {
    max-width: 280px;
  }
}
</style>
