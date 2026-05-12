import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { ElLoading } from 'element-plus'
import App from './App.vue'
import router from './router'
import './styles/index.css'
import { registerAppPlugins } from '@/plugins'

const app = createApp(App)
app.use(ElLoading)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
registerAppPlugins(app)

app.mount('#app')
