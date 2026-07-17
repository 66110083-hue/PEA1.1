<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSiteData } from '~/composables/useSiteData'

const props = defineProps<{
  loading?: boolean
  initSiteId?: string
  hideSiteSelector?: boolean   // ✅ เพิ่ม: ซ่อน dropdown เมื่อ site ถูกกำหนดตายตัวแล้ว (เช่นหน้า Transformer Detail)
}>()

const emit = defineEmits(['apply', 'update:location'])

const { allSites } = useSiteData()

const selectedSiteId = ref(props.initSiteId || '')

const startDate = ref(new Date())
const endDate   = ref(new Date())

const toISO = (d: Date) => d.toISOString().split('T')[0]

watch(() => props.initSiteId, (val) => { selectedSiteId.value = val || '' })

// ✅ ชื่อ site ที่จะโชว์แบบ read-only ตอนซ่อน dropdown
const lockedSiteName = computed(() => {
  const s = allSites.find(s => s.id === selectedSiteId.value)
  return s ? `[${s.id}] ${s.name}` : selectedSiteId.value || '-'
})

const onSelectChange = () => {
  emit('update:location', {
    siteId: selectedSiteId.value
  })
}

const handleApply = () => {
  if (!selectedSiteId.value) {
    alert('กรุณาเลือกจุดติดตั้งก่อนดึงข้อมูล')
    return
  }
  emit('apply', {
    siteId: selectedSiteId.value,
    startDate: toISO(startDate.value),
    endDate:   toISO(endDate.value)
  })
}

const calendarLocale = {
  id: 'th',
  firstDayOfWeek: 2,
  masks: { input: 'DD/MM/YYYY' },
}
</script>

<template>
  <div class="filter-container">
    <div class="filter-group">

      <!-- ✅ โหมดปกติ: dropdown เลือก site ได้ -->
      <div v-if="!hideSiteSelector" class="select-wrapper">
        <label>จุดติดตั้ง</label>
        <select v-model="selectedSiteId" class="form-select-sm" @change="onSelectChange">
          <option value="">-- เลือกจุดติดตั้ง --</option>
          <option v-for="s in allSites" :key="s.id" :value="s.id">
            [{{ s.id }}] {{ s.name }}
          </option>
        </select>
      </div>

      <!-- ✅ โหมดล็อก: แสดงชื่อ site แบบ read-only แทน dropdown -->
      <div v-else class="select-wrapper">
        <label>จุดติดตั้ง</label>
        <div class="locked-site-badge">{{ lockedSiteName }}</div>
      </div>

      <div class="select-wrapper">
        <label>วันที่เริ่มต้น</label>
        <VDatePicker
          v-model="startDate"
          :locale="calendarLocale"
          :max-date="endDate"
        >
          <template #default="{ inputValue, togglePopover }">
            <div class="date-input-wrapper" @click="togglePopover">
              <span class="date-input-text">{{ inputValue }}</span>
              <i class="ti ti-calendar date-icon"></i>
            </div>
          </template>
        </VDatePicker>
      </div>

      <div class="select-wrapper">
        <label>วันที่สิ้นสุด</label>
        <VDatePicker
          v-model="endDate"
          :locale="calendarLocale"
          :min-date="startDate"
        >
          <template #default="{ inputValue, togglePopover }">
            <div class="date-input-wrapper" @click="togglePopover">
              <span class="date-input-text">{{ inputValue }}</span>
              <i class="ti ti-calendar date-icon"></i>
            </div>
          </template>
        </VDatePicker>
      </div>

      <button class="btn-apply" :disabled="loading" @click="handleApply">
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
.form-select-sm {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  font-size: 13px;
  background-color: var(--color-surface-2);
  min-width: 140px;
}
/* ✅ badge สำหรับโหมดล็อก site */
.locked-site-badge {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface-2);
  font-size: 13px;
  min-width: 140px;
  color: var(--color-text-2);
  font-weight: 500;
}
.date-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface-2);
  font-size: 13px;
  min-width: 140px;
  cursor: pointer;
  user-select: none;
}
.date-input-wrapper:hover {
  border-color: var(--color-green);
}
.date-icon {
  color: var(--color-text-muted);
  font-size: 15px;
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