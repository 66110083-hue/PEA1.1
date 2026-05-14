<template>
  <div class="phase-grid">
    <div class="phase-card phase-a">
      <div class="phase-name">เฟส A — L1</div>
      <div class="phase-row"><span class="phase-key">แรงดัน (V)</span><span class="phase-val">{{ metrics.phase.A.v }}</span></div>
      <div class="phase-row"><span class="phase-key">กระแส (A)</span><span class="phase-val">{{ metrics.phase.A.i }}</span></div>
      <div class="phase-row"><span class="phase-key">กำลัง (kW)</span><span class="phase-val">{{ metrics.phase.A.p }}</span></div>
      <div class="phase-row"><span class="phase-key">Power Factor</span><span class="phase-val">{{ metrics.phase.A.pf }}</span></div>
    </div>
    <div class="phase-card phase-b">
      <div class="phase-name">เฟส B — L2</div>
      <div class="phase-row"><span class="phase-key">แรงดัน (V)</span><span class="phase-val">{{ metrics.phase.B.v }}</span></div>
      <div class="phase-row"><span class="phase-key">กระแส (A)</span><span class="phase-val">{{ metrics.phase.B.i }}</span></div>
      <div class="phase-row"><span class="phase-key">กำลัง (kW)</span><span class="phase-val">{{ metrics.phase.B.p }}</span></div>
      <div class="phase-row"><span class="phase-key">Power Factor</span><span class="phase-val">{{ metrics.phase.B.pf }}</span></div>
    </div>
    <div class="phase-card phase-c">
      <div class="phase-name">เฟส C — L3</div>
      <div class="phase-row"><span class="phase-key">แรงดัน (V)</span><span class="phase-val">{{ metrics.phase.C.v }}</span></div>
      <div class="phase-row"><span class="phase-key">กระแส (A)</span><span class="phase-val">{{ metrics.phase.C.i }}</span></div>
      <div class="phase-row"><span class="phase-key">กำลัง (kW)</span><span class="phase-val">{{ metrics.phase.C.p }}</span></div>
      <div class="phase-row"><span class="phase-key">Power Factor</span><span class="phase-val">{{ metrics.phase.C.pf }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ metrics: ReturnType<any> }>()
</script>
