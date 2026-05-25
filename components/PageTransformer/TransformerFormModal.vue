<script setup lang="ts">
import { computed } from 'vue'
import { PROVINCES, COMM_TYPES } from '~/composables/useTransformer'

const props = defineProps<{
  show:  boolean
  mode:  'add' | 'edit' | 'view' | 'delete'
  form:  any
  error: string
}>()

defineEmits(['close', 'save', 'delete'])

const provinces = PROVINCES
const commTypes = COMM_TYPES
const readonly  = computed(() => props.mode === 'view')

const modeIcon = computed(() => ({
  add: 'ti-plus', edit: 'ti-pencil', view: 'ti-eye', delete: 'ti-trash'
}[props.mode]))

const modeTitle = computed(() => ({
  add: 'Add Transformer', edit: 'Edit Transformer',
  view: 'View Transformer', delete: 'Delete Transformer',
}[props.mode]))

// ฟังก์ชันย่อขนาดรูปภาพ (เหมือนเดิม)
function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = ev => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX_WIDTH = 800
      let scaleSize = 1
      
      if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width
      
      canvas.width = img.width * scaleSize
      canvas.height = img.height * scaleSize

      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
      
      props.form.imagePreview = compressedBase64
    }
    img.src = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file) handleFile({ target: { files: [file] } } as any)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="sg-form-card">
        
        <div class="sg-header">
          <div class="sg-breadcrumb">
            <span class="text-muted">Asset Management / </span>
            <span class="sg-title">{{ modeTitle }}</span>
          </div>
          
          <div class="sg-actions">
            <button class="sg-btn sg-btn-outline" @click="$emit('close')">Cancel</button>
            <button v-if="!readonly" class="sg-btn sg-btn-primary" @click="$emit('save')">
              <i class="ti ti-device-floppy"></i> Save
            </button>
          </div>
        </div>

        <div class="sg-divider-gold"></div>

       <div class="sg-body-grid">
          
          <div class="sg-col">
            <h3 class="sg-section-title">Information</h3>
            
            <div class="sg-input-grid">
              <div class="sg-field">
                <label>Device Name (PEA No.)</label>
                <input v-model="form.peaNo" :disabled="readonly" placeholder="Name"/>
              </div>
              <div class="sg-field">
                <label>State</label>
                <select v-model="form.status" :disabled="readonly">
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div class="sg-field">
                <label>Brand</label>
                <input v-model="form.brand" :disabled="readonly" placeholder="Brand"/>
              </div>
              <div class="sg-field">
                <label>Model</label>
                <input v-model="form.model" :disabled="readonly" placeholder="Model"/>
              </div>

              <div class="sg-field">
                <label>Type (Comm.)</label>
                <select v-model="form.commType" :disabled="readonly">
                  <option value="">Select a type</option>
                  <option v-for="c in commTypes" :key="c">{{ c }}</option>
                </select>
              </div>
              <div class="sg-field">
                <label>Serial Number (Device ID)</label>
                <input v-model="form.deviceId" :disabled="readonly" placeholder="Serial number"/>
              </div>

              <div class="sg-field">
                <label>Current Rating (A)</label>
                <input v-model.number="form.ratedCT" type="number" :disabled="readonly" placeholder="Current rating A"/>
              </div>
              <div class="sg-field">
                <label>Voltage Rating (V)</label>
                <input v-model.number="form.rated" type="number" :disabled="readonly" placeholder="Voltage rating V"/>
              </div>

              <div class="sg-field">
                <label>Max Load (Power)</label>
                <input v-model.number="form.maxLoad" type="number" :disabled="readonly" placeholder="Power"/>
              </div>
              <div class="sg-field">
                <label>Max Feed-In (Energy)</label>
                <input v-model.number="form.maxFeedIn" type="number" :disabled="readonly" placeholder="Energy"/>
              </div>

              <div class="sg-field">
                <label>Phase Type</label>
                <input v-model="form.phaseType" :disabled="readonly" placeholder="Phase Type"/>
              </div>
              <div class="sg-field">
                <label>Installation Date</label>
                <input v-model="form.installDate" type="date" :disabled="readonly"/>
              </div>

              <div class="sg-field" style="grid-column: span 2; margin-top: 8px;">
                <label>Description</label>
                <textarea v-model="form.description" :disabled="readonly" rows="3" placeholder="Description"></textarea>
              </div>
            </div>
          </div>

          <div class="sg-col">
            
            <h3 class="sg-section-title">Device Photo</h3>
            <div v-if="!readonly" class="sg-upload-dropzone" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
              <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png" style="display:none" @change="handleFile"/>
              <div v-if="!form.imagePreview">
                <i class="ti ti-cloud-upload upload-icon"></i>
                <p>Click to upload or drag and drop</p>
                <small>PNG or JPG (MAX. 2048)</small>
              </div>
              <div v-else style="position:relative;display:inline-block">
                <img :src="form.imagePreview" class="upload-preview-img"/>
                <button class="btn-remove-img" @click.stop="form.imagePreview = ''">✕</button>
              </div>
            </div>
            <img v-else-if="form.imagePreview" :src="form.imagePreview" class="upload-preview-img"/>

            <h3 class="sg-section-title" style="margin-top: 24px;">Meter Integration</h3>
            <div class="sg-input-grid">
              <div class="sg-field">
                <label>Feeder No. <span class="req">*</span></label>
                <select v-model="form.feederNo" :disabled="readonly">
                  <option value="">Feeder 01</option>
                  </select>
              </div>
              <div class="sg-field">
                <label>House No. <span class="req">*</span></label>
                <select v-model="form.houseNo" :disabled="readonly">
                  <option value="">Select a House No.</option>
                </select>
              </div>
            </div>

            <h3 class="sg-section-title" style="margin-top: 24px;">Device Relation</h3>
            <div class="sg-input-grid">
              <div class="sg-field">
                <label>Feeder <span class="req">*</span></label>
                <select v-model="form.deviceRelation" :disabled="readonly">
                  <option value="">Select a feeder</option>
                </select>
              </div>
              <div class="sg-field">
                <label>Device Placement <span class="req">*</span></label>
                <select v-model="form.devicePlacement" :disabled="readonly">
                  <option value="">Root</option>
                </select>
              </div>
            </div>

            <h3 class="sg-section-title" style="margin-top: 24px;">Location</h3>
            <div class="sg-input-grid">
              <div class="sg-field">
                <label>Latitude <span class="req">*</span></label>
                <input v-model.number="form.lat" type="number" step="any" :disabled="readonly" placeholder="Latitude"/>
              </div>
              <div class="sg-field">
                <label>Longitude <span class="req">*</span></label>
                <input v-model.number="form.long" type="number" step="any" :disabled="readonly" placeholder="Longitude"/>
              </div>
            </div>

      </div>
        </div>
      </div> 
      </div>
       </Teleport>
