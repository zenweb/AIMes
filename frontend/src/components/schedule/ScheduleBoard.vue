<template>
  <MainLayout>
    <div class="schedule-board">
      <GanttToolbar
        :scale="currentScale"
        :plan-name="planName"
        :lock-period-hours="8"
        :loading="loading"
        @optimize="handleOptimize"
        @refresh="loadData"
        @update:scale="currentScale = $event"
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
import { planToGanttData } from '../../utils/gantt-mapper'
import type {
  SchedulePlanDto,
  EquipmentDto,
  GanttData,
  WorkOrderDto,
} from '../../types/scheduling'

const ganttRef = ref()
const currentScale = ref<'day' | 'week' | 'month'>('day')
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

    // 转换为甘特图数据
    ganttData.value = planToGanttData(plan, equipment)
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

  const demoPlan: SchedulePlanDto = {
    id: 'demo-1',
    planName: '演示排产计划',
    planStartDate: start.toISOString(),
    planEndDate: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    overallUtilizationRate: 0.72,
    onTimeDeliveryRate: 0.88,
    createdAt: now.toISOString(),
    items: [
      {
        id: 'task-1',
        workOrderId: 'WO-001',
        workOrderNumber: 'WO-001',
        equipmentId: 'EQ-001',
        equipmentName: 'CNC 加工中心',
        plannedStartTime: start.toISOString(),
        plannedEndTime: new Date(start.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        sequence: 1,
        setupTime: '30 分钟',
        dependentItems: [],
      },
      {
        id: 'task-2',
        workOrderId: 'WO-002',
        workOrderNumber: 'WO-002',
        equipmentId: 'EQ-001',
        equipmentName: 'CNC 加工中心',
        plannedStartTime: new Date(start.getTime() + 8 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        plannedEndTime: new Date(start.getTime() + 16 * 60 * 60 * 1000).toISOString(),
        sequence: 2,
        setupTime: '45 分钟',
        dependentItems: ['task-1'],
      },
      {
        id: 'task-3',
        workOrderId: 'WO-003',
        workOrderNumber: 'WO-003',
        equipmentId: 'EQ-002',
        equipmentName: '注塑机',
        plannedStartTime: start.toISOString(),
        plannedEndTime: new Date(start.getTime() + 12 * 60 * 60 * 1000).toISOString(),
        sequence: 1,
        setupTime: '60 分钟',
        dependentItems: [],
      },
      {
        id: 'task-4',
        workOrderId: 'WO-004',
        workOrderNumber: 'WO-004',
        equipmentId: 'EQ-002',
        equipmentName: '注塑机',
        plannedStartTime: new Date(start.getTime() + 12 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        plannedEndTime: new Date(start.getTime() + 20 * 60 * 60 * 1000).toISOString(),
        sequence: 2,
        setupTime: '20 分钟',
        dependentItems: [],
      },
    ],
  }

  const demoEquipment: EquipmentDto[] = [
    {
      id: 'EQ-001',
      equipmentCode: 'CNC-001',
      equipmentName: 'CNC 加工中心',
      equipmentType: 'CNC',
      status: 'Running',
      capacity: 100,
      utilizationRate: 0.75,
    },
    {
      id: 'EQ-002',
      equipmentCode: 'INJ-001',
      equipmentName: '注塑机',
      equipmentType: 'InjectionMolding',
      status: 'Running',
      capacity: 200,
      utilizationRate: 0.6,
    },
  ]

  planData.value = demoPlan
  equipmentList.value = demoEquipment
  planName.value = demoPlan.planName
  metrics.utilization = Math.round(demoPlan.overallUtilizationRate * 100)
  metrics.onTimeDelivery = Math.round(demoPlan.onTimeDeliveryRate * 100)
  ganttData.value = planToGanttData(demoPlan, demoEquipment)
}

async function handleOptimize() {
  loading.value = true
  loadingMessage.value = '排产优化中...'

  try {
    const result = await api.optimizeSchedule({
      workshopId: 'workshop-1',
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
