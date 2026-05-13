// composables/useMockData.ts
// Mock data layer — swap each function for real API calls later

export function useMockData() {
  // --- SITES ---
  const sites = [
    { id: 'MTR-001', name: 'โรงงาน A', status: 'online', kw: 38.5, lat: 13.7600, lng: 100.5000 },
    { id: 'MTR-002', name: 'โรงงาน B', status: 'alert',  kw: 25.1, lat: 13.7550, lng: 100.5000 },
    { id: 'MTR-003', name: 'อาคาร C',  status: 'online', kw: 44.2, lat: 13.7620, lng: 100.4950 },
    { id: 'MTR-004', name: 'คลังสินค้า D', status: 'offline', kw: 0, lat: 13.7580, lng: 100.5120 },
    { id: 'MTR-005', name: 'อาคาร E',  status: 'online', kw: 31.8, lat: 13.7490, lng: 100.4780 },
    { id: 'MTR-006', name: 'สำนักงาน F', status: 'online', kw: 18.4, lat: 13.7700, lng: 100.6000 },
  ]

  const siteStatusColor: Record<string, string> = {
    online: '#1D9E75',
    alert: '#E24B4A',
    offline: '#BA7517',
  }

  // --- LIVE PHASE VALUES ---
  function getLivePhase() {
    const rnd = (base: number, range: number) => +(base + (Math.random() - 0.5) * range).toFixed(1)
    const va = rnd(220.5, 4), vb = rnd(219.8, 4), vc = rnd(221.2, 4)
    const ia = rnd(58.2, 10), ib = rnd(61.4, 10), ic = rnd(55.9, 10)
    return {
      A: { v: va, i: ia, p: +(va * ia / 1000).toFixed(2), pf: rnd(0.94, 0.03) },
      B: { v: vb, i: ib, p: +(vb * ib / 1000).toFixed(2), pf: rnd(0.92, 0.03) },
      C: { v: vc, i: ic, p: +(vc * ic / 1000).toFixed(2), pf: rnd(0.95, 0.03) },
    }
  }

  // --- SUMMARY METRICS ---
  function getSummaryMetrics() {
    const phase = getLivePhase()
    const totalKw = +(phase.A.p + phase.B.p + phase.C.p).toFixed(2)
    const avgPf = +((phase.A.pf + phase.B.pf + phase.C.pf) / 3).toFixed(3)
    return {
      energyToday: 847.2,
      power: totalKw,
      pf: avgPf,
      costMonth: 4821,
      phase,
    }
  }

  // --- HOURLY DATA (today) ---
  function getHourlyData() {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    const seed = (h: number, base: number, amp: number) =>
      +(base + amp * Math.sin((h - 8) * Math.PI / 16) + (Math.random() - 0.5) * 2).toFixed(1)

    return {
      labels,
      A: labels.map((_, i) => seed(i, 12, 5)),
      B: labels.map((_, i) => seed(i, 13.5, 5.5)),
      C: labels.map((_, i) => seed(i, 11.5, 4.5)),
    }
  }

  // --- REALTIME WAVEFORM (last 20 readings) ---
  function getRealtimeData() {
    const now = new Date()
    const labels = Array.from({ length: 20 }, (_, i) => {
      const d = new Date(now.getTime() - (19 - i) * 60000)
      return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    })
    const rnd = (b: number, r: number) => +(b + (Math.random() - 0.5) * r).toFixed(1)
    return {
      labels,
      current:  { A: labels.map(() => rnd(58, 12)), B: labels.map(() => rnd(61, 12)), C: labels.map(() => rnd(56, 12)) },
      voltage:  { A: labels.map(() => rnd(220.5, 5)), B: labels.map(() => rnd(219.8, 5)), C: labels.map(() => rnd(221.2, 5)) },
      power:    { A: labels.map(() => rnd(12.8, 4)), B: labels.map(() => rnd(13.5, 4)), C: labels.map(() => rnd(12.3, 4)) },
    }
  }

  // --- HISTORICAL DATA ---
  function getHistoryData(period: 'day' | 'month' | 'year') {
    if (period === 'day') {
      const labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`)
      const data   = labels.map(() => +(30 + Math.random() * 18).toFixed(1))
      const avg    = +(data.reduce((a, b) => a + b, 0) / data.length).toFixed(1)
      return { labels, data, avg, unit: 'kWh', xLabel: 'วันที่' }
    }
    if (period === 'month') {
      const labels = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
      const data   = [980,1020,1150,1080,1200,1300,1050,1100,990,1060,1090,1120]
      const avg    = +(data.reduce((a, b) => a + b, 0) / data.length).toFixed(0)
      return { labels, data, avg, unit: 'kWh', xLabel: 'เดือน' }
    }
    const labels = ['2021','2022','2023','2024','2025']
    const data   = [10200,11400,12200,12710,13100]
    const avg    = +(data.reduce((a, b) => a + b, 0) / data.length).toFixed(0)
    return { labels, data, avg, unit: 'kWh', xLabel: 'ปี' }
  }

  // --- AVERAGES ---
  function getAverages() {
    return {
      kwhPerDay:    35.3,
      kwhPerMonth:  1059,
      kwhPerYear:   12710,
      costPerDay:   176,
      costPerMonth: 5295,
      costPerYear:  63540,
    }
  }

  // --- BREAKEVEN ---
  function getBreakevenData(installCost: number, ratePerKwh: number) {
    const baseMonthlyBefore = 6200
    const baseMonthlyAfter  = +(baseMonthlyAfter_base * (ratePerKwh / 5)).toFixed(0)
    const saving = +(baseMonthlyBefore * (ratePerKwh / 5) - (baseMonthlyBefore * (ratePerKwh / 5) * 0.778)).toFixed(0)
    const months = +(installCost / saving).toFixed(1)

    const monthLabels = Array.from({ length: 24 }, (_, i) => `${i + 1}`)
    const cumSavings  = monthLabels.map((_, i) => Math.min((i + 1) * saving, installCost))
    const costLine    = monthLabels.map(() => installCost)

    const elapsedMonths = 11
    const recovered = Math.min(elapsedMonths * saving, installCost)
    const pct = +((recovered / installCost) * 100).toFixed(1)

    return {
      beforeCost: +(baseMonthlyBefore * (ratePerKwh / 5)).toFixed(0),
      afterCost:  +(baseMonthlyBefore * (ratePerKwh / 5) * 0.778).toFixed(0),
      saving,
      months,
      elapsedMonths,
      recovered,
      pct,
      chartLabels: monthLabels,
      cumSavings,
      costLine,
      peakShavingKw: 12.3,
      peakShavingPct: 24.5,
      peakShavingSaving: 827,
    }
  }

  // internal helper
  const baseMonthlyAfter_base = 6200

  // --- ALERTS ---
  const alerts = [
    { id: 1, level: 'alert', title: 'โรงงาน B — กระแสเกินพิกัด', sub: 'เฟส A: 78.4A (เกิน 75A)', time: '2 นาทีที่แล้ว' },
    { id: 2, level: 'warn',  title: 'Power Factor ต่ำ — อาคาร E', sub: 'PF: 0.82 (ต่ำกว่าเกณฑ์ 0.90)', time: '15 นาทีที่แล้ว' },
    { id: 3, level: 'info',  title: 'คลังสินค้า D — ออฟไลน์', sub: 'ไม่มีสัญญาณมานาน 2 ชั่วโมง', time: '2 ชั่วโมงที่แล้ว' },
    { id: 4, level: 'ok',    title: 'โรงงาน A — กลับสู่สภาวะปกติ', sub: 'แรงดันและกระแสอยู่ในเกณฑ์', time: '3 ชั่วโมงที่แล้ว' },
  ]

  const alertColor: Record<string, string> = {
    alert: '#E24B4A',
    warn:  '#BA7517',
    info:  '#378ADD',
    ok:    '#1D9E75',
  }

  return {
    sites, siteStatusColor,
    getLivePhase, getSummaryMetrics,
    getHourlyData, getRealtimeData,
    getHistoryData, getAverages,
    getBreakevenData,
    alerts, alertColor,
  }
}



