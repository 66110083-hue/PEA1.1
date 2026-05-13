<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">
  <img
    src="/logo.png"
    alt="logo"
  />
</div>
        <div>
          <div class="sidebar-logo-text">PEA</div>
          <div class="sidebar-logo-sub">Energy Monitor 3φ</div>
        </div>
      </div>

      <div class="sidebar-section-label">หน้าหลัก</div>
      <button
        v-for="item in navMain"
        :key="item.to"
        class="nav-link"
        :class="{ active: currentPage === item.to }"
        @click="currentPage = item.to"
      >
        <i :class="`ti ${item.icon}`" aria-hidden="true" />
        {{ item.label }}
      </button>

      <div class="sidebar-section-label">การวิเคราะห์</div>
      <button
        v-for="item in navAnalysis"
        :key="item.to"
        class="nav-link"
        :class="{ active: currentPage === item.to }"
        @click="currentPage = item.to"
      >
        <i :class="`ti ${item.icon}`" aria-hidden="true" />
        {{ item.label }}
      </button>

      <div class="sidebar-section-label">ระบบ</div>
      <button
        v-for="item in navSystem"
        :key="item.to"
        class="nav-link"
        :class="{ active: currentPage === item.to }"
        @click="currentPage = item.to"
      >
        <i :class="`ti ${item.icon}`" aria-hidden="true" />
        {{ item.label }}
      </button>
    </aside>

    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-search">
        <i class="ti ti-search" aria-hidden="true" />
        ค้นหาจุดติดตั้ง...
      </div>
      <div class="topbar-right">
        <div class="status-badge">
          <span class="status-dot" />
          Online 10/12
        </div>
        <div class="clock-display">{{ clock }}</div>
        <i class="ti ti-bell" style="font-size:18px;color:var(--color-text-2);cursor:pointer" aria-hidden="true" />
        <div
          style="width:32px;height:32px;border-radius:50%;background:var(--color-green-bg);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:var(--color-green-text);cursor:pointer"
        >A</div>
      </div>
    </header>

    <!-- Main content -->
    <main class="main-content">
      <Transition name="page" mode="out-in">
        <component :is="pageComponent" :key="currentPage" />
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'

const currentPage = ref('overview')

const navMain = [
  { to: 'overview', label: 'ภาพรวม', icon: 'ti-layout-dashboard' },
  { to: 'map',      label: 'แผนที่จุดติดตั้ง', icon: 'ti-map-pin' },
  { to: 'alerts',   label: 'การแจ้งเตือน', icon: 'ti-bell-ringing' },
]

const navAnalysis = [
  { to: 'history',  label: 'ข้อมูลย้อนหลัง', icon: 'ti-history' },
  { to: 'breakeven',label: 'จุดคุ้มทุน', icon: 'ti-calculator' },
]

const navSystem = [
  { to: 'settings', label: 'ตั้งค่าระบบ', icon: 'ti-settings' },
]

const pageMap: Record<string, any> = {
  overview:  defineAsyncComponent(() => import('~/components/PageOverview.vue')),
  map:       defineAsyncComponent(() => import('~/components/PageMap.vue')),
  alerts:    defineAsyncComponent(() => import('~/components/PageAlerts.vue')),
  history:   defineAsyncComponent(() => import('~/components/PageHistory.vue')),
  breakeven: defineAsyncComponent(() => import('~/components/PageBreakeven.vue')),
  settings:  defineAsyncComponent(() => import('~/components/PageSettings.vue')),
}

const pageComponent = computed(() => pageMap[currentPage.value] ?? pageMap.overview)

// Clock
const clock = ref('')
let clockTimer: any
function updateClock() {
  clock.value = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
onMounted(() => { updateClock(); clockTimer = setInterval(updateClock, 1000) })
onBeforeUnmount(() => clearInterval(clockTimer))
</script>
