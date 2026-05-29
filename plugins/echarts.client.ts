// 📂 plugins/echarts.client.ts
import { defineNuxtPlugin } from '#app'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'

// Import ตัวเรนเดอร์และโมดูลที่จำเป็นเพื่อลดขนาดไฟล์ (Tree Shaking)
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  TitleComponent
} from 'echarts/components'

export default defineNuxtPlugin((nuxtApp) => {
  // ลงทะเบียนโมดูลเข้ากับระบบของ ECharts
  use([
    CanvasRenderer,
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomComponent,
    TitleComponent
  ])

  // ลงทะเบียน Component <v-chart> ให้เรียกใช้ได้ทั่วทั้งโปรเจกต์
  nuxtApp.vueApp.component('v-chart', VChart)
})