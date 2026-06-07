# 2026-06-05 GanttChart Fail-loud Plan

## Success Criteria

- 甘特图数据解析失败时，不得从 mounted hook 直接抛错。
- 甘特图数据解析失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 甘特图数据解析成功时，必须清空失败提示。
- 甘特图时间刻度切换渲染失败时，不得从 watcher 抛出未处理异常。
- 甘特图时间刻度切换渲染失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 甘特图锁定期刷新渲染失败时，不得从 watcher 抛出未处理异常。
- 甘特图锁定期刷新渲染失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 甘特图锁定期定时刷新渲染失败时，不得从 timer callback 抛出未处理异常。
- 甘特图锁定期定时刷新渲染失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 甘特图拖拽结束渲染失败时，不得从 `onAfterTaskDrag` 抛出未处理异常。
- 甘特图拖拽结束渲染失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因，且仍发出拖拽结束事件。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：新增红灯测试覆盖 `gantt.parse()` 失败时不得崩溃。
- 已完成：修复 `GanttChart.vue`，解析失败时显示“甘特图加载失败：...”，并保留组件容器。
- 已完成：新增红灯测试覆盖 `setScale()` 中 `gantt.render()` 失败时不得从 watcher 抛错。
- 已完成：修复 `GanttChart.vue`，时间刻度切换 render 失败时显示“甘特图时间刻度切换失败：...”。
- 已完成：新增红灯测试覆盖 `lockPeriodHours` watcher 中 `gantt.render()` 失败时不得从 watcher 抛错。
- 已完成：修复 `GanttChart.vue`，锁定期刷新 render 失败时显示“甘特图锁定期刷新失败：...”。
- 已完成：新增红灯测试覆盖 60 秒定时刷新中 `gantt.render()` 失败时不得从 timer callback 抛错。
- 已完成：修复 `GanttChart.vue`，锁定期定时刷新 render 失败时显示“甘特图锁定期定时刷新失败：...”。
- 已完成：新增红灯测试覆盖拖拽结束后 `gantt.render()` 失败时不得从 `onAfterTaskDrag` 抛错。
- 已完成：修复 `GanttChart.vue`，拖拽结束 render 失败时显示“甘特图拖拽刷新失败：...”，并保留 `taskDragEnd` 事件。
- 已验证：目标 unit `1 file / 10 tests passed`。
- 已验证：全量前端 unit coverage `82 files / 479 tests passed`；总行覆盖率 `76.62%`，`GanttChart.vue` 行覆盖率 `72.25%`。
- 已验证：`npm run lint` 通过。
- 下一步：停止继续精修 `GanttChart.vue` render 边界，按覆盖率杠杆转向其它低覆盖且用户关键的组件；`GanttChart.vue` 仅保留 dhtmlx 事件清理为后续专项风险。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
- 当前 `gh` 已登录但 remote 仍是腾讯工蜂，Hosted CI 需要 GitHub repo 绑定后才能实跑取证。
