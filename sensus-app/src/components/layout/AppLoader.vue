<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import loadingAnimation from '../../assets/loader/Loading.json'
import { useAppLoader } from '../../composables/useAppLoader'

const { isLoaderVisible } = useAppLoader()

const animationContainer = ref(null)
let animationInstance = null

onMounted(() => {
  animationInstance = lottie.loadAnimation({
    container: animationContainer.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
  })
})

watch(isLoaderVisible, (visible) => {
  document.body.classList.toggle('app-loader-lock', visible)

  if (!animationInstance) return

  if (visible) {
    animationInstance.play()
  } else {
    animationInstance.stop()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  document.body.classList.remove('app-loader-lock')

  if (animationInstance) {
    animationInstance.destroy()
    animationInstance = null
  }
})
</script>

<template>
  <Transition name="app-loader-fade">
    <div
      v-show="isLoaderVisible"
      class="app-loader"
      role="status"
      aria-live="polite"
      aria-label="Even geduld. De ervaring wordt voorbereid."
    >
      <div class="app-loader__content">
        <div
          ref="animationContainer"
          class="app-loader__animation"
          aria-hidden="true"
        ></div>

        <div class="app-loader__text">
          <p class="app-loader__title">Even geduld...</p>
          <p class="app-loader__subtitle">De ervaring wordt voorbereid.</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.app-loader {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: grid;
  place-items: center;
  padding: var(--space-6);
  background: rgba(248, 249, 250, 0.94);
  backdrop-filter: blur(8px);
}

.app-loader__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, 360px);
  text-align: center;
}

.app-loader__animation {
  width: min(72vw, 260px);
  aspect-ratio: 16 / 9;
}

.app-loader__text {
  margin-top: var(--space-5);
}

.app-loader__title {
  margin: 0;
  color: var(--color-text);
  font-family: var(--font-family-base);
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1.2;
}

.app-loader__subtitle {
  margin: var(--space-2) 0 0;
  color: var(--color-text-soft);
  font-family: var(--font-family-base);
  font-size: var(--text-md);
  font-weight: 500;
  line-height: 1.35;
}

.app-loader-fade-enter-active,
.app-loader-fade-leave-active {
  transition: opacity 180ms ease;
}

.app-loader-fade-enter-from,
.app-loader-fade-leave-to {
  opacity: 0;
}

:global(body.app-loader-lock) {
  overflow: hidden;
}

@media (max-width: 420px) {
  .app-loader {
    padding: var(--space-5);
  }

  .app-loader__animation {
    width: min(78vw, 220px);
  }

  .app-loader__title {
    font-size: var(--text-lg);
  }
}
</style>
