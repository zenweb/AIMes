<template>
  <div ref="ganttContainer" class="gantt-container">
    <div v-if="ganttError" class="gantt-error" role="alert" aria-live="assertive">
      {{ ganttError }}
    </div>
    <div id="gantt-drag-help" class="gantt-drag-guidance">
      <p>
        拖拽排产前，请核对锁定期、设备冲突、工序依赖和回写证据。
        Before dragging schedule tasks, verify lock window, equipment conflicts, operation dependencies, and writeback evidence.
      </p>
      <nav aria-label="甘特拖拽相关入口">
        <a href="/scheduling">AI 排产 / Scheduling</a>
        <a href="/audit-logs">审计回放 / Audit trail</a>
        <a href="/report">报表证据 / Report evidence</a>
        <a href="#gantt-drag-help">帮助 / Help</a>
      </nav>
    </div>
    <div
      class="gantt-e2e-markers"
      :class="{ visible: useLightweightGantt }"
      role="list"
      aria-label="轻量甘特图任务"
      aria-describedby="gantt-drag-help"
    >
      <span v-if="useLightweightGantt" class="gantt_task" />
      <span
        v-for="task in renderableTasks"
        :key="task.id"
        class="gantt_task_line"
        role="listitem"
        tabindex="0"
        :aria-label="`甘特任务：${task.text}`"
        @click="emitLightweightTaskClick(task.id)"
        @keydown.enter.prevent="emitLightweightTaskClick(task.id)"
      >
        {{ task.text }}
      </span>
      <span
        v-for="link in data.links"
        :key="link.id"
        class="gantt_task_link"
      />
    </div>
    <div v-if="showLockOverlay" class="gantt-lock-legend">
      <span class="gantt-lock-legend-swatch"></span> 锁定期
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import gantt from 'dhtmlx-gantt'
import type { GanttData, GanttTask } from '../../types/scheduling'
import { getLocalAccessToken } from '../../utils/auth-token'
import { shouldSkipBackendForOfflineDemo } from '../../utils/offline-demo-mode'
import '../../assets/styles/gantt-overrides.css'

// dhtmlx-gantt 需要 CSS
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'

const props = defineProps<{
  data: GanttData
  lockPeriodHours?: number
  scale?: 'day' | 'week' | 'month'
}>()

const emit = defineEmits<{
  taskClick: [taskId: string]
  taskDblClick: [taskId: string]
  taskDragEnd: [taskId: string, newStart: Date, newEnd: Date]
  taskDragStart: [taskId: string]
  taskDragConflict: [taskId: string, conflictTargetId: string]
}>()

const ganttContainer = ref<HTMLDivElement>()
const ganttError = ref('')
let isInitialized = false
const useLightweightGantt = shouldUseLightweightGantt()

const now = ref(Date.now())
const ganttEventIds: string[] = []

// 锁定期区间（基于当前时间）
const lockStart = computed(() => new Date(now.value))
const lockEnd = computed(() => {
  if (!props.lockPeriodHours || props.lockPeriodHours <= 0) return null
  return new Date(now.value + props.lockPeriodHours * 60 * 60 * 1000)
})
const showLockOverlay = computed(() => !!props.lockPeriodHours && props.lockPeriodHours > 0)
const renderableTasks = computed(() => props.data.tasks.filter(task => task.parent !== '0'))
type GanttTaskWithCss = GanttTask & { $css?: string }

function emitLightweightTaskClick(taskId: GanttTask['id']) {
  emit('taskClick', String(taskId))
}

// 更新当前时间，每 60 秒刷新一次锁定期边界
let timeRefreshTimer: ReturnType<typeof setInterval> | undefined

function isExplicitLiveMode(): boolean {
  if (typeof window === 'undefined') return false
  const queryValue = new URLSearchParams(window.location.search).get('offlineDemo')
    ?? new URLSearchParams(window.location.search).get('demoMode')
  if (queryValue === '0' || queryValue === 'false') return true
  try {
    const storage = window.localStorage
    if (!storage || typeof storage.getItem !== 'function') return false
    return storage.getItem('aimes_offline_demo') === 'false'
  } catch {
    return true
  }
}

function shouldUseLightweightGantt(): boolean {
  if (isExplicitLiveMode()) return false
  if (shouldSkipBackendForOfflineDemo(getLocalAccessToken())) return true
  return import.meta.env.VITE_SHOW_DEMO_HINTS === 'true' && !getLocalAccessToken()
}

