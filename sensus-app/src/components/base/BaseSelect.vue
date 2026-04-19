<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Selecteer een optie',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const classes = computed(() => [
  'base-select',
  {
    'base-select--error': props.error,
    'base-select--disabled': props.disabled,
  },
])

function onChange(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div :class="classes">
    <select
      :id="id"
      class="base-select__field"
      :name="name"
      :value="modelValue"
      :disabled="disabled"
      @change="onChange"
    >
      <option value="" disabled hidden>
        {{ placeholder }}
      </option>

      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <span class="base-select__icon">⌄</span>
  </div>
</template>

<style scoped>
.base-select {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.base-select:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.base-select--error {
  border-color: #ff2b2b;
}

.base-select--error:focus-within {
  border-color: #ff2b2b;
  box-shadow: 0 0 0 1px #ff2b2b;
}

.base-select--disabled {
  background: var(--color-neutral-200);
  border-color: var(--color-neutral-300);
}

.base-select__field {
  width: 100%;
  min-height: 44px;
  padding: 0 40px 0 14px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-family-base);
  font-size: var(--text-sm);
  appearance: none;
  cursor: pointer;
}

.base-select__field:disabled {
  cursor: not-allowed;
  color: var(--color-neutral-600);
}

.base-select__icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-neutral-700);
  pointer-events: none;
  font-size: 14px;
}
</style>