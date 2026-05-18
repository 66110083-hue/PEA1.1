<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface TransformerDetailData {
  // Info
  status: 'online' | 'offline'
  deviceId: string
  peaNo: string
  brand: string
  rated: number
  ratedCT: number
  commType: string
  ipSim: string
  lat: number
  long: number
  location: string
  meter1Phase: number
  meter3Phase: number
  total: number
  installDate: string
  maxLoad: number
  maxFundAI: number
  maxFundAIPercent: number

  // Realtime
  voltageA: number
  voltageB: number
  voltageC: number
  currentA: number
  currentB: number
  currentC: number
  frequency: number
  activePowerImportA: number
  activePowerImportB: number
  activePowerImportC: number
  totalActivePowerImport: number
  reactivePowerImportA: number
  reactivePowerImportB: number
  reactivePowerImportC: number
  totalReactivePowerImport: number
  apparentPowerA: number
  apparentPowerB: number
  apparentPowerC: number
  totalApparentPower: number
  activePowerExportA: number
  activePowerExportB: number
  activePowerExportC: number
  totalActivePowerExport: number
  reactivePowerExportA: number
  reactivePowerExportB: number
  reactivePowerExportC: number
  totalReactivePowerExport: number
  powerFactorA: number
  powerFactorB: number
  powerFactorC: number
  totalPowerFactor: number
  importActiveEnergy: number
  distributionTransformerLoadRatio: number
  negativeSequenceCurrentRatio: number
}

const props = defineProps<{
  transformer?: Partial<TransformerDetailData>
}>()

// Mock data
const data = ref<TransformerDetailData>({
  status: 'online',
  deviceId: '0AC0291C2300045296',
  peaNo: '58-352186',
  brand: 'VICA TRANS',
  rated: 160,
  ratedCT: 300,
  commType: '4G Cellular',
  ipSim: '10.16.22.133',
  lat: 12.918043,
  long: 100.975596,
  location: 'สถานีที่ตั้ง',
  meter1Phase: 30,
  meter3Phase: 10,
  total: 40,
  installDate: '2025-05-11',
  maxLoad: 80,
  maxFundAI: 25,
  maxFundAIPercent: 15,
  voltageA: 235.588,
  voltageB: 225.227,
  voltageC: 219.285,
  currentA: 120.344,
  currentB: 132.813,
  currentC: 140.189,
  frequency: 49.749,
  activePowerImportA: 1.753,
  activePowerImportB: 0,
  activePowerImportC: 84.032,
  totalActivePowerImport: 4.990,
  reactivePowerImportA: 2.098,
  reactivePowerImportB: 1.249,
  reactivePowerImportC: 5.943,
  totalReactivePowerImport: 29.299,
  apparentPowerA: 25.901,
  apparentPowerB: 23.281,
  apparentPowerC: 23.281,
  totalApparentPower: 76.783,
  activePowerExportA: 0,
  activePowerExportB: 0,
  activePowerExportC: 0,
  totalActivePowerExport: 0,
  reactivePowerExportA: 0,
  reactivePowerExportB: 0,
  reactivePowerExportC: 0,
  totalReactivePowerExport: 0,
  powerFactorA: 0.945,
  powerFactorB: 0.943,
  powerFactorC: 0.497,
  totalPowerFactor: 1.074,
  importActiveEnergy: 73.510,
  distributionTransformerLoadRatio: 96.009,
  negativeSequenceCurrentRatio: 0.426,
  ...props.transformer,
})

// Simulate live updates
let interval: ReturnType<typeof setInterval>
onMounted(() => {
  interval = setInterval(() => {
    const jitter = (base: number, pct = 0.005) => +(base * (1 + (Math.random() - 0.5) * pct)).toFixed(3)
    data.value.voltageA = jitter(data.value.voltageA)
    data.value.voltageB = jitter(data.value.voltageB)
    data.value.voltageC = jitter(data.value.voltageC)
    data.value.currentA = jitter(data.value.currentA, 0.02)
    data.value.currentB = jitter(data.value.currentB, 0.02)
    data.value.currentC = jitter(data.value.currentC, 0.02)
    data.value.frequency = jitter(data.value.frequency, 0.002)
  }, 3000)
})
onUnmounted(() => clearInterval(interval))

// Gauge helper
function gaugeArc(value: number, min: number, max: number, size = 80): { path: string; pct: number } {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1)
  const cx = size / 2, cy = size / 2
  const r = size * 0.38
  const startAngle = -210 * (Math.PI / 180)
  const sweepAngle = 240 * (Math.PI / 180)
  const endAngle = startAngle + sweepAngle * pct
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  const large = sweepAngle * pct > Math.PI ? 1 : 0
  return { path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, pct }
}

