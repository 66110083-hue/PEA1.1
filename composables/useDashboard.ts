// composables/useDashboard.ts
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { usePhaseSelection } from '~/composables/usePhaseSelection'
import { useEnergyData }     from '~/composables/useEnergyData'
import { useEnergyChart }    from '~/composables/useEnergyChart'

export const METRIC_TABS = [
  { key: 'current', label: 'Current (A)' },
  { key: 'voltage', label: 'Voltage (V)' },
  { key: 'power',   label: 'Power (kW)'  },
] as const

export interface DashboardOptions {
  transformerId?: string
}

export function useDashboard(options: DashboardOptions = {}) {

  const activeMetric = ref('current')
  const hasData      = ref(false)

  let autoRefreshTimer: ReturnType<typeof setInterval> | null = null

  const { PHASES, activePhases } = usePhaseSelection()

  const {
    allData,
    isLoading,
    latest,
    statistics,
    balanceData,
    unit,
    lastUpdateText,
    selectedSiteId,
    selectedTransformerId,
    realtimeSnapshot,
    seedFromRealtime,
  } = useEnergyData(activeMetric, activePhases, PHASES)

  const { refreshChart } = useEnergyChart(
    'historyLineChart',
    allData,
    activeMetric,
    activePhases,
    PHASES,
  )

  // ─────────────────────────────────────────────
  // 🟢 ปรับปรุง handleFilter เพื่อรองรับชุด filter ใหม่ (รับ siteId)
  // ─────────────────────────────────────────────
  const handleFilter = async (
    filter: any = {}, 
    transformerId?: string,
  ) => {

    if (transformerId) {
      selectedTransformerId.value = transformerId
    }

    // 🟢 บันทึกไอดีไซน์เข้า useEnergyData เพื่อทำลายล้างสถานะเดิมให้ผูกกับไซน์ใหม่
    if (filter.siteId) {
      selectedSiteId.value = filter.siteId
    }

    isLoading.value = true
    seedFromRealtime()

    // จำลองดีเลย์การรอดึงข้อมูลจากเซิร์ฟเวอร์
    await new Promise(r => setTimeout(r, 600))

    // ดึงวันที่จาก filter
    const startDateStr = filter.startDate || new Date().toISOString().split('T')[0]
    const endDateStr = filter.endDate || new Date().toISOString().split('T')[0]

    // แปลงข้อมูลเป็น Timestamp
    const startTime = new Date(`${startDateStr}T00:00:00`).getTime()
    let endTime = new Date(`${endDateStr}T23:59:59`).getTime()

    const currentTime = new Date().getTime()
    if (endTime > currentTime) {
      endTime = currentTime // ป้องกันเวลาพุ่งล้นไปยังอนาคต
    }

    if (endTime <= startTime) {
      endTime = startTime + (10 * 60 * 1000)
    }

    // กำหนดระยะห่างของจุดข้อมูลเป็นทุกๆ 10 นาทีเป๊ะๆ
    const intervalMs = 10 * 60 * 1000 
    
    // คำนวณจำนวนจุดของขอบเขตช่วงวันที่ที่ทำการดึงค่า
    const pointCount = Math.floor((endTime - startTime) / intervalMs) + 1

    const rnd = (b: number, r: number) => +(b + (Math.random() - 0.5) * r).toFixed(1)

    // สร้างข้อมูล Array จำลองกราฟตามมิติเวลาจริง
    allData.value = Array.from({ length: pointCount }, (_, i) => {
      const t = new Date(startTime + (i * intervalMs))

      const dd = String(t.getDate()).padStart(2, '0')
      const mm = String(t.getMonth() + 1).padStart(2, '0')
      const HH = String(t.getHours()).padStart(2, '0')
      const min = String(t.getMinutes()).padStart(2, '0')

      return {
        label: `${dd}/${mm} ${HH}:${min}`,
        timestamp: t,
        current: {
          A: rnd(60, 8),
          B: rnd(62, 7),
          C: rnd(58, 9),
        },
        voltage: {
          A: rnd(220, 3),
          B: rnd(219, 3),
          C: rnd(221, 3),
        },
        power: {
          A: rnd(12, 2),
          B: rnd(13, 2),
          C: rnd(11, 2),
        },
      }
    })

    isLoading.value = false
    hasData.value   = true

    await nextTick()
  }

  onMounted(() => {
    if (options.transformerId) {
      selectedTransformerId.value = options.transformerId
      setTimeout(() => {
        handleFilter({}, options.transformerId)
      }, 150)
    }

    // Auto Refresh ข้อมูลอัตโนมัติเมื่อครบกำหนดรอบทุก 10 นาที
    autoRefreshTimer = setInterval(() => {
      if (allData.value.length > 0) {
        handleFilter({
          siteId: selectedSiteId.value,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        })
      }
    }, 10 * 60 * 1000)
  })

  onUnmounted(() => {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer)
    }
  })

  watch(
    [activeMetric, activePhases],
    refreshChart,
  )

  return {
    activeMetric,
    activePhases,
    hasData,
    isLoading,
    PHASES,
    METRIC_TABS,
    allData,
    latest,
    statistics,
    balanceData,
    unit,
    lastUpdateText,
    selectedSiteId,
    selectedTransformerId,
    realtimeSnapshot,
    handleFilter,
  }
}