<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useDashboard, METRIC_TABS } from '~/composables/useDashboard.ts'
import { useSiteData } from '~/composables/useSiteData'
import '~/assets/css/dashboard-compact.css'
import PhaseCard     from '~/components/PageOverview/PhaseCard.vue'
import EnergyFilter  from '~/components/PageOverview/EnergyFilter.vue'
import PhaseSelector from '~/components/PageOverview/PhaseSelector.vue'

const SiteMap = defineAsyncComponent(() =>
  import('~/components/Page map/SiteMap.vue')
)

const {
  activeMetric, activePhases,
  hasData, isLoading,
  PHASES, latest, statistics, balanceData, unit, lastUpdateText,
  handleFilter: apiFilter,
} = useDashboard()

const { allSites } = useSiteData()

// ── state ที่ใช้ร่วมกันระหว่าง EnergyFilter ↔ SiteMap ──
const selectedProvince = ref('')
const selectedDistrict = ref('')
const selectedSiteId   = ref<string | null>(null)

// กรอง sites ตามระดับข้อมูลส่งไปให้แผนที่แสดงผลหมุด
const filteredSites = computed(() => {
  if (selectedSiteId.value) {
    return allSites.filter(s => s.id === selectedSiteId.value)
  }
  if (selectedDistrict.value) {
    return allSites.filter(s =>
      s.province === selectedProvince.value &&
      s.district === selectedDistrict.value
    )
  }
  if (selectedProvince.value) {
    return allSites.filter(s => s.province === selectedProvince.value)
  }
  return allSites
})

// 🔥 ฟังก์ชันใหม่: อัปเดตพิกัดทันทีเมื่อเลือกใน Dropdown (แผนที่จะซูม Real-time ทันที)
function handleLocationUpdate(payload: { province: string; district: string; siteId: string }) {
  selectedProvince.value = payload.province
  selectedDistrict.value = payload.district
  selectedSiteId.value   = payload.siteId || null
}

// รับ event จาก EnergyFilter เมื่อกดปุ่ม "ดึงข้อมูล" (สำหรับอัปเดตกราฟและข้อมูล API)
function handleFilter(payload: {
  province: string
  district: string
  siteId: string
  date: string
}) {
  selectedProvince.value = payload.province
  selectedDistrict.value = payload.district
  selectedSiteId.value   = payload.siteId || null
  
  apiFilter(payload)
}

// รับ event จาก SiteMap เมื่อคลิก marker บนแผนที่
function onMapSelect(id: string) {
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
          :phase="ph.id"
          :color="ph.color"
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
        <div style="font-size:12px;color:var(--color-text-3)">แล้วกด "ดึงข้อมูล" เพื่อแสดงผล</div>
      </div>

      <div v-else-if="isLoading" class="empty-state">
        <i class="ti ti-loader-2" style="font-size:32px;color:var(--color-green);animation:spin 1s linear infinite" />
        <div style="color:var(--color-text-2)">กำลังดึงข้อมูล 1,000 จุด...</div>
      </div>

      <div v-else class="chart-container-wrap">
        <canvas id="historyLineChart" />
      </div>
    </div>

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

    <ClientOnly>
      <SiteMap
        :sites="filteredSites"
        :selected-site-id="selectedSiteId"
        :selected-province="selectedProvince" 
        :selected-district="selectedDistrict" 
        @select="onMapSelect"
      />
    </ClientOnly>

  </div>
</template>