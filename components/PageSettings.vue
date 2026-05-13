<template>
  <div style="display:flex;flex-direction:column;gap:16px">

    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="ti ti-settings" /> ตั้งค่าระบบ</div>
      </div>

      <div class="setting-row">
        <div class="setting-label">
          อัตราค่าไฟฟ้า (บาท/kWh)
          <span>{{ rate.toFixed(2) }}</span>
        </div>
        <input type="range" min="3" max="8" step="0.1" v-model.number="rate" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          ต้นทุนติดตั้ง (บาท)
          <span>{{ installCost.toLocaleString() }}</span>
        </div>
        <input type="range" min="10000" max="100000" step="1000" v-model.number="installCost" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          ขีดจำกัดกระแส Max (A)
          <span>{{ maxCurrent }}</span>
        </div>
        <input type="range" min="50" max="200" step="5" v-model.number="maxCurrent" />
      </div>

      <div class="setting-row">
        <div class="setting-label">
          Power Factor เกณฑ์ขั้นต่ำ
          <span>{{ minPf.toFixed(2) }}</span>
        </div>
        <input type="range" min="0.8" max="1.0" step="0.01" v-model.number="minPf" />
      </div>

      <div class="result-box">
        <div class="result-box-label">ระยะคืนทุนโดยประมาณ</div>
        <div class="result-box-val">{{ breakeven }} เดือน</div>
        <div style="font-size:11px;color:var(--color-green-text);margin-top:4px">
          ประหยัดได้ ≈ {{ saving.toLocaleString() }} บาท/เดือน
        </div>
      </div>
    </div>

    <!-- API Endpoint placeholder -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="ti ti-plug" /> การเชื่อมต่อ API</div>
        <span style="font-size:11px;background:var(--color-amber-bg);color:var(--color-amber-text);padding:3px 10px;border-radius:20px">Mock Mode</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="setting-row" style="margin-bottom:0">
          <div class="setting-label" style="margin-bottom:6px">API Base URL</div>
          <input
            type="text"
            placeholder="https://your-api.example.com/v1"
            style="width:100%;padding:8px 12px;border:1px solid var(--color-border-md);border-radius:var(--radius-md);font-family:var(--font-mono);font-size:12px;color:var(--color-text-2);background:var(--color-bg)"
          />
        </div>
        <div class="setting-row" style="margin-bottom:0">
          <div class="setting-label" style="margin-bottom:6px">API Key</div>
          <input
            type="password"
            placeholder="••••••••••••••••"
            style="width:100%;padding:8px 12px;border:1px solid var(--color-border-md);border-radius:var(--radius-md);font-family:var(--font-mono);font-size:12px;color:var(--color-text-2);background:var(--color-bg)"
          />
        </div>
        <div style="font-size:11px;color:var(--color-text-3);background:var(--color-bg);border-radius:var(--radius-md);padding:10px 12px;font-family:var(--font-mono)">
          <!-- Swap useMockData() → useApiData() ใน composables เมื่อพร้อม connect จริง -->
          💡 เพื่อเชื่อม API จริง: แก้ไข <code>composables/useMockData.ts</code> แต่ละ function ให้ fetch endpoint จริง
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const rate        = ref(5)
const installCost = ref(25000)
const maxCurrent  = ref(75)
const minPf       = ref(0.9)

const saving = computed(() => Math.round(installCost.value * 0.0551 * (rate.value / 5)))
const breakeven = computed(() => (installCost.value / saving.value).toFixed(1))
</script>
