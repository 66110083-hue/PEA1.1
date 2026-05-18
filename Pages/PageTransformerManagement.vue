<script setup lang="ts">
import { ref, computed } from 'vue'
import CardWrapper from '~/components/PageOverview/CardWrapper.vue'

// ─── Mock Data ───────────────────────────────────────────
const transformers = ref([
  { id:1, status:'online',  deviceId:'4A5G0PV1Y23E01B09N', peaNo:'VISTA TR#01', brand:'VISTA TRAPE', rated:160, ratedCT:250, commType:'4G Cellular', ipSim:'10.36.22.90',  lat:13.9024, long:100.5583, province:'กรุงเทพมหานคร', location:'ลาดกระบัง', maxLoad:80, maxFeedIn:15, installDate:'2025-01-15', imagePreview:'' },
  { id:2, status:'online',  deviceId:'4A5G0PV1Y23E02C10M', peaNo:'VOLTA TR#05', brand:'แสงโสม',      rated:160, ratedCT:250, commType:'4G Cellular', ipSim:'10.36.22.91',  lat:13.8150, long:100.4620, province:'กรุงเทพมหานคร', location:'มีนบุรี',    maxLoad:80, maxFeedIn:15, installDate:'2025-02-10', imagePreview:'' },
  { id:3, status:'offline', deviceId:'4A5G0PV1Y23E03D11P', peaNo:'Thai 44499L', brand:'Thai-44499L', rated:160, ratedCT:250, commType:'4G Cellular', ipSim:'10.36.22.92',  lat:14.1340, long:100.3270, province:'พระนครศรีอยุธยา', location:'บางปะอิน', maxLoad:80, maxFeedIn:15, installDate:'2025-03-05', imagePreview:'' },
  { id:4, status:'online',  deviceId:'4A5G0PV1Y23E04E12Q', peaNo:'ABB TR#02',   brand:'ABB',          rated:315, ratedCT:400, commType:'4G Cellular', ipSim:'10.36.22.93',  lat:13.7563, long:100.5018, province:'กรุงเทพมหานคร', location:'ราษฎร์บูรณะ', maxLoad:80, maxFeedIn:15, installDate:'2025-01-20', imagePreview:'' },
  { id:5, status:'online',  deviceId:'4A5G0PV1Y23E05F13R', peaNo:'SMGLL TR#03', brand:'SMGLL',        rated:250, ratedCT:300, commType:'4G Cellular', ipSim:'10.36.22.94',  lat:18.7880, long:98.9870,  province:'เชียงใหม่',    location:'เมือง',      maxLoad:80, maxFeedIn:15, installDate:'2025-04-01', imagePreview:'' },
  { id:6, status:'offline', deviceId:'4A5G0PV1Y23E06G14S', peaNo:'OTI TR#04',   brand:'OTI',          rated:160, ratedCT:250, commType:'4G Cellular', ipSim:'10.36.22.95',  lat:16.4322, long:102.8236, province:'ขอนแก่น',      location:'เมือง',      maxLoad:80, maxFeedIn:15, installDate:'2025-05-12', imagePreview:'' },
  { id:7, status:'online',  deviceId:'4A5G0PV1Y23E07H15T', peaNo:'JM TR#08',    brand:'JM',           rated:400, ratedCT:500, commType:'4G Cellular', ipSim:'10.36.22.96',  lat:7.8840,  long:98.3920,  province:'ภูเก็ต',       location:'เมือง',      maxLoad:80, maxFeedIn:15, installDate:'2025-06-01', imagePreview:'' },
])

const provinces = ['กรุงเทพมหานคร','เชียงใหม่','ขอนแก่น','นครราชสีมา','พระนครศรีอยุธยา','ภูเก็ต','สงขลา','ชลบุรี','ระยอง','นนทบุรี']

// ─── Filter ──────────────────────────────────────────────
const searchQuery  = ref('')
const statusFilter = ref('')
const page         = ref(1)
const perPage      = 10

const filteredData = computed(() => {
  let d = transformers.value
  if (searchQuery.value)  d = d.filter(r => r.peaNo.toLowerCase().includes(searchQuery.value.toLowerCase()) || r.deviceId.toLowerCase().includes(searchQuery.value.toLowerCase()))
  if (statusFilter.value) d = d.filter(r => r.status === statusFilter.value)
  return d
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / perPage)))

