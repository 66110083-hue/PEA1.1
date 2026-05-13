import { ref, computed, type Ref } from 'vue'

export const useEnergyData = (activeMetric: Ref<string>, activePhases: Ref<string[]>, PHASES: any) => {
  const allData = ref<any[]>([])
  const isLoading = ref(false)

  const unit = computed(() => {
    const map: any = { current: 'A', voltage: 'V', power: 'kW' }
    return map[activeMetric.value] || ''
  })

 const lastUpdateText = computed(() => {
    if (allData.value.length === 0) return '--:--'
    
    const lastPoint = allData.value[allData.value.length - 1]
    if (!lastPoint || !lastPoint.timestamp) return '--:--'
    
    // แสดงผลเฉพาะ HH:mm เพื่อให้เข้ากับรอบข้อมูล 10 นาที
    return lastPoint.timestamp.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  })

  const latest = computed(() => {
    const last = allData.value.at(-1)
    if (!last) return { A: {current:0, voltage:0, power:0}, B: {current:0, voltage:0, power:0}, C: {current:0, voltage:0, power:0} }
    return PHASES.reduce((acc: any, p: any) => {
      acc[p.id] = { current: last.current[p.id], voltage: last.voltage[p.id], power: last.power[p.id] }
      return acc
    }, {})
  })

  const statistics = computed(() => {
    const key = activeMetric.value
    const vals = allData.value.flatMap(d => activePhases.value.map(ph => d[key][ph]))
    if (!vals.length) return []
    return [
      { label: 'ค่าเฉลี่ยรวม (1,000 จุด)', value: `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)} ${unit.value}` },
      { label: 'สูงสุด (Peak)', value: `${Math.max(...vals).toFixed(1)} ${unit.value}`, color: 'var(--color-red)' },
      { label: 'ต่ำสุด (Min)', value: `${Math.min(...vals).toFixed(1)} ${unit.value}`, color: 'var(--color-blue)' }
    ]
  })

  const balanceData = computed(() => {
    const key = activeMetric.value
    if (!allData.value.length) return []
    const avgs = PHASES.map((p: any) => ({
      ...p, avg: +(allData.value.reduce((s, b) => s + b[key][p.id], 0) / allData.value.length).toFixed(1)
    }))
    const max = Math.max(...avgs.map((a: any) => a.avg))
    return avgs.map((a: any) => ({ ...a, pct: max > 0 ? (a.avg / max) * 100 : 0 }))
  })

  return { allData, isLoading, latest, statistics, balanceData, unit, lastUpdateText }
}