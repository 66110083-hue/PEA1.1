<script setup lang="ts">
import { useSettings } from '~/composables/useSettings'
import UserTab from '~/components/PageSettings/UserTab.vue'
import LimiterTab from '~/components/PageSettings/LimiterTab.vue'
import UserModal from '~/components/PageSettings/UserModal.vue'

const { activeTab } = useSettings()
</script>

<template>
  <div class="settings-page">
    
    <div class="settings-header">
      <h2 class="page-title"><i class="ti ti-settings" /> Setting</h2>
      <div class="settings-tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'user' }" @click="activeTab = 'user'">
          User
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'limiter' }" @click="activeTab = 'limiter'">
          Limiter
        </button>
      </div>
    </div>

    <UserTab v-if="activeTab === 'user'" />
    <LimiterTab v-if="activeTab === 'limiter'" />

    <UserModal />

  </div>
</template>



<style>
/* เอา scoped ออก เพื่อให้ CSS สวยงามแผ่ขยายสไตล์ไปยังลูกๆ ทั้งหมดได้ครับ */
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.settings-header { display: flex; flex-direction: column; gap: 16px; }
.page-title { margin: 0; font-size: 20px; color: var(--color-text-1); display: flex; align-items: center; gap: 8px; }
.settings-tabs { display: flex; gap: 20px; border-bottom: 2px solid var(--color-border); }
.tab-btn { background: none; border: none; padding: 10px 4px; font-size: 14px; font-weight: 600; color: var(--color-text-3); cursor: pointer; position: relative; font-family: var(--font-sans); }
.tab-btn.active { color: #378ADD; }
.tab-btn.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: #378ADD; }
.tab-content { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 16px; }
.search-box { position: relative; width: 300px; }
.search-box i { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--color-text-3); }
.search-box input { width: 100%; padding: 8px 10px 8px 32px; border: 1px solid var(--color-border-md); border-radius: 6px; outline: none; font-family: var(--font-sans); }
.sg-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sg-table th { background: #f4f5f7; padding: 12px; text-align: left; color: var(--color-text-2); font-weight: 600; border-bottom: 1px solid var(--color-border); }
.sg-table td { padding: 12px; border-bottom: 1px solid var(--color-border); color: var(--color-text-1); }
.role-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.role-badge.admin { background: #E6F1FB; color: #185FA5; }
.role-badge.viewer { background: #f4f5f7; color: #5a6072; }
.action-btn { border: none; border-radius: 4px; padding: 6px 8px; margin: 0 4px; cursor: pointer; transition: opacity 0.2s; }
.action-btn:hover { opacity: 0.8; }
.action-btn.edit { background: #fef08a; color: #a16207; }
.action-btn.delete { background: #fecdd3; color: #be123c; }
.sg-btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; display: flex; align-items: center; gap: 6px; }
.sg-btn-primary { background: #378ADD; color: white; }
.sg-btn-outline { background: #f4f5f7; color: var(--color-text-2); border: 1px solid var(--color-border-md); }
.limiter-header { display: flex; align-items: center; gap: 40px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--color-border); }
.device-select label { display: block; font-size: 12px; color: var(--color-text-2); margin-bottom: 6px; }
.device-select select { padding: 8px 12px; border: 1px solid var(--color-border-md); border-radius: 6px; width: 200px; }
.toggle-group { display: flex; align-items: center; gap: 10px; }
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: #1D9E75; }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }
.toggle-label { font-weight: 600; color: var(--color-text-3); font-size: 14px;}
.toggle-label.active { color: #1D9E75; }
.threshold-sections.disabled { opacity: 0.5; pointer-events: none; }
.th-box { border: 1px solid var(--color-border); border-radius: 8px; padding: 20px; margin-bottom: 20px; background: #fafafa; }
.th-box-title { font-weight: 600; color: #378ADD; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.th-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.th-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.th-hint { font-size: 11px; color: var(--color-text-3); margin-top: 10px; }
.sg-field { display: flex; flex-direction: column; gap: 6px; }
.sg-field label { font-size: 12px; font-weight: 500; color: var(--color-text-2); }
.sg-field input, .sg-field select { padding: 8px 12px; border: 1px solid var(--color-border-md); border-radius: 6px; outline: none; font-family: var(--font-sans); }
.sg-field input:focus, .sg-field select:focus { border-color: #378ADD; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { background: white; width: 400px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--color-border); }
.modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--color-text-2); }
.modal-body { padding: 20px; }
</style>