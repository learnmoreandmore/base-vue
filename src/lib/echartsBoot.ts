/**
 * 应用内 ECharts 唯一入口：按需注册，避免 `import * from 'echarts'` 拉全量 ~1MB+。
 */
import * as echarts from 'echarts/core'
import { BarChart, GaugeChart, LineChart, MapChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  GaugeChart,
  LineChart,
  MapChart,
  PieChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
])

export { echarts }
export type { EChartsType } from 'echarts/core'
