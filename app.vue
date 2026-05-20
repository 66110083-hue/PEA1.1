<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'

// 1. เพิ่มตัวแปรสำหรับเช็คสถานะการเข้าสู่ระบบ
const isLoggedIn = ref(false)

// 2. ปรับค่าเริ่มต้นของ currentPage (ถ้าล็อกอินแล้วไป overview, ถ้ายังให้ไป login)
const currentPage = ref('login')

const navMain = [
  { to: 'overview',    label: 'ภาพรวม',        icon: 'ti-layout-dashboard' },
  { to: 'transformer', label: 'จัดการหม้อแปลง',  icon: 'ti-bolt'             },
  { to: 'alerts',      label: 'การแจ้งเตือน',     icon: 'ti-bell-ringing'     },
]

const navAnalysis = [
  { to: 'history',  label: 'ข้อมูลย้อนหลัง', icon: 'ti-history' },
  { to: 'breakeven',label: 'จุดคุ้มทุน', icon: 'ti-calculator' },
]

const navSystem = [
  { to: 'settings', label: 'ตั้งค่าระบบ', icon: 'ti-settings' },
]

const pageMap: Record<string, any> = {
  // 3. เพิ่ม Component หน้า Login เข้าไปใน Map (สร้างไฟล์ PageLogin.vue ไว้ที่โฟลเดอร์ Pages ด้วยนะครับ)
  login:     defineAsyncComponent(() => import('~/Pages/PageLogin.vue')),
  overview:  defineAsyncComponent(() => import('~/Pages/PageOverview.vue')),
  alerts:    defineAsyncComponent(() => import('~/Pages/PageAlerts.vue')),
  history:   defineAsyncComponent(() => import('~/Pages/PageHistory.vue')),
  breakeven: defineAsyncComponent(() => import('~/Pages/PageBreakeven.vue')),
  settings:  defineAsyncComponent(() => import('~/Pages/PageSettings.vue')),
  transformer: defineAsyncComponent(() => import('~/Pages/PageTransformerManagement.vue')),
}

const pageComponent = computed(() => pageMap[currentPage.value] ?? pageMap.overview)

// 4. ฟังก์ชันจัดการเมื่อเข้าสู่ระบบสำเร็จ (ส่งต่อให้หน้า Login เรียกใช้)
const handleLoginSuccess = () => {
  localStorage.setItem('isLoggedIn', 'true')
  isLoggedIn.value = true
  currentPage.value = 'overview' // ล็อกอินผ่านแล้ว วาร์ปมาหน้าแรกทันที
}

// 5. ฟังก์ชันสำหรับออกจากระบบ (Log out)
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  isLoggedIn.value = false
  currentPage.value = 'login'
}

// Clock
const clock = ref('')
let clockTimer: any
function updateClock() {
  clock.value = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

onMounted(() => { 
  updateClock(); 
  clockTimer = setInterval(updateClock, 1000)
  
  // 6. ตอนเปิดเว็บมา ให้เช็คเครื่อง User ทันทีว่าเคยล็อกอินค้างไว้ไหม (ข้อมูลไม่หาย)
  const savedLoginStatus = localStorage.getItem('isLoggedIn')
  if (savedLoginStatus === 'true') {
    isLoggedIn.value = true
    currentPage.value = 'overview'
  } else {
    isLoggedIn.value = false
    currentPage.value = 'login'
  }
})

onBeforeUnmount(() => clearInterval(clockTimer))

</script>

<template>
  <!-- 
    7. ใช้ v-if แบ่งหน้าจอ: 
    - ถ้าล็อกอินแล้ว (isLoggedIn === true) ให้แสดง Layout ที่มี Sidebar + Topbar ครบชุด 
  -->
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
      
      <!-- ปุ่ม Logout เผื่ออยากใช้งาน -->
      <button class="nav-link" style="margin-top: auto; color: var(--color-red-text);" @click="handleLogout">
        <i class="ti ti-logout" /> ออกจากระบบ
      </button>
    </aside>

    <!-- Topbar -->
    <header class="topbar">
      <div class="">
        <i class="" />
      </div>
      <div class="topbar-right">
        <div class="status-badge">
          <span class="status-dot" />
          Online 26/30
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

  <!-- 
    8. ถ้ายังไม่ได้ล็อกอิน (isLoggedIn === false) ให้แสดงเฉพาะตัว Component หน้า Login โดดๆ 
    โดยส่งฟังก์ชัน handleLoginSuccess ไปให้หน้าลูกเรียกใช้ด้วยผ่าน emit หรือ props
  -->
  <div v-else class="login-layout">
    <Transition name="page" mode="out-in">
      <component :is="pageComponent" @login-success="handleLoginSuccess" />
    </Transition>
  </div>
</template>

<style scoped>
/* สไตล์เพิ่มเติมสำหรับหน้า Login เต็มจอ (คุณสามารถนำไปปรับแต่งตามดีไซน์ของ PEA ได้เลยครับ) */
.login-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6f9; /* หรือสีพื้นหลังที่ต้องการ */
}
</style>