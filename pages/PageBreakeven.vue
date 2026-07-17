<template>
  <div style="display:flex;flex-direction:column;gap:16px">
    
    <div class="card" style="padding: 16px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
      <label style="font-weight: 600; color: var(--color-text-1);">เลือกจุดติดตั้งที่ต้องการวิเคราะห์:</label>
      <select v-model="selectedTfId" class="form-select-sm" style="min-width: 250px;">
        <option v-for="t in allTransformers" :key="t.id" :value="t.id">
          {{ getFullDetail(t.id)?.site?.name }} ({{ t.id }})
        </option>
      </select>
      <div style="font-size: 13px; color: var(--color-text-3);">
        * ดึงข้อมูล Realtime กระแส แรงดัน และกำลังไฟฟ้ามาวิเคราะห์สดๆ
      </div>
    </div>

    <div class="analysis-tabs">
      <button :class="{ active: activeTab === 'breakeven' }" @click="activeTab = 'breakeven'">
        <i class="ti ti-calculator" /> จุดคุ้มทุน (ROI)
      </button>
      <button :class="{ active: activeTab === 'efficiency' }" @click="activeTab = 'efficiency'">
        <i class="ti ti-bolt" /> ประสิทธิภาพรวม (PF)
      </button>
      <button :class="{ active: activeTab === 'thermal' }" @click="activeTab = 'thermal'">
        <i class="ti ti-flame" /> ความเสี่ยงความร้อน
      </button>
    </div>

    <div v-if="activeTab === 'breakeven'" style="display:flex;flex-direction:column;gap:16px">
      <SavingMetricGrid :be="be" />
      <BreakevenProgress :be="be" :install-cost="installCost" />
      <PeakShaving      :be="be" />
    </div>

    <div v-else-if="activeTab === 'efficiency'">
      <EfficiencyAnalysis :v="currentV" :i="totalI" :p="currentP" />
    </div>

    <div v-else-if="activeTab === 'thermal'">
      <ThermalAnalysis :i-a="currentIPhases.a" :i-b="currentIPhases.b" :i-c="currentIPhases.c" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 🗑️ ลบ import useMockData ออกไปแล้ว
import { useTransformerData } from '~/composables/useSiteData' // 🟢 ดึงจากไฟล์ข้อมูลของคุณ

import SavingMetricGrid  from '~/components/PageBreakeven/SavingMetricGrid.vue'
import BreakevenProgress from '~/components/PageBreakeven/BreakevenProgress.vue'
import PeakShaving       from '~/components/PageBreakeven/PeakShaving.vue'
import EfficiencyAnalysis from '~/components/PageBreakeven/EfficiencyAnalysis.vue'
import ThermalAnalysis from '~/components/PageBreakeven/ThermalAnalysis.vue'

// 1. นำเข้าข้อมูลทั้งหมดจาก useSiteData
const { allTransformers, getFullDetail } = useTransformerData()

// 2. ตั้งค่า State สำหรับหน้าจอ
const activeTab = ref('breakeven')
const selectedTfId = ref(allTransformers[4].id) // ค่าเริ่มต้นตั้งไว้ที่ M-05 (นิคมปากเกร็ดที่มีโหลดเยอะ)
const installCost = ref(450000) // สมมติต้นทุนติดตั้งอุปกรณ์ลดพีค 4.5 แสนบาท
const ratePerKwh  = ref(5)      // ค่าไฟเฉลี่ย 5 บาท/หน่วย

// 3. ดึงข้อมูล Realtime ของจุดที่เลือก
const detail = computed(() => getFullDetail(selectedTfId.value))

// --------------------------------------------------------
// 🔥 ส่วนที่ 1: ดึง V, I, P ส่งให้ Tab Efficiency และ Thermal
// --------------------------------------------------------
const currentV = computed(() => {
  const r = detail.value?.realtime
  if (!r) return 220
  return (r.voltageA + r.voltageB + r.voltageC) / 3 // หาค่าแรงดันเฉลี่ย
})

const currentIPhases = computed(() => {
  const r = detail.value?.realtime
  if (!r) return { a: 0, b: 0, c: 0 }
  return { a: r.currentA, b: r.currentB, c: r.currentC }
})

// รวมกระแส 3 เฟส สำหรับนำไปคำนวณ Apparent Power
const totalI = computed(() => currentIPhases.value.a + currentIPhases.value.b + currentIPhases.value.c)

// กำลังไฟฟ้า (kW)
const currentP = computed(() => {
  return detail.value?.realtime?.totalActivePowerImport || 0
})

// --------------------------------------------------------
// 🔥 ส่วนที่ 2: คำนวณจุดคุ้มทุน (จำลอง logic คำนวณสดจากข้อมูล P)
// --------------------------------------------------------
const be = computed(() => {
  const kw = currentP.value
  
  // สมมติฐาน: โรงงานใช้ไฟโหลดเต็มที่ 12 ชม/วัน ตลอด 30 วัน
  const monthlyKwh = kw * 12 * 30 
  const beforeCost = monthlyKwh * ratePerKwh.value
  
  // สมมติว่าระบบใหม่นี้ (เช่น โซลาร์เซลล์ หรือระบบจัดการ Peak) ประหยัดไฟได้ 20%
  const savingPercent = 0.20
  const saving = beforeCost * savingPercent
  const afterCost = beforeCost - saving
  
  // คำนวณจำนวนเดือนคืนทุน
  const months = saving > 0 ? Math.ceil(installCost.value / saving) : 0
  
  // สมมติว่าโปรเจกต์นี้เดินเครื่องมาแล้วประมาณ 40% ของระยะคืนทุนทั้งหมด
  const elapsedMonths = Math.floor(months * 0.4) 
  const recovered = elapsedMonths * saving
  const pct = months > 0 ? ((recovered / installCost.value) * 100).toFixed(1) : 0
  
  // เตรียม Array สำหรับวาดกราฟ ECharts
  const maxPlotMonths = months + 6 // วาดเผื่อไปอีก 6 เดือน
  const chartLabels = Array.from({length: maxPlotMonths}, (_, i) => `ด.${i+1}`)
  const costLine = Array.from({length: maxPlotMonths}, () => installCost.value)
  const cumSavings = Array.from({length: maxPlotMonths}, (_, i) => (i+1) * saving)
  
  return {
    beforeCost,
    afterCost,
    saving,
    months,
    elapsedMonths,
    recovered,
    pct,
    chartLabels,
    costLine,
    cumSavings,
    peakShavingKw: (kw * savingPercent).toFixed(1),
    peakShavingPct: (savingPercent * 100).toFixed(1),
    peakShavingSaving: saving
  }
})
</script>

<style scoped>
.form-select-sm { padding: 6px 12px; border-radius: 6px; border: 1px solid var(--color-border); }
.analysis-tabs {
  display: flex; gap: 8px; background: white; padding: 8px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.analysis-tabs button {
  flex: 1; padding: 12px; border: none; background: transparent; border-radius: 6px;
  font-weight: 600; color: var(--color-text-2); cursor: pointer; transition: 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.analysis-tabs button:hover { background: #f4f5f7; }
.analysis-tabs button.active { background: var(--color-green); color: white; box-shadow: 0 2px 4px rgba(29, 158, 117, 0.3); }
</style>