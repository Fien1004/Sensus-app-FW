<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { getScenarioBySlug } from '../services/scenarioService'
import { supabase } from '../lib/supabase'

const route = useRoute()
const router = useRouter()

const scenarioId = computed(() => String(route.params.id ?? ''))
const scenario = ref(null)
const isLoading = ref(true)

const requestedStep = computed(() => route.query?.step)

const reflectionStep = computed(() => {
  if (!scenario.value) return null
  const steps = scenario.value.engine_json?.steps ?? []
  if (requestedStep.value) {
    return steps.find((s) => s.id === requestedStep.value && s.type === 'reflection') || null
  }

  return steps.find((s) => s.type === 'reflection') || null
})

const progress = computed(() => reflectionStep.value?.progress ?? 0)

const answer = ref('')
const sessionId = localStorage.getItem('sessionId')
const currentStepId = computed(() => requestedStep.value ?? reflectionStep.value?.id ?? 'reflection')

onMounted(async () => {
  try {
    scenario.value = await getScenarioBySlug(scenarioId.value)
  } catch (error) {
    console.error(error)
    scenario.value = null
  } finally {
    isLoading.value = false
  }
})

async function saveReflection() {
  if (!sessionId) return

  const reflectionAnswer = answer.value.trim()
  if (!reflectionAnswer) return

  const { error } = await supabase
    .from('events')
    .insert([
      {
        session_id: sessionId,
        step_id: currentStepId.value || 'reflection',
        type: 'reflection',
        value: 'submitted'
      }
    ])

  if (error) {
    console.error(error)
  }
}

function goSafeExit() {
  router.push({ name: 'safe-exit', query: { returnTo: route.fullPath } })
}

async function handleNext() {
  await saveReflection()

  const nextId = reflectionStep.value?.next
  if (!nextId) return

  const nextStep = scenario.value?.engine_json?.steps?.find((s) => s.id === nextId)
  if (!nextStep) return

  if (nextStep.type === 'end') {
    router.push({ name: 'end', params: { id: scenarioId.value }, query: { step: nextId } })
  } else {
    router.push({ name: 'scenario', params: { id: scenarioId.value }, query: { step: nextId } })
  }
}
</script>

<template>
  <ScreenContainer size="medium">
    <section class="reflection">
      <div v-if="isLoading">
        <h1>Laden…</h1>
      </div>

      <div v-else-if="!scenario || !reflectionStep">
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
  min-height: calc(100dvh - 64px);
  display: flex;
  flex-direction: column;
  padding-top: 24px;
  padding-bottom: 24px;
}

.reflection__content,
.reflection__footer {
  width: 100%;
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

@media (min-width: 768px) {
  .reflection {
    max-width: 760px;
    margin: 0 auto;
    padding-top: 40px;
    padding-bottom: 40px;
    min-height: calc(100dvh - 32px);
  }

  .reflection__title {
    font-size: clamp(2rem, 3vw, 2.5rem);
  }

  .reflection__description,
  .reflection__question {
    font-size: 1.05rem;
  }

  .reflection__card {
    padding: 16px;
  }

  .reflection__textarea {
    min-height: 180px;
  }

  .reflection__footer {
    margin-top: auto;
  }
}
</style>
