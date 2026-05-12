import { defineStore } from 'pinia'
import type { BackendRoute } from '@/types/auth'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    menus: [] as BackendRoute[],
    buttonPermissions: [] as string[],
    /** 通过 router.addRoute 注册的顶层动态路由 name，登出时 removeRoute */
    dynamicRouteNames: [] as string[],
    routeReady: false,
  }),
  actions: {
    setDynamicRouteNames(names: string[]) {
      this.dynamicRouteNames = names
    },
    setPermissions(menus: BackendRoute[], buttonPermissions: string[]) {
      this.menus = menus
      this.buttonPermissions = buttonPermissions
      this.routeReady = true
    },
    hasPermission(code: string) {
      return this.buttonPermissions.includes(code)
    },
    reset() {
      this.menus = []
      this.buttonPermissions = []
      this.dynamicRouteNames = []
      this.routeReady = false
    },
  },
})
