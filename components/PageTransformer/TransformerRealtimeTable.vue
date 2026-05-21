<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  rows: any[]       // realtime snapshot rows (label, value, unit)
  allData: any[]    // ข้อมูล history ทุก 10 นาที จาก useDashboard
}>()

// ── เลือกช่วงเวลาที่จะดู ─────────────────────────────────
type RangeKey = 'live' | '1h' | '3h' | '6h' | '24h'

const rangeKey    = ref<RangeKey>('live')
const customIndex = ref<number>(-1)   // -1 = ไม่ได้เลือก custom

const RANGES: { key: RangeKey; label: string; points: number }[] = [
  { key: 'live', label: 'Live',  points: 1   },
  { key: '1h',   label: '1 ชม.', points: 6   },
  { key: '3h',   label: '3 ชม.', points: 18  },
  { key: '6h',   label: '6 ชม.', points: 36  },
  { key: '24h',  label: '24 ชม.',points: 144 },
]

// ── slice allData ตาม range ─────────────────────────────
const historySlice = computed(() => {
  if (!props.allData?.length) return []
  if (rangeKey.value === 'live') return []
  const r = RANGES.find(r => r.key === rangeKey.value)
  if (!r) return []
  return props.allData.slice(-r.points)
})

// ── snapshot ที่กำลังดู (จาก custom dropdown) ───────────
const viewedPoint = computed(() => {
  if (rangeKey.value === 'live' || customIndex.value < 0) return null
  return props.allData[customIndex.value] ?? null
})

// แปลง allData point → rows format เหมือน props.rows
function pointToRows(pt: any): any[] {
  if (!pt) return []
  return [
    { label: 'Voltage Phase A',   value: pt.voltage?.A ?? 0, unit: 'V'   },
    { label: 'Voltage Phase B',   value: pt.voltage?.B ?? 0, unit: 'V'   },
    { label: 'Voltage Phase C',   value: pt.voltage?.C ?? 0, unit: 'V'   },
    { label: 'Current Phase A',   value: pt.current?.A ?? 0, unit: 'A'   },
    { label: 'Current Phase B',   value: pt.current?.B ?? 0, unit: 'A'   },
    { label: 'Current Phase C',   value: pt.current?.C ?? 0, unit: 'A'   },
    { label: 'Power Phase A',     value: pt.power?.A   ?? 0, unit: 'kW'  },
    { label: 'Power Phase B',     value: pt.power?.B   ?? 0, unit: 'kW'  },
    { label: 'Power Phase C',     value: pt.power?.C   ?? 0, unit: 'kW'  },
  ]
}

// ── rows ที่จะแสดง ─────────────────────────────────────
const displayRows = computed(() =>
  viewedPoint.value ? pointToRows(viewedPoint.value) : props.rows
)

// ── Highlight: เปรียบเทียบกับ row ก่อนหน้า ─────────────
// เก็บค่าก่อนหน้าไว้ detect การเปลี่ยน
const prevValues  = ref<Record<string, number>>({})
const changedKeys = ref<Set<string>>(new Set())
let   clearTimer: ReturnType<typeof setTimeout>

watch(
  () => props.rows,
  (newRows) => {
    if (rangeKey.value !== 'live') return
    const changed = new Set<string>()
    newRows.forEach(r => {
      const prev = prevValues.value[r.label]
      if (prev !== undefined && Math.abs(r.value - prev) > 0.001) changed.add(r.label)
      prevValues.value[r.label] = r.value
    })
    changedKeys.value = changed
    clearTimeout(clearTimer)
    clearTimer = setTimeout(() => { changedKeys.value = new Set() }, 2000)
  },
  { deep: true }
)

// ── History table (multi-row) ───────────────────────────
const showHistory = computed(() => rangeKey.value !== 'live' && historySlice.value.length > 0)

// timeline dropdown options
const timeOptions = computed(() => {
  if (!historySlice.value.length) return []
  return historySlice.value.map((d, i) => ({
    label: d.label,
    index: props.allData.indexOf(d),
  })).reverse()
})

