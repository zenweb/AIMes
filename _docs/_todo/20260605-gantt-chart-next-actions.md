# 2026-06-05 GanttChart Next Actions

## Done

- 已完成：`GanttChart.vue` 数据解析失败时 fail loud，避免排产甘特图直接崩溃或空白。
- 已完成：新增目标测试覆盖 `gantt.parse()` 抛错时显示 assertive alert，并包含失败原因。
- 已完成：`GanttChart.vue` 时间刻度切换 render 失败时 fail loud，避免 watcher 未处理异常。
- 已完成：新增目标测试覆盖 scale 切换 render 失败时显示 assertive alert，并包含失败原因。
- 已完成：`GanttChart.vue` 锁定期刷新 render 失败时 fail loud，避免 watcher 未处理异常。
- 已完成：新增目标测试覆盖 lockPeriodHours 变化 render 失败时显示 assertive alert，并包含失败原因。
- 已完成：`GanttChart.vue` 锁定期定时刷新 render 失败时 fail loud，避免 timer callback 未处理异常。
- 已完成：新增目标测试覆盖 60 秒定时刷新 render 失败时显示 assertive alert，并包含失败原因。
- 已完成：`GanttChart.vue` 拖拽结束 render 失败时 fail loud，避免 `onAfterTaskDrag` 未处理异常。
- 已完成：新增目标测试覆盖拖拽结束 render 失败时显示 assertive alert，并包含失败原因，同时保留 `taskDragEnd` 事件。
- 已完成：目标 unit、全量前端 coverage 和 lint 验证；`GanttChart.vue` 行覆盖率为 `72.25%`。

## Continue

- 继续：按覆盖率杠杆转向其它低覆盖且用户关键的组件。
- 专项：`GanttChart.vue` 后续仅保留 dhtmlx 事件清理和其它外部库事件回调边界审计，不继续做 render 边界微切片。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 已确认：`gh` 登录和 Docker 可用；仍缺 GitHub repo/remote 绑定，当前 `origin` 指向腾讯工蜂。
