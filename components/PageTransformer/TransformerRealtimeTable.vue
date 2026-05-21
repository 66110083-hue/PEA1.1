<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  rows: any[]       // realtime snapshot rows (label, value, unit)
  allData: any[]    // ข้อมูล history จาก useDashboard
}>()

type RangeKey = 'live' | '1h' | '3h' | '6h' | '24h'

const rangeKey    = ref<RangeKey>('live')
const customIndex = ref<number>(-1)   

const RANGES: { key: RangeKey; label: string; points: number }[] = [
  { key: 'live', label: 'Live',  points: 1   },
  { key: '1h',   label: '1 ชม.', points: 6   },
  { key: '3h',   label: '3 ชม.', points: 18  },
  { key: '6h',   label: '6 ชม.', points: 36  },
  { key: '24h',  label: '24 ชม.',points: 144 },
]

const historySlice = computed(() => {
  if (!props.allData?.length) return []
  if (rangeKey.value === 'live') return []
  const r = RANGES.find(r => r.key === rangeKey.value)
  if (!r) return []
  return props.allData.slice(-r.points)
})

const viewedPoint = computed(() => {
  if (rangeKey.value === 'live' || customIndex.value < 0) return null
  return props.allData[customIndex.value] ?? null
})

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

const displayRows = computed(() =>
  viewedPoint.value ? pointToRows(viewedPoint.value) : props.rows
)

const prevValues  = ref<Record<string, number>>({})
const changedKeys = ref<Set<string>>(new Set())
let   clearTimer: ReturnType<typeof setTimeout>

watch(
  () => props.rows,
  (newRows) => {
    if (rangeKey.value !== 'live' || !newRows) return
    const changed = new Set<string>()
    newRows.forEach(r => {
      const prev = prevValues.value[r.label]
      if (prev !== undefined && Math.abs((r.value ?? 0) - prev) > 0.001) changed.add(r.label)
      prevValues.value[r.label] = r.value ?? 0
    })
    changedKeys.value = changed
    clearTimeout(clearTimer)
    clearTimer = setTimeout(() => { changedKeys.value = new Set() }, 2000)
  },
  { deep: true, immediate: true }
)

const showHistory = computed(() => rangeKey.value !== 'live' && historySlice.value.length > 0)

const timeOptions = computed(() => {
  if (!historySlice.value.length) return []
  return historySlice.value.map((d, i) => ({
    label: d.label || `--:--`,
    index: props.allData.indexOf(d),
  })).reverse()
})

watch(rangeKey, () => { customIndex.value = -1 })
const isLive = computed(() => rangeKey.value === 'live')
</script>

