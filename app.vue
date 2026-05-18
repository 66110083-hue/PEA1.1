<!-- app.vue -->

<script setup lang="ts">

import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'



const currentPage = ref('overview')



const navMain = [

  { to: 'overview',    label: 'ภาพรวม',          icon: 'ti-layout-dashboard' },

  { to: 'map',         label: 'แผนที่จุดติดตั้ง', icon: 'ti-map-pin'          },

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

  overview:   defineAsyncComponent(() => import('~/Pages/PageOverview.vue')),

  map:        defineAsyncComponent(() => import('~/Pages/PageMap.vue')),

  alerts:     defineAsyncComponent(() => import('~/Pages/PageAlerts.vue')),

  history:    defineAsyncComponent(() => import('~/Pages/PageHistory.vue')),

  breakeven:  defineAsyncComponent(() => import('~/Pages/PageBreakeven.vue')),

  settings:   defineAsyncComponent(() => import('~/Pages/PageSettings.vue')),

  transformer: defineAsyncComponent(() => import('~/Pages/PageTransformerManagement.vue')),

}



const pageComponent = computed(() => pageMap[currentPage.value] ?? pageMap.overview)



// Clock

const clock = ref('')

let clockTimer: any

function updateClock() {

  clock.value = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

}

onMounted(() => { updateClock(); clockTimer = setInterval(updateClock, 1000) })

onBeforeUnmount(() => clearInterval(clockTimer))

</script>



<template>
  <div class="flex min-h-screen bg-slate-50">
    <aside class="w-64 bg-[#1e1e2d] text-white flex flex-col p-5 shrink-0">
      <div class="flex items-center gap-3 pb-6 mb-5 border-b border-white/10">
        <img src="/logo.png" alt="logo" class="w-10 h-10 object-contain" />
        <div>
          <div class="text-xl font-bold tracking-wider">PEA</div>
          <div class="text-[11px] text-white/60">Energy Monitor 3φ</div>
        </div>
      </div>

      <div class="text-[11px] uppercase tracking-wider text-white/40 my-4 ml-2">หน้าหลัก</div>
      <button v-for="item in navMain" :key="item.to" @click="currentPage = item.to"
        class="flex items-center gap-3 w-full p-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition"
        :class="{ 'bg-[#1d9e75] text-white font-medium': currentPage === item.to }">
        <i :class="`ti ${item.icon} text-lg`" /> {{ item.label }}
      </button>

      <div class="text-[11px] uppercase tracking-wider text-white/40 my-4 ml-2">การวิเคราะห์</div>
      <button v-for="item in navAnalysis" :key="item.to" @click="currentPage = item.to"
        class="flex items-center gap-3 w-full p-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition"
        :class="{ 'bg-[#1d9e75] text-white font-medium': currentPage === item.to }">
        <i :class="`ti ${item.icon} text-lg`" /> {{ item.label }}
      </button>

      <div class="text-[11px] uppercase tracking-wider text-white/40 my-4 ml-2">ระบบ</div>
      <button v-for="item in navSystem" :key="item.to" @click="currentPage = item.to"
        class="flex items-center gap-3 w-full p-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition"
        :class="{ 'bg-[#1d9e75] text-white font-medium': currentPage === item.to }">
        <i :class="`ti ${item.icon} text-lg`" /> {{ item.label }}
      </button>
    </aside>

    <div class="flex flex-col flex-1 min-w-0">
      <header class="h-16 w-full flex justify-end items-center px-6 bg-white border-b border-slate-200">
        <div class="flex items-center gap-5">
          <div class="flex items-center gap-1.5 px-3 py-1 bg-[#e6f6f1] text-[#1d9e75] rounded-full text-xs font-semibold">
            <span class="w-2 h-2 bg-[#1d9e75] rounded-full" /> Online 10/12
          </div>
          <div class="font-mono text-sm text-slate-700 font-semibold">{{ clock }}</div>
          <i class="ti ti-bell text-lg text-slate-500 cursor-pointer" />
          <div class="w-8 h-8 rounded-full bg-emerald-50 text-[#1d9e75] flex items-center justify-center text-sm font-bold cursor-pointer">A</div>
        </div>
      </header>

      <main class="flex-1 p-6 overflow-y-auto">
        <Transition name="page" mode="out-in">
          <component :is="pageComponent" :key="currentPage" />
        </Transition>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* เหลือสไตล์ไว้แค่ตัวทำ Animation เปลี่ยนหน้า 6 บรรทัดถ้วนครับ ส่วนอื่นลบทิ้งได้หมดเลย */
.page-enter-active, .page-leave-active { transition: opacity 0.15s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
</style>