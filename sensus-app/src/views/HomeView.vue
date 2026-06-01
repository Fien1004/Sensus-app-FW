<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import Logo from '../assets/logo/wordmark-dark.png'

const router = useRouter()

const CODE_LENGTH = 5

const code = ref(Array.from({ length: CODE_LENGTH }, () => ''))
const errorMessage = ref('')
const hasAttemptedSubmit = ref(false)
const isValidating = ref(false)
const lastSubmittedCode = ref('')
const codeInputRefs = ref([])

const enteredCode = computed(() =>
  code.value.map((item) => item.trim().toUpperCase()).join(''),
)

const isCodeComplete = computed(() =>
  code.value.every((item) => item.length === 1),
)

const isStartDisabled = computed(() => !isCodeComplete.value || isValidating.value)

async function validateAccessCode(inputCode) {
  const accessCode = inputCode.trim().toUpperCase()

  console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('[AccessCode] Samengestelde code:', accessCode)

  if (!accessCode) {
    console.warn('[AccessCode] Code is leeg na trim/toUpperCase')
    return { isValid: false, message: 'De code is ongeldig of niet meer actief.' }
  }

  const { data: allData } = await supabase
    .from('access_codes')
    .select('*')

  console.log('Alle codes in DB:', allData)

  const { data, error } = await supabase
    .from('access_codes')
    .select('*')
    .eq('code', accessCode)
    .maybeSingle()

  console.log('[AccessCode] data:', data)
  console.log('[AccessCode] error:', error)

  if (error) {
    console.error('[AccessCode] Supabase error:', error)
    return { isValid: false, message: 'De code is ongeldig of niet meer actief.' }
  }

  if (!data) {
    console.warn('[AccessCode] Geen data gevonden voor code:', accessCode)
    return { isValid: false, message: 'De code is ongeldig of niet meer actief.' }
  }

  const hasExpired = data.expires_at ? new Date(data.expires_at) <= new Date() : false
  const hasReachedUsageLimit =
    data.max_uses != null && Number(data.used_count ?? 0) >= Number(data.max_uses)

  if (!data.is_active) {
    console.warn('[AccessCode] is_active is false')
    return { isValid: false, message: 'De code is ongeldig of niet meer actief.' }
  }

  if (hasExpired) {
    console.warn('[AccessCode] expires_at is verlopen:', data.expires_at)
    return { isValid: false, message: 'De code is ongeldig of niet meer actief.' }
  }

  if (hasReachedUsageLimit) {
    console.warn('[AccessCode] max_uses bereikt', {
      used_count: data.used_count,
      max_uses: data.max_uses,
    })
    return { isValid: false, message: 'De code is ongeldig of niet meer actief.' }
  }

  const { error: updateError } = await supabase
    .from('access_codes')
    .update({ used_count: Number(data.used_count ?? 0) + 1 })
    .eq('id', data.id)

  if (updateError) {
    console.error('[AccessCode] Update error:', updateError)
    return { isValid: false, message: 'De code is ongeldig of niet meer actief.' }
  }

  return { isValid: true, message: '' }
}

function focusCodeInput(index) {
  codeInputRefs.value[index]?.focus()
}

function setCodeValue(index, value) {
  if (code.value[index] !== value) {
    lastSubmittedCode.value = ''
  }

  code.value[index] = value

  if (hasAttemptedSubmit.value) {
    errorMessage.value = ''
  }
}

function handleCodeInput(index, event) {
  const rawValue = event.target.value ?? ''
  const normalizedValue = rawValue.replace(/\s+/g, '').toUpperCase()

  if (normalizedValue.length > 1) {
    // Verdeel een geplakte code automatisch over de velden.
    const pastedValues = normalizedValue.slice(0, CODE_LENGTH - index).split('')

    pastedValues.forEach((character, pastedIndex) => {
      setCodeValue(index + pastedIndex, character)
    })

    nextTick(() => {
      focusCodeInput(Math.min(index + pastedValues.length, CODE_LENGTH - 1))
    })

    return
  }

  setCodeValue(index, normalizedValue.slice(0, 1))

  if (normalizedValue && index < CODE_LENGTH - 1) {
    // Verplaats focus direct naar het volgende veld na één teken.
    nextTick(() => focusCodeInput(index + 1))
  }
}

