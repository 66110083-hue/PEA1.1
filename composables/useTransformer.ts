// 📂 composables/useTransformer.ts

import { ref, computed, watch } from 'vue'
import { useSiteData } from '~/composables/useSiteData'

const BASE_URL = 'https://greatways.net'

export interface Transformer {
  id:           string
  status:       'online' | 'offline'
  deviceId:     string; peaNo: string; brand: string; commType: string;
  model:        string
  serialNumber: string
  feederNo:     string
  description:  string
  rated: number; ratedCT: number; ipSim: string; maxLoad: number; maxFeedIn: number;
  province: string; location: string; lat: number; long: number; installDate: string; imagePreview: string;
}

export type ModalMode = 'add' | 'edit' | 'view' | 'delete'

export const emptyForm = (): Transformer => ({
  id: '', status: 'online', deviceId: '', peaNo: '', brand: '',
  model: '', serialNumber: '', feederNo: '', description: '',
  commType: '', rated: 160, ratedCT: 250, ipSim: '', maxLoad: 80, maxFeedIn: 15,
  province: '', location: '', lat: 0, long: 0, installDate: '', imagePreview: '',
})

const { provinces: SITE_PROVINCES, allSites } = useSiteData()
export const PROVINCES  = SITE_PROVINCES
export const COMM_TYPES = ['4G Cellular', 'WiFi', 'LoRa', 'Fiber']

const TYPE_MAP: Record<string, string> = {
  '1': '4G Cellular',
  '2': 'LoRa',
}

// ─── Helpers ──────────────────────────────────────────────
function isRecentUpdate(update: string, thresholdMinutes = 15): boolean {
  if (!update) return false
  // format จาก API: "11/06/2026 14:11"
  const [datePart, timePart] = update.split(' ')
  if (!datePart || !timePart) return false
  const [dd, mm, yyyy] = datePart.split('/')
  const iso  = `${yyyy}-${mm}-${dd}T${timePart}:00`
  const diff = (Date.now() - new Date(iso).getTime()) / 60000
  return diff <= thresholdMinutes
}

async function fetchDevices(): Promise<Transformer[]> {
  const [deviceRes, measureRes] = await Promise.all([
    fetch(`${BASE_URL}/api/device/list`).then(r => r.json()),
    fetch(`${BASE_URL}/api/measure/lastrecord`).then(r => r.json()),
  ])

  const lastUpdate: string = measureRes?.msg?.update ?? ''
  const isOnline = isRecentUpdate(lastUpdate)

  return (deviceRes.msg as any[]).map((d: any, index: number) => ({
    // ── จาก API ──────────────────────────────────────────
    id:          String(d.id),
    deviceId:    d.serial,
    description: d.detail,
    commType:    TYPE_MAP[d.type] ?? d.type,
    status:      isOnline ? 'online' : 'offline',

    // ── mock ชั่วคราว (รอ backend เพิ่ม field) ───────────
    peaNo:        `M-${String(d.id).padStart(2, '0')}`,
    brand:        'Unknown',
    model:        'TX-2000',
    serialNumber: d.serial,
    feederNo:     index % 2 === 0 ? 'Feeder 01' : 'Feeder 02',
    rated:        160,
    ratedCT:      250,
    ipSim:        '',
    maxLoad:      80,
    maxFeedIn:    15,
    province:     '',
    location:     '',
    lat:          0,
    long:         0,
    installDate:  '',
    imagePreview: '',
  }))
}

// ─── Global State ─────────────────────────────────────────
const globalTransformers = ref<Transformer[]>([])
let   isInitialized       = false

