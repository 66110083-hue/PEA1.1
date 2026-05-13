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
  'กรุงเทพมหานคร',
  'นนทบุรี',
  'ปทุมธานี',
  'เชียงใหม่',
  'เชียงราย',
  'ลำปาง',
  'ขอนแก่น',
  'อุดรธานี',
  'นครราชสีมา',
  'ชลบุรี',
  'ระยอง',
  'สุราษฎร์ธานี',
  'ภูเก็ต',
  'สงขลา',
]

export const districtsByProvince: Record<string, string[]> = {
  'กรุงเทพมหานคร': ['วัฒนา', 'คลองเตย', 'ห้วยขวาง', 'ลาดพร้าว'],
  'นนทบุรี': ['เมืองนนทบุรี', 'ปากเกร็ด', 'บางใหญ่'],
  'ปทุมธานี': ['เมืองปทุมธานี', 'ธัญบุรี', 'ลำลูกกา'],
  'เชียงใหม่': ['เมืองเชียงใหม่', 'สันทราย', 'หางดง'],
  'เชียงราย': ['เมืองเชียงราย', 'แม่สาย'],
  'ลำปาง': ['เมืองลำปาง', 'แม่เมาะ'],
  'ขอนแก่น': ['เมืองขอนแก่น', 'บ้านไผ่', 'น้ำพอง'],
  'อุดรธานี': ['เมืองอุดรธานี', 'กุมภวาปี'],
  'นครราชสีมา': ['เมืองนครราชสีมา', 'ปากช่อง', 'สูงเนิน'],
  'ชลบุรี': ['เมืองชลบุรี', 'ศรีราชา', 'บางละมุง'],
  'ระยอง': ['เมืองระยอง', 'มาบตาพุด'],
  'สุราษฎร์ธานี': ['เมืองสุราษฎร์ธานี', 'เกาะสมุย'],
  'ภูเก็ต': ['เมืองภูเก็ต', 'ถลาง'],
  'สงขลา': ['เมืองสงขลา', 'หาดใหญ่'],
}

