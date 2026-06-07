import { formatGanttDate } from '../utils/date'
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
  equipment: EquipmentDto[],
  bottlenecks?: Set<string>
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

  const bottleneckSet = bottlenecks ?? new Set(
    equipment.filter(e => e.utilizationRate >= 0.8 || e.equipmentType === 'HeatTreatment').map(e => e.id)
  )
  const conflicts = detectConflicts(plan.items)

  for (const eqId of usedEqIds) {
    const eq = eqMap.get(eqId)
    const isBottleneck = bottleneckSet.has(eqId)
    tasks.push({
      id: `eq-${eqId}`,
      text: eq?.equipmentName
        ? isBottleneck
          ? `🔴 ${eq.equipmentName} [瓶颈]`
          : eq.equipmentName
        : eqId,
      start_date: formatGanttDate(planStart),
      duration: totalDays,
      parent: '0',
      progress: 0,
      open: true,
      isOnBottleneck: isBottleneck,
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
    const invalidTimeWindow = end.getTime() <= start.getTime()

    const isBottleneck = bottleneckSet.has(item.equipmentId)
    const conflictMessage = invalidTimeWindow
      ? '计划结束时间早于计划开始时间'
      : conflicts.get(item.id)
    const task: GanttTask = {
      id: item.id,
      text: item.workOrderNumber,
      start_date: formatGanttDate(start),
      duration: durationDays,
      parent: `eq-${item.equipmentId}`,
      progress: 1,
      workOrderId: item.workOrderId,
      equipmentId: item.equipmentId,
      equipmentName: item.equipmentName,
      setupMinutes: parseSetupTime(item.setupTime),
      isOnBottleneck: isBottleneck,
      status: 'scheduled',
      hasConflict: !!conflictMessage,
      conflictMessage,
    }

    tasks.push(task)
    itemMap.set(item.id, item)
  }

  // 3. 依赖关系
  const linkIds = new Set<string>()
  for (const item of plan.items) {
    if (item.dependentItems && item.dependentItems.length > 0) {
      for (const depId of item.dependentItems) {
        if (itemMap.has(depId)) {
          const linkId = `link-${depId}-${item.id}`
          if (linkIds.has(linkId)) continue
          linkIds.add(linkId)
          links.push({
            id: linkId,
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
    const invalidTimeWindow = end.getTime() <= start.getTime()

    return {
      id: item.id,
      text: `${item.workOrderNumber} [${item.equipmentName}]`,
      start_date: formatGanttDate(start),
      duration: durationDays,
      parent: '0',
      progress: 1,
      workOrderId: item.workOrderId,
      equipmentId: item.equipmentId,
      equipmentName: item.equipmentName,
      setupMinutes: parseSetupTime(item.setupTime),
      isOnBottleneck: false,
      hasConflict: invalidTimeWindow,
      conflictMessage: invalidTimeWindow ? '计划结束时间早于计划开始时间' : undefined,
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

    let activeItem = sorted[0]
    let activeEnd = new Date(activeItem.plannedEndTime).getTime()

    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i]
      const currStart = new Date(curr.plannedStartTime).getTime()
      const currEnd = new Date(curr.plannedEndTime).getTime()

      if (currStart < activeEnd) {
        const overlap = activeEnd - currStart
        const overlapMin = Math.round(overlap / 60000)
        conflicts.set(
          curr.id,
          `与工单 ${activeItem.workOrderNumber} 重叠 ${overlapMin} 分钟`
        )
      }

      if (currEnd > activeEnd) {
        activeItem = curr
        activeEnd = currEnd
      }
    }
  }

  return conflicts
}

function parseSetupTime(setupTime: string): number {
  const hourMatch = setupTime.match(/(\d+(?:\.\d+)?)\s*(?:小时|h)/i)
  const minuteMatch = setupTime.match(/(\d+(?:\.\d+)?)\s*(?:分钟|分|min|m)/i)
  if (hourMatch || minuteMatch) {
    const hours = hourMatch ? Number.parseFloat(hourMatch[1]) * 60 : 0
    const minutes = minuteMatch ? Number.parseFloat(minuteMatch[1]) : 0
    return Math.round(hours + minutes)
  }

  const match = setupTime.match(/(\d+(?:\.\d+)?)/)
  return match ? Math.round(Number.parseFloat(match[1])) : 0
}

// dhtmlx-gantt 日期格式工具
export const ganttDateHelpers = {
  toDate(date: string | Date): Date {
    return typeof date === 'string' ? new Date(date) : date
  },
  toTaskDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return formatGanttDate(d)
  },
  addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },
}
