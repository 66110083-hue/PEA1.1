<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router' // 1. เพิ่มตัวช่วยจัดการ URL ของ Nuxt

const username = ref('')
const password = ref('')
const router = useRouter() // 2. เรียกใช้งาน Router

// กำหนดให้หน้า Login ไม่ต้องมี Sidebar ของระบบมาเกะกะ
definePageMeta({
  layout: 'blank'
})

const submitLogin = () => {
  if (username.value === 'admin' && password.value === '1234') {
    // 3. บันทึกสถานะว่าล็อกอินผ่านแล้ว
    localStorage.setItem('isLoggedIn', 'true')
    
    // 4. สั่งให้เบราว์เซอร์เปลี่ยนหน้าไปที่ /overview ทันที!
    router.push('/overview')
  } else {
    alert('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง')
  }
}
</script>

<template>
  <div class="fixed-login-overlay">
    <div class="login-card">
      <div class="login-header">
        <img src="/logo.png" alt="logo" class="login-logo" />
        <h2>PEA Balance Building</h2>
        <p>กรุณาเข้าสู่ระบบเพื่อใช้งานระบบมอนิเตอร์</p>
      </div>

      <form @submit.prevent="submitLogin">
        <div class="form-group">
          <label>ชื่อผู้ใช้งาน (Username)</label>
          <input type="text" v-model="username" required placeholder="กรอกชื่อผู้ใช้งาน" />
        </div>

        <div class="form-group">
          <label>รหัสผ่าน (Password)</label>
          <input type="password" v-model="password" required placeholder="กรอกรหัสผ่าน" />
        </div>

        <button type="submit" class="btn-login">เข้าสู่ระบบ</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* ==========================================================================
   จุดแก้ไขหลัก: ใช้ fixed เพื่อตัดขาดจากระบบ layout ของหน้าอื่น
   ========================================================================== */
.fixed-login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #f4f6f9;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  z-index: 99999;
  box-sizing: border-box;
}

.login-card {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  height: auto;
  text-align: center;
  box-sizing: border-box;
}

.login-header {
  margin-bottom: 2rem;
}

.login-logo {
  width: 70px;
  height: auto;
  margin-bottom: 1rem;
}

.login-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.login-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #444;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #800080;
}

.btn-login {
  width: 100%;
  padding: 0.9rem;
  background: #800080;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.btn-login:hover {
  background: #660066;
}
</style>