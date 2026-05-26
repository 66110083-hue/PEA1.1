<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Alert } from '@/composables/useSiteData'

const props = defineProps<{
  alerts:         Alert[]
  acknowledgedIds: Set<string>
  assigneeMap:    Record<string, string>
  deviceTypeMap:  Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'select', alert: Alert): void
  (e: 'delete', id: string):   void
}>()

// ── Sort ───────────────────────────────────────────────────
type SortKey = 'time' | 'level' | 'siteId' | 'province'
const sortKey = ref<SortKey>('siteId')
const sortAsc = ref(true)

const levelOrder: Record<string, number> = { alert: 0, warning: 1, info: 2 }

function setSort(key: SortKey) {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else { sortKey.value = key; sortAsc.value = false }
}

const sorted = computed(() => {
  return [...props.alerts].sort((a, b) => {
    let cmp = 0
    if      (sortKey.value === 'level')    cmp = (levelOrder[a.level] ?? 9) - (levelOrder[b.level] ?? 9)
    else if (sortKey.value === 'siteId')   cmp = a.siteId.localeCompare(b.siteId)
    else if (sortKey.value === 'province') cmp = a.province.localeCompare(b.province)
    else                                   cmp = a.time.localeCompare(b.time)
    return sortAsc.value ? cmp : -cmp
  })
})

// ── Pagination ─────────────────────────────────────────────
const pageSize    = ref(10)
const currentPage = ref(1)

const pageSizeOptions = [10, 25, 50]

const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / pageSize.value)))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sorted.value.slice(start, start + pageSize.value)
})

const pageNumbers = computed(() => {
  const pages: (number | '...')[] = []
  const total = totalPages.value
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage.value > 3) pages.push('...')
    const start = Math.max(2, currentPage.value - 1)
    const end   = Math.min(total - 1, currentPage.value + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage.value < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

function goPage(p: number) {
  currentPage.value = Math.min(Math.max(1, p), totalPages.value)
}

// Reset to page 1 when filter changes
import { watch } from 'vue'
watch(() => props.alerts, () => { currentPage.value = 1 })

// ── Helpers ────────────────────────────────────────────────
function severityLabel(level: Alert['level']) {
  return level === 'alert' ? 'CRITICAL' : level === 'warning' ? 'MAJOR' : 'NORMAL'
}
function severityClass(level: Alert['level']) {
  return level === 'alert' ? 'sev-critical' : level === 'warning' ? 'sev-major' : 'sev-normal'
}

const rangeStart = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const rangeEnd   = computed(() => Math.min(currentPage.value * pageSize.value, sorted.value.length))
</script>

<template>
  <div class="table-wrap">
    <table class="alert-table">

      <!-- ── Head ── -->
      <thead>
        <tr>
          <th class="sortable" @click="setSort('time')">
            Timestamp
            <span class="sort-icon">
              {{ sortKey === 'time' ? (sortAsc ? '▲' : '▼') : '⇅' }}
            </span>
          </th>
          <th class="sortable" @click="setSort('level')">
            Severity
            <span class="sort-icon">
              {{ sortKey === 'level' ? (sortAsc ? '▲' : '▼') : '⇅' }}
            </span>
          </th>
          <th class="sortable" @click="setSort('siteId')">
            PEA Device No.
            <span class="sort-icon">
              {{ sortKey === 'siteId' ? (sortAsc ? '▲' : '▼') : '⇅' }}
            </span>
          </th>
          <th>Device Type</th>
          <th class="sortable" @click="setSort('province')">
            Province
            <span class="sort-icon">
              {{ sortKey === 'province' ? (sortAsc ? '▲' : '▼') : '⇅' }}
            </span>
          </th>
          <th>Event</th>
          <th>Assignee</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>

      <!-- ── Body ── -->
      <tbody>

        <!-- Rows -->
        <tr
          v-for="alert in paginated"
          :key="alert.id"
          class="alert-row"
          @click="emit('select', alert)"
        >
          <td class="td-time">
            <div>2025-07-02</div>
            <div class="sub">{{ alert.time }}</div>
          </td>

          <td>
            <span class="sev-badge" :class="severityClass(alert.level)">
              {{ severityLabel(alert.level) }}
            </span>
          </td>

          <td class="td-device">{{ alert.siteId }}</td>
          <td class="td-type">{{ deviceTypeMap[alert.id] }}</td>
          <td class="td-province">{{ alert.province }}</td>
          <td class="td-event">{{ alert.title }}</td>

          <td>
            <span
              class="assignee-tag"
              :class="{ assigned: !!assigneeMap[alert.id] && assigneeMap[alert.id] !== 'Unassigned' }"
            >
              {{ assigneeMap[alert.id] || 'Unassigned' }}
            </span>
          </td>

          <td>
            <span
              class="status-badge"
              :class="acknowledgedIds.has(alert.id) ? 'status-ack' : 'status-unack'"
            >
              {{ acknowledgedIds.has(alert.id) ? 'Active & Acknowledged' : 'Active & Unacknowledged' }}
            </span>
          </td>

          <td class="td-action" @click.stop>
            <button class="btn-delete" title="Clear" @click="emit('delete', alert.id)">
              <i class="ti ti-trash" />
            </button>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-if="paginated.length === 0">
          <td colspan="9" class="empty-cell">
            <div class="empty-state">
              <i class="ti ti-bell-off empty-icon" />
              <div class="empty-title">ไม่พบรายการแจ้งเตือน</div>
              <div class="empty-sub">ลองเปลี่ยนตัวกรองหรือค้นหาด้วยคำอื่น</div>
            </div>
          </td>
        </tr>

      </tbody>
    </table>
  </div>

  <!-- ── Pagination bar ── -->
  <div class="pagination-bar">

    <!-- Left: items per page + range info -->
    <div class="pagination-left">
      <span class="page-label">แถวต่อหน้า</span>
      <select
        v-model="pageSize"
        class="page-size-select"
        @change="currentPage = 1"
      >
        <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }}</option>
      </select>
      <span class="page-range">
        {{ rangeStart }}–{{ rangeEnd }} จาก {{ sorted.length }} รายการ
      </span>
    </div>

    <!-- Right: page buttons -->
    <div class="pagination-right">

      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="goPage(currentPage - 1)"
      >
        <i class="ti ti-chevron-left" />
      </button>

      <template v-for="p in pageNumbers" :key="String(p)">
        <span v-if="p === '...'" class="page-ellipsis">…</span>
        <button
          v-else
          class="page-btn"
          :class="{ 'page-active': currentPage === p }"
          @click="goPage(p as number)"
        >
          {{ p }}
        </button>
      </template>

      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="goPage(currentPage + 1)"
      >
        <i class="ti ti-chevron-right" />
      </button>

    </div>
  </div>