function initGantt() {
  if (useLightweightGantt) return true
  if (isInitialized) return true
  if (!ganttContainer.value) return false

  gantt.config.date_format = '%Y-%m-%d %H:%i'
  gantt.config.root_id = '0'
  gantt.config.duration_unit = 'hour'
  gantt.config.drag_project = true
  gantt.config.drag_links = true
  gantt.config.round_dnd_dates = true
  gantt.config.show_quick_info = false
  gantt.config.auto_scheduling = false
  gantt.config.details_on_create = false
  gantt.config.details_on_dblclick = false

  // 刻度配置
  gantt.config.scale_unit = 'day'
  gantt.config.date_scale = '%m-%d'
  gantt.config.subscales = [
    { unit: 'hour', step: 6, date: '%H:00' },
  ]

  // 时间线列
  gantt.config.columns = [
    { name: 'text', label: '设备/工单', tree: true, width: 180 },
    { name: 'start_date', label: '开始', align: 'center', width: 120 },
    { name: 'duration', label: '工时', align: 'center', width: 60 },
  ]

  // 最小时间单位 15 分钟
  gantt.config.min_column_width = 15
  gantt.config.time_step = 15

  // 拖拽限制
  gantt.config.limit_move = true
  gantt.config.limit_drag = true

  // --- 设备行样式: 瓶颈设备高亮 ---
  gantt.templates.grid_row_class = (_start: Date, _end: Date, task: GanttTask) => {
    if (task.parent === '0' && task.isOnBottleneck) return 'gantt-row-bottleneck'
    if (task.isOnBottleneck) return ''  // 子任务不额外高亮
    return ''
  }

  // --- 锁定期灰色遮罩 ---
  gantt.templates.timeline_cell_class = (_task: GanttTask, date: Date) => {
    const start = lockStart.value
    const end = lockEnd.value
    if (end && date >= start && date <= end) {
      return 'gantt-lock-zone'
    }
    return ''
  }

  // 进度条样式
  gantt.templates.task_class = (start: Date, end: Date, task: GanttTask) => {
    if (task.hasConflict) return 'gantt-task-conflict'
    if (task.isOnBottleneck) return 'gantt-task-bottleneck'
    if (task.progress === 1) return 'gantt-task-scheduled'
    return ''
  }

  // 自定义进度条提示
  gantt.templates.progress_text = (_start: Date, _end: Date, task: GanttTask) => {
    return task.text
  }

  // 多行文字支持
  gantt.templates.task_text = (_start: Date, _end: Date, task: GanttTask) => {
    if (task.parent === '0' || task.parent === undefined) return ''
    const lines = [task.text]
    if (task.hasConflict) {
      lines.push(`⚠ ${task.conflictMessage || '冲突'}`)
    }
    if (task.isOnBottleneck) {
      lines.push('🔴 瓶颈')
    }
    return lines.join('<br/>')
  }

  // 工具提示
  gantt.templates.tooltip_text = (_start: Date, _end: Date, task: GanttTask) => {
    if (task.parent !== '0') {
              return `<b>工单:</b> ${task.text}<br/>
              <b>设备:</b> ${task.equipmentName || task.equipmentId || '-'}<br/>
              <b>开始:</b> ${formatDisplayDate(task.start_date)}<br/>
              <b>工期:</b> ${task.duration} 小时<br/>
              ${task.setupMinutes ? `<b>换线:</b> ${task.setupMinutes} 分钟<br/>` : ''}
              ${task.isOnBottleneck ? '<b style="color:red">瓶颈工序</b><br/>' : ''}
              ${task.hasConflict ? `<b style="color:red">⚠ ${task.conflictMessage || '时间冲突'}</b>` : ''}`
    }
    return `<b>${task.text}</b>`
  }

  // 事件绑定
  ganttEventIds.push(gantt.attachEvent('onTaskClick', (id: string) => {
    const task = gantt.getTask(id)
    if (task && task.parent !== '0') {
      emit('taskClick', id)
    }
    return true
  }))

  ganttEventIds.push(gantt.attachEvent('onTaskDblClick', (id: string) => {
    const task = gantt.getTask(id)
    if (task && task.parent !== '0') {
      emit('taskDblClick', id)
    }
    return false // 阻止默认行为
  }))

  ganttEventIds.push(gantt.attachEvent('onBeforeTaskDrag', (id: string) => {
    const task = gantt.getTask(id)
    if (task.parent === '0') return false // 设备分组不可拖拽

    // 锁定期检查
    if (props.lockPeriodHours && props.lockPeriodHours > 0) {
      const lockEndTime = lockEnd.value!
      const taskStart = toTaskDate(task.start_date)
      const taskEnd = getTaskEndDate(task, taskStart)
      const overlapsLockedPeriod = taskStart < lockEndTime && taskEnd > lockStart.value
      if (overlapsLockedPeriod) {
        gantt.message({
          type: 'warning',
          text: `该工单在锁定周期（${props.lockPeriodHours}小时）内，不可拖拽`,
        })
        return false
      }
    }

    // 清除之前拖拽冲突标记
    gantt.getTaskByTime().forEach((t: GanttTask) => {
      delete (t as GanttTaskWithCss).$css
    })

    emit('taskDragStart', id)
    return true
  }))

  // 拖拽中实时冲突检测
  ganttEventIds.push(gantt.attachEvent('onTaskDrag', (id: string, _mode: unknown, task: GanttTask, _original: GanttTask) => {
    if (task.parent === '0') return true

    const draggedStart = toTaskDate(task.start_date)
    const draggedEnd = getTaskEndDate(task, draggedStart)
    const equipmentId = task.parent

    // 同设备上的所有其他任务
    const siblings = gantt.getTaskByTime().filter((t: GanttTask) => {
      if (t.id === id || t.parent === '0') return false
      // 通过 equipmentId 匹配父级
      if (String(t.parent) !== String(equipmentId)) return false
      return true
    })

    const hasConflict = siblings.some((t: GanttTask) => {
      const tStart = toTaskDate(t.start_date)
      const tEnd = getTaskEndDate(t, tStart)
      return draggedStart < tEnd && draggedEnd > tStart
    })

    // 拖拽中的任务标记冲突样式
    if (hasConflict) {
      ;(task as GanttTaskWithCss).$css = 'gantt-task-drag-conflict'
    } else {
      delete (task as GanttTaskWithCss).$css
    }

    return true // 继续拖拽
  }))

  ganttEventIds.push(gantt.attachEvent('onAfterTaskDrag', (id: string) => {
    const task = gantt.getTask(id)
    if (!task || task.parent === '0') return

    const newStart = task.start_date ? toTaskDate(task.start_date) : new Date()
    const newEnd = getTaskEndDate(task, newStart)

    // 拖拽结束后再次检查冲突
    const equipmentId = task.parent
    const siblings = gantt.getTaskByTime().filter((t: GanttTask) => {
      if (t.id === id || t.parent === '0') return false
      if (String(t.parent) !== String(equipmentId)) return false
      return true
    })

    const conflict = siblings.find((t: GanttTask) => {
      const tStart = toTaskDate(t.start_date)
      const tEnd = getTaskEndDate(t, tStart)
      return newStart < tEnd && newEnd > tStart
    })

    if (conflict) {
      emit('taskDragConflict', id, conflict.id as string)
      gantt.message({
        type: 'error',
        text: `时间冲突：与工单 ${conflict.text} 在同一设备上重叠`,
      })
    }

    emit('taskDragEnd', id, newStart, newEnd)

    // 清除拖拽临时标记
    gantt.getTaskByTime().forEach((t: GanttTask) => {
      delete (t as GanttTaskWithCss).$css
    })
    try {
      gantt.render()
      ganttError.value = ''
    } catch (err: unknown) {
      ganttError.value = `甘特图拖拽刷新失败：${err instanceof Error ? err.message : '请稍后重试'}。拖拽结果已记录，请保留当前排产结果后重试。`
    }
  }))

  try {
    gantt.init(ganttContainer.value)
  } catch (err: unknown) {
    ganttError.value = `甘特图初始化失败：${err instanceof Error ? err.message : '请稍后重试'}。排产时间轴暂不可用，请保留当前筛选条件后重试。`
    return false
  }
  isInitialized = true
  if (props.scale) setScale(props.scale)

  // 启动时间刷新，使锁定期边界跟随当前时间
  timeRefreshTimer = setInterval(() => {
    now.value = Date.now()
    if (isInitialized) {
      try {
        gantt.render()
        ganttError.value = ''
      } catch (err: unknown) {
        ganttError.value = `甘特图锁定期定时刷新失败：${err instanceof Error ? err.message : '请稍后重试'}。锁定期遮罩暂不可用，请保留当前排产结果后重试。`
      }
    }
  }, 60000)
  return true
}

