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

// เอา balanceData และ unit ออกจากการ destructure เพื่อไม่ให้ซ้ำซ้อนกับตัวที่เราจะคำนวณใหม่ด้านล่าง
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
  fetchSites()
})

const chartXData = computed(() => {
  if (!allData.value) return []
  return allData.value.map((d: any) => {
    if (!d.timestamp) return d.label
    const dateObj = new Date(d.timestamp)
    const day = String(dateObj.getDate()).padStart(2, '0')
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    return `${day}/${month} ${d.label}`
  })
})

// คำนวณค่า Total Power ล่าสุด สำหรับส่งให้ PhaseCard ใบที่ 4 (Total)
// ดึงค่า Total Power ล่าสุด โดยให้ลองเอาจาก latest ก่อน ถ้าไม่มีค่อยไปหาใน allData
const latestTotalPower = computed(() => {
  // 1. ลองดึงจากตัวแปร latest ที่ระบบคำนวณค่าล่าสุดจริงไว้ให้แล้ว
  if (latest.value) {
    const fromLatest = latest.value.total ?? latest.value.power ?? latest.value.Total ?? latest.value.kw ?? latest.value.kW
    if (fromLatest !== undefined && fromLatest !== null) {
      if (typeof fromLatest === 'object') {
        return fromLatest.total ?? fromLatest.value ?? fromLatest.val ?? Object.values(fromLatest)[0] ?? 0
      }
      return Number(fromLatest) || 0
    }
    
    // กรณีที่ latest เก็บแยกไว้ในเฟส A (เช่นล่าสุดส่งมาเฉลี่ยเฟสละ 3.17) ให้ลองดึงจากเฟส A มาใช้
    const phaseAPower = latest.value.A?.power ?? latest.value.A?.kw
    if (phaseAPower !== undefined && phaseAPower !== null) {
      return Number(phaseAPower) || 0
    }
  }

  // 2. แผนสำรอง: ถ้าใน latest ไม่มี ให้ค้นหาจาก allData โดยหา "รายการล่าสุดที่มีค่าไม่เป็น 0"
  if (!allData.value || allData.value.length === 0) return 0
  
  // วนลูปจากรายการหลังสุดถอยกลับมา หาตัวเลขตัวแรกที่ไม่ใช่ 0
  for (let i = allData.value.length - 1; i >= 0; i--) {
    const item = allData.value[i]
    if (!item) continue
    
    const val = item.power ?? item.Power ?? item.total ?? item.Total ?? 
                item.totalPower ?? item.total_power ?? item.active_power ?? 
                item.p ?? item.P ?? item.kw ?? item.kW ?? 0;

    let finalVal = 0
    if (typeof val === 'object' && val !== null) {
      finalVal = val.total ?? val.Total ?? val.value ?? val.val ?? val.sum ?? Object.values(val)[0] ?? 0;
    } else {
      finalVal = Number(val) || 0;
    }

    // ถ้าเจอรายการล่าสุดที่ค่ามากกว่า 0 ให้ส่งค่านั้นออกไปทันที
    if (finalVal > 0) return finalVal
  }

  return 0
})

// คำนวณความสมดุล 3 เฟสใหม่ โดยบังคับใช้ Current (A) หรือ Voltage (V) เท่านั้น ไม่ใช้ Power
const balanceData = computed(() => {
  if (!allData.value || allData.value.length === 0) return []

  const targetMetric = activeMetric.value === 'power' ? 'current' : activeMetric.value
  
  return PHASES.map((ph: any) => {
    const values = allData.value.map((d: any) => Number(d[targetMetric]?.[ph.id]) || 0)
    const sum = values.reduce((a: number, b: number) => a + b, 0)
    const avg = values.length > 0 ? sum / values.length : 0

    return {
      id: ph.id,
      color: ph.color,
      avg: avg
    }
  }).map((item, _, array) => {
    const maxVal = Math.max(...array.map(i => i.avg), 1)
    return {
      ...item,
      pct: Math.round((item.avg / maxVal) * 100)
    }
  })
})

// หน่วยของความสมดุล (โชว์ V ถ้าเลือก Voltage, นอกนั้นโชว์ A)
const balanceUnit = computed(() => {
  if (activeMetric.value === 'voltage') return 'V'
  return 'A'
})

// หัวข้อของการ์ดความสมดุล
const balanceTitle = computed(() => {
  if (activeMetric.value === 'voltage') return 'ความสมดุลแรงดัน 3 เฟส (เฉลี่ย)'
  return 'ความสมดุลกระแส 3 เฟส (เฉลี่ย)'
})

