<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
  },
})

const classes = computed(() => [
  'screen-container',
  `screen-container--${props.size}`,
])
</script>

<template>
  <main :class="classes">
    <div class="screen-container__inner">
      <slot />
    </div>
  </main>
</template>

<style scoped>
.screen-container {
  min-height: 100vh;
  width: 100%;
  padding: 16px;
  background: var(--color-bg);
}

.screen-container__inner {
  width: 100%;
  margin: 0 auto;
}

.screen-container--narrow .screen-container__inner {
  max-width: 430px;
}

.screen-container--medium .screen-container__inner {
  max-width: 900px;
}

.screen-container--wide .screen-container__inner {
  max-width: 1280px;
}
</style>