<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { echarts } from '@/lib/echartsBoot'
import type { EChartsType } from '@/lib/echartsBoot'
import { useElementResize } from '@/composables/useElementResize'
import DigitalFlipBoard from '@/views/loan/big-screen/DigitalFlipBoard.vue'

const kpi = [
  { label: '在贷余额(亿)', flip: '128.6', trend: '+2.3%' },
  { label: '当日放款(笔)', flip: '326', trend: '+18' },
  { label: '不良率', flip: '1.18%', trend: '-0.02%' },
  { label: '审批通过率', flip: '74.2%', trend: '+0.6%' },
]

/** 与 `public/geo/china.json`（DataV 省界）中 properties.name 一致 */
const provinceSeries = [
  { name: '北京市', value: 420 },
  { name: '上海市', value: 510 },
  { name: '广东省', value: 680 },
  { name: '浙江省', value: 540 },
  { name: '江苏省', value: 590 },
  { name: '四川省', value: 360 },
  { name: '湖北省', value: 310 },
  { name: '山东省', value: 480 },
  { name: '河南省', value: 390 },
  { name: '福建省', value: 340 },
]

const chartLineRef = ref<HTMLDivElement>()
const chartGaugeRef = ref<HTMLDivElement>()
const chartMapRef = ref<HTMLDivElement>()
const chartsHostRef = ref<HTMLElement>()
const mapLoadError = ref(false)

let lineChart: EChartsType | null = null
let gaugeChart: EChartsType | null = null
let mapChart: EChartsType | null = null

const resize = () => {
  lineChart?.resize()
  gaugeChart?.resize()
  mapChart?.resize()
}

useElementResize(chartsHostRef, resize)

/** 离线地图：构建后由 `public/geo/china.json` 提供（勿删该文件） */
async function registerChinaMapOffline(): Promise<boolean> {
  const base = import.meta.env.BASE_URL || '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  const url = `${prefix}geo/china.json`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      return false
    }
    const json = (await res.json()) as Parameters<typeof echarts.registerMap>[1]
    echarts.registerMap('china', json)
    return true
  } catch {
    return false
  }
}

function initLineAndGauge() {
  if (chartLineRef.value) {
    lineChart = echarts.init(chartLineRef.value, undefined, { renderer: 'canvas' })
    lineChart.setOption({
      backgroundColor: 'transparent',
      textStyle: { color: '#b4c0cc' },
      tooltip: { trigger: 'axis' },
      grid: { left: 48, right: 24, top: 40, bottom: 28 },
      xAxis: {
        type: 'category',
        data: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
        axisLine: { lineStyle: { color: '#3d4f5f' } },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(61,79,95,0.6)' } },
        axisLine: { show: false },
      },
      series: [
        {
          name: '放款金额',
          type: 'line',
          smooth: true,
          areaStyle: { color: 'rgba(64,158,255,0.15)' },
          lineStyle: { color: '#409EFF', width: 2 },
          data: [120, 132, 101, 134, 90, 160, 210],
        },
        {
          name: '还款金额',
          type: 'line',
          smooth: true,
          lineStyle: { color: '#67C23A', width: 2 },
          data: [80, 102, 120, 110, 95, 130, 150],
        },
      ],
    })
  }

  if (chartGaugeRef.value) {
    gaugeChart = echarts.init(chartGaugeRef.value, undefined, { renderer: 'canvas' })
    gaugeChart.setOption({
      backgroundColor: 'transparent',
      series: [
        {
          type: 'gauge',
          center: ['50%', '54%'],
          radius: '82%',
          min: 0,
          max: 100,
          splitNumber: 10,
          axisLine: {
            lineStyle: {
              width: 14,
              color: [
                [0.75, '#67C23A'],
                [0.9, '#E6A23C'],
                [1, '#F56C6C'],
              ],
            },
          },
          pointer: { itemStyle: { color: '#409EFF' }, length: '72%', width: 5 },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { color: '#8aa4b5', distance: -32, fontSize: 10 },
          /** 分值居中偏上，标题单独置底，避免与 data.name 默认位置重叠 */
          title: {
            show: true,
            offsetCenter: [0, '74%'],
            fontSize: 13,
            color: '#8aa4b5',
            fontWeight: 500,
            formatter: '综合风险分',
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}',
            color: '#e8f1ff',
            fontSize: 30,
            fontWeight: 700,
            offsetCenter: [0, '-2%'],
            borderRadius: 4,
            padding: [4, 10],
            backgroundColor: 'rgba(6,14,24,0.55)',
          },
          data: [{ value: 82 }],
        },
      ],
    })
  }
}

