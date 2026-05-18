import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEnergyData } from '~/composables/useEnergyData'

export interface TransformerDetailData {
  status: 'online' | 'offline'
  deviceId: string; peaNo: string; brand: string
  rated: number; ratedCT: number; commType: string; ipSim: string
  lat: number; long: number; location: string
  meter1Phase: number; meter3Phase: number; total: number
  installDate: string; maxLoad: number; maxFundAI: number; maxFundAIPercent: number
  voltageA: number; voltageB: number; voltageC: number
  currentA: number; currentB: number; currentC: number
  frequency: number
  activePowerImportA: number; activePowerImportB: number; activePowerImportC: number
  totalActivePowerImport: number
  reactivePowerImportA: number; reactivePowerImportB: number; reactivePowerImportC: number
  totalReactivePowerImport: number
  apparentPowerA: number; apparentPowerB: number; apparentPowerC: number
  totalApparentPower: number
  activePowerExportA: number; activePowerExportB: number; activePowerExportC: number
  totalActivePowerExport: number
  reactivePowerExportA: number; reactivePowerExportB: number; reactivePowerExportC: number
  totalReactivePowerExport: number
  powerFactorA: number; powerFactorB: number; powerFactorC: number; totalPowerFactor: number
  importActiveEnergy: number
  distributionTransformerLoadRatio: number
  negativeSequenceCurrentRatio: number
}

const DEFAULT_DATA: TransformerDetailData = {
  status: 'online',
  deviceId: '0AC0291C2300045296', peaNo: '58-352186',
  brand: 'VICA TRANS', rated: 160, ratedCT: 300,
  commType: '4G Cellular', ipSim: '10.16.22.133',
  lat: 12.918043, long: 100.975596, location: 'สถานีที่ตั้ง',
  meter1Phase: 30, meter3Phase: 10, total: 40,
  installDate: '2025-05-11', maxLoad: 80, maxFundAI: 25, maxFundAIPercent: 15,
  voltageA: 235.588, voltageB: 225.227, voltageC: 219.285,
  currentA: 120.344, currentB: 132.813, currentC: 140.189,
  frequency: 49.749,
  activePowerImportA: 1.753, activePowerImportB: 0, activePowerImportC: 84.032,
  totalActivePowerImport: 4.990,
  reactivePowerImportA: 2.098, reactivePowerImportB: 1.249, reactivePowerImportC: 5.943,
  totalReactivePowerImport: 29.299,
  apparentPowerA: 25.901, apparentPowerB: 23.281, apparentPowerC: 23.281,
  totalApparentPower: 76.783,
  activePowerExportA: 0, activePowerExportB: 0, activePowerExportC: 0,
  totalActivePowerExport: 0,
  reactivePowerExportA: 0, reactivePowerExportB: 0, reactivePowerExportC: 0,
  totalReactivePowerExport: 0,
  powerFactorA: 0.945, powerFactorB: 0.943, powerFactorC: 0.497, totalPowerFactor: 1.074,
  importActiveEnergy: 73.510,
  distributionTransformerLoadRatio: 96.009,
  negativeSequenceCurrentRatio: 0.426,
}

