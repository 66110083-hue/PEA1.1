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

  // ─── 1. ตัวแปรช่วยหา "เม็ดข้อมูลสุดท้ายของวันนั้นที่มีการใช้ไฟจริงๆ" ───
  const lastActivePoint = computed(() => {
    if (!allData.value || !allData.value.length) return null

    // วิ่งจากขวาไปซ้าย (reverse) เพื่อหาจุดแรกที่กระแสไฟไม่เป็น 0
    const activePoints = [...allData.value].reverse()
    return activePoints.find(d => 
      (d.current?.A ?? 0) > 0 || 
      (d.current?.B ?? 0) > 0 || 
      (d.current?.C ?? 0) > 0 || 
      (d.powerTotal ?? 0) > 0
    ) || allData.value.at(-1) // ถ้าหาไม่เจอจริงๆ ค่อยเอาเม็ดขวาสุด
  })

  // ─── 2. แปลงข้อความหัวการ์ดให้ออกมาเป็น วัน/เดือน/ปี + เวลา ───
  const lastUpdateText = computed(() => {
    const snap = realtimeSnapshot.value
    const rawDate = snap ? new Date() : lastActivePoint.value?.timestamp

    if (!rawDate) return '--/--/---- --:--'

    const d = new Date(rawDate)
    if (isNaN(d.getTime())) return '--/--/---- --:--'

    const day   = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year  = d.getFullYear() // ค.ศ. เช่น 2026
    const hours = String(d.getHours()).padStart(2, '0')
    const mins  = String(d.getMinutes()).padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${mins} น.`
  })

  // ─── 3. ดึงตัวเลข A, B, C มาจาก lastActivePoint ตัวเดียวกันเป๊ะ ───
  const latest = computed(() => {
    const snap = realtimeSnapshot.value
    if (snap) {
      return {
        A: { current: snap.currentA, voltage: snap.voltageA, power: snap.activePowerImportA },
        B: { current: snap.currentB, voltage: snap.voltageB, power: snap.activePowerImportB },
        C: { current: snap.currentC, voltage: snap.voltageC, power: snap.activePowerImportC },
      }
    }

    const point = lastActivePoint.value
    if (!point) {
      return {
        A: { current: 0, voltage: 0, power: 0 },
        B: { current: 0, voltage: 0, power: 0 },
        C: { current: 0, voltage: 0, power: 0 },
      }
    }

    return PHASES.reduce((acc: any, p: any) => {
      acc[p.id] = {
        current: point.current?.[p.id] ?? 0,
        voltage: point.voltage?.[p.id] ?? 0,
        power:   point.power?.[p.id]   ?? 0,
      }
      return acc
    }, {})
  })

  // ─── 4. สถิติประมวลผล (แสดงค่าวิเคราะห์เชิงลึก พร้อม วันที่และเวลา) ───
  const statistics = computed(() => {
    const key = activeMetric.value
    if (!allData.value.length) return []

    // ฟังก์ชันช่วยจัด Format วันที่เวลาให้เป็น DD/MM HH:mm
    const fmtDT = (date: Date) => {
      const d = String(date.getDate()).padStart(2, '0')
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const hh = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')
      return `${d}/${m} ${hh}:${mm}`
    }

    // 4.1 หาค่าเฉลี่ยช่วงใช้งาน (Active Avg)
    const activeVals = allData.value
      .flatMap(d => [d[key]?.A, d[key]?.B, d[key]?.C])
      .filter(v => v > 0.5)
    
    const avgActive = activeVals.length ? (activeVals.reduce((a, b) => a + b, 0) / activeVals.length) : 0

    // 4.2 หาค่า Peak พร้อมเวลาและเฟส
    let maxVal = -1
    let peakInfo = ''
    let peakTime = ''
    
    allData.value.forEach(d => {
      ['A', 'B', 'C'].forEach(ph => {
        const val = d[key]?.[ph] ?? 0
        if (val > maxVal) {
          maxVal = val
          peakInfo = ` (เฟส ${ph})`
          peakTime = fmtDT(new Date(d.timestamp))
        }
      })
    })

    // 4.3 หาความไม่สมดุลสูงสุด (Unbalance/Sag) พร้อมเวลา
    let unbalanceVal = 0
    let unbalanceTime = ''
    let unbalanceLabel = key === 'voltage' ? 'แรงดันตกต่ำสุด (Sag)' : 'ส่วนต่างกระแสสูงสุด'
    let unbalanceColor = 'var(--color-blue)'

    if (key === 'voltage') {
       unbalanceVal = 999 // เริ่มต้นด้วยค่าสูงไว้ก่อน
       allData.value.forEach(d => {
         const vs = [d[key]?.A ?? 0, d[key]?.B ?? 0, d[key]?.C ?? 0].filter(v => v > 100)
         if (vs.length > 0) {
           const min = Math.min(...vs)
           if (min < unbalanceVal) {
             unbalanceVal = min
             unbalanceTime = fmtDT(new Date(d.timestamp))
           }
         }
       })
       unbalanceColor = unbalanceVal < 200 ? 'var(--color-orange)' : 'var(--color-blue)'
    } else {
       allData.value.forEach(d => {
         const a = d[key]?.A ?? 0, b = d[key]?.B ?? 0, c = d[key]?.C ?? 0
         if (Math.max(a, b, c) > 1) { 
            const diff = Math.max(a, b, c) - Math.min(a, b, c)
            if (diff > unbalanceVal) {
              unbalanceVal = diff
              unbalanceTime = fmtDT(new Date(d.timestamp))
            }
         }
       })
       unbalanceColor = unbalanceVal > 10 ? 'var(--color-orange)' : 'var(--color-blue)'
    }

    return [
      { 
        label: 'ค่าเฉลี่ยช่วงใช้งาน', 
        value: `${avgActive.toFixed(1)} ${unit.value}` 
      },
      { 
        label: `สูงสุด (Peak)`, 
        value: `${maxVal.toFixed(1)} ${unit.value}`,
        sub: `${peakInfo} ${peakTime}`, // ส่งเวลาไปให้หน้า Vue
        color: 'var(--color-red)'  
      },
      { 
        label: unbalanceLabel,  
        value: `${unbalanceVal.toFixed(1)} ${key === 'voltage' ? unit.value : ''}`,
        sub: unbalanceTime, // ส่งเวลาไปให้หน้า Vue
        color: unbalanceColor 
      },
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

  // API ต้องการ "d/m/yyyy" — แปลงจาก "yyyy-mm-dd"
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

  async function fetchEnergyData(
    siteId: string | number,
    startDate: string, 
    endDate:   string, 
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

      // ดักเผื่อ API ตอบกลับมาเป็น success หรือ susscess (สะกดผิด) ได้ทั้งคู่
      if (!['success', 'susscess'].includes(json.status) || !Array.isArray(json.msg)) {
        allData.value = []
        return
      }

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

        // เช็คค่าดิบ P_Total ถ้าเป็น 'nan' ให้คืนค่าเป็น null เพื่อไม่ให้ระบบเอา 0 ไปปะปน
        const rawPTotal = columns['P_Total']?.[i]
        const pTotal = (rawPTotal === 'nan' || rawPTotal === null || rawPTotal === undefined) ? null : Number(rawPTotal)

        return {
          label: `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`,
          timestamp: t,
          voltage: { A: vA, B: vB, C: vC },
          current: { A: iA, B: iB, C: iC },
          power: { 
            A: toNum(columns['P_A']?.[i]), 
            B: toNum(columns['P_B']?.[i]), 
            C: toNum(columns['P_C']?.[i]) 
          }, 
          powerTotal: pTotal, // ส่งค่าดิบตรงๆ (ถ้าเป็น nan จะเป็น null ให้กราฟเว้นว่าง ไม่ดีดไป 8.5)
          reactiveTotal: toNum(columns['Q_Total']?.[i]),
          apparentTotal: toNum(columns['S_Total']?.[i]),
          powerFactor: toNum(columns['PF']?.[i]),
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