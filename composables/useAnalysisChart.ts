import { ref, computed, watch, onMounted } from 'vue'
import { allTransformers, allTransformerRealtime } from '@/composables/useSiteData'

// ─────────────────────────────────────────────
// Types (exported so components can import them)
// ─────────────────────────────────────────────
export interface ChartPoint { time: string; [key: string]: number | string }
export interface Series     { key: string; label: string; color: string; unit: string }

// ─────────────────────────────────────────────
// Constants (exported so components can use them)
// ─────────────────────────────────────────────
export const TOPICS = [
  { value: 'ev',   label: 'Analysis EV'                               },
  { value: 'pv',   label: 'Analysis PV'                               },
  { value: 'cu',   label: 'Analysis Transformer (Current-Unbalance)'  },
  { value: 'loss', label: 'Analysis Transformer (Loss Non-Technical)' },
]

export const PERIODS = [
  { value: 'current', label: 'Current' },
  { value: '1d',      label: '1 วัน'   },
  { value: '7d',      label: '7 วัน'   },
  { value: '30d',     label: '30 วัน'  },
]

export const SERIES_CONFIG: Record<string, Series[]> = {
  ev: [
    { key: 'importPower', label: 'Transformer: Total Flow Power (kW)',       color: '#E24B4A', unit: 'kW'  },
    { key: 'exportPower', label: 'Transformer: Balance Power (kW)',          color: '#3B82F6', unit: 'kW'  },
    { key: 'meterImport', label: 'Meter(s): Total Applicable Power (kW)',    color: '#10B981', unit: 'kW'  },
    { key: 'evLoad',      label: 'EV: Applicable Input Power (kW)',          color: '#F59E0B', unit: 'kW'  },
    { key: 'evEnergy',    label: 'EV: Electrical Consumption / Input (kWh)', color: '#8B5CF6', unit: 'kWh' },
  ],
  pv: [
    { key: 'pvExportA', label: 'Current Phase A (A)',    color: '#E24B4A', unit: 'A'  },
    { key: 'pvExportB', label: 'Current Phase B (A)',    color: '#3B82F6', unit: 'A'  },
    { key: 'pvExportC', label: 'Current Phase C (A)',    color: '#10B981', unit: 'A'  },
    { key: 'pvTotal',   label: 'Total Export Power (kW)',color: '#F59E0B', unit: 'kW' },
    { key: 'pvBalance', label: 'Balance Power (kW)',     color: '#8B5CF6', unit: 'kW' },
  ],
  cu: [
    { key: 'currentA', label: 'Current Phase A (A)',   color: '#E24B4A', unit: 'A' },
    { key: 'currentB', label: 'Current Phase B (A)',   color: '#3B82F6', unit: 'A' },
    { key: 'currentC', label: 'Current Phase C (A)',   color: '#10B981', unit: 'A' },
    { key: 'negSeq',   label: 'Negative Sequence (%)', color: '#F59E0B', unit: '%' },
  ],
  loss: [
    { key: 'importEnergy', label: 'Non-Technical Loss (kWh)', color: '#F59E0B', unit: 'kWh' },
  ],
}

// SVG canvas dimensions (shared across chart components)
export const CW    = 900
export const CH    = 200
export const MINI_H = 56
export const PAD   = { top: 12, right: 20, bottom: 28, left: 58 }

