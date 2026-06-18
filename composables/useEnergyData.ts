// composables/useEnergyData.ts
import { ref, computed, type Ref } from 'vue'
import { allTransformerRealtime }  from './useSiteData'
import type { TransformerRealtime } from './useSiteData'

const BASE_URL = 'https://greatways.net'

export const useEnergyData = (
  activeMetric:  Ref<string>,
  activePhases:  Ref<string[]>,
  PHASES:        any,
) => {
  const allData               = ref<any[]>([])
  const isLoading              = ref(false)
  const selectedTransformerId = ref<string | null>(null)

  const realtimeSnapshot = computed<TransformerRealtime | null>(() => {
    if (!selectedTransformerId.value) return null
    return allTransformerRealtime.find(
      r => r.transformerId === selectedTransformerId.value
    ) ?? null
  })

  const unit = computed(() => {
    const map: Record<string, string> = { current: 'A', voltage: 'V', power: 'kW' }
    return map[activeMetric.value] ?? ''
  })

  const lastUpdateText = computed(() => {
    if (!allData.value.length) return '--:--'
    const last = allData.value.at(-1)
    if (!last?.timestamp) return '--:--'
    return (last.timestamp as Date).toLocaleTimeString('th-TH', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
  })

  const latest = computed(() => {
    const snap = realtimeSnapshot.value
    if (snap) {
      return {
        A: { current: snap.currentA, voltage: snap.voltageA, power: snap.activePowerImportA },
        B: { current: snap.currentB, voltage: snap.voltageB, power: snap.activePowerImportB },
        C: { current: snap.currentC, voltage: snap.voltageC, power: snap.activePowerImportC },
      }
    }
    const last = allData.value.at(-1)
    if (!last) {
      return {
        A: { current: 0, voltage: 0, power: 0 },
        B: { current: 0, voltage: 0, power: 0 },
        C: { current: 0, voltage: 0, power: 0 },
      }
    }
    return PHASES.reduce((acc: any, p: any) => {
      acc[p.id] = {
        current: last.current[p.id],
        voltage: last.voltage[p.id],
        power:   last.power[p.id],
      }
      return acc
    }, {})
  })

  const statistics = computed(() => {
    const key  = activeMetric.value
    const vals = allData.value.flatMap(d =>
      activePhases.value.map(ph => d[key]?.[ph] ?? 0)
    )
    if (!vals.length) return []
    const sum = vals.reduce((a, b) => a + b, 0)
    return [
      { label: 'ค่าเฉลี่ยรวม (1,000 จุด)', value: `${(sum / vals.length).toFixed(1)} ${unit.value}` },
      { label: 'สูงสุด (Peak)',             value: `${Math.max(...vals).toFixed(1)} ${unit.value}`, color: 'var(--color-red)'  },
      { label: 'ต่ำสุด (Min)',              value: `${Math.min(...vals).toFixed(1)} ${unit.value}`, color: 'var(--color-blue)' },
    ]
  })

  const balanceData = computed(() => {
    const key = activeMetric.value
    if (!allData.value.length) return []
    const avgs = PHASES.map((p: any) => ({
      ...p,
      avg: +(
        allData.value.reduce((s: number, d: any) => s + (d[key]?.[p.id] ?? 0), 0) /
        allData.value.length
      ).toFixed(1),
    }))
    const max = Math.max(...avgs.map((a: any) => a.avg))
    return avgs.map((a: any) => ({ ...a, pct: max > 0 ? (a.avg / max) * 100 : 0 }))
  })

  function seedFromRealtime() {
    const snap = realtimeSnapshot.value
    if (!snap) return

    const base = {
      current: { A: snap.currentA,          B: snap.currentB,          C: snap.currentC          },
      voltage: { A: snap.voltageA,           B: snap.voltageB,          C: snap.voltageC           },
      power:   { A: snap.activePowerImportA, B: snap.activePowerImportB, C: snap.activePowerImportC },
    }

    const now = new Date()
    now.setMinutes(Math.floor(now.getMinutes() / 10) * 10, 0, 0)

    const jitter = (v: number, pct = 0.05) =>
      +(v * (1 + (Math.random() - 0.5) * pct)).toFixed(1)

    allData.value = Array.from({ length: 1000 }, (_, i) => {
      const t = new Date(now.getTime() - (999 - i) * 10 * 60_000)
      return {
        label:     `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`,
        timestamp: t,
        current:   { A: jitter(base.current.A), B: jitter(base.current.B), C: jitter(base.current.C) },
        voltage:   { A: jitter(base.voltage.A, 0.01), B: jitter(base.voltage.B, 0.01), C: jitter(base.voltage.C, 0.01) },
        power:     { A: jitter(base.power.A),   B: jitter(base.power.B),   C: jitter(base.power.C)   },
      }
    })
  }

  // ─────────────────────────────────────────────────────────
  // 🟢 fetchEnergyData: เรียก GET /api/measure จริง
  // ─────────────────────────────────────────────────────────

  // API ต้องการ "d/m/yyyy" — แปลงจาก "yyyy-mm-dd" (ที่ useDashboard.ts ส่งมา)
  function toApiDateFormat(isoDate: string): string {
    const [y, m, d] = isoDate.split('-')
    return `${+d}/${+m}/${y}` // ตัด leading zero ออกตามตัวอย่าง 17/6/2026
  }

  // แปลง "nan" หรือค่าว่าง → 0, string number → number
  function toNum(v: unknown): number {
    if (v === null || v === undefined) return 0
    const s = String(v).trim().toLowerCase()
    if (s === 'nan' || s === '') return 0
    const n = parseFloat(s)
    return Number.isFinite(n) ? n : 0
  }

  // แปลง "YYYY-MM-DD HH:mm:ss" → Date object
  function parseApiTimestamp(ts: string): Date {
    // รูปแบบนี้ JS แปลงตรงได้ถ้าเปลี่ยนช่องว่างเป็น "T"
    return new Date(ts.replace(' ', 'T'))
  }

  async function fetchEnergyData(
    siteId: string | number,
    startDate: string, // คาดว่าเป็น "yyyy-mm-dd"
    endDate:   string, // คาดว่าเป็น "yyyy-mm-dd"
  ) {
    isLoading.value = true
    try {
      const params = new URLSearchParams({
        source: 'site',
        siteid: String(siteId),
        start:  toApiDateFormat(startDate),
        end:    toApiDateFormat(endDate),
      })

      const res  = await fetch(`${BASE_URL}/api/measure?${params.toString()}`)
      const json = await res.json()

      if (json.status !== 'susscess' || !Array.isArray(json.msg)) {
        allData.value = []
        return
      }

      // ── แปลง column-based → lookup table ตาม label ──────
      const columns: Record<string, string[]> = {}
      for (const col of json.msg) {
        columns[col.label] = col.data
      }

      const timestamps = columns['timestamp'] ?? []

      allData.value = timestamps.map((ts, i) => {
        const t = parseApiTimestamp(ts)

        const vA = toNum(columns['V_A']?.[i])
        const vB = toNum(columns['V_B']?.[i])
        const vC = toNum(columns['V_C']?.[i])

        const iA = toNum(columns['I_A']?.[i])
        const iB = toNum(columns['I_B']?.[i])
        const iC = toNum(columns['I_C']?.[i])

        // API มีแค่ P_Total (ไม่แยกราย phase) → หารเฉลี่ย 3 phase
        const pTotal  = toNum(columns['P_Total']?.[i])
        const pPerPhase = +(pTotal / 3).toFixed(2)

        return {
          label:     `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`,
          timestamp: t,
          voltage:   { A: vA, B: vB, C: vC },
          current:   { A: iA, B: iB, C: iC },
          power:     { A: pPerPhase, B: pPerPhase, C: pPerPhase },
          // เก็บค่ารวมไว้เผื่อใช้ทีหลัง (เช่นแสดง Total แยกจาก per-phase)
          powerTotal:    pTotal,
          reactiveTotal: toNum(columns['Q_Total']?.[i]),
          apparentTotal: toNum(columns['S_Total']?.[i]),
          powerFactor:   toNum(columns['PF']?.[i]),
        }
      })
    } catch (e) {
      console.error('[useEnergyData] fetchEnergyData failed', e)
      allData.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    allData, isLoading,
    selectedTransformerId,
    realtimeSnapshot,
    latest, statistics, balanceData,
    unit, lastUpdateText,
    seedFromRealtime,
    fetchEnergyData,
  }
}