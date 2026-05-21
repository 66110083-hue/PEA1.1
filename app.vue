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
// Login
// =========================

const isLoggedIn = ref(false)

const currentPage = ref('login')

// =========================
// Notification
// =========================

const showNotification = ref(false)

// แจ้งเตือนผิดปกติ
const abnormalAlerts = computed(() =>
  allAlerts.filter(
    a =>
      a.level === 'alert' ||
      a.level === 'warning'
  )
)

// มีแจ้งเตือนหรือไม่
const hasNotification = computed(() =>
  abnormalAlerts.value.length > 0
)

// =========================
// Navigation
// =========================

const navMain = [
  {
    to: 'overview',
    label: 'ภาพรวม',
    icon: 'ti-layout-dashboard',
  },

  {
    to: 'transformer',
    label: 'จัดการหม้อแปลง',
    icon: 'ti-bolt',
  },

  {
    to: 'alerts',
    label: 'การแจ้งเตือน',
    icon: 'ti-bell-ringing',
  },
]

const navAnalysis = [
  {
    to: 'history',
    label: 'ข้อมูลย้อนหลัง',
    icon: 'ti-history',
  },

  {
    to: 'breakeven',
    label: 'จุดคุ้มทุน',
    icon: 'ti-calculator',
  },
]

const navSystem = [
  {
    to: 'settings',
    label: 'ตั้งค่าระบบ',
    icon: 'ti-settings',
  },
]

// =========================
// Pages
// =========================

const pageMap: Record<string, any> = {
  login: defineAsyncComponent(() =>
    import('~/Pages/PageLogin.vue')
  ),

  overview: defineAsyncComponent(() =>
    import('~/Pages/PageOverview.vue')
  ),

  alerts: defineAsyncComponent(() =>
    import('~/Pages/PageAlerts.vue')
  ),

  history: defineAsyncComponent(() =>
    import('~/Pages/PageHistory.vue')
  ),

  breakeven: defineAsyncComponent(() =>
    import('~/Pages/PageBreakeven.vue')
  ),

  settings: defineAsyncComponent(() =>
    import('~/Pages/PageSettings.vue')
  ),

  transformer: defineAsyncComponent(() =>
    import('~/Pages/PageTransformerManagement.vue')
  ),
}

const pageComponent = computed(
  () =>
    pageMap[currentPage.value] ??
    pageMap.overview
)

// =========================
// Login Function
// =========================

const handleLoginSuccess = () => {
  localStorage.setItem(
    'isLoggedIn',
    'true'
  )

  isLoggedIn.value = true

  currentPage.value = 'overview'
}

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')

  isLoggedIn.value = false

  currentPage.value = 'login'
}

// =========================
// Clock
// =========================

const clock = ref('')

let clockTimer: any

function updateClock() {
  clock.value =
    new Date().toLocaleTimeString(
      'th-TH',
      {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }
    )
}

onMounted(() => {
  updateClock()

  clockTimer = setInterval(
    updateClock,
    1000
  )

  const savedLoginStatus =
    localStorage.getItem('isLoggedIn')

  if (savedLoginStatus === 'true') {
    isLoggedIn.value = true

    currentPage.value = 'overview'
  } else {
    isLoggedIn.value = false

    currentPage.value = 'login'
  }
})

onBeforeUnmount(() =>
  clearInterval(clockTimer)
)
</script>

