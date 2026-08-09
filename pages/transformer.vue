<script setup lang="ts">
import CardWrapper          from '~/components/PageOverview/CardWrapper.vue'
import TransformerFormModal from '~/components/PageTransformer/TransformerFormModal.vue'
import TransformerDetail    from '~/components/PageTransformer/TransformerDetail.vue'

import { useTransformer }   from '~/composables/useTransformer'
import { ref, onMounted }   from 'vue'

const {
  loadFromAPI,
  transformers, filteredData, totalPages,
  searchQuery, statusFilter, page,
  showModal, modalMode, formError, form,
  hiddenList, restoreRow,
  openAdd, openEdit, confirmDelete,
  closeModal, saveForm, deleteRow, exportCSV,
} = useTransformer()

onMounted(() => loadFromAPI())

const showRestoreMenu = ref(false)
function toggleRestoreMenu() { showRestoreMenu.value = !showRestoreMenu.value }
function handleRestore(id: string) {
  restoreRow(id)
  if (hiddenList.value.length === 0) showRestoreMenu.value = false
}

const showDetail          = ref(false)
const selectedTransformer = ref<typeof transformers.value[0] | null>(null)

function toTransformerId(row: typeof transformers.value[0]): string {
  return String(row.id)
}
function openDetail(row: typeof transformers.value[0]) {
  selectedTransformer.value = row
  showDetail.value = true
}
function backToList() {
  showDetail.value          = false
  selectedTransformer.value = null
}
</script>

