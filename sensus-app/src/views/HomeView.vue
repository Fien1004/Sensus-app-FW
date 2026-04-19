<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import Logo from '../assets/logo/wordmark-dark.png'

const router = useRouter()

const code = ref(['6', 'A', 'Q', '5', '9'])

function goNext() {
  router.push('/profiel')
}
</script>

<template>
  <ScreenContainer size="narrow">
    <section class="home">
      <header class="home__header">
        <img
          :src="Logo"
          alt="Sensus logo"
          class="home__logo"
        />
      </header>

      <main class="home__content">
        <h1 class="home__title">
          Oefen met grenzen en consent
        </h1>

        <p class="home__text">
          Ontdek realistische situaties en leer hoe jij op een veilige,
          respectvolle manier kan reageren.
        </p>

        <section class="home__code-section">
          <p class="home__code-label">
            Vul de code in die je hebt gekregen
          </p>

          <div class="home__code-inputs">
            <input
              v-for="(item, index) in code"
              :key="index"
              v-model="code[index]"
              type="text"
              maxlength="1"
              class="home__code-box"
            />
          </div>
        </section>
      </main>

      <footer class="home__footer">
        <BaseButton
          fullWidth
          size="lg"
          @click="goNext"
        >
          Start
        </BaseButton>
      </footer>
    </section>
  </ScreenContainer>
</template>

<style scoped>
.home {
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  padding-top: 56px;
}

.home__header {
  margin-bottom: 56px;
}

.home__logo {
  height: auto;
  display: block;
}

.home__content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.home__title {
  width: 100%;
  font-size: 1.75 rem;
  line-height: 1.2;
  font-weight: 700;
  color: var(--color-text);
}

.home__text {
  width: 100%;
  font-size: 1rem;
  line-height: 1.2;
  color: var(--color-text);
}

.home__code-section {
  margin-top: 28px;
  gap: 8px;
}

.home__code-label {
  margin-bottom: 14px;
  font-size: 1rem;
  line-height: 1.3;
  color: var(--color-text);
}

.home__code-inputs {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.home__code-box {
  width: 48px;
  height: 48px;
  border: 1px solid #d9d9d9;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  font-family: var(--font-family-base);
  font-size: 1rem;
  color: var(--color-text);
  outline: none;
}

.home__code-box:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.home__title,
.home__text,
.home__code-section {
  width: 100%;
}

.home__footer {
  margin-top: auto;
  padding-top: 32px;
  padding-bottom: 8px;
}
</style>