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
  /** ถ้าส่งมา จะดึงข้อมูลของหม้อแปลงตัวนี้ทันทีตอน mount */
  transformerId?: string
}

export function useDashboard(options: DashboardOptions = {}) {
  const activeMetric     = ref('current')
  const hasData          = ref(false)
  let   autoRefreshTimer: ReturnType<typeof setInterval> | null = null

  const { PHASES, activePhases } = usePhaseSelection()

  const {
    allData, isLoading,
    selectedTransformerId,
    realtimeSnapshot,
    latest, statistics, balanceData,
    unit, lastUpdateText,
    seedFromRealtime,
  } = useEnergyData(activeMetric, activePhases, PHASES)

  const { init, refreshChart } = useEnergyChart(
    'historyLineChart', allData, activeMetric, activePhases, PHASES,
  )

  // ── handleFilter ────────────────────────────────────────────────
  // รับ transformerId ตรง ๆ หรือใช้ค่าที่ set ไว้ใน selectedTransformerId
  const handleFilter = async (
    _filter: Record<string, unknown> = {},
    transformerId?: string,
  ) => {
    // อัปเดต selected transformer ถ้าส่งมาใหม่
    if (transformerId) selectedTransformerId.value = transformerId

    isLoading.value = true

    // Seed ข้อมูลจาก realtimeSnapshot ของ transformer นั้นก่อน
    // เพื่อให้ค่า base ของกราฟสอดคล้องกับตัวที่เลือก
    seedFromRealtime()

    // TODO: แทนด้วย real API →
    //   const raw = await $fetch(`/api/transformers/${selectedTransformerId.value}/history`)
    //   allData.value = raw
    await new Promise(r => setTimeout(r, 600))

    isLoading.value = false
    hasData.value   = true
    await nextTick()
    init()
    refreshChart()
  }

  // ── mount: ถ้ามี transformerId ส่งมาให้โหลดทันที ─────────────
  onMounted(() => {
    if (options.transformerId) {
      selectedTransformerId.value = options.transformerId
      setTimeout(() => handleFilter({}, options.transformerId), 150)
    } else {
      setTimeout(() => init(), 150)
    }

    // Auto-refresh ทุก 10 นาที
    autoRefreshTimer = setInterval(() => {
      if (allData.value.length > 0) handleFilter()
    }, 10 * 60 * 1000)
  })

  onUnmounted(() => {
    if (autoRefreshTimer) clearInterval(autoRefreshTimer)
  })

  watch([activeMetric, activePhases], refreshChart)

  return {
    activeMetric, activePhases, hasData, isLoading,
    PHASES, METRIC_TABS,
    allData, latest, statistics, balanceData,
    unit, lastUpdateText,
    selectedTransformerId,
    realtimeSnapshot,
    handleFilter,
  }
}