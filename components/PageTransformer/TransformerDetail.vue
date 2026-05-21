<script setup lang="ts">
import { computed, watch } from 'vue'
import { useDashboard } from '~/composables/useDashboard'
import { useTransformer, type Transformer } from '~/composables/useTransformer'
import TransformerRealtimeTable from '/home/supanat01/PEA-main/components/PageTransformer/TransformerRealtimeTable.vue'
// ── Props ────────────────────────────────────────────────
const props = defineProps<{
  transformerId: string   // รับค่าคีย์สลักเชื่อมเข้ามา (เช่น 'M-01', 'TF-M-01' หรือก้อน Object)
}>()

// ── Static info ──────────────────────────────────────────
const { transformers } = useTransformer()

const tfInfo = computed<Transformer | undefined>(() => {
  if (!props.transformerId) return undefined
  
  // 🔥 ระบบค้นหาแบบคลุมถุงชน: ล้างรหัส String ให้คลีนที่สุด ป้องกันปัญหาส่ง ID ผิดประเภท
  const searchId = String(props.transformerId).toLowerCase().replace('tf-', '').trim()
  
  return transformers.value.find(t => {
    if (!t.id) return false
    const currentId = String(t.id).toLowerCase().trim()
    const currentPea = String(t.peaNo).toLowerCase().trim()
    
    // ค้นหาเจอถ้ารหัสสั้นตรงกัน หรือซ้อนอยู่ในข้อความ หรือตรงกับรหัสหมายเลข PEA ของหม้อแปลง
    return currentId === searchId || 
           searchId.includes(currentId) || 
           currentId.includes(searchId) ||
           currentPea.includes(searchId)
  })
})

// 🔥 ดึงรหัส ID ที่ถูกต้องเพื่อส่งไปให้ตัวจัดการกราฟ useDashboard
const targetDashboardId = computed(() => {
  return tfInfo.value ? tfInfo.value.id : props.transformerId
})

// ── Dashboard (chart + energy data) ─────────────────────
const {
  activeMetric, activePhases, hasData, isLoading,
  PHASES, METRIC_TABS,
  latest, statistics, balanceData,
  unit, lastUpdateText,
  realtimeSnapshot,
  handleFilter,
} = useDashboard({ transformerId: targetDashboardId.value })

// ── Realtime table rows (จาก realtimeSnapshot) ──────────
// 📂 components/PageTransformer/TransformerDetail.vue

const realtimeRows = computed(() => {
  // 1. ลองตรวจสอบว่ามีข้อมูล realtimeSnapshot ตรงๆ หรือไม่
  const s = realtimeSnapshot.value
  if (s && Object.keys(s).length > 0) {
    return [
      { label: 'Voltage Phase A', value: s.voltageA, unit: 'V' },
      { label: 'Voltage Phase B', value: s.voltageB, unit: 'V' },
      { label: 'Voltage Phase C', value: s.voltageC, unit: 'V' },
      { label: 'Current Phase A', value: s.currentA, unit: 'A' },
      { label: 'Current Phase B', value: s.currentB, unit: 'A' },
      { label: 'Current Phase C', value: s.currentC, unit: 'A' },
      { label: 'Total Frequency', value: s.frequency, unit: 'Hz' },
      { label: 'Total Active Power Import', value: s.totalActivePowerImport, unit: 'kW' },
      { label: 'Total Apparent Power', value: s.totalApparentPower, unit: 'kVA' },
      { label: 'Total Power Factor', value: s.totalPowerFactor, unit: 'PF' },
      { label: 'Distribution Transformer Load Ratio', value: s.distributionTransformerLoadRatio, unit: '%' }
    ]
  }

  // 2. ✨ แผนสำรอง: ถ้า realtimeSnapshot ว่างเปล่า ให้ดึงข้อมูลจาก latest (ตัวเดียวกับที่เกจหน้าปัดใช้) มาแสดงแทน!
  const l = latest.value
  if (l && Object.keys(l).length > 0) {
    return [
      { label: 'Voltage Phase A', value: l.A?.voltage ?? 0, unit: 'V' },
      { label: 'Voltage Phase B', value: l.B?.voltage ?? 0, unit: 'V' },
      { label: 'Voltage Phase C', value: l.C?.voltage ?? 0, unit: 'V' },
      { label: 'Current Phase A', value: l.A?.current ?? 0, unit: 'A' },
      { label: 'Current Phase B', value: l.B?.current ?? 0, unit: 'A' },
      { label: 'Current Phase C', value: l.C?.current ?? 0, unit: 'A' },
      { label: 'Active Power Phase A', value: l.A?.power ?? 0, unit: 'kW' },
      { label: 'Active Power Phase B', value: l.B?.power ?? 0, unit: 'kW' },
      { label: 'Active Power Phase C', value: l.C?.power ?? 0, unit: 'kW' },
    ]
  }

  // 3. ถ้าไม่มีข้อมูลเลยจริงๆ ค่อยส่ง Array ว่างกลับไปเพื่อแสดงข้อความ "ไม่มีข้อมูล realtime"
  return []
})

