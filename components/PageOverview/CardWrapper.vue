<template>
  <div class="card">
    <div v-if="title || $slots.actions" class="card-header">
      <div class="card-title">
        <i v-if="icon" :class="`ti ${icon}`" aria-hidden="true" />
        {{ title }}
      </div>
      <slot name="actions" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  icon?:  string
}>()
</script>
