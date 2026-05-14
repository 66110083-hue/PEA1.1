# P2A — Energy Monitor Dashboard (Nuxt 3 Prototype)

ระบบติดตามพลังงานไฟฟ้า 3 เฟส — **Prototype พร้อม Mock Data**

## 🚀 เริ่มใช้งาน

```bash
# ติดตั้ง dependencies
npm install

# รัน dev server
npm run dev
# → http://localhost:3000
```

## 📁 โครงสร้างไฟล์

```
powervision/
├── app.vue                        # Layout หลัก + Sidebar + Topbar
├── assets/css/main.css            # Global CSS (design tokens, components)
├── composables/
│   ├── useMockData.ts             # ← Mock data ทั้งหมดอยู่ที่นี่
│   └── useChart.ts                # Chart.js helper
└── components/
    ├── ChartLegend.vue            # Legend component ใช้ร่วม
    ├── PageOverview.vue           # หน้าภาพรวม
    ├── PageMap.vue                # หน้าแผนที่จุดติดตั้ง
    ├── PageRealtime.vue           # หน้าค่าเรียลไทม์ (Live)
    ├── PageHistory.vue            # หน้าข้อมูลย้อนหลัง
    ├── PageBreakeven.vue          # หน้าจุดคุ้มทุน
    ├── PageAlerts.vue             # หน้าการแจ้งเตือน
    └── PageSettings.vue          # หน้าตั้งค่า
```

## 🔌 วิธีเชื่อม API จริง

Mock data ทั้งหมดรวมไว้ใน `composables/useMockData.ts`
แต่ละ function ตรงกับ 1 endpoint:

| Function | Endpoint ตัวอย่าง |
|---|---|
| `getSummaryMetrics()` | `GET /api/meters/summary` |
| `getLivePhase()` | `GET /api/meters/{id}/live` |
| `getHourlyData()` | `GET /api/meters/{id}/energy?period=hourly` |
| `getRealtimeData()` | `GET /api/meters/{id}/realtime` |
| `getHistoryData(period)` | `GET /api/meters/{id}/history?period=day\|month\|year` |
| `getAverages()` | `GET /api/meters/{id}/averages` |
| `getBreakevenData(cost, rate)` | `GET /api/analysis/breakeven` |
| `sites` | `GET /api/sites` |
| `alerts` | `GET /api/alerts` |

**ขั้นตอนเชื่อม:**
1. สร้าง `composables/useApiData.ts` (copy structure จาก useMockData.ts)
2. แทนที่ return values ด้วย `await $fetch('/api/...')`
3. เปลี่ยน import ในทุก Page component จาก `useMockData` → `useApiData`

## 🎨 Design Tokens

แก้ไข CSS variables ใน `assets/css/main.css`:
```css
:root {
  --color-green: #1D9E75;   /* สีหลัก */
  --sidebar-w: 228px;        /* ความกว้าง sidebar */
  --font-sans: 'IBM Plex Sans Thai', sans-serif;
}
```

## 📦 Dependencies

- `nuxt` ^3.10
- `chart.js` ^4.4 (lazy loaded client-side only)
- Tabler Icons (CDN via nuxt.config head)
- IBM Plex Sans Thai / Mono (Google Fonts)
# PEA
# PEA1.1