async function initMapWhenReady() {
  const mapOk = await registerChinaMapOffline()
  if (!mapOk) {
    mapLoadError.value = true
    return
  }
  if (chartMapRef.value) {
    mapChart = echarts.init(chartMapRef.value, undefined, { renderer: 'canvas' })
    mapChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>业务量指数 {c}',
        borderColor: 'rgba(64,158,255,0.4)',
        backgroundColor: 'rgba(6,14,24,0.92)',
        textStyle: { color: '#e8f1ff' },
      },
      visualMap: {
        show: true,
        min: 0,
        max: 800,
        left: 16,
        bottom: 24,
        text: ['高', '低'],
        textStyle: { color: '#8aa4b5', fontSize: 11 },
        calculable: true,
        inRange: {
          color: ['#0f2438', '#1a4a6e', '#2563a8', '#409EFF'],
        },
      },
      series: [
        {
          name: '业务量',
          type: 'map',
          map: 'china',
          roam: false,
          zoom: 1.05,
          aspectScale: 0.82,
          layoutCenter: ['50%', '52%'],
          layoutSize: '92%',
          label: { show: false },
          emphasis: {
            label: { show: true, color: '#e8f1ff', fontSize: 11 },
            itemStyle: {
              areaColor: 'rgba(64,158,255,0.35)',
              borderColor: '#7ec3ff',
              borderWidth: 1,
            },
          },
          itemStyle: {
            borderColor: 'rgba(100, 160, 220, 0.45)',
            borderWidth: 1,
            areaColor: 'rgba(18, 42, 68, 0.9)',
          },
          data: provinceSeries,
        },
      ],
    })
  }
}

onMounted(() => {
  /** 折线 / 仪表盘不依赖 GeoJSON，先绘制以降低 LCP（地图与 fetch 并行） */
  initLineAndGauge()
  void initMapWhenReady()

  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  lineChart?.dispose()
  gaugeChart?.dispose()
  mapChart?.dispose()
})
</script>

<template>
  <div class="big-screen">
    <div class="big-screen__head">
      <h1>信贷运营可视化大屏</h1>
      <span class="sub">Mock 数据 · 可对接实时数仓 / WebSocket</span>
    </div>
    <el-row :gutter="12" class="kpi-row">
      <el-col v-for="item in kpi" :key="item.label" :xs="12" :sm="12" :md="6">
        <div class="kpi-card">
          <div class="kpi-label">{{ item.label }}</div>
          <div class="kpi-flip">
            <DigitalFlipBoard :text="item.flip" />
          </div>
          <div class="kpi-trend">{{ item.trend }}</div>
        </div>
      </el-col>
    </el-row>

    <div ref="chartsHostRef" class="chart-host">
      <el-row :gutter="12" class="chart-row chart-row--map">
        <el-col :span="24" class="map-col">
          <div class="panel panel--map">
            <div class="panel-title">全国业务分布</div>
            <div v-if="mapLoadError" class="panel-map-fallback">
              未找到离线地图文件，请将全国省界 GeoJSON 置于 <code>public/geo/china.json</code> 后刷新。
            </div>
            <div v-else ref="chartMapRef" class="panel-chart panel-chart--map" />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="12" class="chart-row">
        <el-col :xs="24" :lg="16">
          <div class="panel panel--bottom">
            <div class="panel-title">放款 vs 还款（亿元）</div>
            <div ref="chartLineRef" class="panel-chart panel-chart--fixed" />
          </div>
        </el-col>
        <el-col :xs="24" :lg="8">
          <div class="panel panel--bottom">
            <div class="panel-title">实时风险评分</div>
            <div ref="chartGaugeRef" class="panel-chart panel-chart--fixed gauge" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.big-screen {
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 12px 12px 16px;
  color: #e8f1ff;
  background: linear-gradient(180deg, #0c1a2c 0%, #081422 35%, #050a12 100%);
  background-attachment: local;
}

.big-screen__head {
  text-align: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.big-screen__head h1 {
  margin: 0;
  font-size: 22px;
  letter-spacing: 2px;
}
.sub {
  font-size: 12px;
  color: #8aa4b5;
}

.kpi-row {
  margin-bottom: 8px;
  flex-shrink: 0;
}
.kpi-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(64, 158, 255, 0.25);
  border-radius: 8px;
  padding: 10px 12px 12px;
  margin-bottom: 12px;
}
.kpi-label {
  font-size: 12px;
  color: #8aa4b5;
}
.kpi-flip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  min-height: 40px;
}
.kpi-trend {
  margin-top: 6px;
  font-size: 12px;
  color: #67c23a;
}

.chart-host {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.chart-row {
  flex-shrink: 0;
}
.chart-row:not(.chart-row--map) {
  flex: 0 0 auto;
}
.chart-row--map {
  flex: 1 1 auto;
  min-height: 0;
}

.map-col {
  display: flex;
  min-height: 0;
}

.panel {
  background: rgba(6, 14, 24, 0.72);
  border: 1px solid rgba(64, 158, 255, 0.22);
  border-radius: 10px;
  padding: 10px 12px 8px;
  margin-bottom: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel--map {
  flex: 1 1 auto;
  min-height: 380px;
}
.panel--bottom {
  flex: 0 0 auto;
  height: auto;
}
.panel-title {
  font-size: 13px;
  color: #b4c0cc;
  margin-bottom: 6px;
  flex-shrink: 0;
}
.panel-chart {
  width: 100%;
}
.panel-chart--map {
  flex: 1 1 auto;
  min-height: 320px;
  max-height: 520px;
}
/** 底部折线/仪表盘：固定高度区间，避免与上方地图同列 flex 时被无限拉高 */
.panel-chart--fixed {
  flex: 0 0 auto;
  height: 320px;
  min-height: 240px;
  max-height: 400px;
}
.panel-chart--fixed.gauge {
  height: 320px;
  max-height: 400px;
}

.panel-map-fallback {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 16px;
  font-size: 13px;
  color: #8aa4b5;
  line-height: 1.6;
  border: 1px dashed rgba(64, 158, 255, 0.25);
  border-radius: 8px;
  min-height: 320px;
}
</style>
