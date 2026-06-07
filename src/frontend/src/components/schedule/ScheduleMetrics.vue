<template>
  <div class="metrics-bar" role="status" aria-live="polite" aria-label="排产指标">
    <div class="metric-card">
      <span class="metric-label">设备利用率</span>
      <span class="metric-value" :style="{ color: utilizationColor }">
        {{ utilization }}%
      </span>
    </div>
    <div class="metric-card">
      <span class="metric-label">准时交付率</span>
      <span class="metric-value" :style="{ color: onTimeColor }">
        {{ onTimeDelivery }}%
      </span>
    </div>
    <div class="metric-card">
      <span class="metric-label">换线时间</span>
      <span class="metric-value">{{ changeoverMinutes }}min</span>
    </div>
    <div class="metric-card">
      <span class="metric-label">批次组数</span>
      <span class="metric-value">{{ groupCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  utilization: number
  onTimeDelivery: number
  changeoverMinutes: number
  groupCount: number
}>()

const utilizationColor = computed(() => {
  if (props.utilization >= 80) return '#52c41a'
  if (props.utilization >= 60) return '#faad14'
  return '#ff4d4f'
})

const onTimeColor = computed(() => {
  if (props.onTimeDelivery >= 90) return '#52c41a'
  if (props.onTimeDelivery >= 70) return '#faad14'
  return '#ff4d4f'
})
</script>

<style scoped>
.metrics-bar {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 16px;
  background: #fafafa;
  border-radius: 6px;
  min-width: 100px;
}

.metric-label {
  font-size: 12px;
  color: #888;
}

.metric-value {
  font-size: 22px;
  font-weight: 600;
}
</style>
