<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { getScenarios } from '../services/scenarioService'

const router = useRouter()

const scenarios = ref([])
const isLoading = ref(true)

function goBack() {
  router.push('/waarschuwing')
}

function startScenario(scenario) {
  if (!scenario || !scenario.slug) return

  router.push({
    name: 'scenario-intro',
    params: {
      id: scenario.slug,
    },
  })
}

onMounted(async () => {
  try {
    const list = await getScenarios()
    scenarios.value = list
  } catch (err) {
    console.error('Error loading scenarios:', err)
    scenarios.value = []
  } finally {
    isLoading.value = false
  }
})
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
        <div v-if="isLoading">Laden…</div>

        <div v-else-if="!scenarios.length">
          <p>Er zijn nog geen scenario’s beschikbaar.</p>
        </div>

        <article
          v-else
          v-for="scenario in scenarios"
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

            <p v-if="scenario.duration" class="scenario-card__duration">
              Duur: {{ scenario.duration }}
            </p>
          </div>

          <BaseButton
            fullWidth
            size="lg"
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

.scenario-card__duration {
  margin-top: 6px;
  font-size: 0.9rem;
  line-height: 1.3;
  color: var(--color-text-muted);
}

@media (min-width: 430px) {
  .scenario-list__title {
    font-size: 2.15rem;
  }
}
</style>