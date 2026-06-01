<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import InfoIcon from '../assets/icons/info.svg?raw'
import SignalIcon from '../assets/icons/signal.svg?raw'
import ShieldWarningIcon from '../assets/icons/shield-warning.svg?raw'

const props = defineProps({
  title: {
    type: String,
    default: 'Oeps! Er ging iets mis',
  },
  description: {
    type: String,
    default: 'Het scenario kon momenteel niet geladen worden.',
  },
  extraText: {
    type: String,
    default: 'Controleer je verbinding of probeer het later opnieuw.',
  },
  icon: {
    type: String,
    default: 'info',
  },
  retryTo: {
    type: [String, Object],
    default: null,
  },
})

const route = useRoute()
const router = useRouter()
const isRetrying = ref(false)

const iconMap = {
  info: InfoIcon,
  offline: SignalIcon,
  server: ShieldWarningIcon,
  scenario: InfoIcon,
  unexpected: ShieldWarningIcon,
}

const iconMarkup = computed(() => {
  const rawIcon = iconMap[props.icon] ?? iconMap.info
  return rawIcon.replaceAll('fill="black"', 'fill="currentColor"')
})

const retryTarget = computed(() => {
  return props.retryTo ?? route.query.retryTo ?? null
})

async function retry() {
  isRetrying.value = true

  if (retryTarget.value) {
    await router.replace(retryTarget.value)
    return
  }

  router.go(0)
}

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <ScreenContainer size="narrow">
    <section class="error-view" aria-labelledby="error-title">
      <div class="error-view__content">
        <div class="error-view__icon" aria-hidden="true" v-html="iconMarkup"></div>

        <div class="error-view__copy">
          <h1 id="error-title" class="error-view__title">
            {{ title }}
          </h1>

          <p class="error-view__description">
            {{ description }}
          </p>

          <p class="error-view__extra">
            {{ extraText }}
          </p>
        </div>

        <div class="error-view__actions">
          <BaseButton
            fullWidth
            size="lg"
            :disabled="isRetrying"
            @click="retry"
          >
            <template v-if="isRetrying" #leftIcon>
              <span class="error-view__spinner" aria-hidden="true"></span>
            </template>
            {{ isRetrying ? 'Opnieuw proberen…' : 'Opnieuw proberen' }}
          </BaseButton>

          <BaseButton
            fullWidth
            size="lg"
            variant="tertiary"
            @click="goHome"
          >
            Terug naar start
          </BaseButton>
        </div>
      </div>
    </section>
  </ScreenContainer>
</template>

<style scoped>
.error-view {
  min-height: calc(100dvh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-7) 0;
}

.error-view__content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.error-view__icon {
  width: 88px;
  height: 88px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xl);
  background: var(--color-secondary-100);
  color: var(--color-secondary-700);
}

.error-view__icon :deep(svg) {
  width: 42px;
  height: 42px;
}

.error-view__copy {
  max-width: 360px;
  margin-top: var(--space-6);
}

.error-view__title {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-h1);
  font-weight: 700;
  line-height: 1.12;
}

.error-view__description {
  margin-top: var(--space-4);
  color: var(--color-text);
  font-size: var(--text-md);
  line-height: 1.45;
}

.error-view__extra {
  margin-top: var(--space-2);
  color: var(--color-text-soft);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.error-view__actions {
  width: 100%;
  margin-top: var(--space-7);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.error-view__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--radius-pill);
  animation: error-view-spin 0.75s linear infinite;
}

@keyframes error-view-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 768px) {
  .error-view {
    min-height: calc(100dvh - 32px);
    padding: var(--space-8) 0;
  }

  .error-view__copy {
    max-width: 440px;
    margin-top: var(--space-7);
  }

  .error-view__title {
    font-size: clamp(2rem, 3vw, 2.5rem);
  }

  .error-view__description {
    font-size: 1.05rem;
  }

  .error-view__actions {
    max-width: 360px;
  }
}
</style>
