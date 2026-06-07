/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'dhtmlx-gantt' {
  import type { GanttData, GanttTask } from './types/scheduling'

  type GanttScaleUnit = 'day' | 'week' | 'month'
  type GanttSubscaleUnit = 'hour' | 'day'
  type GanttTemplate = (start: Date, end: Date, task: GanttTask) => string

  interface GanttConfig {
    date_format: string
    drag_project: boolean
    drag_links: boolean
    round_dnd_dates: boolean
    show_quick_info: boolean
    auto_scheduling: boolean
    details_on_create: boolean
    details_on_dblclick: boolean
    scale_unit: GanttScaleUnit
    date_scale: string
    subscales: Array<{ unit: GanttSubscaleUnit, step: number, date: string }>
    columns: Array<{
      name: string
      label: string
      tree?: boolean
      align?: 'center'
      width: number
    }>
    min_column_width: number
    time_step: number
    limit_move: boolean
    limit_drag: boolean
  }

  interface GanttTemplates {
    grid_row_class: GanttTemplate
    timeline_cell_class: (task: GanttTask, date: Date) => string
    task_class: GanttTemplate
    progress_text: GanttTemplate
    task_text: GanttTemplate
    tooltip_text: GanttTemplate
  }

  interface GanttMessage {
    type: 'warning' | 'error'
    text: string
  }

  interface GanttApi {
    config: GanttConfig
    templates: GanttTemplates
    attachEvent(name: 'onTaskClick' | 'onTaskDblClick' | 'onBeforeTaskDrag', handler: (id: string) => unknown): void
    attachEvent(name: 'onTaskDrag', handler: (id: string, mode: unknown, task: GanttTask, original: GanttTask) => unknown): void
    attachEvent(name: 'onAfterTaskDrag', handler: (id: string, mode: unknown, task: GanttTask) => unknown): void
    clearAll(): void
    date: {
      parseDate(value: string | Date, format: string): Date
    }
    getTask(id: string): GanttTask
    getTaskByTime(): GanttTask[]
    init(container: HTMLElement): void
    message(message: GanttMessage): void
    parse(data: GanttData): void
    render(): void
  }

  const gantt: GanttApi
  export default gantt
}
