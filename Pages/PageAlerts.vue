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

  border-radius: 18px;

  padding: 18px 20px;

  box-shadow:
    0 1px 2px rgba(0,0,0,.04),
    0 8px 24px rgba(0,0,0,.04);
}

/* Header */

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 14px;
}

.header-left {
  display: flex;
  align-items: center;

  gap: 10px;

  font-size: 18px;
  font-weight: 700;

  color: #1f2937;
}

.bell-icon {
  font-size: 18px;
}

.critical-badge {
  background: #fdecec;

  color: #d94b4b;

  padding: 6px 12px;

  border-radius: 999px;

  font-size: 13px;
  font-weight: 600;
}

/* Filters */

.filter-row {
  display: flex;

  gap: 10px;

  margin-bottom: 10px;

  flex-wrap: wrap;
}

.filter-btn {
  border: none;

  padding: 8px 14px;

  border-radius: 999px;

  background: #f3f4f6;

  color: #374151;

  cursor: pointer;

  font-size: 14px;
  font-weight: 600;

  transition: .2s;
}

.filter-btn:hover {
  background: #e5e7eb;
}

.filter-btn.active {
  background: #111827;
  color: white;
}

/* Item */

.alert-item {
  display: flex;
  align-items: flex-start;

  gap: 14px;

  padding: 16px 0;

  border-top: 1px solid #f1f1f1;
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
  font-size: 16px;
  font-weight: 700;

  color: #374151;

  margin-bottom: 4px;
}

.alert-sub {
  font-size: 14px;

  color: #9ca3af;
}

.alert-time {
  font-size: 13px;

  color: #9ca3af;

  white-space: nowrap;

  margin-left: 10px;
}

/* Mobile */

@media (max-width: 768px) {
  .alert-header {
    flex-direction: column;
    align-items: flex-start;

    gap: 10px;
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