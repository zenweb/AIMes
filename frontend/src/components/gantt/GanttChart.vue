<template>
  <div ref="ganttContainer" class="gantt-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import gantt from 'dhtmlx-gantt'
import type { GanttData, GanttTask } from '../../types/scheduling'
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
}>()

const ganttContainer = ref<HTMLDivElement>()
let isInitialized = false

function initGantt() {
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

  // 空余进度
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
  gantt.attachEvent('onTaskClick', (id: string) => {
    const task = gantt.getTask(id)
    if (task.parent !== '0') {
      emit('taskClick', id)
    }
    return true
  })

  gantt.attachEvent('onTaskDblClick', (id: string) => {
    const task = gantt.getTask(id)
    if (task.parent !== '0') {
      emit('taskDblClick', id)
    }
    return false // 阻止默认行为
  })

  gantt.attachEvent('onBeforeTaskDrag', (id: string) => {
    const task = gantt.getTask(id)
    if (task.parent === '0') return false // 设备分组不可拖拽

    // 锁定期检查
    if (props.lockPeriodHours && props.lockPeriodHours > 0) {
      const now = new Date()
      const lockEnd = new Date(now.getTime() + props.lockPeriodHours * 60 * 60 * 1000)
      const taskStart = gantt.date.parseDate(task.start_date, gantt.config.date_format)
      if (taskStart <= lockEnd && taskStart > now) {
        gantt.message({
          type: 'warning',
          text: `该工单在锁定周期（${props.lockPeriodHours}小时）内，不可拖拽`,
        })
        return false
      }
    }

    emit('taskDragStart', id)
    return true
  })

  gantt.attachEvent('onAfterTaskDrag', (id: string, mode: any) => {
    const task = gantt.getTask(id)
    if (!task || task.parent === '0') return

    const newStart = task.start_date
      ? gantt.date.parseDate(task.start_date, gantt.config.date_format)
      : new Date()
    const newEnd = new Date(newStart.getTime() + task.duration * 24 * 60 * 60 * 1000)

    emit('taskDragEnd', id, newStart, newEnd)
  })

  gantt.init(ganttContainer.value)
  isInitialized = true
}

// 加载数据
function loadData() {
  if (!isInitialized || !props.data) return
  gantt.clearAll()
  gantt.parse(props.data)
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
  gantt.render()
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

onMounted(() => {
  initGantt()
  loadData()
})

onBeforeUnmount(() => {
  if (isInitialized) {
    gantt.clearAll()
    isInitialized = false
  }
})

function formatDisplayDate(dateStr: string): string {
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
}
</style>
