// useTransformer.ts
// Logic ทั้งหมดแก้ไขมาดึงฐานข้อมูลและ ID ร่วมกับ useSiteData เรียบร้อยแล้ว
import { ref, computed } from 'vue'
// นำเข้าข้อมูลโมเดลและรายการข้อมูลจาก useSiteData.ts
import { useSiteData, type Site } from '~/composables/useSiteData'

// ─── Types ───────────────────────────────────────────────
export interface Transformer {
  id:           string // ใช้ id ของ Site (เช่น 'M-01') แทนตัวเลข
  status:       'online' | 'offline'
  deviceId:     string
  peaNo:        string
  brand:        string
  commType:     string
  rated:        number
  ratedCT:      number
  ipSim:        string
  maxLoad:      number
  maxFeedIn:    number
  province:     string
  location:     string
  lat:          number
  long:         number
  installDate:  string
  imagePreview: string
}

export type ModalMode = 'add' | 'edit' | 'view' | 'delete'

// ─── Empty Form ──────────────────────────────────────────
export const emptyForm = (): Transformer => ({
  id: '', // เพิ่มฟิลด์ id เข้ามาในฟอร์มเพื่อให้เลือกจับคู่กับ Site ID ตอนสร้าง
  status: 'online', deviceId: '', peaNo: '', brand: '',
  commType: '', rated: 160, ratedCT: 250, ipSim: '',
  maxLoad: 80, maxFeedIn: 15, province: '', location: '',
  lat: 0, long: 0, installDate: '', imagePreview: '',
})

// ดึงจังหวัดจาก useSiteData แทนการเขียนแยกเอง
const { provinces: SITE_PROVINCES, allSites } = useSiteData()
export const PROVINCES = SITE_PROVINCES

export const COMM_TYPES = ['4G Cellular','WiFi','LoRa','Fiber']

// ─── Composable ──────────────────────────────────────────
export function useTransformer() {

  // 🔥 จัดกลุ่มตัวแปรเริ่มต้น: แมปข้อมูลดึงโครงสร้างมาจาก allSites และใช้ site.name เป็น brand
  const initialTransformers: Transformer[] = allSites.slice(0, 7).map((site, index) => {
    const comms  = ['4G Cellular', '4G Cellular', 'LoRa', '4G Cellular', 'WiFi', '4G Cellular', 'Fiber']
    
    return {
      id: site.id,         // ใช้ ID ร่วมกับ useSiteData ทันที (M-01, M-02, ...)
      status: site.status === 'offline' ? 'offline' : 'online',
      deviceId: `4A5G0PV1Y23E0${index + 1}B09N`,
      peaNo: `${site.id}-TR#0${index + 1}`,
      
      // 🔥 แก้ไขจุดนี้ตามต้องการ: ดึงชื่อ site.name มาเทียบใส่ตรงกับ id ของ sitedata.ts เลย
      brand: site.name, 
      
      rated: index === 3 ? 315 : index === 4 ? 250 : index === 6 ? 400 : 160,
      ratedCT: index === 3 ? 400 : index === 4 ? 300 : index === 6 ? 500 : 250,
      commType: comms[index % comms.length],
      ipSim: `10.36.22.${90 + index}`,
      maxLoad: 80,
      maxFeedIn: 15,
      province: site.province,
      location: site.name,
      lat: site.lat,
      long: site.lng,      // พิกัดลองจิจูดจาก siteData
      installDate: `2025-01-${10 + index}`,
      imagePreview: ''
    }
  })

  // Data State
  const transformers = ref<Transformer[]>(initialTransformers)

  // Filter state
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
        r.id.toLowerCase().includes(searchQuery.value.toLowerCase()) // ค้นหาด้วยรหัสหม้อแปลง/ไซต์ได้
      )
    if (statusFilter.value)
      d = d.filter(r => r.status === statusFilter.value)
    return d
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredData.value.length / perPage))
  )

  // Modal state
  const showModal = ref(false)
  const modalMode = ref<ModalMode>('add')
  const formError = ref('')
  const editingId = ref<string | null>(null) // เปลี่ยนโครงสร้างเป็น string | null ตาม id แบบใหม่
  const form      = ref(emptyForm())

  function openAdd() {
    form.value = emptyForm()
    modalMode.value = 'add'
    formError.value = ''
    showModal.value = true
  }

  function openView(row: Transformer) {
    form.value = { ...row }
    modalMode.value = 'view'
    showModal.value = true
  }

  function openEdit(row: Transformer) {
    form.value    = { ...row }
    editingId.value = row.id
    modalMode.value = 'edit'
    formError.value = ''
    showModal.value = true
  }

  function confirmDelete(row: Transformer) {
    form.value    = { ...row }
    editingId.value = row.id
    modalMode.value = 'delete'
    showModal.value = true
  }

  function closeModal() {
    showModal.value = false
    editingId.value = null
  }

  // Validate ฟอร์มข้อมูล
  function validate(): string {
    if (modalMode.value === 'add' && !form.value.id) return 'กรุณาระบุหรือเลือก Site ID'
    if (!form.value.peaNo)    return 'กรุณากรอก PEA No. Transformer'
    if (!form.value.deviceId) return 'กรุณากรอก Device ID'
    if (!form.value.brand)    return 'กรุณากรอก Transformer Brand'
    if (!form.value.commType) return 'กรุณาเลือก Communication Type'
    if (!form.value.province) return 'กรุณาเลือก Province'
    return ''
  }

  // Save ฟอร์มข้อมูล
  function saveForm() {
    const err = validate()
    if (err) { formError.value = err; return }
    
    // ค้นหาพิกัดและชื่อสถานที่จาก useSiteData อัตโนมัติ เพื่อให้ข้อมูลตรงกัน
    const linkedSite = allSites.find(s => s.id === form.value.id)
    if (linkedSite) {
      form.value.province = linkedSite.province
      form.value.location = linkedSite.name
      form.value.lat = linkedSite.lat
      form.value.long = linkedSite.lng
    }

    if (modalMode.value === 'add') {
      // ตรวจสอบเช็กไอดีซ้ำ
      const isDuplicate = transformers.value.some(r => r.id === form.value.id)
      if (isDuplicate) {
        formError.value = 'Site ID นี้มีหม้อแปลงติดตั้งอยู่แล้ว'
        return
      }
      transformers.value.push({ ...form.value })
    } else {
      const idx = transformers.value.findIndex(r => r.id === editingId.value)
      if (idx >= 0) transformers.value[idx] = { ...form.value, id: editingId.value! }
    }
    closeModal()
  }

  // Delete
  function deleteRow() {
    transformers.value = transformers.value.filter(r => r.id !== editingId.value)
    closeModal()
  }

  // Export CSV
  function exportCSV() {
    const headers = ['Site ID','Status','Device ID','PEA No.','Brand','Rated (kVA)','Rated CT','Comm. Type','IP Simcard','Lat','Long','Province','Install Date']
    const rows    = filteredData.value.map(r =>
      [r.id,r.status,r.deviceId,r.peaNo,r.brand,r.rated,r.ratedCT,r.commType,r.ipSim,r.lat,r.long,r.province,r.installDate].join(',')
    )
    const csv  = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'transformers.csv' })
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    // data
    transformers, filteredData, totalPages, availableSites: allSites,
    // filter
    searchQuery, statusFilter, page,
    // modal
    showModal, modalMode, formError, form,
    // actions
    openAdd, openView, openEdit, confirmDelete,
    closeModal, saveForm, deleteRow, exportCSV,
  }
}