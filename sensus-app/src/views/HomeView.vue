<script setup>
import BaseButton from '../components/base/BaseButton.vue'
</script>

<template>
  <main class="page">
    <div class="container">
      <h1>Sensus</h1>

      <BaseButton variant="primary" size="md">
        Start
      </BaseButton>

      <br><br>

      <BaseButton variant="secondary" size="md">
        Stoppen?
      </BaseButton>

      <br><br>

      <BaseButton variant="tertiary" size="md">
        Verder doen
      </BaseButton>

      <br><br>

      <BaseButton variant="danger" size="md">
        Annuleren
      </BaseButton>
    </div>
  </main>
</template>