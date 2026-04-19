<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseSelect from '../components/base/BaseSelect.vue'

const router = useRouter()

const age = ref('15')
const gender = ref('man')

const ageOptions = [
  { value: '15', label: '15' },
  { value: '16', label: '16' },
  { value: '17', label: '17' },
  { value: '18', label: '18' },
  { value: '19', label: '19' },
  { value: '20', label: '20' },
  { value: '21', label: '21' },
  { value: '22', label: '22' },
  { value: '23', label: '23' },
  { value: '24', label: '24' },
]

const genderOptions = [
  { value: 'man', label: 'Man' },
  { value: 'vrouw', label: 'Vrouw' },
  { value: 'x', label: 'X' },
  { value: 'zeg-ik-liever-niet', label: 'Zeg ik liever niet' },
]

function goBack() {
  router.push('/')
}

function goNext() {
  router.push('/waarschuwing')
}
</script>

<template>
  <ScreenContainer size="narrow">
    <section class="profile">
      <header class="profile__header">
      <button class="profile__back" type="button" @click="goBack">
        <img
          src="../assets/icons/arrow-left.svg"
          alt=""
          class="profile__back-icon"
        />
        <span>Terug</span>
      </button>
      </header>

      <main class="profile__content">
        <h1 class="profile__title">Informatie over jou</h1>

        <p class="profile__intro">
          We gebruiken deze gegevens alleen voor het analyseren van data. Zo
          krijgen wij een beter beeld over gedrag van jongeren op vlak van
          toestemming.
        </p>

        <div class="profile__field">
          <label class="profile__label" for="age">
            Hoe oud ben je? <span class="profile__required">*</span>
          </label>

          <BaseSelect
            id="age"
            v-model="age"
            :options="ageOptions"
            placeholder="Kies je leeftijd"
          />
        </div>

        <div class="profile__field">
          <label class="profile__label" for="gender">
            Wat is je gender? <span class="profile__required">*</span>
          </label>

          <BaseSelect
            id="gender"
            v-model="gender"
            :options="genderOptions"
            placeholder="Kies je gender"
          />
        </div>

        <p class="profile__note">
          *Deze vragen zijn verplicht
        </p>

        <p class="profile__privacy">
          Door verder te gaan ga je akkoord dat deze gegevens worden gebruikt
          voor het analyseren van data. Je deelname blijft volledig anoniem.
        </p>
      </main>

      <footer class="profile__footer">
        <BaseButton fullWidth size="lg" @click="goNext">
          Ga verder
        </BaseButton>
      </footer>
    </section>
  </ScreenContainer>
</template>

<style scoped>
.profile {
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  padding-top: 12px;
}

.profile__header {
  margin-bottom: 44px;
}

.profile__back {
  border: none;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-family-base);
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
}

.profile__back-icon {
  width: 20px;
  height: 20px;
  display: block;
}

.profile__content {
  display: flex;
  flex-direction: column;
}

.profile__title {
  font-size: 1.75rem;
  line-height: 1.2;
  font-weight: 700;
  margin-bottom: 14px;
  color: var(--color-text);
}

.profile__intro {
  font-size: 1rem;
  line-height: 1.2;
  color: var(--color-text);
  margin-bottom: 34px;
}

.profile__field {
  margin-bottom: 20px;
}

.profile__label {
  display: block;
  margin-bottom: 10px;
  font-size: 1rem;
  line-height: 1.2;
  color: var(--color-text);
}

.profile__required {
  color: var(--color-text);
}

.profile__note {
  font-size: 0.9rem;
  line-height: 1.2;
  color: var(--color-neutral-600);
  margin-top: 4px;
  margin-bottom: 24px;
}

.profile__privacy {
  font-size: 1rem;
  line-height: 1.15;
  color: var(--color-neutral-700);
}

.profile__footer {
  margin-top: auto;
  padding-top: 32px;
  padding-bottom: 8px;
}
</style>