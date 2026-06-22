import { reactive, ref } from 'vue'

// ─── 1. INTERFACES (อิงตามข้อมูลจริงจาก API) ─────────────────

export type SiteStatus = 'online' | 'alert' | 'offline'

export interface Site {
  id: string
  name: string
  img: string
  lat: number
  lng: number
  status: SiteStatus
  kw: number
  province: string
  district: string
  // 🟢 เพิ่มฟิลด์ใหม่สำหรับรับข้อมูลจาก API: /site/install
  deviceId: string
  devSerial: string
  devDetail: string
  installDate: string
}

export interface ApiSite {
  id: number
  img: string
  locationXY: string
  name: string
}

export interface ApiResponse {
  msg: ApiSite[]
  status: string
}

// 🟢 Interface สำหรับ API: /site/install
export interface ApiInstallItem {
  devdetail: string
  devid: string
  devserial: string
  img: string
  installdate: string
  installid: number
  installuser: string
  siteid: string
  sitename: string
}

export interface ApiInstallResponse {
  msg: ApiInstallItem[]
  status: string
}

export interface Alert {
  id: string
  siteId: string
  province: string
  district: string
  level: 'alert' | 'warning' | 'info'
  title: string
  sub: string
  time: string
}

export type TransformerStatus = 'online' | 'offline'

export interface Transformer {
  id: string
  siteId: string
  status: TransformerStatus
  deviceId: string
  peaNo: string
  brand: string
  rated: number
  ratedCT: number
  commType: string
  ipSim: string
  lat: number
  long: number
  location: string
  meter1Phase: number
  meter3Phase: number
  total: number
  installDate: string
  maxLoad: number
  maxFundAI: number
  maxFundAIPercent: number
}

export interface TransformerRealtime {
  transformerId: string
  voltageA: number; voltageB: number; voltageC: number
  currentA: number; currentB: number; currentC: number
  frequency: number
  activePowerImportA: number; activePowerImportB: number; activePowerImportC: number
  totalActivePowerImport: number
  activePowerExportA: number; activePowerExportB: number; activePowerExportC: number
  totalActivePowerExport: number
  reactivePowerImportA: number; reactivePowerImportB: number; reactivePowerImportC: number
  totalReactivePowerImport: number
  reactivePowerExportA: number; reactivePowerExportB: number; reactivePowerExportC: number
  totalReactivePowerExport: number
  apparentPowerA: number; apparentPowerB: number; apparentPowerC: number
  totalApparentPower: number
  powerFactorA: number; powerFactorB: number; powerFactorC: number
  totalPowerFactor: number
  importActiveEnergy: number
  distributionTransformerLoadRatio: number
  negativeSequenceCurrentRatio: number
}

// ─── 2. STATIC CONFIGS ─────────────────────────────────────

export const alertColor: Record<string, string> = {
  alert: '#E24B4A',
  warning: '#BA7517',
  info: '#1D9E75',
}

// ─── 3. GLOBAL REACTIVE ARRAYS ─────────────────────────────

export const allSites = reactive<Site[]>([])
export const allAlerts = reactive<Alert[]>([])
export const allTransformers = reactive<Transformer[]>([])
export const allTransformerRealtime = reactive<TransformerRealtime[]>([])

// ─── 4. ฟังก์ชันภายใน ──────────────────────────────────────

