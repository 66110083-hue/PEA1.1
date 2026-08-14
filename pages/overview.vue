<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useDashboard, METRIC_TABS } from '~/composables/useDashboard.ts'
import { useSiteData } from '~/composables/useSiteData'
import '~/assets/css/dashboard-compact.css'

import PhaseCard from '~/components/PageOverview/PhaseCard.vue'
import EnergyFilter from '~/components/PageOverview/EnergyFilter.vue'
import PhaseSelector from '~/components/PageOverview/PhaseSelector.vue'
import UnifiedAnalysisChart from '~/components/Common/UnifiedAnalysisChart.vue'

const SiteMap = defineAsyncComponent(() => import('~/components/Page map/SiteMap.vue'))

// 🔥 1. ดึงค่าจากไฟล์ .env (อ่านได้ทั้งจาก .env, test.env, หรือ guest.env)
const config = useRuntimeConfig()

// เปลี่ยนมาเขียนแบบนี้ครับ
const isMaintenance = String(config.public.maintenanceMode) === 'true'
const isGuestMode = String(config.public.guestMode) === 'true'

const {
  activeMetric, activePhases,
  hasData, isLoading,
  PHASES, latest, statistics, lastUpdateText,
  handleFilter: apiFilter,
  allData
} = useDashboard()

const { allSites, fetchSites } = useSiteData()
const selectedSiteId = ref<string | null>(null)

onMounted(() => {
  // ไม่ต้อง fetch ข้อมูลถ้าอยู่ในโหมดซ่อมบำรุง
  if (!isMaintenance) {
    fetchSites()
  } else {
    console.log('⚠️ ระบบกำลังอยู่ในโหมดซ่อมบำรุง (Maintenance Mode)')
  }
  
  // แจ้งเตือนใน Console ถ้าเป็นโหมด Guest
  if (isGuestMode) {
    console.log('👋 กำลังรันในโหมดผู้เยี่ยมชม (Guest Mode)')
  }
})

// ฟังก์ชันแปลงค่าและเช็คตัวเลข (เปลี่ยน nan หรือ null เป็น 0 เพื่อให้กราฟวาดได้)
const parseVal = (val: any): number => {
  if (val === undefined || val === null || val === 'nan' || val === 'NaN' || val === '') return 0
  if (typeof val === 'object') {
    return parseVal(val.total ?? val.Total ?? val.value ?? val.val ?? Object.values(val)[0])
  }
  const num = Number(val)
  return isNaN(num) ? 0 : num
}

// เช็คว่า allData มาในรูปแบบ Array Column จาก API หรือไม่
const isColumnFormat = computed(() => {
  return allData.value && allData.value.length > 0 && allData.value[0]?.label && Array.isArray(allData.value[0]?.data)
})

const chartXData = computed(() => {
  if (!allData.value || allData.value.length === 0) return []
  if (isColumnFormat.value) {
    const timeCol = allData.value.find((c: any) => c.label === 'timestamp' || c.label === 'time')
    if (timeCol && timeCol.data) {
      return timeCol.data.map((t: string) => {
        if (!t || t === 'nan') return ''
        const d = new Date(t)
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      })
    }
    return []
  }
  return allData.value.map((d: any) => {
    if (!d.timestamp) return d.label
    const dateObj = new Date(d.timestamp)
    return `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')} ${d.label || ''}`
  })
})

// ดึงค่า Power ล่าสุด
const latestTotalPower = computed(() => {
  if (!allData.value || allData.value.length === 0) return 0

  if (isColumnFormat.value) {
    const col = allData.value.find((c: any) => c.label === 'P_Total' || c.label === 'powerTotal')
    if (!col || !col.data) return 0

    // วนจากท้าย array ไปหาค่าที่ไม่ใช่ nan ตัวล่าสุด
    for (let i = col.data.length - 1; i >= 0; i--) {
      const raw = col.data[i]
      if (raw === undefined || raw === null) continue
      if (typeof raw === 'string' && raw.trim().toLowerCase() === 'nan') continue
      const val = Number(raw)
      if (!isNaN(val)) return val
    }
    return 0
  }
   // fallback สำหรับ row format
  for (let i = allData.value.length - 1; i >= 0; i--) {
    const item = allData.value[i]
    if (item && item.powerTotal !== undefined && item.powerTotal !== null) {
      const val = Number(item.powerTotal)
      if (!isNaN(val)) return val
    }
  }
  return 0
})

