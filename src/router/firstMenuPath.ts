import type { BackendRoute } from '@/types/auth'

/**
 * 从后端菜单树解析第一个可进入的叶子路由（用于 404 回退、默认落地页）。
 */
export function getFirstAccessibleMenuPath(menus: BackendRoute[]): string {
  if (!menus?.length) {
    return '/home'
  }

  const walk = (items: BackendRoute[], parentPath = ''): string | null => {
    for (const item of items) {
      const hidden = item.meta?.hidden
      if (hidden) {
        continue
      }
      if (item.children?.length) {
        const hit = walk(item.children, item.path)
        if (hit) {
          return hit
        }
      }
      if (item.component !== 'layout') {
        const leaf = item.path || parentPath
        if (leaf) {
          return leaf
        }
      }
    }
    return null
  }

  return walk(menus) ?? '/home'
}

/**
 * 当前账号菜单树中所有可访问叶子 path（不含 hidden），用于登录后 redirect 白名单校验。
 */
export function collectMenuPaths(menus: BackendRoute[]): Set<string> {
  const set = new Set<string>()
  if (!menus?.length) {
    return set
  }

  const walk = (items: BackendRoute[], parentPath = '') => {
    for (const item of items) {
      if (item.meta?.hidden) {
        continue
      }
      if (item.children?.length) {
        walk(item.children, item.path)
        continue
      }
      if (item.component !== 'layout') {
        const leaf = item.path || parentPath
        if (leaf) {
          set.add(leaf)
        }
      }
    }
  }

  walk(menus)
  return set
}
