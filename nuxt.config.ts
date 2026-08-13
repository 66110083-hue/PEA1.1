export default defineNuxtConfig({
  // ─── ยุบรวม app ไว้ที่เดียวกัน ───
  app: {
    baseURL: '/platform/',
    head: {
      title: 'PEA-Balance Building',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css'
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/gh/theLoop/themify-icons@master/css/themify-icons.css'
        }
      ]
    }
  },

  // เพิ่มส่วน devServer เข้ามาเพื่อให้มือถือในวง Wi-Fi เดียวกันเข้ามาดูได้
  devServer: {
    host: '0.0.0.0', 
    port: 3030
  },

  // ─── Runtime Config สำหรับดึงค่าจาก .env หรือ Docker Env ───
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'https://greatways.net',
      mapTileUrl: process.env.MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      
      // 🔥 เพิ่ม 2 ตัวแปรนี้เข้ามาเพื่อให้สลับโหมดผ่าน Docker ได้ทันที
      maintenanceMode: process.env.VITE_MAINTENANCE_MODE || 'false',
      guestMode: process.env.VITE_GUEST_MODE || 'false',
    }
  },

  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: []
})