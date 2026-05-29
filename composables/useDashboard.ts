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
    filter: any = {}, // 🟢 เปลี่ยนมารับค่า filter จากหน้าจอ
    transformerId?: string,
  ) => {

    if (transformerId) {
      selectedTransformerId.value = transformerId
    }

    isLoading.value = true
    seedFromRealtime()

    // จำลอง delay ในการโหลดข้อมูลจริงจาก API
    await new Promise(r => setTimeout(r, 600))

    // 🟢 1. ดึงวันที่จาก filter (ถ้าไม่มีให้ใช้วันนี้เป็นค่าเริ่มต้น)
   // 🟢 1. ดึงวันที่จาก filter
    const startDateStr = filter.startDate || new Date().toISOString().split('T')[0]
    const endDateStr = filter.endDate || new Date().toISOString().split('T')[0]

    // 🟢 2. แปลงเป็น Timestamp
    const startTime = new Date(`${startDateStr}T00:00:00`).getTime()
    let endTime = new Date(`${endDateStr}T23:59:59`).getTime()

    const currentTime = new Date().getTime()
    if (endTime > currentTime) {
      endTime = currentTime // ดักไม่ให้ทะลุไปอนาคต
    }

    if (endTime <= startTime) {
      endTime = startTime + (10 * 60 * 1000)
    }

    // 🔥 3. สิ่งที่เปลี่ยน: กำหนดระยะห่างเป็น 10 นาทีเป๊ะๆ (10 นาที * 60 วินาที * 1000 มิลลิวินาที)
    const intervalMs = 10 * 60 * 1000 
    
    // คำนวณว่าช่วงเวลาที่เลือก จะมีทั้งหมดกี่จุด (เช่น 1 วัน = 144 จุด)
    const pointCount = Math.floor((endTime - startTime) / intervalMs) + 1

    const rnd = (b: number, r: number) => +(b + (Math.random() - 0.5) * r).toFixed(1)

    // 🔥 4. สร้าง Array ตามจำนวนจุดที่คำนวณได้
    allData.value = Array.from({ length: pointCount }, (_, i) => {
      
      // เวลาของแต่ละจุด = เวลาเริ่มต้น + (จำนวนรอบ * 10 นาที)
      const t = new Date(startTime + (i * intervalMs))

      const dd = String(t.getDate()).padStart(2, '0')
      const mm = String(t.getMonth() + 1).padStart(2, '0')
      const HH = String(t.getHours()).padStart(2, '0')
      const min = String(t.getMinutes()).padStart(2, '0')

      return {
        label: `${dd}/${mm} ${HH}:${min}`, // จะออกมาเป็น xx/xx 00:00, 00:10, 00:20 แน่นอน
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
    // init()
    // refreshChart()
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

      ////setTimeout(() => init(), 150)
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