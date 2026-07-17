<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { allAlerts } from '@/composables/useSiteData'

const router = useRouter()
const showNotification = ref(false)
const showProfileMenu = ref(false)
const clock = ref('')
let clockTimer: ReturnType<typeof setInterval> | null = null

// การแจ้งเตือน
const abnormalAlerts = computed(() => allAlerts.filter(a => a.level === 'alert' || a.level === 'warning'))
const criticalCount = computed(() => allAlerts.filter(a => a.level === 'alert').length)
const offlineCount = computed(() => allAlerts.filter(a => a.level === 'warning').length)
const hasNotification = computed(() => abnormalAlerts.value.length > 0)

// เมนู
const navMain = [
  { to: '/overview',    label: 'ภาพรวม',         icon: 'ti-layout-dashboard' },
  { to: '/transformer', label: 'จัดการหม้อแปลง',  icon: 'ti-bolt' },
  { to: '/alerts',      label: 'การแจ้งเตือน',     icon: 'ti-bell-ringing' },
]
const navAnalysis = [{ to: '/analysis', label: 'รายงานวิเคราะห์', icon: 'ti-chart-line' }]
const navSystem = [{ to: '/settings', label: 'ตั้งค่าระบบ', icon: 'ti-settings' }]

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}

function updateClock() {
  clock.value = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

onMounted(() => {
  // ดักคนยังไม่ล็อคอิน
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    router.push('/login')
  }
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
})

onBeforeUnmount(() => { if (clockTimer) clearInterval(clockTimer) })
</script>

<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon"><img src="/logo.png" alt="logo" /></div>
        <div>
          <div class="sidebar-logo-text">PEA</div>
          <div class="sidebar-logo-sub">Energy Monitor 3φ</div>
        </div>
      </div>

      <div class="sidebar-section-label">หน้าหลัก</div>
      <NuxtLink v-for="item in navMain" :key="item.to" :to="item.to" class="nav-link" active-class="active">
        <i :class="`ti ${item.icon}`"></i> {{ item.label }}
      </NuxtLink>

      <div class="sidebar-section-label">การวิเคราะห์</div>
      <NuxtLink v-for="item in navAnalysis" :key="item.to" :to="item.to" class="nav-link" active-class="active">
        <i :class="`ti ${item.icon}`"></i> {{ item.label }}
      </NuxtLink>

      <div class="sidebar-section-label">ระบบ</div>
      <NuxtLink v-for="item in navSystem" :key="item.to" :to="item.to" class="nav-link" active-class="active">
        <i :class="`ti ${item.icon}`"></i> {{ item.label }}
      </NuxtLink>

      <button class="nav-link" style="margin-top: auto; color: var(--color-red-text);" @click="handleLogout">
        <i class="ti ti-logout"></i> ออกจากระบบ
      </button>
    </aside>

    <!-- Topbar -->
    <header class="topbar">
      <div></div>
      <div class="topbar-right">
        <div class="clock-display">{{ clock }}</div>
        
        <!-- Notification (ย่อไว้เพื่อความกระชับ ใส่โค้ดเดิมของคุณได้เลย) -->
        <div class="notification-wrapper">
           <div class="notification-btn" @click="showNotification = !showNotification"><i class="ti ti-bell"></i></div>
           <!-- โค้ด Dropdown เดิมของคุณ -->
        </div>

        <div class="profile-wrapper">
          <div class="profile-avatar" @click="showProfileMenu = !showProfileMenu; showNotification = false">A</div>
          <div v-if="showProfileMenu" class="profile-dropdown">
            <button class="profile-dropdown-item danger" @click="handleLogout">ออกจากระบบ</button>
          </div>
        </div>
      </div>
    </header>

    <!-- เนื้อหาเพจจะมาโผล่ตรงนี้ -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>