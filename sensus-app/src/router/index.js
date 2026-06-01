import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import WarningView from '../views/WarningView.vue'
import ScenarioListView from '../views/ScenarioListView.vue'
import ScenarioIntroView from '../views/ScenarioIntroView.vue'
import ScenarioView from '../views/ScenarioView.vue'
import ReflectionView from '../views/ReflectionView.vue'
import EndView from '../views/EndView.vue'
import SafeExitView from '../views/SafeExitView.vue'
import StopConfirmView from '../views/StopConfirmView.vue'
import ResumeScenarioView from '../views/ResumeScenarioView.vue'
import ErrorView from '../views/ErrorView.vue'

function getQueryString(value) {
  return Array.isArray(value) ? value[0] : value
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/profiel',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/waarschuwing',
      name: 'warning',
      component: WarningView,
    },
    {
      path: '/scenarios',
      name: 'scenario-list',
      alias: '/scenario-lijst',
      component: ScenarioListView,
    },
    {
      path: '/scenario/:id/intro',
      name: 'scenario-intro',
      component: ScenarioIntroView,
    },
    {
      path: '/scenario/:id',
      name: 'scenario',
      component: ScenarioView,
    },
    {
      path: '/scenario/:id/reflectie',
      name: 'reflection',
      component: ReflectionView,
    },
    {
      path: '/scenario/:id/end',
      alias: '/scenario/:id/einde',
      name: 'end',
      component: EndView,
    },
    {
      path: '/safe-exit',
      name: 'safe-exit',
      component: SafeExitView,
    },
    {
      path: '/stop-confirm',
      name: 'stop-confirm',
      component: StopConfirmView,
    },
    {
      path: '/resume-scenario',
      name: 'resume-scenario',
      component: ResumeScenarioView,
    },
    {
      path: '/fout',
      name: 'error',
      component: ErrorView,
      props: (route) => ({
        title: getQueryString(route.query.title),
        description: getQueryString(route.query.description),
        extraText: getQueryString(route.query.extraText),
        icon: getQueryString(route.query.icon),
        retryTo: getQueryString(route.query.retryTo),
      }),
    },
  ],
})

router.afterEach((to) => {
  if (to.path.startsWith('/scenario/')) {
    localStorage.setItem('sensus_current_scenario_route', to.fullPath)
  }
})

export default router
