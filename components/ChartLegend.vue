<template>
  <div :style="{ display:'flex', gap: small ? '10px' : '14px', alignItems:'center', flexWrap:'wrap' }">
    <span
      v-for="item in items" :key="item.label"
      :style="{ display:'flex', alignItems:'center', gap:'5px', fontSize: small ? '10px' : '11px', color:'var(--color-text-2)' }"
    >
      <span :style="{ width:'10px', height:'3px', borderRadius:'2px', background: item.color, display:'inline-block' }" />
      {{ item.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: { label: string; color: string }[]
  small?: boolean
}>()
</script>