<style scoped>
.tm-table { width:100%; border-collapse:collapse; font-size:12px; }
.tm-table th {
  text-align:left; padding:8px 12px; white-space:nowrap;
  background:var(--color-surface-2); color:var(--color-text-3);
  font-size:10px; text-transform:uppercase; letter-spacing:0.06em;
  border-bottom:1px solid var(--color-border);
}
.tm-table td { padding:10px 12px; border-bottom:1px solid var(--color-border); white-space:nowrap; }
.tm-table tr:last-child td { border-bottom:none; }
.tm-table tr:hover td { background:var(--color-bg); }
.tm-mono { font-family:var(--font-mono); }
.tm-bold { font-weight:600; }
.status-dot { width:10px; height:10px; border-radius:50%; display:inline-block; }
.status-dot.online  { background:#1d9e75; box-shadow:0 0 0 3px rgba(29,158,117,0.2); }
.status-dot.offline { background:#9aa0b0; }
.action-btn {
  width:28px; height:28px; border-radius:6px; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; transition:opacity 0.12s;
}
.action-btn:hover { opacity:0.8; }
.action-btn.view   { background:#e6f1fb; color:#185fa5; }
.action-btn.edit   { background:#faeeda; color:#854f0b; }
.action-btn.delete { background:#fcebeb; color:#a32d2d; }
.tm-btn {
  display:flex; align-items:center; gap:5px; padding:7px 14px;
  border-radius:var(--radius-md); font-size:12px; font-weight:500;
  font-family:var(--font-sans); cursor:pointer; transition:opacity 0.12s; white-space:nowrap;
}
.tm-btn:hover { opacity:0.85; }
.tm-btn-green   { background:var(--color-green); color:white; border:none; }
.tm-btn-outline { background:transparent; color:var(--color-text-2); border:1px solid var(--color-border-md); position:relative; }
.page-btn {
  width:28px; height:28px; border-radius:4px;
  border:1px solid var(--color-border); background:var(--color-bg);
  cursor:pointer; font-size:14px; color:var(--color-text-2);
}
.page-btn:disabled { opacity:0.35; cursor:not-allowed; }
.td-back-btn {
  display:inline-flex; align-items:center; gap:6px; padding:6px 12px;
  border-radius:var(--radius-md); border:1px solid var(--color-border-md);
  background:var(--color-surface); cursor:pointer; font-size:12px; font-weight:500;
  color:var(--color-text-2); transition:opacity 0.12s;
}
.td-back-btn:hover { opacity:0.75; }
.td-breadcrumb { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--color-text-3); }
.td-breadcrumb .sep    { color:var(--color-border-md); }
.td-breadcrumb .active { color:var(--color-text-1); font-weight:600; }

.restore-wrap { position:relative; }
.restore-badge {
  background:#e74c3c; color:white; border-radius:999px;
  font-size:10px; padding:1px 6px; margin-left:4px;
}
.restore-menu {
  position:absolute; top:calc(100% + 6px); right:0; z-index:50;
  background:var(--color-bg); border:1px solid var(--color-border-md);
  border-radius:var(--radius-md); box-shadow:0 8px 24px rgba(0,0,0,0.12);
  width:280px; max-height:320px; overflow-y:auto; padding:6px;
}
.restore-item {
  display:flex; align-items:center; justify-content:space-between;
  padding:8px 10px; border-radius:6px; font-size:12px;
}
.restore-item:hover { background:var(--color-surface-2); }
.restore-item .info { display:flex; flex-direction:column; gap:2px; }
.restore-item .peano { font-weight:600; font-family:var(--font-mono); }
.restore-item .devid { color:var(--color-text-3); font-size:11px; }
.restore-btn-sm {
  padding:4px 10px; border-radius:6px; border:none; cursor:pointer;
  background:var(--color-green); color:white; font-size:11px; font-weight:500;
}
.restore-empty { text-align:center; padding:20px; color:var(--color-text-3); font-size:12px; }
</style>

<template>
  <div style="display:flex;flex-direction:column;gap:16px">

    <template v-if="showDetail && selectedTransformer">

      <div style="display:flex;align-items:center;justify-content:space-between">
        <div class="td-breadcrumb">
          <span>Transformer</span>
          <span class="sep">›</span>
          <span class="active">{{ selectedTransformer.peaNo }}</span>
        </div>
        <button class="td-back-btn" @click="backToList">
          <i class="ti ti-arrow-left"/> กลับไปรายการ
        </button>
      </div>

      <TransformerDetail :transformer-id="toTransformerId(selectedTransformer)" />

    </template>

    <template v-else>

      <CardWrapper title="Transformer Management" icon="ti-bolt">
        <template #actions>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="position:relative">
              <i class="ti ti-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--color-text-3);font-size:14px"/>
              <input v-model="searchQuery" placeholder="Search by Site ID/ Site Name "
                style="padding:7px 12px 7px 32px;border:1px solid var(--color-border-md);border-radius:var(--radius-md);font-size:12px;width:240px;"/>
            </div>
            <select v-model="statusFilter"
              style="padding:7px 10px;border:1px solid var(--color-border-md);border-radius:var(--radius-md);font-size:12px;">
              <option value="">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>

            <div class="restore-wrap">
              <button class="tm-btn tm-btn-outline" @click="toggleRestoreMenu">
                <i class="ti ti-history"/> Restore
                <span v-if="hiddenList.length" class="restore-badge">{{ hiddenList.length }}</span>
              </button>

              <div v-if="showRestoreMenu" class="restore-menu">
                <div v-if="hiddenList.length === 0" class="restore-empty">
                  ไม่มีรายการที่ถูกลบ
                </div>
                <div v-for="row in hiddenList" :key="row.id" class="restore-item">
                  <div class="info">
                    <span class="peano">{{ row.peaNo }}</span>
                    <span class="devid">{{ row.deviceId }}</span>
                  </div>
                  <button class="restore-btn-sm" @click="handleRestore(row.id)">กู้คืน</button>
                </div>
              </div>
            </div>

            <button class="tm-btn tm-btn-outline" @click="exportCSV"><i class="ti ti-download"/> Export</button>
            <button class="tm-btn tm-btn-green"   @click="openAdd"><i class="ti ti-plus"/> Add Transformer</button>
          </div>
        </template>

        <div style="overflow-x:auto;margin-top:4px">
          <table class="tm-table">
            <thead>
              <tr>
                <th>Status</th><th>Dev Serial</th><th>Site ID</th><th>Site Name</th><th>Brand</th>
                <th>Rated</th><th>Rated CT</th><th>Comm. Type</th><th>IP Sim</th>
                <th>Lat</th><th>Long</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredData.length === 0">
                <td colspan="12" style="text-align:center;padding:32px;color:var(--color-text-3)">ไม่พบข้อมูล</td>
              </tr>
              <tr v-for="row in filteredData" :key="row.id">
                <td><span class="status-dot" :class="row.status"/></td>
                <td class="tm-mono">{{ row.deviceId }}</td>
                <td class="tm-mono">{{ row.siteId }}</td>
                <td>{{ row.siteName }}</td>
                <td>{{ row.brand }}</td>
                <td class="tm-mono">{{ row.rated }}</td>
                <td class="tm-mono">{{ row.ratedCT }}</td>
                <td>{{ row.commType }}</td>
                <td class="tm-mono">{{ row.ipSim }}</td>
                <td class="tm-mono">{{ row.lat }}</td>
                <td class="tm-mono">{{ row.long }}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="action-btn view"   @click="openDetail(row)"    title="View"><i class="ti ti-eye"/></button>
                    <button class="action-btn edit"   @click="openEdit(row)"      title="Edit"><i class="ti ti-pencil"/></button>
                    <button class="action-btn delete" @click="confirmDelete(row)" title="Delete"><i class="ti ti-trash"/></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:12px;color:var(--color-text-3);">
          <span>แสดง {{ filteredData.length }} / {{ transformers.length }} รายการ</span>
          <div style="display:flex;gap:4px">
            <button class="page-btn" :disabled="page <= 1" @click="page--">‹</button>
            <span style="padding:4px 10px;background:var(--color-green);color:white;border-radius:4px;font-size:11px">{{ page }}</span>
            <button class="page-btn" :disabled="page >= totalPages" @click="page++">›</button>
          </div>
        </div>
      </CardWrapper>

    </template>

    <TransformerFormModal
      :show="showModal" :mode="modalMode" :form="form" :error="formError"
      @close="closeModal" @save="saveForm" @delete="deleteRow"
    />

  </div>
</template>