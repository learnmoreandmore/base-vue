import { defineStore } from 'pinia'
import { fetchUserProfile, login } from '@/api/modules/auth'
import { usePermissionStore } from '@/stores/permission'
import { useTabsStore } from '@/stores/tabs'
import type { UserInfo } from '@/types/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null as UserInfo | null,
  }),
  getters: {
    isLogin: (state) => Boolean(state.token),
  },
  persist: {
    key: 'enterprise-admin-user',
    storage: localStorage,
    pick: ['token', 'userInfo'],
  },
  actions: {
    async loginByAccount(username: string, password: string) {
      const { token } = await login({ username, password })
      this.token = token
    },
    async loadProfile() {
      if (!this.token) return
      const permissionStore = usePermissionStore()
      const result = await fetchUserProfile(this.token)
      this.userInfo = result.userInfo
      permissionStore.setPermissions(result.routes, result.buttonPermissions)
      return result.routes
    },
    async logout() {
      const permissionStore = usePermissionStore()
      const tabsStore = useTabsStore()
      tabsStore.reset()
      const routeNames = [...permissionStore.dynamicRouteNames]
      this.token = ''
      this.userInfo = null
      permissionStore.reset()
      if (routeNames.length > 0) {
        const { default: router } = await import('@/router')
        routeNames.forEach((name) => {
          if (router.hasRoute(name)) {
            router.removeRoute(name)
          }
        })
      }
    },
  },
})
