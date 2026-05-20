<script setup lang="ts">
import { ref, computed } from 'vue'
import TransformerGaugeItem from './TransformerGaugeItem.vue'

const props = defineProps<{
  gauges: any[]          // ค่า ณ ปัจจุบัน (latest)
  allData: any[]         // array ข้อมูล 10 นาที จาก useDashboard
}>()

// ── Timeline: index ของ allData ที่กำลังดู ──────────────
const selectedIndex = ref(-1)   // -1 = ล่าสุด (live)

const timeOptions = computed(() => {
  if (!props.allData?.length) return []
  // แสดงทุก 10 จุด (= ทุก 100 นาที) เพื่อไม่ให้ dropdown ยาวเกิน
  // ถ้าอยากแสดงทุกจุดให้เอา .filter ออก
  const step = Math.max(1, Math.floor(props.allData.length / 24))
  return props.allData
    .map((d, i) => ({ label: d.label, index: i }))
    .filter((_, i) => i % step === 0 || i === props.allData.length - 1)
    .reverse()  // ล่าสุดขึ้นก่อน
})

const selectedPoint = computed(() =>
  selectedIndex.value >= 0 ? props.allData[selectedIndex.value] : null
)

// ── แปลง gauge แต่ละตัว ให้ใช้ค่าจาก selectedPoint ถ้ามี ─
const displayGauges = computed(() => {
  const pt = selectedPoint.value
  if (!pt) return props.gauges   // ใช้ค่า live ตามเดิม

  // map label → metric key
  const metricOf: Record<string, { key: 'current' | 'voltage' | 'power'; phase: 'A' | 'B' | 'C' }> = {
    'Voltage L1': { key: 'voltage',  phase: 'A' },
    'Voltage L2': { key: 'voltage',  phase: 'B' },
    'Voltage L3': { key: 'voltage',  phase: 'C' },
    'Current L1': { key: 'current',  phase: 'A' },
    'Current L2': { key: 'current',  phase: 'B' },
    'Current L3': { key: 'current',  phase: 'C' },
    'Active P L1': { key: 'power',   phase: 'A' },
    'Active P L2': { key: 'power',   phase: 'B' },
    'Active P L3': { key: 'power',   phase: 'C' },
  }

  return props.gauges.map(g => {
    const m = metricOf[g.label]
    if (!m) return g
    const val = pt[m.key]?.[m.phase] ?? g.value
    return { ...g, value: val }
  })
})

const isLive = computed(() => selectedIndex.value === -1)

function selectLive() { selectedIndex.value = -1 }
</script>

<style scoped>
.tgg-header {
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:10px; gap:8px; flex-wrap:wrap;
}
.tgg-label {
  font-size:11px; font-weight:600; color:var(--color-text-2);
  text-transform:uppercase; letter-spacing:0.07em;
  display:flex; align-items:center; gap:6px;
}
.tgg-controls { display:flex; align-items:center; gap:6px; }

.tgg-live-btn {
  display:inline-flex; align-items:center; gap:4px;
  padding:4px 10px; border-radius:20px; font-size:11px; font-weight:500;
  cursor:pointer; border:none; transition:all 0.15s; font-family:var(--font-sans);
}
.tgg-live-btn.active { background:var(--color-green); color:white; }
.tgg-live-btn:not(.active) { background:var(--color-surface-2); color:var(--color-text-2); border:1px solid var(--color-border-md); }

.tgg-select {
  padding:4px 8px; border-radius:var(--radius-md); font-size:11px;
  border:1px solid var(--color-border-md); background:var(--color-bg);
  color:var(--color-text-1); font-family:var(--font-mono); cursor:pointer; outline:none;
}

.tgg-timestamp {
  font-size:11px; font-family:var(--font-mono); color:var(--color-text-3);
  background:var(--color-surface-2); padding:3px 8px; border-radius:4px;
}

.td-live-dot {
  width:6px; height:6px; border-radius:50%; background:#1D9E75;
  display:inline-block;
  animation:pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

.td-gauges-grid {
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap:12px;
}

.tgg-no-data {
  text-align:center; padding:24px; color:var(--color-text-3); font-size:12px;
  background:var(--color-surface-2); border-radius:8px; border:1px dashed var(--color-border);
}
</style>

<template>
  <div>
    <!-- Header: Live / เลือกเวลา -->
    <div class="tgg-header">
      <div class="tgg-label">
        <i class="ti ti-gauge"/> Gauge Values
      </div>
      <div class="tgg-controls">
        <!-- Live button -->
        <button
          class="tgg-live-btn"
          :class="{ active: isLive }"
          @click="selectLive"
        >
          <span v-if="isLive" class="td-live-dot"/>
          <i v-else class="ti ti-player-play" style="font-size:10px"/>
          Live
        </button>

        <!-- Dropdown เลือกช่วงเวลา -->
        <select
          v-if="timeOptions.length"
          class="tgg-select"
          :value="selectedIndex"
          @change="selectedIndex = Number(($event.target as HTMLSelectElement).value)"
        >
          <option :value="-1">— เลือกช่วงเวลา —</option>
          <option
            v-for="opt in timeOptions"
            :key="opt.index"
            :value="opt.index"
          >{{ opt.label }}</option>
        </select>

        <!-- Timestamp badge -->
        <span class="tgg-timestamp">
          <template v-if="isLive">🟢 ล่าสุด</template>
          <template v-else>🕐 {{ selectedPoint?.label ?? '--:--' }}</template>
        </span>
      </div>
    </div>

    <!-- Gauges -->
    <div v-if="displayGauges.length" class="td-gauges-grid">
      <TransformerGaugeItem
        v-for="g in displayGauges"
        :key="g.label"
        v-bind="g"
      />
    </div>
    <div v-else class="tgg-no-data">
      <i class="ti ti-chart-radar" style="font-size:20px;display:block;margin-bottom:6px"/>
      ยังไม่มีข้อมูล — กดปุ่ม "โหลดข้อมูล" เพื่อดู gauge
    </div>
  </div>
</template>