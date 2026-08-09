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

// ─── ค่าเริ่มต้นช่วงวันที่: วันที่ 1 ของเดือนปัจจุบัน ถึง วันนี้ ─────
function getMonthStartISO(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}
function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function useDashboard(options: DashboardOptions = {}) {

  const activeMetric = ref('current')
  const { PHASES, activePhases, togglePhase } = usePhaseSelection()

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

  // ─── ช่วงวันที่ default ที่ใช้จริง (ให้ EnergyFilter ผูก init-date ตรงกับข้อมูลที่โหลด) ──
  const defaultStartDate = ref(getMonthStartISO())
  const defaultEndDate   = ref(getTodayISO())

  const hasData = computed(() => allData.value && allData.value.length > 0)

  const { init: initChart, refreshChart } = useEnergyChart(
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

    // ✅ ถ้าไม่ได้ส่ง startDate/endDate มา ใช้ค่า default (เดือนปัจจุบัน ถึง วันนี้)
    // แทนที่จะเป็น "วันนี้ถึงวันนี้" แบบเดิม ซึ่งมักไม่มีข้อมูลให้แสดง
    const startDateStr = filter.startDate || defaultStartDate.value
    const endDateStr   = filter.endDate   || defaultEndDate.value

    if (selectedSiteId.value) {
      await fetchEnergyData(selectedSiteId.value, startDateStr, endDateStr)
      await nextTick()
    } else {
      console.warn('[useDashboard] handleFilter: ไม่พบ siteId สำหรับ transformer', tid)
    }
  }

  onMounted(async () => {
    // ✅ ต้องสร้าง Chart.js instance ก่อน ไม่งั้น refreshChart() จะหา instance ไม่เจอตลอดไป
    await nextTick()
    initChart()

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

  // ✅ เดิม watch แค่ activeMetric/activePhases เฉยๆ พอข้อมูลโหลดเสร็จจาก fetchEnergyData()
  // แล้ว allData เปลี่ยนค่า ไม่มีอะไรสั่งให้กราฟ redraw เลย เพิ่ม watch(allData) เข้ามาด้วย
  watch(allData, refreshChart)
  watch([activeMetric, activePhases], refreshChart, { deep: true })

  return {
    activeMetric,
    activePhases,
    togglePhase,
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
    defaultStartDate,
    defaultEndDate,
    handleFilter,
    fetchEnergyData,
  }
}