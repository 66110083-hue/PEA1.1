export type SiteStatus = 'online' | 'alert' | 'offline'

export interface Site {
  id: string
  name: string
  province: string
  district: string
  lat: number
  lng: number
  status: SiteStatus
  kw: number
}

export const provinces = [
  'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'เชียงใหม่', 'เชียงราย',
  'ลำปาง', 'ขอนแก่น', 'อุดรธานี', 'นครราชสีมา', 'ชลบุรี',
  'ระยอง', 'สุราษฎร์ธานี', 'ภูเก็ต', 'สงขลา',
]

export const districtsByProvince: Record<string, string[]> = {
  'กรุงเทพมหานคร': ['วัฒนา', 'คลองเตย', 'ห้วยขวาง', 'ลาดพร้าว'],
  'นนทบุรี': ['เมืองนนทบุรี', 'ปากเกร็ด', 'บางใหญ่'],
  'ปทุมธานี': ['เมืองปทุมธานี', 'ธัญบุรี', 'ลำลูกกา'],
}

export const allSites: Site[] = [
  { id: 'M-01', name: 'อาคาร A วัฒนา',         province: 'กรุงเทพมหานคร', district: 'วัฒนา',           lat: 13.7290, lng: 100.5697, status: 'online',  kw: 42.1  },
  { id: 'M-02', name: 'โรงงาน B คลองเตย',        province: 'กรุงเทพมหานคร', district: 'คลองเตย',         lat: 13.7220, lng: 100.5630, status: 'alert',   kw: 38.5  },
  { id: 'M-03', name: 'ออฟฟิศ C ห้วยขวาง',       province: 'กรุงเทพมหานคร', district: 'ห้วยขวาง',        lat: 13.7680, lng: 100.5750, status: 'online',  kw: 30.2  },
  { id: 'M-04', name: 'ห้างฯ D ลาดพร้าว',        province: 'กรุงเทพมหานคร', district: 'ลาดพร้าว',        lat: 13.8020, lng: 100.5700, status: 'offline', kw: 0     },
  { id: 'M-05', name: 'นิคม E ปากเกร็ด',         province: 'นนทบุรี',        district: 'ปากเกร็ด',        lat: 13.9100, lng: 100.4960, status: 'online',  kw: 120.5 },
  { id: 'M-06', name: 'โรงงาน F เมืองนนท์',      province: 'นนทบุรี',        district: 'เมืองนนทบุรี',    lat: 13.8621, lng: 100.5144, status: 'alert',   kw: 88.0  },
  { id: 'M-07', name: 'คลังสินค้า G ธัญบุรี',    province: 'ปทุมธานี',       district: 'ธัญบุรี',         lat: 14.0200, lng: 100.7300, status: 'online',  kw: 95.3  },
]

export function useSiteData() {
  function getSitesByDistrict(province: string, district: string): Site[] {
    return allSites.filter(s => s.province === province && s.district === district)
  }
  return { allSites, provinces, districtsByProvince, getSitesByDistrict }
}

export interface TransformerRealtime {
  transformerId: string
  voltageA: number; voltageB: number; voltageC: number;
  currentA: number; currentB: number; currentC: number;
  frequency: number; totalActivePowerImport: number; totalApparentPower: number; totalPowerFactor: number; distributionTransformerLoadRatio: number;
}

export const allTransformerRealtime: TransformerRealtime[] = allSites.map((s, i) => ({
  transformerId:                    s.id, // ผูกเข้าหา M-01, M-02 อัตโนมัติ
  voltageA:                         221.5, voltageB: 220.2, voltageC: 219.8,
  currentA:                         s.kw ? +(s.kw * 1.5).toFixed(1) : 0,
  currentB:                         s.kw ? +(s.kw * 1.52).toFixed(1) : 0,
  currentC:                         s.kw ? +(s.kw * 1.48).toFixed(1) : 0,
  frequency:                        50.02,
  totalActivePowerImport:           s.kw,
  totalApparentPower:               s.kw ? +(s.kw / 0.85).toFixed(1) : 0,
  totalPowerFactor:                 0.88,
  distributionTransformerLoadRatio: s.kw ? +((s.kw / 160) * 100).toFixed(1) : 0
}))

export function useTransformerData() {
  function getRealtimeById(transformerId: string) { return allTransformerRealtime.find(r => r.transformerId === transformerId) }
  return { allTransformerRealtime, getRealtimeById }
}