<template>
  <div class="map-container">
    <div v-if="isLoading" class="loading-overlay">
      กำลังโหลดข้อมูลไซต์และแผนที่...
    </div>
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- 1. เปลี่ยนจาก id="map" เป็นการใช้ ref="mapElement" ของ Vue แทน -->
    <div ref="mapElement" class="site-map"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, onBeforeUnmount, ref, nextTick } from 'vue'
import { useSiteData } from '@/composables/useSiteData' 
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ไอคอนเริ่มต้นของ Leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const { allSites, isLoading, error, fetchSites } = useSiteData()

// 2. สร้าง Ref สำหรับจับกล่อง HTML ของแผนที่โดยเฉพาะ (ไม่ตีกันเวลาเปลี่ยนหน้า)
const mapElement = ref<HTMLElement | null>(null)
let map: L.Map | null = null
const markerGroup = L.layerGroup()
let resizeObserver: ResizeObserver | null = null

function initMap() {
  if (!mapElement.value) return

  // ─── ดึงค่า Tile URL ผ่าน Runtime Config (Env) ───
  const config = useRuntimeConfig()
  const tileUrl = config.public.mapTileUrl as string

  // สร้างแผนที่โดยส่งตัวแปร DOM Element เข้าไปแทน string ID
  map = L.map(mapElement.value, {
    center: [13.8508, 100.5581],
    zoom: 11
  })

  // ใช้ตัวแปร tileUrl ที่ดึงมาจาก .env แทนการฟิกซ์ลิงก์
  L.tileLayer(tileUrl, {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  markerGroup.addTo(map)

  resizeObserver = new ResizeObserver(() => {
    if (map) {
      map.invalidateSize()
    }
  })
  resizeObserver.observe(mapElement.value)
}

function updateMapMarkers() {
  if (!map) return

  markerGroup.clearLayers()
  const activeMarkers: L.Marker[] = []

  allSites.value.forEach((site) => {
    if (isNaN(site.lat) || isNaN(site.lng) || (site.lat === 0 && site.lng === 0)) return 

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

  if (activeMarkers.length > 0) {
    const featureGroup = L.featureGroup(activeMarkers)
    map.fitBounds(featureGroup.getBounds().pad(0.1))
  }
}

onMounted(async () => {
  // รอให้ Vue เรนเดอร์โครงสร้าง HTML ให้เสร็จสิ้นสมบูรณ์ก่อน 1 จังหวะ
  await nextTick()
  
  initMap()
  await fetchSites()
  updateMapMarkers()

  // 4. ตั้งหน่วงเวลา 400ms (รอจนแอนิเมชัน Transition เปลี่ยนหน้าของ app.vue เล่นจบ)
  // แล้วสั่งให้ Leaflet วาดกระเบื้องแผนที่ใหม่อีกรอบ
  setTimeout(() => {
    if (map) {
      map.invalidateSize()
    }
  }, 400)
})

watch(allSites, () => {
  updateMapMarkers()
}, { deep: true })

onBeforeUnmount(() => {
  // ยกเลิกการ observe และทำลายแผนที่ทิ้งอย่างสะอาดหมดจดเมื่อย้ายไปหน้าอื่น
  if (resizeObserver && mapElement.value) {
    resizeObserver.unobserve(mapElement.value)
  }
  if (map) {
    map.remove()
    map = null
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
  z-index: 1;
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