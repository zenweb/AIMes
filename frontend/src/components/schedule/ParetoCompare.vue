<template>
  <Teleport to="body">
    <div v-if="visible" class="compare-overlay" @click.self="$emit('close')">
      <div class="compare-container">
        <div class="compare-header">
          <h2>多目标方案对比</h2>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <div v-if="loading" class="loading-section">
          <div class="spinner"></div>
          <span>正在并行优化 {{ objectiveCount }} 个目标...</span>
        </div>

        <div v-else-if="error" class="error-msg">
          {{ error }}
          <button @click="loadData">重试</button>
        </div>

        <template v-else-if="items.length > 0">
          <!-- KPI 对比表 -->
          <div class="kpi-table-section">
            <h3>关键指标对比</h3>
            <table class="kpi-table">
              <thead>
                <tr>
                  <th>优化目标</th>
                  <th>设备利用率</th>
                  <th>交期准时率</th>
                  <th>换线时间(分)</th>
                  <th>分组数</th>
                  <th>完工率</th>
                  <th>工单数</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in items"
                  :key="item.objective"
                  :class="{ 'best-row': item.objective === bestOverall, 'active-row': item.objective === activeTab }"
                  @click="activeTab = item.objective"
                >
                  <td class="objective-cell">
                    <span class="obj-badge" :class="badgeClass(item.objective)">{{ item.objectiveLabel }}</span>
                    <span v-if="item.objective === bestOverall" class="best-tag">最优</span>
                  </td>
                  <td :class="bestCell('utilization', item)">{{ (item.utilizationRate * 100).toFixed(0) }}%</td>
                  <td :class="bestCell('onTimeDelivery', item)">{{ (item.onTimeDeliveryRate * 100).toFixed(0) }}%</td>
                  <td :class="bestCell('changeover', item, false)">{{ item.totalChangeoverMinutes.toFixed(0) }}</td>
                  <td>{{ item.groupCount }}</td>
                  <td>{{ (item.estimatedCompletionRate * 100).toFixed(0) }}%</td>
                  <td>{{ item.totalWorkOrders }}</td>
                  <td>
                    <button
                      class="apply-btn"
                      @click.stop="$emit('apply', item.objective)"
                      title="采用此方案"
                    >
                      采用
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tab 切换 -->
          <div class="tab-bar">
            <button
              v-for="item in items"
              :key="item.objective"
              class="tab-btn"
              :class="{ active: item.objective === activeTab }"
              @click="activeTab = item.objective"
            >
              {{ item.objectiveLabel }}
            </button>
          </div>

          <!-- 甘特图 -->
          <div class="compare-gantt-wrapper">
            <GanttChart
              :key="activeTab"
              :data="ganttDataByObjective[activeTab] || { tasks: [], links: [] }"
              :lock-period-hours="8"
              :scale="'day'"
            />
          </div>
        </template>

        <div v-else class="empty-state">
          <p>暂无对比数据</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import GanttChart from '../gantt/GanttChart.vue'
import * as api from '../../api/scheduling'
import { planToGanttData } from '../../utils/gantt-mapper'
import type {
  SchedulePlanDto,
  ScheduleItemDto,
  EquipmentDto,
  GanttData,
} from '../../types/scheduling'

interface ObjectiveCompareItem {
  objective: string
  objectiveLabel: string
  plan: SchedulePlanDto
  utilizationRate: number
  onTimeDeliveryRate: number
  totalChangeoverMinutes: number
  groupCount: number
  estimatedCompletionRate: number
  totalWorkOrders: number
}

interface BatchOptimizeResult {
  items: ObjectiveCompareItem[]
  bestOverallObjective?: string
}

const props = defineProps<{
  visible: boolean
  workshopId: string
}>()

const emit = defineEmits<{
  close: []
  apply: [objective: string]
}>()

const loading = ref(false)
const error = ref('')
const items = ref<ObjectiveCompareItem[]>([])
const bestOverall = ref('')
const activeTab = ref('')
const ganttDataByObjective = reactive<Record<string, GanttData>>({})

const objectiveCount = computed(() => items.value.length)

