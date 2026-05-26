<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  searchQuery:  string
  activeStatus: 'Active' | 'Clear'
  ackFilter:    'Unacknowledged' | 'Acknowledged'
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery',  val: string): void
  (e: 'update:activeStatus', val: 'Active' | 'Clear'): void
  (e: 'update:ackFilter',    val: 'Unacknowledged' | 'Acknowledged'): void
  (e: 'clearAll'): void
  (e: 'export'):   void
  (e: 'refresh'):  void
}>()

const isRefreshing = ref(false)
const lastUpdated  = ref(new Date())

function formatTime(d: Date) {
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

async function handleRefresh() {
  isRefreshing.value = true
  emit('refresh')
  await new Promise(r => setTimeout(r, 800))
  lastUpdated.value  = new Date()
  isRefreshing.value = false
}
</script>

<template>
  <div class="toolbar">

    <!-- Clear All -->
    <button class="btn-clear-all" @click="emit('clearAll')">
      Clear All
    </button>

    <!-- Last updated -->
    <span class="last-updated">
      อัปเดต {{ formatTime(lastUpdated) }}
    </span>

    <!-- Refresh -->
    <button
      class="btn-refresh"
      :disabled="isRefreshing"
      @click="handleRefresh"
      title="รีเฟรช"
    >
      <i class="ti ti-refresh" :class="{ spin: isRefreshing }" />
    </button>

    <div style="flex: 1" />

    <!-- Search -->
    <div class="search-wrap">
      <i class="ti ti-search search-icon" />
      <input
        :value="searchQuery"
        class="search-input"
        placeholder="Search by PEA Device No."
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="searchQuery"
        class="search-clear"
        @click="emit('update:searchQuery', '')"
      >
        <i class="ti ti-x" />
      </button>
    </div>

    <!-- Status -->
    <select
      :value="activeStatus"
      class="toolbar-select"
      @change="emit('update:activeStatus', ($event.target as HTMLSelectElement).value as any)"
    >
      <option>Active</option>
      <option>Clear</option>
    </select>

    <!-- Acknowledged -->
    <select
      :value="ackFilter"
      class="toolbar-select"
      @change="emit('update:ackFilter', ($event.target as HTMLSelectElement).value as any)"
    >
      <option>Unacknowledged</option>
      <option>Acknowledged</option>
    </select>

    <!-- Export -->
    <button class="btn-export" @click="emit('export')">
      <i class="ti ti-download" />
      Export
    </button>

  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.btn-clear-all {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: opacity .15s;
}
.btn-clear-all:hover { opacity: .8; }

.last-updated {
  font-size: 11px;
  color: var(--color-text-3, #9ca3af);
  white-space: nowrap;
}

.btn-refresh {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #dbe0e6;
  background: #fff;
  color: var(--color-text-2, #4b5563);
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
}
.btn-refresh:hover:not(:disabled) { background: #f3f4f6; }
.btn-refresh:disabled { opacity: .5; cursor: not-allowed; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin .7s linear infinite; display: inline-block; }

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 10px;
  font-size: 14px;
  color: #9ca3af;
  pointer-events: none;
}
.search-input {
  height: 36px;
  width: 240px;
  padding: 0 32px;
  border-radius: 8px;
  border: 1px solid #dbe0e6;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color .15s;
}
.search-input:focus { border-color: #2563eb; }
.search-clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 13px;
  padding: 2px;
}

.toolbar-select {
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #dbe0e6;
  background: #fff;
  font-size: 13px;
  font-family: inherit;
  color: var(--color-text-1, #111827);
  cursor: pointer;
  outline: none;
}

.btn-export {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity .15s;
}
.btn-export:hover { opacity: .9; }

@media (max-width: 768px) {
  .search-input { width: 160px; }
  .last-updated { display: none; }
}
</style>