// ─── Modal ───────────────────────────────────────────────
const showModal  = ref(false)
const modalMode  = ref<'add'|'edit'|'view'|'delete'>('add')
const formError  = ref('')
const fileInput  = ref<HTMLInputElement>()
const editingId  = ref<number|null>(null)

const emptyForm = () => ({
  peaNo:'', deviceId:'', brand:'', commType:'', rated:160, ratedCT:250,
  ipSim:'', status:'online', maxLoad:80, maxFeedIn:15,
  province:'', location:'', lat:0, long:0, installDate:'', imagePreview:'',
})

const form = ref(emptyForm())

function openAdd()  { form.value = emptyForm(); modalMode.value = 'add';  formError.value = ''; showModal.value = true }
function openView(row: any) { form.value = { ...row }; modalMode.value = 'view'; showModal.value = true }
function openEdit(row: any) { form.value = { ...row }; editingId.value = row.id; modalMode.value = 'edit'; formError.value = ''; showModal.value = true }
function confirmDelete(row: any) { form.value = { ...row }; editingId.value = row.id; modalMode.value = 'delete'; showModal.value = true }
function closeModal() { showModal.value = false; editingId.value = null }

function validate() {
  if (!form.value.peaNo)    return 'กรุณากรอก PEA No. Transformer'
  if (!form.value.deviceId) return 'กรุณากรอก Device ID'
  if (!form.value.brand)    return 'กรุณากรอก Transformer Brand'
  if (!form.value.commType) return 'กรุณาเลือก Communication Type'
  if (!form.value.province) return 'กรุณาเลือก Province'
  return ''
}

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

function deleteRow() {
  transformers.value = transformers.value.filter(r => r.id !== editingId.value)
  closeModal()
}

// ─── Image upload ────────────────────────────────────────
function triggerUpload() { fileInput.value?.click() }
function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { formError.value = 'ไฟล์ใหญ่เกิน 2MB'; return }
  const reader = new FileReader()
  reader.onload = ev => { form.value.imagePreview = ev.target?.result as string }
  reader.readAsDataURL(file)
}
function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file) { const fakeEvent = { target: { files: [file] } } as any; handleFile(fakeEvent) }
}

// ─── Export CSV ──────────────────────────────────────────
function exportCSV() {
  const headers = ['Status','Device ID','PEA No.','Brand','Rated (kVA)','Rated CT','Comm. Type','IP Simcard','Lat','Long','Province','Install Date']
  const rows = filteredData.value.map(r =>
    [r.status,r.deviceId,r.peaNo,r.brand,r.rated,r.ratedCT,r.commType,r.ipSim,r.lat,r.long,r.province,r.installDate].join(',')
  )
  const csv  = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type:'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href:url, download:'transformers.csv' })
  a.click(); URL.revokeObjectURL(url)
}
</script>