<template>
  <div
    v-if="isLoggedIn"
    class="layout"
  >

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
          <div class="sidebar-logo-text">
            PEA
          </div>

          <div class="sidebar-logo-sub">
            Energy Monitor 3φ
          </div>
        </div>

      </div>

      <!-- Main -->
      <div class="sidebar-section-label">
        หน้าหลัก
      </div>

      <button
        v-for="item in navMain"
        :key="item.to"
        class="nav-link"
        :class="{
          active:
            currentPage === item.to
        }"
        @click="currentPage = item.to"
      >
        <i
          :class="`ti ${item.icon}`"
        />

        {{ item.label }}
      </button>

      <!-- Analysis -->
      <div class="sidebar-section-label">
        การวิเคราะห์
      </div>

      <button
        v-for="item in navAnalysis"
        :key="item.to"
        class="nav-link"
        :class="{
          active:
            currentPage === item.to
        }"
        @click="currentPage = item.to"
      >
        <i
          :class="`ti ${item.icon}`"
        />

        {{ item.label }}
      </button>

      <!-- System -->
      <div class="sidebar-section-label">
        ระบบ
      </div>

      <button
        v-for="item in navSystem"
        :key="item.to"
        class="nav-link"
        :class="{
          active:
            currentPage === item.to
        }"
        @click="currentPage = item.to"
      >
        <i
          :class="`ti ${item.icon}`"
        />

        {{ item.label }}
      </button>

      <!-- Logout -->
      <button
        class="nav-link"
        style="
          margin-top:auto;
          color:var(--color-red-text)
        "
        @click="handleLogout"
      >
        <i class="ti ti-logout" />
        ออกจากระบบ
      </button>

    </aside>

    <!-- Topbar -->
    <header class="topbar">

      <div />

      <div class="topbar-right">

        <!-- Status -->
        <div class="status-badge">
          <span class="status-dot" />
          Online 26/30
        </div>

        <!-- Clock -->
        <div class="clock-display">
          {{ clock }}
        </div>

        <!-- Notification -->
        <div class="notification-wrapper">

          <!-- Bell -->
          <div
            class="notification-btn"
            @click="
              showNotification =
                !showNotification
            "
          >
            <i
              class="ti ti-bell notification-icon"
            />

            <!-- Red Dot -->
            <span
              v-if="hasNotification"
              class="notification-dot"
            />
          </div>

          <!-- Dropdown -->
          <div
            v-if="showNotification"
            class="notification-dropdown"
          >

            <div
              class="notification-header"
            >
              แจ้งเตือนระบบ
            </div>

            <!-- Empty -->
            <div
              v-if="
                abnormalAlerts.length === 0
              "
              class="notification-empty"
            >
              ไม่มีแจ้งเตือน
            </div>

            <!-- Alert List -->
            <div
              v-for="item in abnormalAlerts"
              :key="item.id"
              class="notification-item"
            >

              <div
                class="notification-level"
                :class="item.level"
              />

              <div
                class="notification-content"
              >

                <div
                  class="notification-title"
                >
                  {{ item.title }}
                </div>

                <div
                  class="notification-sub"
                >
                  {{ item.sub }}
                </div>

              </div>

            </div>

            <!-- View All -->
            <button
              class="view-all-btn"
              @click="
                currentPage = 'alerts'
                showNotification = false;
              "
            >
              ดูทั้งหมด
            </button>

          </div>

        </div>

        <!-- Avatar -->
        <div class="profile-avatar">
          A
        </div>

      </div>

    </header>

    <!-- Main -->
    <main class="main-content">
      <Transition
        name="page"
        mode="out-in"
      >
        <component
          :is="pageComponent"
          :key="currentPage"
          @login-success="
            handleLoginSuccess
          "
        />
      </Transition>
    </main>

  </div>

  <!-- Login -->
  <div
    v-else
    class="login-layout"
  >
    <Transition
      name="page"
      mode="out-in"
    >
      <component
        :is="pageComponent"
        @login-success="
          handleLoginSuccess
        "
      />
    </Transition>
  </div>
</template>

<style scoped>

/* Login */

.login-layout {
  width: 100vw;

  height: 100vh;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #f4f6f9;
}

/* =========================
   Notification
========================= */

.notification-wrapper {
  position: relative;
}

.notification-btn {
  position: relative;

  width: 36px;
  height: 36px;

  border-radius: 10px;

  display: flex;

  align-items: center;

  justify-content: center;

  cursor: pointer;

  transition: background .2s ease;
}

.notification-btn:hover {
  background: #f3f4f6;
}

.notification-icon {
  font-size: 20px;

  color: #4b5563;
}

/* Red Dot */

.notification-dot {
  position: absolute;

  top: 7px;
  right: 8px;

  width: 10px;
  height: 10px;

  border-radius: 50%;

  background: #ef4444;

  border: 2px solid white;
}

/* Dropdown */

.notification-dropdown {
  position: absolute;

  top: 46px;
  right: 0;

  width: 320px;

  background: white;

  border-radius: 16px;

  border: 1px solid #e5e7eb;

  padding: 12px;

  z-index: 999;

  box-shadow:
    0 10px 30px rgba(0,0,0,.08);
}

.notification-header {
  font-size: 15px;

  font-weight: 600;

  margin-bottom: 10px;

  color: #111827;
}

.notification-empty {
  text-align: center;

  padding: 20px 0;

  color: #9ca3af;

  font-size: 13px;
}

.notification-item {
  display: flex;

  gap: 10px;

  padding: 10px 6px;

  border-radius: 10px;

  transition: background .2s ease;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-level {
  width: 10px;

  height: 10px;

  border-radius: 50%;

  margin-top: 6px;

  flex-shrink: 0;
}

.notification-level.alert {
  background: #ef4444;
}

.notification-level.warning {
  background: #f59e0b;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 13px;

  font-weight: 600;

  color: #111827;
}

.notification-sub {
  font-size: 12px;

  color: #6b7280;

  margin-top: 2px;
}

.view-all-btn {
  width: 100%;

  height: 38px;

  margin-top: 10px;

  border: none;

  border-radius: 10px;

  background: #2563eb;

  color: white;

  font-size: 13px;

  font-weight: 600;

  cursor: pointer;
}

/* Avatar */

.profile-avatar {
  width: 32px;

  height: 32px;

  border-radius: 50%;

  background:
    var(--color-green-bg);

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 13px;

  font-weight: 600;

  color:
    var(--color-green-text);

  cursor: pointer;
}

</style>