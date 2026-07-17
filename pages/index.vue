                                                                                                 <script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// กำหนดให้หน้านี้ไม่ต้องโหลด Sidebar / Topbar ขึ้นมาระหว่างรอเช็คสถานะ
definePageMeta({
  layout: 'blank'
})

onMounted(() => {
  // ตรวจสอบสถานะการเข้าสู่ระบบจาก LocalStorage
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  // สั่งกระโดดเปลี่ยนหน้าทันที
  if (isLoggedIn) {
    router.replace('/overview')
  } else {
    router.replace('/login')
  }
})
</script>

<template>
  <div class="redirect-container">
    <div class="loader-content">
      <i class="ti ti-loader-2 spin-icon"></i>
      <div class="loading-text">กำลังพาไปยังหน้าหลัก...</div>
    </div>
  </div>
</template>

<style scoped>
.redirect-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  font-family: sans-serif;
}

.loader-content {
  text-align: center;
}

.spin-icon {
  font-size: 40px;
  color: #1D9E75;
  display: inline-block;
  margin-bottom: 12px;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>