// ปรับกราฟ Power
const chartSeries = computed(() => {
  if (!allData.value || allData.value.length === 0) return []
  const metric = activeMetric.value as 'current' | 'voltage' | 'power'

  if (metric === 'power') {
    return [{
      name: 'Total Power (kW)',
      color: '#378ADD',
      data: allData.value.map((d: any) => {
        const val = Number(d.powerTotal)
        return isNaN(val) ? 0 : val
      })
    }]
  }
  return PHASES.filter((p: any) => activePhases.value.includes(p.id)).map((p: any) => {
    let phaseData: number[] = []

    if (isColumnFormat.value) {
      const prefix = metric === 'voltage' ? 'V_' : 'I_'
      const col = allData.value.find((c: any) => c.label === `${prefix}${p.id}` || c.label === `${metric}_${p.id}`)
      if (col && col.data) {
        phaseData = col.data.map((v: any) => parseVal(v))
      }
    } else {
      phaseData = allData.value.map((d: any) => parseVal(d[metric]?.[p.id]))
    }

    return {
      name: `เฟส ${p.id}`,
      color: p.color,
      data: phaseData
    }
  })
})

const balanceData = computed(() => {
  if (!allData.value || allData.value.length === 0) return []
  const targetMetric = activeMetric.value === 'power' ? 'current' : activeMetric.value
  
  return PHASES.map((ph: any) => {
    let values: number[] = []
    if (isColumnFormat.value) {
      const prefix = targetMetric === 'voltage' ? 'V_' : 'I_'
      const col = allData.value.find((c: any) => c.label === `${prefix}${ph.id}`)
      if (col && col.data) values = col.data.map((v: any) => parseVal(v))
    } else {
      values = allData.value.map((d: any) => parseVal(d[targetMetric]?.[ph.id]))
    }

    const sum = values.reduce((a: number, b: number) => a + b, 0)
    const avg = values.length > 0 ? sum / values.length : 0
    return { id: ph.id, color: ph.color, avg }
  }).map((item, _, array) => {
    const maxVal = Math.max(...array.map(i => i.avg), 1)
    return { ...item, pct: Math.round((item.avg / maxVal) * 100) }
  })
})

