import type { Router } from 'vue-router'
import type { BackendRoute } from '@/types/auth'
import { transformAsyncRoutes } from '@/router/dynamic'

/** 将后端菜单注册为顶层动态路由，返回顶层 route name 列表（供登出时 removeRoute） */
export function bootstrapDynamicRoutes(router: Router, backendRoutes: BackendRoute[]): string[] {
  if (!backendRoutes?.length) {
    return []
  }
  transformAsyncRoutes(backendRoutes).forEach((route) => {
    if (route.name && !router.hasRoute(route.name)) {
      router.addRoute(route)
    }
  })
  return backendRoutes.map((r) => r.name).filter(Boolean) as string[]
}
