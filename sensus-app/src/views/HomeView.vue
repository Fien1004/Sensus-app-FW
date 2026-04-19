<script setup>
import { ref } from 'vue'
import BaseInput from '../components/base/BaseInput.vue'

const inputValue = ref('')
const errorValue = ref('')
</script>

<template>
  <main class="page">
    <div class="container" style="max-width: 320px; display: grid; gap: 16px;">
      <h1>Sensus</h1>

      <BaseInput
        v-model="inputValue"
        placeholder="Default"
      />

      <BaseInput
        v-model="inputValue"
        placeholder="Placeholder"
        pill
      />

      <BaseInput
        v-model="errorValue"
        placeholder="Error"
        error
      />

      <BaseInput
        v-model="inputValue"
        placeholder="Disabled"
        disabled
      />

      <BaseInput
        v-model="inputValue"
        placeholder="Zoeken"
      >
        <template #leftIcon>
          🔍
        </template>
      </BaseInput>

      <BaseInput
        v-model="inputValue"
        placeholder="Wachtwoord"
      >
        <template #rightIcon>
          👁
        </template>
      </BaseInput>
    </div>
  </main>
</template>