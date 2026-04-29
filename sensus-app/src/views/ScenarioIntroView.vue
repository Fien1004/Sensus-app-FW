<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { getScenarioById } from '../services/scenarioService'

const route = useRoute()
const router = useRouter()

const scenarioId = computed(() => String(route.params.id ?? ''))
const scenario = computed(() => getScenarioById(scenarioId.value))
const firstStep = computed(() => scenario.value?.steps?.[0] ?? null)

function goBack() {
  router.push('/scenario-lijst')
}

function startScenario() {
  if (!scenario.value || !firstStep.value) {
    return
  }

  router.push({
    name: 'scenario',
    params: {
      id: scenario.value.id,
    },
    query: {
      step: firstStep.value.id,
    },
  })
}

function goSafeExit() {
  router.push('/safe-exit')
}
</script>

<template>
  <ScreenContainer size="narrow">
    <section class="scenario-intro">
      <button
        type="button"
        class="scenario-intro__back"
        @click="goBack"
      >
        <span class="scenario-intro__back-icon" aria-hidden="true">←</span>
        <span>Terug</span>
      </button>

      <div v-if="scenario && firstStep" class="scenario-intro__content">
        <h1 class="scenario-intro__title">
          {{ scenario.intro.title }}
        </h1>

        <p class="scenario-intro__description">
          {{ scenario.intro.description }}
        </p>

        <p class="scenario-intro__body">
          {{ scenario.intro.body }}
        </p>

        <div class="scenario-intro__actions">
          <BaseButton
            fullWidth
            size="lg"
            @click="startScenario"
          >
            {{ scenario.intro.button }}
          </BaseButton>

          <p class="scenario-intro__note">
            {{ scenario.intro.note }}
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
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  padding-top: 24px;
  padding-bottom: 24px;
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
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 700;
  color: var(--color-text);
}

.scenario-intro__description {
  margin-top: 10px;
  font-size: 1.125rem;
  line-height: 1.3;
  color: var(--color-text);
}

.scenario-intro__body {
  margin-top: 14px;
  font-size: 1rem;
  line-height: 1.35;
  color: var(--color-text);
}

.scenario-intro__actions {
  margin-top: 28px;
}

.scenario-intro__note {
  margin-top: 18px;
  font-size: 0.875rem;
  line-height: 1.3;
  color: var(--color-text-muted);
}

.scenario-intro__content--empty {
  margin-top: 56px;
}

.scenario-intro__footer {
  margin-top: auto;
  padding-top: 32px;
}
</style>