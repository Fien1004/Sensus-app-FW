<script setup>
import { useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { scenarios as scenarioData } from '../services/scenarioService'

const router = useRouter()

const primaryScenario = scenarioData[0] ?? {
  id: 'online-gesprek-loopt-vast',
  title: 'Online gesprek loopt vast',
  description: 'Je stuurt iemand berichten. Het gesprek komt maar moeilijk op gang.',
  theme: 'Online gedrag',
}

const scenarioCards = [
  {
    id: primaryScenario.id,
    title: primaryScenario.title,
    description: 'Je stuurt iemand berichten. Het gesprek komt maar moeilijk op gang.',
    theme: primaryScenario.theme ?? 'Online gedrag',
    enabled: true,
  },
  {
    id: 'situatie-op-een-feestje',
    title: 'Situatie op een feestje',
    description: 'Je bent op een feestje. Iemand komt dichter bij je staan en zoekt contact.',
    theme: 'Sociale situatie',
    enabled: false,
  },
  {
    id: 'badkamer',
    title: 'Badkamer',
    description: 'Je jongere broertje komt de badkamer binnen als je aan het douchen bent.',
    theme: 'Familie',
    enabled: false,
  },
]

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}

function startScenario(scenario) {
  if (!scenario.enabled) {
    return
  }

  router.push({
    name: 'scenario-intro',
    params: {
      id: scenario.id,
    },
  })
}
</script>

<template>
  <ScreenContainer size="narrow">
    <section class="scenario-list">
      <button
        type="button"
        class="scenario-list__back"
        @click="goBack"
      >
        <span class="scenario-list__back-icon" aria-hidden="true">←</span>
        <span>Terug</span>
      </button>

      <header class="scenario-list__header">
        <h1 class="scenario-list__title">
          Scenario’s
        </h1>

        <p class="scenario-list__subtitle">
          Kies een situatie die je wil verkennen
        </p>
      </header>

      <div class="scenario-list__cards">
        <article
          v-for="scenario in scenarioCards"
          :key="scenario.id"
          class="scenario-card"
        >
          <div class="scenario-card__content">
            <h2 class="scenario-card__title">
              {{ scenario.title }}
            </h2>

            <p class="scenario-card__description">
              {{ scenario.description }}
            </p>

            <p class="scenario-card__theme">
              {{ scenario.theme }}
            </p>
          </div>

          <BaseButton
            fullWidth
            size="lg"
            :disabled="!scenario.enabled"
            @click="startScenario(scenario)"
          >
            Start
          </BaseButton>
        </article>
      </div>
    </section>
  </ScreenContainer>
</template>

<style scoped>
.scenario-list {
  min-height: calc(100vh - 32px);
  padding-top: 24px;
  padding-bottom: 24px;
}

.scenario-list__back {
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

.scenario-list__back-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.scenario-list__header {
  margin-top: 28px;
}

.scenario-list__title {
  margin: 0;
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 700;
  color: var(--color-text);
}

.scenario-list__subtitle {
  margin-top: 6px;
  font-size: 1.05rem;
  line-height: 1.3;
  color: var(--color-text);
}

.scenario-list__cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
  padding-bottom: 8px;
}

.scenario-card {
  padding: 20px 16px 16px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
}

.scenario-card__content {
  margin-bottom: 18px;
}

.scenario-card__title {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.25;
  font-weight: 700;
  color: var(--color-text);
}

.scenario-card__description {
  margin-top: 8px;
  font-size: 1rem;
  line-height: 1.35;
  color: var(--color-text);
}

.scenario-card__theme {
  margin-top: 8px;
  font-size: 0.95rem;
  line-height: 1.3;
  color: var(--color-text-muted);
}

@media (min-width: 430px) {
  .scenario-list__title {
    font-size: 2.15rem;
  }
}
</style>