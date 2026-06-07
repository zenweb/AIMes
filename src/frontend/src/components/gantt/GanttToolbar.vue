<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <button type="button" class="btn btn-primary" :disabled="loading" @click="$emit('optimize')">
        {{ loading ? '优化中...' : '排产优化' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="$emit('refresh')">
        刷新
      </button>
      <button type="button" class="btn btn-feedback" @click="$emit('feedback')">
        采纳反馈
      </button>
      <button type="button" class="btn btn-compare" @click="$emit('compare')">
        多目标对比
      </button>
      <button type="button" class="btn btn-export" @click="$emit('export-csv')">
        导出 CSV
      </button>
      <label class="objective-label">
        优化目标:
        <select
          :value="objective"
          @change="$emit('update:objective', ($event.target as HTMLSelectElement).value)"
        >
          <option value="due_date">交期优先</option>
          <option value="utilization">利用率优先</option>
          <option value="changeover">换线成本优先</option>
          <option value="balanced">综合平衡</option>
        </select>
      </label>
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
  objective: string
  planName?: string
  lockPeriodHours?: number
  loading?: boolean
}>()

defineEmits<{
  optimize: []
  refresh: []
  feedback: []
  compare: []
  'export-csv': []
  'update:scale': [value: 'day' | 'week' | 'month']
  'update:objective': [value: string]
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.btn-primary:hover:not(:disabled) {
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

.btn-feedback {
  background: #fff;
  color: #722ed1;
  border-color: #d9d9d9;
}

.btn-feedback:hover {
  border-color: #722ed1;
  color: #722ed1;
  background: #f9f0ff;
}

.btn-compare {
  background: #fff;
  color: #13c2c2;
  border-color: #d9d9d9;
}

.btn-compare:hover {
  border-color: #13c2c2;
  color: #13c2c2;
  background: #e6fffb;
}

.btn-export {
  background: #fff;
  color: #52c41a;
  border-color: #d9d9d9;
}

.btn-export:hover {
  border-color: #52c41a;
  color: #52c41a;
  background: #f6ffed;
}

.objective-label,
.scale-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #555;
}

.objective-label select,
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