// ปรับปรุง chartSeries: ดักจับทุกชื่อ Key ที่เป็นไปได้สำหรับ Total Power
const chartSeries = computed(() => {
  if (!allData.value || allData.value.length === 0) return []
  
  if (allData.value[0]) {
    console.log('📌 โครงสร้างข้อมูลจริงจาก API (1 รายการ):', JSON.stringify(allData.value[0], null, 2))
  }

  const metric = activeMetric.value as 'current' | 'voltage' | 'power'

  if (metric === 'power') {
    return [{
      name: 'Total Power (kW)',
      color: '#378ADD',
      data: allData.value.map((d: any) => {
        const val = d.power ?? d.Power ?? d.total ?? d.Total ?? 
                    d.totalPower ?? d.total_power ?? d.active_power ?? 
                    d.p ?? d.P ?? d.kw ?? d.kW ?? d.val ?? d.value ?? 0;

        if (typeof val === 'object' && val !== null) {
          return val.total ?? val.Total ?? val.value ?? val.val ?? val.sum ?? Object.values(val)[0] ?? 0;
        }

        return Number(val) || 0;
      })
    }]
  }

  return PHASES.filter((p: any) => activePhases.value.includes(p.id)).map((p: any) => {
    return {
      name: `เฟส ${p.id}`,
      color: p.color,
      data: allData.value.map((d: any) => d[metric]?.[p.id] ?? 0)
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
      
      <!-- 1. กลุ่มการ์ด 3 เฟส (A, B, C) แบ่ง 3 คอลัมน์เท่าๆ กัน -->
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

      <!-- 2. แยกการ์ด Total Power ออกมาอยู่นอก grid และสั่งให้กว้างเต็ม 100% -->
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
      <!-- ปรับ class แบบไดนามิกเพื่อเปลี่ยนเลย์เอาต์ตามเมนูที่เลือก -->
      <div :class="activeMetric === 'power' ? 'single-column-row' : 'equal-height-row'">
        
      <!-- 1. การ์ดสถิติประมวลผล -->
        <div class="card dashboard-card">
          <div class="card-inner">
            <div class="card-title mb-4">
              <i class="ti ti-calculator text-blue" /> <span>สถิติประมวลผล</span>
            </div>
            
            <!-- สลับ Container: ถ้าเลือก Power ให้ใช้ Grid 3 ช่องแนวนอน (stats-power-grid) -->
            <div :class="activeMetric === 'power' ? 'stats-power-grid' : 'card-body-content'">
              
              <div 
                v-for="s in statistics" 
                :key="s.label" 
                :class="activeMetric === 'power' ? 'stat-mini-card' : 'stats-row-custom'"
                :style="activeMetric === 'power' ? {} : { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', padding: '10px 0', borderBottom: '1px solid #f3f4f6', minHeight: '58px' }"
              >
                <!-- ── โหมด POWER: แสดงเป็นกล่องแนวนอน (ข้อความอยู่บน ตัวเลขใหญ่ด้านล่าง) ── -->
                <template v-if="activeMetric === 'power'">
                  <div class="stat-label">{{ s.label }}</div>
                  <div class="stat-value-box">
                    <span class="stat-num font-mono fw-bold" :style="{ color: s.color }">{{ s.value }}</span>
                    <div v-if="s.sub" class="stat-sub">{{ s.sub }}</div>
                  </div>
                </template>

                <!-- ── โหมดปกติ (Current/Voltage): แสดงเป็นบรรทัดแนวตั้งตามเดิม ── -->
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

        <!-- 2. การ์ดความสมดุล 3 เฟส (จะแสดงเฉพาะตอนที่ไม่ใช่เมนู Power) -->
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
  </div>
</template>

<style scoped>
.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* เมื่อเหลือการ์ดเดียว ให้ขยายเต็มความกว้าง 100% */
.single-column-row {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  margin-top: 16px;
}

/* ปรับสถิติให้เรียงแนวนอน 3 คอลัมน์ เมื่ออยู่โหมดกว้างเต็มหน้าจอ */
.stats-grid-horizontal {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 8px 0;
}

.stats-grid-horizontal .stats-row-custom {
  border-bottom: none !important;
  border-right: 1px solid #f3f4f6;
  padding-right: 16px;
}

.stats-grid-horizontal .stats-row-custom:last-child {
  border-right: none;
}
.stats-power-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* บังคับแบ่งพื้นที่เป็น 3 ช่องเท่าๆ กันเป๊ะ */
  gap: 16px;
  width: 100%;
  margin-top: 4px;
}

/* ดีไซน์กล่องย่อยแต่ละช่องให้เป็น Mini-card สวยงาม */
.stat-mini-card {
  background-color: #f8fafc; /* สีพื้นหลังเทาอมฟ้าอ่อน ช่วยแบ่งเป็นสัดส่วนชัดเจน */
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

/* จัดฟอนต์หัวข้อด้านบน */
.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

/* จัดกลุ่มตัวเลขด้านล่าง */
.stat-value-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* ขยายตัวเลขให้ใหญ่สะดุดตา */
.stat-num {
  font-size: 22px;
  line-height: 1.1;
}

/* ข้อความวันที่ย่อยด้านล่าง ไม่ให้โดนตัดคำ */
.stat-sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 6px;
  white-space: nowrap;
}

/* รองรับหน้าจอมือถือหรือแท็บเล็ต ถ้าจอเล็กจะพับกลับมาเรียงซ้อนให้เอง */
@media (max-width: 768px) {
  .stats-power-grid {
    grid-template-columns: 1fr;
  }
}
</style>