<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { getScenarioBySlug } from '../services/scenarioService'

const route = useRoute()
const router = useRouter()

const scenarioId = computed(() => String(route.params.id ?? ''))
const scenario = ref(null)
const isLoading = ref(true)
const intro = computed(() => scenario.value?.engine_json?.intro ?? null)
const firstStep = computed(() => scenario.value?.engine_json?.steps?.[0] ?? null)

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
    const s = await getScenarioBySlug(route.params.id)
    console.debug('getScenarioBySlug intro', route.params.id, s)
    scenario.value = s
  } catch (err) {
    console.error(err)
    scenario.value = null
    isLoading.value = false
    showScenarioError()
    return
  }

  if (!scenario.value || !firstStep.value) {
    isLoading.value = false
    showScenarioError()
    return
  }

  isLoading.value = false
})

function goBack() {
  router.push('/scenario-lijst')
}

function startScenario() {
  if (!scenario.value || !firstStep.value) return

  router.push({
    name: 'scenario',
    params: { id: scenario.value.slug },
    query: { step: firstStep.value.id },
  })
}

function goSafeExit() {
  router.push({ name: 'safe-exit', query: { returnTo: route.fullPath } })
}
</script>

<template>
  <ScreenContainer size="medium">
    <section class="scenario-intro">
      <button
        type="button"
        class="scenario-intro__back"
        @click="goBack"
      >
        <span class="scenario-intro__back-icon" aria-hidden="true">←</span>
        <span>Terug</span>
      </button>

      <div v-if="isLoading" class="scenario-intro__content">
        <p>Laden…</p>
      </div>

      <div v-else-if="scenario && firstStep" class="scenario-intro__content">
        <h1 class="scenario-intro__title">
          {{ intro?.title || scenario.title }}
        </h1>

        <p class="scenario-intro__description">
          {{ intro?.description || scenario.description }}
          <br>
          {{ intro?.body }}
        </p>

        <div class="scenario-intro__actions">
          <BaseButton
            fullWidth
            size="lg"
            @click="startScenario"
          >
            {{ intro?.button || 'Start' }}
          </BaseButton>

          <p class="scenario-intro__note">
            {{ intro?.note }}
          </p>
        </div>
      </div>

      <div v-else class="scenario-intro__content scenario-intro__content--empty">
        <h1 class="scenario-intro__title">
          Scenario niet gevonden
        </h1>
      </div>

      <div class="scenario-intro__footer">
        <BaseButton
          fullWidth
          size="lg"
          variant="tertiary"
          @click="goSafeExit"
        >
          Stoppen?
        </BaseButton>
      </div>
    </section>
  </ScreenContainer>
</template>

<style scoped>
.scenario-intro {
  min-height: calc(100dvh - 64px);
  display: flex;
  flex-direction: column;
  padding-top: 24px;
  padding-bottom: 24px;
}

.scenario-intro__content,
.scenario-intro__footer {
  width: 100%;
}

.scenario-intro__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-family-base);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.scenario-intro__back-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.scenario-intro__content {
  margin-top: 44px;
}

.scenario-intro__title {
  margin: 0;
  padding-bottom: 1rem;
  font-size: 28px;
  line-height: 1.1;
  font-weight: 700;
  color: var(--color-text);
}

.scenario-intro__description {
  margin-top: 10px;
  font-size: 16px;
  line-height: 1.3;
  color: var(--color-text);
}

.scenario-intro__body {
  margin-top: 14px;
  font-size: 16px;
  line-height: 1.35;
  color: var(--color-text);
}

.scenario-intro__actions {
  margin-top: 28px;
}

.scenario-intro__note {
  margin-top: 18px;
  font-size: 12px;
  line-height: 1.3;
  color: var(--color-neutral-600);
}

.scenario-intro__content--empty {
  margin-top: 56px;
}

.scenario-intro__footer {
  margin-top: auto;
  padding-top: 32px;
}

@media (min-width: 768px) {
  .scenario-intro {
    max-width: 760px;
    margin: 0 auto;
    padding-top: 40px;
    padding-bottom: 40px;
    min-height: calc(100dvh - 32px);
  }

  .scenario-intro__title {
    font-size: clamp(2rem, 3vw, 2.5rem);
  }

  .scenario-intro__description,
  .scenario-intro__body,
  .scenario-intro__note {
    font-size: 1.05rem;
  }

  .scenario-intro__content {
    margin-top: 56px;
  }
}
</style>