const balanceUnit = computed(() => activeMetric.value === 'voltage' ? 'V' : 'A')
const balanceTitle = computed(() => activeMetric.value === 'voltage' ? 'ความสมดุลแรงดัน 3 เฟส (เฉลี่ย)' : 'ความสมดุลกระแส 3 เฟส (เฉลี่ย)')

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
    
    <!-- 🔥 2. แถบแจ้งเตือนสำหรับ Guest Mode (แสดงเสมอเมื่อเป็นโหมด Guest) -->
    <div v-if="isGuestMode" class="guest-banner">
      <i class="ti ti-info-circle" style="margin-right: 8px;"></i>
      👋 ยินดีต้อนรับผู้เยี่ยมชม! ขณะนี้คุณกำลังใช้งานในโหมด Demo (ข้อมูลจำลองสำหรับการทดสอบ)
    </div>

    <!-- 🔥 3. หน้าจอแจ้งเตือน Maintenance Mode (ถ้าเปิดโหมดนี้ Dashboard จะถูกซ่อน) -->
    <div v-if="isMaintenance" class="maintenance-wrapper">
      <div class="maintenance-card">
        <i class="ti ti-settings spin-icon-slow" style="font-size: 64px; color: var(--color-blue); margin-bottom: 16px; display: inline-block;"></i>
        <h2 style="color: var(--color-text-1); margin-bottom: 8px;">ระบบกำลังปิดปรับปรุงชั่วคราว</h2>
        <p style="color: var(--color-text-2); font-size: 15px;">
          ขออภัยในความไม่สะดวก ขณะนี้เรากำลังอัปเดตระบบเพื่อให้ทำงานได้ดียิ่งขึ้น<br>
          กรุณากลับมาใช้งานใหม่อีกครั้งในภายหลัง
        </p>
      </div>
    </div>

    <!-- 🔥 4. Dashboard หลัก (จะแสดงผลก็ต่อเมื่อไม่ได้เปิด Maintenance Mode) -->
    <template v-else>
      <template v-if="hasData">
        <div class="phase-grid">
          <PhaseCard
            v-for="ph in PHASES" 
            :key="ph.id"
            :phase="ph.id" 
            :color="ph.color"
            :current="latest?.[ph.id]?.current ?? 0"
            :voltage="latest?.[ph.id]?.voltage ?? 0"
            :label="`ค่าล่าสุด (${lastUpdateText})`"
          />
        </div>

        <div style="width: 100%; margin-top: 16px;">
          <PhaseCard
            phase="Total"
            color="#D97706"
            :power="latestTotalPower"
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
            
            <PhaseSelector v-if="activeMetric !== 'power'" v-model="activePhases" />
            
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
        <div :class="activeMetric === 'power' ? 'single-column-row' : 'equal-height-row'">
          
          <!-- 🔥 เติม v-if="statistics && statistics.length > 0" ตรงกล่องนี้เลยครับ -->
          <div class="card dashboard-card" v-if="statistics && statistics.length > 0">
            <div class="card-inner">
              <div class="card-title mb-4"><i class="ti ti-calculator text-blue" /> <span>สถิติประมวลผล</span></div>
              <div :class="activeMetric === 'power' ? 'stats-power-grid' : 'card-body-content'">
                <div 
                  v-for="s in statistics" 
                  :key="s.label" 
                  :class="activeMetric === 'power' ? 'stat-mini-card' : 'stats-row-custom'"
                  :style="activeMetric === 'power' ? {} : { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', padding: '10px 0', borderBottom: '1px solid #f3f4f6', minHeight: '58px' }"
                >
                  <template v-if="activeMetric === 'power'">
                    <div class="stat-label">{{ s.label }}</div>
                    <div class="stat-value-box">
                      <span class="stat-num font-mono fw-bold" :style="{ color: s.color }">{{ s.value }}</span>
                      <div v-if="s.sub" class="stat-sub">{{ s.sub }}</div>
                    </div>
                  </template>

                  <template v-else>
                    <span class="text-muted" style="font-size: 13px; align-self: center;">{{ s.label }}</span>
                    <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
                      <span class="font-mono fw-bold stat-value" :style="{ color: s.color }">{{ s.value }}</span>
                      <div v-if="s.sub" style="font-size: 10px; color: var(--color-text-3); margin-top: 2px; line-height: 1.2;">{{ s.sub }}</div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeMetric !== 'power'" class="card dashboard-card">
            <div class="card-inner">
              <div class="card-title mb-4">
                <i class="ti ti-chart-bar text-amber" /> 
                <span>{{ balanceTitle }}</span>
              </div>
              <div class="card-body-content">
                <div v-for="ph in balanceData" :key="ph.id" class="balance-item" style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                    <span class="text-muted" style="font-size: 13px;">เฟส {{ ph.id }}</span>
                    <span class="font-mono fw-bold" style="font-size: 14px;">{{ ph.avg.toFixed(1) }} <small class="text-3" style="font-size: 11px;">{{ balanceUnit }}</small></span>
                  </div>
                  <div style="background: #f3f4f6; height: 6px; border-radius: 3px; overflow: hidden; width: 100%;">
                    <div :style="{ width: ph.pct + '%', background: ph.color, height: '100%', borderRadius: '3px', transition: 'width 0.6s' }" />
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
    </template>
  </div>
</template>

<style scoped>
/* 🔥 5. CSS สำหรับส่วนเสริมใหม่ (Guest Banner & Maintenance Mode) */
.guest-banner {
  background-color: #fef08a; /* สีเหลืองอ่อน */
  color: #854d0e; /* สีน้ำตาลเข้มเพื่อให้อ่านง่าย */
  padding: 12px 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  margin-bottom: 20px;
  border: 1px solid #facc15;
  display: flex;
  align-items: center;
  justify-content: center;
}

.maintenance-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  padding: 20px;
}

.maintenance-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.spin-icon-slow { 
  animation: spin 3s linear infinite; 
}

/* ---------------- ของเดิม ---------------- */
.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.single-column-row {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  margin-top: 16px;
}

.stats-power-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
  margin-top: 4px;
}

.stat-mini-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 96px;
  transition: all 0.2s ease;
}

.stat-mini-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.stat-value-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-num {
  font-size: 22px;
  line-height: 1.1;
}

.stat-sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 6px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .stats-power-grid {
    grid-template-columns: 1fr;
  }
}
</style>