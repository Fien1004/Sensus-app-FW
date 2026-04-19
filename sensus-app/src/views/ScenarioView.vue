<script setup>
import { useRoute } from 'vue-router'
import { getScenarioById } from '../services/scenarioService'

const route = useRoute()
const scenario = getScenarioById(route.params.id)
</script>

<template>
  <main class="page">
    <div class="container">
      <div v-if="scenario">
        <h1>{{ scenario.title }}</h1>
        <p>{{ scenario.description }}</p>
      </div>

      <div v-else>
        <h1>Scenario niet gevonden</h1>
      </div>
    </div>
  </main>
</template>