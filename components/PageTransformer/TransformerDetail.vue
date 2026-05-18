<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

import TransformerInfoCard from './TransformerInfoCard.vue'
import TransformerGaugeGrid from './TransformerGaugeGrid.vue'
import TransformerRealtimeTable from './TransformerRealtimeTable.vue'

interface TransformerDetailData {
  // Info
  status: 'online' | 'offline'
  deviceId: string
  peaNo: string
  brand: string
  rated: number
  ratedCT: number
  commType: string
  ipSim: string
  lat: number
  long: number
  location: string
  meter1Phase: number
  meter3Phase: number
  total: number
  installDate: string
  maxLoad: number
  maxFundAI: number
  maxFundAIPercent: number

  // Realtime
  voltageA: number
  voltageB: number
  voltageC: number

  currentA: number
  currentB: number
  currentC: number

  frequency: number

  activePowerImportA: number
  activePowerImportB: number
  activePowerImportC: number
  totalActivePowerImport: number

  reactivePowerImportA: number
  reactivePowerImportB: number
  reactivePowerImportC: number
  totalReactivePowerImport: number

  apparentPowerA: number
  apparentPowerB: number
  apparentPowerC: number
  totalApparentPower: number

  activePowerExportA: number
  activePowerExportB: number
  activePowerExportC: number
  totalActivePowerExport: number

  reactivePowerExportA: number
  reactivePowerExportB: number
  reactivePowerExportC: number
  totalReactivePowerExport: number

  powerFactorA: number
  powerFactorB: number
  powerFactorC: number
  totalPowerFactor: number

  importActiveEnergy: number
  distributionTransformerLoadRatio: number
  negativeSequenceCurrentRatio: number
}

const props = defineProps<{
  transformer?: Partial<TransformerDetailData>
}>()

const data = ref<TransformerDetailData>({
  status: 'online',
  deviceId: '0AC0291C2300045296',
  peaNo: '58-352186',
  brand: 'VICA TRANS',
  rated: 160,
  ratedCT: 300,
  commType: '4G Cellular',
  ipSim: '10.16.22.133',
  lat: 12.918043,
  long: 100.975596,
  location: 'สถานีที่ตั้ง',
  meter1Phase: 30,
  meter3Phase: 10,
  total: 40,
  installDate: '2025-05-11',
  maxLoad: 80,
  maxFundAI: 25,
  maxFundAIPercent: 15,

  voltageA: 235.588,
  voltageB: 225.227,
  voltageC: 219.285,

  currentA: 120.344,
  currentB: 132.813,
  currentC: 140.189,

  frequency: 49.749,

  activePowerImportA: 1.753,
  activePowerImportB: 0,
  activePowerImportC: 84.032,
  totalActivePowerImport: 4.990,

  reactivePowerImportA: 2.098,
  reactivePowerImportB: 1.249,
  reactivePowerImportC: 5.943,
  totalReactivePowerImport: 29.299,

  apparentPowerA: 25.901,
  apparentPowerB: 23.281,
  apparentPowerC: 23.281,
  totalApparentPower: 76.783,

  activePowerExportA: 0,
  activePowerExportB: 0,
  activePowerExportC: 0,
  totalActivePowerExport: 0,

  reactivePowerExportA: 0,
  reactivePowerExportB: 0,
  reactivePowerExportC: 0,
  totalReactivePowerExport: 0,

  powerFactorA: 0.945,
  powerFactorB: 0.943,
  powerFactorC: 0.497,
  totalPowerFactor: 1.074,

  importActiveEnergy: 73.510,
  distributionTransformerLoadRatio: 96.009,
  negativeSequenceCurrentRatio: 0.426,

  ...props.transformer,
})

// ─────────────────────────────────────────────
// Live Update
// ─────────────────────────────────────────────

let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {

    const jitter = (
      base: number,
      pct = 0.005
    ) =>
      +(base * (1 + (Math.random() - 0.5) * pct)).toFixed(3)

    data.value.voltageA = jitter(data.value.voltageA)
    data.value.voltageB = jitter(data.value.voltageB)
    data.value.voltageC = jitter(data.value.voltageC)

    data.value.currentA = jitter(data.value.currentA, 0.02)
    data.value.currentB = jitter(data.value.currentB, 0.02)
    data.value.currentC = jitter(data.value.currentC, 0.02)

    data.value.frequency = jitter(data.value.frequency, 0.002)

  }, 3000)
})

