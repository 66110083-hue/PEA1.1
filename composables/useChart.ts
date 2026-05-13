// composables/useChart.ts
import { onMounted, onBeforeUnmount, type Ref } from 'vue'

export function useChart(canvasId: string, config: () => any) {
  let chartInstance: any = null

  async function init() {
    if (import.meta.server) return
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)

    const el = document.getElementById(canvasId) as HTMLCanvasElement
    if (!el) return

    if (chartInstance) { chartInstance.destroy(); chartInstance = null }

    chartInstance = new Chart(el, config())
  }

  function destroy() {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  }

  function update(newConfig: any) {
    if (!chartInstance) return
    chartInstance.data = newConfig.data
    chartInstance.update()
  }

  onBeforeUnmount(destroy)

  return { init, destroy, update, getInstance: () => chartInstance }
}

// Shared chart options factory
export function baseOpts(overrides = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#111318',
        bodyColor: '#5a6072',
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: { font: { size: 10, family: 'IBM Plex Mono' }, color: '#9aa0b0', maxRotation: 0 }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: { font: { size: 10, family: 'IBM Plex Mono' }, color: '#9aa0b0' }
      }
    },
    ...overrides,
  }
}
