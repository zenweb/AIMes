# GanttChart 路由事件清理真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：`GanttChart` 在调度页路由离开/返回时的 dhtmlx 事件清理。
- 目标：组件卸载后释放 dhtmlx 事件句柄，避免 stale callback 跨路由残留；真实 Chromium 中调度员返回排产页后仍可用键盘打开工单详情。

## 变更

- `src/frontend/src/components/gantt/GanttChart.vue`
  - 保存 `gantt.attachEvent` 返回的 5 个事件句柄。
  - `onBeforeUnmount` 中逐个调用 `gantt.detachEvent`，再清理图表数据。
- `src/frontend/tests/unit/gantt-chart.test.ts`
  - 新增卸载清理 dhtmlx 事件句柄的回归。
- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 新增真实 Chromium 用例：`甘特图路由往返后仍可用键盘打开工单详情`。

## RED/GREEN

- RED：
  - `npm.cmd run test:unit -- tests/unit/gantt-chart.test.ts -t "detaches dhtmlx event handlers"`
  - 结果：1 failed；`detachEvent` 调用次数为 0。
- GREEN：
  - `npm.cmd run test:unit -- tests/unit/gantt-chart.test.ts -t "detaches dhtmlx event handlers"`
  - 结果：1/1 passed。
  - `npm.cmd run test:unit -- tests/unit/gantt-chart.test.ts`
  - 结果：11/11 passed。

## 真实浏览器

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "甘特图路由往返"`
  - 结果：Nuxt production build passed，Chromium 1/1 passed。
  - 覆盖：调度页甘特任务条可键盘打开详情，跳转报表页后返回调度页，甘特任务条仍可键盘打开详情且详情面板具备 dialog 语义。

## 结论

- 甘特图 dhtmlx 事件现在在组件卸载时显式释放，降低排产页路由往返后的 stale callback 风险。
- 本片只推进 A 轨既有排产甘特图可靠性，不关闭 v1.0.0 B 轨发布闸门。
