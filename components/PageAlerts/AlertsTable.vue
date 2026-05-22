<script setup lang="ts">
import type { Alert } from '@/composables/useSiteData'

defineProps<{
  alerts: Alert[]
  acknowledgedIds: Set<string>
  deviceTypeMap: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'select',  alert: Alert): void
  (e: 'delete',  id: string):   void
}>()

function severityLabel(level: Alert['level']) {
  return level === 'alert' ? 'CRITICAL' : level === 'warning' ? 'MAJOR' : 'NORMAL'
}

function severityClass(level: Alert['level']) {
  return level === 'alert' ? 'sev-critical' : level === 'warning' ? 'sev-major' : 'sev-normal'
}
</script>

<template>
  <div class="table-wrap">
    <table class="alert-table">

      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Severity</th>
          <th>PEA Device No.</th>
          <th>Device Type</th>
          <th>Province</th>
          <th>Event</th>
          <th>Assignee</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>

      <tbody>

        <tr
          v-for="alert in alerts"
          :key="alert.id"
          class="alert-row"
          @click="emit('select', alert)"
        >

          <!-- Timestamp -->
          <td class="td-time">
            <div>2025-07-02</div>
            <div class="sub">{{ alert.time }}</div>
          </td>

          <!-- Severity -->
          <td>
            <span class="sev-badge" :class="severityClass(alert.level)">
              {{ severityLabel(alert.level) }}
            </span>
          </td>

          <!-- PEA Device No. -->
          <td class="td-device">{{ alert.siteId }}</td>

          <!-- Device Type -->
          <td class="td-type">{{ deviceTypeMap[alert.id] }}</td>

          <!-- Province -->
          <td class="td-province">{{ alert.province }}</td>

          <!-- Event -->
          <td class="td-event">{{ alert.title }}</td>

          <!-- Assignee -->
          <td>
            <span class="assignee-tag">Unassigned</span>
          </td>

          <!-- Status -->
          <td>
            <span
              class="status-badge"
              :class="acknowledgedIds.has(alert.id) ? 'status-ack' : 'status-unack'"
            >
              {{ acknowledgedIds.has(alert.id) ? 'Active & Acknowledged' : 'Active & Unacknowledged' }}
            </span>
          </td>

          <!-- Delete -->
          <td class="td-action" @click.stop>
            <button
              class="btn-delete"
              title="Clear"
              @click="emit('delete', alert.id)"
            >
              <i class="ti ti-trash" />
            </button>
          </td>

        </tr>

        <!-- Empty state -->
        <tr v-if="alerts.length === 0">
          <td colspan="9" class="empty-row">
            ไม่พบรายการแจ้งเตือน
          </td>
        </tr>

      </tbody>
    </table>
  </div>

  <!-- Pagination hint -->
  <div class="pagination-row">
    <span class="page-info">
      Items per page: 10 &nbsp;|&nbsp;
      1–{{ Math.min(10, alerts.length) }} of {{ alerts.length }}
    </span>
  </div>
</template>

<style scoped>
.table-wrap {
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--color-border, #e5e7eb);
  overflow: auto;
  box-shadow:
    0 1px 2px rgba(16,24,40,.04),
    0 1px 3px rgba(16,24,40,.06);
}

.alert-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  font-family: var(--font-sans, inherit);
}

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
}

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
.td-time         { white-space: nowrap; font-size: 12px; }
.td-time .sub    { color: var(--color-text-3, #6b7280); font-size: 11px; margin-top: 2px; }
.td-device       { font-weight: 600; white-space: nowrap; }
.td-type         { white-space: nowrap; }
.td-province     { white-space: nowrap; }
.td-event        { max-width: 220px; line-height: 1.4; }
.td-action       { text-align: center; }

/* Assignee */
.assignee-tag {
  font-size: 12px;
  color: var(--color-text-3, #6b7280);
}

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

/* Empty */
.empty-row {
  text-align: center;
  padding: 40px;
  color: var(--color-text-3, #6b7280);
  font-size: 13px;
}

/* Pagination */
.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.page-info {
  font-size: 12px;
  color: var(--color-text-3, #6b7280);
}
</style>