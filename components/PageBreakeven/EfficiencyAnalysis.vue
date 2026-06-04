<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-activity" /> การวิเคราะห์ประสิทธิภาพพลังงาน (Power Factor)</div>
    </div>
    
    <div class="eff-grid">
      <div class="eff-box">
        <div class="lbl">กำลังไฟฟ้าจริง (Active Power - P)</div>
        <div class="val text-blue">{{ p.toFixed(2) }} <span class="unit">kW</span></div>
        <div class="sub-text">ค่าที่มิเตอร์จดหน่วย</div>
      </div>
      <div class="eff-box">
        <div class="lbl">กำลังไฟฟ้าปรากฏ (Apparent Power - S)</div>
        <div class="val text-amber">{{ apparentPower.toFixed(2) }} <span class="unit">kVA</span></div>
        <div class="sub-text">คำนวณจาก V × I</div>
      </div>
      <div class="eff-box" :class="pfStatus.class">
        <div class="lbl">ตัวประกอบกำลัง (Power Factor)</div>
        <div class="val">{{ powerFactor.toFixed(3) }}</div>
        <div class="sub-text">{{ pfStatus.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ v: number, i: number, p: number }>() // รับค่า Voltage, Current, Active Power(kW)

// 1. คำนวณ kVA = (V * I) / 1000
const apparentPower = computed(() => (props.v * props.i) / 1000)

// 2. คำนวณ Power Factor = P(kW) / S(kVA)
const powerFactor = computed(() => {
  if (apparentPower.value === 0) return 0
  return props.p / apparentPower.value
})

// 3. ประเมินสถานะ PF
const pfStatus = computed(() => {
  const pf = powerFactor.value
  if (pf >= 0.85) return { text: 'ประสิทธิภาพดีเยี่ยม', class: 'status-good' }
  return { text: 'ต่ำกว่าเกณฑ์ (เสี่ยงเสียค่าปรับ)', class: 'status-bad' }
})
</script>

<style scoped>
.card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card-header { margin-bottom: 20px; }
.card-title { font-size: 16px; font-weight: 600; }
.eff-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.eff-box { background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
.lbl { font-size: 13px; color: #6b7280; margin-bottom: 8px; }
.val { font-size: 28px; font-weight: bold; }
.unit { font-size: 14px; font-weight: normal; }
.sub-text { font-size: 12px; color: #9ca3af; margin-top: 4px; }
.text-blue { color: #3b82f6; }
.text-amber { color: #f59e0b; }
.status-good { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
.status-good .val, .status-good .lbl, .status-good .sub-text { color: #16a34a; }
.status-bad { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
.status-bad .val, .status-bad .lbl, .status-bad .sub-text { color: #dc2626; }
</style>