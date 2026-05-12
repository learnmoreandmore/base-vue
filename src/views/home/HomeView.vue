<script setup lang="ts">
import { defineAsyncComponent, h } from 'vue'

/**
 * 大屏 chunk 立即开始下载（勿用长 timeout 的 requestIdleCallback：节流环境下
 * 浏览器长期不 idle，会拖到 2s+ 才拉 JS，LCP 被严重拖慢）。
 */
const LoanBigScreenView = defineAsyncComponent({
  /** prefetch：与首屏其它资源并行拉取，缩短大屏 chunk + ECharts 的等待链 */
  loader: () => import(/* webpackPrefetch: true */ '@/views/loan/LoanBigScreenView.vue'),
  /** 0：立即显示 loading，避免 Vue 默认 200ms 延迟段内视口「空白」拉高 Speed Index */
  delay: 0,
  loadingComponent: {
    name: 'BigScreenLoading',
    render() {
      return h('div', { class: 'home-view__shell', role: 'status', 'aria-live': 'polite' }, [
        h('h1', { class: 'home-view__shell-title' }, '信贷运营可视化'),
        h('p', { class: 'home-view__shell-sub' }, '图表资源加载中，请稍候…'),
      ])
    },
  },
})
</script>

<template>
  <div class="home-view">
    <LoanBigScreenView />
  </div>
</template>

<style scoped>
.home-view {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: -16px;
  background: #050a12;
}

/* loading 为独立子组件根，需 :deep 穿透 scoped */
:deep(.home-view__shell) {
  flex: 1;
  min-height: min(52vh, 420px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 16px;
  box-sizing: border-box;
}

:deep(.home-view__shell-title) {
  margin: 0;
  font-size: clamp(22px, 4.2vw, 34px);
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #e8f1ff;
  line-height: 1.25;
}

:deep(.home-view__shell-sub) {
  margin: 14px 0 0;
  max-width: 28em;
  font-size: clamp(13px, 2vw, 15px);
  color: #8aa4b5;
  letter-spacing: 0.04em;
  line-height: 1.5;
}

@media (max-width: 991.98px) {
  .home-view {
    margin: -12px;
  }
}
</style>
