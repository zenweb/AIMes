# 2026-06-06 GanttChart 路由事件清理 Plan

## Success Criteria

- 单元测试先失败，证明 `GanttChart` 卸载时未释放 dhtmlx 事件。
- 实现最小清理：保存事件句柄并在 `onBeforeUnmount` 调用 `detachEvent`。
- 目标单测和整份 `gantt-chart.test.ts` 通过。
- 真实 Chromium 证明调度页路由往返后，甘特任务仍可键盘打开工单详情。

## Result

- RED 已取得：`detachEvent` 0 次调用。
- GREEN 已取得：目标单测 1/1，整份单测 11/11。
- 真实浏览器已取得：`scheduling.spec.ts -g "甘特图路由往返"` Chromium 1/1 passed。

## Stop Condition

- 本片只处理 dhtmlx 事件清理，不扩展甘特图功能，不关闭 B 轨发布闸门。
