import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/**
 * 响应式 matchMedia，用于布局断点（避免 SSR 时访问 window 报错）。
 */
export function useMediaQuery(query: string): Ref<boolean> {
  const matches = ref(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  let mql: MediaQueryList | null = null

  const sync = () => {
    if (mql) {
      matches.value = mql.matches
    }
  }

  onMounted(() => {
    mql = window.matchMedia(query)
    matches.value = mql.matches
    mql.addEventListener('change', sync)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', sync)
  })

  return matches
}
