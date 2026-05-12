import { nextTick, onMounted, onUnmounted, type Ref } from 'vue'

/** 监听元素尺寸变化（图表容器、大屏布局） */
export function useElementResize(elRef: Ref<HTMLElement | null | undefined>, onResize: () => void) {
  let ro: ResizeObserver | null = null

  onMounted(() => {
    void nextTick(() => {
      const el = elRef.value
      if (!el || typeof ResizeObserver === 'undefined') {
        return
      }
      ro = new ResizeObserver(() => onResize())
      ro.observe(el)
    })
  })

  onUnmounted(() => {
    ro?.disconnect()
    ro = null
  })
}