<template>
  <div style="display:flex;flex-direction:column;gap:16px">

    <!-- ─── Header + Search + Actions ─────────────────── -->
    <CardWrapper title="Transformer Management" icon="ti-transformer">
      <template #actions>
        <div style="display:flex;gap:8px;align-items:center">
          <!-- Search -->
          <div style="position:relative">
            <i class="ti ti-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--color-text-3);font-size:14px"/>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by PEA No. Transformer"
              style="padding:7px 12px 7px 32px;border:1px solid var(--color-border-md);border-radius:var(--radius-md);font-size:12px;width:240px;font-family:var(--font-sans);background:var(--color-bg);color:var(--color-text-1);outline:none"
            />
          </div>
          <!-- Status filter -->
          <select v-model="statusFilter"
            style="padding:7px 10px;border:1px solid var(--color-border-md);border-radius:var(--radius-md);font-size:12px;font-family:var(--font-sans);background:var(--color-bg);color:var(--color-text-1);outline:none;cursor:pointer">
            <option value="">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <!-- Export CSV -->
          <button class="tm-btn tm-btn-outline" @click="exportCSV">
            <i class="ti ti-download"/> Export
          </button>
          <!-- Add -->
          <button class="tm-btn tm-btn-green" @click="openAdd">
            <i class="ti ti-plus"/> Add Transformer
          </button>
        </div>
      </template>

      <!-- ─── Table ──────────────────────────────────── -->
      <div style="overflow-x:auto;margin-top:4px">
        <table class="tm-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Device ID</th>
              <th>PEA No.</th>
              <th>Brand</th>
              <th>Rated (kVA)</th>
              <th>Rated CT</th>
              <th>Comm. Type</th>
              <th>IP Simcard</th>
              <th>Lat</th>
              <th>Long</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredData.length === 0">
              <td colspan="11" style="text-align:center;padding:32px;color:var(--color-text-3)">
                ไม่พบข้อมูล
              </td>
            </tr>
            <tr v-for="row in filteredData" :key="row.id">
              <td>
                <span class="status-dot" :class="row.status" />
              </td>
              <td class="tm-mono">{{ row.deviceId }}</td>
              <td class="tm-mono tm-bold">{{ row.peaNo }}</td>
              <td>{{ row.brand }}</td>
              <td class="tm-mono">{{ row.rated }}</td>
              <td class="tm-mono">{{ row.ratedCT }}</td>
              <td>{{ row.commType }}</td>
              <td class="tm-mono">{{ row.ipSim }}</td>
              <td class="tm-mono">{{ row.lat }}</td>
              <td class="tm-mono">{{ row.long }}</td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="action-btn view"  @click="openView(row)"  title="View"><i class="ti ti-eye"/></button>
                  <button class="action-btn edit"  @click="openEdit(row)"  title="Edit"><i class="ti ti-pencil"/></button>
                  <button class="action-btn delete" @click="confirmDelete(row)" title="Delete"><i class="ti ti-trash"/></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:12px;color:var(--color-text-3)">
        <span>แสดง {{ filteredData.length }} / {{ transformers.length }} รายการ</span>
        <div style="display:flex;gap:4px">
          <button class="page-btn" :disabled="page <= 1" @click="page--">‹</button>
          <span style="padding:4px 10px;background:var(--color-green);color:white;border-radius:4px;font-size:11px">{{ page }}</span>
          <button class="page-btn" :disabled="page >= totalPages" @click="page++">›</button>
        </div>
      </div>
    </CardWrapper>

    <!-- ─── Modal ──────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">

          <!-- Modal Header -->
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:var(--color-text-1)">
              <i :class="`ti ${modalMode === 'view' ? 'ti-eye' : modalMode === 'edit' ? 'ti-pencil' : 'ti-plus'}`"
                :style="{ color: modalMode === 'delete' ? 'var(--color-red)' : 'var(--color-green)' }"/>
              {{ modalMode === 'add' ? 'Add Transformer' : modalMode === 'edit' ? 'Edit Transformer' : modalMode === 'view' ? 'View Transformer' : 'Delete Transformer' }}
            </div>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>

          <!-- Delete confirm -->
          <div v-if="modalMode === 'delete'" style="padding:20px;text-align:center">
            <i class="ti ti-alert-triangle" style="font-size:40px;color:var(--color-red);margin-bottom:12px;display:block"/>
            <div style="font-size:14px;margin-bottom:6px">ยืนยันการลบ?</div>
            <div style="font-size:13px;color:var(--color-text-2);margin-bottom:20px">
              <strong>{{ form.peaNo }}</strong> — {{ form.brand }}
            </div>
            <div style="display:flex;gap:8px;justify-content:center">
              <button class="tm-btn tm-btn-outline" @click="closeModal">ยกเลิก</button>
              <button class="tm-btn" style="background:var(--color-red);color:white;border:none" @click="deleteRow">ลบ</button>
            </div>
          </div>

          <!-- Form -->
          <div v-else class="modal-body">
            <div class="form-section-label">ข้อมูลหม้อแปลง</div>
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label">PEA No. Transformer *</label>
                <input v-model="form.peaNo" :disabled="modalMode==='view'" class="form-input" placeholder="PEA No. Transformer"/>
              </div>
              <div class="form-field">
                <label class="form-label">Device ID *</label>
                <input v-model="form.deviceId" :disabled="modalMode==='view'" class="form-input" placeholder="Device ID (จาก MQTT)"/>
              </div>
              <div class="form-field">
                <label class="form-label">Transformer Brand *</label>
                <input v-model="form.brand" :disabled="modalMode==='view'" class="form-input" placeholder="Transformer Brand"/>
              </div>
              <div class="form-field">
                <label class="form-label">Communication Type *</label>
                <select v-model="form.commType" :disabled="modalMode==='view'" class="form-input">
                  <option value="">Select Communication Type</option>
                  <option>4G Cellular</option>
                  <option>WiFi</option>
                  <option>LoRa</option>
                  <option>Fiber</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Transformer Rated (kVA) *</label>
                <input v-model="form.rated" :disabled="modalMode==='view'" class="form-input" type="number" placeholder="kVA"/>
              </div>
              <div class="form-field">
                <label class="form-label">Rated CT *</label>
                <input v-model="form.ratedCT" :disabled="modalMode==='view'" class="form-input" type="number" placeholder="Rated CT"/>
              </div>
              <div class="form-field">
                <label class="form-label">IP Sim Card *</label>
                <input v-model="form.ipSim" :disabled="modalMode==='view'" class="form-input" placeholder="IP Simcard"/>
              </div>
              <div class="form-field">
                <label class="form-label">Status</label>
                <select v-model="form.status" :disabled="modalMode==='view'" class="form-input">
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            <div class="form-section-label" style="margin-top:16px">การตั้งค่าการใช้งาน</div>
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label">Max Load (%) Normal Load + EV *</label>
                <input v-model="form.maxLoad" :disabled="modalMode==='view'" class="form-input" type="number" placeholder="80"/>
              </div>
              <div class="form-field">
                <label class="form-label">Max Feed-In Power (%) for PV *</label>
                <input v-model="form.maxFeedIn" :disabled="modalMode==='view'" class="form-input" type="number" placeholder="15"/>
              </div>
            </div>

            <div class="form-section-label" style="margin-top:16px">ที่ตั้ง</div>
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label">Province *</label>
                <select v-model="form.province" :disabled="modalMode==='view'" class="form-input">
                  <option value="">Select Province</option>
                  <option v-for="p in provinces" :key="p">{{ p }}</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Install Location</label>
                <input v-model="form.location" :disabled="modalMode==='view'" class="form-input" placeholder="Install Location"/>
              </div>
              <div class="form-field">
                <label class="form-label">Latitude</label>
                <input v-model="form.lat" :disabled="modalMode==='view'" class="form-input" type="number" step="0.000001" placeholder="Latitude"/>
              </div>
              <div class="form-field">
                <label class="form-label">Longitude</label>
                <input v-model="form.long" :disabled="modalMode==='view'" class="form-input" type="number" step="0.000001" placeholder="Longitude"/>
              </div>
              <div class="form-field">
                <label class="form-label">Install Date</label>
                <input v-model="form.installDate" :disabled="modalMode==='view'" class="form-input" type="date"/>
              </div>
            </div>

            <!-- Image upload -->
            <div class="form-section-label" style="margin-top:16px">รูปภาพหม้อแปลง</div>
            <div v-if="modalMode !== 'view'" class="upload-area"
              @dragover.prevent @drop.prevent="handleDrop"
              @click="triggerUpload">
              <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.webp" style="display:none" @change="handleFile"/>
              <div v-if="!form.imagePreview">
                <i class="ti ti-cloud-upload" style="font-size:28px;color:var(--color-text-3);margin-bottom:8px;display:block"/>
                <div style="font-size:12px;color:var(--color-text-2)">Choose an image or drag & drop it here</div>
                <div style="font-size:11px;color:var(--color-text-3);margin-top:4px">JPEG, JPG, and PNG format. Up to 2MB</div>
              </div>
              <div v-else style="position:relative">
                <img :src="form.imagePreview" style="max-height:120px;border-radius:6px;object-fit:contain"/>
                <button @click.stop="form.imagePreview=''" style="position:absolute;top:-8px;right:-8px;background:var(--color-red);color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
              </div>
            </div>
            <div v-else-if="form.imagePreview">
              <img :src="form.imagePreview" style="max-height:100px;border-radius:6px;object-fit:contain"/>
            </div>
            <div v-else style="font-size:12px;color:var(--color-text-3)">ไม่มีรูปภาพ</div>

            <!-- Error -->
            <div v-if="formError" style="margin-top:12px;padding:8px 12px;background:var(--color-red-bg);border-radius:var(--radius-md);font-size:12px;color:var(--color-red-text)">
              <i class="ti ti-alert-circle"/> {{ formError }}
            </div>

            <!-- Modal Footer -->
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--color-border)">
              <button class="tm-btn tm-btn-outline" @click="closeModal">
                {{ modalMode === 'view' ? 'ปิด' : 'ยกเลิก' }}
              </button>
              <button v-if="modalMode !== 'view'" class="tm-btn tm-btn-green" @click="saveForm">
                <i class="ti ti-device-floppy"/> บันทึก
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>



