<template>
  <div ref="ganttContainer" class="gantt-container">
    <div v-if="ganttError" class="gantt-error" role="alert" aria-live="assertive">
      {{ ganttError }}
    </div>
    <div
      class="gantt-e2e-markers"
      :class="{ visible: useLightweightGantt }"
      role="list"
      aria-label="轻量甘特图任务"
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
import { isOfflineDemoMode } from '../../utils/offline-demo-mode'
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
const useLightweightGantt = import.meta.env.VITE_SHOW_DEMO_HINTS === 'true' || isOfflineDemoMode()

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

function initGantt() {
  if (useLightweightGantt) return
  if (isInitialized || !ganttContainer.value) return

  gantt.config.date_format = '%Y-%m-%d %H:%i'
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
    { name: 'duration', label: '天数', align: 'center', width: 60 },
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
              <b>工期:</b> ${task.duration} 天<br/>
              ${task.setupMinutes ? `<b>换线:</b> ${task.setupMinutes} 分钟<br/>` : ''}
              ${task.isOnBottleneck ? '<b style="color:red">瓶颈工序</b><br/>' : ''}
              ${task.hasConflict ? `<b style="color:red">⚠ ${task.conflictMessage || '时间冲突'}</b>` : ''}`
    }
    return `<b>${task.text}</b>`
  }

  // 事件绑定
  ganttEventIds.push(gantt.attachEvent('onTaskClick', (id: string) => {
    const task = gantt.getTask(id)
    if (task.parent !== '0') {
      emit('taskClick', id)
    }
    return true
  }))

  ganttEventIds.push(gantt.attachEvent('onTaskDblClick', (id: string) => {
    const task = gantt.getTask(id)
    if (task.parent !== '0') {
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
      const taskStart = gantt.date.parseDate(task.start_date, gantt.config.date_format)
      const taskEnd = new Date(taskStart.getTime() + task.duration * 24 * 60 * 60 * 1000)
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

    const draggedStart = new Date(task.start_date)
    const draggedEnd = new Date(draggedStart.getTime() + task.duration * 24 * 60 * 60 * 1000)
    const equipmentId = task.parent

    // 同设备上的所有其他任务
    const siblings = gantt.getTaskByTime().filter((t: GanttTask) => {
      if (t.id === id || t.parent === '0') return false
      // 通过 equipmentId 匹配父级
      if (String(t.parent) !== String(equipmentId)) return false
      return true
    })

    const hasConflict = siblings.some((t: GanttTask) => {
      const tStart = new Date(t.start_date)
      const tEnd = new Date(tStart.getTime() + t.duration * 24 * 60 * 60 * 1000)
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

  ganttEventIds.push(gantt.attachEvent('onAfterTaskDrag', (id: string, _mode: unknown, task: GanttTask) => {
    if (!task || task.parent === '0') return

    const newStart = task.start_date
      ? gantt.date.parseDate(task.start_date, gantt.config.date_format)
      : new Date()
    const newEnd = new Date(newStart.getTime() + task.duration * 24 * 60 * 60 * 1000)

    // 拖拽结束后再次检查冲突
    const equipmentId = task.parent
    const siblings = gantt.getTaskByTime().filter((t: GanttTask) => {
      if (t.id === id || t.parent === '0') return false
      if (String(t.parent) !== String(equipmentId)) return false
      return true
    })

    const conflict = siblings.find((t: GanttTask) => {
      const tStart = new Date(t.start_date)
      const tEnd = new Date(tStart.getTime() + t.duration * 24 * 60 * 60 * 1000)
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

  gantt.init(ganttContainer.value)
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
}

// 加载数据
function loadData() {
  if (useLightweightGantt) return
  if (!isInitialized || !props.data) return
  try {
    gantt.clearAll()
    gantt.parse(props.data)
    ganttError.value = ''
    // 渲染锁定期遮罩
    gantt.render()
  } catch (err: unknown) {
    ganttError.value = `甘特图加载失败：${err instanceof Error ? err.message : '请稍后重试'}。排产任务图暂不可用，请保留当前筛选条件后重试。`
  }
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
  initGantt()
  loadData()
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

.gantt-e2e-markers {
  position: absolute;
  top: 8px;
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
</style>
