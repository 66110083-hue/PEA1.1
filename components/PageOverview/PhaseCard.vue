<script setup lang="ts">
withDefaults(defineProps<{
  phase:    string
  color:    string
  current:  number
  voltage:  number
  power:    number
  pf?:      number
  label?:   string
}>(), {
  label: 'กระแส/แรงดัน'
})

/**
 * ฟังก์ชันช่วยจัดฟอร์แมตตัวเลขให้แสดงผลสวยงาม
 * - ดักจับค่า NaN, null, undefined ให้กลายเป็น '0.0' อัตโนมัติ
 * - บังคับจำนวนทศนิยมให้เท่ากันทุกบรรทัด (เช่น 230 -> 230.0)
 * - ใส่ลูกน้ำ (Comma) ให้อัตโนมัติถ้าหลักพันขึ้นไป
 */
const formatNumber = (val: number | undefined, decimals: number): string => {
  if (val === undefined || val === null || isNaN(val)) {
    return (0).toFixed(decimals)
  }
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}
</script>

<template>
  <div class="phase-card" :class="`phase-${phase.toLowerCase()}`">
    
    <div class="phase-header">
      เฟส {{ phase }} — {{ label }}
    </div>

    <div class="phase-body">
      <div class="phase-row">
        <span class="phase-key">กระแส (A)</span>
        <span class="phase-val" :style="{ color }">{{ formatNumber(current, 1) }}</span>
      </div>
      <div class="phase-row">
        <span class="phase-key">แรงดัน (V)</span>
        <span class="phase-val" :style="{ color }">{{ formatNumber(voltage, 1) }}</span>
      </div>
      <div class="phase-row">
        <span class="phase-key">กำลัง (kW)</span>
        <span class="phase-val" :style="{ color }">{{ formatNumber(power, 2) }}</span>
      </div>
      <div v-if="pf !== undefined" class="phase-row">
        <span class="phase-key">Power Factor</span>
        <span class="phase-val" :style="{ color }">{{ formatNumber(pf, 2) }}</span>
      </div>
    </div>

  </div>
</template>



<style scoped>
.phase-card {
  flex: 1;
  min-width: 240px;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.phase-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* ── สีพื้นหลังการ์ดตามเฟส (อิงจากรูป UI ต้นฉบับ) ── */
.phase-card.phase-a {
  background-color: #EFF6FF; /* โทนฟ้าอ่อน */
  border-color: #DBEAFE;
}

.phase-card.phase-b {
  background-color: #ECFDF5; /* โทนเขียวอ่อน */
  border-color: #D1FAE5;
}

.phase-card.phase-c {
  background-color: #FFF7ED; /* โทนส้มอ่อน */
  border-color: #FFEDD5;
}

.phase-header {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.phase-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.phase-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.phase-key {
  color: #4B5563;
  font-weight: 500;
}

.phase-val {
  font-weight: 700;
  font-size: 14px;
  font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>