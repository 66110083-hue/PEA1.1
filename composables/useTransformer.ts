import { ref, computed } from 'vue'
import { useSiteData, type Site } from '~/composables/useSiteData'

export interface Transformer {
  id:           string // เช่น 'M-01', 'M-02'
  status:       'online' | 'offline'
  deviceId:     string; peaNo: string; brand: string; commType: string;
  rated: number; ratedCT: number; ipSim: string; maxLoad: number; maxFeedIn: number;
  province: string; location: string; lat: number; long: number; installDate: string; imagePreview: string;
}

export type ModalMode = 'add' | 'edit' | 'view' | 'delete'

export const emptyForm = (): Transformer => ({
  id: '', status: 'online', deviceId: '', peaNo: '', brand: '',
  commType: '', rated: 160, ratedCT: 250, ipSim: '', maxLoad: 80, maxFeedIn: 15,
  province: '', location: '', lat: 0, long: 0, installDate: '', imagePreview: '',
})

const { provinces: SITE_PROVINCES, allSites } = useSiteData()
export const PROVINCES = SITE_PROVINCES
export const COMM_TYPES = ['4G Cellular','WiFi','LoRa','Fiber']

export function useTransformer() {
  // ✨ ปลดล็อกและแมปข้อมูลหม้อแปลงตามจำนวน Site ที่มีทั้งหมดโดยตรง
  const initialTransformers: Transformer[] = allSites.map((site, index) => {
    const comms  = ['4G Cellular', '4G Cellular', 'LoRa', '4G Cellular', 'WiFi', '4G Cellular', 'Fiber']
    return {
      id:           site.id, // ใช้รหัสย่อมาตรฐาน เช่น 'M-01'
      status:       site.status === 'offline' ? 'offline' : 'online',
      deviceId:     `4A5G0PV1Y23E0${index + 1}B09N`,
      peaNo:        `${site.id}-TR#0${index + 1}`,
      brand:        `Transformer ${site.name}`, 
      rated:        index === 3 ? 315 : index === 4 ? 250 : index === 6 ? 400 : 160,
      ratedCT:      index === 3 ? 400 : index === 4 ? 300 : index === 6 ? 500 : 250,
      commType:     comms[index % comms.length],
      ipSim:        `10.36.22.${90 + index}`,
      maxLoad:      80, maxFeedIn: 15, province: site.province, location: site.name, lat: site.lat, long: site.lng,
      installDate:  `2025-01-${10 + index}`, imagePreview: ''
    }
  })

  const transformers = ref<Transformer[]>(initialTransformers)
  const searchQuery = ref(''); const statusFilter = ref(''); const page = ref(1); const perPage = 10

  const filteredData = computed(() => {
    let d = transformers.value
    if (searchQuery.value)
      d = d.filter(r =>
        r.peaNo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        r.deviceId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    if (statusFilter.value) d = d.filter(r => r.status === statusFilter.value)
    return d
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / perPage)))

  const showModal = ref(false); const modalMode = ref<ModalMode>('add'); const formError = ref(''); const editingId = ref<string | null>(null); const form = ref(emptyForm())

  function openAdd() { form.value = emptyForm(); modalMode.value = 'add'; formError.value = ''; showModal.value = true; }
  function openView(row: Transformer) { form.value = { ...row }; modalMode.value = 'view'; showModal.value = true; }
  function openEdit(row: Transformer) { form.value = { ...row }; editingId.value = row.id; modalMode.value = 'edit'; formError.value = ''; showModal.value = true; }
  function confirmDelete(row: Transformer) { form.value = { ...row }; editingId.value = row.id; modalMode.value = 'delete'; showModal.value = true; }
  function closeModal() { showModal.value = false; editingId.value = null; }

  function validate(): string {
    if (modalMode.value === 'add' && !form.value.id) return 'กรุณาระบุหรือเลือก Site ID'
    if (!form.value.peaNo)    return 'กรุณากรอก PEA No. Transformer'
    if (!form.value.deviceId) return 'กรุณากรอก Device ID'
    if (!form.value.brand)    return 'กรุณากรอก Transformer Brand'
    if (!form.value.commType) return 'กรุณาเลือก Communication Type'
    if (!form.value.province) return 'กรุณาเลือก Province'
    return ''
  }

  function saveForm() {
    const err = validate(); if (err) { formError.value = err; return }
    const linkedSite = allSites.find(s => s.id === form.value.id)
    if (linkedSite) {
      form.value.province = linkedSite.province; form.value.location = linkedSite.name;
      form.value.lat = linkedSite.lat; form.value.long = linkedSite.lng;
    }
    if (modalMode.value === 'add') {
      if (transformers.value.some(r => r.id === form.value.id)) { formError.value = 'Site ID นี้มีหม้อแปลงติดตั้งอยู่แล้ว'; return }
      transformers.value.push({ ...form.value })
    } else {
      const idx = transformers.value.findIndex(r => r.id === editingId.value)
      if (idx >= 0) transformers.value[idx] = { ...form.value, id: editingId.value! }
    }
    closeModal()
  }

  function deleteRow() { transformers.value = transformers.value.filter(r => r.id !== editingId.value); closeModal(); }

  return {
    transformers, filteredData, totalPages, availableSites: allSites, searchQuery, statusFilter, page,
    showModal, modalMode, formError, form, openAdd, openView, openEdit, confirmDelete, closeModal, saveForm, deleteRow
  }
}