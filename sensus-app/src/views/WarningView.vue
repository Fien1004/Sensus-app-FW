<script setup>
import { useRoute, useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'

import WarningIcon from '../assets/icons/shield-warning.svg'

const route = useRoute()
const router = useRouter()

function goNext() {
  router.push('/scenario-lijst')
}

function goStop() {
  router.push({ name: 'safe-exit', query: { returnTo: route.fullPath } })
}
</script>

<template>
  <ScreenContainer size="narrow">
    <section class="warning">

      <div class="warning__icon-wrap">
        <div class="warning__icon" aria-hidden="true"></div>
      </div>

      <h1 class="warning__title">
        Voor je begint
      </h1>

      <p class="warning__text">
        Deze tool toont situaties die gaan over grenzen,
        communicatie en online gedrag. Sommige momenten
        kunnen gevoelig aanvoelen. Gebruik dit op je eigen
        tempo. Je kan altijd stoppen. Helemaal anoniem.
        Niets wordt opgeslagen.
      </p>

      <p class="warning__question">
        Ben je klaar om verder te gaan?
      </p>

      <div class="warning__actions">
        <BaseButton fullWidth size="lg" @click="goNext">
          Ga verder
        </BaseButton>

        <BaseButton
          fullWidth
          size="lg"
          variant="tertiary"
          @click="goStop"
        >
          Stoppen?
        </BaseButton>
      </div>

    </section>
  </ScreenContainer>
</template>

<style scoped>
.warning {
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  padding-top: 28px;
}

.warning__icon-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
}

.warning__icon {
  width: 120px;
  height: 120px;
  flex: 0 0 92px;
  background-color: var(--color-secondary-700);

  -webkit-mask-image: url('../assets/icons/shield-warning.svg');
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;

  mask-image: url('../assets/icons/shield-warning.svg');
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}

.warning__title {
  font-size: var(--font-size-h1);
  line-height: 1.2;
  font-weight: 700;
  margin-bottom: 14px;
}

.warning__text {
  font-size: 1rem;
  line-height: 1.2;
  font-weight: 400;
  margin-bottom: 36px;
}

.warning__question {
  font-size: 1.125rem;
  line-height: 1.2;
  font-weight: 500;
  margin-bottom: 22px;
}

.warning__actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>