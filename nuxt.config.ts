export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'PEA-Smart-Energy — ระบบติดตามพลังงาน 3 เฟส',
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
        // --- เพิ่มอันนี้เข้าไปเพื่อให้ ti-chart-line ทำงานได้ ---
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/gh/theLoop/themify-icons@master/css/themify-icons.css'
        }
      ]
    }
  },
  modules: []
})