function updateDependents() {
  const alerts = allSites.map((s) => {
    const level: 'alert' | 'warning' | 'info' =
      s.status === 'alert' ? 'alert' : s.status === 'offline' ? 'warning' : 'info'
    return {
      id: `ALT-${s.id}`,
      siteId: s.id,
      province: '',
      district: '',
      level,
      title: s.status === 'alert' ? `แรงดันผิดปกติ — ${s.name}` : s.status === 'offline' ? `${s.name} ออฟไลน์` : `${s.name} ทำงานปกติ`,
      sub: `Site ID: ${s.id}`,
      time: s.status === 'alert' ? '5 นาทีที่แล้ว' : s.status === 'offline' ? '2 ชม.ที่แล้ว' : 'อัปเดตล่าสุด',
    }
  })
  allAlerts.splice(0, allAlerts.length, ...alerts)

  const transformers = allSites.map((s, i) => {
    const brands = ['VICA TRANS', 'Schneider', 'ABB', 'Siemens', 'MEIDENSHA', 'Thai-Trans']
    const comms = ['4G Cellular', '4G Cellular', 'Fiber', 'WiFi', '4G Cellular', 'Fiber']
    const ratedMap = [100, 160, 250, 315, 500, 630, 800, 1000]
    const ratedCTs = [150, 200, 300, 400, 500, 600]
    const idx = i % 6

    return {
      id: `TF-${s.id}`,
      siteId: s.id,
      status: s.status === 'offline' ? 'offline' : 'online',
      deviceId: `0AC0${(291000000 + i * 12345).toString(16).toUpperCase().padStart(10, '0')}`,
      peaNo: `${50 + (i % 14)}-${300000 + i * 1234}`,
      brand: brands[idx],
      rated: ratedMap[i % ratedMap.length],
      ratedCT: ratedCTs[idx],
      commType: comms[idx],
      ipSim: `10.${16 + Math.floor(i / 10)}.${i % 255}.${(i * 7 + 10) % 255}`,
      lat: s.lat,
      long: s.lng,
      location: s.name,
      meter1Phase: 10 + (i % 5) * 5,
      meter3Phase: 5 + (i % 4) * 3,
      total: 15 + (i % 5) * 5 + (i % 4) * 3,
      installDate: `202${3 + (i % 2)}-0${1 + (i % 9)}-${10 + (i % 19)}`,
      maxLoad: 60 + (i % 4) * 10,
      maxFundAI: 20 + (i % 3) * 5,
      maxFundAIPercent: 10 + (i % 5) * 3,
    }
  })
  allTransformers.splice(0, allTransformers.length, ...transformers)

  const realtime = allTransformers.map((t) => {
    const site = allSites.find(s => s.id === t.siteId)!
    return mockRealtime(t, site || { kw: 5, id: t.siteId })
  })
  allTransformerRealtime.splice(0, allTransformerRealtime.length, ...realtime)
}

function mockRealtime(t: Transformer, site: any): TransformerRealtime {
  const kw = site.kw || 5
  const phaseKw = kw / 3
  const current = phaseKw * 1000 / 220
  const pf = 0.88 + (t.id.charCodeAt(3) % 10) * 0.01

  return {
    transformerId: t.id,
    voltageA: 220 + (t.id.charCodeAt(4) % 20) - 10,
    voltageB: 220 + (t.id.charCodeAt(5) % 20) - 10,
    voltageC: 220 + (t.id.charCodeAt(6) % 20) - 10,
    currentA: +current.toFixed(3), currentB: +(current * 1.05).toFixed(3), currentC: +(current * 0.97).toFixed(3),
    frequency: 49.9 + Math.random() * 0.2,
    activePowerImportA: +phaseKw.toFixed(3), activePowerImportB: +(phaseKw * 1.05).toFixed(3), activePowerImportC: +(phaseKw * 0.97).toFixed(3),
    totalActivePowerImport: +kw.toFixed(3),
    activePowerExportA: 0, activePowerExportB: 0, activePowerExportC: 0, totalActivePowerExport: 0,
    reactivePowerImportA: +(phaseKw * 0.3).toFixed(3), reactivePowerImportB: +(phaseKw * 0.28).toFixed(3), reactivePowerImportC: +(phaseKw * 0.32).toFixed(3),
    totalReactivePowerImport: +(kw * 0.3).toFixed(3),
    apparentPowerA: +(phaseKw / pf).toFixed(3), apparentPowerB: +(phaseKw * 1.05 / pf).toFixed(3), apparentPowerC: +(phaseKw * 0.97 / pf).toFixed(3),
    totalApparentPower: +(kw / pf).toFixed(3),
    powerFactorA: +pf.toFixed(3), powerFactorB: +(pf - 0.01).toFixed(3), powerFactorC: +(pf + 0.01).toFixed(3), totalPowerFactor: +pf.toFixed(3),
    importActiveEnergy: +(kw * 8760 * 0.01).toFixed(1),
    distributionTransformerLoadRatio: +((kw / t.rated) * 100).toFixed(2),
    negativeSequenceCurrentRatio: +(0.2 + Math.random() * 0.5).toFixed(3),
  }
}

