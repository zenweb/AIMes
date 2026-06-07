# 2026-06-05 GanttChart Fail-loud Review

## Findings

- 审计结论：本片修复 dhtmlx 甘特图数据解析失败时组件直接抛错的问题。
- 行为覆盖：`gantt.parse()` 抛错时，组件必须继续挂载并显示用户可见错误提示。
- Fail-loud 覆盖：同一场景必须显示 `[role="alert"]` 和 `aria-live="assertive"`，并包含“甘特图加载失败”和解析失败原因。
- 状态覆盖：解析成功时必须清空 `ganttError`，避免旧错误污染后续有效排产数据。
- TDD 证据：新增解析失败用例先红于 `invalid gantt payload` 从 mounted hook 直接抛出；修复后目标 unit 变绿。
- 审计结论：本片继续修复时间刻度切换时 dhtmlx render 失败会从 watcher 抛错的问题。
- 行为覆盖：`gantt.render()` 在 `setScale()` 中抛错时，组件必须显示用户可见错误提示，而不是让 Vue watcher 抛出未处理异常。
- Fail-loud 覆盖：同一场景必须显示 `[role="alert"]` 和 `aria-live="assertive"`，并包含“甘特图时间刻度切换失败”和 render 失败原因。
- 状态覆盖：scale 配置仍需写入目标刻度；render 成功时必须清空 `ganttError`。
- TDD 证据：新增 scale render 失败用例先红于 `scale render unavailable` 从 watcher 直接抛出；修复后目标 unit 变绿。
- 审计结论：本片继续修复锁定期小时数变化时 dhtmlx render 失败会从 watcher 抛错的问题。
- 行为覆盖：`gantt.render()` 在 `lockPeriodHours` watcher 中抛错时，组件必须显示用户可见错误提示，而不是让 Vue watcher 抛出未处理异常。
- Fail-loud 覆盖：同一场景必须显示 `[role="alert"]` 和 `aria-live="assertive"`，并包含“甘特图锁定期刷新失败”和 render 失败原因。
- 状态覆盖：未初始化时仍不得触发 render；render 成功时必须清空 `ganttError`。
- TDD 证据：新增 lockPeriodHours render 失败用例先红于 `lock overlay render unavailable` 从 watcher 直接抛出；修复后目标 unit 变绿。
- 审计结论：本片继续修复 60 秒定时锁定期刷新时 dhtmlx render 失败会从 timer callback 抛错的问题。
- 行为覆盖：`gantt.render()` 在定时刷新中抛错时，组件必须显示用户可见错误提示，而不是让异步 timer 抛出未处理异常。
- Fail-loud 覆盖：同一场景必须显示 `[role="alert"]` 和 `aria-live="assertive"`，并包含“甘特图锁定期定时刷新失败”和 render 失败原因。
- 状态覆盖：定时周期仍为 60 秒；只在已初始化状态刷新；render 成功时必须清空 `ganttError`。
- TDD 证据：新增 periodic lock refresh render 失败用例先红于 `periodic lock refresh unavailable` 从 timer callback 直接抛出；修复后目标 unit 变绿。
- 审计结论：本片继续修复拖拽结束后 dhtmlx render 失败会从 `onAfterTaskDrag` 抛错的问题。
- 行为覆盖：`gantt.render()` 在拖拽结束刷新中抛错时，组件必须显示用户可见错误提示；`taskDragEnd` 仍需发出，避免丢失拖拽结果事件。
- Fail-loud 覆盖：同一场景必须显示 `[role="alert"]` 和 `aria-live="assertive"`，并包含“甘特图拖拽刷新失败”和 render 失败原因。
- 状态覆盖：冲突检查、冲突事件、拖拽结束事件和临时样式清理顺序保持原样；render 成功时必须清空 `ganttError`。
- TDD 证据：新增 drag completion render 失败用例先红于 `drag render unavailable` 从 `onAfterTaskDrag` 直接抛出；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 10 tests passed`；全量前端 unit coverage `82 files / 479 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `76.62%`，`GanttChart.vue` 行覆盖率 `72.25%`。

## Residual Risk

- `GanttChart.vue` 后续可继续审计 dhtmlx 事件清理和其它外部库事件回调边界。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据；当前仓库尚未绑定 GitHub remote，不能取得真实 GitHub Actions run。
