# 2026-06-06 GanttChart 路由事件清理真实浏览器证据

## Changed

- `GanttChart.vue` 保存 dhtmlx `attachEvent` 返回的事件句柄，并在组件卸载时调用 `detachEvent` 清理。
- `gantt-chart.test.ts` 增加卸载事件清理回归，防止路由切换后 stale callback 残留。
- `scheduling.spec.ts` 增加真实 Chromium 路由往返证据，验证返回排产页后仍可键盘打开工单详情。

## Verification

- RED：`npm.cmd run test:unit -- tests/unit/gantt-chart.test.ts -t "detaches dhtmlx event handlers"` -> 1 failed，`detachEvent` 0 次调用。
- GREEN：`npm.cmd run test:unit -- tests/unit/gantt-chart.test.ts -t "detaches dhtmlx event handlers"` -> 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/gantt-chart.test.ts` -> 11/11 passed。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "甘特图路由往返"` -> Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

本次只关闭 A 轨排产甘特图路由事件清理证据缺口；Hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍属于 B 轨未关闭项。
