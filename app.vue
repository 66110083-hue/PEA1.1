<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  defineAsyncComponent,
} from 'vue'
import { allAlerts } from '@/composables/useSiteData'

// =========================
// State & Authentication
// =========================
const isLoggedIn = ref(false)
const currentPage = ref('login')
const showNotification = ref(false)
const showProfileMenu = ref(false)
const clock = ref('')
let clockTimer: ReturnType<typeof setInterval> | null = null

// =========================
// Computed Properties
// =========================
const abnormalAlerts = computed(() =>
  allAlerts.filter(a => a.level === 'alert' || a.level === 'warning')
)

const criticalCount = computed(() =>
  allAlerts.filter(a => a.level === 'alert').length
)

const offlineCount = computed(() =>
  allAlerts.filter(a => a.level === 'warning').length
)

const hasNotification = computed(() => abnormalAlerts.value.length > 0)

const pageComponent = computed(() => pageMap[currentPage.value] ?? pageMap.overview)

// =========================
// Navigation Menu Data
// =========================
const navMain = [
  { to: 'overview',     label: 'ภาพรวม',          icon: 'ti-layout-dashboard' },
  { to: 'transformer',  label: 'จัดการหม้อแปลง',   icon: 'ti-bolt'             },
  { to: 'alerts',       label: 'การแจ้งเตือน',      icon: 'ti-bell-ringing'     },
]

const navAnalysis = [
  { to: 'history',   label: 'ข้อมูลย้อนหลัง', icon: 'ti-history'    },
  { to: 'breakeven', label: 'จุดคุ้มทุน',      icon: 'ti-calculator' },
]

const navSystem = [
  { to: 'settings', label: 'ตั้งค่าระบบ', icon: 'ti-settings' },
]

// =========================
// Lazy-Loaded Pages Mapping
// =========================
const pageMap: Record<string, any> = {
  login:       defineAsyncComponent(() => import('~/Pages/PageLogin.vue')),
  overview:    defineAsyncComponent(() => import('~/Pages/PageOverview.vue')),
  alerts:      defineAsyncComponent(() => import('~/Pages/PageAlerts.vue')),
  history:     defineAsyncComponent(() => import('~/Pages/PageHistory.vue')),
  breakeven:   defineAsyncComponent(() => import('~/Pages/PageBreakeven.vue')),
  settings:    defineAsyncComponent(() => import('~/Pages/PageSettings.vue')),
  transformer: defineAsyncComponent(() => import('~/Pages/PageTransformerManagement.vue')),
}

// =========================
// Functions & Actions
// =========================
const handleLoginSuccess = () => {
  localStorage.setItem('isLoggedIn', 'true')
  isLoggedIn.value  = true
  currentPage.value = 'overview'
}

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  isLoggedIn.value      = false
  currentPage.value     = 'login'
  showProfileMenu.value = false
}

