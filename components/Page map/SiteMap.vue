<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Site } from '~/composables/useSiteData'

const props = defineProps<{
  sites: Site[]
  selectedSiteId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const mapEl = ref<HTMLElement | null>(null)
let map: L.Map | null = null
const markerMap = new Map<string, L.CircleMarker>()

const statusColor: Record<string, string> = {
  online:  '#1D9E75',
  alert:   '#E24B4A',
  offline: '#BA7517',
}

// ฟังก์ชันสร้าง HTML Popup ที่แก้ไขให้แสดงรายละเอียดครบถ้วน
function generatePopupHtml(site: Site) {
  const config = useRuntimeConfig()
const baseUrl = `${config.public.apiBaseUrl}/api/assets/img/site?fname=`
  const imageUrl = site.img && site.img !== '2' ? `${baseUrl}${site.img}` : null

  // ดึงค่าและจัดการกรณีข้อมูลเป็นค่าว่าง
  const installDate = site.installDate || 'ไม่ระบุ'
  const devDetail = site.devDetail && site.devDetail !== '-' ? site.devDetail : 'ไม่มีข้อมูล'

  return `
    <div style="font-family: sans-serif; min-width: 240px;">
      <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 15px; border-bottom: 2px solid #1D9E75; padding-bottom: 6px;">
        ${site.name}
      </h4>
      ${imageUrl ? `
        <div style="margin-bottom: 10px; border-radius: 6px; overflow: hidden; border: 1px solid #e5e7eb; background: #f3f4f6;">
          <img src="${imageUrl}" alt="Site Image" style="width: 100%; height: 130px; object-fit: cover; display: block;" onerror="this.style.display='none';" />
        </div>
      ` : ''}
      <div style="font-size: 13px; color: #4b5563; line-height: 1.6;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color:#9ca3af">Device ID:</span> <b>${site.deviceId || '-'}</b>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color:#9ca3af">Serial:</span> <span style="color:#378ADD; font-weight:bold;">${site.devSerial || '-'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color:#9ca3af">วันที่ติดตั้ง:</span> <span style="font-weight: 500;">${installDate}</span>
        </div>
        <div style="margin-top: 8px; background: #f8f9fa; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb;">
          <span style="color:#9ca3af; display:block; margin-bottom:2px; font-size: 11px;">รายละเอียดอุปกรณ์:</span>
          <span style="color:#1f2937; font-weight: 500;">${devDetail}</span>
        </div>
      </div>
    </div>
  `
}

function rebuildMarkers() {
  if (!map) return

  markerMap.forEach(m => m.remove())
  markerMap.clear()
  
  props.sites.forEach(site => {
    if (!site.lat || !site.lng) return 

    const isSelected = props.selectedSiteId === site.id
    const marker = L.circleMarker([site.lat, site.lng], {
      radius: isSelected ? 13 : 10,
      fillColor: statusColor[site.status] || '#9CA3AF',
      color: '#fff',
      weight: isSelected ? 3 : 2,
      fillOpacity: 0.9,
    }).addTo(map!)
    
    marker.bindTooltip(`<b>${site.id}</b><br>${site.name}`, { direction: 'top' })
    marker.bindPopup(generatePopupHtml(site), { minWidth: 260 })
    marker.on('click', () => emit('select', site.id))
    markerMap.set(site.id, marker)
  })
}

function zoomToSites(sites: Site[]) {
  if (!map || sites.length === 0) return
  const bounds = L.latLngBounds(sites.map(s => [s.lat, s.lng]))
  map.fitBounds(bounds, { padding: [48, 48], animate: true })
}

// Watcher ข้อมูล sites
watch(() => props.sites, async () => {
  await nextTick()
  rebuildMarkers()
  if (props.sites.length > 0) zoomToSites(props.sites)
}, { deep: true })

// Watcher เลือก site แล้วบินไป + เปิด Popup
watch(() => props.selectedSiteId, (id) => {
  markerMap.forEach((m, key) => {
    m.setStyle({ weight: key === id ? 3 : 2, radius: key === id ? 13 : 10 } as any)
  })

  if (id && map) {
    const site = props.sites.find(s => s.id === id)
    if (site) {
      map.flyTo([site.lat, site.lng], 16, { animate: true, duration: 0.5 })
      map.once('moveend', () => {
        const marker = markerMap.get(id)
        if (marker) marker.openPopup()
      })
    }
  }
})

onMounted(async () => {
  await nextTick()
  if (!mapEl.value) return
  
  map = L.map(mapEl.value, { zoomControl: true })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  map.invalidateSize()
  rebuildMarkers()
  if (props.sites.length > 0) zoomToSites(props.sites)
})

onBeforeUnmount(() => { 
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-map-pin" /> แผนที่จุดติดตั้งมิเตอร์</div>
    </div>
    <div ref="mapEl" style="height:550px; width:100%; border-radius:8px; z-index:0" />
  </div>
</template>