// ─── 5. COMPOSABLES ────────────────────────────────────────

export function useSiteData() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSites() {
    isLoading.value = true
    error.value = null

    try {
      // 🟢 1. ยิง 2 API พร้อมกันแบบ Parallel (ลดเวลาหน่วงของเว็บได้ 50%)
      const [listRes, installRes] = await Promise.all([
        fetch('https://greatways.net/api/site/list'),
        fetch('https://greatways.net/api/site/install')
      ])

      if (!listRes.ok || !installRes.ok) throw new Error('API Network Error')

      const listData: ApiResponse = await listRes.json()
      const installData: ApiInstallResponse = await installRes.json()

      const isListSuccess = ['success', 'susscess'].includes(listData.status?.toLowerCase())
      const isInstallSuccess = ['success', 'susscess'].includes(installData.status?.toLowerCase())

      if (isListSuccess && listData.msg) {
        
        // 🟢 2. สร้าง Lookup Map ของข้อมูลอุปกรณ์ (เอา siteid เป็น Key)
        // เพื่อที่ตอน Map จะได้ไม่ต้องกด .find() วนลูปซ้ำซ้อนให้กิน CPU
        const installLookup = new Map<string, ApiInstallItem>()
        if (isInstallSuccess && Array.isArray(installData.msg)) {
          for (const item of installData.msg) {
            installLookup.set(String(item.siteid).trim(), item)
          }
        }

        const mappedSites = listData.msg.map((apiSite, index) => {
          const siteIdStr = String(apiSite.id).trim()
          
          // 🟢 3. ดึงข้อมูลอุปกรณ์ของไซต์นี้ออกมาจาก Map
          const devInfo = installLookup.get(siteIdStr)

          const [latStr, lngStr] = apiSite.locationXY.split(',')
          const lat = parseFloat(latStr?.trim()) || 0
          const lng = parseFloat(lngStr?.trim()) || 0

          const statusList: SiteStatus[] = ['online', 'alert', 'offline']
          const mockStatus = statusList[index % 3]

          return {
            id: siteIdStr, 
            name: apiSite.name,
            img: apiSite.img,
            lat,
            lng,
            status: mockStatus,
            kw: mockStatus === 'offline' ? 0 : Math.floor(Math.random() * 150) + 30,
            province: '',
            district: '',

            // 🟢 4. ประกอบร่างข้อมูลอุปกรณ์เข้าสู่ Object ของไซต์
            deviceId:    devInfo?.devid     || '-',
            devSerial:   devInfo?.devserial || '-',
            devDetail:   devInfo?.devdetail || 'ไม่มีข้อมูลรายละเอียดอุปกรณ์',
            installDate: devInfo?.installdate || '-'
          }
        })

        allSites.splice(0, allSites.length, ...mappedSites)
        updateDependents()
      }
    } catch (err: any) {
      error.value = err.message
      console.error('[fetchSites] Failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  return { allSites, fetchSites, isLoading, error }
}

export function useTransformerData() {
  function getTransformerBySite(siteId: string): Transformer | undefined {
    return allTransformers.find(t => t.siteId === siteId)
  }
  function getTransformerById(id: string): Transformer | undefined {
    return allTransformers.find(t => t.id === id)
  }
  function getRealtimeById(transformerId: string): TransformerRealtime | undefined {
    return allTransformerRealtime.find(r => r.transformerId === transformerId)
  }
  function getFullDetail(transformerId: string) {
    const transformer = getTransformerById(transformerId)
    if (!transformer) return null
    const site = allSites.find(s => s.id === transformer.siteId)
    const realtime = getRealtimeById(transformerId)
    return { transformer, site, realtime }
  }

  return {
    allTransformers, allTransformerRealtime,
    getTransformerBySite, getTransformerById,
    getRealtimeById, getFullDetail,
  }
}