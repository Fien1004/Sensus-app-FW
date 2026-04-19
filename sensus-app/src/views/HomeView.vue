<script setup>
import { ref } from 'vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'

const inputValue = ref('')
const selectedAge = ref('')

const ageOptions = [
  { value: '15-17', label: '15 tot 17 jaar' },
  { value: '18-20', label: '18 tot 20 jaar' },
  { value: '21-24', label: '21 tot 24 jaar' },
]
</script>

<template>
  <main class="page">
    <div class="container" style="max-width: 320px; display: grid; gap: 16px;">
      <h1>Sensus</h1>

      <BaseInput
        v-model="inputValue"
        placeholder="Default"
      />

      <BaseSelect
        v-model="selectedAge"
        :options="ageOptions"
        placeholder="Kies je leeftijd"
      />
    </div>
  </main>
</template>