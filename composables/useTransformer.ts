// Logic ทั้งหมดอยู่ที่นี่
import { ref, computed } from 'vue'

// ─── Types ───────────────────────────────────────────────
export interface Transformer {
  id:           number
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
export const emptyForm = (): Omit<Transformer, 'id'> => ({
  status: 'online', deviceId: '', peaNo: '', brand: '',
  commType: '', rated: 160, ratedCT: 250, ipSim: '',
  maxLoad: 80, maxFeedIn: 15, province: '', location: '',
  lat: 0, long: 0, installDate: '', imagePreview: '',
})

export const PROVINCES = [
  'กรุงเทพมหานคร','เชียงใหม่','ขอนแก่น',
  'นครราชสีมา','พระนครศรีอยุธยา','ภูเก็ต',
  'สงขลา','ชลบุรี','ระยอง','นนทบุรี',
]

export const COMM_TYPES = ['4G Cellular','WiFi','LoRa','Fiber']

// ─── Composable ──────────────────────────────────────────
export function useTransformer() {

  // Data
  const transformers = ref<Transformer[]>([
    { id:1, status:'online',  deviceId:'4A5G0PV1Y23E01B09N', peaNo:'VISTA TR#01', brand:'VISTA TRAPE', rated:160, ratedCT:250, commType:'4G Cellular', ipSim:'10.36.22.90', maxLoad:80, maxFeedIn:15, province:'กรุงเทพมหานคร', location:'ลาดกระบัง',      lat:13.9024, long:100.5583, installDate:'2025-01-15', imagePreview:'' },
    { id:2, status:'online',  deviceId:'4A5G0PV1Y23E02C10M', peaNo:'VOLTA TR#05', brand:'แสงโสม',      rated:160, ratedCT:250, commType:'4G Cellular', ipSim:'10.36.22.91', maxLoad:80, maxFeedIn:15, province:'กรุงเทพมหานคร', location:'มีนบุรี',         lat:13.8150, long:100.4620, installDate:'2025-02-10', imagePreview:'' },
    { id:3, status:'offline', deviceId:'4A5G0PV1Y23E03D11P', peaNo:'Thai 44499L', brand:'Thai-44499L', rated:160, ratedCT:250, commType:'4G Cellular', ipSim:'10.36.22.92', maxLoad:80, maxFeedIn:15, province:'พระนครศรีอยุธยา', location:'บางปะอิน',    lat:14.1340, long:100.3270, installDate:'2025-03-05', imagePreview:'' },
    { id:4, status:'online',  deviceId:'4A5G0PV1Y23E04E12Q', peaNo:'ABB TR#02',   brand:'ABB',         rated:315, ratedCT:400, commType:'4G Cellular', ipSim:'10.36.22.93', maxLoad:80, maxFeedIn:15, province:'กรุงเทพมหานคร', location:'ราษฎร์บูรณะ',  lat:13.7563, long:100.5018, installDate:'2025-01-20', imagePreview:'' },
    { id:5, status:'online',  deviceId:'4A5G0PV1Y23E05F13R', peaNo:'SMGLL TR#03', brand:'SMGLL',       rated:250, ratedCT:300, commType:'4G Cellular', ipSim:'10.36.22.94', maxLoad:80, maxFeedIn:15, province:'เชียงใหม่',    location:'เมือง',          lat:18.7880, long:98.9870,  installDate:'2025-04-01', imagePreview:'' },
    { id:6, status:'offline', deviceId:'4A5G0PV1Y23E06G14S', peaNo:'OTI TR#04',   brand:'OTI',         rated:160, ratedCT:250, commType:'4G Cellular', ipSim:'10.36.22.95', maxLoad:80, maxFeedIn:15, province:'ขอนแก่น',      location:'เมือง',          lat:16.4322, long:102.8236, installDate:'2025-05-12', imagePreview:'' },
    { id:7, status:'online',  deviceId:'4A5G0PV1Y23E07H15T', peaNo:'JM TR#08',    brand:'JM',          rated:400, ratedCT:500, commType:'4G Cellular', ipSim:'10.36.22.96', maxLoad:80, maxFeedIn:15, province:'ภูเก็ต',       location:'เมือง',          lat:7.8840,  long:98.3920,  installDate:'2025-06-01', imagePreview:'' },
  ])

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
        r.deviceId.toLowerCase().includes(searchQuery.value.toLowerCase())
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
  const editingId = ref<number | null>(null)
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

  // Validate
  function validate(): string {
    if (!form.value.peaNo)    return 'กรุณากรอก PEA No. Transformer'
    if (!form.value.deviceId) return 'กรุณากรอก Device ID'
    if (!form.value.brand)    return 'กรุณากรอก Transformer Brand'
    if (!form.value.commType) return 'กรุณาเลือก Communication Type'
    if (!form.value.province) return 'กรุณาเลือก Province'
    return ''
  }

  // Save
  function saveForm() {
    const err = validate()
    if (err) { formError.value = err; return }
    if (modalMode.value === 'add') {
      transformers.value.push({ ...form.value, id: Date.now() })
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
    const headers = ['Status','Device ID','PEA No.','Brand','Rated (kVA)','Rated CT','Comm. Type','IP Simcard','Lat','Long','Province','Install Date']
    const rows    = filteredData.value.map(r =>
      [r.status,r.deviceId,r.peaNo,r.brand,r.rated,r.ratedCT,r.commType,r.ipSim,r.lat,r.long,r.province,r.installDate].join(',')
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
    transformers, filteredData, totalPages,
    // filter
    searchQuery, statusFilter, page,
    // modal
    showModal, modalMode, formError, form,
    // actions
    openAdd, openView, openEdit, confirmDelete,
    closeModal, saveForm, deleteRow, exportCSV,
  }
}