<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { echarts } from '@/lib/echartsBoot'
import type { EChartsType } from '@/lib/echartsBoot'
import { useElementResize } from '@/composables/useElementResize'

const refPie = ref<HTMLDivElement>()
const refBar = ref<HTMLDivElement>()
let chartPie: EChartsType | null = null
let chartBar: EChartsType | null = null

const resize = () => {
  chartPie?.resize()
  chartBar?.resize()
}

useElementResize(refPie, resize)
useElementResize(refBar, resize)

onMounted(() => {
  if (refPie.value) {
    chartPie = echarts.init(refPie.value)
    chartPie.setOption({
      title: { text: '资产质量分布', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['36%', '62%'],
          data: [
            { value: 82, name: '正常' },
            { value: 9, name: '关注' },
            { value: 6, name: '次级' },
            { value: 3, name: '可疑/损失' },
          ],
        },
      ],
    })
  }
  if (refBar.value) {
    chartBar = echarts.init(refBar.value)
    chartBar.setOption({
      title: { text: '近6月不良率趋势', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { left: 48, right: 24, bottom: 32, top: 48 },
      xAxis: { type: 'category', data: ['12月', '1月', '2月', '3月', '4月', '5月'] },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: [{ type: 'bar', data: [1.1, 1.2, 1.15, 1.28, 1.22, 1.18], itemStyle: { color: '#409EFF' } }],
    })
  }
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chartPie?.dispose()
  chartBar?.dispose()
})
</script>

<template>
  <el-row :gutter="12">
    <el-col :xs="24" :md="12">
      <el-card shadow="never">
        <div ref="refPie" class="chart" />
      </el-card>
    </el-col>
    <el-col :xs="24" :md="12">
      <el-card shadow="never">
        <div ref="refBar" class="chart" />
      </el-card>
    </el-col>
  </el-row>
  <el-alert
    class="mt"
    title="说明"
    type="info"
    description="演示数据：实际环境对接决策引擎、征信、评分卡与贷后预警。"
    show-icon
    :closable="false"
  />
</template>

<style scoped>
.chart {
  width: 100%;
  height: 320px;
}
.mt {
  margin-top: 12px;
}
</style>
