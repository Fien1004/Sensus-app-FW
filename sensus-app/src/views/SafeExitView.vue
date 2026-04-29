<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import PauseIcon from '../assets/icons/pause.svg'

const route = useRoute()
const router = useRouter()

const returnTo = computed(() => {
  const target = route.query.returnTo
  return typeof target === 'string' && target.startsWith('/') ? target : null
})

function goFurther() {
  if (returnTo.value) {
    router.replace(returnTo.value)
    return
  }

  router.replace({ name: 'scenario-list' })
}

function stopScenario() {
  router.push({
    name: 'stop-confirm',
    query: {
      returnTo: returnTo.value ?? '/scenario-lijst',
    },
  })
}
</script>

<template>
  <ScreenContainer size="narrow">
    <section class="safe-exit">
      <div class="safe-exit__icon-wrap">
        <img :src="PauseIcon" alt="" class="safe-exit__icon" aria-hidden="true" />
      </div>

      <h1 class="safe-exit__title">
        Even pauze?
      </h1>

      <p class="safe-exit__text">
        Je hoeft niet verder te gaan als het niet goed voelt. Neem een moment voor
        jezelf. Je kan altijd later opnieuw starten.
      </p>

      <p class="safe-exit__note">
        Er wordt niets opgeslagen.
      </p>

      <div class="safe-exit__actions">
        <BaseButton
          fullWidth
          size="lg"
          @click="goFurther"
        >
          Ga verder
        </BaseButton>

        <BaseButton
          fullWidth
          size="lg"
          variant="tertiary"
          @click="stopScenario"
        >
          Stoppen?
        </BaseButton>
      </div>
    </section>
  </ScreenContainer>
</template>

<style scoped>
.safe-exit {
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  padding-top: 56px;
  padding-bottom: 24px;
}

.safe-exit__icon-wrap {
  display: flex;
  justify-content: center;
}

.safe-exit__icon {
  width: 92px;
  height: 92px;
}

.safe-exit__title {
  margin-top: 28px;
  margin-bottom: 10px;
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 700;
  color: var(--color-text);
}

.safe-exit__text {
  font-size: 1.125rem;
  line-height: 1.25;
  color: var(--color-text);
}

.safe-exit__note {
  margin-top: 24px;
  font-size: 0.875rem;
  line-height: 1.3;
  color: var(--color-text-muted);
}

.safe-exit__actions {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>