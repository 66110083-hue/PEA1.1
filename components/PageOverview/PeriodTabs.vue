<template>
  <div :class="pill ? 'phase-tabs' : 'period-tabs'">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="[pill ? 'ptab' : 'period-tab', { active: modelValue === tab.key }]"
      @click="$emit('update:modelValue', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabs:       { key: string; label: string }[]
  modelValue: string
  pill?:      boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
