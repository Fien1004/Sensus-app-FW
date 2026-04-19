<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
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
  autocomplete: {
    type: String,
    default: 'off',
  },
})

const emit = defineEmits(['update:modelValue'])

const classes = computed(() => [
  'base-input',
  {
    'base-input--error': props.error,
    'base-input--disabled': props.disabled,
    'base-input--with-left-icon': !!slots.leftIcon,
    'base-input--with-right-icon': !!slots.rightIcon,
  },
])

const slots = defineSlots()

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div :class="classes">
    <span v-if="$slots.leftIcon" class="base-input__icon base-input__icon--left">
      <slot name="leftIcon" />
    </span>

    <input
      :id="id"
      class="base-input__field"
      :type="type"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      @input="onInput"
    />

    <span v-if="$slots.rightIcon" class="base-input__icon base-input__icon--right">
      <slot name="rightIcon" />
    </span>
  </div>
</template>

<style scoped>
.base-input {
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


.base-input--with-left-icon .base-input__field {
  padding-left: 40px;
}

.base-input--with-right-icon .base-input__field {
  padding-right: 40px;
}

.base-input:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.base-input--error {
  border-color: #ff2b2b;
}

.base-input--error:focus-within {
  border-color: #ff2b2b;
  box-shadow: 0 0 0 1px #ff2b2b;
}

.base-input--disabled {
  background: var(--color-neutral-200);
  border-color: var(--color-neutral-300);
}

.base-input__field {
  width: 100%;
  height: 100%;
  min-height: 44px;
  padding: 0 14px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-family-base);
  font-size: var(--text-sm);
}

.base-input__field::placeholder {
  color: var(--color-neutral-500);
}

.base-input__field:disabled {
  cursor: not-allowed;
  color: var(--color-neutral-600);
}

.base-input__icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-600);
  pointer-events: none;
}

.base-input__icon--left {
  left: 14px;
}

.base-input__icon--right {
  right: 14px;
}
</style>