onUnmounted(() => clearInterval(interval))

// ─────────────────────────────────────────────
// Gauges
// ─────────────────────────────────────────────

const gauges = computed(() => [

  {
    label: 'Voltage L1',
    value: data.value.voltageA,
    min: 180,
    max: 260,
    unit: 'V',
  },

  {
    label: 'Voltage L2',
    value: data.value.voltageB,
    min: 180,
    max: 260,
    unit: 'V',
  },

  {
    label: 'Voltage L3',
    value: data.value.voltageC,
    min: 180,
    max: 260,
    unit: 'V',
  },

  {
    label: 'Current L1',
    value: data.value.currentA,
    min: 0,
    max: 300,
    unit: 'A',
  },

  {
    label: 'Current L2',
    value: data.value.currentB,
    min: 0,
    max: 300,
    unit: 'A',
  },

  {
    label: 'Current L3',
    value: data.value.currentC,
    min: 0,
    max: 300,
    unit: 'A',
  },

  {
    label: 'Active Power L1',
    value: data.value.activePowerImportA,
    min: 0,
    max: 100,
    unit: 'kW',
  },

  {
    label: 'Active Power L2',
    value: data.value.activePowerImportB,
    min: 0,
    max: 100,
    unit: 'kW',
  },

  {
    label: 'Active Power L3',
    value: data.value.activePowerImportC,
    min: 0,
    max: 100,
    unit: 'kW',
  },

])

// ─────────────────────────────────────────────
// Realtime Table
// ─────────────────────────────────────────────

const realtimeRows = computed(() => [

  {
    label: 'Voltage Phase A',
    value: data.value.voltageA,
    unit: 'V',
  },

  {
    label: 'Voltage Phase B',
    value: data.value.voltageB,
    unit: 'V',
  },

  {
    label: 'Voltage Phase C',
    value: data.value.voltageC,
    unit: 'V',
  },

  {
    label: 'Current Phase A',
    value: data.value.currentA,
    unit: 'A',
  },

  {
    label: 'Current Phase B',
    value: data.value.currentB,
    unit: 'A',
  },

  {
    label: 'Current Phase C',
    value: data.value.currentC,
    unit: 'A',
  },

  {
    label: 'Frequency',
    value: data.value.frequency,
    unit: 'Hz',
  },

  {
    label: 'Active Power Import A',
    value: data.value.activePowerImportA,
    unit: 'kW',
  },

  {
    label: 'Active Power Import B',
    value: data.value.activePowerImportB,
    unit: 'kW',
  },

  {
    label: 'Active Power Import C',
    value: data.value.activePowerImportC,
    unit: 'kW',
  },

  {
    label: 'Total Active Power',
    value: data.value.totalActivePowerImport,
    unit: 'kW',
  },

  {
    label: 'Reactive Power Import A',
    value: data.value.reactivePowerImportA,
    unit: 'kVAR',
  },

  {
    label: 'Reactive Power Import B',
    value: data.value.reactivePowerImportB,
    unit: 'kVAR',
  },

  {
    label: 'Reactive Power Import C',
    value: data.value.reactivePowerImportC,
    unit: 'kVAR',
  },

  {
    label: 'Power Factor A',
    value: data.value.powerFactorA,
    unit: 'PF',
  },

  {
    label: 'Power Factor B',
    value: data.value.powerFactorB,
    unit: 'PF',
  },

  {
    label: 'Power Factor C',
    value: data.value.powerFactorC,
    unit: 'PF',
  },

  {
    label: 'Import Active Energy',
    value: data.value.importActiveEnergy,
    unit: 'kWh',
  },

])

</script>

<template>
  <div class="td-page">

    <!-- INFO -->
    <TransformerInfoCard
      :data="data"
    />

    <!-- GAUGES -->
    <TransformerGaugeGrid
      :gauges="gauges"
    />

    <!-- REALTIME TABLE -->
    <TransformerRealtimeTable
      :rows="realtimeRows"
    />

  </div>
</template>

<style scoped>
.td-page {
  display:flex;
  flex-direction:column;
  gap:16px;
}
</style>