<style scoped>
/* Table */
.tm-table { width:100%; border-collapse:collapse; font-size:12px; }
.tm-table th {
  text-align:left; padding:8px 12px;
  background:var(--color-surface-2); color:var(--color-text-3);
  font-size:10px; text-transform:uppercase; letter-spacing:0.06em;
  border-bottom:1px solid var(--color-border); white-space:nowrap;
}
.tm-table td { padding:10px 12px; border-bottom:1px solid var(--color-border); color:var(--color-text-1); white-space:nowrap; }
.tm-table tr:last-child td { border-bottom:none; }
.tm-table tr:hover td { background:var(--color-bg); }
.tm-mono  { font-family:var(--font-mono); }
.tm-bold  { font-weight:600; }

/* Status dot */
.status-dot {
  width:10px; height:10px; border-radius:50%; display:inline-block;
}
.status-dot.online  { background:#1D9E75; box-shadow:0 0 0 3px rgba(29,158,117,0.2); }
.status-dot.offline { background:#9aa0b0; }

/* Action buttons */
.action-btn {
  width:28px; height:28px; border-radius:6px; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center; font-size:13px; transition:opacity 0.12s;
}
.action-btn:hover { opacity:0.8; }
.action-btn.view   { background:#E6F1FB; color:#185FA5; }
.action-btn.edit   { background:#FAEEDA; color:#854F0B; }
.action-btn.delete { background:#FCEBEB; color:#A32D2D; }

/* Buttons */
.tm-btn {
  display:flex; align-items:center; gap:5px; padding:7px 14px;
  border-radius:var(--radius-md); font-size:12px; font-weight:500;
  font-family:var(--font-sans); cursor:pointer; transition:opacity 0.12s; white-space:nowrap;
}
.tm-btn:hover { opacity:0.85; }
.tm-btn-green   { background:var(--color-green); color:white; border:none; }
.tm-btn-outline { background:transparent; color:var(--color-text-2); border:1px solid var(--color-border-md); }

/* Pagination */
.page-btn {
  width:28px; height:28px; border-radius:4px; border:1px solid var(--color-border);
  background:var(--color-bg); cursor:pointer; font-size:14px; color:var(--color-text-2);
}
.page-btn:disabled { opacity:0.35; cursor:not-allowed; }

/* Modal */
.modal-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,0.45);
  display:flex; align-items:center; justify-content:center; z-index:1000;
}
.modal-box {
  background:var(--color-surface); border-radius:var(--radius-xl);
  width:min(680px,95vw); max-height:90vh; overflow-y:auto;
  box-shadow:0 20px 60px rgba(0,0,0,0.25);
}
.modal-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:16px 20px; border-bottom:1px solid var(--color-border);
  position:sticky; top:0; background:var(--color-surface); z-index:1;
}
.modal-close {
  width:28px; height:28px; border-radius:50%; border:none;
  background:var(--color-bg); cursor:pointer; font-size:12px;
  color:var(--color-text-2); display:flex; align-items:center; justify-content:center;
}
.modal-body { padding:20px; }

/* Form */
.form-section-label {
  font-size:11px; font-weight:600; text-transform:uppercase;
  letter-spacing:0.08em; color:var(--color-green); margin-bottom:10px;
  padding-bottom:6px; border-bottom:1px solid var(--color-green-bg);
}
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.form-field { display:flex; flex-direction:column; gap:4px; }
.form-label { font-size:11px; color:var(--color-text-2); font-weight:500; }
.form-input {
  padding:8px 10px; border:1px solid var(--color-border-md);
  border-radius:var(--radius-md); font-size:13px; font-family:var(--font-sans);
  color:var(--color-text-1); background:var(--color-bg); outline:none; width:100%;
}
.form-input:focus { border-color:var(--color-green); }
.form-input:disabled { opacity:0.6; cursor:not-allowed; background:var(--color-surface-2); }

/* Upload */
.upload-area {
  border:2px dashed var(--color-border-md); border-radius:var(--radius-md);
  padding:24px; text-align:center; cursor:pointer; transition:border-color 0.15s;
  background:var(--color-bg);
}
.upload-area:hover { border-color:var(--color-green); }
</style>
