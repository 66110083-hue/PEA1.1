<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { usePhaseSelection } from '~/composables/usePhaseSelection'
import { useEnergyData } from '~/composables/useEnergyData'
import { useEnergyChart } from '~/composables/useEnergyChart'
import '~/assets/css/dashboard-compact.css'
import PhaseCard     from '~/components/ui/PhaseCard.vue'
import EnergyFilter  from '~/components/ui/EnergyFilter.vue'
import PhaseSelector from '~/components/ui/PhaseSelector.vue'

// ─── State ───────────────────────────────────────────────
const activeMetric = ref('current')
const hasData      = ref(false)        // ← ตัวควบคุมว่ามีข้อมูลแล้วหรือยัง
let autoRefreshTimer: any = null

const { PHASES, activePhases }                                        = usePhaseSelection()
const { allData, isLoading, latest, statistics, balanceData, unit, lastUpdateText } = useEnergyData(activeMetric, activePhases, PHASES)
const { init, refreshChart }                                          = useEnergyChart('historyLineChart', allData, activeMetric, activePhases, PHASES)

const METRIC_TABS = [
  { key: 'current', label: 'Current (A)' },
  { key: 'voltage', label: 'Voltage (V)' },
  { key: 'power',   label: 'Power (kW)'  },
]

// ─── Fetch ───────────────────────────────────────────────
const handleFilter = async (f: any) => {
  isLoading.value = true

  await new Promise(r => setTimeout(r, 800))
  // TODO: แทนด้วย → allData.value = await $fetch(`/api/...`)
  const now = new Date()
  now.setMinutes(Math.floor(now.getMinutes() / 10) * 10, 0, 0)
  allData.value = Array.from({ length: 1000 }, (_, i) => {
    const t   = new Date(now.getTime() - (999 - i) * 10 * 60000)
    const rnd = (b: number, r: number) => +(b + (Math.random() - 0.5) * r).toFixed(1)
    return {
      label:     `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`,
      timestamp: t,
      current:   { A: rnd(60,8),  B: rnd(62,7),  C: rnd(58,9)  },
      voltage:   { A: rnd(220,3), B: rnd(219,3),  C: rnd(221,3) },
      power:     { A: rnd(12,2),  B: rnd(13,2),   C: rnd(11,2)  },
    }
  })

  isLoading.value = false
  hasData.value   = true   // ← เปิดให้แสดง Component
  await nextTick()
  init()
  refreshChart()
}

// ─── Lifecycle ───────────────────────────────────────────
onMounted(() => {
  setTimeout(() => init(), 150)  // แค่ init chart canvas ก่อน ยังไม่ดึงข้อมูล

  autoRefreshTimer = setInterval(() => {
    if (allData.value.length > 0) {   // รันเฉพาะเมื่อมีข้อมูลแล้ว
      handleFilter({})
    }
  }, 10 * 60 * 1000)
})

onUnmounted(() => clearInterval(autoRefreshTimer))

watch([activeMetric, activePhases], refreshChart)
</script>

<template>
  <div class="main-content">

    <!-- Phase Cards — ซ่อนจนกว่าจะมีข้อมูล -->
    <template v-if="hasData">
      <div class="phase-grid">
        <PhaseCard
          v-for="ph in PHASES" :key="ph.id"
          v-bind="latest[ph.id]"
          :phase="ph.id"
          :color="ph.color"
          :label="`ค่าล่าสุด (${lastUpdateText})`"
        />
      </div>
    </template>

    <!-- Chart card -->
    <div class="card dashboard-card">
      <div class="card-header-dashboard">
        <div class="card-title">
          <i class="ti ti-chart-line text-green" />
          <span>ข้อมูลย้อนหลัง 1,000 จุด</span>
        </div>

        <div class="controls-group">
          <EnergyFilter :loading="isLoading" @apply="handleFilter" />
          <PhaseSelector v-model="activePhases" />
          <div class="period-tabs">
            <button
              v-for="m in METRIC_TABS" :key="m.key"
              :class="['period-tab', { active: activeMetric === m.key }]"
              @click="activeMetric = m.key"
            >{{ m.label }}</button>
          </div>
        </div>
      </div>

      <!-- Empty state — ก่อนกดดึงข้อมูล -->
      <div v-if="!hasData && !isLoading" class="empty-state">
        <i class="ti ti-map-pin" style="font-size:32px;color:var(--color-text-3)" />
        <div style="font-weight:500;color:var(--color-text-2)">เลือกจุดติดตั้งและวันที่</div>
        <div style="font-size:12px;color:var(--color-text-3)">แล้วกด "ดึงข้อมูล" เพื่อแสดงผล</div>
      </div>

      <!-- Loading state -->
      <div v-else-if="isLoading" class="empty-state">
        <i class="ti ti-loader-2" style="font-size:32px;color:var(--color-green);animation:spin 1s linear infinite" />
        <div style="color:var(--color-text-2)">กำลังดึงข้อมูล 1,000 จุด...</div>
      </div>

      <!-- Chart -->
      <div v-else class="chart-container-wrap">
        <canvas id="historyLineChart" />
      </div>
    </div>

    <!-- Stats + Balance — ซ่อนจนกว่าจะมีข้อมูล -->
    <template v-if="hasData">
      <div class="equal-height-row">

        <div class="card dashboard-card">
          <div class="card-inner">
            <div class="card-title mb-4">
              <i class="ti ti-calculator text-blue" />
              <span>สถิติจาก 1,000 จุด</span>
            </div>
            <div class="card-body-content">
              <div v-for="s in statistics" :key="s.label" class="stats-row-custom">
                <span class="text-muted">{{ s.label }}</span>
                <span class="font-mono fw-bold stat-value" :style="{ color: s.color }">
                  {{ s.value }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="card dashboard-card">
          <div class="card-inner">
            <div class="card-title mb-4">
              <i class="ti ti-chart-bar text-amber" />
              <span>ความสมดุล 3 เฟส (เฉลี่ย)</span>
            </div>
            <div class="card-body-content">
              <div v-for="ph in balanceData" :key="ph.id" class="balance-item">
                <div class="balance-head">
                  <span class="text-muted">เฟส {{ ph.id }}</span>
                  <span class="font-mono fw-bold stat-value">
                    {{ ph.avg.toFixed(1) }}
                    <small class="text-3">{{ unit }}</small>
                  </span>
                </div>
                <div class="be-bar-global">
                  <div class="be-fill-global" :style="{ width: ph.pct+'%', background: ph.color }" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </template>

  </div>
</template>