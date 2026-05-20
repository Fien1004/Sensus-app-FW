<script setup>
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PenIcon from '../assets/icons/pen.svg'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { getScenarioBySlug } from '../services/scenarioService'
import { supabase } from '../lib/supabase'
import { useScenarioAI } from '../composables/useScenarioAI'
import { intentToNode } from '../utils/intentToNode'

const route = useRoute()
const router = useRouter()
const { analyzeResponse } = useScenarioAI()

const scenarioId = computed(() => String(route.params.id ?? ''))
const slug = route.params.id
const queryStep = computed(() => route.query?.step)
const paramStep = computed(() => route.params?.step)

const scenario = ref(null)
const isLoading = ref(true)

const currentStepId = computed(() => {
  return paramStep.value ?? queryStep.value ?? scenario.value?.steps?.[0]?.id ?? null
})

const currentStep = computed(() => {
  if (!scenario.value || !currentStepId.value) return null
  return scenario.value.steps.find((s) => s.id === currentStepId.value) || null
})

const progress = computed(() => currentStep.value?.progress ?? 0)
const isFallbackStep = computed(() => currentStepId.value === 'node_fallback')

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
const sessionId = ref(null)

async function startSession() {
  const profile = JSON.parse(localStorage.getItem('profile') || '{}')

  const { data, error } = await supabase
    .from('sessions')
    .insert([
      {
        scenario_id: scenarioId.value,
        age: profile.age || null,
        gender: profile.gender || 'unknown',
        started_at: new Date()
      }
    ])
    .select()

  if (error) {
    console.error(error)
    return
  }

  sessionId.value = data?.[0]?.id ?? null

  if (sessionId.value) {
    localStorage.setItem('sessionId', sessionId.value)
  }
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
  } finally {
    isLoading.value = false
  }

  startSession()
})

async function saveEvent(stepId, type, value) {
  if (!sessionId.value) return

  const { error } = await supabase
    .from('events')
    .insert([
      {
        session_id: sessionId.value,
        step_id: stepId,
        type,
        value
      }
    ])

  if (error) console.error(error)
}

watchEffect(() => {
  if (currentStep.value?.type === 'reflection') {
    router.push({ name: 'reflection', params: { id: scenarioId.value }, query: { step: currentStepId.value } })
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

function navigateToStep(stepId) {
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

  const choiceValue = option?.id ?? option?.label ?? option?.text
  if (!choiceValue) return

  await saveEvent(currentStepId.value, 'choice', choiceValue)
  navigateToStep(next)
}

function handleContinue() {
  const next = currentStep.value?.next
  if (!next) {
    console.warn('Continue step has no next defined', currentStep.value?.id)
    return
  }

  // Prefer slug from scenario meta when available, otherwise use route id
  const routeId = scenario?.value?.slug ?? scenarioId.value

  router.push({
    name: 'scenario',
    params: { id: routeId },
    query: { step: next }
  })
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
      textAnswer.value = ''
      navigateToStep('node_fallback')
      return
    }

    // In all other cases, follow the scenario's defined next step
    const next = currentStep.value?.next
    if (!next) {
      console.warn('No currentStep.next defined, cannot navigate')
      return
    }

    textAnswer.value = ''
    navigateToStep(next)
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
    navigateToStep(next)
  }
}

async function handleFallbackChoice(choice) {
  if (!choice) return

  await saveEvent(currentStepId.value, 'choice', choice.label)

  if (choice.action === 'safe-exit') {
    goSafeExit()
    return
  }

  navigateToStep(choice.next)
}
</script>

<template>
  <ScreenContainer size="narrow">
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

        <div v-if="currentStep.chatMessages" class="scenario-step__chat">
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
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  padding-bottom: 24px;
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
</style>