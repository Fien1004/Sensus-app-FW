<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PenIcon from '../assets/icons/pen.svg'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { getScenarioById } from '../services/scenarioService'

const route = useRoute()
const router = useRouter()

const scenarioId = computed(() => String(route.params.id ?? ''))
const queryStep = computed(() => route.query?.step)
const paramStep = computed(() => route.params?.step)

const scenario = computed(() => getScenarioById(scenarioId.value))

const currentStepId = computed(() => {
  return paramStep.value ?? queryStep.value ?? scenario.value?.steps?.[0]?.id ?? null
})

const currentStep = computed(() => {
  if (!scenario.value || !currentStepId.value) return null
  return scenario.value.steps.find((s) => s.id === currentStepId.value) || null
})

const progress = computed(() => currentStep.value?.progress ?? 0)

const textAnswer = ref('')

watchEffect(() => {
  if (currentStep.value?.type === 'reflection') {
    router.push({ name: 'reflection', params: { id: scenarioId.value }, query: { step: currentStepId.value } })
  }
})

function goSafeExit() {
  router.push('/safe-exit')
}

function navigateToStep(stepId) {
  if (!stepId) return
  
  const nextStep = scenario.value?.steps.find((s) => s.id === stepId)
  if (!nextStep) return
  
  if (nextStep.type === 'reflection') {
    router.push({ name: 'reflection', params: { id: scenarioId.value }, query: { step: stepId } })
  } else if (nextStep.type === 'end') {
    router.push({ name: 'end', params: { id: scenarioId.value }, query: { step: stepId } })
  } else {
    router.push({ name: 'scenario', params: { id: scenarioId.value }, query: { step: stepId } })
  }
}

function handleChoice(option) {
  const next = option?.next
  if (!next) return
  // If next indicates reflection or end by id, resolve by checking target step type
  navigateToStep(next)
}

function handleContinue() {
  const next = currentStep.value?.next
  if (!next) return
  navigateToStep(next)
}

function handleTextNext() {
  const next = currentStep.value?.next
  if (!next) return
  // We do not store personal data; just navigate forward
  textAnswer.value = ''
  navigateToStep(next)
}
</script>

<template>
  <ScreenContainer size="narrow">
    <section class="scenario-step">
      <div v-if="!scenario">
        <h1>Scenario niet gevonden</h1>
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