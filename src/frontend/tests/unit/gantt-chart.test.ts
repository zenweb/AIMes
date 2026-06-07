import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GanttData } from '../../src/types/scheduling'

const ganttEvents = vi.hoisted(() => new Map<string, (...args: unknown[]) => unknown>())
const ganttMock = vi.hoisted(() => ({
  config: {},
  templates: {},
  attachEvent: vi.fn((name: string, handler: (...args: unknown[]) => unknown) => {
    ganttEvents.set(name, handler)
    return `event-${name}`
  }),
  clearAll: vi.fn(),
  date: {
    parseDate: vi.fn((value: string | Date) => new Date(value)),
  },
  detachEvent: vi.fn(),
  getTask: vi.fn(),
  getTaskByTime: vi.fn(() => []),
  init: vi.fn(),
  message: vi.fn(),
  parse: vi.fn(),
  render: vi.fn(),
}))

vi.mock('dhtmlx-gantt', () => ({
  default: ganttMock,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoMode: vi.fn(() => false),
}))

const ganttData: GanttData = {
  tasks: [
    {
      id: 'eq-1',
      text: 'CNC-01',
      start_date: '2026-06-02 08:00',
      duration: 1,
      parent: '0',
      progress: 0,
      open: true,
    },
    {
      id: 'task-1',
      text: 'WO-001 阀体加工',
      start_date: '2026-06-02 08:00',
      duration: 1,
      parent: 'eq-1',
      progress: 0.5,
    },
  ],
  links: [{ id: 'link-1', source: 'task-1', target: 'task-2', type: '0' }],
}

