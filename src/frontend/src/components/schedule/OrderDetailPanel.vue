<template>
  <div
    class="detail-panel"
    :class="{ open: visible }"
    role="dialog"
    :aria-modal="visible ? 'true' : 'false'"
    :aria-label="panelAriaLabel"
  >
    <div class="panel-header">
      <h3>工单详情</h3>
      <button class="close-btn" aria-label="关闭工单详情" @click="$emit('close')">×</button>
    </div>

    <div v-if="loading" class="panel-body loading" role="status" aria-live="polite">加载中...</div>

    <div v-else-if="error" class="panel-body error" role="alert" aria-live="assertive">{{ error }}</div>

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

      <section class="schedule-explain-panel" aria-label="任务级排产解释">
        <div class="explain-heading">
          <span class="eyebrow">一键解释这个排产</span>
          <h4>{{ explanation.workOrderNumber }} 为什么排在这里</h4>
        </div>
        <div class="explain-grid">
          <div v-for="item in explanation.items" :key="item.label" class="explain-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.detail }}</p>
          </div>
        </div>
        <div class="explain-summary">
          <strong>Agent 推荐理由</strong>
          <p>{{ explanation.reason }}</p>
          <strong>风险提示</strong>
          <p>{{ explanation.risk }}</p>
          <strong>可替代方案</strong>
          <p>{{ explanation.alternative }}</p>
        </div>
      </section>
    </div>

    <div v-else class="panel-body empty" role="status" aria-live="polite">
      请点击甘特图上的工单查看详情
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkOrderDto } from '../../types/scheduling'
import { formatDateTime } from '../../utils/date'

export interface ScheduleTaskExplanation {
  workOrderNumber: string
  reason: string
  risk: string
  alternative: string
  items: Array<{
    label: string
    value: string
    detail: string
  }>
}

const props = defineProps<{
  visible: boolean
  loading: boolean
  error?: string
  order: WorkOrderDto | null
  explanation?: ScheduleTaskExplanation | null
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

const panelAriaLabel = computed(() => {
  if (props.order?.orderNumber) return `工单详情：${props.order.orderNumber}`
  if (props.loading) return '工单详情：加载中'
  if (props.error) return '工单详情：加载失败'
  return '工单详情'
})

const explanation = computed<ScheduleTaskExplanation>(() => {
  if (props.explanation) return props.explanation
  const orderNumber = props.order?.orderNumber ?? '-'
  return {
    workOrderNumber: orderNumber,
    reason: '基于交期、设备能力、前置工序和锁定期保护生成当前排产位置。',
    risk: '未检测到额外风险；如物料或设备状态变化，需要重新评估。',
    alternative: '可在锁定期后尝试换设备或加班插入，并记录人工调整原因。',
    items: [
      { label: '交期', value: props.order?.plannedEndDate ? formatDateTime(props.order.plannedEndDate) : '-', detail: '按承诺交期倒排，优先保护临近交付订单。' },
      { label: '设备', value: props.order?.routeCode || '标准工艺设备', detail: '匹配当前工艺路线的设备能力。' },
      { label: '前置工序', value: '已满足', detail: '前序完成后才允许进入当前工序窗口。' },
      { label: '缺料', value: '未阻塞', detail: '当前排产假设关键物料可齐套。' },
      { label: '瓶颈', value: '需关注', detail: '若命中瓶颈设备，Agent 会优先保护连续加工窗口。' },
    ],
  }
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

.schedule-explain-panel {
  margin-top: 18px;
  padding: 14px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #f8fbff;
}

.explain-heading {
  margin-bottom: 10px;
}

.eyebrow {
  display: block;
  margin-bottom: 4px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.explain-heading h4 {
  margin: 0;
  color: #111827;
  font-size: 14px;
}

.explain-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.explain-card {
  padding: 9px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
}

.explain-card span,
.explain-summary strong {
  display: block;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.explain-card strong {
  display: block;
  margin: 3px 0;
  color: #0f172a;
  font-size: 13px;
}

.explain-card p,
.explain-summary p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.explain-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #dbeafe;
}
</style>