<template>
  <div class="td-card">
    <div class="td-card-header">
      <div class="td-card-icon"><i class="ti ti-table"/></div>
      <span class="td-card-title">
        <span v-if="isLive" class="td-live-dot"/>
        {{ isLive ? 'Realtime Data' : `History — ${RANGES.find(r=>r.key===rangeKey)?.label}` }}
      </span>

      <div class="trt-range-group">
        <button v-for="r in RANGES" :key="r.key" class="trt-range-btn" :class="{ active: rangeKey === r.key }" @click="rangeKey = r.key">{{ r.label }}</button>
      </div>
    </div>

    <div v-if="!isLive && timeOptions.length" class="trt-time-row">
      <i class="ti ti-clock" style="font-size:13px;color:var(--color-text-3)"/>
      <span style="font-size:11px;color:var(--color-text-3)">เลือกดูเวลา:</span>
      <select class="trt-select" :value="customIndex" @change="customIndex = Number(($event.target as HTMLSelectElement).value)">
        <option :value="-1">— ทั้งหมด (ตาราง) —</option>
        <option v-for="opt in timeOptions" :key="opt.index" :value="opt.index">{{ opt.label }}</option>
      </select>
    </div>

    <div v-if="(isLive || customIndex >= 0) && displayRows.length" style="overflow-x:auto">
      <table class="td-rt-table">
        <thead>
          <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in displayRows" :key="row.label" :class="{ 'td-rt-changed': isLive && changedKeys.has(row.label) }">
            <td>{{ row.label }}</td>
            <td class="td-rt-val">{{ row.value !== undefined && row.value !== null ? row.value.toFixed(3) : '0.000' }}</td>
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
            <th v-for="pt in historySlice" :key="pt.label">{{ pt.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="phase in ['A','B','C']" :key="`V${phase}`">
            <td>Voltage {{ phase }} (V)</td>
            <td v-for="pt in historySlice" :key="pt.label">{{ (pt.voltage?.[phase] ?? 0).toFixed(1) }}</td>
          </tr>
          <tr v-for="phase in ['A','B','C']" :key="`I${phase}`">
            <td>Current {{ phase }} (A)</td>
            <td v-for="pt in historySlice" :key="pt.label">{{ (pt.current?.[phase] ?? 0).toFixed(1) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else style="padding:32px;text-align:center;color:var(--color-text-3);font-size:12px">
      <i class="ti ti-database-off" style="font-size:20px;display:block;margin-bottom:6px"/>
      ยังไม่มีข้อมูลเรียลไทม์ — กดปุ่ม "โหลดข้อมูล" ในหน้า Chart ด้านบน
    </div>
  </div>
</template>

<style scoped>
.td-card { background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-lg); overflow:hidden; }
.td-card-header { display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:12px 16px; border-bottom:1px solid var(--color-border); background:var(--color-surface-2); }
.td-card-icon { width:28px; height:28px; border-radius:6px; background:#2563EB; color:white; display:flex; align-items:center; justify-content:center; }
.td-card-title { font-size:13px; font-weight:600; color:var(--color-text-1); }
.trt-range-group { display:flex; gap:4px; margin-left:auto; }
.trt-range-btn { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; cursor:pointer; border:1px solid var(--color-border-md); background:transparent; color:var(--color-text-2); transition:all 0.12s; }
.trt-range-btn.active { background:var(--color-green); color:white; border-color:transparent; }
.trt-time-row { display:flex; align-items:center; gap:8px; padding:8px 16px; border-bottom:1px solid var(--color-border); background:var(--color-bg); }
.trt-select { padding:4px 8px; border-radius:var(--radius-md); font-size:11px; border:1px solid var(--color-border-md); background:var(--color-surface); color:var(--color-text-1); cursor:pointer; outline:none; }
.td-rt-table { width:100%; border-collapse:collapse; font-size:12px; }
.td-rt-table th { padding:7px 12px; text-align:left; background:var(--color-surface-2); color:var(--color-text-3); font-size:10px; text-transform:uppercase; border-bottom:1px solid var(--color-border); }
.td-rt-table td { padding:7px 12px; border-bottom:1px solid var(--color-border); color:var(--color-text-2); }
.td-rt-table tr:last-child td { border-bottom:none; }
.td-rt-table tr:hover td { background:var(--color-bg); }
.td-rt-val { font-family:var(--font-mono); font-weight:600; color:var(--color-text-1); }
.td-rt-unit { font-size:10px; color:var(--color-text-3); margin-left:3px; }
.td-rt-changed td { background:rgba(29,158,117,0.07) !important; }
.td-rt-changed .td-rt-val { color:#1D9E75 !important; }
.trt-hist-table { width:100%; border-collapse:collapse; font-size:11px; }
.trt-hist-table th { padding:6px 10px; text-align:right; background:var(--color-surface-2); color:var(--color-text-3); font-size:10px; border-bottom:1px solid var(--color-border); }
.trt-hist-table th:first-child { text-align:left; }
.trt-hist-table td { padding:6px 10px; border-bottom:1px solid var(--color-border); text-align:right; color:var(--color-text-1); }
.trt-hist-table td:first-child { text-align:left; color:var(--color-text-2); }
.td-live-dot { width:6px; height:6px; border-radius:50%; background:#1D9E75; display:inline-block; margin-right:4px; animation:pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
</style>