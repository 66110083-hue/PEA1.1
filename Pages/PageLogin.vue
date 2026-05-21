<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const password = ref('')

const emit = defineEmits(['login-success'])

const submitLogin = () => {
  if (username.value === 'admin' && password.value === '1234') {
    emit('login-success')
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
        <h2>PEA Energy Monitor</h2>
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
   จุดแก้ไขหลัก: ใช้ fixed เพื่อตัดขาดจากระบบ layout ของหน้าอื่นที่พังอยู่
   ========================================================================== */
.fixed-login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #f4f6f9; /* สีพื้นหลัง */
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  z-index: 99999; /* เด้งมาอยู่ชั้นบนสุด */
  box-sizing: border-box;
}

/* กล่องขาวล็อกขนาดให้เป็นกล่อง ไม่ให้ขยายตัวยืดเต็มจอ */
.login-card {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px; /* ล็อกความกว้างไว้เท่านี้เสมอ */
  height: auto;     /* ปล่อยความสูงให้พอดีกับเนื้อหา ไม่ยืดเต็มจอ */
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