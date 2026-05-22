<script setup lang="ts">
export interface FilterTab {
  key: 'all' | 'alert' | 'warning' | 'info'
  label: string
  count: number
}

const props = defineProps<{
  tabs: FilterTab[]
  modelValue: FilterTab['key']
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: FilterTab['key']): void
}>()
</script>

<template>
  <div class="filter-chips">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="chip"
      :class="{ active: modelValue === tab.key }"
      @click="emit('update:modelValue', tab.key)"
    >
      {{ tab.label }} ({{ tab.count }})
    </button>
  </div>
</template>

<style scoped>
.filter-chips {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.chip {
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid #dbe0e6;
  background: #fff;
  color: var(--color-text-2, #4b5563);
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-sans, inherit);
  cursor: pointer;
  transition: all .15s ease;
}

.chip:hover { opacity: .8; }

.chip.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}
</style>