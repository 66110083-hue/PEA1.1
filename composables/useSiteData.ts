// 📂 composables/useSiteData.ts
import { reactive, ref } from 'vue'

// ─── 1. INTERFACES ─────────────────────────────────────────

export type SiteStatus = 'online' | 'alert' | 'offline'

export interface Site {
  id:          string
  name:        string
  img:         string
  lat:         number
  lng:         number
  status:      SiteStatus
  kw:          number
  province:    string
  district:    string
  deviceId:    string
  devSerial:   string
  devDetail:   string
  installDate: string
}

export interface Alert {
  id:       string
  siteId:   string
  province: string
  district: string
  level:    'alert' | 'warning' | 'info'
  title:    string
  sub:      string
  time:     string
}

export type TransformerStatus = 'online' | 'offline'

export interface Transformer {
  id:                 string
  siteId:             string
  siteName:           string
  status:             TransformerStatus
  deviceId:           string
  peaNo:              string
  brand:              string
  img:                string
  rated:              number
  ratedCT:            number
  commType:           string
  ipSim:              string
  lat:                number
  long:               number
  location:           string
  meter1Phase:        number
  meter3Phase:        number
  total:              number
  installDate:        string
  maxLoad:            number
  maxFundAI:          number
  maxFundAIPercent:   number
}

export interface TransformerRealtime {
  transformerId:                      string
  voltageA:                           number; voltageB: number; voltageC: number
  currentA:                           number; currentB: number; currentC: number
  frequency:                          number
  activePowerImportA:                 number; activePowerImportB: number; activePowerImportC: number
  totalActivePowerImport:             number
  activePowerExportA:                 number; activePowerExportB: number; activePowerExportC: number
  totalActivePowerExport:             number
  reactivePowerImportA:               number; reactivePowerImportB: number; reactivePowerImportC: number
  totalReactivePowerImport:           number
  reactivePowerExportA:               number; reactivePowerExportB: number; reactivePowerExportC: number
  totalReactivePowerExport:           number
  apparentPowerA:                     number; apparentPowerB: number; apparentPowerC: number
  totalApparentPower:                 number
  powerFactorA:                       number; powerFactorB: number; powerFactorC: number
  totalPowerFactor:                   number
  importActiveEnergy:                 number
  distributionTransformerLoadRatio: number
  negativeSequenceCurrentRatio:       number
}

// ─── 2. API Response Types ─────────────────────────────────

interface ApiSite        { id: number; img: string; locationXY: string; name: string }
interface ApiSiteList    { msg: ApiSite[]; status: string }

interface ApiInstallItem {
  devdetail: string; devid: string; devserial: string; img: string
  installdate: string; installid: number; installuser: string
  siteid: string; sitename: string
}
interface ApiInstallList { msg: ApiInstallItem[]; status: string }

interface ApiDevice      { id: number; serial: string; detail: string; type: string }
interface ApiDeviceList  { msg: ApiDevice[]; status: string }

interface ApiLastRecord  {
  msg: {
    data: {
      I_A: number; I_B: number; I_C: number
      V_A: number; V_B: number; V_C: number
      PF: number; P_Total: number; Q_Total: number; S_Total: number
    }
    update: string
  }
  status: string
}

// ─── 3. STATIC CONFIGS ─────────────────────────────────────

export const alertColor: Record<string, string> = {
  alert:   '#E24B4A',
  warning: '#BA7517',
  info:    '#1D9E75',
}

const TYPE_MAP: Record<string, string> = {
  '1': '4G Cellular',
  '2': 'LoRa',
}

// ─── 4. GLOBAL REACTIVE ARRAYS ─────────────────────────────

export const allSites               = reactive<Site[]>([])
export const allAlerts              = reactive<Alert[]>([])
export const allTransformers        = reactive<Transformer[]>([])
export const allTransformerRealtime = reactive<TransformerRealtime[]>([])

// ─── 5. HELPERS ────────────────────────────────────────────

function isRecentUpdate(update: string, thresholdMinutes = 15): boolean {
  if (!update) return false
  const [datePart, timePart] = update.split(' ')
  if (!datePart || !timePart) return false
  const [dd, mm, yyyy] = datePart.split('/')
  const diff = (Date.now() - new Date(`${yyyy}-${mm}-${dd}T${timePart}:00`).getTime()) / 60000
  return diff <= thresholdMinutes
}

function toNum(v: unknown): number {
  const n = parseFloat(String(v))
  return Number.isFinite(n) ? n : 0
}

// ─── 6. BUILD allAlerts จาก allSites ──────────────────────