export function useTransformer() {
  const transformers = globalTransformers

  // watch เซฟ localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  if (typeof window !== 'undefined' && !isInitialized) {
    watch(transformers, (newVal) => {
      localStorage.setItem('pea_transformers_data', JSON.stringify(newVal))
    }, { deep: true })
  }

  // ─── Load จาก API ───────────────────────────────────────
  async function loadFromAPI() {
    if (isInitialized) return
    isInitialized = true

    try {
      const apiData = await fetchDevices()

      // merge กับ localStorage: รักษา field ที่ user เคยแก้ไข (peaNo, brand ฯลฯ)
      // แต่ status ใช้จาก API เสมอ
      const saved = localStorage.getItem('pea_transformers_data')
      if (saved) {
        const local: Transformer[] = JSON.parse(saved)
        globalTransformers.value = apiData.map(apiRow => {
          const localRow = local.find(l => l.id === apiRow.id)
          return localRow
            ? { ...apiRow, ...localRow, status: apiRow.status }
            : apiRow
        })
      } else {
        globalTransformers.value = apiData
      }
    } catch (e) {
      console.error('[useTransformer] API fetch failed, falling back to localStorage', e)
      const saved = localStorage.getItem('pea_transformers_data')
      if (saved) {
        try { globalTransformers.value = JSON.parse(saved) } catch {}
      }
    }
  }

  // ─── Filter / Pagination ────────────────────────────────
  const searchQuery  = ref('')
  const statusFilter = ref('')
  const page         = ref(1)
  const perPage      = 10

  const filteredData = computed(() => {
    let d = transformers.value
    if (searchQuery.value)
      d = d.filter(r =>
        r.peaNo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        r.deviceId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    if (statusFilter.value) d = d.filter(r => r.status === statusFilter.value)
    d = d.sort((a, b) => a.peaNo.localeCompare(b.peaNo, 'en', { numeric: true }))
    return d
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredData.value.length / perPage))
  )

  // ─── Modal ──────────────────────────────────────────────
  const showModal  = ref(false)
  const modalMode  = ref<ModalMode>('add')
  const formError  = ref('')
  const editingId  = ref<string | null>(null)
  const form       = ref(emptyForm())

  function openAdd()                    { form.value = emptyForm(); modalMode.value = 'add';    formError.value = ''; showModal.value = true }
  function openView(row: Transformer)   { form.value = { ...row }; modalMode.value = 'view';   showModal.value = true }
  function openEdit(row: Transformer)   { form.value = { ...row }; editingId.value = row.id;   modalMode.value = 'edit';   formError.value = ''; showModal.value = true }
  function confirmDelete(row: Transformer) { form.value = { ...row }; editingId.value = row.id; modalMode.value = 'delete'; showModal.value = true }
  function closeModal()                 { showModal.value = false; editingId.value = null }

  function validate(): string {
    if (!form.value.feederNo) return 'กรุณาเลือก Feeder No.'
    if (!form.value.lat)      return 'กรุณากรอกพิกัด Latitude'
    if (!form.value.long)     return 'กรุณากรอกพิกัด Longitude'
    return ''
  }

  function saveForm() {
    const err = validate()
    if (err) { formError.value = err; return }

    if (modalMode.value === 'add' && !form.value.id) {
      form.value.id = form.value.peaNo
    }

    const linkedSite = allSites.find(s => s.id === form.value.id)
    if (linkedSite) {
      form.value.province = linkedSite.province
      form.value.location = linkedSite.name
      form.value.lat      = linkedSite.lat
      form.value.long     = linkedSite.lng
    }

    if (modalMode.value === 'add') {
      if (transformers.value.some(r => r.peaNo === form.value.peaNo)) {
        formError.value = 'PEA No. นี้มีในระบบแล้ว'
        return
      }
      transformers.value.push({ ...form.value })
    } else {
      const idx = transformers.value.findIndex(r => r.id === editingId.value)
      if (idx >= 0) transformers.value[idx] = { ...form.value, id: editingId.value! }
    }
    closeModal()
  }

  function deleteRow() {
    transformers.value = transformers.value.filter(r => r.id !== editingId.value)
    closeModal()
  }

  function exportCSV() {
    const headers = ['id','status','deviceId','peaNo','brand','commType','rated','ratedCT','ipSim','lat','long']
    const rows    = transformers.value.map(r =>
      headers.map(h => (r as any)[h]).join(',')
    )
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'transformers.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return {
    loadFromAPI,
    transformers, filteredData, totalPages, availableSites: allSites,
    searchQuery, statusFilter, page,
    showModal, modalMode, formError, form,
    openAdd, openView, openEdit, confirmDelete, closeModal, saveForm, deleteRow, exportCSV,
  }
}