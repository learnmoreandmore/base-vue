import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes, fallbackRoute } from './static-routes'
import { setupRouterGuards } from './guards'

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes, fallbackRoute],
  scrollBehavior: () => ({ top: 0, left: 0 }),
})

setupRouterGuards(router)

export default router