// ─────────────────────────────────────────────
// Composable
// ─────────────────────────────────────────────
export function useAnalysisChart() {

  // ── State ──────────────────────────────────
  const selectedTopic       = ref('ev')
  const selectedTransformer = ref('')
  const selectedPeriod      = ref('current')
  const startDate           = ref('')
  const endDate             = ref('')
  const isLoading           = ref(false)
  const hasGenerated        = ref(false)
  const chartData           = ref<ChartPoint[]>([])

  // ── Computed ───────────────────────────────
  const transformerOptions = computed(() =>
    allTransformers.map(t => ({ value: t.id, label: `${t.id} — ${t.location}` }))
  )

  const currentSeries = computed<Series[]>(
    () => SERIES_CONFIG[selectedTopic.value] ?? []
  )

  const selectedTopicLabel = computed(
    () => TOPICS.find(t => t.value === selectedTopic.value)?.label ?? ''
  )

  // ── Init ───────────────────────────────────
  onMounted(() => {
    const now  = new Date()
    endDate.value = now.toISOString().split('T')[0]
    const past = new Date(now)
    past.setDate(past.getDate() - 7)
    startDate.value = past.toISOString().split('T')[0]
    if (allTransformers.length) selectedTransformer.value = allTransformers[0].id
  })

  watch(selectedTopic, () => {
    hasGenerated.value = false
    chartData.value    = []
  })

  // ── Mock generator ─────────────────────────
  function generateTimeSeries(): ChartPoint[] {
    const rt = allTransformerRealtime.find(r => r.transformerId === selectedTransformer.value)
    if (!rt) return []
    const n = () => 0.82 + Math.random() * 0.36

    return Array.from({ length: 48 }, (_, i) => {
      const h = Math.floor(i / 2).toString().padStart(2, '0')
      const m = i % 2 === 0 ? '00' : '30'
      const p: ChartPoint = { time: `${h}:${m}` }

      switch (selectedTopic.value) {
        case 'ev':
          p.importPower = +(rt.totalActivePowerImport  * n()).toFixed(2)
          p.exportPower = +(rt.totalActivePowerExport  * n()).toFixed(2)
          p.meterImport = +(rt.totalActivePowerImport  * 0.9 * n()).toFixed(2)
          p.evLoad      = +(rt.totalActivePowerImport  * 0.3 * n()).toFixed(2)
          p.evEnergy    = +(rt.importActiveEnergy      * 0.01 * n()).toFixed(2)
          break
        case 'pv':
          p.pvExportA   = +(rt.activePowerExportA      * n()).toFixed(2)
          p.pvExportB   = +(rt.activePowerExportB      * n()).toFixed(2)
          p.pvExportC   = +(rt.activePowerExportC      * n()).toFixed(2)
          p.pvTotal     = +(rt.totalActivePowerExport  * n()).toFixed(2)
          p.pvBalance   = +(rt.totalActivePowerImport  * 0.2 * n()).toFixed(2)
          break
        case 'cu':
          p.currentA    = +(rt.currentA                        * n()).toFixed(2)
          p.currentB    = +(rt.currentB                        * n()).toFixed(2)
          p.currentC    = +(rt.currentC                        * n()).toFixed(2)
          p.negSeq      = +(rt.negativeSequenceCurrentRatio    * n() * 10).toFixed(3)
          break
        case 'loss':
          p.importEnergy = +(rt.importActiveEnergy * 0.005 * n()).toFixed(2)
          break
      }
      return p
    })
  }

  // ── Actions ────────────────────────────────
  async function handleGenerate() {
    if (!selectedTransformer.value) return
    isLoading.value    = true
    hasGenerated.value = false
    await new Promise(r => setTimeout(r, 500))
    chartData.value    = generateTimeSeries()
    hasGenerated.value = true
    isLoading.value    = false
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

  // ── SVG helpers ────────────────────────────
  function minMax(key: string) {
    const vals = chartData.value.map(p => p[key] as number).filter(v => !isNaN(v))
    const min  = Math.min(...vals)
    const max  = Math.max(...vals)
    return { min, max: max === min ? max + 1 : max }
  }

  function toX(i: number, total = chartData.value.length) {
    return PAD.left + (i / (total - 1)) * (CW - PAD.left - PAD.right)
  }

  function toY(val: number, min: number, max: number) {
    return PAD.top + (1 - (val - min) / (max - min)) * (CH - PAD.top - PAD.bottom)
  }

  function linePath(key: string) {
    const { min, max } = minMax(key)
    return chartData.value
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p[key] as number, min, max).toFixed(1)}`)
      .join(' ')
  }

  function areaPath(key: string) {
    const { min, max } = minMax(key)
    const bottom = CH - PAD.bottom
    const pts    = chartData.value
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p[key] as number, min, max).toFixed(1)}`)
      .join(' ')
    const last = toX(chartData.value.length - 1)
    return `${pts} L${last.toFixed(1)},${bottom} L${toX(0).toFixed(1)},${bottom} Z`
  }

  function xLabels() {
    const step = Math.max(1, Math.floor(chartData.value.length / 8))
    return chartData.value
      .filter((_, i) => i % step === 0)
      .map((p, idx) => ({ x: toX(idx * step), label: p.time as string }))
  }

  function yLabels(key: string, steps = 4) {
    const { min, max } = minMax(key)
    return Array.from({ length: steps + 1 }, (_, i) => {
      const val = min + ((max - min) / steps) * i
      return { y: toY(val, min, max), label: val.toFixed(1) }
    })
  }

  function miniPath(key: string) {
    const { min, max } = minMax(key)
    const sPad = { top: 4, bottom: 4 }
    const toMY = (v: number) =>
      sPad.top + (1 - (v - min) / (max - min)) * (MINI_H - sPad.top - sPad.bottom)
    return chartData.value
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toMY(p[key] as number).toFixed(1)}`)
      .join(' ')
  }

  function buildBars(key: string) {
    const vals = chartData.value.map(p => p[key] as number)
    const max  = Math.max(...vals) || 1
    const bw   = Math.max(1, (CW - PAD.left - PAD.right) / vals.length - 1)
    return vals.map((v, i) => {
      const h = (v / max) * (CH - PAD.top - PAD.bottom)
      return { x: PAD.left + i * (bw + 1), y: CH - PAD.bottom - h, w: bw, h }
    })
  }

  // ── Return ─────────────────────────────────
  return {
    // state
    selectedTopic, selectedTransformer, selectedPeriod,
    startDate, endDate, isLoading, hasGenerated, chartData,
    // computed
    transformerOptions, currentSeries, selectedTopicLabel,
    // actions
    handleGenerate, handleExport,
    // svg helpers
    linePath, areaPath, xLabels, yLabels, miniPath, buildBars,
  }
}