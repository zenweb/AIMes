import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GanttData } from '../../src/types/scheduling'
import { installMemoryLocalStorage } from './test-storage'

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
const offlineDemoMode = vi.hoisted(() => ({ value: false }))
const accessToken = vi.hoisted(() => ({ value: null as string | null }))

vi.mock('dhtmlx-gantt', () => ({
  default: ganttMock,
}))

vi.mock('../../src/utils/auth-token', () => ({
  getLocalAccessToken: vi.fn(() => accessToken.value),
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  shouldSkipBackendForOfflineDemo: vi.fn((token: string | null) => offlineDemoMode.value && (!token || token.startsWith('demo-token-'))),
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
    installMemoryLocalStorage()
    localStorage.clear()
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
    offlineDemoMode.value = false
    accessToken.value = null
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

  it('guides schedule drag changes with bilingual prompts, related links, and help support', async () => {
    const wrapper = await mountGanttChart('true')

    const guidance = wrapper.get('.gantt-drag-guidance')
    expect(guidance.attributes('id')).toBe('gantt-drag-help')
    expect(guidance.text()).toContain('拖拽排产前，请核对锁定期、设备冲突、工序依赖和回写证据。')
    expect(guidance.text()).toContain('Before dragging schedule tasks, verify lock window, equipment conflicts, operation dependencies, and writeback evidence.')
    expect(wrapper.get('.gantt-e2e-markers').attributes('aria-describedby')).toBe('gantt-drag-help')

    const links = guidance.findAll('a')
    expect(links.map(link => link.text())).toEqual([
      'AI 排产 / Scheduling',
      '审计回放 / Audit trail',
      '报表证据 / Report evidence',
      '帮助 / Help',
    ])
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/scheduling',
      '/audit-logs',
      '/report',
      '#gantt-drag-help',
    ])
  })

  it('emits task clicks from lightweight markers so offline demo users can inspect task details', async () => {
    const wrapper = await mountGanttChart('true')

    const task = wrapper.get('.gantt_task_line')
    await task.trigger('click')
    await task.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('taskClick')).toEqual([['task-1'], ['task-1']])
  })

  it('emits task double-clicks from lightweight markers with the same task detail semantics as dhtmlx', async () => {
    const wrapper = await mountGanttChart('true')

    await wrapper.get('.gantt_task_line').trigger('dblclick')

    expect(wrapper.emitted('taskDblClick')).toEqual([['task-1']])
  })

  it('honors explicit live mode so demo hints do not block real dhtmlx evidence', async () => {
    offlineDemoMode.value = false
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => key === 'aimes_offline_demo' ? 'false' : null),
    })

    const wrapper = await mountGanttChart('true')

    expect(wrapper.get('.gantt-e2e-markers').classes()).not.toContain('visible')
    expect(ganttMock.init).toHaveBeenCalled()
    expect(ganttMock.parse).toHaveBeenCalled()
  })

  it('uses real dhtmlx gantt when stale offline demo storage coexists with a real backend token', async () => {
    offlineDemoMode.value = true
    accessToken.value = 'backend-access-token'

    const wrapper = await mountGanttChart('true')

    expect(wrapper.get('.gantt-e2e-markers').classes()).not.toContain('visible')
    expect(ganttMock.init).toHaveBeenCalled()
    expect(ganttMock.parse).toHaveBeenCalled()
  })

  it('keeps lightweight gantt for explicit demo sessions with demo tokens', async () => {
    offlineDemoMode.value = true
    accessToken.value = 'demo-token-admin'

    const wrapper = await mountGanttChart('false')

    expect(wrapper.get('.gantt-e2e-markers').classes()).toContain('visible')
    expect(ganttMock.init).not.toHaveBeenCalled()
  })

  it('honors URL live mode so demo hints do not block shared real-browser links', async () => {
    offlineDemoMode.value = false
    vi.stubGlobal('location', new URL('https://aimes.local/scheduling?offlineDemo=false'))
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
    })

    const wrapper = await mountGanttChart('true')

    expect(wrapper.get('.gantt-e2e-markers').classes()).not.toContain('visible')
    expect(ganttMock.init).toHaveBeenCalled()
    expect(ganttMock.parse).toHaveBeenCalled()
  })

  it('keeps real gantt usable when offline demo storage cannot be read', async () => {
    offlineDemoMode.value = false
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('offline demo storage unavailable')
      }),
    })

    const wrapper = await mountGanttChart('true')

    expect(wrapper.get('.gantt-e2e-markers').classes()).not.toContain('visible')
    expect(ganttMock.init).toHaveBeenCalled()
    expect(ganttMock.parse).toHaveBeenCalled()
  })

  it('keeps real gantt usable when the browser storage handle itself is unavailable', async () => {
    offlineDemoMode.value = false
    vi.stubEnv('VITE_SHOW_DEMO_HINTS', 'true')
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('localStorage handle unavailable')
      },
    })

    const { default: GanttChart } = await import('../../src/components/gantt/GanttChart.vue')
    const wrapper = mount(GanttChart, {
      props: {
        data: ganttData,
        lockPeriodHours: 8,
      },
    })

    expect(wrapper.get('.gantt-e2e-markers').classes()).not.toContain('visible')
    expect(ganttMock.init).toHaveBeenCalled()
    expect(ganttMock.parse).toHaveBeenCalled()
  })

  it('emits a drag conflict when a moved task overlaps another task on the same equipment', async () => {
    const movedTask = {
      id: 'task-1',
      text: 'WO-001 阀体加工',
      start_date: new Date('2026-06-02T10:00:00.000Z'),
      end_date: new Date('2026-06-03T10:00:00.000Z'),
      duration: 1,
      parent: 'eq-1',
      progress: 0.5,
    }
    const conflictTask = {
      id: 'task-2',
      text: 'WO-002 复检',
      start_date: new Date('2026-06-02T18:00:00.000Z'),
      end_date: new Date('2026-06-03T18:00:00.000Z'),
      duration: 1,
      parent: 'eq-1',
      progress: 0.2,
    }
    ganttMock.getTaskByTime.mockReturnValue([movedTask, conflictTask])
    ganttMock.getTask.mockReturnValue(movedTask)
    const wrapper = await mountGanttChart('false', { lockPeriodHours: 0 })

    const afterDrag = ganttEvents.get('onAfterTaskDrag')
    expect(afterDrag).toBeDefined()

    afterDrag?.('task-1', 'move', new Event('mouseup'))

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
      start_date: new Date('2026-06-02T10:00:00.000Z'),
      end_date: new Date('2026-06-03T10:00:00.000Z'),
      duration: 1,
      parent: 'eq-1',
      progress: 0.5,
    }
    ganttMock.getTaskByTime.mockReturnValue([movedTask])
    ganttMock.getTask.mockReturnValue(movedTask)
    const wrapper = await mountGanttChart('false', { lockPeriodHours: 0 })

    const afterDrag = ganttEvents.get('onAfterTaskDrag')
    expect(afterDrag).toBeDefined()
    ganttMock.render.mockImplementationOnce(() => {
      throw new Error('drag render unavailable')
    })

    afterDrag?.('task-1', 'move', new Event('mouseup'))
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
      start_date: new Date('2026-06-02T07:30:00.000Z'),
      end_date: new Date('2026-06-02T08:30:00.000Z'),
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

  it('emits real dhtmlx task click and double-click only for work-order tasks', async () => {
    const equipmentRow = {
      id: 'eq-1',
      text: 'CNC-01',
      start_date: new Date('2026-06-02T08:00:00.000Z'),
      duration: 1,
      parent: '0',
      progress: 0,
    }
    const workOrderTask = {
      id: 'task-1',
      text: 'WO-001 阀体加工',
      start_date: new Date('2026-06-02T10:00:00.000Z'),
      duration: 1,
      parent: 'eq-1',
      progress: 0.5,
    }
    ganttMock.getTask.mockImplementation((id: string) => id === 'eq-1' ? equipmentRow : workOrderTask)
    const wrapper = await mountGanttChart('false', { lockPeriodHours: 0 })

    const taskClick = ganttEvents.get('onTaskClick')
    const taskDblClick = ganttEvents.get('onTaskDblClick')
    expect(taskClick).toBeDefined()
    expect(taskDblClick).toBeDefined()

    expect(taskClick?.('eq-1')).toBe(true)
    expect(taskDblClick?.('eq-1')).toBe(false)
    expect(taskClick?.('task-1')).toBe(true)
    expect(taskDblClick?.('task-1')).toBe(false)

    expect(wrapper.emitted('taskClick')).toEqual([['task-1']])
    expect(wrapper.emitted('taskDblClick')).toEqual([['task-1']])
  })

  it('ignores stale dhtmlx task click callbacks after the schedule refresh removes a task', async () => {
    ganttMock.getTask.mockReturnValue(undefined)
    const wrapper = await mountGanttChart('false', { lockPeriodHours: 0 })

    const taskClick = ganttEvents.get('onTaskClick')
    const taskDblClick = ganttEvents.get('onTaskDblClick')
    expect(taskClick).toBeDefined()
    expect(taskDblClick).toBeDefined()

    expect(taskClick?.('removed-task')).toBe(true)
    expect(taskDblClick?.('removed-task')).toBe(false)

    expect(wrapper.emitted('taskClick')).toBeUndefined()
    expect(wrapper.emitted('taskDblClick')).toBeUndefined()
  })

  it('allows dragging unlocked work-order tasks and clears stale conflict markers before drag starts', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-02T08:00:00.000Z'))
    const unlockedTask = {
      id: 'task-1',
      text: 'WO-001 阀体加工',
      start_date: new Date('2026-06-02T18:00:00.000Z'),
      end_date: new Date('2026-06-02T20:00:00.000Z'),
      duration: 1,
      parent: 'eq-1',
      progress: 0.5,
    }
    const staleMarkedTask = {
      id: 'task-2',
      text: 'WO-002 旧冲突标记',
      start_date: new Date('2026-06-02T20:00:00.000Z'),
      duration: 1,
      parent: 'eq-1',
      progress: 0.2,
      $css: 'gantt-task-drag-conflict',
    }
    ganttMock.getTask.mockReturnValue(unlockedTask)
    ganttMock.getTaskByTime.mockReturnValue([unlockedTask, staleMarkedTask])
    const wrapper = await mountGanttChart('false', { lockPeriodHours: 8 })

    const beforeDrag = ganttEvents.get('onBeforeTaskDrag')
    expect(beforeDrag).toBeDefined()

    expect(beforeDrag?.('task-1')).toBe(true)

    expect(staleMarkedTask.$css).toBeUndefined()
    expect(wrapper.emitted('taskDragStart')).toEqual([['task-1']])
    expect(ganttMock.message).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('marks and clears live drag conflict styling against sibling tasks on the same equipment', async () => {
    const draggedTask = {
      id: 'task-1',
      text: 'WO-001 阀体加工',
      start_date: new Date('2026-06-02T10:00:00.000Z'),
      end_date: new Date('2026-06-02T12:00:00.000Z'),
      duration: 1,
      parent: 'eq-1',
      progress: 0.5,
    }
    const conflictTask = {
      id: 'task-2',
      text: 'WO-002 复检',
      start_date: new Date('2026-06-02T11:00:00.000Z'),
      end_date: new Date('2026-06-02T13:00:00.000Z'),
      duration: 1,
      parent: 'eq-1',
      progress: 0.2,
    }
    const otherEquipmentTask = {
      id: 'task-3',
      text: 'WO-003 其他设备',
      start_date: new Date('2026-06-02T11:00:00.000Z'),
      end_date: new Date('2026-06-02T13:00:00.000Z'),
      duration: 1,
      parent: 'eq-2',
      progress: 0.2,
    }
    ganttMock.getTaskByTime.mockReturnValue([draggedTask, conflictTask, otherEquipmentTask])
    await mountGanttChart('false', { lockPeriodHours: 0 })

    const onTaskDrag = ganttEvents.get('onTaskDrag')
    expect(onTaskDrag).toBeDefined()

    expect(onTaskDrag?.('task-1', 'move', draggedTask, draggedTask)).toBe(true)
    expect(draggedTask.$css).toBe('gantt-task-drag-conflict')

    conflictTask.start_date = new Date('2026-06-02T13:30:00.000Z')
    conflictTask.end_date = new Date('2026-06-02T14:30:00.000Z')
    expect(onTaskDrag?.('task-1', 'move', draggedTask, draggedTask)).toBe(true)
    expect(draggedTask.$css).toBeUndefined()
  })

  it('applies the initial scale prop before the first gantt render', async () => {
    await mountGanttChart('false', { scale: 'week' })

    expect(ganttMock.config.scale_unit).toBe('week')
    expect(ganttMock.config.date_scale).toBe('第%W周')
    expect(ganttMock.config.subscales).toEqual([
      { unit: 'day', step: 1, date: '%m-%d' },
    ])
  })

  it('switches to month scale when planners review the longer capacity window', async () => {
    const wrapper = await mountGanttChart('false', { scale: 'day' })

    await wrapper.setProps({ scale: 'month' })

    expect(ganttMock.config.scale_unit).toBe('month')
    expect(ganttMock.config.date_scale).toBe('%Y年%m月')
    expect(ganttMock.config.subscales).toEqual([
      { unit: 'day', step: 7, date: '%m-%d' },
    ])
    expect(ganttMock.render).toHaveBeenCalled()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('maps internal gantt tasks to the dhtmlx data field before parsing real gantt data', async () => {
    await mountGanttChart('false')

    const payload = ganttMock.parse.mock.calls[0][0] as { data: GanttData['tasks']; links: GanttData['links'] }
    expect(payload.data.map(task => task.id)).toEqual(ganttData.tasks.map(task => task.id))
    expect(payload.data[0]).toEqual(expect.objectContaining({
      duration: 24,
      end_date: '2026-06-03 08:00',
    }))
    expect(payload.links).toEqual(ganttData.links)
  })

  it('passes cloned gantt records so dhtmlx mutations cannot retrigger the deep data watcher', async () => {
    await mountGanttChart('false')

    const payload = ganttMock.parse.mock.calls[0][0] as { data: GanttData['tasks']; links: GanttData['links'] }
    expect(payload.data.map(task => task.id)).toEqual(ganttData.tasks.map(task => task.id))
    expect(payload.links).toEqual(ganttData.links)
    expect(payload.data).not.toBe(ganttData.tasks)
    expect(payload.links).not.toBe(ganttData.links)
    expect(payload.data[0]).not.toBe(ganttData.tasks[0])
    expect(payload.links[0]).not.toBe(ganttData.links[0])
  })

  it('converts fractional-day internal durations to hour-based dhtmlx tasks with explicit end dates', async () => {
    await mountGanttChart('false', {
      data: {
        tasks: [
          {
            id: 'task-short',
            text: 'WO-SHORT',
            start_date: '2026-06-02 08:00',
            duration: 0.25,
            parent: 'eq-1',
            progress: 1,
          },
        ],
        links: [],
      },
    })

    const payload = ganttMock.parse.mock.calls[0][0] as { data: GanttData['tasks']; links: GanttData['links'] }
    expect(ganttMock.config.duration_unit).toBe('hour')
    expect(payload.data[0]).toEqual(expect.objectContaining({
      duration: 6,
      end_date: '2026-06-02 14:00',
    }))
  })

  it('derives dhtmlx duration from explicit task end dates so real schedule windows stay authoritative', async () => {
    await mountGanttChart('false', {
      data: {
        tasks: [
          {
            id: 'task-overtime',
            text: 'WO-OVERTIME',
            start_date: '2026-06-02 08:00',
            end_date: '2026-06-02 20:00',
            duration: 1,
            parent: 'eq-1',
            progress: 0.2,
          },
        ],
        links: [],
      },
    })

    const payload = ganttMock.parse.mock.calls[0][0] as { data: GanttData['tasks']; links: GanttData['links'] }
    expect(payload.data[0]).toEqual(expect.objectContaining({
      duration: 12,
      end_date: '2026-06-02 20:00',
    }))
  })

  it('shows work-order tooltip duration in hours so planners do not read hour-based schedules as days', async () => {
    await mountGanttChart('false', {
      data: {
        tasks: [
          {
            id: 'task-overtime',
            text: 'WO-OVERTIME',
            start_date: '2026-06-02 08:00',
            end_date: '2026-06-02 20:00',
            duration: 1,
            parent: 'eq-1',
            progress: 0.2,
            equipmentId: 'EQ-01',
            equipmentName: 'CNC-01',
          },
        ],
        links: [],
      },
    })

    const payload = ganttMock.parse.mock.calls[0][0] as { data: GanttData['tasks']; links: GanttData['links'] }
    const tooltipText = ganttMock.templates.tooltip_text?.(new Date(), new Date(), payload.data[0])

    expect(tooltipText).toContain('<b>工期:</b> 12 小时')
    expect(tooltipText).not.toContain('12 天')
  })

  it('does not reload gantt data when dhtmlx annotates parsed tasks', async () => {
    ganttMock.parse.mockImplementationOnce((payload: { data: Array<Record<string, unknown>> }) => {
      payload.data[0].$rendered_type = 'project'
    })

    await mountGanttChart('false')
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(ganttMock.parse).toHaveBeenCalledTimes(1)
  })

  it('uses the mapper root id so real dhtmlx renders top-level equipment rows', async () => {
    await mountGanttChart('false')

    expect(ganttMock.config.root_id).toBe('0')
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

  it('alerts when real gantt initialization fails before parsing schedule data', async () => {
    ganttMock.init.mockImplementationOnce(() => {
      throw new Error('gantt init unavailable')
    })

    const wrapper = await mountGanttChart('false')

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('甘特图初始化失败')
    expect(alert.text()).toContain('gantt init unavailable')
    expect(ganttMock.parse).not.toHaveBeenCalled()
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

  it('clears real dhtmlx data on unmount so stale schedules cannot remain in the next route', async () => {
    const wrapper = await mountGanttChart('false')

    expect(ganttMock.clearAll).toHaveBeenCalledTimes(1)
    expect(ganttMock.parse).toHaveBeenCalledTimes(1)

    wrapper.unmount()

    expect(ganttMock.clearAll).toHaveBeenCalledTimes(2)
  })
})
