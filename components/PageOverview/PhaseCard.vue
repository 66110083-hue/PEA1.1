<template>
  <div class="phase-card" :class="`phase-${phase.toLowerCase()}`">
    <div class="phase-name">เฟส {{ phase }} — {{ label }}</div>
    <div class="phase-row">
      <span class="phase-key">กระแส (A)</span>
      <span class="phase-val" :style="{ color }">{{ current }}</span>
    </div>
    <div class="phase-row">
      <span class="phase-key">แรงดัน (V)</span>
      <span class="phase-val" :style="{ color }">{{ voltage }}</span>
    </div>
    <div class="phase-row">
      <span class="phase-key">กำลัง (kW)</span>
      <span class="phase-val" :style="{ color }">{{ power }}</span>
    </div>
    <div v-if="pf !== undefined" class="phase-row">
      <span class="phase-key">Power Factor</span>
      <span class="phase-val" :style="{ color }">{{ pf }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  phase:    string
  color:    string
  current:  number
  voltage:  number
  power:    number
  pf?:      number
  label?:   string
}>(), {
  label: 'กระแส/แรงดัน'
})
</script>
