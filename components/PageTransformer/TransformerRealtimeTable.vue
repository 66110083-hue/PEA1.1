<script setup lang="ts">
defineProps<{
  rows: any[]
}>()
</script>

<template>
  <div class="td-card">

    <div class="td-card-header">
      <div class="td-card-header-icon">
        <i class="ti ti-table"/>
      </div>

      <span class="td-card-title">
        Realtime Data
      </span>
    </div>

    <div style="overflow-x:auto">
      <table class="td-rt-table">

        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
            <th>Unit</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="row in rows"
            :key="row.label"
          >
            <td>{{ row.label }}</td>

            <td class="td-rt-val">
              {{ row.value.toFixed(3) }}
            </td>

            <td>{{ row.unit }}</td>
          </tr>
        </tbody>

      </table>
    </div>

  </div>
</template>

<style scoped>
.td-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.td-card-header {
  display:flex;
  align-items:center;
  gap:8px;
  padding:12px 16px;
  border-bottom:1px solid var(--color-border);
}

.td-card-header-icon {
  width:28px;
  height:28px;
  border-radius:6px;
  background:#2563EB;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
}

.td-card-title {
  font-size:13px;
  font-weight:600;
}

.td-rt-table {
  width:100%;
  border-collapse:collapse;
}

.td-rt-table th {
  padding:7px 12px;
  text-align:left;
  background:var(--color-surface-2);
}

.td-rt-table td {
  padding:7px 12px;
  border-bottom:1px solid var(--color-border);
}

.td-rt-val {
  font-family:var(--font-mono);
  font-weight:600;
}
</style>