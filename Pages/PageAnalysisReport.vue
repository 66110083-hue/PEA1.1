<script setup lang="ts">
import { useAnalysisChart } from '@/composables/useAnalysisChart'
import AnalysisFilterCard   from '@/components/PageAnalysis/AnalysisFilterCard.vue'
import AnalysisLineChart    from '@/components/PageAnalysis/AnalysisLineChart.vue'
import AnalysisBarChart     from '@/components/PageAnalysis/AnalysisBarChart.vue'
import AnalysisChartLegend  from '@/components/PageAnalysis/AnalysisChartLegend.vue'

const {
  // state
  selectedTopic, selectedTransformer, selectedPeriod, startDate, endDate,
  isLoading, hasGenerated, chartData,
  // computed
  transformerOptions, currentSeries, selectedTopicLabel,
  // actions
  handleGenerate, handleExport,
} = useAnalysisChart()
</script>

<template>
  <div class="ar-page">

    <!-- ── Header ───────────────────────────────────── -->
    <div class="ar-header">
      <h1 class="ar-title">
        <span class="ar-title-icon"><i class="ti ti-chart-line"></i></span>
        Analysis Report
      </h1>
    </div>

    <!-- ── Filter Card ──────────────────────────────── -->
    <AnalysisFilterCard
      v-model:modelTopic="selectedTopic"
      v-model:modelTransformer="selectedTransformer"
      v-model:modelPeriod="selectedPeriod"
      v-model:modelStartDate="startDate"
      v-model:modelEndDate="endDate"
      :transformer-options="transformerOptions"
      :is-loading="isLoading"
      :has-generated="hasGenerated"
      @generate="handleGenerate"
      @export="handleExport"
    />

    <!-- ── Empty state ───────────────────────────────── -->
    <Transition name="fade">
      <div v-if="!hasGenerated && !isLoading" class="ar-empty">
        <i class="ti ti-chart-dots-3 ar-empty-icon"></i>
        <p>เลือก Transformer แล้วกด <strong>Generate</strong> เพื่อแสดงกราฟ</p>
      </div>
    </Transition>

    <!-- ── Loading ───────────────────────────────────── -->
    <Transition name="fade">
      <div v-if="isLoading" class="ar-empty">
        <i class="ti ti-loader-2 ar-empty-icon spin"></i>
        <p>กำลังโหลดข้อมูล…</p>
      </div>
    </Transition>

    <!-- ── Chart Card ────────────────────────────────── -->
    <Transition name="fade">
      <div v-if="hasGenerated && chartData.length" class="ar-card ar-chart-card">

        <div class="ar-chart-title">{{ selectedTopicLabel }}</div>

        <AnalysisChartLegend :series="currentSeries" />

        <!-- Line chart: EV / PV / CU -->
        <AnalysisLineChart
          v-if="selectedTopic !== 'loss'"
          :series="currentSeries"
          :chart-data="chartData"
        />

        <!-- Bar chart: Loss Non-Technical -->
        <AnalysisBarChart
          v-else
          :series="currentSeries"
          :chart-data="chartData"
        />

      </div>
    </Transition>

  </div>
</template>

<style scoped>
.ar-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  box-sizing: border-box;
}

/* Header */
.ar-header { display: flex; align-items: center; }
.ar-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-1, #111827);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}
.ar-title-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--color-primary, #1D9E75);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  flex-shrink: 0;
}

/* Chart card */
.ar-card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  padding: 20px;
}
.ar-chart-card { display: flex; flex-direction: column; gap: 14px; }
.ar-chart-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-1, #111827);
}

/* Empty */
.ar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-text-2, #9ca3af);
  gap: 12px;
}
.ar-empty-icon { font-size: 48px; opacity: 0.35; }
.ar-empty p    { font-size: 14px; margin: 0; }

/* Spinner */
.spin { animation: spin 0.9s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

@media (max-width: 600px) { .ar-page { padding: 16px; } }
</style>