export const allSites: Site[] = [
  { id: 'M-01', name: 'อาคาร A วัฒนา', province: 'กรุงเทพมหานคร', district: 'วัฒนา', lat: 13.7290, lng: 100.5697, status: 'online', kw: 42.1 },
  { id: 'M-02', name: 'โรงงาน B คลองเตย', province: 'กรุงเทพมหานคร', district: 'คลองเตย', lat: 13.7220, lng: 100.5630, status: 'alert', kw: 38.5 },
  { id: 'M-03', name: 'ออฟฟิศ C ห้วยขวาง', province: 'กรุงเทพมหานคร', district: 'ห้วยขวาง', lat: 13.7680, lng: 100.5750, status: 'online', kw: 30.2 },
  { id: 'M-04', name: 'ห้างฯ D ลาดพร้าว', province: 'กรุงเทพมหานคร', district: 'ลาดพร้าว', lat: 13.8020, lng: 100.5700, status: 'offline', kw: 0 },

  { id: 'M-05', name: 'นิคม E ปากเกร็ด', province: 'นนทบุรี', district: 'ปากเกร็ด', lat: 13.9100, lng: 100.4960, status: 'online', kw: 120.5 },
  { id: 'M-06', name: 'โรงงาน F เมืองนนท์', province: 'นนทบุรี', district: 'เมืองนนทบุรี', lat: 13.8621, lng: 100.5144, status: 'alert', kw: 88.0 },

  { id: 'M-07', name: 'คลังสินค้า G ธัญบุรี', province: 'ปทุมธานี', district: 'ธัญบุรี', lat: 14.0200, lng: 100.7300, status: 'online', kw: 95.3 },
  { id: 'M-08', name: 'นิคม H ลำลูกกา', province: 'ปทุมธานี', district: 'ลำลูกกา', lat: 13.9600, lng: 100.7500, status: 'online', kw: 210.0 },

  { id: 'M-09', name: 'โรงงาน I เมืองเชียงใหม่', province: 'เชียงใหม่', district: 'เมืองเชียงใหม่', lat: 18.7883, lng: 98.9853, status: 'online', kw: 75.0 },
  { id: 'M-10', name: 'นิคม J สันทราย', province: 'เชียงใหม่', district: 'สันทราย', lat: 18.8500, lng: 99.0200, status: 'alert', kw: 55.2 },

  { id: 'M-11', name: 'อาคาร K หางดง', province: 'เชียงใหม่', district: 'หางดง', lat: 18.6800, lng: 98.9200, status: 'online', kw: 33.8 },

  { id: 'M-12', name: 'โรงงาน L เมืองเชียงราย', province: 'เชียงราย', district: 'เมืองเชียงราย', lat: 19.9105, lng: 99.8406, status: 'online', kw: 61.0 },

  { id: 'M-13', name: 'ด่าน M แม่สาย', province: 'เชียงราย', district: 'แม่สาย', lat: 20.4300, lng: 99.8800, status: 'offline', kw: 0 },

  { id: 'M-14', name: 'โรงไฟฟ้า N แม่เมาะ', province: 'ลำปาง', district: 'แม่เมาะ', lat: 18.3500, lng: 99.6500, status: 'online', kw: 350.0 },

  { id: 'M-15', name: 'นิคม O เมืองขอนแก่น', province: 'ขอนแก่น', district: 'เมืองขอนแก่น', lat: 16.4419, lng: 102.8360, status: 'online', kw: 140.0 },

  { id: 'M-16', name: 'โรงงาน P บ้านไผ่', province: 'ขอนแก่น', district: 'บ้านไผ่', lat: 16.0700, lng: 102.7200, status: 'alert', kw: 48.5 },

  { id: 'M-17', name: 'โรงงาน Q น้ำพอง', province: 'ขอนแก่น', district: 'น้ำพอง', lat: 16.7200, lng: 102.8300, status: 'online', kw: 92.0 },

  { id: 'M-18', name: 'คลังสินค้า R อุดร', province: 'อุดรธานี', district: 'เมืองอุดรธานี', lat: 17.4138, lng: 102.7872, status: 'online', kw: 110.0 },

  { id: 'M-19', name: 'นิคม S โคราช', province: 'นครราชสีมา', district: 'เมืองนครราชสีมา', lat: 14.9799, lng: 102.0977, status: 'online', kw: 185.0 },

  { id: 'M-20', name: 'โรงงาน T ปากช่อง', province: 'นครราชสีมา', district: 'ปากช่อง', lat: 14.7100, lng: 101.4100, status: 'offline', kw: 0 },

  { id: 'M-21', name: 'นิคม U ศรีราชา', province: 'ชลบุรี', district: 'ศรีราชา', lat: 13.1282, lng: 100.9247, status: 'online', kw: 230.0 },

  { id: 'M-22', name: 'รีสอร์ต V พัทยา', province: 'ชลบุรี', district: 'บางละมุง', lat: 12.9236, lng: 100.8825, status: 'alert', kw: 67.0 },

  { id: 'M-23', name: 'นิคม W มาบตาพุด', province: 'ระยอง', district: 'มาบตาพุด', lat: 12.6800, lng: 101.1500, status: 'online', kw: 420.0 },

  { id: 'M-24', name: 'โรงงาน X เมืองระยอง', province: 'ระยอง', district: 'เมืองระยอง', lat: 12.6814, lng: 101.2816, status: 'online', kw: 158.0 },

  { id: 'M-25', name: 'ท่าเรือ Y สุราษฎร์', province: 'สุราษฎร์ธานี', district: 'เมืองสุราษฎร์ธานี', lat: 9.1382, lng: 99.3214, status: 'online', kw: 88.0 },

  { id: 'M-26', name: 'รีสอร์ต Z สมุย', province: 'สุราษฎร์ธานี', district: 'เกาะสมุย', lat: 9.5120, lng: 100.0136, status: 'alert', kw: 44.0 },

  { id: 'M-27', name: 'โรงแรม AA เมืองภูเก็ต', province: 'ภูเก็ต', district: 'เมืองภูเก็ต', lat: 7.8804, lng: 98.3923, status: 'online', kw: 195.0 },

  { id: 'M-28', name: 'สนามบิน BB ถลาง', province: 'ภูเก็ต', district: 'ถลาง', lat: 8.1132, lng: 98.3017, status: 'online', kw: 310.0 },

  { id: 'M-29', name: 'นิคม CC หาดใหญ่', province: 'สงขลา', district: 'หาดใหญ่', lat: 7.0086, lng: 100.4747, status: 'online', kw: 167.0 },

  { id: 'M-30', name: 'ท่าเรือ DD สงขลา', province: 'สงขลา', district: 'เมืองสงขลา', lat: 7.1986, lng: 100.5953, status: 'offline', kw: 0 },
]

export function useSiteData() {
  function getSitesByDistrict(province: string, district: string): Site[] {
    return allSites.filter(
      s => s.province === province && s.district === district
    )
  }

  function getSitesByProvince(province: string): Site[] {
    return allSites.filter(
      s => s.province === province
    )
  }

  return {
    allSites,
    provinces,
    districtsByProvince,
    getSitesByDistrict,
    getSitesByProvince,
  }
}

// ── Alerts ────────────────────────────────────────────────

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

export const alertColor: Record<string, string> = {
  alert: '#E24B4A',
  warning: '#BA7517',
  info: '#1D9E75',
}

export const allAlerts: Alert[] = allSites.map((s) => {
  const level: 'alert' | 'warning' | 'info' =
    s.status === 'alert'
      ? 'alert'
      : s.status === 'offline'
        ? 'warning'
        : 'info'

  return {
    id: `ALT-${s.id}`,
    siteId: s.id,

    province: s.province,
    district: s.district,

    level,

    title:
      s.status === 'alert'
        ? `แรงดันผิดปกติ — ${s.name}`
        : s.status === 'offline'
          ? `${s.name} ออฟไลน์`
          : `${s.name} ทำงานปกติ`,

    sub: `${s.province} › ${s.district} · ${s.id}`,

    time:
      s.status === 'alert'
        ? '5 นาทีที่แล้ว'
        : s.status === 'offline'
          ? '2 ชม.ที่แล้ว'
          : 'อัปเดตล่าสุด',
  }
})