function handleCodeKeydown(index, event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
    return
  }

  if (event.key !== 'Backspace' || code.value[index]) {
    return
  }

  // Ga terug naar het vorige veld als dit veld al leeg is.
  if (index > 0) {
    event.preventDefault()
    lastSubmittedCode.value = ''
    code.value[index - 1] = ''
    focusCodeInput(index - 1)
  }
}

function handleCodePaste(index, event) {
  event.preventDefault()

  const pastedValue = event.clipboardData?.getData('text') ?? ''
  const normalizedValue = pastedValue.replace(/\s+/g, '').toUpperCase()

  if (!normalizedValue) {
    return
  }

  normalizedValue.slice(0, CODE_LENGTH - index).split('').forEach((character, pastedIndex) => {
    setCodeValue(index + pastedIndex, character)
  })

  nextTick(() => {
    focusCodeInput(Math.min(index + normalizedValue.length, CODE_LENGTH - 1))
  })
}

async function goNext() {
  const accessCode = enteredCode.value

  if (isStartDisabled.value || lastSubmittedCode.value === accessCode) {
    return
  }

  lastSubmittedCode.value = accessCode
  hasAttemptedSubmit.value = true
  errorMessage.value = ''
  isValidating.value = true

  try {
    const result = await validateAccessCode(accessCode)

    if (!result.isValid) {
      errorMessage.value = result.message
      return
    }

    router.push('/profiel')
  } catch {
    errorMessage.value = 'Er ging iets mis bij het controleren van de code. Probeer opnieuw.'
  } finally {
    isValidating.value = false
  }
}
</script>

<template>
  <ScreenContainer size="wide">
    <form class="home" @submit.prevent="goNext">
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
              :ref="(element) => { codeInputRefs[index] = element }"
              :aria-label="`Code teken ${index + 1}`"
              autocomplete="one-time-code"
              inputmode="text"
              enterkeyhint="go"
              @input="handleCodeInput(index, $event)"
              @keydown="handleCodeKeydown(index, $event)"
              @paste="handleCodePaste(index, $event)"
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

        </section>
      </main>

      <footer class="home__footer">
        <BaseButton
          fullWidth
          size="lg"
          type="submit"
          :disabled="isStartDisabled"
        >
          Start
        </BaseButton>

        <p class="home__text" style="margin-top: 24px;">
          Demo code: 2IB25
        </p>

      </footer>
    </form>
  </ScreenContainer>
</template>

<style scoped>
.home {
  min-height: calc(100dvh - 64px);
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

@media (min-width: 768px) {
  .home {
    max-width: 760px;
    margin: 0 auto;
    justify-content: center;
    padding-top: 0;
    padding-bottom: 0;
    min-height: calc(100dvh - 32px);
  }

  .home__header,
  .home__content,
  .home__footer {
    width: 100%;
  }

  .home__header {
    margin-bottom: 40px;
  }

  .home__logo {
    width: 240px;
  }

  .home__title {
    font-size: clamp(2rem, 3vw, 2.5rem);
  }

  .home__text,
  .home__code-label,
  .home__code-error {
    font-size: 1.05rem;
  }

  .home__content {
    gap: 12px;
  }

  .home__code-section {
    margin-top: 24px;
  }

  .home__code-inputs {
    gap: 16px;
  }

  .home__code-box {
    flex: 1 1 0;
    width: 100%;
    min-width: 0;
    height: 56px;
  }

  .home__footer {
    margin-top: 40px;
    padding-top: 0;
    padding-bottom: 0;
  }
}

@media (min-width: 1024px) {
  .home {
    max-width: 760px;
  }

  .home__logo {
    width: 260px;
  }
}
</style>