describe('GanttChart', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    ganttEvents.clear()
    ganttMock.config = {}
    ganttMock.templates = {}
    ganttMock.attachEvent.mockClear()
    ganttMock.clearAll.mockClear()
    ganttMock.date.parseDate.mockClear()
    ganttMock.detachEvent.mockClear()
    ganttMock.getTask.mockReset()
    ganttMock.getTaskByTime.mockReset()
    ganttMock.getTaskByTime.mockReturnValue([])
    ganttMock.init.mockClear()
    ganttMock.message.mockClear()
    ganttMock.parse.mockClear()
    ganttMock.render.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function mountGanttChart(showDemoHints = 'true', props: Partial<InstanceType<typeof import('../../src/components/gantt/GanttChart.vue')['default']>['$props']> = {}) {
    vi.stubEnv('VITE_SHOW_DEMO_HINTS', showDemoHints)
    const { default: GanttChart } = await import('../../src/components/gantt/GanttChart.vue')
    const wrapper = mount(GanttChart, {
      props: {
        data: ganttData,
        lockPeriodHours: 8,
        ...props,
      },
    })
    return wrapper
  }

  it('exposes lightweight gantt task markers as an accessible task list', async () => {
    const wrapper = await mountGanttChart('true')

    const markers = wrapper.get('.gantt-e2e-markers')
    expect(markers.classes()).toContain('visible')
    expect(markers.attributes('role')).toBe('list')
    expect(markers.attributes('aria-label')).toBe('轻量甘特图任务')

    const task = wrapper.get('.gantt_task_line')
    expect(task.attributes('role')).toBe('listitem')
    expect(task.attributes('aria-label')).toBe('甘特任务：WO-001 阀体加工')
    expect(wrapper.get('.gantt-lock-legend').text()).toContain('锁定期')
  })

  it('emits task clicks from lightweight markers so offline demo users can inspect task details', async () => {
    const wrapper = await mountGanttChart('true')

    const task = wrapper.get('.gantt_task_line')
    await task.trigger('click')
    await task.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('taskClick')).toEqual([['task-1'], ['task-1']])
  })

  it('emits a drag conflict when a moved task overlaps another task on the same equipment', async () => {
    const movedTask = {
      id: 'task-1',
      text: 'WO-001 阀体加工',
      start_date: '2026-06-02 10:00',
      duration: 1,
      parent: 'eq-1',
      progress: 0.5,
    }
    const conflictTask = {
      id: 'task-2',
      text: 'WO-002 复检',
      start_date: '2026-06-02 18:00',
      duration: 1,
      parent: 'eq-1',
      progress: 0.2,
    }
    ganttMock.getTaskByTime.mockReturnValue([movedTask, conflictTask])
    const wrapper = await mountGanttChart('false', { lockPeriodHours: 0 })

    const afterDrag = ganttEvents.get('onAfterTaskDrag')
    expect(afterDrag).toBeDefined()

    afterDrag?.('task-1', 'move', movedTask)

    expect(wrapper.emitted('taskDragConflict')).toEqual([['task-1', 'task-2']])
    expect(wrapper.emitted('taskDragEnd')?.[0][0]).toBe('task-1')
    expect(ganttMock.message).toHaveBeenCalledWith({
      type: 'error',
      text: '时间冲突：与工单 WO-002 复检 在同一设备上重叠',
    })
    expect(ganttMock.render).toHaveBeenCalled()
  })

  it('alerts when a dragged task cannot be rendered after conflict checks', async () => {
    const movedTask = {
      id: 'task-1',
      text: 'WO-001 阀体加工',
      start_date: '2026-06-02 10:00',
      duration: 1,
      parent: 'eq-1',
      progress: 0.5,
    }
    ganttMock.getTaskByTime.mockReturnValue([movedTask])
    const wrapper = await mountGanttChart('false', { lockPeriodHours: 0 })

    const afterDrag = ganttEvents.get('onAfterTaskDrag')
    expect(afterDrag).toBeDefined()
    ganttMock.render.mockImplementationOnce(() => {
      throw new Error('drag render unavailable')
    })

    afterDrag?.('task-1', 'move', movedTask)
    await wrapper.vm.$nextTick()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('甘特图拖拽刷新失败')
    expect(alert.text()).toContain('drag render unavailable')
    expect(wrapper.emitted('taskDragEnd')?.[0][0]).toBe('task-1')
  })

  it('blocks dragging a task that already overlaps the locked period', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-02T08:00:00.000Z'))
    const lockedTask = {
      id: 'task-1',
      text: 'WO-001 阀体加工',
      start_date: '2026-06-02 07:30',
      duration: 1,
      parent: 'eq-1',
      progress: 0.5,
    }
    ganttMock.getTask.mockReturnValue(lockedTask)
    const wrapper = await mountGanttChart('false', { lockPeriodHours: 8 })

    const beforeDrag = ganttEvents.get('onBeforeTaskDrag')
    expect(beforeDrag).toBeDefined()

    const allowed = beforeDrag?.('task-1')

    expect(allowed).toBe(false)
    expect(wrapper.emitted('taskDragStart')).toBeUndefined()
    expect(ganttMock.message).toHaveBeenCalledWith({
      type: 'warning',
      text: '该工单在锁定周期（8小时）内，不可拖拽',
    })
    vi.useRealTimers()
  })

  it('applies the initial scale prop before the first gantt render', async () => {
    await mountGanttChart('false', { scale: 'week' })

    expect(ganttMock.config.scale_unit).toBe('week')
    expect(ganttMock.config.date_scale).toBe('第%W周')
    expect(ganttMock.config.subscales).toEqual([
      { unit: 'day', step: 1, date: '%m-%d' },
    ])
  })

  it('alerts when gantt data cannot be parsed instead of crashing the schedule view', async () => {
    ganttMock.parse.mockImplementationOnce(() => {
      throw new Error('invalid gantt payload')
    })

    const wrapper = await mountGanttChart('false')

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('甘特图加载失败')
    expect(alert.text()).toContain('invalid gantt payload')
    expect(ganttMock.clearAll).toHaveBeenCalled()
  })

  it('alerts when changing the gantt scale cannot be rendered', async () => {
    const wrapper = await mountGanttChart('false', { scale: 'day' })
    ganttMock.render.mockImplementationOnce(() => {
      throw new Error('scale render unavailable')
    })

    await wrapper.setProps({ scale: 'month' })

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('甘特图时间刻度切换失败')
    expect(alert.text()).toContain('scale render unavailable')
    expect(ganttMock.config.scale_unit).toBe('month')
  })

  it('alerts when refreshing the locked period overlay cannot be rendered', async () => {
    const wrapper = await mountGanttChart('false', { lockPeriodHours: 8 })
    ganttMock.render.mockImplementationOnce(() => {
      throw new Error('lock overlay render unavailable')
    })

    await wrapper.setProps({ lockPeriodHours: 12 })

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('甘特图锁定期刷新失败')
    expect(alert.text()).toContain('lock overlay render unavailable')
  })

  it('alerts when the periodic locked period refresh cannot be rendered', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-02T08:00:00.000Z'))
    const wrapper = await mountGanttChart('false', { lockPeriodHours: 8 })
    ganttMock.render.mockImplementationOnce(() => {
      throw new Error('periodic lock refresh unavailable')
    })

    await vi.advanceTimersByTimeAsync(60000)

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('甘特图锁定期定时刷新失败')
    expect(alert.text()).toContain('periodic lock refresh unavailable')
  })

  it('detaches dhtmlx event handlers on unmount so stale gantt callbacks cannot leak across routes', async () => {
    const wrapper = await mountGanttChart('false')

    expect(ganttMock.attachEvent).toHaveBeenCalledTimes(5)

    wrapper.unmount()

    expect(ganttMock.detachEvent).toHaveBeenCalledTimes(5)
    expect(ganttMock.detachEvent).toHaveBeenCalledWith('event-onTaskClick')
    expect(ganttMock.detachEvent).toHaveBeenCalledWith('event-onTaskDblClick')
    expect(ganttMock.detachEvent).toHaveBeenCalledWith('event-onBeforeTaskDrag')
    expect(ganttMock.detachEvent).toHaveBeenCalledWith('event-onTaskDrag')
    expect(ganttMock.detachEvent).toHaveBeenCalledWith('event-onAfterTaskDrag')
  })
})
