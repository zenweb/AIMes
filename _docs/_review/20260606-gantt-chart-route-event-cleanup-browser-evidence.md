# 2026-06-06 GanttChart 路由事件清理 Review

## Review

- 未发现本片新增阻断问题。
- `GanttChart` 原本在挂载时绑定 5 个 dhtmlx 事件，但卸载时只 `clearAll`，没有释放事件句柄；本片已补 `detachEvent`。
- 真实 Chromium 证据覆盖路由离开报表页再返回调度页后，甘特任务仍可键盘打开工单详情。

## Residual Risk

- 本片没有跑全量前端 coverage，避免为单点可靠性修复消耗过多时间。
- B 轨发布闸门仍失败：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察证据未齐。

## Verification

- `npm.cmd run test:unit -- tests/unit/gantt-chart.test.ts -t "detaches dhtmlx event handlers"`：RED 后 GREEN。
- `npm.cmd run test:unit -- tests/unit/gantt-chart.test.ts`：11/11 passed。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "甘特图路由往返"`：Chromium 1/1 passed。
