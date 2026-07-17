<script setup lang="ts">
withDefaults(defineProps<{
  phase:    string
  color:    string
  current?: number
  voltage?: number
  power?:   number
  label?:   string
}>(), {
  label: 'กระแส/แรงดัน'
})

/**
 * ฟังก์ชันช่วยจัดฟอร์แมตตัวเลขให้แสดงผลสวยงาม
 * - ดักจับค่า NaN, null, undefined ให้กลายเป็น '0.0' อัตโนมัติ
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
    
    <!-- ส่วนหัวการ์ด (เปลี่ยนข้อความอัตโนมัติตามโหมด) -->
    <div class="phase-header">
      <template v-if="phase === 'Total' || phase === 'รวม'">
        <i class="ti ti-bolt text-amber" style="margin-right: 4px;"></i>
        <span>กำลังไฟฟ้ารวม — {{ label }}</span>
      </template>
      <template v-else>
        <span>เฟส {{ phase }} — {{ label }}</span>
      </template>
    </div>

    <!-- ส่วนเนื้อหาการ์ด -->
    <div class="phase-body" :class="{ 'body-total': phase === 'Total' || phase === 'รวม' }">
      
      <!-- 1. แสดงกระแสและแรงดัน (สำหรับเฟส A, B, C) -->
      <template v-if="current !== undefined || voltage !== undefined">
        <div v-if="current !== undefined" class="phase-row">
          <span class="phase-key">กระแส (A)</span>
          <span class="phase-val" :style="{ color }">{{ formatNumber(current, 1) }}</span>
        </div>
        <div v-if="voltage !== undefined" class="phase-row">
          <span class="phase-key">แรงดัน (V)</span>
          <span class="phase-val" :style="{ color }">{{ formatNumber(voltage, 1) }}</span>
        </div>
      </template>

      <!-- 2. แสดงกำลังไฟฟ้ารวม (สำหรับโหมด Total) -->
      <template v-if="power !== undefined">
        <div class="phase-row total-row">
          <span class="phase-key">Power (kW)</span>
          <div class="total-val-wrap">
            <span class="phase-val total-number" :style="{ color }">{{ formatNumber(power, 2) }}</span>
            <span class="total-unit">kW</span>
          </div>
        </div>
      </template>

    </div>

  </div>
</template>

<style scoped>
.phase-card {
  flex: 1;
  min-width: 220px;
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

/* ── สีพื้นหลังการ์ดตามเฟส ── */
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

/* เพิ่มสีพื้นหลังสำหรับการ์ด Total Power (โทนเหลืองทองอ่อน) */
.phase-card.phase-total,
.phase-card.phase-รวม {
  background-color: #FEF3C7; 
  border-color: #FDE68A;
}

.phase-header {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
}

.phase-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  flex: 1;
}

/* จัดให้การ์ด Total มีข้อความโดดเด่นขึ้น */
.phase-body.body-total {
  gap: 4px;
}

.phase-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.phase-row.total-row {
  align-items: baseline;
  margin-top: 2px;
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

/* สไตล์พิเศษสำหรับตัวเลข Total Power ให้ใหญ่และชัดขึ้น */
.total-val-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.total-number {
  font-size: 20px;
  font-weight: 800;
}

.total-unit {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
}
</style>