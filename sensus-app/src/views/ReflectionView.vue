<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { getScenarioById } from '../services/scenarioService'

const route = useRoute()
const router = useRouter()

const scenarioId = computed(() => String(route.params.id ?? ''))
const scenario = computed(() => getScenarioById(scenarioId.value))

const requestedStep = computed(() => route.query?.step)

const reflectionStep = computed(() => {
  if (!scenario.value) return null
  if (requestedStep.value) {
    return scenario.value.steps.find((s) => s.id === requestedStep.value && s.type === 'reflection') || null
  }

  return scenario.value.steps.find((s) => s.type === 'reflection') || null
})

const progress = computed(() => reflectionStep.value?.progress ?? 0)

const answer = ref('')

function goSafeExit() {
  router.push({ name: 'safe-exit', query: { returnTo: route.fullPath } })
}

function handleNext() {
  const nextId = reflectionStep.value?.next
  if (!nextId) return

  const nextStep = scenario.value?.steps.find((s) => s.id === nextId)
  if (!nextStep) return

  if (nextStep.type === 'end') {
    router.push({ name: 'end', params: { id: scenarioId.value }, query: { step: nextId } })
  } else {
    router.push({ name: 'scenario', params: { id: scenarioId.value }, query: { step: nextId } })
  }
}
</script>

<template>
  <ScreenContainer size="narrow">
    <section class="reflection">
      <div v-if="!scenario || !reflectionStep">
        <h1>Reflectie niet gevonden</h1>
      </div>

      <div v-else class="reflection__content">
        <div class="reflection__progress-wrap">
          <div class="reflection__progress" :style="{ width: progress + '%' }"></div>
        </div>

        <h1 class="reflection__title">{{ reflectionStep.title }}</h1>

        <p class="reflection__description">{{ reflectionStep.description }}</p>

        <p class="reflection__question">{{ reflectionStep.question }}</p>

        <div class="reflection__card">
          <textarea v-model="answer" class="reflection__textarea" :placeholder="reflectionStep.placeholder || 'Vul hier je antwoord in.'"></textarea>
        </div>

        <div class="reflection__action">
          <BaseButton fullWidth size="lg" @click="handleNext">{{ reflectionStep.button || 'Volgende' }}</BaseButton>
        </div>
      </div>

      <div class="reflection__footer">
        <BaseButton fullWidth size="lg" variant="tertiary" @click="goSafeExit">Stoppen?</BaseButton>
      </div>
    </section>
  </ScreenContainer>
</template>

<style scoped>
.reflection {
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  padding-top: 24px;
  padding-bottom: 24px;
}

.reflection__progress-wrap {
  background: var(--color-neutral-100, #f3f4f6);
  height: 8px;
  border-radius: 12px;
  margin-top: 20px;
  overflow: hidden;
}

.reflection__progress {
  height: 100%;
  background: var(--color-primary-600);
  width: 0%;
}

.reflection__title {
  margin-top: 28px;
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 700;
}

.reflection__description {
  margin-top: 12px;
  font-size: 1rem;
  line-height: 1.4;
  color: var(--color-text);
}

.reflection__question {
  margin-top: 20px;
  font-weight: 600;
}

.reflection__card {
  margin-top: 12px;
  background: #ffffff;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(17,24,39,0.04);
}

.reflection__textarea {
  width: 100%;
  min-height: 140px;
  border: none;
  resize: vertical;
  font-size: 1rem;
  font-family: var(--font-family-base);
  outline: none;
}

.reflection__action {
  margin-top: 20px;
}

.reflection__footer {
  margin-top: auto;
  padding-top: 24px;
}
</style>
