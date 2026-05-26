<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Alert } from '@/composables/useSiteData'

const props = defineProps<{
  alert:           Alert | null
  isAcknowledged:  boolean
  currentAssignee: string
  comments:        string[]
}>()

const emit = defineEmits<{
  (e: 'close'):                                 void
  (e: 'acknowledge',  id: string):              void
  (e: 'clear',        id: string):              void
  (e: 'assign',       id: string, name: string): void
  (e: 'addComment',   id: string, text: string): void
}>()

const assignee    = ref('Unassigned')
const commentText = ref('')

const assigneeOptions = ['Unassigned', 'Admin', 'Engineer A', 'Engineer B', 'Engineer C']

watch(() => props.alert, () => {
  assignee.value    = props.currentAssignee || 'Unassigned'
  commentText.value = ''
})

watch(() => props.currentAssignee, (v) => {
  assignee.value = v || 'Unassigned'
})

function handleAssignChange(val: string) {
  assignee.value = val
  if (props.alert) emit('assign', props.alert.id, val)
}

function submitComment() {
  if (!commentText.value.trim() || !props.alert) return
  emit('addComment', props.alert.id, commentText.value.trim())
  commentText.value = ''
}

function severityLabel(level: Alert['level']) {
  return level === 'alert' ? 'CRITICAL' : level === 'warning' ? 'MAJOR' : 'NORMAL'
}
function severityClass(level: Alert['level']) {
  return level === 'alert' ? 'sev-critical' : level === 'warning' ? 'sev-major' : 'sev-normal'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="alert" class="overlay" @click.self="emit('close')">
        <div class="modal" role="dialog" aria-modal="true">

          <!-- Header -->
          <div class="modal-header">
            <span class="modal-title">Alert Details</span>
            <button class="btn-close" @click="emit('close')">
              <i class="ti ti-x" />
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">

            <div class="detail-grid">
              <div class="detail-row">
                <span class="detail-label">Start Time</span>
                <span class="detail-value">2025-07-02 13:43:09</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Severity</span>
                <span class="sev-badge" :class="severityClass(alert.level)">
                  {{ severityLabel(alert.level) }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Event</span>
                <span class="detail-value">{{ alert.title }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="status-badge" :class="isAcknowledged ? 'status-ack' : 'status-unack'">
                  {{ isAcknowledged ? 'Active & Acknowledged' : 'Active & Unacknowledged' }}
                </span>
              </div>
            </div>

            <details class="show-more">
              <summary>Show More</summary>
              <pre class="show-more-json">{{
                JSON.stringify({
                  'Alarm Description': alert.title,
                  'Keys':     [],
                  'Province': alert.province,
                  'District': alert.district,
                  'Site ID':  alert.siteId,
                }, null, 2)
              }}</pre>
            </details>

            <div class="modal-field">
              <label class="field-label">Assignee</label>
              <select
                :value="assignee"
                class="field-select"
                @change="handleAssignChange(($event.target as HTMLSelectElement).value)"
              >
                <option v-for="opt in assigneeOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="modal-field">
              <label class="field-label">Activity</label>
              <p class="activity-sub">Add New Comment</p>

              <div class="comment-input-row">
                <textarea
                  v-model="commentText"
                  class="field-textarea"
                  placeholder="Add a comment..."
                  rows="2"
                  @keydown.ctrl.enter="submitComment"
                />
                <button
                  class="btn-add-comment"
                  :disabled="!commentText.trim()"
                  @click="submitComment"
                >
                  ส่ง
                </button>
              </div>

              <div v-if="comments.length > 0" class="comment-list">
                <div v-for="(c, i) in comments" :key="i" class="comment-item">
                  <i class="ti ti-message comment-icon" />
                  <span>{{ c }}</span>
                </div>
              </div>
              <p v-else class="no-comments">No Comments</p>

            </div>

          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="emit('close')">Cancel</button>
            <button class="btn btn-ack"    @click="emit('acknowledge', alert.id)">Acknowledged</button>
            <button class="btn btn-clear"  @click="emit('clear', alert.id)">Clear</button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #fff;
  border-radius: 14px;
  width: 480px;
  max-width: 95vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}
.modal-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-1, #111827);
  font-family: var(--font-sans, inherit);
}
.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6b7280;
  padding: 4px;
  border-radius: 6px;
}
.btn-close:hover { background: #f3f4f6; }
.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: var(--font-sans, inherit);
}
.detail-grid { display: flex; flex-direction: column; gap: 10px; }
.detail-row  { display: flex; align-items: center; gap: 12px; }
.detail-label {
  width: 90px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-3, #6b7280);
}
.detail-value { font-size: 13px; color: var(--color-text-1, #111827); }
.sev-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .3px;
}
.sev-critical { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.sev-major    { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.sev-normal   { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}
.status-unack { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.status-ack   { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.show-more {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
}
.show-more summary {
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: #f9fafb;
  user-select: none;
  color: var(--color-text-1, #111827);
}
.show-more-json {
  padding: 12px 14px;
  margin: 0;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  background: #1e1e2e;
  color: #cdd6f4;
  line-height: 1.6;
  overflow: auto;
}
.modal-field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--color-text-2, #374151); }
.activity-sub { font-size: 12px; color: var(--color-text-3, #6b7280); margin: 0; }
.field-select {
  border: 1px solid #dbe0e6;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color .15s;
}
.field-select:focus { border-color: #2563eb; }
.comment-input-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.field-textarea {
  flex: 1;
  border: 1px solid #dbe0e6;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  resize: vertical;
  transition: border-color .15s;
  min-height: 60px;
}
.field-textarea:focus { border-color: #2563eb; }
.btn-add-comment {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity .15s;
}
.btn-add-comment:disabled             { opacity: .4; cursor: not-allowed; }
.btn-add-comment:not(:disabled):hover { opacity: .9; }
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}
.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  color: var(--color-text-1, #111827);
  line-height: 1.4;
}
.comment-icon { font-size: 14px; color: #9ca3af; flex-shrink: 0; margin-top: 1px; }
.no-comments  { font-size: 12px; color: #9ca3af; margin: 0; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--color-border, #e5e7eb);
}
.btn {
  height: 36px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: opacity .15s;
}
.btn:hover  { opacity: .85; }
.btn-cancel { background: #f3f4f6; color: #374151; }
.btn-ack    { background: #2563eb; color: #fff; }
.btn-clear  { background: #dc2626; color: #fff; }
.modal-enter-active,
.modal-leave-active { transition: opacity .2s ease; }
.modal-enter-from,
.modal-leave-to     { opacity: 0; }
</style>