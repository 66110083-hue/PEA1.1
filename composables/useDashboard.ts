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

  // ใช้ useEnergyData ตัวเดียวทั้งระบบ
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

  const { init, refreshChart } = useEnergyChart(
    'historyLineChart',
    allData,
    activeMetric,
    activePhases,
    PHASES,
  )

  // ─────────────────────────────────────────────
  // handleFilter async function ที่ใช้ดึงข้อมูลตามตัวกรองต่างๆ (เช่น transformerId) และอัพเดต chart
  // async คือฟังก์ชันที่ทำงานแบบอะซิงโครนัส สามารถใช้ await เพื่อรอผลลัพธ์จากการเรียก API หรือการประมวลผลที่ใช้เวลานานได้
  // ─────────────────────────────────────────────
  const handleFilter = async (
    _filter: Record<string, unknown> = {},
    transformerId?: string,
  ) => {

    // ถ้ามี transformer ใหม่ส่งมา
    if (transformerId) {
      selectedTransformerId.value = transformerId
    }

    isLoading.value = true

    // ใช้ realtime เป็นต้นทาง
    seedFromRealtime()

// await new Promise(r => setTimeout(r, 600)) --- IGNORE --- เพื่อจำลอง delay ในการโหลดข้อมูลจริงจาก API
    await new Promise(r => setTimeout(r, 600))


    // TODO:
    // await $fetch(`/api/transformers/${selectedTransformerId.value}/history`)

    const now = new Date()

    now.setMinutes(
      Math.floor(now.getMinutes() / 10) * 10,
      0,
      0,
    )

    const rnd = (b: number, r: number) =>
      +(b + (Math.random() - 0.5) * r).toFixed(1)

    // สร้างข้อมูลย้อนหลัง
    allData.value = Array.from({ length: 1000 }, (_, i) => {

      const t = new Date(
        now.getTime() - (999 - i) * 10 * 60_000,
      )

      return {
        label:
          `${String(t.getHours()).padStart(2, '0')}:` +
          `${String(t.getMinutes()).padStart(2, '0')}`,

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
// await nextTick() --- IGNORE --- เพื่อรอให้ DOM อัพเดตก่อนที่จะเรียก init() และ refreshChart() ซึ่งจะใช้ข้อมูลใหม่ที่เพิ่งโหลดมาแสดงผลใน chart ได้ถูกต้อง
    await nextTick()
    init()
    refreshChart()
  }

  // ─────────────────────────────────────────────
  // mounted
  // ─────────────────────────────────────────────
  onMounted(() => {

    // ถ้ามี transformer ส่งมาให้โหลดทันที
    if (options.transformerId) {

      selectedTransformerId.value =
        options.transformerId

      setTimeout(() => {
        handleFilter({}, options.transformerId)
      }, 150)

    } else {

      setTimeout(() => init(), 150)
    }

    // auto refresh ทุก 10 นาที
    autoRefreshTimer = setInterval(() => {

      if (allData.value.length > 0) {
        handleFilter()
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

    // ของเดิม
    selectedSiteId,

    // ของใหม่
    selectedTransformerId,
    realtimeSnapshot,

    handleFilter,
    
  }
}