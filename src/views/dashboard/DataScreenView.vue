<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { echarts } from '@/lib/echartsBoot'
import type { EChartsType } from '@/lib/echartsBoot'
import { useElementResize } from '@/composables/useElementResize'

const chartRef = ref<HTMLDivElement>()
let chart: EChartsType | null = null

const resize = () => chart?.resize()

useElementResize(chartRef, resize)

const render = () => {
  if (!chartRef.value) return
  chart?.dispose()
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value' },
    series: [
      {
        name: '订单量',
        type: 'line',
        smooth: true,
        data: [820, 932, 901, 934, 1290, 1330, 1320],
      },
    ],
  })
}

onMounted(() => {
  render()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<template>
  <el-card>
    <div ref="chartRef" class="screen-chart" />
  </el-card>
</template>

<style scoped>
.screen-chart {
  width: 100%;
  height: clamp(260px, 48vh, 460px);
  min-height: 240px;
}
</style>
