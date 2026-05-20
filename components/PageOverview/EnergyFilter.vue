<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSiteData } from '~/composables/useSiteData'

const props = defineProps<{ loading?: boolean }>()
// 🔥 เพิ่มอีเวนต์ update:location เพื่อส่งค่าไปซูมบนแผนที่ทันทีแบบ Real-time
const emit = defineEmits(['apply', 'update:location'])

// ดึงข้อมูลจาก Composable
const { provinces, districtsByProvince, allSites } = useSiteData()

// States สำหรับการเลือก
const selectedProvince = ref('')
const selectedDistrict = ref('')
const selectedSiteId = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])

// ดึงรายชื่ออำเภอ เมื่อจังหวัดเปลี่ยน
const availableDistricts = computed(() => {
  return selectedProvince.value ? districtsByProvince[selectedProvince.value] ?? [] : []
})

// ดึงรายชื่อไซต์ตามระดับการเลือก
const availableSites = computed(() => {
  if (!selectedProvince.value) return []
  
  return allSites.filter(s => {
    const matchProvince = s.province === selectedProvince.value
    const matchDistrict = selectedDistrict.value ? s.district === selectedDistrict.value : true
    return matchProvince && matchDistrict
  })
})

// 🔥 ดักจับทุกครั้งที่มีการเปลี่ยน จังหวัด/อำเภอ/ไซต์ เพื่อส่งค่าไปให้แผนที่ซูมทันทีแบบ Real-time
watch([selectedProvince, selectedDistrict, selectedSiteId], () => {
  emit('update:location', {
    province: selectedProvince.value,
    district: selectedDistrict.value,
    siteId: selectedSiteId.value
  })
})

// Watcher เพื่อ Reset ค่าเมื่อตัวแม่เปลี่ยน
watch(selectedProvince, () => {
  selectedDistrict.value = ''
  selectedSiteId.value = ''
})

watch(selectedDistrict, () => {
  selectedSiteId.value = ''
})

const handleApply = () => {
  emit('apply', {
    province: selectedProvince.value,
    district: selectedDistrict.value,
    siteId: selectedSiteId.value,
    date: selectedDate.value
  })
}
</script>

<template>
  <div class="filter-container">
    <div class="filter-group">
      <div class="select-wrapper">
        <label>จังหวัด</label>
        <select v-model="selectedProvince" class="form-select-sm">
          <option value="">เลือกจังหวัด</option>
          <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>

      <div class="select-wrapper">
        <label>อำเภอ/เขต</label>
        <select v-model="selectedDistrict" class="form-select-sm" :disabled="!selectedProvince">
          <option value="">เลือกอำเภอ</option>
          <option v-for="d in availableDistricts" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>

      <div class="select-wrapper">
        <label>จุดติดตั้ง</label>
        <select v-model="selectedSiteId" class="form-select-sm" :disabled="!selectedProvince">
          <option value="">เลือกจุดติดตั้งทั้งหมด</option>
          <option v-for="s in availableSites" :key="s.id" :value="s.id">
            [{{ s.id }}] {{ s.name }}
          </option>
        </select>
      </div>

      <div class="select-wrapper">
        <label>วันที่</label>
        <input type="date" v-model="selectedDate" class="form-control-sm" />
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