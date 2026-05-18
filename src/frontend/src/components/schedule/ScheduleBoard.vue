<template>
  <div class="schedule-board">
      <GanttToolbar
        :scale="currentScale"
        :objective="currentObjective"
        :plan-name="planName"
        :lock-period-hours="8"
        :loading="loading"
        @optimize="handleOptimize"
        @refresh="loadData"
        @feedback="showFeedbackForm = true"
        @compare="showParetoCompare = true"
        @export-csv="handleExportCsv"
        @update:scale="currentScale = $event"
        @update:objective="currentObjective = $event"
      />

      <ScheduleMetrics
        :utilization="metrics.utilization"
        :on-time-delivery="metrics.onTimeDelivery"
        :changeover-minutes="metrics.changeoverMinutes"
        :group-count="metrics.groupCount"
      />

      <div class="gantt-wrapper">
        <div v-if="loading" class="loading-overlay">
          <div class="spinner"></div>
          <span>{{ loadingMessage }}</span>
        </div>

        <div v-if="error" class="error-banner">
          {{ error }}
          <button @click="loadData">重试</button>
        </div>

        <div v-if="warnings.length > 0" class="warnings-bar">
          <span class="warnings-icon">⚠</span>
          <span v-for="(w, i) in warnings" :key="i" class="warning-item">{{ w }}</span>
        </div>

        <GanttChart
          ref="ganttRef"
          :data="ganttData"
          :lock-period-hours="8"
          :scale="currentScale"
          @task-click="handleTaskClick"
          @task-dbl-click="handleTaskDblClick"
          @task-drag-end="handleTaskDragEnd"
        />
      </div>

      <OrderDetailPanel
        :visible="detailVisible"
        :loading="detailLoading"
        :error="detailError"
        :order="selectedOrder"
        @close="detailVisible = false"
      />

      <FeedbackForm
        :visible="showFeedbackForm"
        :schedule-plan-id="planData?.id ?? ''"
        :workshop-id="'workshop-1'"
        :optimization-objective="currentObjective"
        @close="showFeedbackForm = false"
        @submitted="onFeedbackSubmitted"
      />

      <ParetoCompare
        :visible="showParetoCompare"
        :workshop-id="'workshop-1'"
        @close="showParetoCompare = false"
        @apply="onApplyObjective"
      />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import GanttToolbar from '../gantt/GanttToolbar.vue'
import ScheduleMetrics from './ScheduleMetrics.vue'
import OrderDetailPanel from './OrderDetailPanel.vue'
import FeedbackForm from '../gantt/FeedbackForm.vue'
import ParetoCompare from './ParetoCompare.vue'

const GanttChart = defineAsyncComponent({
  loader: () => import('../gantt/GanttChart.vue'),
  loadingComponent: {
    template: '<div class="gantt-loading"><div class="spinner"></div><span>加载甘特图...</span></div>',
  },
  delay: 200,
})
import * as api from '../../api/scheduling'
import { getBottleneckEquipmentIds } from '../../api/equipment'
import { planToGanttData, detectConflicts } from '../../utils/gantt-mapper'
import { useExport } from '../../composables/useExport'

const { csvFilename, downloadCsv } = useExport()
import type {
  SchedulePlanDto,
  ScheduleItemDto,
  EquipmentDto,
  GanttData,
  WorkOrderDto,
} from '../../types/scheduling'

const ganttRef = ref()
const currentScale = ref<'day' | 'week' | 'month'>('day')
const currentObjective = ref('due_date')
const loading = ref(false)
const loadingMessage = ref('加载中...')
const error = ref('')
const planName = ref('')
const planData = ref<SchedulePlanDto | null>(null)
const equipmentList = ref<EquipmentDto[]>([])
const bottleneckIds = ref<Set<string>>()
const ganttData = ref<GanttData>({ tasks: [], links: [] })

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const selectedOrder = ref<WorkOrderDto | null>(null)
const showFeedbackForm = ref(false)
const showParetoCompare = ref(false)

const metrics = reactive({
  utilization: 0,
  onTimeDelivery: 0,
  changeoverMinutes: 0,
  groupCount: 0,
})
const warnings = ref<string[]>([])

async function loadData() {
  loading.value = true
  loadingMessage.value = '加载排产计划...'
  error.value = ''

  try {
    const [plan, equipment, apiBottleneckIds] = await Promise.all([
      api.getCurrentPlan(),
      api.getEquipmentList(),
      getBottleneckEquipmentIds().catch(() => undefined as string[] | undefined),
    ])

    planData.value = plan
    equipmentList.value = equipment.items
    planName.value = plan.planName

    // 更新指标
    metrics.utilization = Math.round(plan.overallUtilizationRate * 100)
    metrics.onTimeDelivery = Math.round(plan.onTimeDeliveryRate * 100)
    metrics.changeoverMinutes = plan.totalChangeoverMinutes ?? 0
    metrics.groupCount = plan.groupCount ?? 0

    // 转换为甘特图数据，传入后端瓶颈列表
    bottleneckIds.value = apiBottleneckIds ? new Set(apiBottleneckIds) : undefined
    ganttData.value = planToGanttData(plan, equipment.items, bottleneckIds.value)
    markConflicts(plan.items)
  } catch (e: any) {
    console.error('加载排产计划失败:', e)
    error.value = `加载失败: ${e?.response?.data?.message || e?.message || '未知错误'}`
  } finally {
    loading.value = false
  }
}

