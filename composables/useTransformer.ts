// 📂 composables/useTransformer.ts

import { ref, computed, watch } from 'vue'
import { useSiteData, allTransformers as siteTransformers } from '~/composables/useSiteData'

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

const { allSites } = useSiteData()
// provinces ไม่ได้มาจาก API ชั่วคราว รอ backend เพิ่ม field
export const PROVINCES  = [
  'กรุงเทพมหานคร','นนทบุรี','ปทุมธานี','สมุทรปราการ','นครปฐม',
  'สมุทรสาคร','อยุธยา','สระบุรี','ชลบุรี','ระยอง',
]
export const COMM_TYPES = ['4G Cellular', 'WiFi', 'LoRa', 'Fiber']

// ─── Helpers ──────────────────────────────────────────────
// ✅ แก้: ไม่ยิง /api/device/list + /api/measure/lastrecord เองแล้ว
//    เพราะ lastrecord แบบไม่ส่ง siteid จะ 500 error (ตอบ HTML กลับมา ไม่ใช่ JSON)
//    ใช้ allTransformers จาก useSiteData.ts แทน เพราะที่นั่นยิง lastrecord
//    แยกทีละ site ตาม devToSite map อย่างถูกต้องอยู่แล้ว
async function fetchDevices(): Promise<Transformer[]> {
  const { fetchSites } = useSiteData()
  await fetchSites()   // จะ no-op ถ้าเคยโหลดแล้ว (มี isSiteFetched guard ในตัว)

  if (siteTransformers.length === 0) {
    throw new Error('[fetchDevices] ไม่มีข้อมูล transformer จาก useSiteData (เช็คว่า site/install/device list โหลดสำเร็จหรือไม่)')
  }

  return siteTransformers.map((t, index) => ({
    id:           t.id,
    status:       t.status,
    deviceId:     t.deviceId,
    description:  '',
    commType:     t.commType,

    // ── mock ชั่วคราว (รอ backend เพิ่ม field) ───────────
    peaNo:        t.peaNo,
    brand:        t.brand,
    model:        'TX-2000',
    serialNumber: t.deviceId,
    feederNo:     index % 2 === 0 ? 'Feeder 01' : 'Feeder 02',
    rated:        t.rated,
    ratedCT:      t.ratedCT,
    ipSim:        t.ipSim,
    maxLoad:      t.maxLoad,
    maxFeedIn:    15,
    province:     '',
    location:     t.location,
    lat:          t.lat,
    long:         t.long,
    installDate:  t.installDate,
    imagePreview: '',
  }))
}

// ─── Global State ─────────────────────────────────────────
const globalTransformers = ref<Transformer[]>([])
let   isInitialized       = false

export function useTransformer() {
  const transformers = globalTransformers

  if (typeof window !== 'undefined' && !isInitialized) {
    watch(transformers, (newVal) => {
      localStorage.setItem('pea_transformers_data', JSON.stringify(newVal))
    }, { deep: true })
  }

  async function loadFromAPI() {
    if (isInitialized) return

    try {
      const apiData = await fetchDevices()

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

      isInitialized = true
    } catch (e) {
      console.error('[useTransformer] loadFromAPI failed:', e)
      const saved = localStorage.getItem('pea_transformers_data')
      if (saved) {
        try { globalTransformers.value = JSON.parse(saved) } catch {}
      }
    }
  }

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