<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSiteData } from '~/composables/useSiteData'
import LocationFilter from '../components/LocationFilter.vue'
import SiteMap        from '../components/SiteMap.vue'
import SiteDetail     from '../components/SiteDetail.vue'

const { allSites } = useSiteData()

const selectedProvince = ref('')
const selectedDistrict = ref('')
const selectedSite     = ref<typeof allSites[0] | null>(null)

// ล้าง site ที่เลือกอยู่เมื่อเปลี่ยน filter
watch([selectedProvince, selectedDistrict], () => {
  selectedSite.value = null
})

const filteredSites = computed(() => {
  if (selectedDistrict.value)
    return allSites.filter(s => s.province === selectedProvince.value && s.district === selectedDistrict.value)
  if (selectedProvince.value)
    return allSites.filter(s => s.province === selectedProvince.value)
  return allSites
})

function onSelect(id: string) {
  const found = filteredSites.value.find(s => s.id === id)
  selectedSite.value = selectedSite.value?.id === id ? null : (found ?? null)
}
</script>

<template>
  <div style="display:flex;flex-direction:column;gap:16px">
    <LocationFilter
      v-model:province="selectedProvince"
      v-model:district="selectedDistrict"
    />
    <SiteMap
      :sites="filteredSites"
      :selected-site-id="selectedSite?.id ?? null"
      @select="onSelect"
    />
    <SiteDetail :site="selectedSite" />
  </div>
</template>