function gaugeColor(pct: number): string {
  if (pct < 0.6) return '#1D9E75'
  if (pct < 0.85) return '#F59E0B'
  return '#EF4444'
}

// Track bg arc
function gaugeBgArc(size = 80): string {
  const cx = size / 2, cy = size / 2, r = size * 0.38
  const startAngle = -210 * (Math.PI / 180)
  const endAngle = startAngle + 240 * (Math.PI / 180)
  const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle)
  return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`
}

const gauges = computed(() => [
  { label: 'Voltage L1 (V)', value: data.value.voltageA, min: 180, max: 260, unit: 'V', size: 100 },
  { label: 'Voltage L2 (V)', value: data.value.voltageB, min: 180, max: 260, unit: 'V', size: 100 },
  { label: 'Voltage L3 (V)', value: data.value.voltageC, min: 180, max: 260, unit: 'V', size: 100 },
  { label: 'Current L1 (A)', value: data.value.currentA, min: 0, max: 300, unit: 'A', size: 100 },
  { label: 'Current L2 (A)', value: data.value.currentB, min: 0, max: 300, unit: 'A', size: 100 },
  { label: 'Current L3 (A)', value: data.value.currentC, min: 0, max: 300, unit: 'A', size: 100 },
  { label: 'Active Power L1 (kW)', value: data.value.activePowerImportA, min: 0, max: 100, unit: 'kW', size: 100, sub: 'Import' },
  { label: 'Active Power L2 (kW)', value: data.value.activePowerImportB, min: 0, max: 100, unit: 'kW', size: 100, sub: 'Import' },
  { label: 'Active Power L3 (kW)', value: data.value.activePowerImportC, min: 0, max: 100, unit: 'kW', size: 100, sub: 'Import' },
  { label: 'Total Active (kW)', value: data.value.totalActivePowerImport, min: 0, max: 200, unit: 'kW', size: 100, sub: 'Import' },
  { label: 'Reactive L1 (kVAR)', value: data.value.reactivePowerImportA, min: 0, max: 50, unit: 'kVAR', size: 100, sub: 'Import' },
  { label: 'Reactive L2 (kVAR)', value: data.value.reactivePowerImportB, min: 0, max: 50, unit: 'kVAR', size: 100, sub: 'Import' },
  { label: 'Reactive L3 (kVAR)', value: data.value.reactivePowerImportC, min: 0, max: 50, unit: 'kVAR', size: 100, sub: 'Import' },
  { label: 'Total Reactive (kVAR)', value: data.value.totalReactivePowerImport, min: 0, max: 50, unit: 'kVAR', size: 100, sub: 'Import' },
])

const realtimeRows = computed(() => [
  { label: 'Voltage Phase A', value: data.value.voltageA, unit: 'V' },
  { label: 'Voltage Phase B', value: data.value.voltageB, unit: 'V' },
  { label: 'Voltage Phase C', value: data.value.voltageC, unit: 'V' },
  { label: 'Current Phase A', value: data.value.currentA, unit: 'A' },
  { label: 'Current Phase B', value: data.value.currentB, unit: 'A' },
  { label: 'Current Phase C', value: data.value.currentC, unit: 'A' },
  { label: 'Total Frequency', value: data.value.frequency, unit: 'Hz' },
  { label: 'Active Power Import Phase A', value: data.value.activePowerImportA, unit: 'kW' },
  { label: 'Active Power Import Phase B', value: data.value.activePowerImportB, unit: 'kW' },
  { label: 'Active Power Import Phase C', value: data.value.activePowerImportC, unit: 'kW' },
  { label: 'Total Active Power Import', value: data.value.totalActivePowerImport, unit: 'kW' },
  { label: 'Reactive Power Import Phase A', value: data.value.reactivePowerImportA, unit: 'kVAR' },
  { label: 'Reactive Power Import Phase B', value: data.value.reactivePowerImportB, unit: 'kVAR' },
  { label: 'Reactive Power Import Phase C', value: data.value.reactivePowerImportC, unit: 'kVAR' },
  { label: 'Total Reactive Power Import', value: data.value.totalReactivePowerImport, unit: 'kVAR' },
  { label: 'Apparent Power Phase A', value: data.value.apparentPowerA, unit: 'kVA' },
  { label: 'Apparent Power Phase B', value: data.value.apparentPowerB, unit: 'kVA' },
  { label: 'Apparent Power Phase C', value: data.value.apparentPowerC, unit: 'kVA' },
  { label: 'Total Apparent Power', value: data.value.totalApparentPower, unit: 'kVA' },
  { label: 'Active Power Export Phase A', value: data.value.activePowerExportA, unit: 'kW' },
  { label: 'Active Power Export Phase B', value: data.value.activePowerExportB, unit: 'kW' },
  { label: 'Active Power Export Phase C', value: data.value.activePowerExportC, unit: 'kW' },
  { label: 'Total Active Power Export', value: data.value.totalActivePowerExport, unit: 'kW' },
  { label: 'Reactive Power Export Phase A', value: data.value.reactivePowerExportA, unit: 'kVAR' },
  { label: 'Reactive Power Export Phase B', value: data.value.reactivePowerExportB, unit: 'kVAR' },
  { label: 'Reactive Power Export Phase C', value: data.value.reactivePowerExportC, unit: 'kVAR' },
  { label: 'Total Reactive Power Export', value: data.value.totalReactivePowerExport, unit: 'kVAR' },
  { label: 'Power Factor Phase A', value: data.value.powerFactorA, unit: 'PF' },
  { label: 'Power Factor Phase B', value: data.value.powerFactorB, unit: 'PF' },
  { label: 'Power Factor Phase C', value: data.value.powerFactorC, unit: 'PF' },
  { label: 'Total Power Factor', value: data.value.totalPowerFactor, unit: 'PF' },
  { label: 'Import Active Energy', value: data.value.importActiveEnergy, unit: 'kWh' },
  { label: 'Distribution Transformer Load Ratio', value: data.value.distributionTransformerLoadRatio, unit: '%' },
  { label: 'Negative Sequence Current Ratio', value: data.value.negativeSequenceCurrentRatio, unit: '%' },
])
</script>

<style scoped>
.td-page { display:flex; flex-direction:column; gap:16px; }

/* Card */
.td-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.td-card-header {
  display: flex; align-items: center; gap:8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-2);
}
.td-card-header-icon {
  width:28px; height:28px; border-radius:6px;
  background: var(--color-green); color:white;
  display:flex; align-items:center; justify-content:center; font-size:14px;
}
.td-card-title { font-size:13px; font-weight:600; color:var(--color-text-1); }
.td-card-body { padding:16px; }

/* Transformer image area */
.td-hero {
  display:flex; gap:20px; align-items:flex-start;
  padding-bottom:16px; border-bottom:1px solid var(--color-border); margin-bottom:16px;
}
.td-img-box {
  width:120px; height:120px; border-radius:8px;
  background:var(--color-surface-2); border:1px solid var(--color-border);
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
  font-size:40px;
}
.td-status-badge {
  display:inline-flex; align-items:center; gap:6px;
  padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500;
}
.td-status-badge.online  { background:rgba(29,158,117,0.12); color:#1D9E75; }
.td-status-badge.offline { background:rgba(154,160,176,0.15); color:#9aa0b0; }
.td-status-dot { width:7px; height:7px; border-radius:50%; }
.td-status-dot.online  { background:#1D9E75; }
.td-status-dot.offline { background:#9aa0b0; }

/* Info grid */
.td-info-grid {
  display:grid; grid-template-columns:repeat(3,1fr); gap:8px 16px;
}
.td-info-item { display:flex; flex-direction:column; gap:2px; }
.td-info-label { font-size:10px; color:var(--color-text-3); text-transform:uppercase; letter-spacing:0.05em; }
.td-info-value { font-size:12px; color:var(--color-text-1); font-weight:500; font-family:var(--font-mono); }

/* Gauges */
.td-gauges-grid {
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap:12px;
}
.td-gauge-item {
  display:flex; flex-direction:column; align-items:center; gap:4px;
  padding:10px 8px;
  background:var(--color-surface-2);
  border:1px solid var(--color-border);
  border-radius:8px;
}
.td-gauge-label {
  font-size:9px; color:var(--color-text-3); text-align:center;
  text-transform:uppercase; letter-spacing:0.04em; line-height:1.3;
}
.td-gauge-value {
  font-size:13px; font-weight:700; font-family:var(--font-mono);
  color:var(--color-text-1);
}
.td-gauge-sub { font-size:9px; color:var(--color-text-3); }

/* Realtime table */
.td-rt-table { width:100%; border-collapse:collapse; font-size:12px; }
.td-rt-table th {
  padding:7px 12px; text-align:left;
  background:var(--color-surface-2); color:var(--color-text-3);
  font-size:10px; text-transform:uppercase; letter-spacing:0.06em;
  border-bottom:1px solid var(--color-border);
}
.td-rt-table td { padding:7px 12px; border-bottom:1px solid var(--color-border); }
.td-rt-table tr:last-child td { border-bottom:none; }
.td-rt-table tr:hover td { background:var(--color-bg); }
.td-rt-val { font-family:var(--font-mono); font-weight:500; color:var(--color-text-1); }
.td-rt-unit { font-size:10px; color:var(--color-text-3); margin-left:3px; }
.td-live-dot {
  width:6px; height:6px; border-radius:50%; background:#1D9E75;
  display:inline-block; margin-right:4px;
  animation: td-pulse 2s ease-in-out infinite;
}
@keyframes td-pulse {
  0%,100% { opacity:1; } 50% { opacity:0.3; }
}

/* Section title */
.td-section-title {
  font-size:11px; font-weight:600; color:var(--color-text-2);
  text-transform:uppercase; letter-spacing:0.07em;
  margin-bottom:10px; display:flex; align-items:center; gap:6px;
}
.td-section-title::after {
  content:''; flex:1; height:1px; background:var(--color-border);
}
</style>

<template>
  <div class="td-page">

    <!-- ─── Transformer Info + Image ─── -->
    <div class="td-card">
      <div class="td-card-header">
        <div class="td-card-header-icon"><i class="ti ti-bolt"/></div>
        <span class="td-card-title">Transformer Detail</span>
        <div style="margin-left:auto; display:flex; align-items:center; gap:8px">
          <span class="td-status-badge" :class="data.status">
            <span class="td-status-dot" :class="data.status"/>
            {{ data.status === 'online' ? 'Online' : 'Offline' }}
          </span>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--color-text-3)">{{ data.peaNo }}</span>
        </div>
      </div>
      <div class="td-card-body">

        <!-- Hero row: image + info -->
        <div class="td-hero">
          <div class="td-img-box">🔌</div>
          <div style="flex:1">
            <div class="td-section-title"><i class="ti ti-info-circle"/> Transformer Information</div>
            <div class="td-info-grid">
              <div class="td-info-item">
                <span class="td-info-label">Device ID</span>
                <span class="td-info-value" style="font-size:10px">{{ data.deviceId }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">PEA No.</span>
                <span class="td-info-value">{{ data.peaNo }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Brand</span>
                <span class="td-info-value">{{ data.brand }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Rated (kVA)</span>
                <span class="td-info-value">{{ data.rated }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Rated CT</span>
                <span class="td-info-value">{{ data.ratedCT }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Comm. Type</span>
                <span class="td-info-value">{{ data.commType }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">IP Simcard</span>
                <span class="td-info-value">{{ data.ipSim }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Latitude</span>
                <span class="td-info-value">{{ data.lat }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Longitude</span>
                <span class="td-info-value">{{ data.long }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Location</span>
                <span class="td-info-value" style="font-family:var(--font-sans)">{{ data.location }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Meter 1 Phase</span>
                <span class="td-info-value">{{ data.meter1Phase }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Meter 3 Phase</span>
                <span class="td-info-value">{{ data.meter3Phase }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Total</span>
                <span class="td-info-value">{{ data.total }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Install Date</span>
                <span class="td-info-value">{{ data.installDate }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Max Load (%)</span>
                <span class="td-info-value">{{ data.maxLoad }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Max Fund AI (%) </span>
                <span class="td-info-value">{{ data.maxFundAIPercent }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Gauges -->
        <div class="td-section-title"><i class="ti ti-gauge"/> Gauges (Realtime)</div>
        <div class="td-gauges-grid">
          <div v-for="g in gauges" :key="g.label" class="td-gauge-item">
            <svg :width="g.size" :height="g.size * 0.72" :viewBox="`0 0 ${g.size} ${g.size * 0.72}`">
              <!-- bg track -->
              <path
                :d="gaugeBgArc(g.size)"
                fill="none" stroke="var(--color-border)" stroke-width="5" stroke-linecap="round"/>
              <!-- value arc -->
              <path
                :d="gaugeArc(g.value, g.min, g.max, g.size).path"
                fill="none"
                :stroke="gaugeColor(gaugeArc(g.value, g.min, g.max, g.size).pct)"
                stroke-width="5" stroke-linecap="round"/>
              <!-- needle dot -->
              <circle :cx="g.size/2" :cy="g.size*0.72*0.8" r="3" fill="var(--color-text-2)"/>
            </svg>
            <span class="td-gauge-value">{{ g.value.toFixed(3) }}</span>
            <span class="td-gauge-label">{{ g.label }}</span>
            <span v-if="g.sub" class="td-gauge-sub">↑ {{ g.sub }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Realtime Data Table ─── -->
    <div class="td-card">
      <div class="td-card-header">
        <div class="td-card-header-icon" style="background:#2563EB"><i class="ti ti-table"/></div>
        <span class="td-card-title">Realtime Data</span>
        <span style="margin-left:8px;font-size:11px;color:var(--color-text-3)">
          <span class="td-live-dot"/>ข้อมูล ณ ช่วงเวลานั้น
        </span>
      </div>
      <div style="overflow-x:auto">
        <table class="td-rt-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in realtimeRows" :key="row.label">
              <td style="color:var(--color-text-2)">{{ row.label }}</td>
              <td class="td-rt-val">{{ row.value.toFixed(3) }}</td>
              <td><span class="td-rt-unit">{{ row.unit }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>