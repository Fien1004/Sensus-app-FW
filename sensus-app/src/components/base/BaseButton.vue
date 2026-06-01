<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'md',
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
})

const classes = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  {
    'base-button--full': props.fullWidth,
  },
])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="classes"
  >
    <span v-if="$slots.leftIcon" class="base-button__icon base-button__icon--left">
      <slot name="leftIcon" />
    </span>

    <span class="base-button__label">
      <slot />
    </span>

    <span v-if="$slots.rightIcon" class="base-button__icon base-button__icon--right">
      <slot name="rightIcon" />
    </span>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-family-base);
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 1;
}

.base-button:focus-visible {
  outline: 3px solid var(--color-secondary-200);
  outline-offset: 3px;
}

.base-button--full {
  width: 100%;
}

.base-button--sm {
  min-height: 36px;
  padding: 0 12px;
  font-size: var(--text-sm);
}

.base-button--md {
  min-height: 44px;
  padding: 0 16px;
  font-size: var(--text-sm);
}

.base-button--lg {
  min-height: 52px;
  padding: 0 20px;
  font-size: var(--text-md);
}

.base-button__label {
  display: inline-flex;
  align-items: center;
}

.base-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

/* Primary */

.base-button--primary {
  background: var(--color-primary-600);
  color: #ffffff;
}

.base-button--primary:hover:not(:disabled) {
  background: var(--color-primary-100);
  color: var(--color-neutral-900);
}

.base-button--primary:active:not(:disabled) {
  background: var(--color-primary-900);
}

.base-button--primary:disabled {
    background: var(--color-neutral-300);
    color: var(--color-neutral-700);
}

/* Secondary */

.base-button--secondary {
    background: var(--color-secondary-600);
    color: #ffffff;
}

.base-button--secondary:hover:not(:disabled) {
    background: var(--color-secondary-100);
    color: var(--color-neutral-900);
}

.base-button--secondary:active:not(:disabled) {
    background: var(--color-secondary-900);
}

.base-button--secondary:disabled {
    background: var(--color-neutral-300);
    color: var(--color-neutral-700);
}

/* Tertiary */

.base-button--tertiary {
    background: var(--color-secondary-100);
    color: var(--color-secondary-900);
}

.base-button--tertiary:hover:not(:disabled) {
    background: var(--color-secondary-600);
    color: #ffffff;
}

.base-button--tertiary:active:not(:disabled) {
    background: var(--color-secondary-900);
    color: #ffffff;
}

.base-button--tertiary:disabled {
    background: var(--color-neutral-300);
    color: var(--color-neutral-700);
}

/* Danger */

.base-button--danger {
    background: #990000;
    color: #ffffff;
}

.base-button--danger:hover:not(:disabled) {
    background: #FFCCCC;
    color: var(--color-neutral-900);
}

.base-button--danger:active:not(:disabled) {
    background: #330000;
    color: #ffffff;
}

.base-button--danger:disabled {
    background: var(--color-neutral-300);
    color: var(--color-neutral-700);
}
</style>
