<script setup>
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BulbIcon from '../assets/icons/bulb.svg?raw'
import { getScenarioBySlug } from '../services/scenarioService'
import { useAnalyticsSession } from '../composables/useAnalyticsSession'

const route = useRoute()
const router = useRouter()
const { getSessionId, clearSessionId, completeCurrentSession } = useAnalyticsSession()

const scenarioId = computed(() => String(route.params.id ?? ''))
const stepId = computed(() => String(route.query.step ?? ''))

const scenario = ref(null)
const isLoading = ref(true)
const analyticsSaved = ref(false)

const endStep = computed(() => {
	if (!scenario.value || !stepId.value) return null
	const steps = scenario.value.engine_json?.steps ?? []

	return steps.find(
		(step) => step.id === stepId.value && step.type === 'end',
	) ?? null
})

const endData = computed(() => endStep.value)
const rememberTitle = computed(() => endData.value?.rememberTitle?.trim() || 'Onthoud dit')
const rememberItems = computed(() => Array.isArray(endData.value?.remember) ? endData.value.remember : [])
const shouldShowRemember = computed(() => Boolean(endData.value?.rememberTitle?.trim() || rememberItems.value.length))
const totalSteps = computed(() => scenario.value?.engine_json?.steps?.length ?? 0)

const progress = computed(() => 100)

const rememberIconMarkup = computed(() => BulbIcon.replace('fill="black"', 'fill="currentColor"'))

watchEffect(() => {
	if (!endData.value) return

	console.log('endData', endData.value)

	if (!endData.value.extraText?.trim()) {
		console.warn('EndView: extraText ontbreekt of is leeg')
	}

	if (!endData.value.rememberTitle?.trim()) {
		console.warn('EndView: rememberTitle ontbreekt of is leeg')
	}

	if (!Array.isArray(endData.value.remember)) {
		console.warn('EndView: remember ontbreekt of is geen array')
	}
})

function showScenarioError() {
	router.replace({
		name: 'error',
		query: {
			retryTo: route.fullPath,
			icon: 'scenario',
		},
	})
}

onMounted(() => {
	(async () => {
		try {
			scenario.value = await getScenarioBySlug(scenarioId.value)
		} catch (error) {
			console.error(error)
			scenario.value = null
			isLoading.value = false
			showScenarioError()
			return
		}

		if (!scenario.value || !endStep.value) {
			isLoading.value = false
			showScenarioError()
			return
		}

		isLoading.value = false

		if (analyticsSaved.value || !endStep.value || !getSessionId()) {
			return
		}

		const result = await completeCurrentSession({
			completedSteps: totalSteps.value,
			totalSteps: totalSteps.value,
		})

		analyticsSaved.value = result.ok || result.alreadyCompleted === true

		if (analyticsSaved.value) {
			localStorage.removeItem('scenarioCompletedSteps')
			localStorage.removeItem('scenarioTotalSteps')
		}
	})()
})

function finishScenario() {
	clearSessionId()
	localStorage.removeItem('scenarioCompletedSteps')
	localStorage.removeItem('scenarioTotalSteps')
	router.replace({ name: 'scenario-list' })
}
</script>

<template>
	<ScreenContainer size="wide">
		<section class="end-view">
			<div v-if="isLoading" class="end-view__empty">
				<h1 class="end-view__title">Laden…</h1>
			</div>

			<div v-else-if="!endStep" class="end-view__empty">
				<h1 class="end-view__title">Einde niet gevonden</h1>
			</div>

			<div v-else class="end-view__content">
				<div class="end-view__progress-track">
					<div class="end-view__progress-fill" :style="{ width: progress + '%' }"></div>
				</div>

				<h1 class="end-view__title">{{ endStep.title }}</h1>

				<p class="end-view__description">{{ endStep.description }}</p>

				<p v-if="endStep.extraText" class="end-view__extra">{{ endStep.extraText }}</p>

				<section v-if="shouldShowRemember" class="end-view__remember">
					<h2 class="end-view__remember-title">
						<span class="end-view__remember-icon" aria-hidden="true" v-html="rememberIconMarkup"></span>
						<span>{{ rememberTitle }}</span>
					</h2>

					<ul v-if="rememberItems.length" class="end-view__remember-list">
						<li v-for="(item, index) in rememberItems" :key="index">
							{{ item }}
						</li>
					</ul>
				</section>
			</div>

			<footer class="end-view__footer">
				<BaseButton
					fullWidth
					size="lg"
					variant="tertiary"
					@click="finishScenario"
				>
					{{ endStep?.button || 'Afronden' }}
				</BaseButton>
			</footer>
		</section>
	</ScreenContainer>
</template>

<style scoped>
.end-view {
	min-height: calc(100dvh - 64px);
	display: flex;
	flex-direction: column;
	padding-top: 24px;
	padding-bottom: 24px;
}

.end-view__content,
.end-view__footer,
.end-view__empty {
	width: 100%;
}

.end-view__content {
	margin-top: 8px;
}

.end-view__progress-track {
	width: 100%;
	height: 10px;
	border-radius: 999px;
	background: #e5e7eb;
	overflow: hidden;
}

.end-view__progress-fill {
	height: 100%;
	background: var(--color-primary-600);
}

.end-view__title {
	margin-top: 22px;
	margin-bottom: 10px;
	font-size: 2rem;
	line-height: 1.1;
	font-weight: 700;
	color: var(--color-text);
}

.end-view__description,
.end-view__extra {
	font-size: 1rem;
	line-height: 1.25;
	color: var(--color-text);
}

.end-view__extra {
	margin-top: 10px;
	font-size: 0.9375rem;
	line-height: 1.3;
	color: var(--color-text-soft);
}

.end-view__remember {
	margin-top: 30px;
}

.end-view__remember-title {
	margin: 0;
	display: inline-flex;
	align-items: center;
	gap: 10px;
	font-size: 2rem;
	line-height: 1.2;
	font-weight: 700;
	color: var(--color-primary-600);
}

.end-view__remember-icon {
	width: 24px;
	height: 24px;
}

.end-view__remember-icon :deep(svg) {
	width: 24px;
	height: 24px;
	display: block;
	fill: currentColor;
}

.end-view__remember-list {
	margin-top: 14px;
	padding-left: 18px;
	color: var(--color-text);
}

.end-view__remember-list li {
	margin-bottom: 8px;
	font-size: 1rem;
	line-height: 1.25;
}

.end-view__empty {
	margin-top: 32px;
}

.end-view__footer {
	margin-top: auto;
	padding-top: 24px;
}

@media (min-width: 768px) {
	.end-view {
		max-width: 760px;
		margin: 0 auto;
		padding-top: 40px;
		padding-bottom: 40px;
		min-height: calc(100dvh - 32px);
	}

	.end-view__title {
		font-size: clamp(2rem, 3vw, 2.5rem);
	}

	.end-view__description,
	.end-view__extra,
	.end-view__remember-list li {
		font-size: 1.05rem;
	}

	.end-view__remember-title {
		font-size: clamp(2rem, 3vw, 2.5rem);
	}

	.end-view__footer {
		max-width: 760px;
		margin: auto auto 0;
		padding-top: 32px;
	}

	.end-view__empty {
		margin-top: 40px;
	}
}

@media (min-width: 1024px) {
	.end-view {
		max-width: 760px;
	}
	
	.end-view__footer {
		max-width: 760px;
	}
}
</style>
