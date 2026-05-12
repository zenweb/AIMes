<template>
  <MainLayout>
    <div class="schedule-board">
      <GanttToolbar
        :scale="currentScale"
        :objective="currentObjective"
        :plan-name="planName"
        :lock-period-hours="8"
        :loading="loading"
        @optimize="handleOptimize"
        @refresh="loadData"
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
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import GanttChart from '../gantt/GanttChart.vue'
import GanttToolbar from '../gantt/GanttToolbar.vue'
import ScheduleMetrics from './ScheduleMetrics.vue'
import OrderDetailPanel from './OrderDetailPanel.vue'
import MainLayout from '../layout/MainLayout.vue'
import * as api from '../../api/scheduling'
import { planToGanttData, detectConflicts } from '../../utils/gantt-mapper'
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
const ganttData = ref<GanttData>({ tasks: [], links: [] })

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const selectedOrder = ref<WorkOrderDto | null>(null)

const metrics = reactive({
  utilization: 0,
  onTimeDelivery: 0,
  changeoverMinutes: 0,
  groupCount: 0,
})

async function loadData() {
  loading.value = true
  loadingMessage.value = '加载排产计划...'
  error.value = ''

  try {
    const [plan, equipment] = await Promise.all([
      api.getCurrentPlan(),
      api.getEquipmentList(),
    ])

    planData.value = plan
    equipmentList.value = equipment
    planName.value = plan.planName

    // 更新指标
    metrics.utilization = Math.round(plan.overallUtilizationRate * 100)
    metrics.onTimeDelivery = Math.round(plan.onTimeDeliveryRate * 100)
    metrics.changeoverMinutes = plan.totalChangeoverMinutes ?? 0
    metrics.groupCount = plan.groupCount ?? 0

    // 转换为甘特图数据
    ganttData.value = planToGanttData(plan, equipment)
    markConflicts(plan.items)
  } catch (e: any) {
    console.error('加载排产计划失败:', e)
    error.value = `加载失败: ${e?.response?.data?.message || e?.message || '未知错误'}`
    // 使用示例数据
    loadDemoData()
  } finally {
    loading.value = false
  }
}

