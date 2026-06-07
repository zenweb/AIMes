import { describe, expect, it } from 'vitest'
import { detectConflicts, itemsToFlatTasks, planToGanttData } from '../../src/utils/gantt-mapper'
import type { EquipmentDto, ScheduleItemDto, SchedulePlanDto } from '../../src/types/scheduling'

function scheduleItem(overrides: Partial<ScheduleItemDto>): ScheduleItemDto {
  return {
    id: 'item-1',
    workOrderId: 'wo-1',
    workOrderNumber: 'WO-1',
    equipmentId: 'eq-cnc-1',
    equipmentName: 'CNC-1',
    plannedStartTime: '2026-05-31T08:00:00.000Z',
    plannedEndTime: '2026-05-31T09:00:00.000Z',
    sequence: 1,
    setupTime: '0 分钟',
    dependentItems: [],
    ...overrides,
  }
}

describe('gantt mapper', () => {
  it('marks every task overlapped by a longer earlier task on the same equipment', () => {
    const conflicts = detectConflicts([
      scheduleItem({
        id: 'long-run',
        workOrderNumber: 'WO-LONG',
        plannedStartTime: '2026-05-31T08:00:00.000Z',
        plannedEndTime: '2026-05-31T12:00:00.000Z',
      }),
      scheduleItem({
        id: 'short-a',
        workOrderNumber: 'WO-A',
        plannedStartTime: '2026-05-31T09:00:00.000Z',
        plannedEndTime: '2026-05-31T10:00:00.000Z',
      }),
      scheduleItem({
        id: 'short-b',
        workOrderNumber: 'WO-B',
        plannedStartTime: '2026-05-31T10:30:00.000Z',
        plannedEndTime: '2026-05-31T11:00:00.000Z',
      }),
    ])

    expect(conflicts.get('short-a')).toBe('与工单 WO-LONG 重叠 180 分钟')
    expect(conflicts.get('short-b')).toBe('与工单 WO-LONG 重叠 90 分钟')
  })

  it('converts hour and minute setup labels into auditable setup minutes', () => {
    const item = scheduleItem({
      setupTime: '1 小时 30 分钟',
    })
    const plan: SchedulePlanDto = {
      id: 'plan-1',
      planName: '审计排产计划',
      planStartDate: '2026-05-31T08:00:00.000Z',
      planEndDate: '2026-05-31T18:00:00.000Z',
      items: [item],
      overallUtilizationRate: 0.75,
      onTimeDeliveryRate: 0.95,
      createdAt: '2026-05-31T07:00:00.000Z',
    }
    const equipment: EquipmentDto[] = [
      {
        id: item.equipmentId,
        equipmentCode: 'CNC-1',
        equipmentName: item.equipmentName,
        equipmentType: 'Cnc',
        status: 'Available',
        capacity: 1,
        utilizationRate: 0.7,
      },
    ]

    const data = planToGanttData(plan, equipment)

    expect(data.tasks.find(task => task.id === item.id)?.setupMinutes).toBe(90)
  })

  it('converts decimal hour setup labels into auditable setup minutes', () => {
    const item = scheduleItem({
      setupTime: '1.5 小时',
    })
    const plan: SchedulePlanDto = {
      id: 'plan-decimal-setup',
      planName: '小数换型排产计划',
      planStartDate: '2026-05-31T08:00:00.000Z',
      planEndDate: '2026-05-31T18:00:00.000Z',
      items: [item],
      overallUtilizationRate: 0.75,
      onTimeDeliveryRate: 0.95,
      createdAt: '2026-05-31T07:00:00.000Z',
    }
    const equipment: EquipmentDto[] = [
      {
        id: item.equipmentId,
        equipmentCode: 'CNC-1',
        equipmentName: item.equipmentName,
        equipmentType: 'Cnc',
        status: 'Available',
        capacity: 1,
        utilizationRate: 0.7,
      },
    ]

    const data = planToGanttData(plan, equipment)

    expect(data.tasks.find(task => task.id === item.id)?.setupMinutes).toBe(90)
  })

  it('includes conflict markers in gantt tasks so every schedule view can audit overlaps', () => {
    const longRun = scheduleItem({
      id: 'long-run',
      workOrderNumber: 'WO-LONG',
      plannedStartTime: '2026-05-31T08:00:00.000Z',
      plannedEndTime: '2026-05-31T12:00:00.000Z',
    })
    const overlapped = scheduleItem({
      id: 'short-a',
      workOrderNumber: 'WO-A',
      plannedStartTime: '2026-05-31T09:00:00.000Z',
      plannedEndTime: '2026-05-31T10:00:00.000Z',
    })
    const plan: SchedulePlanDto = {
      id: 'plan-conflict',
      planName: '冲突排产计划',
      planStartDate: '2026-05-31T08:00:00.000Z',
      planEndDate: '2026-05-31T18:00:00.000Z',
      items: [longRun, overlapped],
      overallUtilizationRate: 0.75,
      onTimeDeliveryRate: 0.95,
      createdAt: '2026-05-31T07:00:00.000Z',
    }
    const equipment: EquipmentDto[] = [
      {
        id: longRun.equipmentId,
        equipmentCode: 'CNC-1',
        equipmentName: longRun.equipmentName,
        equipmentType: 'Cnc',
        status: 'Available',
        capacity: 1,
        utilizationRate: 0.7,
      },
    ]

    const data = planToGanttData(plan, equipment)

    expect(data.tasks.find(task => task.id === overlapped.id)).toEqual(expect.objectContaining({
      hasConflict: true,
      conflictMessage: '与工单 WO-LONG 重叠 180 分钟',
    }))
  })

  it('deduplicates repeated dependency links for a task', () => {
    const first = scheduleItem({
      id: 'op-10',
      workOrderNumber: 'WO-OP-10',
      sequence: 1,
    })
    const second = scheduleItem({
      id: 'op-20',
      workOrderNumber: 'WO-OP-20',
      sequence: 2,
      plannedStartTime: '2026-05-31T10:00:00.000Z',
      plannedEndTime: '2026-05-31T11:00:00.000Z',
      dependentItems: ['op-10', 'op-10'],
    })
    const plan: SchedulePlanDto = {
      id: 'plan-links',
      planName: '依赖排产计划',
      planStartDate: '2026-05-31T08:00:00.000Z',
      planEndDate: '2026-05-31T18:00:00.000Z',
      items: [first, second],
      overallUtilizationRate: 0.75,
      onTimeDeliveryRate: 0.95,
      createdAt: '2026-05-31T07:00:00.000Z',
    }
    const equipment: EquipmentDto[] = [
      {
        id: first.equipmentId,
        equipmentCode: 'CNC-1',
        equipmentName: first.equipmentName,
        equipmentType: 'Cnc',
        status: 'Available',
        capacity: 1,
        utilizationRate: 0.7,
      },
    ]

    const data = planToGanttData(plan, equipment)

    expect(data.links).toEqual([
      {
        id: 'link-op-10-op-20',
        source: 'op-10',
        target: 'op-20',
        type: '0',
      },
    ])
  })

  it('flags tasks whose planned end is before planned start instead of silently normalizing duration', () => {
    const invalidItem = scheduleItem({
      id: 'invalid-window',
      workOrderNumber: 'WO-BAD-TIME',
      plannedStartTime: '2026-05-31T12:00:00.000Z',
      plannedEndTime: '2026-05-31T10:00:00.000Z',
    })
    const plan: SchedulePlanDto = {
      id: 'plan-invalid-time',
      planName: '异常时间排产计划',
      planStartDate: '2026-05-31T08:00:00.000Z',
      planEndDate: '2026-05-31T18:00:00.000Z',
      items: [invalidItem],
      overallUtilizationRate: 0.75,
      onTimeDeliveryRate: 0.95,
      createdAt: '2026-05-31T07:00:00.000Z',
    }
    const equipment: EquipmentDto[] = [
      {
        id: invalidItem.equipmentId,
        equipmentCode: 'CNC-1',
        equipmentName: invalidItem.equipmentName,
        equipmentType: 'Cnc',
        status: 'Available',
        capacity: 1,
        utilizationRate: 0.7,
      },
    ]

    const data = planToGanttData(plan, equipment)

    expect(data.tasks.find(task => task.id === invalidItem.id)).toEqual(expect.objectContaining({
      duration: 0.01,
      hasConflict: true,
      conflictMessage: '计划结束时间早于计划开始时间',
    }))
  })

  it('flags invalid time windows when mapping flat gantt tasks', () => {
    const invalidItem = scheduleItem({
      id: 'flat-invalid-window',
      workOrderNumber: 'WO-FLAT-BAD-TIME',
      plannedStartTime: '2026-05-31T12:00:00.000Z',
      plannedEndTime: '2026-05-31T10:00:00.000Z',
    })

    const tasks = itemsToFlatTasks([invalidItem])

    expect(tasks[0]).toEqual(expect.objectContaining({
      duration: 0.01,
      hasConflict: true,
      conflictMessage: '计划结束时间早于计划开始时间',
    }))
  })

  it('keeps setup minutes when mapping flat gantt tasks', () => {
    const item = scheduleItem({
      id: 'flat-setup',
      workOrderNumber: 'WO-FLAT-SETUP',
      setupTime: '1 小时 30 分钟',
    })

    const tasks = itemsToFlatTasks([item])

    expect(tasks[0]).toEqual(expect.objectContaining({
      setupMinutes: 90,
    }))
  })
})