export function useTransformerDetail(override?: Partial<TransformerDetailData>) {
  const { activeTransformerDetail } = useEnergyData()
  const mockData = ref<TransformerDetailData>({ ...DEFAULT_DATA, ...override })
  const data     = computed(() => activeTransformerDetail.value ?? mockData.value)

  // Jitter live
  let interval: ReturnType<typeof setInterval>
  const jitter = (v: number, pct = 0.005) => +(v * (1 + (Math.random() - 0.5) * pct)).toFixed(3)

  onMounted(() => {
    interval = setInterval(() => {
      mockData.value.voltageA  = jitter(mockData.value.voltageA)
      mockData.value.voltageB  = jitter(mockData.value.voltageB)
      mockData.value.voltageC  = jitter(mockData.value.voltageC)
      mockData.value.currentA  = jitter(mockData.value.currentA, 0.02)
      mockData.value.currentB  = jitter(mockData.value.currentB, 0.02)
      mockData.value.currentC  = jitter(mockData.value.currentC, 0.02)
      mockData.value.frequency = jitter(mockData.value.frequency, 0.002)
    }, 3000)
  })
  onUnmounted(() => clearInterval(interval))

  // Gauge helpers
  function gaugeArc(value: number, min: number, max: number, size = 80) {
    const pct = Math.min(Math.max((value - min) / (max - min), 0), 1)
    const cx = size / 2, cy = size / 2, r = size * 0.38
    const s  = -210 * (Math.PI / 180)
    const sw = 240 * (Math.PI / 180)
    const e  = s + sw * pct
    const large = sw * pct > Math.PI ? 1 : 0
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s)
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e)
    return { path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, pct }
  }

  function gaugeBgArc(size = 80) {
    const cx = size / 2, cy = size / 2, r = size * 0.38
    const s  = -210 * (Math.PI / 180)
    const e  = s + 240 * (Math.PI / 180)
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s)
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e)
    return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`
  }

  function gaugeColor(pct: number) {
    return pct < 0.6 ? '#1D9E75' : pct < 0.85 ? '#F59E0B' : '#EF4444'
  }

  // Computed lists
  const gauges = computed(() => [
    { label: 'Voltage L1 (V)',        value: data.value.voltageA,             min: 180, max: 260, size: 100 },
    { label: 'Voltage L2 (V)',        value: data.value.voltageB,             min: 180, max: 260, size: 100 },
    { label: 'Voltage L3 (V)',        value: data.value.voltageC,             min: 180, max: 260, size: 100 },
    { label: 'Current L1 (A)',        value: data.value.currentA,             min: 0,   max: 300, size: 100 },
    { label: 'Current L2 (A)',        value: data.value.currentB,             min: 0,   max: 300, size: 100 },
    { label: 'Current L3 (A)',        value: data.value.currentC,             min: 0,   max: 300, size: 100 },
    { label: 'Active Power L1 (kW)', value: data.value.activePowerImportA,   min: 0,   max: 100, size: 100, sub: 'Import' },
    { label: 'Active Power L2 (kW)', value: data.value.activePowerImportB,   min: 0,   max: 100, size: 100, sub: 'Import' },
    { label: 'Active Power L3 (kW)', value: data.value.activePowerImportC,   min: 0,   max: 100, size: 100, sub: 'Import' },
    { label: 'Total Active (kW)',     value: data.value.totalActivePowerImport, min: 0, max: 200, size: 100, sub: 'Import' },
    { label: 'Reactive L1 (kVAR)',   value: data.value.reactivePowerImportA, min: 0,   max: 50,  size: 100, sub: 'Import' },
    { label: 'Reactive L2 (kVAR)',   value: data.value.reactivePowerImportB, min: 0,   max: 50,  size: 100, sub: 'Import' },
    { label: 'Reactive L3 (kVAR)',   value: data.value.reactivePowerImportC, min: 0,   max: 50,  size: 100, sub: 'Import' },
    { label: 'Total Reactive (kVAR)',value: data.value.totalReactivePowerImport, min: 0, max: 50, size: 100, sub: 'Import' },
  ])

  const realtimeRows = computed(() => [
    { label: 'Voltage Phase A',                          value: data.value.voltageA,                       unit: 'V'    },
    { label: 'Voltage Phase B',                          value: data.value.voltageB,                       unit: 'V'    },
    { label: 'Voltage Phase C',                          value: data.value.voltageC,                       unit: 'V'    },
    { label: 'Current Phase A',                          value: data.value.currentA,                       unit: 'A'    },
    { label: 'Current Phase B',                          value: data.value.currentB,                       unit: 'A'    },
    { label: 'Current Phase C',                          value: data.value.currentC,                       unit: 'A'    },
    { label: 'Total Frequency',                          value: data.value.frequency,                      unit: 'Hz'   },
    { label: 'Active Power Import Phase A',              value: data.value.activePowerImportA,             unit: 'kW'   },
    { label: 'Active Power Import Phase B',              value: data.value.activePowerImportB,             unit: 'kW'   },
    { label: 'Active Power Import Phase C',              value: data.value.activePowerImportC,             unit: 'kW'   },
    { label: 'Total Active Power Import',                value: data.value.totalActivePowerImport,         unit: 'kW'   },
    { label: 'Reactive Power Import Phase A',            value: data.value.reactivePowerImportA,           unit: 'kVAR' },
    { label: 'Reactive Power Import Phase B',            value: data.value.reactivePowerImportB,           unit: 'kVAR' },
    { label: 'Reactive Power Import Phase C',            value: data.value.reactivePowerImportC,           unit: 'kVAR' },
    { label: 'Total Reactive Power Import',              value: data.value.totalReactivePowerImport,       unit: 'kVAR' },
    { label: 'Apparent Power Phase A',                   value: data.value.apparentPowerA,                 unit: 'kVA'  },
    { label: 'Apparent Power Phase B',                   value: data.value.apparentPowerB,                 unit: 'kVA'  },
    { label: 'Apparent Power Phase C',                   value: data.value.apparentPowerC,                 unit: 'kVA'  },
    { label: 'Total Apparent Power',                     value: data.value.totalApparentPower,             unit: 'kVA'  },
    { label: 'Active Power Export Phase A',              value: data.value.activePowerExportA,             unit: 'kW'   },
    { label: 'Active Power Export Phase B',              value: data.value.activePowerExportB,             unit: 'kW'   },
    { label: 'Active Power Export Phase C',              value: data.value.activePowerExportC,             unit: 'kW'   },
    { label: 'Total Active Power Export',                value: data.value.totalActivePowerExport,         unit: 'kW'   },
    { label: 'Reactive Power Export Phase A',            value: data.value.reactivePowerExportA,           unit: 'kVAR' },
    { label: 'Reactive Power Export Phase B',            value: data.value.reactivePowerExportB,           unit: 'kVAR' },
    { label: 'Reactive Power Export Phase C',            value: data.value.reactivePowerExportC,           unit: 'kVAR' },
    { label: 'Total Reactive Power Export',              value: data.value.totalReactivePowerExport,       unit: 'kVAR' },
    { label: 'Power Factor Phase A',                     value: data.value.powerFactorA,                   unit: 'PF'   },
    { label: 'Power Factor Phase B',                     value: data.value.powerFactorB,                   unit: 'PF'   },
    { label: 'Power Factor Phase C',                     value: data.value.powerFactorC,                   unit: 'PF'   },
    { label: 'Total Power Factor',                       value: data.value.totalPowerFactor,               unit: 'PF'   },
    { label: 'Import Active Energy',                     value: data.value.importActiveEnergy,             unit: 'kWh'  },
    { label: 'Distribution Transformer Load Ratio',      value: data.value.distributionTransformerLoadRatio, unit: '%' },
    { label: 'Negative Sequence Current Ratio',          value: data.value.negativeSequenceCurrentRatio,   unit: '%'   },
  ])

  return { data, gauges, realtimeRows, gaugeArc, gaugeBgArc, gaugeColor }
}