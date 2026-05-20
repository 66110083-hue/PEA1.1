<script setup lang="ts">
import { computed, watch } from 'vue'
import { provinces, districtsByProvince, allSites } from '~/composables/useSiteData'

const province = defineModel<string>('province', { default: '' })
const district = defineModel<string>('district', { default: '' })

// เมื่อเปลี่ยนจังหวัด ล้างเขตอัตโนมัติ
watch(province, () => { district.value = '' })

const availableDistricts = computed(() =>
  province.value ? districtsByProvince[province.value] ?? [] : []
)

const siteCount = computed(() => {
  if (district.value)
    return allSites.filter(s => s.province === province.value && s.district === district.value).length
  if (province.value)
    return allSites.filter(s => s.province === province.value).length
  return allSites.length
})

function clearAll() {
  province.value = ''
  district.value = ''
}
</script>

<style scoped>
.filter-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text-1);
  font-size: 13px;
  cursor: pointer;
  width: 100%;
}
.filter-select:disabled { opacity: 0.4; cursor: not-allowed; }
</style>

<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-filter" /> กรองพื้นที่</div>
      <div v-if="province" style="display:flex;align-items:center;gap:6px;font-size:12px">
        <span style="color:var(--color-blue);font-weight:500">{{ province }}</span>
        <template v-if="district">
          <i class="ti ti-chevron-right" style="font-size:10px;color:var(--color-text-2)" />
          <span style="color:var(--color-green);font-weight:500">{{ district }}</span>
        </template>
        <button @click="clearAll" style="margin-left:6px;padding:2px 8px;border-radius:20px;border:1px solid var(--color-border);background:none;cursor:pointer;font-size:11px;color:var(--color-text-2)">
          ✕ ล้าง
        </button>
      </div>
    </div>

    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:140px">
        <label style="font-size:12px;color:var(--color-text-2)">จังหวัด</label>
        <select class="filter-select" v-model="province">
          <option value="">— ทั้งหมด —</option>
          <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>

      <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:140px">
        <label style="font-size:12px;color:var(--color-text-2)">
          เขต / อำเภอ
          <span v-if="!province" style="opacity:0.5">(เลือกจังหวัดก่อน)</span>
        </label>
        <select class="filter-select" v-model="district" :disabled="!province">
          <option value="">— ทั้งหมด —</option>
          <option v-for="d in availableDistricts" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
    </div>

    <div style="margin-top:10px;font-size:12px;color:var(--color-text-2)">
      แสดง <strong style="color:var(--color-text-1)">{{ siteCount }}</strong> จุดติดตั้ง
    </div>
  </div>
</template>