// ── Gauge helpers ────────────────────────────────────────
function gaugeArc(value: number, min: number, max: number, size = 100) {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1)
  const cx = size / 2, cy = size / 2, r = size * 0.38
  const sa = -210 * (Math.PI / 180)
  const ea = sa + 240 * (Math.PI / 180) * pct
  const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa)
  const x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea)
  const lg = 240 * (Math.PI / 180) * pct > Math.PI ? 1 : 0
  return { path: `M ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2}`, pct }
}
function gaugeBgArc(size = 100) {
  const cx = size / 2, cy = size / 2, r = size * 0.38
  const s = -210 * (Math.PI / 180), e = s + 240 * (Math.PI / 180)
  return `M ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)}`
}
function gaugeColor(pct: number) {
  return pct < 0.6 ? '#1D9E75' : pct < 0.85 ? '#F59E0B' : '#EF4444'
}

const gauges = computed(() => {
  const l = latest.value
  return [
    { label: 'Voltage L1',     value: l.A?.voltage ?? 0, min: 180, max: 260, unit: 'V'    },
    { label: 'Voltage L2',     value: l.B?.voltage ?? 0, min: 180, max: 260, unit: 'V'    },
    { label: 'Voltage L3',     value: l.C?.voltage ?? 0, min: 180, max: 260, unit: 'V'    },
    { label: 'Current L1',     value: l.A?.current ?? 0, min: 0,   max: 600, unit: 'A'    },
    { label: 'Current L2',     value: l.B?.current ?? 0, min: 0,   max: 600, unit: 'A'    },
    { label: 'Current L3',     value: l.C?.current ?? 0, min: 0,   max: 600, unit: 'A'    },
    { label: 'Active P L1',    value: l.A?.power   ?? 0, min: 0,   max: 200, unit: 'kW',  sub: 'Import' },
    { label: 'Active P L2',    value: l.B?.power   ?? 0, min: 0,   max: 200, unit: 'kW',  sub: 'Import' },
    { label: 'Active P L3',    value: l.C?.power   ?? 0, min: 0,   max: 200, unit: 'kW',  sub: 'Import' },
  ]
})
</script>

