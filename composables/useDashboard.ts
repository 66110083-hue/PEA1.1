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

export function useDashboard() {
  const activeMetric = ref('current')
  const hasData      = ref(false)
  let   autoRefreshTimer: any = null

  const { PHASES, activePhases } = usePhaseSelection()

  // ← ใช้ useEnergyData ตัวเดียวกันทั้งระบบ
  const {
    allData, isLoading, latest,
    statistics, balanceData, unit, lastUpdateText,
    selectedSiteId,   // ← ได้ไซต์ที่เลือกมาด้วย
  } = useEnergyData(activeMetric, activePhases, PHASES)

  const { init, refreshChart } = useEnergyChart(
    'historyLineChart', allData, activeMetric, activePhases, PHASES,
  )

  // ─── handleFilter ดึงข้อมูลย้อนหลังของไซต์ที่เลือก ──
  const handleFilter = async (_filter: Record<string, unknown> = {}) => {
    isLoading.value = true
    await new Promise(r => setTimeout(r, 800))

    // TODO: แทนด้วย → await $fetch(`/api/sites/${selectedSiteId.value}/history`)
    const now = new Date()
    now.setMinutes(Math.floor(now.getMinutes() / 10) * 10, 0, 0)
    const rnd = (b: number, r: number) => +(b + (Math.random() - 0.5) * r).toFixed(1)

    allData.value = Array.from({ length: 1000 }, (_, i) => {
      const t = new Date(now.getTime() - (999 - i) * 10 * 60_000)
      return {
        label:     `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`,
        timestamp: t,
        current:   { A: rnd(60,8),  B: rnd(62,7),  C: rnd(58,9)  },
        voltage:   { A: rnd(220,3), B: rnd(219,3), C: rnd(221,3) },
        power:     { A: rnd(12,2),  B: rnd(13,2),  C: rnd(11,2)  },
      }
    })

    isLoading.value = false
    hasData.value   = true
    await nextTick()
    init()
    refreshChart()
  }

  onMounted(() => {
    setTimeout(() => init(), 150)
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
    allData, latest, statistics, balanceData, unit, lastUpdateText,
    handleFilter,
  }
}