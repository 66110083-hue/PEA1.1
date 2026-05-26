<script setup lang="ts">
import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

const toasts = ref<Toast[]>([])
let nextId = 0

function show(message: string, type: Toast['type'] = 'success') {
  const id = nextId++
  toasts.value.push({ id, type, message })
  setTimeout(() => remove(id), 3000)
}

function remove(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type}`"
          @click="remove(toast.id)"
        >
          <i
            class="ti toast-icon"
            :class="{
              'ti-circle-check': toast.type === 'success',
              'ti-circle-x':     toast.type === 'error',
              'ti-info-circle':  toast.type === 'info',
            }"
          />
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-sans, inherit);
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
  cursor: pointer;
  pointer-events: all;
  min-width: 240px;
  max-width: 360px;
}

.toast-icon { font-size: 17px; flex-shrink: 0; }

.toast-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.toast-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.toast-info    { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }

/* Transition */
.toast-enter-active { transition: all .25s ease; }
.toast-leave-active { transition: all .2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(40px); }
.toast-leave-to     { opacity: 0; transform: translateX(40px); }
</style>