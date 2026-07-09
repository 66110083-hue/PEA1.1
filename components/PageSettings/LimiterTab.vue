<script setup lang="ts">
import { useSettings } from '~/composables/useSettings'
const { limiter, saveLimiterConfig } = useSettings()
</script>

<template>
  <div class="card tab-content">
    <div class="limiter-header">
      <div class="toggle-group">
        <label class="switch">
          <input type="checkbox" v-model="limiter.enabled">
          <span class="slider round"></span>
        </label>
        <span class="toggle-label" :class="{ active: limiter.enabled }">
          {{ limiter.enabled ? 'Enable' : 'Disable' }}
        </span>
      </div>
      
      <div class="device-select">
        <label>Select Device Type</label>
        <select v-model="limiter.deviceType" :disabled="!limiter.enabled">
          <option value="Transformer">Transformer</option>
        </select>
      </div>
    </div>

    <div class="threshold-sections" :class="{ disabled: !limiter.enabled }">
      <div class="th-box">
        <div class="th-box-title"><i class="ti ti-bolt" /> Voltage Thresholds</div>
        <div class="th-grid">
          <div class="sg-field">
            <label>Minimum Voltage (V)</label>
            <input type="number" v-model="limiter.minV" />
          </div>
          <div class="sg-field">
            <label>Maximum Voltage (V)</label>
            <input type="number" v-model="limiter.maxV" />
          </div>
        </div>
        <div class="th-hint">Recommended range: 200V - 240V</div>
      </div>

      <div class="th-box">
        <div class="th-box-title"><i class="ti ti-wave-sine" /> Current Threshold</div>
        <div class="th-grid">
          <div class="sg-field">
            <label>Maximum Current (A)</label>
            <input type="number" v-model="limiter.maxA" />
          </div>
        </div>
        <div class="th-hint">Recommended maximum: 50A</div>
      </div>

      <div class="th-grid-2col">
        <div class="th-box">
          <div class="th-box-title"><i class="ti ti-activity" /> Active Power Threshold</div>
          <div class="sg-field">
            <label>Maximum Active Power (W)</label>
            <input type="number" v-model="limiter.maxW" />
          </div>
        </div>
        <div class="th-box">
          <div class="th-box-title"><i class="ti ti-activity-heartbeat" /> Reactive Power Threshold</div>
          <div class="sg-field">
            <label>Maximum Reactive Power (VAR)</label>
            <input type="number" v-model="limiter.maxVAR" />
          </div>
        </div>
      </div>

      <div class="form-actions" style="margin-top: 20px; text-align: right;">
        <button class="sg-btn sg-btn-primary" @click="saveLimiterConfig"><i class="ti ti-device-floppy" /> Save Settings</button>
      </div>
    </div>
  </div>
</template>

