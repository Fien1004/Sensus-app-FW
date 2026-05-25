<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { stopSession } from '../services/analyticsService'
import { useAnalyticsSession } from '../composables/useAnalyticsSession'

const route = useRoute()
const router = useRouter()
const { ensureSession, getSessionId, clearSessionId } = useAnalyticsSession()

const returnTo = computed(() => {
	const target = route.query.returnTo
	return typeof target === 'string' && target.startsWith('/') ? target : null
})

function getStoredNumber(key) {
	const value = Number(localStorage.getItem(key))
	return Number.isFinite(value) ? value : null
}

function continueScenario() {
	if (returnTo.value) {
		router.replace(returnTo.value)
		return
	}

	router.replace({ name: 'scenario-list' })
}

async function confirmStop() {
	await ensureSession({
		scenarioId: route.params.id ? String(route.params.id) : '',
		totalSteps: Number(localStorage.getItem('scenarioTotalSteps') || 0),
	})

	const activeSessionId = getSessionId()
	if (!activeSessionId) {
		console.warn('Analytics skipped: no valid Supabase session id')
		router.replace({ name: 'scenario-list' })
		return
	}

	const result = await stopSession({
		sessionId: activeSessionId,
		stoppedReason: 'user_stopped',
		completedSteps: getStoredNumber('scenarioCompletedSteps'),
		totalSteps: getStoredNumber('scenarioTotalSteps'),
	})

	if (result.ok) {
		clearSessionId()
		localStorage.removeItem('scenarioCompletedSteps')
		localStorage.removeItem('scenarioTotalSteps')
	}

	router.replace({ name: 'scenario-list' })
}
</script>

<template>
	<ScreenContainer size="medium">
		<section class="stop-confirm">
			<h1 class="stop-confirm__title">
				Ben je zeker dat je wilt stoppen?
			</h1>

			<p class="stop-confirm__note">
				Er wordt niets opgeslagen.
			</p>

			<div class="stop-confirm__actions">
				<BaseButton
					fullWidth
					size="lg"
					@click="continueScenario"
				>
					Verder doen
				</BaseButton>

				<BaseButton
					fullWidth
					size="lg"
					variant="tertiary"
					@click="confirmStop"
				>
					Stoppen
				</BaseButton>
			</div>
		</section>
	</ScreenContainer>
</template>

<style scoped>
.stop-confirm {
	min-height: calc(100dvh - 64px);
	display: flex;
	flex-direction: column;
	padding-top: 220px;
	padding-bottom: 24px;
}

.stop-confirm__title {
	margin: 0;
	font-size: 2rem;
	line-height: 1.1;
	font-weight: 700;
	color: var(--color-text);
}

.stop-confirm__note {
	margin-top: 24px;
	font-size: 0.875rem;
	line-height: 1.3;
	color: var(--color-text-muted);
}

.stop-confirm__actions {
	margin-top: 28px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

@media (min-width: 768px) {
	.stop-confirm {
		max-width: 760px;
		margin: 0 auto;
		justify-content: center;
		padding-top: 0;
		padding-bottom: 0;
		min-height: calc(100dvh - 32px);
	}

	.stop-confirm__title {
		font-size: clamp(2rem, 3vw, 2.5rem);
	}

	.stop-confirm__note {
		font-size: 0.95rem;
	}
}
</style>
