// 📂 composables/useTransformer.ts

import { ref, computed, watch } from 'vue'
import { useSiteData, allTransformers as siteTransformers } from '~/composables/useSiteData'

export interface Transformer {
  id:           string
  status:       'online' | 'offline'
  siteId:       string
  siteName:     string
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
  id: '', status: 'online', siteId: '', siteName: '', deviceId: '', peaNo: '', brand: '',
  model: '', serialNumber: '', feederNo: '', description: '',
  commType: '', rated: 160, ratedCT: 250, ipSim: '', maxLoad: 80, maxFeedIn: 15,
  province: '', location: '', lat: 0, long: 0, installDate: '', imagePreview: '',
})

const { allSites } = useSiteData()
export const PROVINCES  = [
  'กรุงเทพมหานคร','นนทบุรี','ปทุมธานี','สมุทรปราการ','นครปฐม',
  'สมุทรสาคร','อยุธยา','สระบุรี','ชลบุรี','ระยอง',
]
export const COMM_TYPES = ['4G Cellular', 'WiFi', 'LoRa', 'Fiber']

async function fetchDevices(): Promise<Transformer[]> {
  const { fetchSites } = useSiteData()
  await fetchSites()

  if (siteTransformers.length === 0) {
    throw new Error('[fetchDevices] ไม่มีข้อมูล transformer จาก useSiteData (เช็คว่า site/install/device list โหลดสำเร็จหรือไม่)')
  }

  return siteTransformers.map((t, index) => ({
    id:           t.id,
    status:       t.status,
    siteId:       t.siteId,
    siteName:     t.siteName,
    deviceId:     t.deviceId,
    description:  '',
    commType:     t.commType,
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

const HIDDEN_KEY = 'pea_transformers_hidden'

function getHidden(): Transformer[] {
  try { return JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]') }
  catch { return [] }
}
function saveHidden(rows: Transformer[]) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(rows))
}

export function useTransformer() {
  const transformers = globalTransformers
  const hiddenList   = ref<Transformer[]>(getHidden())

  if (typeof window !== 'undefined' && !isInitialized) {
    watch(transformers, (newVal) => {
      localStorage.setItem('pea_transformers_data', JSON.stringify(newVal))
    }, { deep: true })
  }

  async function loadFromAPI() {
    if (isInitialized) return

    try {
      const apiData    = await fetchDevices()
      const hiddenIds  = new Set(getHidden().map(h => h.id))
      const saved      = localStorage.getItem('pea_transformers_data')
      const local: Transformer[] = saved ? JSON.parse(saved) : []

      globalTransformers.value = apiData
        .filter(apiRow => !hiddenIds.has(apiRow.id))
        .map(apiRow => {
          const localRow = local.find(l => l.id === apiRow.id)
          return localRow ? { ...apiRow, ...localRow, status: apiRow.status } : apiRow
        })

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
    const rowToHide = transformers.value.find(r => r.id === editingId.value)
    if (rowToHide) {
      const hidden = getHidden()
      hidden.push(rowToHide)
      saveHidden(hidden)
      hiddenList.value = hidden
    }
    transformers.value = transformers.value.filter(r => r.id !== editingId.value)
    closeModal()
  }

  function restoreRow(id: string) {
    const hidden  = getHidden()
    const idx     = hidden.findIndex(h => h.id === id)
    if (idx < 0) return

    const [restored] = hidden.splice(idx, 1)
    saveHidden(hidden)
    hiddenList.value = hidden

    transformers.value.push(restored)
  }

  function exportCSV() {
    const headers = ['id','status','siteId','siteName','deviceId','peaNo','brand','commType','rated','ratedCT','ipSim','lat','long']
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
    hiddenList, restoreRow,
    openAdd, openView, openEdit, confirmDelete, closeModal, saveForm, deleteRow, exportCSV,
  }
}