import { useChart, baseOpts } from '~/composables/useChart'
import type { Ref } from 'vue'

export const useEnergyChart = (canvasId: string, allData: Ref<any[]>, activeMetric: Ref<string>, activePhases: Ref<string[]>, PHASES: any) => {
  const buildConfig = () => {
    const metricKey = activeMetric.value
    return {
      type: 'line' as const,
      data: {
        labels: allData.value.map(d => d.label),
        datasets: PHASES.filter((p: any) => activePhases.value.includes(p.id)).map((p: any) => ({
          label: `Phase ${p.id}`,
          data: allData.value.map(d => d[metricKey]?.[p.id] ?? 0), 
          borderColor: p.color,
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.3,
          fill: false,
        }))
      },
      options: {
        ...baseOpts(),
        animation: false,
        maintainAspectRatio: false,
        parsing: true, 
        scales: {
          x: {
            grid: { display: false },
            ticks: { autoSkip: true, maxTicksLimit: 10, font: { size: 10 } }
          },
          y: {
            beginAtZero: false,
            ticks: { font: { family: 'IBM Plex Mono', size: 11 } }
          }
        },
        plugins: {
          legend: { display: false }, // ปิดแถบ Phase A, B, C ด้านบนกราฟ
          tooltip: { mode: 'index' as const, intersect: false }
        }
      }
    }
  }

  const { init, getInstance } = useChart(canvasId, buildConfig)

  const refreshChart = () => {
    const chart = getInstance()
    if (chart) {
      const config = buildConfig()
      chart.data = config.data
      chart.options = config.options 
      chart.update('none')
    }
  }

  return { init, refreshChart }
}