function buildAlerts() {
  const alerts = allSites.map(s => {
    const level: 'alert' | 'warning' | 'info' =
      s.status === 'alert' ? 'alert' : s.status === 'offline' ? 'warning' : 'info'
    return {
      id:       `ALT-${s.id}`,
      siteId:   s.id,
      province: s.province,
      district: s.district,
      level,
      title:    s.status === 'alert'   ? `แรงดันผิดปกติ — ${s.name}`
               : s.status === 'offline' ? `${s.name} ออฟไลน์`
               : `${s.name} ทำงานปกติ`,
      sub:  `Site ID: ${s.id}`,
      time: s.status === 'alert'   ? '5 นาทีที่แล้ว'
           : s.status === 'offline' ? '2 ชม.ที่แล้ว'
           : 'อัปเดตล่าสุด',
    }
  })
  allAlerts.splice(0, allAlerts.length, ...alerts)
}

// ─── 7. BUILD allTransformers + allTransformerRealtime ─────

function buildTransformers(
  devices:       ApiDevice[],
  lastRecordMap: Map<string, ApiLastRecord['msg'] | null>,
  devToSite:     Map<string, string>,
  sites:         Site[],
) {
  const siteLookup = new Map<string, Site>(sites.map(s => [s.id, s]))

  const transformers: Transformer[] = devices.map((d) => {
    const devId  = String(d.id).trim()
    const siteId = devToSite.get(devId) ?? ''
    const site   = siteLookup.get(siteId) ?? null
    const lr     = lastRecordMap.get(siteId) ?? null
    const isOnline = lr ? isRecentUpdate(lr.update) : false
    const siteName = site?.name ?? '-'

    return {
      id:                String(d.id),
      siteId:            site?.id ?? '',
      siteName,
      status:            isOnline ? 'online' : 'offline',
      deviceId:          d.serial,
      peaNo:             devId,
      brand:             'Unknown',
      img:               site?.img ?? '',
      rated:             160,
      ratedCT:           250,
      commType:          TYPE_MAP[d.type] ?? d.type,
      ipSim:             '',
      lat:               site?.lat  ?? 0,
      long:              site?.lng  ?? 0,
      location:          site?.name ?? d.detail,
      meter1Phase:       0,
      meter3Phase:       0,
      total:             0,
      installDate:       site?.installDate ?? '',
      maxLoad:           80,
      maxFundAI:         0,
      maxFundAIPercent:  0,
    }
  })
  allTransformers.splice(0, allTransformers.length, ...transformers)

  const realtime: TransformerRealtime[] = transformers.map(t => {
    const lrMsg     = lastRecordMap.get(t.siteId) ?? null
    const lrData    = lrMsg?.data ?? null
    const pTotal    = lrData ? toNum(lrData.P_Total) : 0
    const pPerPhase = +(pTotal / 3).toFixed(3)
    const pf        = lrData ? toNum(lrData.PF) : 0.9
    return {
      transformerId:                        t.id,
      voltageA:                             lrData ? toNum(lrData.V_A) : 0,
      voltageB:                             lrData ? toNum(lrData.V_B) : 0,
      voltageC:                             lrData ? toNum(lrData.V_C) : 0,
      currentA:                             lrData ? toNum(lrData.I_A) : 0,
      currentB:                             lrData ? toNum(lrData.I_B) : 0,
      currentC:                             lrData ? toNum(lrData.I_C) : 0,
      frequency:                            50,
      activePowerImportA:                   pPerPhase,
      activePowerImportB:                   pPerPhase,
      activePowerImportC:                   pPerPhase,
      totalActivePowerImport:               pTotal,
      activePowerExportA:                   0, activePowerExportB: 0, activePowerExportC: 0,
      totalActivePowerExport:               0,
      reactivePowerImportA:                 +(pPerPhase * 0.3).toFixed(3),
      reactivePowerImportB:                 +(pPerPhase * 0.3).toFixed(3),
      reactivePowerImportC:                 +(pPerPhase * 0.3).toFixed(3),
      totalReactivePowerImport:             lrData ? toNum(lrData.Q_Total) : 0,
      reactivePowerExportA:                 0, reactivePowerExportB: 0, reactivePowerExportC: 0,
      totalReactivePowerExport:             0,
      apparentPowerA:                       +(pPerPhase / (pf || 1)).toFixed(3),
      apparentPowerB:                       +(pPerPhase / (pf || 1)).toFixed(3),
      apparentPowerC:                       +(pPerPhase / (pf || 1)).toFixed(3),
      totalApparentPower:                   lrData ? toNum(lrData.S_Total) : 0,
      powerFactorA:                         pf, powerFactorB: pf, powerFactorC: pf,
      totalPowerFactor:                     pf,
      importActiveEnergy:                   0,
      distributionTransformerLoadRatio: t.rated > 0 ? +((pTotal / t.rated) * 100).toFixed(2) : 0,
      negativeSequenceCurrentRatio:         0,
    }
  })
  allTransformerRealtime.splice(0, allTransformerRealtime.length, ...realtime)
}