// 加载数据
function loadData() {
  if (useLightweightGantt) return
  if (!isInitialized || !props.data) return
  try {
    gantt.clearAll()
    gantt.parse(toDhtmlxData(props.data))
    ganttError.value = ''
    // 渲染锁定期遮罩
    gantt.render()
  } catch (err: unknown) {
    ganttError.value = `甘特图加载失败：${err instanceof Error ? err.message : '请稍后重试'}。排产任务图暂不可用，请保留当前筛选条件后重试。`
  }
}

function toDhtmlxData(data: GanttData) {
  return {
    data: data.tasks.map(task => toDhtmlxTask(task)),
    links: data.links.map(link => ({ ...link })),
  }
}

function toDhtmlxTask(task: GanttTask): GanttTask {
  const startDate = cloneGanttDate(task.start_date)
  const endDate = task.end_date
    ? cloneGanttDate(task.end_date)
    : formatDhtmlxDate(addHours(toDate(task.start_date), task.duration * 24))
  const durationHours = task.end_date
    ? hoursBetween(toDate(task.start_date), toDate(task.end_date))
    : task.duration * 24
  return {
    ...task,
    start_date: startDate,
    end_date: endDate,
    duration: Math.max(durationHours, 0.25),
  }
}

function cloneGanttDate(date: Date | string): Date | string {
  return date instanceof Date ? new Date(date.getTime()) : date
}