</template>

<style scoped>
/* พื้นหลังดำใส */
.modal-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,0.5);
  display:flex; align-items:center; justify-content:center; z-index:1000;
  padding: 20px;
}

/* ตัวกล่องฟอร์มหลัก */
.sg-form-card {
  background: #ffffff;
  border-radius: 8px;
  width: 100%;
  max-width: 1000px; /* บังคับกว้าง 1000px เพื่อใส่ 2 คอลัมน์ */
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  padding: 24px 32px;
  font-family: var(--font-sans);
}

/* ส่วนหัว */
.sg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.sg-breadcrumb { font-size: 18px; }
.sg-title { font-weight: 700; color: #6a2c70; } /* สีม่วง SGtech */
.text-muted { color: #9aa0b0; }

/* ปุ่มกด */
.sg-actions { display: flex; gap: 10px; }
.sg-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600;
  cursor: pointer; border: none; font-family: var(--font-sans);
  transition: opacity 0.2s;
}
.sg-btn:hover { opacity: 0.85; }
.sg-btn-outline { background: #9aa0b0; color: white; }
.sg-btn-primary { background: #6a2c70; color: white; }

/* เส้นกั้นสีทอง/น้ำตาล */
.sg-divider-gold {
  height: 4px;
  background: #b58d4a; /* สีทอง */
  border-radius: 2px;
  margin-bottom: 24px;
}

/* กล่องแจ้งเตือน Error */
.sg-error-box {
  background: #fcebeb; color: #e74c3c;
  padding: 10px 14px; border-radius: 6px; font-size: 13px;
  margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
}

/* แบ่ง 2 คอลัมน์ */
.sg-body-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr; /* ซ้ายใหญ่กว่าขวา */
  gap: 40px;
}

/* หัวข้อหมวดหมู่ */
.sg-section-title {
  color: #b58d4a; /* สีทอง */
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

/* Input Grid (2 คอลัมน์ย่อย) */
.sg-input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.sg-field { display: flex; flex-direction: column; gap: 6px; }
.sg-field label {
  font-size: 12px; font-weight: 600; color: #6a2c70; /* สีม่วง */
}
.req { color: #e74c3c; }

/* หน้าตาช่อง Input/Select */
.sg-field input, .sg-field select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: var(--font-sans);
  outline: none; background: #fff;
}
.sg-field input:focus, .sg-field select:focus { border-color: #6a2c70; }
.sg-field input:disabled, .sg-field select:disabled { background: #f4f5f7; color: #9aa0b0; }

/* พื้นที่อัปโหลดรูป */
.sg-upload-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  background: #f8f9fb;
  cursor: pointer;
  transition: all 0.2s;
}
.sg-upload-dropzone:hover { border-color: #b58d4a; }
.upload-icon { font-size: 28px; color: #9aa0b0; margin-bottom: 8px; display: block;}
.sg-upload-dropzone p { font-size: 13px; font-weight: 600; color: #6a2c70; margin-bottom: 4px;}
.sg-upload-dropzone small { font-size: 11px; color: #9aa0b0; }

/* รูปพรีวิว */
.upload-preview-img { max-height: 120px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.btn-remove-img {
  position: absolute; top: -10px; right: -10px;
  background: #e74c3c; color: white; border: none; border-radius: 50%;
  width: 24px; height: 24px; cursor: pointer; font-size: 11px;
}

/* หน้าจอลบ */
.delete-view { text-align: center; padding: 40px 0; }
.delete-icon { font-size: 50px; color: #e74c3c; display: block; margin-bottom: 16px; }
.delete-text { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
.delete-target { font-size: 14px; color: #5a6072; }

/* รองรับจอมือถือ (Responsive) */
@media (max-width: 768px) {
  .sg-body-grid { grid-template-columns: 1fr; gap: 24px; }
  .sg-input-grid { grid-template-columns: 1fr; }
}
textarea {
  padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; 
  font-size: 13px; font-family: var(--font-sans); outline: none; 
  background: #fff; resize: vertical;
}
textarea:focus { border-color: #6a2c70; }
</style>