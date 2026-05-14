import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { usePhaseSelection } from '~/composables/usePhaseSelection'
import { useEnergyData }     from '~/composables/useEnergyData'
import { useEnergyChart }    from '~/composables/useEnergyChart'

export const METRIC_TABS = [
  { key: 'current', label: 'Current (A)' },
  { key: 'voltage', label: 'Voltage (V)' },
  { key: 'power',   label: 'Power (kW)'  },
] as const

export type MetricKey = typeof METRIC_TABS[number]['key']

export function useDashboard() {
  // ─── State ─────────────────────────────────────────────
  const activeMetric = ref<MetricKey>('current')
  const hasData      = ref(false)
  let   autoRefreshTimer: ReturnType<typeof setInterval> | null = null

  // ─── Sub-composables ───────────────────────────────────
  const { PHASES, activePhases } = usePhaseSelection()

  const {
    allData, isLoading, latest,
    statistics, balanceData, unit, lastUpdateText,
  } = useEnergyData(activeMetric, activePhases, PHASES)

  const { init, refreshChart } = useEnergyChart(
    'historyLineChart', allData, activeMetric, activePhases, PHASES,
  )

  // ─── Data fetch / mock ─────────────────────────────────
  const handleFilter = async (_filter: Record<string, unknown> = {}) => {
    isLoading.value = true

    await new Promise(r => setTimeout(r, 800))

    const now = new Date()
    now.setMinutes(Math.floor(now.getMinutes() / 10) * 10, 0, 0)

    const rnd = (base: number, range: number) =>
      +(base + (Math.random() - 0.5) * range).toFixed(1)

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

  // ─── Auto-refresh every 10 min ─────────────────────────
  const startAutoRefresh = () => {
    autoRefreshTimer = setInterval(() => {
      if (allData.value.length > 0) handleFilter()
    }, 10 * 60 * 1000)
  }

  const stopAutoRefresh = () => {
    if (autoRefreshTimer) clearInterval(autoRefreshTimer)
  }

  // ─── Lifecycle ─────────────────────────────────────────
  onMounted(() => {
    setTimeout(() => init(), 150)
    startAutoRefresh()
  })

  onUnmounted(stopAutoRefresh)

  watch([activeMetric, activePhases], refreshChart)

  // ─── Expose ────────────────────────────────────────────
  return {
    // state
    activeMetric,
    activePhases,
    hasData,
    isLoading,
    // data
    PHASES,
    METRIC_TABS,
    allData,
    latest,
    statistics,
    balanceData,
    unit,
    lastUpdateText,
    // actions
    handleFilter,
  }
}