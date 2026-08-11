# PEA — Energy Monitor Dashboard (Nuxt 3 Prototype)

ระบบติดตามพลังงานไฟฟ้า 3 เฟส — **Prototype พร้อม Mock Data**

## 🚀 เริ่มใช้งาน

```bash
# ติดตั้ง dependencies
npm install

# รัน dev server
npm run dev
# → http://localhost:3000
```
🐳 การรันผ่าน Docker (Environment Switching)
โปรเจกต์นี้รองรับการสลับโหมดการทำงานระหว่าง ระบบจริง และ โหมดผู้เยี่ยมชม (Guest Mode) ผ่านไฟล์ Environment โดยใช้ Nitro Server ใน Nuxt 3 เป็นตัวจำลอง API ฝั่งซ้าย

1. โหมดใช้งานจริง (Production Data)
เชื่อมต่อกับ API หลักของระบบ:
Bash
docker compose --env-file .env.real up -d --build

3. โหมดผู้เยี่ยมชม (Guest / Demo Mode)
จำลองข้อมูลผ่าน Nuxt Server API ภายใน (server/api/mock-energy.ts):

Bash
docker compose --env-file guest.env up -d --build

## 📁 โครงสร้างไฟล์

PEA1.1/
├── assets/
│   └── css/
│       ├── dashboard-compact.css
│       └── main.css
├── components/                 
├── composables/
│   ├── useAnalysisChart.ts
│   ├── useChart.ts
│   ├── useDashboard.ts
│   ├── useEnergyChart.ts
│   ├── useEnergyData.ts
│   ├── usePhaseSelection.ts
│   ├── useSettings.ts
│   ├── useSiteData.ts
│   └── useTransformer.ts
├── layouts/
│   ├── blank.vue
│   └── default.vue
├── pages/
│   ├── alerts.vue
│   ├── analysis.vue
│   ├── index.vue
│   ├── login.vue
│   ├── overview.vue
│   ├── PageBreakeven.vue
│   ├── PageMap.vue
│   └── settings.vue
├── server/
│   └── api/
│       └── mock-energy.ts      # 🟢 Nitro API สำหรับจำลองข้อมูลใน Guest Mode
├── nuxt.config.ts
└── Dockerfile / docker-compose.yml
```
การเชื่อมต่อ API หลัก (Real Endpoints)
ระบบดึงข้อมูลผ่าน Endpoint จริงของระบบ (กรณีปิด Guest Mode):
รายละเอียด,Endpoint ตัวอย่าง
รายการจุดติดตั้งทั้งหมด,GET /api/site/list
ข้อมูลอุปกรณ์ / Transformer,GET /api/device/list
บันทึกล่าสุด (Last Record),GET /api/measure/lastrecord?source=site&siteid={id}
ข้อมูลประวัติการใช้พลังงาน (กราฟ),GET /api/measure?source=site&siteid={id}&start={date}&end={date}
## 📦 Dependencies

- `nuxt` ^3.10
- `chart.js` ^4.4 (lazy loaded client-side only)
- Tabler Icons (CDN via nuxt.config head)
- IBM Plex Sans Thai / Mono (Google Fonts)
# PEA
# PEA1.1
