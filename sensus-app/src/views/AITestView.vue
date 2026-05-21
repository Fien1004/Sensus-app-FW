<template>
  <div class="ai-test-view">
    <h1>AI Test</h1>

    <textarea
      v-model="userInput"
      rows="5"
      placeholder="Typ hier je tekst..."
    />

    <button type="button" :disabled="loading" @click="handleTestAI">
      Test AI
    </button>

    <p v-if="loading">Analyseren...</p>

    <div v-if="result" class="result">
      <p><strong>sentiment:</strong> {{ result.sentiment }}</p>
      <p><strong>confidence:</strong> {{ result.confidence }}</p>
      <p><strong>intent:</strong> {{ result.intent }}</p>
      <p><strong>nextNode:</strong> {{ result.nextNode }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useScenarioAI } from '../composables/useScenarioAI';

const userInput = ref('');
const loading = ref(false);
const result = ref(null);

const { analyzeResponse } = useScenarioAI();

async function handleTestAI() {
  loading.value = true;
  result.value = null;

  console.log('AI input:', userInput.value);

  try {
    const analysis = await analyzeResponse(userInput.value);
    result.value = analysis;
    console.log('AI result:', analysis);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.ai-test-view {
  width: 100%;
  min-height: calc(100dvh - 64px);
  display: grid;
  gap: 12px;
  padding: 32px 24px;
}

textarea {
  width: 100%;
  resize: vertical;
}

button {
  width: fit-content;
}

.result {
  display: grid;
  gap: 4px;
}

@media (min-width: 768px) {
  .ai-test-view {
    max-width: 760px;
    margin: 0 auto;
    padding-left: 200px;
    padding-right: 200px;
  }

  h1 {
    font-size: clamp(2rem, 3vw, 2.5rem);
  }

  textarea {
    min-height: 180px;
  }

  button {
    min-width: 160px;
  }
}

@media (min-width: 1024px) {
  .ai-test-view {
    padding-left: 300px;
    padding-right: 300px;
  }
}
</style>
