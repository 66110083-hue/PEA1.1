<template>
  <div class="map-container">
    <div v-if="isLoading" class="loading-overlay">
      กำลังโหลดข้อมูลไซต์และแผนที่...
    </div>
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div id="map" class="site-map"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, onBeforeUnmount } from 'vue'
// เปลี่ยน Path ด้านล่างนี้ให้ตรงกับโฟลเดอร์ที่คุณเก็บไฟล์ useSiteData.ts
import { useSiteData } from '@/composables/useSiteData' 
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ไอคอนเริ่มต้นของ Leaflet (แก้ปัญหาไอคอนหมุดไม่ขึ้นใน Vite/Webpack)
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const { allSites, isLoading, error, fetchSites } = useSiteData()

let map: L.Map | null = null
const markerGroup = L.layerGroup()

function initMap() {
  // สร้างแผนที่ (เซ็ตจุดศูนย์กลางตั้งต้นไว้ที่ กทม.)
  map = L.map('map', {
    center: [13.8508, 100.5581],
    zoom: 11
  })

  // โหลดภาพแผนที่จาก OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  markerGroup.addTo(map)
}

function updateMapMarkers() {
  if (!map) return

  markerGroup.clearLayers() // ล้างหมุดเก่า
  const activeMarkers: L.Marker[] = []

  allSites.value.forEach((site) => {
    // กรองพิกัดที่ไม่ถูกต้องออก
    if (isNaN(site.lat) || isNaN(site.lng) || (site.lat === 0 && site.lng === 0)) return 

    // สร้างหมุดและ Popup
    const marker = L.marker([site.lat, site.lng])
      .bindPopup(`
        <div class="popup-content">
          <strong style="font-size: 14px;">${site.name}</strong><br/>
          <span style="color: gray;">ID: ${site.id}</span><br/>
          <span>พิกัด: ${site.lat.toFixed(4)}, ${site.lng.toFixed(4)}</span><br/>
          <span class="status-badge ${site.status}">สถานะ: ${site.status}</span>
        </div>
      `)

    markerGroup.addLayer(marker)
    activeMarkers.push(marker)
  })

  // ปรับ Zoom อัตโนมัติให้เห็นหมุดทุกตัวในหน้าจอ
  if (activeMarkers.length > 0) {
    const featureGroup = L.featureGroup(activeMarkers)
    map.fitBounds(featureGroup.getBounds().pad(0.1))
  }
}

onMounted(async () => {
  initMap()
  await fetchSites()
  updateMapMarkers()
})

// หากข้อมูลมีการเปลี่ยนแปลงจากที่อื่น ให้แผนที่อัปเดตตาม
watch(allSites, () => {
  updateMapMarkers()
}, { deep: true })

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.site-map {
  height: 600px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1; /* ป้องกันไม่ให้แผนที่ทับ Navbar หรือ Modal ของหน้าเว็บ */
}

.loading-overlay {
  padding: 15px;
  text-align: center;
  background: #e9ecef;
  border-radius: 8px;
  margin-bottom: 10px;
  font-weight: bold;
}

.error-message {
  padding: 15px;
  text-align: center;
  color: #842029;
  background: #f8d7da;
  border: 1px solid #f5c2c7;
  border-radius: 8px;
  margin-bottom: 10px;
}

/* สไตล์กล่อง Popup บนแผนที่ */
:deep(.popup-content) {
  font-family: inherit;
  line-height: 1.6;
}
:deep(.status-badge) {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
}
:deep(.status-badge.online) { background: #d1e7dd; color: #0f5132; }
:deep(.status-badge.alert) { background: #fff3cd; color: #664d03; }
:deep(.status-badge.offline) { background: #f8d7da; color: #842029; }
</style>