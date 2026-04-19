<script setup>
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
</script>

<template>
  <ScreenContainer size="narrow">
    <section class="home">
      <h1 class="home__title">Sensus</h1>

      <p class="home__text">
        Leer grenzen en consent beter begrijpen via realistische situaties.
      </p>

      <div class="home__actions">
        <BaseButton fullWidth>
          Start scenario
        </BaseButton>
      </div>
    </section>
  </ScreenContainer>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 32px;
}

.home__title {
  font-size: 32px;
  line-height: 1.1;
}

.home__text {
  font-size: 16px;
  line-height: 1.5;
}

.home__actions {
  margin-top: auto;
}
</style>