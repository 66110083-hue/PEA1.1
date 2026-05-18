<script setup lang="ts">
import CardWrapper          from '~/components/PageOverview/CardWrapper.vue'
import TransformerFormModal from '~/components/PageTransformer/TransformerFormModal.vue'
import { useTransformer }   from '~/composables/useTransformer'

const {
  transformers, filteredData, totalPages,
  searchQuery, statusFilter, page,
  showModal, modalMode, formError, form,
  openAdd, openView, openEdit, confirmDelete,
  closeModal, saveForm, deleteRow, exportCSV,
} = useTransformer()
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
.status-dot.online  { background:#1D9E75; box-shadow:0 0 0 3px rgba(29,158,117,0.2); }
.status-dot.offline { background:#9aa0b0; }
.action-btn {
  width:28px; height:28px; border-radius:6px; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center; font-size:13px; transition:opacity 0.12s;
}
.action-btn:hover { opacity:0.8; }
.action-btn.view   { background:#E6F1FB; color:#185FA5; }
.action-btn.edit   { background:#FAEEDA; color:#854F0B; }
.action-btn.delete { background:#FCEBEB; color:#A32D2D; }
.tm-btn {
  display:flex; align-items:center; gap:5px; padding:7px 14px;
  border-radius:var(--radius-md); font-size:12px; font-weight:500;
  font-family:var(--font-sans); cursor:pointer; transition:opacity 0.12s; white-space:nowrap;
}
.tm-btn:hover { opacity:0.85; }
.tm-btn-green   { background:var(--color-green); color:white; border:none; }
.tm-btn-outline { background:transparent; color:var(--color-text-2); border:1px solid var(--color-border-md); }
.page-btn {
  width:28px; height:28px; border-radius:4px;
  border:1px solid var(--color-border); background:var(--color-bg);
  cursor:pointer; font-size:14px; color:var(--color-text-2);
}
.page-btn:disabled { opacity:0.35; cursor:not-allowed; }
</style>

<template>
  <div style="display:flex;flex-direction:column;gap:16px">

    <CardWrapper title="Transformer Management" icon="ti-bolt">
      <template #actions>
        <div style="display:flex;gap:8px;align-items:center">
          <div style="position:relative">
            <i class="ti ti-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--color-text-3);font-size:14px"/>
            <input v-model="searchQuery" placeholder="Search by PEA No. / Device ID"
              style="padding:7px 12px 7px 32px;border:1px solid var(--color-border-md);border-radius:var(--radius-md);font-size:12px;width:240px;font-family:var(--font-sans);background:var(--color-bg);color:var(--color-text-1);outline:none"/>
          </div>
          <select v-model="statusFilter"
            style="padding:7px 10px;border:1px solid var(--color-border-md);border-radius:var(--radius-md);font-size:12px;font-family:var(--font-sans);background:var(--color-bg);color:var(--color-text-1);outline:none;cursor:pointer">
            <option value="">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <button class="tm-btn tm-btn-outline" @click="exportCSV">
            <i class="ti ti-download"/> Export
          </button>
          <button class="tm-btn tm-btn-green" @click="openAdd">
            <i class="ti ti-plus"/> Add Transformer
          </button>
        </div>
      </template>

      <!-- Table -->
      <div style="overflow-x:auto;margin-top:4px">
        <table class="tm-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Device ID</th>
              <th>PEA No.</th>
              <th>Brand</th>
              <th>Rated (kVA)</th>
              <th>Rated CT</th>
              <th>Comm. Type</th>
              <th>IP Simcard</th>
              <th>Lat</th>
              <th>Long</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredData.length === 0">
              <td colspan="11" style="text-align:center;padding:32px;color:var(--color-text-3)">ไม่พบข้อมูล</td>
            </tr>
            <tr v-for="row in filteredData" :key="row.id">
              <td><span class="status-dot" :class="row.status"/></td>
              <td class="tm-mono">{{ row.deviceId }}</td>
              <td class="tm-mono tm-bold">{{ row.peaNo }}</td>
              <td>{{ row.brand }}</td>
              <td class="tm-mono">{{ row.rated }}</td>
              <td class="tm-mono">{{ row.ratedCT }}</td>
              <td>{{ row.commType }}</td>
              <td class="tm-mono">{{ row.ipSim }}</td>
              <td class="tm-mono">{{ row.lat }}</td>
              <td class="tm-mono">{{ row.long }}</td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="action-btn view"   @click="openView(row)"     title="View"><i class="ti ti-eye"/></button>
                  <button class="action-btn edit"   @click="openEdit(row)"     title="Edit"><i class="ti ti-pencil"/></button>
                  <button class="action-btn delete" @click="confirmDelete(row)" title="Delete"><i class="ti ti-trash"/></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:12px;color:var(--color-text-3)">
        <span>แสดง {{ filteredData.length }} / {{ transformers.length }} รายการ</span>
        <div style="display:flex;gap:4px">
          <button class="page-btn" :disabled="page <= 1" @click="page--">‹</button>
          <span style="padding:4px 10px;background:var(--color-green);color:white;border-radius:4px;font-size:11px">{{ page }}</span>
          <button class="page-btn" :disabled="page >= totalPages" @click="page++">›</button>
        </div>
      </div>
    </CardWrapper>

    <!-- Modal -->
    <TransformerFormModal
      :show="showModal"
      :mode="modalMode"
      :form="form"
      :error="formError"
      @close="closeModal"
      @save="saveForm"
      @delete="deleteRow"
    />

  </div>
</template>

