<script setup lang="ts">
import { ref, computed } from 'vue'

import {
  allAlerts,
  alertColor,
} from '@/composables/useSiteData'

const activeFilter = ref<
  'all' | 'alert' | 'warning' | 'info'
>('all')

const filteredAlerts = computed(() => {

  if (activeFilter.value === 'all') {
    return allAlerts
  }

  return allAlerts.filter(
    a => a.level === activeFilter.value
  )

})

const criticalCount = computed(() =>
  allAlerts.filter(
    a => a.level === 'alert'
  ).length
)

const filters = computed(() => [

  {
    key: 'all' as const,
    label: 'ทั้งหมด',
    count: allAlerts.length,
  },

  {
    key: 'alert' as const,
    label: 'วิกฤต',
    count: allAlerts.filter(
      a => a.level === 'alert'
    ).length,
  },

  {
    key: 'warning' as const,
    label: 'ออฟไลน์',
    count: allAlerts.filter(
      a => a.level === 'warning'
    ).length,
  },

  {
    key: 'info' as const,
    label: 'ปกติ',
    count: allAlerts.filter(
      a => a.level === 'info'
    ).length,
  },

])
</script>

<template>

  <div class="alert-card">

    <!-- Header -->
    <div class="alert-header">

      <div class="header-left">
        <i class="ti ti-bell bell-icon"/>
        <span>การแจ้งเตือน</span>
      </div>

      <div class="critical-badge">
        {{ criticalCount }} รายการวิกฤต
      </div>

    </div>

    <!-- Filters -->
    <div class="filter-row">

      <button
        v-for="f in filters"
        :key="f.key"
        class="filter-btn"
        :class="{
          active: activeFilter === f.key
        }"
        @click="activeFilter = f.key"
      >
        {{ f.label }}
        ({{ f.count }})
      </button>

    </div>

    <!-- Alert List -->
    <div
      v-for="item in filteredAlerts"
      :key="item.id"
      class="alert-item"
    >

      <!-- Status Dot -->
      <div
        class="alert-dot"
        :style="{
          backgroundColor:
            alertColor[item.level]
        }"
      />

      <!-- Content -->
      <div class="alert-content">

        <div class="alert-title">
          {{ item.title }}
        </div>

        <div class="alert-sub">
          {{ item.sub }}
        </div>

      </div>

      <!-- Time -->
      <div class="alert-time">
        {{ item.time }}
      </div>

    </div>

  </div>

</template>

<style scoped>

/* =========================
   Card
========================= */

.alert-card {
  background: #ffffff;

  border-radius: 16px;

  border: 1px solid var(--color-border);

  padding: 18px;

  font-family: var(--font-sans);

  box-shadow:
    0 1px 2px rgba(16,24,40,.04),
    0 1px 3px rgba(16,24,40,.06);
}

/* =========================
   Header
========================= */

.alert-header {
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 18px;
}

.header-left {
  display: flex;

  align-items: center;

  gap: 10px;

  font-size: 14px;

  font-weight: 700;

  letter-spacing: -.2px;

  color: var(--color-text-1);
}

.bell-icon {
  font-size: 16px;

  color: #f59e0b;
}

.critical-badge {
  background: #fef2f2;

  color: #dc2626;

  padding: 6px 12px;

  border-radius: 999px;

  font-size: 11px;

  font-weight: 600;

  border: 1px solid #fecaca;
}

/* =========================
   Filters
========================= */

.filter-row {
  display: flex;

  gap: 8px;

  margin-bottom: 12px;

  flex-wrap: wrap;
}

.filter-btn {
  height: 36px;

  padding: 0 14px;

  border-radius: 10px;

  border: 1px solid #dbe0e6;

  background: #ffffff;

  color: var(--color-text-2);

  cursor: pointer;

  font-size: 12px;

  font-weight: 500;

  font-family: var(--font-sans);

  transition: all .15s ease;
}

.filter-btn:hover {
  opacity: .85;
}

.filter-btn.active {
  background: #2563eb;

  border-color: #2563eb;

  color: white;
}

/* =========================
   Alert Item
========================= */

.alert-item {
  display: flex;

  align-items: center;

  gap: 12px;

  min-height: 72px;

  padding: 12px 6px;

  border-top: 1px solid var(--color-border);

  transition: background .15s ease;
}

.alert-item:hover {
  background: var(--color-bg);
}

.alert-dot {
  width: 10px;

  height: 10px;

  border-radius: 50%;

  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 13px;

  font-weight: 600;

  line-height: 1.3;

  color: var(--color-text-1);

  margin-bottom: 3px;
}

.alert-sub {
  font-size: 12px;

  color: var(--color-text-3);

  line-height: 1.4;
}

.alert-time {
  font-size: 11px;

  font-weight: 500;

  color: var(--color-text-3);

  white-space: nowrap;

  margin-left: 12px;
}

/* =========================
   Mobile
========================= */

@media (max-width: 768px) {

  .alert-header {
    flex-direction: column;

    align-items: flex-start;

    gap: 12px;
  }

  .alert-item {
    flex-wrap: wrap;
  }

  .alert-time {
    width: 100%;

    margin-left: 22px;
  }

}

</style>