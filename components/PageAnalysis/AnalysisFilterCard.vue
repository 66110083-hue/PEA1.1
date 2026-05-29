<script setup lang="ts">
import { TOPICS, PERIODS } from '@/composables/useAnalysisChart'

// ── Props ──────────────────────────────────────────────────
const props = defineProps<{
  modelTopic:       string
  modelTransformer: string
  modelPeriod:      string
  modelStartDate:   string
  modelEndDate:     string
  transformerOptions: { value: string; label: string }[]
  isLoading:        boolean
  hasGenerated:     boolean
}>()

// ── Emits ──────────────────────────────────────────────────
const emit = defineEmits<{
  'update:modelTopic':       [v: string]
  'update:modelTransformer': [v: string]
  'update:modelPeriod':      [v: string]
  'update:modelStartDate':   [v: string]
  'update:modelEndDate':     [v: string]
  'generate': []
  'export':   []
}>()
</script>

<template>
  <div class="filter-card">

    <div class="filter-grid">

      <!-- Topic -->
      <div class="field field--wide">
        <label class="label">Topic</label>
        <select
          :value="modelTopic"
          class="select"
          @change="emit('update:modelTopic', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="t in TOPICS" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </div>

      <!-- Transformer -->
      <div class="field field--wide">
        <label class="label">Transformer</label>
        <select
          :value="modelTransformer"
          class="select"
          @change="emit('update:modelTransformer', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">— เลือกหม้อแปลง —</option>
          <option v-for="t in transformerOptions" :key="t.value" :value="t.value">
            {{ t.label }}
          </option>
        </select>
      </div>

      <!-- Period -->
      <div class="field">
        <label class="label">Period</label>
        <select
          :value="modelPeriod"
          class="select"
          @change="emit('update:modelPeriod', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="p in PERIODS" :key="p.value" :value="p.value">{{ p.label }}</option>
        </select>
      </div>

      <!-- Start Date -->
      <div class="field">
        <label class="label">Start Date</label>
        <input
          :value="modelStartDate"
          type="date"
          class="input"
          @input="emit('update:modelStartDate', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- End Date -->
      <div class="field">
        <label class="label">End Date</label>
        <input
          :value="modelEndDate"
          type="date"
          class="input"
          @input="emit('update:modelEndDate', ($event.target as HTMLInputElement).value)"
        />
      </div>

    </div>

    <!-- Action buttons -->
    <div class="actions">
      <button
        class="btn btn--primary"
        :disabled="!modelTransformer || isLoading"
        @click="emit('generate')"
      >
        <i class="ti" :class="isLoading ? 'ti-loader-2 spin' : 'ti-refresh'"></i>
        {{ isLoading ? 'กำลังโหลด…' : 'Generate' }}
      </button>

      <button
        class="btn btn--outline"
        :disabled="!hasGenerated"
        @click="emit('export')"
      >
        <i class="ti ti-download"></i>
        Export
      </button>
    </div>

  </div>
</template>

<style scoped>
.filter-card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: end;
}

.field        { display: flex; flex-direction: column; gap: 5px; }

.label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-2, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.select,
.input {
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-text-1, #111827);
  background: var(--color-bg, #f9fafb);
  outline: none;
  transition: border-color 0.18s;
  width: 100%;
  box-sizing: border-box;
}
.select:focus,
.input:focus { border-color: var(--color-primary, #1D9E75); }

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 14px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.18s, transform 0.1s;
}
.btn:disabled                { opacity: 0.4; cursor: not-allowed; }
.btn:not(:disabled):hover    { opacity: 0.85; }
.btn:not(:disabled):active   { transform: scale(0.97); }
.btn--primary  { background: var(--color-primary, #1D9E75); color: #fff; }
.btn--outline  {
  background: transparent;
  color: var(--color-primary, #1D9E75);
  border: 1.5px solid var(--color-primary, #1D9E75);
}

.spin { animation: spin 0.9s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 900px) { .filter-grid { grid-template-columns: 1fr 1fr 1fr; } }
@media (max-width: 600px) { .filter-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 420px) { .filter-grid { grid-template-columns: 1fr; } }
</style>