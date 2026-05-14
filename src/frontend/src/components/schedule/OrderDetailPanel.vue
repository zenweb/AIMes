<template>
  <div class="detail-panel" :class="{ open: visible }">
    <div class="panel-header">
      <h3>工单详情</h3>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>

    <div v-if="loading" class="panel-body loading">加载中...</div>

    <div v-else-if="error" class="panel-body error">{{ error }}</div>

    <div v-else-if="order" class="panel-body">
      <div class="detail-row">
        <span class="label">工单号</span>
        <span class="value">{{ order.orderNumber }}</span>
      </div>
      <div class="detail-row">
        <span class="label">产品名称</span>
        <span class="value">{{ order.productName }}</span>
      </div>
      <div class="detail-row">
        <span class="label">产品编码</span>
        <span class="value">{{ order.productCode }}</span>
      </div>
      <div class="detail-row">
        <span class="label">计划数量</span>
        <span class="value">{{ order.plannedQuantity }}</span>
      </div>
      <div class="detail-row">
        <span class="label">完成数量</span>
        <span class="value">{{ order.completedQuantity }}</span>
      </div>
      <div class="detail-row">
        <span class="label">状态</span>
        <span class="value">
          <span class="status-badge" :class="order.status">
            {{ statusText }}
          </span>
        </span>
      </div>
      <div class="detail-row">
        <span class="label">优先级</span>
        <span class="value">{{ order.priority }}</span>
      </div>
      <div class="detail-row">
        <span class="label">计划开始</span>
        <span class="value">{{ formatDateTime(order.plannedStartDate) }}</span>
      </div>
      <div class="detail-row">
        <span class="label">计划结束</span>
        <span class="value">{{ formatDateTime(order.plannedEndDate) }}</span>
      </div>
      <div class="detail-row" v-if="order.actualStartDate">
        <span class="label">实际开始</span>
        <span class="value">{{ formatDateTime(order.actualStartDate) }}</span>
      </div>
      <div class="detail-row">
        <span class="label">进度</span>
        <span class="value">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: order.progressPercentage + '%' }"
            ></div>
          </div>
          {{ order.progressPercentage }}%
        </span>
      </div>
    </div>

    <div v-else class="panel-body empty">
      请点击甘特图上的工单查看详情
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkOrderDto } from '../../types/scheduling'
import { formatDateTime } from '../../utils/date'

const props = defineProps<{
  visible: boolean
  loading: boolean
  error?: string
  order: WorkOrderDto | null
}>()

defineEmits<{
  close: []
}>()

const statusText = computed(() => {
  const map: Record<string, string> = {
    pending: '待生产',
    in_progress: '生产中',
    completed: '已完成',
    paused: '已暂停',
    cancelled: '已取消',
    scheduled: '已排产',
  }
  return map[props.order?.status ?? ''] ?? props.order?.status ?? ''
})
</script>

<style scoped>
.detail-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background: #fff;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.detail-panel.open {
  transform: translateX(0);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0 4px;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.panel-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.loading,
.error,
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 14px;
}

.error {
  color: #ff4d4f;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-row .label {
  color: #888;
  font-size: 13px;
}

.detail-row .value {
  font-size: 14px;
  font-weight: 500;
  text-align: right;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.status-badge.scheduled,
.status-badge.pending {
  background: #e6f7ff;
  color: #1890ff;
}

.status-badge.in_progress {
  background: #f6ffed;
  color: #52c41a;
}

.status-badge.completed {
  background: #f5f5f5;
  color: #999;
}

.progress-bar {
  display: inline-block;
  width: 80px;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  vertical-align: middle;
  margin-right: 4px;
}

.progress-fill {
  height: 100%;
  background: #1890ff;
  border-radius: 4px;
  transition: width 0.3s;
}
</style>
