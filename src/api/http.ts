import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

http.interceptors.request.use(
  (config) => {
    const token = useUserStore().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const rid =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    config.headers['X-Request-ID'] = rid
    return config
  },
  (error) => Promise.reject(error),
)

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status
    const messageMap: Record<number, string> = {
      401: '登录状态失效，请重新登录',
      403: '暂无访问权限，请联系管理员',
      500: '服务异常，请稍后重试',
    }
    ElMessage.error(messageMap[status] ?? error?.message ?? '网络请求异常')
    if (status === 401) {
      void (async () => {
        const { default: router } = await import('@/router')
        const fullPath = router.currentRoute.value.fullPath
        await useUserStore().logout()
        if (!router.currentRoute.value.path.startsWith('/login')) {
          await router.replace({
            path: '/login',
            query:
              fullPath && fullPath !== '/login' ? { redirect: fullPath } : {},
          })
        }
      })()
    }
    return Promise.reject(error)
  },
)

export default http
