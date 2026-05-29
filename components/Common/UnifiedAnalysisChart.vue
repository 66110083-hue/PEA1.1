<template>
  <div class="chart-wrapper">
    <ClientOnly>
      <v-chart 
        class="echart-instance" 
        :option="chartOption" 
        autoresize 
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// นิยาม Props เพื่อให้หน้าอื่นเรียกใช้งานและปรับแต่งได้ยืดหยุ่น
const props = defineProps<{
  xAxisData: string[] // ตัวแปรเวลา เช่น ['00:00', '01:00', ...]
  datasets: {
    name: string
    data: number[]
    color?: string
    showArea?: boolean // สั่งเปิด/ปิด แรเงาใต้กราฟ
  }[]
  showZoom?: boolean   // 🔥 สั่งเปิด/ปิด แถบสไลด์ซูมด้านล่างแบบรูปที่ 2
  showSmooth?: boolean // สั่งให้เส้นโค้งมนสมูทหรือไม่
}>()

// แปลงข้อมูลจาก Props ให้อยู่ในรูปโครงสร้าง Option ของ ECharts
const chartOption = computed(() => {
  // 1. แปลงข้อมูล Series
  const seriesConfig = props.datasets.map(set => ({
    name: set.name,
    type: 'line',
    data: set.data,
    smooth: props.showSmooth ?? true,
    symbol: 'none', // ปิดจุดตุ่มวงกลมบนเส้นเพื่อความสะอาดตา
    lineStyle: {
      width: 2,
      color: set.color
    },
    itemStyle: {
      color: set.color
    },
    // ถ้าตั้งค่า showArea ให้ทำแรเงาไล่เฉดสีใต้กราฟแบบพรีเมียม
    areaStyle: set.showArea ? {
      opacity: 0.1
    } : undefined
  }))

  // 2. โครงสร้างการตั้งค่าหลักของ ECharts
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      textStyle: { color: '#1f2937', fontSize: 12 }
    },
    legend: {
      show: true,
      top: 0,
      icon: 'circle'
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: props.showZoom ? '15%' : '8%', // ปรับระยะเผื่อแถบซูม
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      axisLine: { lineStyle: { color: '#d1d5db' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 }
    },
    series: seriesConfig,

    // 🔥 ฟีเจอร์เด็ด: แถบเลื่อนซูมดูช่วงเวลาแบบ Real-time
    dataZoom: props.showZoom ? [
      {
        type: 'slider', // มีแถบสไลเดอร์ให้ดึงด้านล่าง
        start: 0,
        end: 100,
        height: 20,
        bottom: 5,
        borderColor: 'transparent',
        backgroundColor: '#f3f4f6',
        fillerColor: 'rgba(55, 138, 221, 0.15)',
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z',
        handleSize: '120%',
        textStyle: { color: '#9ca3af' }
      },
      {
        type: 'inside' // สามารถใช้เมาส์สกรอลหรือใช้สองนิ้วถ่างซูมบนตัวกราฟตรงๆ ได้ด้วย
      }
    ] : []
  }
})
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 320px; /* สามารถปรับความสูงตามบริบทหน้าจอได้เลยครับ */
}
.echart-instance {
  width: 100%;
  height: 100%;
}
</style>