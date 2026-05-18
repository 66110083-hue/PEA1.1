<template>
  <div class="phase-tabs-container">
    <span class="selector-label">แสดงเฟส:</span>
    <div class="phase-toggle-tabs">
      <button 
        v-for="ph in phases" 
        :key="ph.id"
        @click="toggle(ph.id)"
        :class="['ptab', getActiveClass(ph.id)]"
      >
        เฟส {{ ph.id }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// รับค่าเฟสที่เลือกอยู่จากเครื่องแม่ (Parent)
const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits(['update:modelValue'])

const phases = [
  { id: 'A', colorClass: 'active-blue' },
  { id: 'B', colorClass: 'active' },
  { id: 'C', colorClass: 'active-amber' }
]

function toggle(id: string) {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(id)
  
  if (index > -1) {
    if (newValue.length > 1) newValue.splice(index, 1)
  } else {
    newValue.push(id)
  }
  
  // ส่งค่ากลับไปอัปเดตที่ Parent
  emit('update:modelValue', newValue)
}

function getActiveClass(id: string) {
  if (!props.modelValue.includes(id)) return ''
  return phases.find(p => p.id === id)?.colorClass || ''
}
</script>

<style scoped>
.phase-tabs-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
  border-right: 1px solid var(--color-border);
}

.selector-label {
  font-size: 11px;
  color: var(--color-text-3);
}

.phase-toggle-tabs {
  display: flex;
  gap: 4px;
  background: var(--color-bg);
  padding: 3px;
  border-radius: var(--radius-md);
}

.ptab {
  font-size: 10px;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-3);
  transition: all 0.15s;
}

.ptab.active-blue { background: var(--color-blue); color: white; }
.ptab.active { background: var(--color-green); color: white; }
.ptab.active-amber { background: var(--color-amber); color: white; }

@media (max-width: 768px) {
  .selector-label { display: none; }
  .phase-tabs-container { border-right: none; }
}
</style>