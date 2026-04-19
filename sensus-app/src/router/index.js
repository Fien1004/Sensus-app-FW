import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ScenarioView from '../views/ScenarioView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/scenario/:id',
      name: 'scenario',
      component: ScenarioView,
    },
  ],
})

export default router