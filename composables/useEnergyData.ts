// composables/useEnergyData.ts
import { ref, computed } from 'vue'
import { allSites } from '~/composables/useSiteData' // ดึงข้อมูลดิบรายชื่อไซต์มาใช้งาน

// ─── ประกาศตัวแปรไว้นอกฟังก์ชันเพื่อเป็น Global State (แชร์ข้อมูลร่วมกันทุกหน้า) ───
const selectedSiteId = ref<string>('M-01') // ไอดีไซต์ที่กำลังเลือกดูอยู่ปัจจุบัน
const allRealtimeData = ref<Record<string, any>>({}) // ถังเก็บค่าไฟฟ้าเรียลไทม์ของทุกไซต์
let isTimerStarted = false

// ฟังก์ชันช่วยสุ่มตัวเลขไฟฟ้าให้แกว่งขึ้นลงแบบธรรมชาติ
const rnd = (base: number, range: number) => +(base + (Math.random() - 0.5) * range).toFixed(3)

// ─── เริ่มต้นสร้างข้อมูลจำลองให้กับทุกไซต์ (ทำครั้งแรกครั้งเดียว) ───
allSites.forEach(site => {
  allRealtimeData.value[site.id] = {
    voltageA: rnd(235, 8),
    voltageB: rnd(225, 8),
    voltageC: rnd(219, 8),
    currentA: site.status === 'offline' ? 0 : rnd(120, 20),
    currentB: site.status === 'offline' ? 0 : rnd(132, 20),
    currentC: site.status === 'offline' ? 0 : rnd(140, 20),
    frequency: rnd(49.8, 0.4),
    activePowerImportA: site.status === 'offline' ? 0 : rnd(1.7, 0.5),
    activePowerImportB: site.status === 'offline' ? 0 : rnd(0, 0.1),
    activePowerImportC: site.status === 'offline' ? 0 : rnd(84, 5),
    totalActivePowerImport: site.kw, // ซิงค์ค่า kW มาจากฐานข้อมูลเดี่ยวใน usesitedata
    reactivePowerImportA: rnd(2, 0.5),
    reactivePowerImportB: rnd(1.2, 0.3),
    reactivePowerImportC: rnd(5.9, 1),
    totalReactivePowerImport: rnd(29, 3),
    apparentPowerA: rnd(25, 2),
    apparentPowerB: rnd(23, 2),
    apparentPowerC: rnd(23, 2),
    totalApparentPower: rnd(76, 5),
    activePowerExportA: 0,
    activePowerExportB: 0,
    activePowerExportC: 0,
    totalActivePowerExport: 0,
    reactivePowerExportA: 0,
    reactivePowerExportB: 0,
    reactivePowerExportC: 0,
    totalReactivePowerExport: 0,
    powerFactorA: rnd(0.94, 0.02),
    powerFactorB: rnd(0.94, 0.02),
    powerFactorC: rnd(0.49, 0.05),
    totalPowerFactor: rnd(1.07, 0.03),
    importActiveEnergy: rnd(73, 2),
    distributionTransformerLoadRatio: rnd(96, 2),
    negativeSequenceCurrentRatio: rnd(0.42, 0.05)
  }
})

// ─── เปิดระบบสุ่มค่าไฟแกว่ง (Jitter) ทุกๆ 3 วินาที ───
if (!isTimerStarted && typeof window !== 'undefined') {
  setInterval(() => {
    allSites.forEach(site => {
      if (site.status !== 'offline') {
        const data = allRealtimeData.value[site.id]
        data.voltageA = rnd(data.voltageA, 1.5)
        data.voltageB = rnd(data.voltageB, 1.5)
        data.voltageC = rnd(data.voltageC, 1.5)
        data.currentA = rnd(data.currentA, 4)
        data.currentB = rnd(data.currentB, 4)
        data.currentC = rnd(data.currentC, 4)
        data.frequency = rnd(50, 0.05)
        // สุ่มให้ค่าขยับสอดคล้องกับพารามิเตอร์อื่นๆ ย่อยๆ
        if (data.activePowerImportA > 0) data.activePowerImportA = rnd(data.activePowerImportA, 0.1)
        if (data.activePowerImportC > 0) data.activePowerImportC = rnd(data.activePowerImportC, 1)
      }
    })
  }, 3000)
  isTimerStarted = true
}

// ─── ฟังก์ชันที่ส่งออกไปใช้งานภายนอก ───
export function useEnergyData() {
  
  // ฟังก์ชันสลับไซต์ (เมื่อหน้าอื่นกดเรียกใช้ ค่าจะซิงค์มาที่นี่ทันที)
  function selectSite(id: string) {
    selectedSiteId.value = id
  }

  // ดึงข้อมูลไซต์หลัก (จับคู่ไอดีปัจจุบัน)
  const currentSiteInfo = computed(() => {
    return allSites.find(s => s.id === selectedSiteId.value)
  })

  // ดึงข้อมูลไฟฟ้าสุ่มเรียลไทม์
  const currentElectricData = computed(() => {
    return allRealtimeData.value[selectedSiteId.value] || {}
  })

  // ประกอบร่างข้อมูลส่งออกไปพ่นบนหน้า transformdetail.vue
  const activeTransformerDetail = computed(() => {
    const info = currentSiteInfo.value
    const electric = currentElectricData.value
    if (!info) return null

    return {
      status: info.status,
      deviceId: `0AC${info.id}C2026000${info.id}`,
      peaNo: `PEA-${info.id}-${info.province}`,
      brand: 'VICA TRANS',
      rated: 160,
      ratedCT: 300,
      commType: '4G Cellular',
      ipSim: `10.16.22.${info.id.replace('M-', '10')}`,
      lat: info.lat,
      long: info.lng, // ซิงค์แก้คำสะกดจาก lng เป็น long ให้เข้ากับหน้าดีเทล
      location: info.name,
      meter1Phase: 30,
      meter3Phase: 10,
      total: info.kw,
      installDate: '2025-05-11',
      maxLoad: 80,
      maxFundAI: 25,
      maxFundAIPercent: 15,
      ...electric // ยัดไส้ค่าไฟฟ้าเรียลไทม์ทั้งหมดเข้าไปด้วย
    }
  })

  return {
    selectedSiteId,
    allSites,
    selectSite,
    activeTransformerDetail
  }
}