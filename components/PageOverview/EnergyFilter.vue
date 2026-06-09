<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSiteData } from '~/composables/useSiteData'

// ลบ props ของ จังหวัดและอำเภอออก เหลือแค่ Site ID
const props = defineProps<{ 
  loading?: boolean 
  initSiteId?: string
}>()

const emit = defineEmits(['apply', 'update:location'])

// ดึงแค่ allSites มาใช้ (เพราะเราไม่ต้องกรองด้วยจังหวัด/อำเภอแล้ว)
const { allSites } = useSiteData()

// States สำหรับการเลือก
const selectedSiteId = ref(props.initSiteId || '')

// วันที่เริ่มต้น และ วันที่สิ้นสุด (Default เป็นวันปัจจุบัน)
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

// ผูกตัวแปรเฝ้าดูถ้าระบบหลักมีการส่งค่าเก่ากลับมา (เช่น หลังกดย้อนกลับ)
watch(() => props.initSiteId, (val) => { selectedSiteId.value = val || '' })

// ดักจับเมื่อมีการเปลี่ยนไซต์ เพื่อส่งค่าไปให้แผนที่ซูมทันทีแบบ Real-time
watch(selectedSiteId, () => {
  emit('update:location', {
    siteId: selectedSiteId.value
  })
})

// ส่งค่า Site ID และช่วงวันที่ออกไปให้ PageOverview ดึงข้อมูล
const handleApply = () => {
  if (!selectedSiteId.value) {
    alert('กรุณาเลือกจุดติดตั้งก่อนดึงข้อมูล')
    return
  }
  
  emit('apply', {
    siteId: selectedSiteId.value,
    startDate: startDate.value,
    endDate: endDate.value
  })
}
</script>

<template>
  <div class="filter-container">
    <div class="filter-group">
      
      <div class="select-wrapper">
        <label>จุดติดตั้ง</label>
        <select v-model="selectedSiteId" class="form-select-sm">
          <option value="">-- เลือกจุดติดตั้ง --</option>
          <option v-for="s in allSites" :key="s.id" :value="s.id">
            [{{ s.id }}] {{ s.name }}
          </option>
        </select>
      </div>

      <div class="select-wrapper">
        <label>วันที่เริ่มต้น</label>
        <input type="date" v-model="startDate" class="form-control-sm" />
      </div>

      <div class="select-wrapper">
        <label>วันที่สิ้นสุด</label>
        <input type="date" v-model="endDate" class="form-control-sm" :min="startDate" />
      </div>

      <button 
        class="btn-apply" 
        :disabled="loading" 
        @click="handleApply"
      >
        <i v-if="loading" class="ti ti-loader-2 spin"></i>
        <i v-else class="ti ti-filter"></i>
        ดึงข้อมูล
      </button>

    </div>
  </div>
</template>

<style scoped>
.filter-container {
  background: var(--color-surface);
  padding: 8px 12px;
  border-radius: var(--radius-md);
}
.filter-group {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.select-wrapper label {
  font-size: 11px;
  color: var(--color-text-muted);
  font-weight: 600;
}
.form-select-sm, .form-control-sm {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  font-size: 13px;
  background-color: var(--color-surface-2);
  min-width: 140px;
}
.btn-apply {
  background: var(--color-green);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  height: 35px;
}
.btn-apply:disabled { opacity: 0.6; cursor: not-allowed; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>