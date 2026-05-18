<template>
  <div style="display:flex;flex-direction:column;gap:16px">
    <SavingMetricGrid :be="be" />
    <BreakevenProgress :be="be" :install-cost="installCost" />
    <PeakShaving      :be="be" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMockData } from '~/composables/useMockData'
import SavingMetricGrid  from '~/components/PageBreakeven/SavingMetricGrid.vue'
import BreakevenProgress from '~/components/PageBreakeven/BreakevenProgress.vue'
import PeakShaving       from '~/components/PageBreakeven/PeakShaving.vue'

const { getBreakevenData } = useMockData()

const installCost = ref(25000)
const ratePerKwh  = ref(5)

const be = computed(() => getBreakevenData(installCost.value, ratePerKwh.value))
</script>