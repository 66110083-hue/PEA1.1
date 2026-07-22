import { ref, computed, watch } from 'vue'
import { allTransformers } from '@/composables/useSiteData'

export interface ChartPoint { time: string; timestamp: Date; [key: string]: number | string | Date }
export interface Series     { key: string; label: string; color: string; unit: string }
export interface EChartsDataset {
  name:     string
  data:     number[]
  color?:   string
  showArea?: boolean
}

export const TOPICS = [
  { value: 'ev',   label: 'Total Power (kW)'      },
  { value: 'pv',   label: 'Phase Current & Power' },
  { value: 'cu',   label: 'Current Unbalance (%)' },
  { value: 'loss', label: 'Reactive Power & PF'   },
]

export const PERIODS = [
  { value: 'current', label: 'Current' },
  { value: '1d',      label: '1 วัน'   },
  { value: '7d',      label: '7 วัน'   },
  { value: '30d',     label: '30 วัน'  },
]

// ─── เฉพาะ field ที่มีข้อมูลจริงจาก /api/measure เท่านั้น ─────────
export const SERIES_CONFIG: Record<string, Series[]> = {
  ev: [
    { key: 'totalPower', label: 'Total Active Power (kW)', color: '#E24B4A', unit: 'kW' },
  ],
  pv: [
    { key: 'currentA',   label: 'Current Phase A (A)',     color: '#E24B4A', unit: 'A'  },
    { key: 'currentB',   label: 'Current Phase B (A)',     color: '#3B82F6', unit: 'A'  },
    { key: 'currentC',   label: 'Current Phase C (A)',     color: '#10B981', unit: 'A'  },
    { key: 'totalPower', label: 'Total Active Power (kW)', color: '#F59E0B', unit: 'kW' },
  ],
  cu: [
    { key: 'currentA', label: 'Current Phase A (A)',    color: '#E24B4A', unit: 'A' },
    { key: 'currentB', label: 'Current Phase B (A)',    color: '#3B82F6', unit: 'A' },
    { key: 'currentC', label: 'Current Phase C (A)',    color: '#10B981', unit: 'A' },
    { key: 'negSeq',   label: 'Current Unbalance (%)',  color: '#F59E0B', unit: '%' },
  ],
  loss: [
    { key: 'reactivePower', label: 'Reactive Power (kVAR)', color: '#3B82F6', unit: 'kVAR' },
    { key: 'apparentPower', label: 'Apparent Power (kVA)',  color: '#8B5CF6', unit: 'kVA'  },
    { key: 'powerFactor',   label: 'Power Factor',          color: '#F59E0B', unit: ''     },
  ],
}

// ─── helpers ──────────────────────────────────────────────
function toApiDateFormat(isoDate: string): string {
  const [y, m, d] = isoDate.split('-')
  return `${+d}/${+m}/${y}`
}