function updateClock() {
  clock.value = new Date().toLocaleTimeString('th-TH', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// =========================
// Lifecycle Hooks
// =========================
onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)

  const saved = localStorage.getItem('isLoggedIn')
  if (saved === 'true') {
    isLoggedIn.value  = true
    currentPage.value = 'overview'
  } else {
    isLoggedIn.value  = false
    currentPage.value = 'login'
  }
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<template>
  <div v-if="isLoggedIn" class="layout">

    <!-- ══════════════════════════════════
         Sidebar
    ══════════════════════════════════ -->
    <aside class="sidebar">

      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">
          <img src="/logo.png" alt="logo" />
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
        <i :class="`ti ${item.icon}`" />
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
        <i :class="`ti ${item.icon}`" />
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
        <i :class="`ti ${item.icon}`" />
        {{ item.label }}
      </button>

      <button
        class="nav-link"
        style="margin-top: auto; color: var(--color-red-text);"
        @click="handleLogout"
      >
        <i class="ti ti-logout" />
        ออกจากระบบ
      </button>

    </aside>

    <!-- ══════════════════════════════════
         Topbar
    ══════════════════════════════════ -->
    <header class="topbar">
      <div />

      <div class="topbar-right">

        <!-- Online status -->
        <div class="status-badge">
          <span class="status-dot" />
          Online 26/30
        </div>

        <!-- Clock -->
        <div class="clock-display">
          {{ clock }}
        </div>

        <!-- ── Notification ── -->
        <div class="notification-wrapper">

          <div
            class="notification-btn"
            @click="showNotification = !showNotification; showProfileMenu = false"
          >
            <i class="ti ti-bell notification-icon" />
            <span v-if="hasNotification" class="notification-dot" />
          </div>

          <div v-if="showNotification" class="notification-dropdown">

            <div class="notification-header">แจ้งเตือนระบบ</div>

            <!-- ไม่มีแจ้งเตือน -->
            <div v-if="abnormalAlerts.length === 0" class="notification-empty">
              ไม่มีแจ้งเตือน
            </div>

            <!-- สรุปจำนวนโดยไม่แสดงรายละเอียด -->
            <div v-else class="notification-summary">

              <div v-if="criticalCount > 0" class="summary-row critical">
                <span class="summary-dot" />
                <span class="summary-label">วิกฤต</span>
                <span class="summary-count">{{ criticalCount }} จุด</span>
              </div>

              <div v-if="offlineCount > 0" class="summary-row offline">
                <span class="summary-dot" />
                <span class="summary-label">ออฟไลน์</span>
                <span class="summary-count">{{ offlineCount }} จุด</span>
              </div>

            </div>

            <button
              class="view-all-btn"
              @click="currentPage = 'alerts'; showNotification = false"
            >
              ดูทั้งหมด
            </button>

          </div>
        </div>

        <!-- ── Profile Avatar + Dropdown ── -->
        <div class="profile-wrapper">

          <div
            class="profile-avatar"
            @click="showProfileMenu = !showProfileMenu; showNotification = false"
          >
            A
          </div>

          <div v-if="showProfileMenu" class="profile-dropdown">

            <div class="profile-dropdown-info">
              <div class="profile-dropdown-avatar">A</div>
              <div>
                <div class="profile-dropdown-name">Admin</div>
                <div class="profile-dropdown-role">ผู้ดูแลระบบ</div>
              </div>
            </div>

            <div class="profile-dropdown-divider" />

            <button
              class="profile-dropdown-item"
              @click="currentPage = 'settings'; showProfileMenu = false"
            >
              <i class="ti ti-settings" />
              ตั้งค่าระบบ
            </button>

            <div class="profile-dropdown-divider" />

            <button
              class="profile-dropdown-item danger"
              @click="handleLogout"
            >
              <i class="ti ti-logout" />
              ออกจากระบบ
            </button>

          </div>
        </div>

      </div>
    </header>

    <!-- ══════════════════════════════════
         Main Content
    ══════════════════════════════════ -->
    <main class="main-content">
      <Transition name="page" mode="out-in">
        <component
          :is="pageComponent"
          :key="currentPage"
          @login-success="handleLoginSuccess"
        />
      </Transition>
    </main>

  </div>

  <!-- ══════════════════════════════════
       Login Layout
  ══════════════════════════════════ -->
  <div v-else class="login-layout">
    <Transition name="page" mode="out-in">
      <component
        :is="pageComponent"
        @login-success="handleLoginSuccess"
      />
    </Transition>
  </div>
</template>

<style scoped>
/* ── Notification summary ───────────────────── */

.notification-summary {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-1, #111827);
}

.summary-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.summary-row.critical .summary-dot  { background: #E24B4A; }
.summary-row.offline  .summary-dot  { background: #BA7517; }

.summary-label { flex: 1; }

.summary-count {
  font-weight: 700;
  font-size: 13px;
}

.summary-row.critical .summary-count { color: #E24B4A; }
.summary-row.offline  .summary-count { color: #BA7517; }
</style>