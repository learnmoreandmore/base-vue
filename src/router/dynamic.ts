import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import type { BackendRoute } from '@/types/auth'

const viewModules = import.meta.glob('/src/views/**/*.vue')

function resolveComponent(component: string) {
  if (component === 'layout') return AppLayout
  return viewModules[`/src/views/${component}.vue`]
}

export function transformAsyncRoutes(backendRoutes: BackendRoute[]): RouteRecordRaw[] {
  return backendRoutes.map((item) => {
    const route: Record<string, unknown> = {
      path: item.path,
      name: item.name,
      meta: item.meta as unknown as RouteRecordRaw['meta'],
      component: resolveComponent(item.component) as RouteRecordRaw['component'],
    }
    if (item.redirect) {
      route.redirect = item.redirect
    }
    if (item.children?.length) {
      route.children = transformAsyncRoutes(item.children)
    }
    return route as unknown as RouteRecordRaw
  })
}
