# 2026-06-05 GanttChart Fail-loud Issues

## Fixed

- 问题：`GanttChart.vue` 在 `gantt.parse()` 失败时直接抛出异常。
- 风险：排产结果可视化会空白或异常退出，用户无法确认失败原因。
- 处理：新增 `ganttError` 和 assertive alert；解析失败时保留组件容器并提示“甘特图加载失败：...”，解析成功时清空错误。
- 问题：`GanttChart.vue` 时间刻度切换时 `gantt.render()` 失败会从 watcher 抛出未处理异常。
- 风险：用户切换日/周/月视图时页面异常更新，无法判断时间轴渲染失败原因。
- 处理：`setScale()` 捕获 render 异常并显示“甘特图时间刻度切换失败：...”；render 成功时清空错误。
- 问题：`GanttChart.vue` 锁定期小时数变化时 `gantt.render()` 失败会从 watcher 抛出未处理异常。
- 风险：锁定期遮罩可能刷新失败但没有明确提示，用户无法判断拖拽限制视觉反馈是否可靠。
- 处理：`lockPeriodHours` watcher 捕获 render 异常并显示“甘特图锁定期刷新失败：...”；render 成功时清空错误。
- 问题：`GanttChart.vue` 锁定期 60 秒定时刷新时 `gantt.render()` 失败会从 timer callback 抛出未处理异常。
- 风险：锁定期边界随时间推进时，遮罩刷新失败不会被用户感知，且页面会产生异步异常。
- 处理：定时刷新路径捕获 render 异常并显示“甘特图锁定期定时刷新失败：...”；render 成功时清空错误。
- 问题：`GanttChart.vue` 拖拽结束后 `gantt.render()` 失败会从 `onAfterTaskDrag` 抛出未处理异常。
- 风险：拖拽结果事件已发出但视图刷新失败时，用户没有明确提示，可能误判排产调整状态。
- 处理：拖拽结束刷新路径捕获 render 异常并显示“甘特图拖拽刷新失败：...”；render 成功时清空错误。
- 验证：目标 unit `1 file / 10 tests passed`，全量前端 unit coverage `82 files / 479 tests passed`，lint 通过。

## Remaining

- `GanttChart.vue` 行覆盖率当前为 `72.25%`；后续优先审计 dhtmlx 事件清理和其它外部库事件回调边界。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- B-track 环境复核：`gh` 已登录 `zenweb`，Docker 可用；当前仓库 remote 仍不指向 GitHub，不能取得真实 hosted CI run。
