<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-flame" /> ดัชนีความเสี่ยงความร้อน (Current Unbalance)</div>
    </div>
    
    <div class="info-banner" :class="unbalanceStatus.class">
      <strong>ความไม่สมดุลของกระแส (Unbalance): {{ unbalancePercent.toFixed(1) }}%</strong>
      <span>{{ unbalanceStatus.text }}</span>
    </div>

    <div class="phase-bars">
      <div class="phase-row">
        <div class="phase-lbl">เฟส A ({{ iA }}A)</div>
        <div class="bar-bg"><div class="bar-fill" style="background:#378ADD" :style="{ width: getWidth(iA) }" /></div>
      </div>
      <div class="phase-row">
        <div class="phase-lbl">เฟส B ({{ iB }}A)</div>
        <div class="bar-bg"><div class="bar-fill" style="background:#1D9E75" :style="{ width: getWidth(iB) }" /></div>
      </div>
      <div class="phase-row">
        <div class="phase-lbl">เฟส C ({{ iC }}A)</div>
        <div class="bar-bg"><div class="bar-fill" style="background:#BA7517" :style="{ width: getWidth(iC) }" /></div>
      </div>
      <div class="avg-line-label">ค่าเฉลี่ย {{ avgCurrent.toFixed(1) }}A</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ iA: number, iB: number, iC: number }>()

// 1. หาค่าเฉลี่ยกระแส
const avgCurrent = computed(() => (props.iA + props.iB + props.iC) / 3)

// 2. หาเฟสที่เบี่ยงเบนจากค่าเฉลี่ยมากที่สุด
const maxDeviation = computed(() => {
  const devA = Math.abs(props.iA - avgCurrent.value)
  const devB = Math.abs(props.iB - avgCurrent.value)
  const devC = Math.abs(props.iC - avgCurrent.value)
  return Math.max(devA, devB, devC)
})

// 3. คำนวณเปอร์เซ็นต์ Unbalance
const unbalancePercent = computed(() => {
  if (avgCurrent.value === 0) return 0
  return (maxDeviation.value / avgCurrent.value) * 100
})

// ประเมินสถานะความร้อน/ความเสี่ยง
const unbalanceStatus = computed(() => {
  const ub = unbalancePercent.value
  if (ub <= 10) return { text: 'สมดุลดีเยี่ยม ไม่เกิดความร้อนสะสมในสายนิวทรัล', class: 'bg-green' }
  if (ub <= 20) return { text: 'เริ่มไม่สมดุล ควรเกลี่ยโหลดเพื่อลดอุณหภูมิ', class: 'bg-amber' }
  return { text: 'อันตราย! ความร้อนสะสมสูง เสี่ยงอุปกรณ์ชำรุด', class: 'bg-red' }
})

// ใช้สำหรับวาดแท่งกราฟ (หาค่า Max เพื่อทำ 100%)
const maxI = computed(() => Math.max(props.iA, props.iB, props.iC, 1))
const getWidth = (val: number) => `${(val / maxI.value) * 100}%`
</script>

<style scoped>
.card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card-header { margin-bottom: 16px; }
.card-title { font-size: 16px; font-weight: 600; }
.info-banner { padding: 12px 16px; border-radius: 8px; display: flex; flex-direction: column; margin-bottom: 24px; }
.info-banner strong { font-size: 16px; }
.info-banner span { font-size: 13px; margin-top: 4px; }
.bg-green { background: #f0fdf4; color: #16a34a; border-left: 4px solid #16a34a; }
.bg-amber { background: #fffbeb; color: #d97706; border-left: 4px solid #f59e0b; }
.bg-red { background: #fef2f2; color: #dc2626; border-left: 4px solid #ef4444; }

.phase-bars { position: relative; display: flex; flex-direction: column; gap: 16px; }
.phase-row { display: flex; align-items: center; gap: 12px; }
.phase-lbl { width: 100px; font-size: 13px; font-weight: 500; color: #4b5563; }
.bar-bg { flex: 1; height: 24px; background: #f3f4f6; border-radius: 12px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 12px; transition: width 0.3s ease; }
.avg-line-label { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 8px; border-top: 1px dashed #e5e7eb; padding-top: 8px; }
</style>