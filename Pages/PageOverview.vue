<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useDashboard, METRIC_TABS } from '~/composables/useDashboard.ts'
import { useSiteData } from '~/composables/useSiteData'
import '~/assets/css/dashboard-compact.css'

import PhaseCard      from '~/components/PageOverview/PhaseCard.vue'
import EnergyFilter   from '~/components/PageOverview/EnergyFilter.vue'
import PhaseSelector  from '~/components/PageOverview/PhaseSelector.vue'
import UnifiedAnalysisChart from '~/components/Common/UnifiedAnalysisChart.vue'

const SiteMap = defineAsyncComponent(() => import('~/components/Page map/SiteMap.vue'))

const {
  activeMetric, activePhases,
  hasData, isLoading,
  PHASES, latest, statistics, balanceData, unit, lastUpdateText,
  handleFilter: apiFilter,
  allData
} = useDashboard()

const { allSites, fetchSites } = useSiteData()
const selectedSiteId = ref<string | null>(null)

onMounted(() => {
  fetchSites()
})

const chartXData = computed(() => {
  if (!allData.value) return []
  return allData.value.map((d: any) => {
    if (!d.timestamp) return d.label
    const dateObj = new Date(d.timestamp)
    const day   = String(dateObj.getDate()).padStart(2, '0')
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    return `${day}/${month} ${d.label}`
  })
})

const chartSeries = computed(() => {
  if (!allData.value || allData.value.length === 0) return []
  const metric = activeMetric.value as 'current' | 'voltage' | 'power'
  return PHASES.filter((p: any) => activePhases.value.includes(p.id)).map((p: any) => {
    return {
      name: `เฟส ${p.id}`,
      color: p.color,
      data: allData.value.map((d: any) => d[metric]?.[p.id] || 0),
      showArea: metric === 'power'
    }
  })
})

function handleLocationUpdate(payload: { siteId: string }) {
  selectedSiteId.value = payload.siteId || null
}

function handleFilter(payload: { siteId: string; startDate: string; endDate: string }) {
  selectedSiteId.value = payload.siteId || null
  apiFilter(payload)
}

function onMapSelect(id: string) {
  selectedSiteId.value = selectedSiteId.value === id ? null : id
}
</script>

<template>
  <div class="main-content">
    <template v-if="hasData">
      <div class="phase-grid">
        <PhaseCard
          v-for="ph in PHASES" 
          :key="ph.id"
          :phase="ph.id" 
          :color="ph.color"
          :current="latest?.[ph.id]?.current ?? 0"
          :voltage="latest?.[ph.id]?.voltage ?? 0"
          :power="latest?.[ph.id]?.power ?? 0"
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
        <!-- สถิติประมวลผล (แก้ไขให้ตรงและไม่เบี้ยว) -->
        <div class="card dashboard-card">
          <div class="card-inner">
            <div class="card-title mb-4">
              <i class="ti ti-calculator text-blue" />
              <span>สถิติประมวลผล</span>
            </div>
            <div class="card-body-content">
              <div v-for="s in statistics" :key="s.label" class="stats-row-custom" 
                   style="display: grid; grid-template-columns: 1fr auto; align-items: start; padding: 10px 0; border-bottom: 1px solid #f3f4f6; min-height: 58px;">
                <span class="text-muted" style="font-size: 13px; align-self: center;">{{ s.label }}</span>
                <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
                  <span class="font-mono fw-bold stat-value" :style="{ color: s.color }">{{ s.value }}</span>
                  <div v-if="s.sub" style="font-size: 10px; color: var(--color-text-3); margin-top: 2px; line-height: 1.2;">{{ s.sub }}</div>
                  <div v-else style="height: 12px;"></div> <!-- พื้นที่ว่างกันแถวเบี้ยว -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ความสมดุล 3 เฟส -->
        <div class="card dashboard-card">
          <div class="card-inner">
            <div class="card-title mb-4">
              <i class="ti ti-chart-bar text-amber" />
              <span>ความสมดุล 3 เฟส (เฉลี่ย)</span>
            </div>
            <div class="card-body-content">
              <div v-for="ph in balanceData" :key="ph.id" class="balance-item" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                  <span class="text-muted" style="font-size: 13px;">เฟส {{ ph.id }}</span>
                  <span class="font-mono fw-bold" style="font-size: 14px;">
                    {{ ph.avg.toFixed(1) }} <small class="text-3" style="font-size: 11px;">{{ unit }}</small>
                  </span>
                </div>
                <div style="background: #f3f4f6; height: 6px; border-radius: 3px; overflow: hidden; width: 100%;">
                  <div :style="{ width: ph.pct + '%', background: ph.color, height: '100%', borderRadius: '3px', transition: 'width 0.6s' }" />
                </div>
                <div style="font-size: 10px; color: var(--color-text-3); text-align: right; margin-top: 4px;">
                   {{ ph.pct.toFixed(0) }}% ของโหลดสูงสุด
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <ClientOnly>
      <SiteMap :sites="allSites" :selected-site-id="selectedSiteId" @select="onMapSelect" />
    </ClientOnly>
  </div>
</template>

<style scoped>
.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>