<template>
  <div class="td-page">

    <div v-if="!tfInfo" class="td-card">
      <div class="td-empty">
        <i class="ti ti-alert-circle" style="font-size:24px;display:block;margin-bottom:8px"/>
        ไม่พบข้อมูลหม้อแปลง
      </div>
    </div>

    <template v-else>

      <div class="td-card">
        <div class="td-card-header">
          <div class="td-card-icon" style="background:var(--color-green);color:white"><i class="ti ti-bolt"/></div>
          <span class="td-card-title">Transformer Detail</span>
          <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
            <span class="td-status-badge" :class="tfInfo.status">
              <span class="td-dot" :class="tfInfo.status"/>
              {{ tfInfo.status === 'online' ? 'Online' : 'Offline' }}
            </span>
            <span style="font-family:var(--font-mono);font-size:12px;color:var(--color-text-3)">{{ tfInfo.peaNo }}</span>
          </div>
        </div>
        <div class="td-card-body">
          <div class="td-hero">
            <div class="td-img-box">🔌</div>
            <div class="td-info-grid">
              <div class="td-info-item"><span class="td-info-label">Device ID</span><span class="td-info-value" style="font-size:10px">{{ tfInfo.deviceId }}</span></div>
              <div class="td-info-item"><span class="td-info-label">PEA No.</span><span class="td-info-value">{{ tfInfo.peaNo }}</span></div>
              <div class="td-info-item"><span class="td-info-label">Brand</span><span class="td-info-value">{{ tfInfo.brand }}</span></div>
              <div class="td-info-item"><span class="td-info-label">Rated (kVA)</span><span class="td-info-value">{{ tfInfo.rated }}</span></div>
              <div class="td-info-item"><span class="td-info-label">Rated CT</span><span class="td-info-value">{{ tfInfo.ratedCT }}</span></div>
              <div class="td-info-item"><span class="td-info-label">Comm. Type</span><span class="td-info-value">{{ tfInfo.commType }}</span></div>
              <div class="td-info-item"><span class="td-info-label">IP Simcard</span><span class="td-info-value">{{ tfInfo.ipSim }}</span></div>
              <div class="td-info-item"><span class="td-info-label">Latitude</span><span class="td-info-value">{{ tfInfo.lat }}</span></div>
              <div class="td-info-item"><span class="td-info-label">Longitude</span><span class="td-info-value">{{ tfInfo.long }}</span></div>
              <div class="td-info-item"><span class="td-info-label">Location</span><span class="td-info-value" style="font-family:var(--font-sans)">{{ tfInfo.location }}</span></div>
              <div class="td-info-item"><span class="td-info-label">Install Date</span><span class="td-info-value">{{ tfInfo.installDate }}</span></div>
              <div class="td-info-item"><span class="td-info-label">Max Load (%)</span><span class="td-info-value">{{ tfInfo.maxLoad }}</span></div>
            </div>
          </div>

          <div class="td-section"><i class="ti ti-gauge"/> Current Values</div>
          <div class="td-gauges-grid">
            <div v-for="g in gauges" :key="g.label" class="td-gauge-item">
              <svg width="100" height="72" viewBox="0 0 100 72">
                <path :d="gaugeBgArc(100)" fill="none" stroke="var(--color-border)" stroke-width="5" stroke-linecap="round"/>
                <path :d="gaugeArc(g.value, g.min, g.max, 100).path" fill="none"
                  :stroke="gaugeColor(gaugeArc(g.value, g.min, g.max, 100).pct)"
                  stroke-width="5" stroke-linecap="round"/>
                <circle cx="50" cy="57.6" r="3" fill="var(--color-text-2)"/>
              </svg>
              <span class="td-gauge-value">{{ g.value.toFixed(2) }}</span>
              <span class="td-gauge-label">{{ g.label }} ({{ g.unit }})</span>
              <span v-if="g.sub" class="td-gauge-sub">↑ {{ g.sub }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="td-card">
        <div class="td-card-header">
          <div class="td-card-icon" style="background:#2563EB;color:white"><i class="ti ti-chart-line"/></div>
          <span class="td-card-title">History Chart</span>
          <div class="td-tabs" style="margin-left:12px">
            <button
              v-for="tab in METRIC_TABS" :key="tab.key"
              class="td-tab" :class="{ active: activeMetric === tab.key }"
              @click="activeMetric = tab.key"
            >{{ tab.label }}</button>
          </div>
          <div style="display:flex;gap:6px;margin-left:auto">
            <button
              v-for="p in PHASES" :key="p.id"
              class="td-phase-btn"
              :class="{ active: activePhases.includes(p.id) }"
              :style="{ borderColor: p.color, color: p.color, background: activePhases.includes(p.id) ? p.color + '18' : 'transparent' }"
              @click="activePhases.includes(p.id)
                ? activePhases.splice(activePhases.indexOf(p.id), 1)
                : activePhases.push(p.id)"
            >{{ p.id }}</button>
          </div>
          <span style="margin-left:12px;font-size:11px;color:var(--color-text-3)">
            <span class="td-live-dot"/>{{ lastUpdateText }}
          </span>
        </div>
        <div class="td-card-body">

          <div style="display:flex;gap:8px;margin-bottom:12px">
            <button
              class="td-tab"
              :class="{ active: !hasData }"
              @click="handleFilter({ range: '1d' }, targetDashboardId)"
            ><i class="ti ti-refresh" style="font-size:11px"/> โหลดข้อมูล</button>
          </div>

          <div class="td-chart-wrap">
            <canvas id="historyLineChart"/>
            <div v-if="isLoading" class="td-loading-overlay">
              <i class="ti ti-loader-2" style="animation:spin 1s linear infinite"/>
              กำลังโหลด...
            </div>
            <div v-else-if="!hasData" class="td-loading-overlay" style="flex-direction:column;gap:4px">
              <i class="ti ti-chart-line" style="font-size:24px;color:var(--color-border)"/>
              <span>กดปุ่ม "โหลดข้อมูล" เพื่อดูกราฟ</span>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
            <div>
              <div class="td-section"><i class="ti ti-chart-bar"/> Statistics</div>
              <div v-for="s in statistics" :key="s.label" class="td-stat-row">
                <span style="color:var(--color-text-2)">{{ s.label }}</span>
                <span style="font-family:var(--font-mono);font-weight:600" :style="{ color: s.color ?? 'var(--color-text-1)' }">{{ s.value }}</span>
              </div>
            </div>
            <div>
              <div class="td-section"><i class="ti ti-scale"/> Phase Balance</div>
              <div v-for="b in balanceData" :key="b.id" class="td-balance-row">
                <span style="font-family:var(--font-mono);font-weight:600;width:20px" :style="{ color: b.color }">{{ b.id }}</span>
                <div class="td-balance-bar-bg">
                  <div class="td-balance-bar" :style="{ width: b.pct + '%', background: b.color }"/>
                </div>
                <span style="font-family:var(--font-mono);font-size:11px;width:52px;text-align:right">{{ b.avg }} {{ unit }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

<TransformerRealtimeTable 
  :rows="realtimeRows" 
  :allData="historyData ?? []" 
/>

    </template>
  </div>
</template>


<style scoped>
.td-page { display:flex; flex-direction:column; gap:16px; }
.td-card { background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-lg); overflow:hidden; }
.td-card-header { display:flex; align-items:center; gap:8px; padding:12px 16px; border-bottom:1px solid var(--color-border); background:var(--color-surface-2); }
.td-card-icon { width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:14px; }
.td-card-title { font-size:13px; font-weight:600; color:var(--color-text-1); }
.td-card-body { padding:16px; }

/* Metric tabs */
.td-tabs { display:flex; gap:4px; }
.td-tab {
  padding:5px 14px; border-radius:var(--radius-md); font-size:12px;
  font-weight:500; cursor:pointer; border:1px solid var(--color-border-md);
  background:transparent; color:var(--color-text-2); transition:all 0.12s;
  font-family:var(--font-sans);
}
.td-tab.active { background:var(--color-green); color:white; border-color:transparent; }

/* Phase toggle */
.td-phase-btn {
  padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600;
  cursor:pointer; border:2px solid; transition:opacity 0.12s;
  font-family:var(--font-mono);
}
.td-phase-btn.active { opacity:1; }
.td-phase-btn:not(.active) { opacity:0.35; }

/* Transformer info */
.td-hero { display:flex; gap:20px; padding-bottom:16px; border-bottom:1px solid var(--color-border); margin-bottom:16px; }
.td-img-box { width:110px; height:110px; border-radius:8px; background:var(--color-surface-2); border:1px solid var(--color-border); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:36px; }
.td-info-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px 16px; flex:1; }
.td-info-item { display:flex; flex-direction:column; gap:2px; }
.td-info-label { font-size:10px; color:var(--color-text-3); text-transform:uppercase; letter-spacing:0.05em; }
.td-info-value { font-size:12px; color:var(--color-text-1); font-weight:500; font-family:var(--font-mono); }