</template>

<style scoped>
/* Table wrap */
.table-wrap {
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--color-border, #e5e7eb);
  overflow: auto;
  box-shadow: 0 1px 3px rgba(16,24,40,.06);
}

.alert-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  font-family: var(--font-sans, inherit);
}

/* Head */
.alert-table thead th {
  padding: 11px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--color-text-3, #6b7280);
  background: #f9fafb;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  white-space: nowrap;
  user-select: none;
}

.sortable {
  cursor: pointer;
  transition: color .12s;
}
.sortable:hover { color: var(--color-text-1, #111827); }

.sort-icon {
  margin-left: 4px;
  font-size: 9px;
  opacity: .6;
}

/* Rows */
.alert-row {
  cursor: pointer;
  transition: background .12s;
}
.alert-row:hover { background: #f0f6ff; }

.alert-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  vertical-align: middle;
  color: var(--color-text-1, #111827);
}
.alert-row:last-child td { border-bottom: none; }

/* Cells */
.td-time      { white-space: nowrap; font-size: 12px; }
.td-time .sub { color: var(--color-text-3, #6b7280); font-size: 11px; margin-top: 2px; }
.td-device    { font-weight: 600; white-space: nowrap; }
.td-type      { white-space: nowrap; }
.td-province  { white-space: nowrap; }
.td-event     { max-width: 220px; line-height: 1.4; }
.td-action    { text-align: center; }

/* Severity */
.sev-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .3px;
  white-space: nowrap;
}
.sev-critical { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.sev-major    { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.sev-normal   { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

/* Status */
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.status-unack { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.status-ack   { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }

/* Assignee */
.assignee-tag {
  font-size: 12px;
  color: var(--color-text-3, #9ca3af);
}
.assignee-tag.assigned {
  color: #2563eb;
  font-weight: 500;
}

/* Delete */
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 15px;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all .15s;
}
.btn-delete:hover { color: #dc2626; background: #fef2f2; }

/* Empty state */
.empty-cell { border-bottom: none; }
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px;
  gap: 8px;
}
.empty-icon {
  font-size: 36px;
  color: #d1d5db;
}
.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-2, #4b5563);
}
.empty-sub {
  font-size: 12px;
  color: var(--color-text-3, #9ca3af);
}

/* ── Pagination bar ── */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-3, #6b7280);
}

.page-label { white-space: nowrap; }

.page-size-select {
  height: 30px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid #dbe0e6;
  background: #fff;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}

.page-range { white-space: nowrap; }

.pagination-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  border-radius: 6px;
  border: 1px solid #dbe0e6;
  background: #fff;
  color: var(--color-text-2, #4b5563);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .12s;
}
.page-btn:hover:not(:disabled) { background: #f3f4f6; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-btn.page-active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  font-weight: 600;
}

.page-ellipsis {
  min-width: 24px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-3, #9ca3af);
}
</style>