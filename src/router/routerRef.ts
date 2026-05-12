import type { Router } from 'vue-router'

let router: Router | null = null

export function setRouter(r: Router) {
  router = r
}

export function getRouter(): Router {
  if (!router) {
    throw new Error('[routerRef] Router not initialized')
  }
  return router
}