// 示例数据 - 当后端不可用时展示
function loadDemoData() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(8, 0, 0, 0)

  function t(hour: number, day = 0) {
    return new Date(start.getTime() + day * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000)
  }
  function dur(hours: number) {
    return hours * 60 * 60 * 1000
  }

  const demoPlan: SchedulePlanDto = {
    id: 'demo-1',
    planName: '2026年5月第2周排产计划',
    planStartDate: start.toISOString(),
    planEndDate: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    overallUtilizationRate: 0.72,
    onTimeDeliveryRate: 0.88,
    createdAt: now.toISOString(),
    items: [
      // ---- CNC-001 (瓶颈设备, 利用率最高) ----
      { id: 'task-1', workOrderId: 'WO-001', workOrderNumber: 'WO-001\n转接座-A', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(16, 0).toISOString(), sequence: 1, setupTime: '30 分钟', dependentItems: [] },
      { id: 'task-2', workOrderId: 'WO-002', workOrderNumber: 'WO-002\n阀体-B', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(16, 0).toISOString(), plannedEndTime: t(24, 0).toISOString(), sequence: 2, setupTime: '45 分钟', dependentItems: ['task-1'] },
      { id: 'task-3', workOrderId: 'WO-003', workOrderNumber: 'WO-003\n齿轮-C', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(8, 1).toISOString(), plannedEndTime: t(18, 1).toISOString(), sequence: 3, setupTime: '30 分钟', dependentItems: [] },
      { id: 'task-4', workOrderId: 'WO-004', workOrderNumber: 'WO-004\n转接座-B', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(18, 1).toISOString(), plannedEndTime: t(24, 1).toISOString(), sequence: 4, setupTime: '30 分钟', dependentItems: ['task-3'] },

      // ---- CNC-002 (正常负荷) ----
      { id: 'task-5', workOrderId: 'WO-005', workOrderNumber: 'WO-005\n基座-D', equipmentId: 'EQ-002', equipmentName: 'CNC-002 加工中心', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(14, 0).toISOString(), sequence: 1, setupTime: '20 分钟', dependentItems: [] },
      { id: 'task-6', workOrderId: 'WO-006', workOrderNumber: 'WO-006\n法兰-E', equipmentId: 'EQ-002', equipmentName: 'CNC-002 加工中心', plannedStartTime: t(14, 0).toISOString(), plannedEndTime: t(20, 0).toISOString(), sequence: 2, setupTime: '35 分钟', dependentItems: ['task-5'] },
      { id: 'task-7', workOrderId: 'WO-007', workOrderNumber: 'WO-007\n底座-F', equipmentId: 'EQ-002', equipmentName: 'CNC-002 加工中心', plannedStartTime: t(8, 1).toISOString(), plannedEndTime: t(12, 1).toISOString(), sequence: 3, setupTime: '20 分钟', dependentItems: [] },

      // ---- 注塑机 (单设备, 连续排产) ----
      { id: 'task-8', workOrderId: 'WO-008', workOrderNumber: 'WO-008\n外壳-G', equipmentId: 'EQ-003', equipmentName: '注塑机', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(12, 0).toISOString(), sequence: 1, setupTime: '60 分钟', dependentItems: [] },
      { id: 'task-9', workOrderId: 'WO-009', workOrderNumber: 'WO-009\n面板-H', equipmentId: 'EQ-003', equipmentName: '注塑机', plannedStartTime: t(13, 0).toISOString(), plannedEndTime: t(17, 0).toISOString(), sequence: 2, setupTime: '45 分钟', dependentItems: ['task-8'] },
      { id: 'task-10', workOrderId: 'WO-010', workOrderNumber: 'WO-010\n壳体-I', equipmentId: 'EQ-003', equipmentName: '注塑机', plannedStartTime: t(18, 0).toISOString(), plannedEndTime: t(24, 0).toISOString(), sequence: 3, setupTime: '30 分钟', dependentItems: [] },

      // ---- 装配线-1 (依赖注塑任务) ----
      { id: 'task-11', workOrderId: 'WO-011', workOrderNumber: 'WO-011\n组件-J', equipmentId: 'EQ-004', equipmentName: '装配线-1', plannedStartTime: t(8, 1).toISOString(), plannedEndTime: t(14, 1).toISOString(), sequence: 1, setupTime: '15 分钟', dependentItems: ['task-8'] },
      { id: 'task-12', workOrderId: 'WO-012', workOrderNumber: 'WO-012\n组件-K', equipmentId: 'EQ-004', equipmentName: '装配线-1', plannedStartTime: t(14, 1).toISOString(), plannedEndTime: t(20, 1).toISOString(), sequence: 2, setupTime: '15 分钟', dependentItems: ['task-11', 'task-2'] },

      // ---- 热处理炉 (冲突演示: 两个任务重叠) ----
      { id: 'task-13', workOrderId: 'WO-013', workOrderNumber: 'WO-013\n淬火-L', equipmentId: 'EQ-005', equipmentName: '热处理炉', plannedStartTime: t(10, 0).toISOString(), plannedEndTime: t(14, 0).toISOString(), sequence: 1, setupTime: '120 分钟', dependentItems: [] },
      // 冲突任务! 与 task-13 时间重叠
      { id: 'task-14', workOrderId: 'WO-014', workOrderNumber: 'WO-014\n回火-M', equipmentId: 'EQ-005', equipmentName: '热处理炉', plannedStartTime: t(12, 0).toISOString(), plannedEndTime: t(16, 0).toISOString(), sequence: 2, setupTime: '90 分钟', dependentItems: [] },
    ],
  }

  const demoEquipment: EquipmentDto[] = [
    { id: 'EQ-001', equipmentCode: 'CNC-001', equipmentName: 'CNC-001 加工中心', equipmentType: 'CNC', status: 'Running', capacity: 100, utilizationRate: 0.85 },
    { id: 'EQ-002', equipmentCode: 'CNC-002', equipmentName: 'CNC-002 加工中心', equipmentType: 'CNC', status: 'Running', capacity: 100, utilizationRate: 0.55 },
    { id: 'EQ-003', equipmentCode: 'INJ-001', equipmentName: '注塑机', equipmentType: 'InjectionMolding', status: 'Running', capacity: 200, utilizationRate: 0.70 },
    { id: 'EQ-004', equipmentCode: 'ASM-001', equipmentName: '装配线-1', equipmentType: 'Assembly', status: 'Running', capacity: 150, utilizationRate: 0.45 },
    { id: 'EQ-005', equipmentCode: 'HT-001', equipmentName: '热处理炉', equipmentType: 'HeatTreatment', status: 'Running', capacity: 80, utilizationRate: 0.40 },
  ]

  planData.value = demoPlan
  equipmentList.value = demoEquipment
  planName.value = demoPlan.planName
  metrics.utilization = Math.round(demoPlan.overallUtilizationRate * 100)
  metrics.onTimeDelivery = Math.round(demoPlan.onTimeDeliveryRate * 100)
  metrics.changeoverMinutes = 580
  metrics.groupCount = 5
  ganttData.value = planToGanttData(
    demoPlan,
    demoEquipment,
    new Set(['EQ-001']) // CNC-001 是瓶颈
  )
  markConflicts(demoPlan.items)
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
      ganttData.value = planToGanttData(result.plan, equipmentList.value)
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
  } catch (e: any) {
    // 使用本地数据回退
    selectedOrder.value = {
      id: task.workOrderId,
      orderNumber: task.text,
      productCode: 'PROD-DEMO',
      productName: task.text,
      plannedQuantity: 100,
      completedQuantity: 0,
      plannedStartDate: task.start_date,
      plannedEndDate: new Date(
        new Date(task.start_date).getTime() + task.duration * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: 'scheduled',
      workshopId: 'workshop-1',
      priority: 50,
      progressPercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  } finally {
    detailLoading.value = false
  }
}

function handleTaskDblClick(taskId: string) {
  handleTaskClick(taskId)
}

function handleTaskDragEnd(taskId: string, newStart: Date, newEnd: Date) {
  console.log(`Task ${taskId} moved to`, newStart, newEnd)
  // 拖拽后可触发重新排产
  // handleOptimize()
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
</style>
