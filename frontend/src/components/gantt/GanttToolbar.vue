<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <button class="btn btn-primary" @click="$emit('optimize')">
        排产优化
      </button>
      <button class="btn btn-secondary" @click="$emit('refresh')">
        刷新
      </button>
      <label class="scale-label">
        时间刻度:
        <select
          :value="scale"
          @change="$emit('update:scale', ($event.target as HTMLSelectElement).value as 'day' | 'week' | 'month')"
        >
          <option value="day">日</option>
          <option value="week">周</option>
          <option value="month">月</option>
        </select>
      </label>
    </div>
    <div class="toolbar-right">
      <span class="plan-name" v-if="planName">{{ planName }}</span>
      <span class="lock-info" v-if="lockPeriodHours">
        锁定周期: {{ lockPeriodHours }}h
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  scale: string
  planName?: string
  lockPeriodHours?: number
  loading?: boolean
}>()

defineEmits<{
  optimize: []
  refresh: []
  'update:scale': [value: 'day' | 'week' | 'month']
}>()
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  padding: 6px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: #fff;
  color: #333;
  border-color: #d9d9d9;
}

.btn-secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.scale-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #555;
}

.scale-label select {
  padding: 3px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  font-size: 13px;
}

.plan-name {
  font-weight: 500;
  color: #333;
}

.lock-info {
  font-size: 12px;
  color: #888;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 3px;
}
</style>
