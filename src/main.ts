import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElLoading from 'element-plus/es/components/loading/index.mjs'
import 'element-plus/es/components/loading/style/css.mjs'
/** Message 为函数式 API，按需样式不会随脚本 import 注入，需单独引入 */
import 'element-plus/es/components/message/style/css.mjs'
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
