import type {
  SchedulePlanDto,
  ScheduleItemDto,
  EquipmentDto,
  GanttTask,
  GanttLink,
  GanttData,
} from '../types/scheduling'

/**
 * 将排产计划 DTO 转换为 dhtmlx-gantt 数据格式
 *
 * 结构:
 * - 每个设备为一个 parent 分组
 * - 每个 ScheduleItem 为一个 task（bar），挂在对应设备 parent 下
 * - 依赖关系转换为 links
 */
export function planToGanttData(
  plan: SchedulePlanDto,
  equipment: EquipmentDto[]
): GanttData {
  const tasks: GanttTask[] = []
  const links: GanttLink[] = []

  // 1. 设备分组作为 parent
  const eqMap = new Map(equipment.map((e) => [e.id, e]))
  const usedEqIds = new Set(plan.items.map((i) => i.equipmentId))

  // 计算甘特图时间范围
  const planStart = new Date(plan.planStartDate)
  const planEnd = new Date(plan.planEndDate)
  const totalDays = Math.max(
    1,
    (planEnd.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24)
  )

  for (const eqId of usedEqIds) {
    const eq = eqMap.get(eqId)
    tasks.push({
      id: `eq-${eqId}`,
      text: eq?.equipmentName ?? eqId,
      start_date: formatDate(planStart),
      duration: totalDays,
      parent: '0',
      progress: 0,
      open: true,
    })
  }

  // 2. 排产项作为子任务
  const itemMap = new Map<string, ScheduleItemDto>()
  for (const item of plan.items) {
    const start = new Date(item.plannedStartTime)
    const end = new Date(item.plannedEndTime)
    const durationHours =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    const durationDays = Math.max(durationHours / 24, 0.01)

    const task: GanttTask = {
      id: item.id,
      text: item.workOrderNumber,
      start_date: formatDate(start),
      duration: durationDays,
      parent: `eq-${item.equipmentId}`,
      progress: 1,
      workOrderId: item.workOrderId,
      equipmentId: item.equipmentId,
      equipmentName: item.equipmentName,
      setupMinutes: parseSetupTime(item.setupTime),
      isOnBottleneck: false,
      status: 'scheduled',
    }

    tasks.push(task)
    itemMap.set(item.id, item)
  }

  // 3. 依赖关系
  for (const item of plan.items) {
    if (item.dependentItems && item.dependentItems.length > 0) {
      for (const depId of item.dependentItems) {
        if (itemMap.has(depId)) {
          links.push({
            id: `link-${depId}-${item.id}`,
            source: depId,
            target: item.id,
            type: '0', // 完成-开始
          })
        }
      }
    }
  }

  return { tasks, links }
}

/**
 * 将排产项映射为扁平的任务列表（不含设备分组）
 * 用于在甘特图中同时显示所有设备的项
 */
export function itemsToFlatTasks(items: ScheduleItemDto[]): GanttTask[] {
  return items.map((item) => {
    const start = new Date(item.plannedStartTime)
    const end = new Date(item.plannedEndTime)
    const durationHours =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    const durationDays = Math.max(durationHours / 24, 0.01)

    return {
      id: item.id,
      text: `${item.workOrderNumber} [${item.equipmentName}]`,
      start_date: formatDate(start),
      duration: durationDays,
      parent: '0',
      progress: 1,
      workOrderId: item.workOrderId,
      equipmentId: item.equipmentId,
      equipmentName: item.equipmentName,
      isOnBottleneck: false,
    }
  })
}

/**
 * 检测冲突：同一设备上时间重叠的排产项
 */
export function detectConflicts(
  items: ScheduleItemDto[]
): Map<string, string> {
  const conflicts = new Map<string, string>()
  const byEquipment = new Map<string, ScheduleItemDto[]>()

  for (const item of items) {
    const list = byEquipment.get(item.equipmentId) ?? []
    list.push(item)
    byEquipment.set(item.equipmentId, list)
  }

  for (const [, eqItems] of byEquipment) {
    const sorted = [...eqItems].sort(
      (a, b) =>
        new Date(a.plannedStartTime).getTime() -
        new Date(b.plannedStartTime).getTime()
    )

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      const prevEnd = new Date(prev.plannedEndTime).getTime()
      const currStart = new Date(curr.plannedStartTime).getTime()

      if (currStart < prevEnd) {
        const overlap = prevEnd - currStart
        const overlapMin = Math.round(overlap / 60000)
        conflicts.set(
          curr.id,
          `与工单 ${prev.workOrderNumber} 重叠 ${overlapMin} 分钟`
        )
      }
    }
  }

  return conflicts
}

// 辅助函数
function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

function parseSetupTime(setupTime: string): number {
  // "30 分钟" -> 30
  const match = setupTime.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

// dhtmlx-gantt 日期格式工具
export const ganttDateHelpers = {
  toDate(date: string | Date): Date {
    return typeof date === 'string' ? new Date(date) : date
  },
  toTaskDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return formatDate(d)
  },
  addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },
}