const ALL_OBJECTIVES = ['due_date', 'utilization', 'changeover', 'balanced']
const OBJECTIVE_LABELS: Record<string, string> = {
  due_date: '交期优先',
  utilization: '利用率优先',
  changeover: '换线成本优先',
  balanced: '综合平衡',
}

function badgeClass(obj: string) {
  const map: Record<string, string> = {
    due_date: 'badge-blue',
    utilization: 'badge-green',
    changeover: 'badge-orange',
    balanced: 'badge-purple',
  }
  return map[obj] || 'badge-gray'
}

function bestCell(kpi: string, item: ObjectiveCompareItem, higherIsBetter = true): string {
  const values = items.value.map(i => {
    switch (kpi) {
      case 'utilization': return i.utilizationRate
      case 'onTimeDelivery': return i.onTimeDeliveryRate
      case 'changeover': return i.totalChangeoverMinutes
      default: return 0
    }
  })
  const best = higherIsBetter ? Math.max(...values) : Math.min(...values)
  const current = (() => {
    switch (kpi) {
      case 'utilization': return item.utilizationRate
      case 'onTimeDelivery': return item.onTimeDeliveryRate
      case 'changeover': return item.totalChangeoverMinutes
      default: return 0
    }
  })()
  return current === best ? 'best-cell' : ''
}

