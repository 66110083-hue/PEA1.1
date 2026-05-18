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

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || file.size > 2 * 1024 * 1024) return
  const reader = new FileReader()
  reader.onload = ev => { props.form.imagePreview = ev.target?.result as string }
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
      <div class="modal-box">

        <!-- Header -->
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600">
            <i :class="`ti ${modeIcon}`" :style="{ color: mode === 'delete' ? 'var(--color-red)' : 'var(--color-green)' }"/>
            {{ modeTitle }}
          </div>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>

        <!-- Delete confirm -->
        <div v-if="mode === 'delete'" style="padding:24px;text-align:center">
          <i class="ti ti-alert-triangle" style="font-size:40px;color:var(--color-red);display:block;margin-bottom:12px"/>
          <div style="font-size:14px;margin-bottom:6px">ยืนยันการลบ?</div>
          <div style="font-size:13px;color:var(--color-text-2);margin-bottom:20px">
            <strong>{{ form.peaNo }}</strong> — {{ form.brand }}
          </div>
          <div style="display:flex;gap:8px;justify-content:center">
            <button class="tm-btn tm-btn-outline" @click="$emit('close')">ยกเลิก</button>
            <button class="tm-btn" style="background:var(--color-red);color:white;border:none" @click="$emit('delete')">ลบ</button>
          </div>
        </div>

        <!-- Form -->
        <div v-else class="modal-body">

          <div class="form-section-label">ข้อมูลหม้อแปลง</div>
          <div class="form-grid">
            <div class="form-field">
              <label class="form-label">PEA No. Transformer *</label>
              <input v-model="form.peaNo" :disabled="readonly" class="form-input" placeholder="PEA No. Transformer"/>
            </div>
            <div class="form-field">
              <label class="form-label">Device ID *</label>
              <input v-model="form.deviceId" :disabled="readonly" class="form-input" placeholder="Device ID (จาก MQTT)"/>
            </div>
            <div class="form-field">
              <label class="form-label">Transformer Brand *</label>
              <input v-model="form.brand" :disabled="readonly" class="form-input" placeholder="Brand"/>
            </div>
            <div class="form-field">
              <label class="form-label">Communication Type *</label>
              <select v-model="form.commType" :disabled="readonly" class="form-input">
                <option value="">Select Communication Type</option>
                <option v-for="c in commTypes" :key="c">{{ c }}</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Transformer Rated (kVA) *</label>
              <input v-model.number="form.rated" :disabled="readonly" class="form-input" type="number"/>
            </div>
            <div class="form-field">
              <label class="form-label">Rated CT *</label>
              <input v-model.number="form.ratedCT" :disabled="readonly" class="form-input" type="number"/>
            </div>
            <div class="form-field">
              <label class="form-label">IP Sim Card *</label>
              <input v-model="form.ipSim" :disabled="readonly" class="form-input" placeholder="IP Simcard"/>
            </div>
            <div class="form-field">
              <label class="form-label">Status</label>
              <select v-model="form.status" :disabled="readonly" class="form-input">
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div class="form-section-label" style="margin-top:16px">การตั้งค่า</div>
          <div class="form-grid">
            <div class="form-field">
              <label class="form-label">Max Load (%) Normal Load + EV *</label>
              <input v-model.number="form.maxLoad" :disabled="readonly" class="form-input" type="number"/>
            </div>
            <div class="form-field">
              <label class="form-label">Max Feed-In Power (%) for PV *</label>
              <input v-model.number="form.maxFeedIn" :disabled="readonly" class="form-input" type="number"/>
            </div>
          </div>

          <div class="form-section-label" style="margin-top:16px">ที่ตั้ง</div>
          <div class="form-grid">
            <div class="form-field">
              <label class="form-label">Province *</label>
              <select v-model="form.province" :disabled="readonly" class="form-input">
                <option value="">Select Province</option>
                <option v-for="p in provinces" :key="p">{{ p }}</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Install Location</label>
              <input v-model="form.location" :disabled="readonly" class="form-input" placeholder="Install Location"/>
            </div>
            <div class="form-field">
              <label class="form-label">Latitude</label>
              <input v-model.number="form.lat" :disabled="readonly" class="form-input" type="number" step="0.000001"/>
            </div>
            <div class="form-field">
              <label class="form-label">Longitude</label>
              <input v-model.number="form.long" :disabled="readonly" class="form-input" type="number" step="0.000001"/>
            </div>
            <div class="form-field">
              <label class="form-label">Install Date</label>
              <input v-model="form.installDate" :disabled="readonly" class="form-input" type="date"/>
            </div>
          </div>

          <div class="form-section-label" style="margin-top:16px">รูปภาพหม้อแปลง</div>
          <div v-if="!readonly" class="upload-area" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
            <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.webp" style="display:none" @change="handleFile"/>
            <div v-if="!form.imagePreview">
              <i class="ti ti-cloud-upload" style="font-size:28px;color:var(--color-text-3);display:block;margin-bottom:8px"/>
              <div style="font-size:12px;color:var(--color-text-2)">Choose an image or drag & drop</div>
              <div style="font-size:11px;color:var(--color-text-3);margin-top:4px">JPEG, JPG, PNG — Max 2MB</div>
            </div>
            <div v-else style="position:relative;display:inline-block">
              <img :src="form.imagePreview" style="max-height:100px;border-radius:6px"/>
              <button @click.stop="form.imagePreview = ''"
                style="position:absolute;top:-8px;right:-8px;background:var(--color-red);color:white;border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:11px">✕</button>
            </div>
          </div>
          <img v-else-if="form.imagePreview" :src="form.imagePreview" style="max-height:80px;border-radius:6px"/>
          <div v-else style="font-size:12px;color:var(--color-text-3)">ไม่มีรูปภาพ</div>

          <!-- Error -->
          <div v-if="error" style="margin-top:12px;padding:8px 12px;background:var(--color-red-bg);border-radius:var(--radius-md);font-size:12px;color:var(--color-red-text)">
            <i class="ti ti-alert-circle"/> {{ error }}
          </div>

          <!-- Footer -->
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--color-border)">
            <button class="tm-btn tm-btn-outline" @click="$emit('close')">
              {{ readonly ? 'ปิด' : 'ยกเลิก' }}
            </button>
            <button v-if="!readonly" class="tm-btn tm-btn-green" @click="$emit('save')">
              <i class="ti ti-device-floppy"/> บันทึก
            </button>
          </div>

        </div>
      </div>
    </div>
  </Teleport>
</template>


<style scoped>
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
  background:var(--color-bg); cursor:pointer; font-size:12px; color:var(--color-text-2);
  display:flex; align-items:center; justify-content:center;
}
.modal-body { padding:20px; }
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
.form-input:disabled { opacity:0.6; cursor:not-allowed; }
.upload-area {
  border:2px dashed var(--color-border-md); border-radius:var(--radius-md);
  padding:24px; text-align:center; cursor:pointer; background:var(--color-bg);
  transition:border-color 0.15s;
}
.upload-area:hover { border-color:var(--color-green); }
.tm-btn {
  display:flex; align-items:center; gap:5px; padding:7px 14px;
  border-radius:var(--radius-md); font-size:12px; font-weight:500;
  font-family:var(--font-sans); cursor:pointer; transition:opacity 0.12s;
}
.tm-btn:hover { opacity:0.85; }
.tm-btn-green   { background:var(--color-green); color:white; border:none; }
.tm-btn-outline { background:transparent; color:var(--color-text-2); border:1px solid var(--color-border-md); }
</style>