import { defineStore } from 'pinia'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import router from '@/router'

export interface TabHistoryItem {
  fullPath: string
  path: string
  title: string
  name: string | symbol | undefined | null
  affix: boolean
}

function pruneViewNonces(
  map: Record<string, number>,
  keep: Set<string>,
): Record<string, number> {
  const next: Record<string, number> = {}
  for (const k of Object.keys(map)) {
    if (keep.has(k)) {
      next[k] = map[k]!
    }
  }
  return next
}

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    /** 已打开标签（按访问打开顺序，同一 fullPath 不重复） */
    tabs: [] as TabHistoryItem[],
    /** 与标签 fullPath 对应，用于强制重挂载 router-view */
    viewNonceByPath: {} as Record<string, number>,
  }),
  getters: {
    viewKey:
      (state) =>
      (fullPath: string): string => {
        const n = state.viewNonceByPath[fullPath] ?? 0
        return `${fullPath}#${n}`
      },
  },
  actions: {
    reset() {
      this.tabs = []
      this.viewNonceByPath = {}
    },

    syncFromRoute(route: RouteLocationNormalizedLoaded) {
      if (route.meta?.hidden === true) {
        return
      }
      const title = typeof route.meta?.title === 'string' ? route.meta.title.trim() : ''
      if (!title) {
        return
      }

      const affix = route.meta?.affix === true
      const fullPath = route.fullPath
      const hit = this.tabs.find((t) => t.fullPath === fullPath)
      if (hit) {
        hit.title = title
        hit.affix = affix
        hit.name = route.name
        hit.path = route.path
        return
      }

      this.tabs.push({
        fullPath,
        path: route.path,
        title,
        name: route.name,
        affix,
      })
    },

    refreshTab(fullPath: string) {
      const cur = this.viewNonceByPath[fullPath] ?? 0
      this.viewNonceByPath[fullPath] = cur + 1
    },

    closeTab(fullPath: string) {
      const idx = this.tabs.findIndex((t) => t.fullPath === fullPath)
      if (idx === -1) {
        return
      }
      const tab = this.tabs[idx]
      if (!tab || tab.affix) {
        return
      }
      if (this.tabs.length <= 1) {
        return
      }

      const wasActive = router.currentRoute.value.fullPath === fullPath
      const nextTab = this.tabs[idx + 1] ?? this.tabs[idx - 1]
      this.tabs.splice(idx, 1)
      const nextNonce = { ...this.viewNonceByPath }
      delete nextNonce[fullPath]
      this.viewNonceByPath = nextNonce

      if (wasActive && nextTab) {
        void router.replace(nextTab.fullPath)
      }
    },

    closeOthers(keepFullPath: string) {
      const keep = new Set<string>([keepFullPath])
      for (const t of this.tabs) {
        if (t.affix) {
          keep.add(t.fullPath)
        }
      }
      this.tabs = this.tabs.filter((t) => keep.has(t.fullPath))
      const after = new Set(this.tabs.map((t) => t.fullPath))
      this.viewNonceByPath = pruneViewNonces(this.viewNonceByPath, after)

      const cur = router.currentRoute.value.fullPath
      if (!after.has(cur)) {
        void router.replace(keepFullPath)
      }
    },

    closeRightOf(anchorFullPath: string) {
      const i = this.tabs.findIndex((t) => t.fullPath === anchorFullPath)
      if (i === -1 || i >= this.tabs.length - 1) {
        return
      }
      const removed = this.tabs.slice(i + 1)
      this.tabs = this.tabs.slice(0, i + 1)
      const keep = new Set(this.tabs.map((t) => t.fullPath))
      this.viewNonceByPath = pruneViewNonces(this.viewNonceByPath, keep)

      const cur = router.currentRoute.value.fullPath
      if (removed.some((t) => t.fullPath === cur)) {
        void router.replace(anchorFullPath)
      }
    },

    /**
     * 将标签从 fromIndex 移到「原数组中 insertBefore 下标」之前（insertBefore 取 0..length）。
     * 若 fromIndex < insertBefore，移除后插入下标需 -1。
     */
    reorderTabs(fromIndex: number, insertBefore: number) {
      const arr = [...this.tabs]
      const item = arr[fromIndex]
      if (!item || item.affix) {
        return
      }
      const affixCount = arr.filter((t) => t.affix).length
      let bound = Math.min(Math.max(insertBefore, affixCount), arr.length)
      if (fromIndex === bound) {
        return
      }

      arr.splice(fromIndex, 1)
      let to = bound
      if (fromIndex < bound) {
        to -= 1
      }
      to = Math.max(to, affixCount)
      to = Math.min(to, arr.length)
      arr.splice(to, 0, item)
      this.tabs = arr
    },
  },
})