function handleExportCsv() {
  const headers = ['工单号', '产品', '设备', '开始时间', '结束时间', '状态', '进度']
  const rows = ganttData.value.tasks.map(t => [
    t.text || '',
    '',
    '',
    typeof t.start_date === 'string' ? t.start_date.slice(0, 16) : t.start_date?.toISOString().slice(0, 16) || '',
    typeof t.end_date === 'string' ? t.end_date.slice(0, 16) : t.end_date?.toISOString().slice(0, 16) || '',
    '',
    String(Math.round((t.progress || 0) * 100)) + '%',
  ])
  downloadCsv(csvFilename('排产计划'), headers, rows)
}

async function handleOptimize() {
  loading.value = true
  loadingMessage.value = `排产优化中（目标: ${currentObjective.value}）...`

  try {
    const result = await api.optimizeSchedule({
      workshopId: 'workshop-1',
      optimizationObjective: currentObjective.value,
    })

    if (result.plan) {
      planData.value = result.plan
      planName.value = result.plan.planName
      metrics.utilization = Math.round(result.plan.overallUtilizationRate * 100)
      metrics.onTimeDelivery = Math.round(result.plan.onTimeDeliveryRate * 100)
      ganttData.value = planToGanttData(result.plan, equipmentList.value, bottleneckIds.value)
      warnings.value = result.warnings ?? result.plan.warnings ?? []
    }
  } catch (e: any) {
    console.error('排产优化失败:', e)
    error.value = `优化失败: ${e?.response?.data?.message || e?.message || '未知错误'}`
  } finally {
    loading.value = false
  }
}

async function handleTaskClick(taskId: string) {
  const task = ganttData.value.tasks.find((t) => t.id === taskId)
  if (!task?.workOrderId) return

  detailVisible.value = true
  detailLoading.value = true
  detailError.value = ''

  try {
    const order = await api.getWorkOrderById(task.workOrderId)
    selectedOrder.value = order
  } catch {
    detailError.value = `无法加载工单详情`
  } finally {
    detailLoading.value = false
  }
}

function handleTaskDblClick(taskId: string) {
  handleTaskClick(taskId)
}

function handleTaskDragEnd(taskId: string, newStart: Date, newEnd: Date) {
  const task = ganttData.value.tasks.find(t => t.id === taskId)
  if (!task || !planData.value?.id) return

  // 调用 API 持久化
  api.rescheduleItem(
    planData.value.id,
    taskId,
    newStart.toISOString(),
    newEnd.toISOString()
  ).then(() => {
    // 更新本地数据
    task.start_date = newStart
    task.duration = (newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24)
    error.value = ''
  }).catch((e: any) => {
    console.error('重排保存失败:', e)
    error.value = `保存失败: ${e?.response?.data?.message || e?.message || '未知错误'}`
    // 重新加载以恢复原始状态
    loadData()
  })
}

function markConflicts(items: ScheduleItemDto[]) {
  const conflicts = detectConflicts(items)
  if (conflicts.size > 0) {
    ganttData.value.tasks = ganttData.value.tasks.map(t => {
      if (conflicts.has(t.id)) {
        return { ...t, hasConflict: true, conflictMessage: conflicts.get(t.id) }
      }
      return t
    })
    error.value = '' // 冲突不是错误，不显示红色横幅
  }
}

function onFeedbackSubmitted() {
  showFeedbackForm.value = false
}

function onApplyObjective(objective: string) {
  currentObjective.value = objective
  showParetoCompare.value = false

  // 记录方案采纳
  if (planData.value?.id) {
    api.submitAdoptionFeedback({
      schedulePlanId: planData.value.id,
      workshopId: 'workshop-1',
      optimizationObjective: objective,
      reasonCategory: 'batch_optimize_apply',
      reasonDetail: '从批量对比中选择此方案',
    }).catch((e: any) => console.warn('采纳记录提交失败:', e))
  }

  handleOptimize()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.schedule-board {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  position: relative;
}

.gantt-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 12px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e8e8e8;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-banner {
  padding: 10px 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  margin: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-banner button {
  padding: 4px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.warnings-bar {
  padding: 8px 16px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  margin: 4px 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #ad8b00;
}

.warnings-icon {
  font-size: 15px;
}

.warning-item {
  padding: 2px 0;
}
</style>
