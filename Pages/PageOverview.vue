<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useDashboard, METRIC_TABS } from '~/composables/useDashboard.ts'
import { useSiteData } from '~/composables/useSiteData'
import '~/assets/css/dashboard-compact.css'

// Import Components ของหน้า Dashboard
import PhaseCard      from '~/components/PageOverview/PhaseCard.vue'
import EnergyFilter   from '~/components/PageOverview/EnergyFilter.vue'
import PhaseSelector  from '~/components/PageOverview/PhaseSelector.vue'
import UnifiedAnalysisChart from '~/components/Common/UnifiedAnalysisChart.vue'

// Import แผนที่แบบ Async (เพื่อป้องกันปัญหา Window is not defined บน Nuxt/SSR)
const SiteMap = defineAsyncComponent(() =>
  import('~/components/Page map/SiteMap.vue')
)

// 1. ดึง State ของกราฟและข้อมูลการใช้พลังงานมาจาก useDashboard
const {
  activeMetric, activePhases,
  hasData, isLoading,
  PHASES, latest, statistics, balanceData, unit, lastUpdateText,
  handleFilter: apiFilter,
  allData
} = useDashboard()

// 2. ดึง State ของตำแหน่งไซต์ทั้งหมดจาก API
const { allSites, fetchSites } = useSiteData()

// State กลางสำหรับเก็บ ID ไซต์ที่ผู้ใช้เลือก (ไม่มีจังหวัดและอำเภอแล้ว)
const selectedSiteId = ref<string | null>(null)

// 3. โหลดข้อมูลจุดติดตั้งบนแผนที่ทันทีที่เปิดหน้านี้
onMounted(() => {
  fetchSites()
})

// ─── การคำนวณและเตรียมข้อมูลสำหรับ ECharts ─────────────────────────

// สร้างข้อมูลแกน X (เวลา)
const chartXData = computed(() => {
  if (!allData.value) return []
  return allData.value.map((d: any) => d.label)
})

// สร้างข้อมูลแกน Y (เส้นกราฟตามเฟสและประเภทข้อมูล)
const chartSeries = computed(() => {
  if (!allData.value || allData.value.length === 0) return []
  const metric = activeMetric.value as 'current' | 'voltage' | 'power'
  
  return PHASES.filter((p: any) => activePhases.value.includes(p.id)).map((p: any) => {
    return {
      name: `เฟส ${p.id}`,
      color: p.color,
      data: allData.value.map((d: any) => d[metric]?.[p.id] || 0),
      showArea: metric === 'power' // เปิดแรเงาใต้กราฟถ้าเป็น Power
    }
  })
})

// ─── การจัดการข้อมูลแผนที่ (SiteMap) ─────────────────────────────────

// กรองหมุดที่จะแสดงบนแผนที่
const filteredSites = computed(() => {
  // ถ้ามีการเลือกไซต์ใดไซต์หนึ่ง ให้แสดงแค่หมุดนั้น
  if (selectedSiteId.value) {
    return allSites.filter(s => s.id === selectedSiteId.value)
  }
  // ถ้าไม่ได้เลือก ให้แสดงหมุดทั้งหมดที่ได้จาก API
  return allSites
})

// รับ Event จาก EnergyFilter เมื่อเปลี่ยนค่า Dropdown
function handleLocationUpdate(payload: { siteId: string }) {
  selectedSiteId.value = payload.siteId || null
}

// รับ Event จาก EnergyFilter เมื่อกดปุ่ม "ดึงข้อมูล"
function handleFilter(payload: { siteId: string; startDate: string; endDate: string }) {
  selectedSiteId.value = payload.siteId || null
  apiFilter(payload) // ส่ง Payload ข้ามไปให้ Dashboard คำนวณกราฟ
}

// รับ Event จาก SiteMap เมื่อคลิกที่หมุดบนแผนที่
function onMapSelect(id: string) {
  // กดซ้ำเพื่อยกเลิก หรือกดเพื่อเลือกหมุด
  selectedSiteId.value = selectedSiteId.value === id ? null : id
}
</script>

<template>
  <div class="main-content">

    <template v-if="hasData">
      <div class="phase-grid">
        <PhaseCard
          v-for="ph in PHASES" :key="ph.id"
          v-bind="latest[ph.id]"
          :phase="ph.id" :color="ph.color"
          :label="`ค่าล่าสุด (${lastUpdateText})`"
        />
      </div>
    </template>

    <div class="card dashboard-card">
      <div class="card-header-dashboard">
        <div class="card-title">
          <i class="ti ti-chart-line text-green" />
          <span>ข้อมูลย้อนหลัง</span>
        </div>
        
        <div class="controls-group">
          <EnergyFilter 
            :loading="isLoading" 
            :init-site-id="selectedSiteId || ''"
            @apply="handleFilter" 
            @update:location="handleLocationUpdate"
          />
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

      <div v-if="!hasData && !isLoading" class="empty-state">
        <i class="ti ti-map-pin" style="font-size:32px;color:var(--color-text-3)" />
        <div style="font-weight:500;color:var(--color-text-2)">เลือกจุดติดตั้งและวันที่</div>
        <div style="font-size:12px;color:var(--color-text-3)">แล้วกด "ดึงข้อมูล" เพื่อแสดงผลกราฟ</div>
      </div>

      <div v-else-if="isLoading" class="empty-state">
        <i class="ti ti-loader-2 spin-icon" style="font-size:32px;color:var(--color-green);" />
        <div style="color:var(--color-text-2)">กำลังดึงข้อมูล...</div>
      </div>

      <div v-else class="chart-container-wrap">
        <UnifiedAnalysisChart 
          :x-axis-data="chartXData" 
          :datasets="chartSeries"
          :show-zoom="true" 
          :show-smooth="true"
        />
      </div>
    </div>

    <template v-if="hasData">
      <div class="equal-height-row">
        
        <div class="card dashboard-card">
          <div class="card-inner">
            <div class="card-title mb-4">
              <i class="ti ti-calculator text-blue" />
              <span>สถิติประมวลผล</span>
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

    <ClientOnly>
      <SiteMap
        :sites="allSites"
        :selected-site-id="selectedSiteId"
        @select="onMapSelect"
      />
    </ClientOnly>

  </div>
</template>

<style scoped>
/* เพิ่มคลาสนี้ป้องกันกรณีไม่ได้ประกาศแอนิเมชัน spin ไว้ที่ไฟล์ global */
.spin-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
</style>