.td-status-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:500; }
.td-status-badge.online  { background:rgba(29,158,117,0.12); color:#1D9E75; }
.td-status-badge.offline { background:rgba(154,160,176,0.15); color:#9aa0b0; }
.td-dot { width:6px; height:6px; border-radius:50%; }
.td-dot.online  { background:#1D9E75; }
.td-dot.offline { background:#9aa0b0; }

/* Chart */
.td-chart-wrap { position:relative; height:220px; }
.td-loading-overlay {
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  background:rgba(var(--color-surface-rgb,255,255,255),0.7);
  font-size:12px; color:var(--color-text-3); gap:8px; border-radius:var(--radius-lg);
}

/* Gauges */
.td-gauges-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:10px; }
.td-gauge-item { display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 8px; background:var(--color-surface-2); border:1px solid var(--color-border); border-radius:8px; }
.td-gauge-label { font-size:9px; color:var(--color-text-3); text-align:center; text-transform:uppercase; letter-spacing:0.04em; line-height:1.3; }
.td-gauge-value { font-size:13px; font-weight:700; font-family:var(--font-mono); color:var(--color-text-1); }
.td-gauge-sub   { font-size:9px; color:var(--color-text-3); }

/* Statistics bar */
.td-stat-row { display:flex; align-items:center; justify-content:space-between; padding:7px 0; border-bottom:1px solid var(--color-border); font-size:12px; }
.td-stat-row:last-child { border-bottom:none; }

/* Balance */
.td-balance-row { display:flex; align-items:center; gap:10px; padding:5px 0; font-size:12px; }
.td-balance-bar-bg { flex:1; height:6px; border-radius:3px; background:var(--color-border); overflow:hidden; }
.td-balance-bar    { height:100%; border-radius:3px; transition:width 0.4s; }

/* Realtime table */
.td-rt-table { width:100%; border-collapse:collapse; font-size:12px; }
.td-rt-table th { padding:7px 12px; text-align:left; background:var(--color-surface-2); color:var(--color-text-3); font-size:10px; text-transform:uppercase; letter-spacing:0.06em; border-bottom:1px solid var(--color-border); }
.td-rt-table td { padding:7px 12px; border-bottom:1px solid var(--color-border); }
.tr:last-child td { border-bottom:none; }
.td-rt-table tr:hover td { background:var(--color-bg); }
.td-rt-val  { font-family:var(--font-mono); font-weight:500; color:var(--color-text-1); }
.td-rt-unit { font-size:10px; color:var(--color-text-3); margin-left:3px; }

.td-live-dot { width:6px; height:6px; border-radius:50%; background:#1D9E75; display:inline-block; margin-right:4px; animation:pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

.td-section { font-size:11px; font-weight:600; color:var(--color-text-2); text-transform:uppercase; letter-spacing:0.07em; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
.td-section::after { content:''; flex:1; height:1px; background:var(--color-border); }
.td-empty { padding:40px; text-align:center; color:var(--color-text-3); font-size:13px; }
</style>