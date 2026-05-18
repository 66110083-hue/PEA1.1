<!-- pages/transformdetail.vue -->
<script setup lang="ts">
import { useTransformerDetail } from '~/composables/useTransformerDetail'
import type { TransformerDetailData } from '~/composables/useTransformerDetail'

const props = defineProps<{
  transformer?: Partial<TransformerDetailData>
}>()

const { data, gauges, realtimeRows, gaugeArc, gaugeBgArc, gaugeColor } =
  useTransformerDetail(props.transformer)
</script>

<template>
  <div class="td-page">

    <!-- ─── Transformer Info + Image ─── -->
    <div class="td-card">
      <div class="td-card-header">
        <div class="td-card-header-icon"><i class="ti ti-bolt"/></div>
        <span class="td-card-title">Transformer Detail</span>
        <div style="margin-left:auto; display:flex; align-items:center; gap:8px">
          <span class="td-status-badge" :class="data.status">
            <span class="td-status-dot" :class="data.status"/>
            {{ data.status === 'online' ? 'Online' : 'Offline' }}
          </span>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--color-text-3)">{{ data.peaNo }}</span>
        </div>
      </div>
      <div class="td-card-body">

        <!-- Hero row: image + info -->
        <div class="td-hero">
          <div class="td-img-box">🔌</div>
          <div style="flex:1">
            <div class="td-section-title"><i class="ti ti-info-circle"/> Transformer Information</div>
            <div class="td-info-grid">
              <div class="td-info-item">
                <span class="td-info-label">Device ID</span>
                <span class="td-info-value" style="font-size:10px">{{ data.deviceId }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">PEA No.</span>
                <span class="td-info-value">{{ data.peaNo }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Brand</span>
                <span class="td-info-value">{{ data.brand }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Rated (kVA)</span>
                <span class="td-info-value">{{ data.rated }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Rated CT</span>
                <span class="td-info-value">{{ data.ratedCT }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Comm. Type</span>
                <span class="td-info-value">{{ data.commType }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">IP Simcard</span>
                <span class="td-info-value">{{ data.ipSim }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Latitude</span>
                <span class="td-info-value">{{ data.lat }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Longitude</span>
                <span class="td-info-value">{{ data.long }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Location</span>
                <span class="td-info-value" style="font-family:var(--font-sans)">{{ data.location }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Meter 1 Phase</span>
                <span class="td-info-value">{{ data.meter1Phase }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Meter 3 Phase</span>
                <span class="td-info-value">{{ data.meter3Phase }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Total</span>
                <span class="td-info-value">{{ data.total }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Install Date</span>
                <span class="td-info-value">{{ data.installDate }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Max Load (%)</span>
                <span class="td-info-value">{{ data.maxLoad }}</span>
              </div>
              <div class="td-info-item">
                <span class="td-info-label">Max Fund AI (%) </span>
                <span class="td-info-value">{{ data.maxFundAIPercent }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Gauges -->
        <div class="td-section-title"><i class="ti ti-gauge"/> Gauges (Realtime)</div>
        <div class="td-gauges-grid">
          <div v-for="g in gauges" :key="g.label" class="td-gauge-item">
            <svg :width="g.size" :height="g.size * 0.72" :viewBox="`0 0 ${g.size} ${g.size * 0.72}`">
              <!-- bg track -->
              <path
                :d="gaugeBgArc(g.size)"
                fill="none" stroke="var(--color-border)" stroke-width="5" stroke-linecap="round"/>
              <!-- value arc -->
              <path
                :d="gaugeArc(g.value, g.min, g.max, g.size).path"
                fill="none"
                :stroke="gaugeColor(gaugeArc(g.value, g.min, g.max, g.size).pct)"
                stroke-width="5" stroke-linecap="round"/>
              <!-- needle dot -->
              <circle :cx="g.size/2" :cy="g.size*0.72*0.8" r="3" fill="var(--color-text-2)"/>
            </svg>
            <span class="td-gauge-value">{{ g.value.toFixed(3) }}</span>
            <span class="td-gauge-label">{{ g.label }}</span>
            <span v-if="g.sub" class="td-gauge-sub">↑ {{ g.sub }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Realtime Data Table ─── -->
    <div class="td-card">
      <div class="td-card-header">
        <div class="td-card-header-icon" style="background:#2563EB"><i class="ti ti-table"/></div>
        <span class="td-card-title">Realtime Data</span>
        <span style="margin-left:8px;font-size:11px;color:var(--color-text-3)">
          <span class="td-live-dot"/>ข้อมูล ณ ช่วงเวลานั้น
        </span>
      </div>
      <div style="overflow-x:auto">
        <table class="td-rt-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in realtimeRows" :key="row.label">
              <td style="color:var(--color-text-2)">{{ row.label }}</td>
              <td class="td-rt-val">{{ row.value.toFixed(3) }}</td>
              <td><span class="td-rt-unit">{{ row.unit }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>