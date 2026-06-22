<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Site } from '~/composables/useSiteData'

const props = defineProps<{
  sites: Site[]
  selectedSiteId: string | null
  filterTrigger?: number
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

// 🟢 1. ฟังก์ชันสร้าง HTML Popup โดยอ่านจาก props.sites ที่ Join ข้อมูลมาแล้วโดยตรง
function generatePopupHtml(site: Site) {
  const baseUrl = 'https://greatways.net/api/assets/img/site?fname=' 
  const imageUrl = site.img && site.img !== '2' ? `${baseUrl}${site.img}` : null

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
        <div style="display: flex; justify-content: space-between;">
          <span style="color:#9ca3af">Device ID:</span> <b>${site.deviceId || '-'}</b>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color:#9ca3af">Serial:</span> <span style="color:#378ADD; font-weight:bold;">${site.devSerial || '-'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color:#9ca3af">วันที่ติดตั้ง:</span> <span style="font-size: 11px; color: #6b7280;">${site.installDate || '-'}</span>
        </div>
        <div style="margin-top: 8px; background: #f8f9fa; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb;">
          <span style="color:#9ca3af; display:block; margin-bottom:2px; font-size: 11px;">รายละเอียดอุปกรณ์:</span>
          <span style="color:#1f2937; font-weight: 500;">${site.devDetail || 'ไม่มีข้อมูล'}</span>
        </div>
      </div>
    </div>
  `
}

// 🟢 2. สั่งเปิด Popup (ใช้เวลาโดนกดเลือกมาจากตารางหรือการ์ดข้างนอกแผนที่)
function openPopupFor(siteId: string) {
  const marker = markerMap.get(siteId)
  if (marker) {
    marker.openPopup()
  }
}

function rebuildMarkers() {
  if (!map) return
  markerMap.forEach(m => m.remove())
  markerMap.clear()
  
  props.sites.forEach(site => {
    const isSelected = props.selectedSiteId === site.id
    const marker = L.circleMarker([site.lat, site.lng], {
      radius: isSelected ? 13 : 10,
      fillColor: statusColor[site.status],
      color: '#fff',
      weight: isSelected ? 3 : 2,
      fillOpacity: 0.9,
    }).addTo(map!)
    
    marker.bindTooltip(`<b>${site.id}</b><br>${site.name}`, { direction: 'top' })

    // 🟢 3. ประกอบร่าง HTML ยัดใส่หมุดไว้ล่วงหน้าเลย!
    marker.bindPopup(generatePopupHtml(site), { minWidth: 260 })
    
    marker.on('click', () => {
      emit('select', site.id)
      // ไม่ต้องสั่ง openPopup() แล้ว เพราะ Leaflet จะเด้งเปิดให้เองตอนคลิกหมุด
    })
    
    markerMap.set(site.id, marker)
  })
}

function zoomToSites(sites: Site[]) {
  if (!map || sites.length === 0) return
  map.invalidateSize()
  setTimeout(() => {
    if (!map) return
    const bounds = L.latLngBounds(sites.map(s => [s.lat, s.lng]))
    map.fitBounds(bounds, { padding: [48, 48], animate: true })
  }, 100)
}

watch(() => props.sites, (newSites) => {
  rebuildMarkers()
  zoomToSites(newSites)
}, { deep: true })

watch(() => props.selectedSiteId, (id) => {
  markerMap.forEach((m, key) => {
    m.setStyle({
      weight:  key === id ? 3  : 2,
      radius:  key === id ? 13 : 10,
    } as any)
  })

  if (id && map) {
    const site = props.sites.find(s => s.id === id)
    if (site) {
      map.flyTo([site.lat, site.lng], 16, { animate: true, duration: 0.5 })
      setTimeout(() => { openPopupFor(id) }, 600)
    }
  }
})

onMounted(() => {
  if (!mapEl.value) return
  map = L.map(mapEl.value, { zoomControl: true })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)
  
  setTimeout(() => map?.invalidateSize(), 200)
  rebuildMarkers()
  zoomToSites(props.sites)
})

onBeforeUnmount(() => { map?.remove(); map = null })
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-map-pin" /> แผนที่จุดติดตั้งมิเตอร์</div>
    </div>
    <div ref="mapEl" style="height:550px;border-radius:8px;z-index:0" />
  </div>
</template>