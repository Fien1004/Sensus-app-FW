import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import { hideLoader, showLoader } from './composables/useAppLoader'

showLoader()

createApp(App).use(router).mount('#app')

router.isReady().finally(() => {
  hideLoader()
})
