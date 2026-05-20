<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Site } from '~/composables/useSiteData'

defineProps<{ site: Site | null }>()

// ── Auto-refresh ทุก 10 นาที ──────────────────────
const lastUpdated = ref(new Date())
let timer: ReturnType<typeof setInterval>

function refresh() {
  lastUpdated.value = new Date()
  // TODO: เรียก fetch จริง เช่น emit('refresh') หรือ store.fetchSites()
}

const lastUpdatedText = computed(() => {
  const h = String(lastUpdated.value.getHours()).padStart(2, '0')
  const m = String(lastUpdated.value.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
})

onMounted(() => {
  timer = setInterval(refresh, 10 * 60 * 1000)
})

onUnmounted(() => clearInterval(timer))
// ──────────────────────────────────────────────────

function statusLabel(s: string) {
  return { online: 'ปกติ', alert: 'แจ้งเตือน', offline: 'ออฟไลน์' }[s] ?? s
}
function statusStyle(s: string) {
  return ({
    online:  { background: 'var(--color-green-bg)',  color: 'var(--color-green-text)' },
    alert:   { background: 'var(--color-red-bg)',    color: 'var(--color-red-text)'   },
    offline: { background: 'var(--color-amber-bg)',  color: 'var(--color-amber-text)' },
  } as any)[s] ?? {}
}
</script>

<template>
  <Transition name="page">
    <div v-if="site" class="card">
      <div class="card-header">
        <div class="card-title"><i class="ti ti-info-circle" /> {{ site.name }}</div>
        <span style="font-size:11px;padding:3px 12px;border-radius:20px;font-weight:500" :style="statusStyle(site.status)">
          {{ statusLabel(site.status) }}
        </span>
      </div>
      <div class="site-info-grid">
        <div class="site-info-item">
          <div class="site-info-label">รหัสมิเตอร์</div>
          <div class="site-info-val">{{ site.id }}</div>
        </div>
        <div class="site-info-item">
          <div class="site-info-label">จังหวัด</div>
          <div class="site-info-val">{{ site.province }}</div>
        </div>
        <div class="site-info-item">
          <div class="site-info-label">เขต / อำเภอ</div>
          <div class="site-info-val">{{ site.district }}</div>
        </div>
        <div class="site-info-item">
          <div class="site-info-label">กำลังไฟฟ้า</div>
          <div class="site-info-val">{{ site.kw }} kW</div>
        </div>
        <div class="site-info-item">
          <div class="site-info-label">แรงดันเฟส A</div>
          <div class="site-info-val">{{ site.status !== 'offline' ? '220.3 V' : '—' }}</div>
        </div>
        <div class="site-info-item">
          <div class="site-info-label">อัพเดตล่าสุด</div>
          <div class="site-info-val" style="font-size:12px">
            {{ site.status !== 'offline' ? lastUpdatedText : '—' }}
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

