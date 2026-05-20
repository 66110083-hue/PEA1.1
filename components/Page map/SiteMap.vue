
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

function rebuildMarkers() {
  if (!map) return
  markerMap.forEach(m => m.remove())
  markerMap.clear()
  props.sites.forEach(site => {
    const marker = L.circleMarker([site.lat, site.lng], {
      radius: 10,
      fillColor: statusColor[site.status],
      color: '#fff',
      weight: 2,
      fillOpacity: 0.9,
    }).addTo(map!)
    marker.bindTooltip(`<b>${site.id}</b><br>${site.name}`, { direction: 'top' })
    marker.on('click', () => emit('select', site.id))
    markerMap.set(site.id, marker)
  })
}

function zoomToSites(sites: Site[]) {
  if (!map || sites.length === 0) return
  
  // รีเซ็ตการคำนวณพื้นที่ของขอบหน้าต่างแผนที่กันอาการบั๊กเรนเดอร์ไม่เต็มกล่อง
  map.invalidateSize()

  // หน่วงเวลาเพื่อให้แอนิเมชันลื่นไหลสมูทขึ้น
  setTimeout(() => {
    if (!map) return
    if (sites.length === 1) {
      // ซูมเจาะเดี่ยวระดับใกล้ (Close-up Zoom ระดับ 16)
      map.setView([sites[0].lat, sites[0].lng], 16, { animate: true })
    } else {
      // ซูมขยายรัศมีจับเป็นกลุ่มให้เห็นครบถ้วนภายในขอบเขตพื้นที่ที่เลือก
      const bounds = L.latLngBounds(sites.map(s => [s.lat, s.lng]))
      map.fitBounds(bounds, { padding: [48, 48], animate: true })
    }
  }, 100)
}

// รับสัญญาณการกดปุ่มฟิลเตอร์ดึงข้อมูลจากภายนอก แล้วสั่งให้กล้องขยับซูมทันที
watch(() => props.filterTrigger, () => {
  if (props.sites && props.sites.length > 0) {
    zoomToSites(props.sites)
  }
})

// ปรับปรุงการขยับหมุดกรณีมีการเปลี่ยนข้อมูลภายในชุดเดิม
watch(() => props.sites, (newSites) => {
  rebuildMarkers()
  zoomToSites(newSites)
}, { deep: true })

// ไฮไลต์ขยายขนาดหมุดที่ถูกผู้ใช้งานเอาเมาส์คลิกเลือก
watch(() => props.selectedSiteId, (id) => {
  markerMap.forEach((m, key) => {
    m.setStyle({
      weight:  key === id ? 3  : 2,
      radius:  key === id ? 13 : 10,
    } as any)
  })
})

onMounted(() => {
  if (!mapEl.value) return
  map = L.map(mapEl.value, { zoomControl: true })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  rebuildMarkers()
  zoomToSites(props.sites)
})

onBeforeUnmount(() => { map?.remove(); map = null })
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-map-pin" /> แผนที่จุดติดตั้งมิเตอร์</div>
      <div class="map-legend">
        <span><span class="legend-dot" style="background:#1D9E75" />ปกติ</span>
        <span><span class="legend-dot" style="background:#E24B4A" />แจ้งเตือน</span>
        <span><span class="legend-dot" style="background:#BA7517" />ออฟไลน์</span>
      </div>
    </div>
    <div ref="mapEl" style="height:360px;border-radius:8px;z-index:0" />
  </div>
</template>