// ─── 8. COMPOSABLES ────────────────────────────────────────

let isSiteFetched = false

export function useSiteData() {
  const isLoading = ref(false)
  const error     = ref<string | null>(null)

  // ─── ย้าย useRuntimeConfig มาไว้ข้างในฟังก์ชันหลัก ───
  const config = useRuntimeConfig()
  const BASE_URL = config.public.apiBaseUrl

  async function fetchSites() {
    if (isSiteFetched) return
    isSiteFetched = true
    isLoading.value = true
    error.value     = null

    try {
      const ok = (s: string) => ['success', 'susscess'].includes(s?.toLowerCase())

      const [listRes, installRes, deviceRes] = await Promise.all([
        fetch(`${BASE_URL}/api/site/list`),
        fetch(`${BASE_URL}/api/site/install`),
        fetch(`${BASE_URL}/api/device/list`),
      ])
      const [listData, installData, deviceData]: [ApiSiteList, ApiInstallList, ApiDeviceList] =
        await Promise.all([listRes.json(), installRes.json(), deviceRes.json()])

      if (!ok(listData.status) || !Array.isArray(listData.msg)) return

      const installLookup = new Map<string, ApiInstallItem>()
      if (ok(installData.status) && Array.isArray(installData.msg)) {
        for (const item of installData.msg) {
          const sid = String(item.siteid).trim()
          if (!installLookup.has(sid)) installLookup.set(sid, item)
        }
      }

      const siteIdsWithDevice = [...installLookup.keys()]
      const lastRecordMap = new Map<string, ApiLastRecord['msg'] | null>()
      await Promise.all(
        siteIdsWithDevice.map(async (sid) => {
          try {
            const res  = await fetch(`${BASE_URL}/api/measure/lastrecord?source=site&siteid=${sid}`)
            const data: ApiLastRecord = await res.json()
            lastRecordMap.set(sid, ok(data.status) ? data.msg : null)
          } catch {
            lastRecordMap.set(sid, null)
          }
        })
      )

      const mappedSites: Site[] = listData.msg.map((apiSite) => {
        const sid      = String(apiSite.id).trim()
        const dev      = installLookup.get(sid)
        const lr       = lastRecordMap.get(sid) ?? null
        const isOnline = lr ? isRecentUpdate(lr.update) : false
        const [latS, lngS] = apiSite.locationXY.split(',')
        return {
          id:          sid,
          name:        apiSite.name,
          img:         apiSite.img,
          lat:         parseFloat(latS?.trim()) || 0,
          lng:         parseFloat(lngS?.trim()) || 0,
          status:      isOnline ? 'online' : 'offline',
          kw:          isOnline ? toNum(lr?.data?.P_Total) : 0,
          province:    '',
          district:    '',
          deviceId:    dev?.devid       ?? '-',
          devSerial:   dev?.devserial   ?? '-',
          devDetail:   dev?.devdetail   ?? 'ไม่มีข้อมูลรายละเอียดอุปกรณ์',
          installDate: dev?.installdate ?? '-',
        }
      })

      allSites.splice(0, allSites.length, ...mappedSites)
      buildAlerts()

      if (ok(deviceData.status) && Array.isArray(deviceData.msg)) {
        const devToSite = new Map<string, string>()
        for (const [sid, item] of installLookup.entries()) {
          devToSite.set(String(item.devid).trim(), sid)
        }
        buildTransformers(deviceData.msg, lastRecordMap, devToSite, mappedSites)
      }

    } catch (err: any) {
      error.value   = err.message
      isSiteFetched = false
      console.error('[useSiteData] fetchSites failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  return { allSites, fetchSites, isLoading, error }
}

export function useTransformerData() {
  function getTransformerBySite(siteId: string)       { return allTransformers.find(t => t.siteId === siteId) }
  function getTransformerById(id: string)             { return allTransformers.find(t => t.id === id) }
  function getRealtimeById(transformerId: string)     { return allTransformerRealtime.find(r => r.transformerId === transformerId) }
  function getFullDetail(transformerId: string) {
    const transformer = getTransformerById(transformerId)
    if (!transformer) return null
    const site     = allSites.find(s => s.id === transformer.siteId)
    const realtime = getRealtimeById(transformerId)
    return { transformer, site, realtime }
  }
  return {
    allTransformers, allTransformerRealtime,
    getTransformerBySite, getTransformerById,
    getRealtimeById, getFullDetail,
  }
}