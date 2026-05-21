<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
  },
  gutter: {
    type: String,
    default: 'default',
  },
})

const classes = computed(() => [
  'screen-container',
  `screen-container--${props.size}`,
  `screen-container--gutter-${props.gutter}`,
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
  min-height: 100dvh;
  width: 100%;
  padding: 32px 24px;
  background: var(--color-bg);
}

.screen-container__inner {
  width: 100%;
  min-width: 0;
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

.screen-container--gutter-scenario-list {
  padding-left: 24px;
  padding-right: 24px;
}

@media (min-width: 768px) {
  .screen-container {
    padding-left: 200px;
    padding-right: 200px;
  }

  .screen-container--gutter-scenario-list {
    padding-left: 48px;
    padding-right: 48px;
  }
}

@media (min-width: 1024px) {
  .screen-container {
    padding-left: 300px;
    padding-right: 300px;
  }

  .screen-container--gutter-scenario-list {
    padding-left: 120px;
    padding-right: 120px;
  }
}
</style>