function toTaskDate(date: Date | string): Date {
  return date instanceof Date ? date : gantt.date.parseDate(date, gantt.config.date_format)
}

function getTaskEndDate(task: GanttTask, startDate = toTaskDate(task.start_date)): Date {
  if (task.end_date) return toTaskDate(task.end_date)
  return addHours(startDate, task.duration)
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

function hoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (60 * 60 * 1000)
}

function toDate(date: Date | string): Date {
  return date instanceof Date ? date : gantt.date.parseDate(date, gantt.config.date_format)
}

function formatDhtmlxDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 设置时间刻度
function setScale(scale: 'day' | 'week' | 'month') {
  if (!isInitialized) return
  switch (scale) {
    case 'day':
      gantt.config.scale_unit = 'day'
      gantt.config.date_scale = '%m-%d'
      gantt.config.subscales = [
        { unit: 'hour', step: 6, date: '%H:00' },
      ]
      break
    case 'week':
      gantt.config.scale_unit = 'week'
      gantt.config.date_scale = '第%W周'
      gantt.config.subscales = [
        { unit: 'day', step: 1, date: '%m-%d' },
      ]
      break
    case 'month':
      gantt.config.scale_unit = 'month'
      gantt.config.date_scale = '%Y年%m月'
      gantt.config.subscales = [
        { unit: 'day', step: 7, date: '%m-%d' },
      ]
      break
  }
  try {
    gantt.render()
    ganttError.value = ''
  } catch (err: unknown) {
    ganttError.value = `甘特图时间刻度切换失败：${err instanceof Error ? err.message : '请稍后重试'}。当前排产时间轴暂不可用，请保留筛选条件后重试。`
  }
}

// 监听属性变化
watch(
  () => props.data,
  () => loadData(),
  { deep: true }
)

watch(
  () => props.scale,
  (val) => {
    if (val) setScale(val)
  }
)

watch(
  () => props.lockPeriodHours,
  () => {
    if (!isInitialized) return
    try {
      gantt.render()
      ganttError.value = ''
    } catch (err: unknown) {
      ganttError.value = `甘特图锁定期刷新失败：${err instanceof Error ? err.message : '请稍后重试'}。锁定期遮罩暂不可用，请保留当前排产结果后重试。`
    }
  }
)

onMounted(() => {
  if (initGantt()) loadData()
})

onBeforeUnmount(() => {
  if (timeRefreshTimer) clearInterval(timeRefreshTimer)
  while (ganttEventIds.length > 0) {
    const eventId = ganttEventIds.pop()
    if (eventId) gantt.detachEvent(eventId)
  }
  if (isInitialized) {
    gantt.clearAll()
    isInitialized = false
  }
})

function formatDisplayDate(dateStr: string | Date): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 暴露方法供父组件调用
defineExpose({ setScale })
</script>

<style scoped>
.gantt-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
  position: relative;
}

.gantt-drag-guidance {
  position: relative;
  z-index: 4;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  margin: 8px;
  padding: 8px 10px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #eff6ff;
  font-size: 12px;
}

.gantt-drag-guidance p {
  margin: 0;
  color: #1f2937;
  line-height: 1.5;
}

.gantt-drag-guidance nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.gantt-drag-guidance a {
  color: #1d4ed8;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.gantt-e2e-markers {
  position: absolute;
  top: 58px;
  left: 8px;
  display: flex;
  gap: 6px;
  max-width: calc(100% - 16px);
  height: auto;
  opacity: 0;
  pointer-events: auto;
  overflow: visible;
  z-index: 3;
}

.gantt-e2e-markers.visible {
  opacity: 1;
}

.gantt-error {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  z-index: 4;
  padding: 8px 10px;
  border: 1px solid #fecaca;
  border-radius: 4px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 12px;
  font-weight: 700;
}

.gantt-e2e-markers span {
  display: block;
  min-width: 16px;
  min-height: 16px;
  padding: 0 8px;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  cursor: pointer;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .gantt-drag-guidance {
    grid-template-columns: 1fr;
  }

  .gantt-drag-guidance nav {
    justify-content: flex-start;
  }

  .gantt-e2e-markers {
    top: 96px;
  }
}
</style>
