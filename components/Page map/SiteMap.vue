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

const installDataCache = ref<any[] | null>(null)

const statusColor: Record<string, string> = {
  online:  '#1D9E75',
  alert:   '#E24B4A',
  offline: '#BA7517',
}

async function getInstallDetails(siteId: string) {
  if (!installDataCache.value) {
    try {
      const res = await fetch('https://greatways.net/api/site/install')
      if (!res.ok) throw new Error('API Error')
      const data = await res.json()
      if (data.status === 'susscess' && data.msg) {
        installDataCache.value = data.msg
      } else {
        installDataCache.value = []
      }
    } catch (e) {
      console.error('Fetch install detail error:', e)
      return null
    }
  }
  return installDataCache.value?.find((item: any) => item.siteid === siteId)
}

async function openPopupFor(siteId: string) {
  const marker = markerMap.get(siteId)
  const site = props.sites.find(s => s.id === siteId)
  if (!marker || !site) return

  // เปิด Popup โหลดข้อมูลชั่วคราวทันที
  marker.bindPopup('<div style="text-align:center; padding:10px;">กำลังโหลดข้อมูล...</div>', { minWidth: 260 }).openPopup()

  const detail = await getInstallDetails(siteId)

  if (detail) {
    const baseUrl = 'https://greatways.net/api/assets/img/site?fname=' 
    const imageUrl = detail.img && detail.img !== '2' ? `${baseUrl}${detail.img}` : null

    const html = `
      <div style="font-family: sans-serif; min-width: 240px;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 15px; border-bottom: 2px solid #1D9E75; padding-bottom: 6px;">
          ${detail.sitename}
        </h4>
        
        ${imageUrl ? `
          <div style="margin-bottom: 10px; border-radius: 6px; overflow: hidden; border: 1px solid #e5e7eb; background: #f3f4f6;">
            <img src="${imageUrl}" alt="Site Image" style="width: 100%; height: 130px; object-fit: cover; display: block;" onerror="this.style.display='none';" />
          </div>
        ` : ''}

        <div style="font-size: 13px; color: #4b5563; line-height: 1.6;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color:#9ca3af">Device ID:</span> <b>${detail.devid}</b>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color:#9ca3af">Serial:</span> <span style="color:#378ADD; font-weight:bold;">${detail.devserial}</span>
          </div>
          <div style="margin-top: 8px; background: #f8f9fa; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <span style="color:#9ca3af; display:block; margin-bottom:2px; font-size: 11px;">รายละเอียดอุปกรณ์:</span>
            <span style="color:#1f2937; font-weight: 500;">${detail.devdetail}</span>
          </div>
        </div>
      </div>
    `
    marker.setPopupContent(html)
  } else {
    marker.setPopupContent(`
      <div style="padding:10px; text-align:center; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937;">${site.name}</h4>
        <div style="color:#E24B4A; font-size: 13px;">ยังไม่พบข้อมูลการติดตั้งอุปกรณ์</div>
      </div>
    `)
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
    
    marker.on('click', () => {
      emit('select', site.id)
      openPopupFor(site.id) // 🟢 สั่งเปิด Popup ทันทีที่จิ้มหมุด!
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

// 🟢 เมื่อเลือกหมุดจากหน้าจออื่น ให้วงกลมขยาย แพนกล้องไปหา และเปิด Popup
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
      // แพนกล้องไปหาจุดนั้นแบบสมูทๆ
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