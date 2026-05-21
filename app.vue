<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'

const isLoggedIn  = ref(false)
const currentPage = ref('login')
const showMenu    = ref(false)

const navMain = [
  { to: 'overview',    label: 'ภาพรวม',         icon: 'ti-layout-dashboard' },
  { to: 'transformer', label: 'จัดการหม้อแปลง',  icon: 'ti-bolt'             },
  { to: 'alerts',      label: 'การแจ้งเตือน',     icon: 'ti-bell-ringing'     },
]

const navAnalysis = [
  { to: 'history',   label: 'ข้อมูลย้อนหลัง', icon: 'ti-history'    },
  { to: 'breakeven', label: 'จุดคุ้มทุน',      icon: 'ti-calculator' },
]

const navSystem = [
  { to: 'settings', label: 'ตั้งค่าระบบ', icon: 'ti-settings' },
]

const pageMap: Record<string, any> = {
  login:       defineAsyncComponent(() => import('~/Pages/PageLogin.vue')),
  overview:    defineAsyncComponent(() => import('~/Pages/PageOverview.vue')),
  alerts:      defineAsyncComponent(() => import('~/Pages/PageAlerts.vue')),
  history:     defineAsyncComponent(() => import('~/Pages/PageHistory.vue')),
  breakeven:   defineAsyncComponent(() => import('~/Pages/PageBreakeven.vue')),
  settings:    defineAsyncComponent(() => import('~/Pages/PageSettings.vue')),
  transformer: defineAsyncComponent(() => import('~/Pages/PageTransformerManagement.vue')),
}

const pageComponent = computed(() => pageMap[currentPage.value] ?? pageMap.overview)

const handleLoginSuccess = () => {
  localStorage.setItem('isLoggedIn', 'true')
  isLoggedIn.value  = true
  currentPage.value = 'overview'
}

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  isLoggedIn.value  = false
  currentPage.value = 'login'
  showMenu.value    = false
}

const clock = ref('')
let clockTimer: any

function updateClock() {
  clock.value = new Date().toLocaleTimeString('th-TH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

function handleOutsideClick(e: MouseEvent) {
  const wrap = document.querySelector('.avatar-wrap')
  if (wrap && !wrap.contains(e.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)

  const saved = localStorage.getItem('isLoggedIn')
  if (saved === 'true') {
    isLoggedIn.value  = true
    currentPage.value = 'overview'
  }

  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>

  <!-- ─── Layout หลัก (หลัง Login) ─── -->
  <div v-if="isLoggedIn" class="layout">

    <!-- Sidebar -->
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
        v-for="item in navMain" :key="item.to"
        class="nav-link"
        :class="{ active: currentPage === item.to }"
        @click="currentPage = item.to"
      >
        <i :class="`ti ${item.icon}`" aria-hidden="true" />
        {{ item.label }}
      </button>

      <div class="sidebar-section-label">การวิเคราะห์</div>
      <button
        v-for="item in navAnalysis" :key="item.to"
        class="nav-link"
        :class="{ active: currentPage === item.to }"
        @click="currentPage = item.to"
      >
        <i :class="`ti ${item.icon}`" aria-hidden="true" />
        {{ item.label }}
      </button>

      <div class="sidebar-section-label">ระบบ</div>
      <button
        v-for="item in navSystem" :key="item.to"
        class="nav-link"
        :class="{ active: currentPage === item.to }"
        @click="currentPage = item.to"
      >
        <i :class="`ti ${item.icon}`" aria-hidden="true" />
        {{ item.label }}
      </button>

      <!-- ─── Logout ซ้ายล่าง ─── -->
      <div class="sidebar-logout-wrap">
        <button class="nav-link sidebar-logout-btn" @click="handleLogout">
          <i class="ti ti-logout" aria-hidden="true" />
          ออกจากระบบ
        </button>
      </div>
    </aside>

    <!-- Topbar -->
    <header class="topbar">
      <div></div>
      <div class="topbar-right">
        <div class="status-badge">
          <span class="status-dot" />
          Online 26/30
        </div>
        <div class="clock-display">{{ clock }}</div>
        <i
          class="ti ti-bell"
          style="font-size:18px;color:var(--color-text-2);cursor:pointer"
          aria-hidden="true"
        />

        <!-- ─── Avatar + Dropdown ─── -->
        <div class="avatar-wrap" @click.stop="showMenu = !showMenu">
          <div class="avatar-btn">A</div>

          <Transition name="dropdown">
            <div v-if="showMenu" class="avatar-menu">
              <div class="avatar-menu-name">Admin</div>
              <div class="avatar-menu-email">admin@pea.co.th</div>
              <hr class="avatar-menu-divider" />
              <button class="avatar-menu-item logout" @click.stop="handleLogout">
                <i class="ti ti-logout" />
                ออกจากระบบ
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="main-content">
      <Transition name="page" mode="out-in">
        <component :is="pageComponent" :key="currentPage" />
      </Transition>
    </main>

  </div>

  <!-- ─── Login page ─── -->
  <div v-else class="login-layout">
    <Transition name="page" mode="out-in">
      <component :is="pageComponent" @login-success="handleLoginSuccess" />
    </Transition>
  </div>

</template>

<style scoped>
/* ─── Sidebar logout ─── */
.sidebar-logout-wrap {
  margin-top: auto;
  padding: 10px 0;
  border-top: 1px solid var(--color-border);
}

.sidebar-logout-btn {
  color: var(--color-red-text) !important;
  width: 100%;
}

.sidebar-logout-btn:hover {
  background: var(--color-red-bg) !important;
}

/* ─── Avatar ─── */
.avatar-wrap {
  position: relative;
  cursor: pointer;
  user-select: none;
}

.avatar-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-green-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-green-text);
  transition: opacity 0.12s;
}

.avatar-btn:hover { opacity: 0.85; }

/* ─── Dropdown menu ─── */
.avatar-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 8px;
  min-width: 190px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.13);
  z-index: 200;
}

.avatar-menu-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-1);
  padding: 4px 8px 2px;
}

.avatar-menu-email {
  font-size: 11px;
  color: var(--color-text-3);
  padding: 0 8px 4px;
}

.avatar-menu-divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 6px 0;
}

.avatar-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-family: var(--font-sans);
  cursor: pointer;
  color: var(--color-text-2);
  transition: background 0.12s;
  text-align: left;
}

.avatar-menu-item:hover { background: var(--color-bg); }
.avatar-menu-item.logout { color: var(--color-red); }
.avatar-menu-item.logout:hover { background: var(--color-red-bg); }

/* ─── Dropdown animation ─── */
.dropdown-enter-active,
.dropdown-leave-active { transition: opacity 0.15s, transform 0.15s; }
.dropdown-enter-from   { opacity: 0; transform: translateY(-6px); }
.dropdown-leave-to     { opacity: 0; transform: translateY(-6px); }

/* ─── Login layout ─── */
.login-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6f9;
}
</style>