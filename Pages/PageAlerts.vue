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
        <span class="bell-icon">🔔</span>
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
      <!-- Dot -->
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
.alert-card {
  background: #ffffff;

  border-radius: 16px;

  border: 1px solid #edf0f2;

  padding: 20px;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;

  box-shadow:
    0 1px 2px rgba(16,24,40,.04),
    0 1px 3px rgba(16,24,40,.08);
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

  font-size: 17px;

  font-weight: 600;

  letter-spacing: -.2px;

  color: #1f2937;
}

.bell-icon {
  font-size: 18px;
}

.critical-badge {
  background: #fef2f2;

  color: #dc2626;

  padding: 6px 12px;

  border-radius: 999px;

  font-size: 12px;

  font-weight: 600;

  border: 1px solid #fecaca;
}

/* =========================
   Filters
========================= */

.filter-row {
  display: flex;

  gap: 10px;

  margin-bottom: 14px;

  flex-wrap: wrap;
}

.filter-btn {
  border: 1px solid #e5e7eb;

  height: 36px;

  padding: 0 14px;

  border-radius: 10px;

  background: #f9fafb;

  color: #4b5563;

  cursor: pointer;

  font-size: 13px;

  font-weight: 500;

  transition: all .2s ease;
}

.filter-btn:hover {
  background: #f3f4f6;

  border-color: #d1d5db;
}

.filter-btn.active {
  background: #2563eb;

  color: white;

  border-color: #2563eb;
}

/* =========================
   Alert Item
========================= */

.alert-item {
  display: flex;

  align-items: flex-start;

  gap: 14px;

  padding: 16px 4px;

  border-top: 1px solid #f3f4f6;

  transition: background .2s ease;
}

.alert-item:hover {
  background: #fafafa;
}

.alert-dot {
  width: 10px;

  height: 10px;

  border-radius: 50%;

  margin-top: 7px;

  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 15px;

  font-weight: 600;

  line-height: 1.4;

  letter-spacing: -.1px;

  color: #1f2937;

  margin-bottom: 4px;
}

.alert-sub {
  font-size: 13px;

  line-height: 1.5;

  color: #6b7280;
}

.alert-time {
  font-size: 12px;

  font-weight: 500;

  color: #9ca3af;

  white-space: nowrap;

  margin-left: 12px;

  padding-top: 2px;
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

    margin-left: 24px;
  }
}
</style>