// composables/useDashboard.ts
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { usePhaseSelection }  from '~/composables/usePhaseSelection'
import { useEnergyData }      from '~/composables/useEnergyData'
import { useEnergyChart }     from '~/composables/useEnergyChart'
import { useTransformerData } from '~/composables/useSiteData'

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
  const { PHASES, activePhases } = usePhaseSelection()

  const {
    allData, isLoading,
    latest, statistics, balanceData,
    unit, lastUpdateText,
    selectedTransformerId,
    realtimeSnapshot,
    fetchEnergyData,
  } = useEnergyData(activeMetric, activePhases, PHASES)

  // ─── ใช้ allTransformers หา siteId จาก transformerId ──────
  const { allTransformers } = useTransformerData()

  const selectedSiteId = ref<string | null>(null)

  const hasData = computed(() => allData.value && allData.value.length > 0)

  const { refreshChart } = useEnergyChart(
    'historyLineChart',
    allData,
    activeMetric,
    activePhases,
    PHASES,
  )

  // ─── resolveS iteId: หา siteId จาก transformerId ──────────
  function resolveSiteId(transformerId: string): string | null {
    // transformerId ที่ส่งมาอาจเป็น device id (เช่น "7") หรือ "TF-7"
    const cleanId = transformerId.replace(/^TF-/i, '').trim()

    const transformer = allTransformers.find(t =>
      t.id === cleanId ||
      t.id === transformerId ||
      String(t.id) === cleanId
    )

    return transformer?.siteId ?? null
  }

  // ─── handleFilter ──────────────────────────────────────────
  const handleFilter = async (
    filter: any = {},
    transformerId?: string,
  ) => {
    // อัปเดต transformerId ถ้ามีส่งมา
    const tid = transformerId ?? selectedTransformerId.value ?? ''
    if (tid) selectedTransformerId.value = tid

    // หา siteId จาก filter หรือ resolve จาก transformerId
    if (filter.siteId) {
      selectedSiteId.value = filter.siteId
    } else if (tid && !selectedSiteId.value) {
      selectedSiteId.value = resolveSiteId(tid)
    }

    const startDateStr = filter.startDate || new Date().toISOString().split('T')[0]
    const endDateStr   = filter.endDate   || new Date().toISOString().split('T')[0]

    if (selectedSiteId.value) {
      await fetchEnergyData(selectedSiteId.value, startDateStr, endDateStr)
      await nextTick()
    } else {
      console.warn('[useDashboard] handleFilter: ไม่พบ siteId สำหรับ transformer', tid)
    }
  }

  onMounted(() => {
    if (options.transformerId) {
      selectedTransformerId.value = options.transformerId
      // resolve siteId ทันทีตอน mount
      const siteId = resolveSiteId(options.transformerId)
      if (siteId) selectedSiteId.value = siteId

      setTimeout(() => {
        handleFilter({}, options.transformerId)
      }, 150)
    }
  })

  watch([activeMetric, activePhases], refreshChart)

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
    fetchEnergyData,
  }
}