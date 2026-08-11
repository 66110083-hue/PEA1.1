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
const hasNotification = computed(() => abnormalAlerts.value.length > 0)

// เมนู
const navMain = [
  { to: '/overview',    label: 'ภาพรวม',       icon: 'ti-layout-dashboard' },
  { to: '/transformer', label: 'จัดการหม้อแปลง',  icon: 'ti-bolt' },
  { to: '/alerts',      label: 'การแจ้งเตือน',    icon: 'ti-bell-ringing' },
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
          <div class="sidebar-logo-sub">Balance Building</div>
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
        
        <!-- เปลี่ยนตรงนี้ในส่วนของ Topbar -->
<div class="notification-wrapper">
  <!-- ปุ่มกระดิ่งพร้อมจุดแดง -->
  <div class="notification-btn" @click="showNotification = !showNotification; showProfileMenu = false">
    <i class="ti ti-bell" style="font-size: 22px;"></i>
    <span v-if="hasNotification" class="notification-dot"></span>
  </div>

  <!-- Popup สวยๆ -->
  <div v-if="showNotification" class="notification-popup">
    <div class="popup-header">
      <span>การแจ้งเตือน</span>
      <span v-if="hasNotification" class="badge-count">{{ abnormalAlerts.length }}</span>
    </div>
    
    <div class="popup-scroll">
      <div v-if="hasNotification">
        <NuxtLink v-for="alert in abnormalAlerts" :key="alert.id" to="/alerts" class="popup-item" @click="showNotification = false">
          <div class="icon-box">
             <i class="ti ti-alert-circle"></i>
          </div>
          <div class="content">
            <div class="title">{{ alert.title }}</div>
            <div class="time">{{ alert.time }}</div>
          </div>
        </NuxtLink>
      </div>
      <div v-else class="popup-empty">ไม่มีการแจ้งเตือนใหม่</div>
    </div>

    <NuxtLink to="/alerts" class="popup-footer" @click="showNotification = false">
      ดูทั้งหมด <i class="ti ti-arrow-right" style="margin-left: 5px;"></i>
    </NuxtLink>
  </div>
</div>

        <div class="profile-wrapper">
          <div class="profile-avatar" @click="showProfileMenu = !showProfileMenu; showNotification = false">A</div>
          <div v-if="showProfileMenu" class="profile-dropdown">
            <button class="profile-dropdown-item danger" @click="handleLogout">ออกจากระบบ</button>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* เพิ่ม CSS สำหรับจุดแจ้งเตือน */
.notification-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.notification-btn {
  cursor: pointer;
  padding: 8px;
  color: #666;
  text-decoration: none;
  font-size: 20px;
  position: relative;
}

.notification-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  background-color: #e24b4a;
  border-radius: 50%;
  border: 2px solid #ffffff;
}
.notification-wrapper { position: relative; }
.notification-popup {
  position: absolute;
  top: 40px;
  right: 0;
  width: 250px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 999;
}
.popup-header { padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: bold; }
.popup-item { display: block; padding: 8px 12px; text-decoration: none; color: #333; font-size: 13px; }
.popup-item:hover { background: #f0f0f0; }
.popup-footer { display: block; padding: 8px; text-align: center; font-size: 12px; color: blue; text-decoration: none; border-top: 1px solid #eee; }
.popup-empty { padding: 10px; text-align: center; color: #999; font-size: 12px; }
.notification-wrapper { position: relative; display: flex; align-items: center; }
.notification-btn { cursor: pointer; color: #444; position: relative; transition: 0.2s; }
.notification-btn:hover { color: #800080; }

.notification-dot { 
  position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; 
  background: #E24B4A; border-radius: 50%; border: 2px solid white; 
}

.notification-popup { 
  position: absolute; top: 50px; right: 0; width: 320px; background: white; 
  border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
  z-index: 1000; overflow: hidden; border: 1px solid #eee;
}
.popup-header { 
  padding: 15px; font-weight: bold; border-bottom: 1px solid #f0f0f0; 
  display: flex; justify-content: space-between; align-items: center; 
}
.badge-count { background: #E24B4A; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; }
.popup-scroll { max-height: 300px; overflow-y: auto; }
.popup-item { 
  display: flex; align-items: center; padding: 12px 15px; gap: 12px; 
  text-decoration: none; color: #333; border-bottom: 1px solid #f9f9f9; 
}
.popup-item:hover { background: #fdfafdfa; }
.icon-box { background: #fff0f0; color: #E24B4A; padding: 8px; border-radius: 8px; font-size: 16px; }
.title { font-size: 13px; font-weight: 600; }
.time { font-size: 11px; color: #888; }
.popup-footer { 
  display: block; text-align: center; padding: 12px; color: #800080; 
  font-size: 13px; font-weight: bold; text-decoration: none; border-top: 1px solid #f0f0f0; 
}
.popup-empty { padding: 30px; text-align: center; color: #999; font-size: 13px; }
</style>