function toNum(v: unknown): number {
  if (v === null || v === undefined) return 0
  const s = String(v).trim().toLowerCase()
  if (s === 'nan' || s === '') return 0
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

function parseApiTimestamp(ts: string): Date {
  return new Date(ts.replace(' ', 'T'))
}

function calcCurrentUnbalance(a: number, b: number, c: number): number {
  const avg = (a + b + c) / 3
  if (avg <= 0) return 0
  const maxDev = Math.max(Math.abs(a - avg), Math.abs(b - avg), Math.abs(c - avg))
  return +((maxDev / avg) * 100).toFixed(2)
}

function resolveSiteId(transformerId: string): string | null {
  const cleanId = transformerId.replace(/^TF-/i, '').trim()
  const transformer = allTransformers.find((t: any) =>
    t.id === cleanId || t.id === transformerId || String(t.id) === cleanId
  )
  return (transformer as any)?.siteId ?? null
}

export function useAnalysisChart() {
  // ─── ย้ายมาประกาศข้างในฟังก์ชัน เพื่อป้องกัน Error เรื่อง Nuxt Instance ───
  const config = useRuntimeConfig()
  const BASE_URL = config.public.apiBaseUrl

  const selectedTopic       = ref('ev')
  const selectedTransformer = ref('')
  const selectedPeriod      = ref('current')
  const isLoading           = ref(false)
  const hasGenerated        = ref(false)
  const chartData           = ref<ChartPoint[]>([])
  const fetchError          = ref<string | null>(null)

  const transformerOptions = computed(() =>
    allTransformers.map((t: any) => ({ value: t.id, label: `${t.id} — ${t.location}` }))
  )

  const currentSeries = computed<Series[]>(
    () => SERIES_CONFIG[selectedTopic.value] ?? []
  )

  const selectedTopicLabel = computed(
    () => TOPICS.find(t => t.value === selectedTopic.value)?.label ?? ''
  )

  const chartLabels = computed<string[]>(
    () => chartData.value.map(d => d.time as string)
  )

  const echartsDatasets = computed<EChartsDataset[]>(() =>
    currentSeries.value.map(s => ({
      name:     s.label,
      color:    s.color,
      showArea: selectedTopic.value !== 'loss',
      data:     chartData.value.map(d => d[s.key] as number),
    }))
  )

  watch(selectedTopic, () => {
    hasGenerated.value = false
    chartData.value    = []
  })

  async function fetchRealData(
    siteId: string,
    startDate: string,
    endDate:   string,
  ): Promise<ChartPoint[]> {
    const params = new URLSearchParams({
      source: 'site',
      siteid: String(siteId),
      start:  toApiDateFormat(startDate),
      end:    toApiDateFormat(endDate),
    })

    const res  = await fetch(`${BASE_URL}/api/measure?${params.toString()}`)
    const json = await res.json()

    if (!['success', 'susscess'].includes(json.status) || !Array.isArray(json.msg)) {
      return []
    }

    const columns: Record<string, string[]> = {}
    for (const col of json.msg) {
      columns[col.label] = col.data
    }

    const timestamps = columns['timestamp'] ?? []
    const multiDay    = startDate !== endDate

    return timestamps.map((ts, i) => {
      const t = parseApiTimestamp(ts)

      const iA = toNum(columns['I_A']?.[i])
      const iB = toNum(columns['I_B']?.[i])
      const iC = toNum(columns['I_C']?.[i])

      const pTotal = toNum(columns['P_Total']?.[i])

      const hh = String(t.getHours()).padStart(2, '0')
      const mm = String(t.getMinutes()).padStart(2, '0')
      const dd = String(t.getDate()).padStart(2, '0')
      const mo = String(t.getMonth() + 1).padStart(2, '0')

      return {
        time:       multiDay ? `${dd}/${mo} ${hh}:${mm}` : `${hh}:${mm}`,
        timestamp: t,
        currentA:  iA,
        currentB:  iB,
        currentC:  iC,
        totalPower:    pTotal,
        negSeq:        calcCurrentUnbalance(iA, iB, iC),
        reactivePower: toNum(columns['Q_Total']?.[i]),
        apparentPower: toNum(columns['S_Total']?.[i]),
        powerFactor:   toNum(columns['PF']?.[i]),
      }
    })
  }

  async function handleGenerate(payload: { startDate: string; endDate: string }) {
    if (!selectedTransformer.value) return

    isLoading.value    = true
    hasGenerated.value = false
    fetchError.value   = null

    const siteId = resolveSiteId(selectedTransformer.value)

    if (!siteId) {
      console.warn('[useAnalysisChart] ไม่พบ siteId สำหรับ transformer', selectedTransformer.value)
      fetchError.value = 'ไม่พบข้อมูล site สำหรับหม้อแปลงนี้'
      chartData.value  = []
      isLoading.value  = false
      hasGenerated.value = true
      return
    }

    try {
      chartData.value = await fetchRealData(siteId, payload.startDate, payload.endDate)
    } catch (e) {
      console.error('[useAnalysisChart] fetchRealData failed', e)
      fetchError.value = 'ดึงข้อมูลไม่สำเร็จ'
      chartData.value  = []
    } finally {
      hasGenerated.value = true
      isLoading.value    = false
    }
  }

  function handleExport() {
    if (!chartData.value.length) return
    const s      = currentSeries.value
    const header = ['time', ...s.map(x => x.label)].join(',')
    const rows   = chartData.value.map(p =>
      ['time', ...s.map(x => x.key)].map(k => p[k] ?? '').join(',')
    )
    const csv  = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), {
      href: url,
      download: `analysis_${selectedTopic.value}_${selectedTransformer.value}.csv`,
    }).click()
    URL.revokeObjectURL(url)
  }

  return {
    selectedTopic, selectedTransformer, selectedPeriod,
    isLoading, hasGenerated, chartData, fetchError,
    transformerOptions, currentSeries, selectedTopicLabel,
    chartLabels, echartsDatasets,
    handleGenerate, handleExport,
  }
}