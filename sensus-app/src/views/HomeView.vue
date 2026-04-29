<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import Logo from '../assets/logo/wordmark-dark.png'

const router = useRouter()

const ACCESS_CODE = '6AQ59'

const code = ref(['', '', '', '', ''])
const errorMessage = ref('')
const hasAttemptedSubmit = ref(false)

const enteredCode = computed(() =>
  code.value.map((item) => item.trim()).join(''),
)

const isCodeComplete = computed(() =>
  enteredCode.value.length === ACCESS_CODE.length,
)

const isStartDisabled = computed(() => !isCodeComplete.value)

function validateAccessCode(inputCode) {
  return inputCode.trim().toUpperCase() === ACCESS_CODE
}

function handleCodeInput(index, event) {
  const rawValue = event.target.value ?? ''
  const normalizedValue = rawValue.replace(/\s+/g, '').slice(0, 1).toUpperCase()

  code.value[index] = normalizedValue

  if (hasAttemptedSubmit.value) {
    errorMessage.value = ''
  }
}

function goNext() {
  hasAttemptedSubmit.value = true

  if (!validateAccessCode(enteredCode.value)) {
    errorMessage.value = 'De code is onjuist. Probeer opnieuw.'
    return
  }

  errorMessage.value = ''
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
              v-for="(_, index) in code"
              :key="index"
              :value="code[index]"
              @input="handleCodeInput(index, $event)"
              type="text"
              maxlength="1"
              class="home__code-box"
            />
          </div>

          <p
            v-if="errorMessage"
            class="home__code-error"
            role="alert"
          >
            {{ errorMessage }}
          </p>

          <p class="home__code-demo">
            Demo-code: 6AQ59
          </p>
        </section>
      </main>

      <footer class="home__footer">
        <BaseButton
          fullWidth
          size="lg"
          :disabled="isStartDisabled"
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

.home__code-error {
  margin-top: 12px;
  font-size: 0.875rem;
  line-height: 1.3;
  color: #b00020;
}

.home__code-demo {
  margin-top: 8px;
  font-size: 0.875rem;
  line-height: 1.3;
  color: var(--color-text);
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