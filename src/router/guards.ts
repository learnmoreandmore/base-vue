import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'
import { getFirstAccessibleMenuPath, collectMenuPaths } from '@/router/firstMenuPath'
import { bootstrapDynamicRoutes } from '@/router/bootstrapDynamicRoutes'

const whiteList = ['/login']
const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Enterprise Admin'

function resolveSafeRedirectPath(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    return null
  }
  const pathPart = raw.split('?')[0]
  if (pathPart.includes('..')) {
    return null
  }
  return raw
}

export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    if (userStore.isLogin && to.path === '/login') {
      const redirect = resolveSafeRedirectPath(to.query.redirect)
      return next(redirect ?? '/home/index')
    }

    if (whiteList.includes(to.path)) {
      return next()
    }

    if (!userStore.isLogin) {
      ElMessage.warning('请先登录后访问系统')
      const redirect = to.fullPath && to.path !== '/login' ? `?redirect=${encodeURIComponent(to.fullPath)}` : ''
      return next(`/login${redirect}`)
    }
    if (!permissionStore.routeReady) {
      const backendRoutes = await userStore.loadProfile()
      const topNames = bootstrapDynamicRoutes(router, backendRoutes ?? [])
      permissionStore.setDynamicRouteNames(topNames)
      // "to" may already be resolved as NotFound on first refresh; rematch by raw URL.
      return next({ path: to.fullPath, replace: true })
    }

    if (to.meta.permissionCode && !permissionStore.hasPermission(to.meta.permissionCode as string)) {
      return next('/403')
    }

    if (to.name === 'NotFound' && permissionStore.routeReady && permissionStore.menus.length > 0) {
      return next({ path: getFirstAccessibleMenuPath(permissionStore.menus), replace: true })
    }

    if (
      permissionStore.routeReady &&
      from.path === '/login' &&
      permissionStore.menus.length > 0 &&
      to.path !== '/403' &&
      to.name !== 'NotFound'
    ) {
      const allowed = collectMenuPaths(permissionStore.menus)
      if (!allowed.has(to.path)) {
        return next({ path: getFirstAccessibleMenuPath(permissionStore.menus), replace: true })
      }
    }

    next()
  })

  router.afterEach((to) => {
    const piece = to.meta?.title
    document.title = typeof piece === 'string' && piece ? `${piece} · ${APP_TITLE}` : APP_TITLE
  })
}
