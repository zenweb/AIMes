# 2026-06-05 GanttChart Fail-loud Changelog

## Gantt Data Parse Failure Slice

- 选片依据：按覆盖率杠杆从已提升到 `81.95%` 的 `RoutingBoard.vue` 转向 `GanttChart.vue`；该组件是 AI 排产结果可视化关键路径，最新行覆盖率约 `59%`。
- 问题：`loadData()` 直接调用 `gantt.parse(props.data)`；dhtmlx 数据解析失败时会从 mounted hook 抛错，排产视图没有用户可见提示。
- 风险：用户看到排产甘特图空白或页面异常，无法判断是筛选条件、数据格式还是排产结果不可用。
- 修复：新增 `ganttError`，`loadData()` 对 `clearAll/parse/render` 使用 `try/catch`；解析失败时显示 `role="alert"` / `aria-live="assertive"` 的“甘特图加载失败：...”提示。
- 行为保持：解析成功时清空错误提示；轻量 demo marker、锁定期图例、拖拽事件、scale 逻辑保持原样。
- 测试：新增 TDD 用例 `alerts when gantt data cannot be parsed instead of crashing the schedule view`，先红于 `invalid gantt payload` 直接抛出，再最小修复。
- 验证：`npm run test:unit -- tests/unit/gantt-chart.test.ts` 通过，`1 file / 6 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 475 tests passed`，总行覆盖率 `76.43%`，`GanttChart.vue` 行覆盖率 `61.79%`。
- 验证：`npm run lint` 通过。

## Gantt Scale Render Failure Slice

- 问题：`setScale()` 在日/周/月刻度切换后直接调用 `gantt.render()`；render 失败时会从 watcher 抛错，排产页面没有用户可见提示。
- 风险：用户切换时间刻度时页面可能异常更新，无法判断是时间轴渲染失败还是排产数据本身不可用。
- 修复：`setScale()` 对 `gantt.render()` 使用 `try/catch`；渲染失败时显示“甘特图时间刻度切换失败：...”提示，渲染成功时清空错误。
- 行为保持：日/周/月刻度配置仍按原逻辑写入 dhtmlx config；本片只保护 render 边界。
- 测试：新增 TDD 用例 `alerts when changing the gantt scale cannot be rendered`，先红于 watcher 中 `scale render unavailable` 直接抛出，再最小修复。
- 验证：`npm run test:unit -- tests/unit/gantt-chart.test.ts` 通过，`1 file / 7 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 476 tests passed`，总行覆盖率 `76.56%`，`GanttChart.vue` 行覆盖率 `68.5%`。
- 验证：`npm run lint` 通过。

## Gantt Lock Period Render Failure Slice

- 问题：`lockPeriodHours` 变化时 watcher 直接调用 `gantt.render()`；锁定期遮罩刷新失败会从 watcher 抛出未处理异常。
- 风险：用户调整或接收新的锁定期配置后，甘特图可能异常更新，且无法判断锁定期遮罩是否已经可靠刷新。
- 修复：`lockPeriodHours` watcher 对 `gantt.render()` 使用 `try/catch`；渲染失败时显示“甘特图锁定期刷新失败：...”提示，渲染成功时清空错误。
- 行为保持：未初始化时仍跳过刷新；锁定期计算、图例、拖拽限制和任务数据保持原逻辑。
- 测试：新增 TDD 用例 `alerts when refreshing the locked period overlay cannot be rendered`，先红于 `lock overlay render unavailable` 从 watcher 直接抛出，再最小修复。
- 验证：`npm run test:unit -- tests/unit/gantt-chart.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 477 tests passed`，总行覆盖率 `76.58%`，`GanttChart.vue` 行覆盖率 `69.72%`。
- 验证：`npm run lint` 通过。

## Gantt Periodic Lock Refresh Render Failure Slice

- 问题：初始化后的 60 秒定时刷新会更新 `now` 并直接调用 `gantt.render()`；render 失败时会从 timer callback 抛出未处理异常。
- 风险：锁定期边界随时间推进时，遮罩可能刷新失败且没有用户可见提示，排产页面会出现难以定位的异步异常。
- 修复：定时刷新路径对 `gantt.render()` 使用 `try/catch`；渲染失败时显示“甘特图锁定期定时刷新失败：...”提示，渲染成功时清空错误。
- 行为保持：定时周期仍为 60 秒；只在已初始化状态下刷新；锁定期计算和 dhtmlx 数据不变。
- 测试：新增 TDD 用例 `alerts when the periodic locked period refresh cannot be rendered`，先红于 `periodic lock refresh unavailable` 从 timer callback 直接抛出，再最小修复。
- 验证：`npm run test:unit -- tests/unit/gantt-chart.test.ts` 通过，`1 file / 9 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 478 tests passed`，总行覆盖率 `76.62%`，`GanttChart.vue` 行覆盖率 `71.8%`。
- 验证：`npm run lint` 通过。

## Gantt Drag Completion Render Failure Slice

- 问题：拖拽结束后 `onAfterTaskDrag` 完成冲突检查和事件发射后直接调用 `gantt.render()`；render 失败时会抛出未处理异常。
- 风险：用户拖拽调整排产后，拖拽结果已经发出但甘特图刷新失败，页面没有可见提示，容易误判排产结果是否保存或是否存在冲突。
- 修复：拖拽结束刷新路径对 `gantt.render()` 使用 `try/catch`；渲染失败时显示“甘特图拖拽刷新失败：...”提示，渲染成功时清空错误。
- 行为保持：冲突检测、`taskDragConflict`、`taskDragEnd` 和临时拖拽样式清理顺序保持原样。
- 测试：新增 TDD 用例 `alerts when a dragged task cannot be rendered after conflict checks`，先红于 `drag render unavailable` 从 `onAfterTaskDrag` 直接抛出，再最小修复。
- 验证：`npm run test:unit -- tests/unit/gantt-chart.test.ts` 通过，`1 file / 10 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 479 tests passed`，总行覆盖率 `76.62%`，`GanttChart.vue` 行覆盖率 `72.25%`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 前端排产可视化可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
