// 📂 composables/useTransformer.ts

import { ref, computed, watch } from 'vue' // 🔥 1. อย่าลืมนำเข้า watch มาด้วย
import { useSiteData, type Site } from '~/composables/useSiteData'

export interface Transformer {
  id:           string 
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

const initialTransformers: Transformer[] = allSites.map((site, index) => {
  const comms  = ['4G Cellular', '4G Cellular', 'LoRa', '4G Cellular', 'WiFi', '4G Cellular', 'Fiber']
  return {
    id:           site.id, 
    status:       site.status === 'offline' ? 'offline' : 'online',
    deviceId:     `4A5G0PV1Y23E0${index + 1}B09N`,
    peaNo:        site.id,
    brand:        site.name, 
    rated:        index === 3 ? 315 : index === 4 ? 250 : index === 6 ? 400 : 160,
    ratedCT:      index === 3 ? 400 : index === 4 ? 300 : index === 6 ? 500 : 250,
    commType:     comms[index % comms.length],
    ipSim:        `10.36.22.${90 + index}`,
    maxLoad:      80, maxFeedIn: 15, province: site.province, location: site.name, lat: site.lat, long: site.lng,
    installDate:  `2025-01-${10 + index}`, 
    imagePreview: '' 
  }
})

// ตัวแปรส่วนกลาง
const globalTransformers = ref<Transformer[]>(initialTransformers)

// 🔥 2. ตัวแปรเช็กว่าโหลดข้อมูลจาก localStorage หรือยัง (กันโหลดซ้ำ)
let isInitialized = false

export function useTransformer() {
  const transformers = globalTransformers

  // 🔥 3. ระบบเซฟ/โหลดข้อมูลถาวรด้วย Local Storage
  // ใช้ typeof window !== 'undefined' เพื่อกัน Error ตอน Nuxt ทำ SSR ฝั่งเซิร์ฟเวอร์
  if (typeof window !== 'undefined' && !isInitialized) {
    
    // โหลดข้อมูลเก่าที่เคยเซฟไว้ในเบราว์เซอร์
    const savedData = localStorage.getItem('pea_transformers_data')
    if (savedData) {
      try {
        transformers.value = JSON.parse(savedData)
      } catch (e) {
        console.error('ไม่สามารถอ่านข้อมูลที่เซฟไว้ได้', e)
      }
    }
    isInitialized = true

    // จับตาดูการเปลี่ยนแปลง: ถ้ามีการ แก้ไข/เพิ่ม/ลบ/อัปโหลดรูป ให้เซฟลงเบราว์เซอร์ทันที
    watch(transformers, (newVal) => {
      localStorage.setItem('pea_transformers_data', JSON.stringify(newVal))
    }, { deep: true }) // deep: true คือให้เช็กเจาะลึกเข้าไปถึงฟิลด์ข้างใน object ด้วย
  }

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

      d = d.sort((a, b) => {
      // ใช้ localeCompare พร้อม { numeric: true } เพื่อให้มันเรียงเลข M-01, M-02, M-10 ได้ฉลาดขึ้น
      return a.peaNo.localeCompare(b.peaNo, 'en', { numeric: true })
    })
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
    if (!form.value.peaNo)    return 'กรุณากรอก PEA No. Transformer'
    if (!form.value.deviceId) return 'กรุณากรอก Device ID'
    if (!form.value.brand)    return 'กรุณากรอก Transformer Brand'
    if (!form.value.commType) return 'กรุณาเลือก Communication Type'
    if (!form.value.province) return 'กรุณาเลือก Province'
    return ''
  }

  function saveForm() {
    const err = validate(); if (err) { formError.value = err; return }
    if (modalMode.value === 'add' && !form.value.id) {
      form.value.id = form.value.peaNo
    }
    const linkedSite = allSites.find(s => s.id === form.value.id)
    if (linkedSite) {
      form.value.province = linkedSite.province; form.value.location = linkedSite.name;
      form.value.lat = linkedSite.lat; form.value.long = linkedSite.lng;
    }
    if (modalMode.value === 'add') {
      // เช็กความซ้ำซ้อนจาก PEA No แทน
      if (transformers.value.some(r => r.peaNo === form.value.peaNo)) { 
        formError.value = 'PEA No. นี้มีในระบบแล้ว'; 
        return 
      }
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