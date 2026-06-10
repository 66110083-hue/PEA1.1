// composables/useDashboard.ts
import { ref, computed, watch, nextTick, onMounted } from 'vue'
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
  
  const { PHASES, activePhases } = usePhaseSelection()

  // 1. ดึงข้อมูลและฟังก์ชันยิง API มาจาก useEnergyData
  const {
    allData,
    isLoading,
    latest,
    statistics,
    balanceData,
    unit,
    lastUpdateText,
    selectedTransformerId,
    realtimeSnapshot,
    fetchEnergyData, // 🟢 เอาตัวนี้มาใช้ยิง API จริง
  } = useEnergyData(activeMetric, activePhases, PHASES)

  // 2. State สำหรับเก็บ ID จุดติดตั้ง
  const selectedSiteId = ref<string | null>(null)
  
  // 3. เช็คว่ามีข้อมูลหรือไม่ จากความยาวของ Array
  const hasData = computed(() => allData.value && allData.value.length > 0)

  const { refreshChart } = useEnergyChart(
    'historyLineChart',
    allData,
    activeMetric,
    activePhases,
    PHASES,
  )

  // ─────────────────────────────────────────────
  // 🟢 handleFilter: รับค่าจากปุ่มดึงข้อมูล แล้วสั่งยิง API
  // ─────────────────────────────────────────────
  const handleFilter = async (
    filter: any = {}, 
    transformerId?: string,
  ) => {

    if (transformerId) {
      selectedTransformerId.value = transformerId
    }

    if (filter.siteId) {
      selectedSiteId.value = filter.siteId
    }

    // ดึงวันที่จาก filter (ถ้าไม่มีให้ใช้วันนี้)
    const startDateStr = filter.startDate || new Date().toISOString().split('T')[0]
    const endDateStr = filter.endDate || new Date().toISOString().split('T')[0]

    // 🟢 ถ้ามี Site ID ให้ดึงข้อมูลกราฟจากเซิร์ฟเวอร์
    if (selectedSiteId.value) {
      await fetchEnergyData(selectedSiteId.value, startDateStr, endDateStr)
      await nextTick()
    }
  }

  onMounted(() => {
    // โหลดครั้งแรกถ้ามีการระบุ ID มา
    if (options.transformerId) {
      selectedTransformerId.value = options.transformerId
      setTimeout(() => {
        handleFilter({}, options.transformerId)
      }, 150)
    }
    
    // 🔴 โค้ด Auto Refresh ถูกลบทิ้งถาวร เพื่อป้องกัน API สแปม
  })

  // เมื่อเปลี่ยนแท็บ กระแส/แรงดัน/พลังงาน ให้วาดกราฟใหม่
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
    fetchEnergyData
  }
}