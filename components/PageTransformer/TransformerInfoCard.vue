<script setup lang="ts">
defineProps<{
  data: any
}>()
</script>

<template>
  <div class="td-card">

    <div class="td-card-header">
      <div class="td-card-header-icon">
        <i class="ti ti-bolt"/>
      </div>

      <span class="td-card-title">
        Transformer Detail
      </span>
    </div>

    <div class="td-card-body">

      <div class="td-hero">

        <div class="td-img-box">
          🔌
        </div>

        <div class="td-info-grid">

          <div class="td-info-item">
            <span class="td-info-label">PEA No.</span>
            <span class="td-info-value">{{ data.peaNo }}</span>
          </div>

          <div class="td-info-item">
            <span class="td-info-label">Brand</span>
            <span class="td-info-value">{{ data.brand }}</span>
          </div>

          <div class="td-info-item">
            <span class="td-info-label">Rated</span>
            <span class="td-info-value">{{ data.rated }}</span>
          </div>

          <div class="td-info-item">
            <span class="td-info-label">Comm Type</span>
            <span class="td-info-value">{{ data.commType }}</span>
          </div>

        </div>

      </div>

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
  background:var(--color-green);
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
}

.td-card-body {
  padding:16px;
}

.td-hero {
  display:flex;
  gap:20px;
}

.td-img-box {
  width:120px;
  height:120px;
  border-radius:8px;
  background:var(--color-surface-2);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:40px;
}

.td-info-grid {
  flex:1;
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:12px;
}

.td-info-label {
  font-size:10px;
  color:var(--color-text-3);
}

.td-info-value {
  font-size:13px;
  font-weight:600;
}
</style>