<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScreenContainer from '../components/layout/ScreenContainer.vue'
import BaseButton from '../components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const returnTo = computed(() => {
	const target = route.query.returnTo
	return typeof target === 'string' && target.startsWith('/') ? target : null
})

function continueScenario() {
	if (returnTo.value) {
		router.replace(returnTo.value)
		return
	}

	router.replace({ name: 'scenario-list' })
}

function confirmStop() {
	router.replace({ name: 'scenario-list' })
}
</script>

<template>
	<ScreenContainer size="narrow">
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
	min-height: calc(100vh - 32px);
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
</style>