// reset custom index เมื่อเปลี่ยน range
watch(rangeKey, () => { customIndex.value = -1 })

const isLive = computed(() => rangeKey.value === 'live')
</script>

<template>
  <div class="td-card">

    <div class="td-card-header">
      <div class="td-card-icon"><i class="ti ti-table"/></div>
      <span class="td-card-title">
        <span>Latest Update</span>
        <span style="margin-left: 8px; font-size: 11px; color: var(--color-text-3); font-weight: normal;">
          🕒 {{ allData[allData.length - 1]?.label || 'กำลังรอข้อมูล...' }} 
          <span style="color: var(--color-green); margin-left: 4px;">(อัปเดตทุก 10 นาที)</span>
        </span>
      </span>

      <div class="trt-range-group">
        <button
          v-for="r in RANGES"
          :key="r.key"
          class="trt-range-btn"
          :class="{ active: rangeKey === r.key }"
          @click="rangeKey = r.key"
        >{{ r.label }}</button>
      </div>
    </div>

    <div v-if="!isLive && timeOptions.length" class="trt-time-row">
      <i class="ti ti-clock" style="font-size:13px;color:var(--color-text-3)"/>
      <span style="font-size:11px;color:var(--color-text-3)">เลือกดูเวลา:</span>
      <select
        class="trt-select"
        :value="customIndex"
        @change="customIndex = Number(($event.target as HTMLSelectElement).value)"
      >
        <option :value="-1">— ทั้งหมด (ตาราง) —</option>
        <option
          v-for="opt in timeOptions"
          :key="opt.index"
          :value="opt.index"
        >{{ opt.label }}</option>
      </select>
      <span class="trt-timestamp">
        {{ customIndex >= 0 ? `🕐 ${displayRows[0]?.timestamp ?? timeOptions.find(o=>o.index===customIndex)?.label ?? '--:--'}` : `${historySlice.length} จุด (ทุก 10 นาที)` }}
      </span>
    </div>

    <div v-if="isLive || customIndex >= 0" style="overflow-x:auto">
      <table class="td-rt-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in displayRows"
            :key="row.label"
            :class="{ 'td-rt-changed': isLive && changedKeys.has(row.label) }"
          >
            <td>{{ row.label }}</td>
            <td class="td-rt-val">{{ row.value !== undefined && row.value !== null ? row.value.toFixed(2) : '0.00' }}</td>
            <td><span class="td-rt-unit">{{ row.unit }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="showHistory" style="overflow-x:auto">
      <table class="trt-hist-table">
        <thead>
          <tr>
            <th>Parameter / เวลา</th>
            <th
              v-for="pt in historySlice"
              :key="pt.label"
            >{{ pt.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="phase in ['A','B','C']" :key="`V${phase}`">
            <td>Voltage {{ phase }} (V)</td>
            <td v-for="pt in historySlice" :key="pt.label">
              {{ (pt.voltage?.[phase] ?? 0).toFixed(1) }}
            </td>
          </tr>
          <tr v-for="phase in ['A','B','C']" :key="`I${phase}`">
            <td>Current {{ phase }} (A)</td>
            <td v-for="pt in historySlice" :key="pt.label">
              {{ (pt.current?.[phase] ?? 0).toFixed(1) }}
            </td>
          </tr>
          <tr v-for="phase in ['A','B','C']" :key="`P${phase}`">
            <td>Power {{ phase }} (kW)</td>
            <td v-for="pt in historySlice" :key="pt.label">
              {{ (pt.power?.[phase] ?? 0).toFixed(1) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else
      style="padding:32px;text-align:center;color:var(--color-text-3);font-size:12px"
    >
      <i class="ti ti-database-off" style="font-size:20px;display:block;margin-bottom:6px"/>
      ยังไม่มีข้อมูล — กดปุ่ม "โหลดข้อมูล" ในหน้า Chart
    </div>

  </div>
</template>

<style scoped>
/* Card shell */
.td-card {
  background:var(--color-surface);
  border:1px solid var(--color-border);
  border-radius:var(--radius-lg);
  overflow:hidden;
}
.td-card-header {
  display:flex; align-items:center; gap:8px; flex-wrap:wrap;
  padding:12px 16px; border-bottom:1px solid var(--color-border);
  background:var(--color-surface-2);
}
.td-card-icon {
  width:28px; height:28px; border-radius:6px;
  background:#5723e6; color:white;
  display:flex; align-items:center; justify-content:center;
}
.td-card-title { font-size:13px; font-weight:600; color:var(--color-text-1); }

/* Range pills */
.trt-range-group { display:flex; gap:4px; margin-left:auto; }
.trt-range-btn {
  padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500;
  cursor:pointer; border:1px solid var(--color-border-md);
  background:transparent; color:var(--color-text-2);
  font-family:var(--font-sans); transition:all 0.12s;
}
.trt-range-btn.active { background:var(--color-green); color:white; border-color:transparent; }

/* Time selector row */
.trt-time-row {
  display:flex; align-items:center; gap:8px;
  padding:8px 16px; border-bottom:1px solid var(--color-border);
  background:var(--color-bg);
}
.trt-select {
  padding:4px 8px; border-radius:var(--radius-md); font-size:11px;
  border:1px solid var(--color-border-md); background:var(--color-surface);
  color:var(--color-text-1); font-family:var(--font-mono); cursor:pointer; outline:none;
}
.trt-timestamp {
  font-size:11px; font-family:var(--font-mono); color:var(--color-text-3);
  background:var(--color-surface-2); padding:3px 8px; border-radius:4px; margin-left:auto;
}

/* Tables */
.td-rt-table { width:100%; border-collapse:collapse; font-size:12px; }
.td-rt-table th {
  padding:7px 12px; text-align:left;
  background:var(--color-surface-2); color:var(--color-text-3);
  font-size:10px; text-transform:uppercase; letter-spacing:0.06em;
  border-bottom:1px solid var(--color-border);
}
.td-rt-table td { padding:7px 12px; border-bottom:1px solid var(--color-border); color:var(--color-text-2); }
.td-rt-table tr:last-child td { border-bottom:none; }
.td-rt-table tr:hover td { background:var(--color-bg); }
.td-rt-val { font-family:var(--font-mono); font-weight:600; color:var(--color-text-1); }
.td-rt-unit { font-size:10px; color:var(--color-text-3); margin-left:3px; }

/* Highlight row เมื่อค่าเปลี่ยน */
.td-rt-changed td { background:rgba(29,158,117,0.07) !important; }
.td-rt-changed .td-rt-val { color:#1D9E75 !important; }
@keyframes flash { 0%{opacity:0.4} 100%{opacity:1} }
.td-rt-changed { animation:flash 0.4s ease-out; }

/* History multi-col table */
.trt-hist-table { width:100%; border-collapse:collapse; font-size:11px; }
.trt-hist-table th {
  padding:6px 10px; text-align:right; white-space:nowrap;
  background:var(--color-surface-2); color:var(--color-text-3);
  font-size:10px; border-bottom:1px solid var(--color-border);
  font-family:var(--font-mono);
}
.trt-hist-table th:first-child { text-align:left; }
.trt-hist-table td {
  padding:6px 10px; border-bottom:1px solid var(--color-border);
  text-align:right; font-family:var(--font-mono); color:var(--color-text-1);
  white-space:nowrap;
}
.trt-hist-table td:first-child { text-align:left; color:var(--color-text-2); }
.trt-hist-table tr:last-child td { border-bottom:none; }
.trt-hist-table tr:hover td { background:var(--color-bg); }

/* Live dot */
.td-live-dot {
  width:6px; height:6px; border-radius:50%; background:#1D9E75;
  display:inline-block; margin-right:4px;
  animation:pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
</style>