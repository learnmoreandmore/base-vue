import type { RouteRecordRaw } from 'vue-router'

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/ForbiddenView.vue'),
    meta: { title: '无权限', hidden: true },
  },
  {
    path: '/',
    redirect: '/home',
  },
  /** 旧链接与书签兼容（静态站勿再使用含 `/index` 的落地路径） */
  {
    path: '/home/index',
    redirect: '/home',
  },
]

export const fallbackRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/error/NotFoundView.vue'),
  meta: { title: '页面不存在', hidden: true },
}
