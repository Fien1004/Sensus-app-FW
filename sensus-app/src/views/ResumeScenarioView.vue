<script setup>
import { useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'

const router = useRouter()

const STORAGE_KEY = 'sensus_current_scenario_route'

function resumeScenario() {
	const savedRoute = localStorage.getItem(STORAGE_KEY)

	if (savedRoute) {
		router.push(savedRoute)
		return
	}

	router.push({ name: 'scenario-list' })
}

function restartScenario() {
	localStorage.removeItem(STORAGE_KEY)
	router.push({ name: 'scenario-list' })
}
</script>

<template>
	<ScreenContainer size="medium">
		<section class="resume-scenario">
			<h1 class="resume-scenario__title">
				Je was bezig met een scenario
			</h1>

			<div class="resume-scenario__actions">
				<BaseButton fullWidth size="lg" @click="resumeScenario">
					Verder gaan waar je was
				</BaseButton>

				<BaseButton fullWidth size="lg" variant="tertiary" @click="restartScenario">
					Opnieuw starten
				</BaseButton>
			</div>
		</section>
	</ScreenContainer>
</template>

<style scoped>
.resume-scenario {
	min-height: calc(100dvh - 64px);
	display: flex;
	flex-direction: column;
	padding-top: 320px;
	padding-bottom: 24px;
}

.resume-scenario__title {
	margin: 0;
	font-size: 2rem;
	line-height: 1.1;
	font-weight: 700;
	color: var(--color-text);
}

.resume-scenario__actions {
	margin-top: 44px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

@media (min-width: 768px) {
	.resume-scenario {
		max-width: 760px;
		margin: 0 auto;
		justify-content: center;
		padding-top: 0;
		padding-bottom: 0;
		min-height: calc(100dvh - 32px);
	}

	.resume-scenario__title {
		font-size: clamp(2rem, 3vw, 2.5rem);
	}

	.resume-scenario__actions {
		margin-top: 32px;
	}
}
</style>
