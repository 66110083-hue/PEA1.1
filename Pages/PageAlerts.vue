<script setup lang="ts">
import { ref, computed } from 'vue'
import { allAlerts } from '@/composables/useSiteData'
import type { Alert } from '@/composables/useSiteData'

import AlertsHeader      from '@/components/PageAlerts/AlertsHeader.vue'
import AlertsFilterChips from '@/components/PageAlerts/AlertsFilterChips.vue'
import AlertsToolbar     from '@/components/PageAlerts/AlertsToolbar.vue'
import AlertsTable       from '@/components/PageAlerts/AlertsTable.vue'
import AlertDetailModal  from '@/components/PageAlerts/AlertDetailModal.vue'
// ── Filter state ───────────────────────────────────────────
const levelFilter  = ref<'all' | 'alert' | 'warning' | 'info'>('all')
const searchQuery  = ref('')
const activeStatus = ref<'Active' | 'Clear'>('Active')
const ackFilter    = ref<'Unacknowledged' | 'Acknowledged'>('Unacknowledged')

// ── Local mutable state ────────────────────────────────────
const acknowledgedIds = ref<Set<string>>(new Set())
const clearedIds      = ref<Set<string>>(new Set())

// ── Filter chips data ──────────────────────────────────────
const filterTabs = computed(() => [
  { key: 'all'     as const, label: 'ทั้งหมด', count: allAlerts.length },
  { key: 'alert'   as const, label: 'วิกฤต',   count: allAlerts.filter(a => a.level === 'alert').length },
  { key: 'warning' as const, label: 'ออฟไลน์', count: allAlerts.filter(a => a.level === 'warning').length },
  { key: 'info'    as const, label: 'ปกติ',    count: allAlerts.filter(a => a.level === 'info').length },
])

const criticalCount = computed(() =>
  allAlerts.filter(a => a.level === 'alert').length
)

// ── Filtered list ──────────────────────────────────────────
const filteredAlerts = computed(() => {
  let list = [...allAlerts]

  if (levelFilter.value !== 'all')
    list = list.filter(a => a.level === levelFilter.value)

  if (activeStatus.value === 'Clear')
    list = list.filter(a =>  clearedIds.value.has(a.id))
  else
    list = list.filter(a => !clearedIds.value.has(a.id))

  if (ackFilter.value === 'Acknowledged')
    list = list.filter(a =>  acknowledgedIds.value.has(a.id))
  else
    list = list.filter(a => !acknowledgedIds.value.has(a.id))

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(a =>
      a.siteId.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      a.province.toLowerCase().includes(q)
    )
  }

  return list
})

// ── Device Type mock map ───────────────────────────────────
const deviceTypeMap: Record<string, string> = {}
allAlerts.forEach(a => {
  const n = parseInt(a.siteId.replace('M-', ''))
  const types = ['PV 1P PST', 'EV 1P PST', 'TRANSFORMER 160 PST', 'PV 3P PST', 'EV 3P PST']
  deviceTypeMap[a.id] = types[n % types.length]
})

// ── Actions ────────────────────────────────────────────────
function clearAll() {
  allAlerts.forEach(a => clearedIds.value.add(a.id))
}

function handleDelete(id: string) {
  clearedIds.value.add(id)
}

// ── Modal state ────────────────────────────────────────────
const selectedAlert = ref<Alert | null>(null)

function openDetail(alert: Alert)  { selectedAlert.value = alert }
function closeModal()              { selectedAlert.value = null  }

function handleAcknowledge(id: string) {
  acknowledgedIds.value.add(id)
  closeModal()
}

function handleClear(id: string) {
  clearedIds.value.add(id)
  closeModal()
}

// ── Export CSV ─────────────────────────────────────────────
function handleExport() {
  const header = 'Timestamp,Severity,PEA Device No.,Device Type,Province,Event,Assignee,Status'
  const rows = filteredAlerts.value.map(a => [
    a.time,
    a.level === 'alert' ? 'CRITICAL' : a.level === 'warning' ? 'MAJOR' : 'NORMAL',
    a.siteId,
    deviceTypeMap[a.id] ?? '',
    a.province,
    `"${a.title}"`,
    'Unassigned',
    acknowledgedIds.value.has(a.id) ? 'Acknowledged' : 'Unacknowledged',
  ].join(','))

  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const el   = document.createElement('a')
  el.href     = url
  el.download = 'alerts.csv'
  el.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="alerts-page">

    <!-- Header -->
    <AlertsHeader :criticalCount="criticalCount" />

    <!-- Filter chips -->
    <AlertsFilterChips
      v-model="levelFilter"
      :tabs="filterTabs"
    />

    <!-- Toolbar -->
    <AlertsToolbar
      v-model:searchQuery="searchQuery"
      v-model:activeStatus="activeStatus"
      v-model:ackFilter="ackFilter"
      @clearAll="clearAll"
      @export="handleExport"
    />

    <!-- Table -->
    <AlertsTable
      :alerts="filteredAlerts"
      :acknowledgedIds="acknowledgedIds"
      :deviceTypeMap="deviceTypeMap"
      @select="openDetail"
      @delete="handleDelete"
    />

    <!-- Detail Modal -->
    <AlertDetailModal
      :alert="selectedAlert"
      :isAcknowledged="selectedAlert ? acknowledgedIds.has(selectedAlert.id) : false"
      @close="closeModal"
      @acknowledge="handleAcknowledge"
      @clear="handleClear"
    />

  </div>
</template>

<style scoped>
.alerts-page {
  padding: 24px;
  font-family: var(--font-sans, 'Sarabun', sans-serif);
  background: var(--color-bg, #f9fafb);
  min-height: 100vh;
}

@media (max-width: 768px) {
  .alerts-page { padding: 16px; }
}
</style>