// 演示数据 — 各目标有显著差异
function loadDemoData() {
  const now = new Date()
  const baseStart = new Date(now)
  baseStart.setHours(8, 0, 0, 0)

  function t(hour: number, day = 0) {
    return new Date(baseStart.getTime() + day * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000)
  }

  function makePlan(
    id: string,
    name: string,
    utilization: number,
    otd: number,
    changeover: number,
    groups: number,
    items: ScheduleItemDto[]
  ): SchedulePlanDto {
    return {
      id,
      planName: name,
      planStartDate: baseStart.toISOString(),
      planEndDate: new Date(baseStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      overallUtilizationRate: utilization,
      onTimeDeliveryRate: otd,
      totalChangeoverMinutes: changeover,
      groupCount: groups,
      createdAt: now.toISOString(),
      items,
    }
  }

  const allEquipment: EquipmentDto[] = [
    { id: 'EQ-001', equipmentCode: 'CNC-001', equipmentName: 'CNC-001 加工中心', equipmentType: 'CNC', status: 'Running', capacity: 100, utilizationRate: 0 },
    { id: 'EQ-002', equipmentCode: 'CNC-002', equipmentName: 'CNC-002 加工中心', equipmentType: 'CNC', status: 'Running', capacity: 100, utilizationRate: 0 },
    { id: 'EQ-003', equipmentCode: 'INJ-001', equipmentName: '注塑机', equipmentType: 'InjectionMolding', status: 'Running', capacity: 200, utilizationRate: 0 },
    { id: 'EQ-004', equipmentCode: 'ASM-001', equipmentName: '装配线-1', equipmentType: 'Assembly', status: 'Running', capacity: 150, utilizationRate: 0 },
    { id: 'EQ-005', equipmentCode: 'HT-001', equipmentName: '热处理炉', equipmentType: 'HeatTreatment', status: 'Running', capacity: 80, utilizationRate: 0 },
  ]

  // 交期优先：工单按交期排列，短时间窗口集中，利用率低但准时率高
  const dueDateItems: ScheduleItemDto[] = [
    { id: 'dd-1', workOrderId: 'WO-001', workOrderNumber: 'WO-001\n转接座-A', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(12, 0).toISOString(), sequence: 1, setupTime: '30 分钟', dependentItems: [] },
    { id: 'dd-2', workOrderId: 'WO-002', workOrderNumber: 'WO-002\n阀体-B', equipmentId: 'EQ-002', equipmentName: 'CNC-002 加工中心', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(14, 0).toISOString(), sequence: 1, setupTime: '45 分钟', dependentItems: [] },
    { id: 'dd-3', workOrderId: 'WO-003', workOrderNumber: 'WO-003\n齿轮-C', equipmentId: 'EQ-003', equipmentName: '注塑机', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(16, 0).toISOString(), sequence: 1, setupTime: '30 分钟', dependentItems: [] },
    { id: 'dd-4', workOrderId: 'WO-004', workOrderNumber: 'WO-004\n转接座-B', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(13, 0).toISOString(), plannedEndTime: t(18, 0).toISOString(), sequence: 2, setupTime: '30 分钟', dependentItems: [] },
    { id: 'dd-5', workOrderId: 'WO-005', workOrderNumber: 'WO-005\n基座-D', equipmentId: 'EQ-004', equipmentName: '装配线-1', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(12, 0).toISOString(), sequence: 1, setupTime: '20 分钟', dependentItems: [] },
    { id: 'dd-6', workOrderId: 'WO-006', workOrderNumber: 'WO-006\n法兰-E', equipmentId: 'EQ-005', equipmentName: '热处理炉', plannedStartTime: t(10, 0).toISOString(), plannedEndTime: t(14, 0).toISOString(), sequence: 1, setupTime: '35 分钟', dependentItems: [] },
    { id: 'dd-7', workOrderId: 'WO-007', workOrderNumber: 'WO-007\n底座-F', equipmentId: 'EQ-003', equipmentName: '注塑机', plannedStartTime: t(17, 0).toISOString(), plannedEndTime: t(22, 0).toISOString(), sequence: 2, setupTime: '20 分钟', dependentItems: [] },
  ]

  // 利用率优先：设备满负荷，工单紧密排列，换线时间较少，利用率高
  const utilItems: ScheduleItemDto[] = [
    { id: 'ut-1', workOrderId: 'WO-001', workOrderNumber: 'WO-001\n转接座-A', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(20, 0).toISOString(), sequence: 1, setupTime: '15 分钟', dependentItems: [] },
    { id: 'ut-2', workOrderId: 'WO-002', workOrderNumber: 'WO-002\n阀体-B', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(20, 0).toISOString(), plannedEndTime: t(24, 0).toISOString(), sequence: 2, setupTime: '15 分钟', dependentItems: ['ut-1'] },
    { id: 'ut-3', workOrderId: 'WO-003', workOrderNumber: 'WO-003\n齿轮-C', equipmentId: 'EQ-002', equipmentName: 'CNC-002 加工中心', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(22, 0).toISOString(), sequence: 1, setupTime: '10 分钟', dependentItems: [] },
    { id: 'ut-4', workOrderId: 'WO-004', workOrderNumber: 'WO-004\n转接座-B', equipmentId: 'EQ-002', equipmentName: 'CNC-002 加工中心', plannedStartTime: t(8, 1).toISOString(), plannedEndTime: t(20, 1).toISOString(), sequence: 2, setupTime: '10 分钟', dependentItems: ['ut-3'] },
    { id: 'ut-5', workOrderId: 'WO-005', workOrderNumber: 'WO-005\n基座-D', equipmentId: 'EQ-003', equipmentName: '注塑机', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(24, 0).toISOString(), sequence: 1, setupTime: '15 分钟', dependentItems: [] },
    { id: 'ut-6', workOrderId: 'WO-006', workOrderNumber: 'WO-006\n法兰-E', equipmentId: 'EQ-004', equipmentName: '装配线-1', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(18, 0).toISOString(), sequence: 1, setupTime: '10 分钟', dependentItems: [] },
    { id: 'ut-7', workOrderId: 'WO-007', workOrderNumber: 'WO-007\n底座-F', equipmentId: 'EQ-005', equipmentName: '热处理炉', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(16, 0).toISOString(), sequence: 1, setupTime: '15 分钟', dependentItems: [] },
  ]

  // 换线成本优先：相同工艺分组集中，换线时间最短，分组数最少
  const changeoverItems: ScheduleItemDto[] = [
    { id: 'co-1', workOrderId: 'WO-001', workOrderNumber: 'WO-001\n转接座-A', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(16, 0).toISOString(), sequence: 1, setupTime: '10 分钟', dependentItems: [] },
    { id: 'co-2', workOrderId: 'WO-004', workOrderNumber: 'WO-004\n转接座-B', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(16, 0).toISOString(), plannedEndTime: t(24, 0).toISOString(), sequence: 2, setupTime: '8 分钟', dependentItems: ['co-1'] },
    { id: 'co-3', workOrderId: 'WO-002', workOrderNumber: 'WO-002\n阀体-B', equipmentId: 'EQ-002', equipmentName: 'CNC-002 加工中心', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(18, 0).toISOString(), sequence: 1, setupTime: '10 分钟', dependentItems: [] },
    { id: 'co-4', workOrderId: 'WO-005', workOrderNumber: 'WO-005\n基座-D', equipmentId: 'EQ-002', equipmentName: 'CNC-002 加工中心', plannedStartTime: t(18, 0).toISOString(), plannedEndTime: t(24, 0).toISOString(), sequence: 2, setupTime: '10 分钟', dependentItems: ['co-3'] },
    { id: 'co-5', workOrderId: 'WO-003', workOrderNumber: 'WO-003\n齿轮-C', equipmentId: 'EQ-003', equipmentName: '注塑机', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(18, 0).toISOString(), sequence: 1, setupTime: '15 分钟', dependentItems: [] },
    { id: 'co-6', workOrderId: 'WO-007', workOrderNumber: 'WO-007\n底座-F', equipmentId: 'EQ-003', equipmentName: '注塑机', plannedStartTime: t(18, 0).toISOString(), plannedEndTime: t(24, 0).toISOString(), sequence: 2, setupTime: '15 分钟', dependentItems: ['co-5'] },
    { id: 'co-7', workOrderId: 'WO-006', workOrderNumber: 'WO-006\n法兰-E', equipmentId: 'EQ-004', equipmentName: '装配线-1', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(14, 0).toISOString(), sequence: 1, setupTime: '10 分钟', dependentItems: [] },
  ]

  // 综合平衡：各项指标折中
  const balancedItems: ScheduleItemDto[] = [
    { id: 'bl-1', workOrderId: 'WO-001', workOrderNumber: 'WO-001\n转接座-A', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(14, 0).toISOString(), sequence: 1, setupTime: '20 分钟', dependentItems: [] },
    { id: 'bl-2', workOrderId: 'WO-002', workOrderNumber: 'WO-002\n阀体-B', equipmentId: 'EQ-001', equipmentName: 'CNC-001 加工中心', plannedStartTime: t(14, 0).toISOString(), plannedEndTime: t(22, 0).toISOString(), sequence: 2, setupTime: '25 分钟', dependentItems: ['bl-1'] },
    { id: 'bl-3', workOrderId: 'WO-003', workOrderNumber: 'WO-003\n齿轮-C', equipmentId: 'EQ-002', equipmentName: 'CNC-002 加工中心', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(16, 0).toISOString(), sequence: 1, setupTime: '20 分钟', dependentItems: [] },
    { id: 'bl-4', workOrderId: 'WO-004', workOrderNumber: 'WO-004\n转接座-B', equipmentId: 'EQ-002', equipmentName: 'CNC-002 加工中心', plannedStartTime: t(16, 0).toISOString(), plannedEndTime: t(22, 0).toISOString(), sequence: 2, setupTime: '20 分钟', dependentItems: ['bl-3'] },
    { id: 'bl-5', workOrderId: 'WO-005', workOrderNumber: 'WO-005\n基座-D', equipmentId: 'EQ-003', equipmentName: '注塑机', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(16, 0).toISOString(), sequence: 1, setupTime: '30 分钟', dependentItems: [] },
    { id: 'bl-6', workOrderId: 'WO-006', workOrderNumber: 'WO-006\n法兰-E', equipmentId: 'EQ-004', equipmentName: '装配线-1', plannedStartTime: t(8, 0).toISOString(), plannedEndTime: t(14, 0).toISOString(), sequence: 1, setupTime: '15 分钟', dependentItems: ['bl-5'] },
    { id: 'bl-7', workOrderId: 'WO-007', workOrderNumber: 'WO-007\n底座-F', equipmentId: 'EQ-005', equipmentName: '热处理炉', plannedStartTime: t(10, 0).toISOString(), plannedEndTime: t(16, 0).toISOString(), sequence: 1, setupTime: '25 分钟', dependentItems: [] },
  ]

  const plans: Record<string, SchedulePlanDto> = {
    due_date: makePlan('dd-plan', '交期优先方案', 0.68, 0.95, 580, 3, dueDateItems),
    utilization: makePlan('ut-plan', '利用率优先方案', 0.88, 0.70, 420, 2, utilItems),
    changeover: makePlan('co-plan', '换线成本优先方案', 0.72, 0.82, 320, 1, changeoverItems),
    balanced: makePlan('bl-plan', '综合平衡方案', 0.78, 0.88, 450, 3, balancedItems),
  }

  const itemList: ObjectiveCompareItem[] = ALL_OBJECTIVES.map(obj => ({
    objective: obj,
    objectiveLabel: OBJECTIVE_LABELS[obj],
    plan: plans[obj],
    utilizationRate: plans[obj].overallUtilizationRate,
    onTimeDeliveryRate: plans[obj].onTimeDeliveryRate ?? 0,
    totalChangeoverMinutes: plans[obj].totalChangeoverMinutes ?? 0,
    groupCount: plans[obj].groupCount ?? 0,
    estimatedCompletionRate: obj === 'due_date' ? 0.92 : obj === 'balanced' ? 0.85 : obj === 'utilization' ? 0.72 : 0.80,
    totalWorkOrders: plans[obj].items.length,
  }))

  items.value = itemList
  bestOverall.value = 'balanced'
  activeTab.value = 'due_date'

  // 转换甘特图数据
  for (const obj of ALL_OBJECTIVES) {
    ganttDataByObjective[obj] = planToGanttData(plans[obj], allEquipment)
  }
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    const result = await api.batchOptimize({
      workshopId: props.workshopId,
    })
    items.value = result.items
    bestOverall.value = result.bestOverallObjective ?? ''
    activeTab.value = result.items[0]?.objective ?? ''

    // 转换甘特图数据
    const equipment = await api.getEquipmentList().catch(() => [] as EquipmentDto[])
    for (const item of result.items) {
      ganttDataByObjective[item.objective] = planToGanttData(item.plan, equipment)
    }
  } catch (e: any) {
    console.error('批量优化对比失败，使用演示数据:', e)
    loadDemoData()
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (val) => {
  if (val) loadData()
})
</script>

<style scoped>
.compare-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.compare-container {
  background: white;
  border-radius: 8px;
  width: 95vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.compare-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 4px 8px;
}

.close-btn:hover {
  color: #333;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  color: #666;
}

.error-msg {
  padding: 16px 24px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  margin: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-msg button {
  padding: 4px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #999;
}

/* KPI 对比表 */
.kpi-table-section {
  padding: 16px 24px;
  flex-shrink: 0;
}

.kpi-table-section h3 {
  margin: 0 0 12px;
  font-size: 15px;
  color: #333;
}

.kpi-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.kpi-table th {
  background: #fafafa;
  padding: 10px 12px;
  text-align: center;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e8e8e8;
}

.kpi-table td {
  padding: 10px 12px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.kpi-table tbody tr:hover {
  background: #f0f9ff;
}

.kpi-table tbody tr.active-row {
  background: #e6f7ff;
}

.kpi-table tbody tr.best-row {
  border-left: 3px solid #52c41a;
}

.objective-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.obj-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.badge-blue { background: #1890ff; }
.badge-green { background: #52c41a; }
.badge-orange { background: #fa8c16; }
.badge-purple { background: #722ed1; }
.badge-gray { background: #999; }

.best-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
  font-weight: 500;
}

.best-cell {
  font-weight: 700;
  color: #52c41a;
}

.apply-btn {
  padding: 4px 12px;
  border: 1px solid #1890ff;
  border-radius: 3px;
  background: white;
  color: #1890ff;
  cursor: pointer;
  font-size: 12px;
}

.apply-btn:hover {
  background: #1890ff;
  color: white;
}

/* Tab 栏 */
.tab-bar {
  display: flex;
  padding: 0 24px;
  gap: 2px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #1890ff;
}

.tab-btn.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  font-weight: 500;
}

/* 甘特图区域 */
.compare-gantt-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 8px;
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
  to { transform: rotate(360deg); }
}
</style>
