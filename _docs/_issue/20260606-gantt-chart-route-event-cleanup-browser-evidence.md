# 2026-06-06 GanttChart 路由事件清理 Issue

## Issue

`GanttChart` 绑定 dhtmlx 事件后没有在卸载时显式释放事件句柄。调度页是用户必经页面，路由往返频繁时 stale callback 可能跨页面残留，影响拖拽、点击或后续渲染稳定性。

## Resolution

- 保存 `onTaskClick`、`onTaskDblClick`、`onBeforeTaskDrag`、`onTaskDrag`、`onAfterTaskDrag` 的 dhtmlx 事件句柄。
- 组件卸载时逐个 `detachEvent`，再清理 dhtmlx 数据。
- 增加单元回归和真实 Chromium 路由往返证据。

## Status

- A 轨：已关闭。
- B 轨发布闸门：未关闭，仍需单独追踪。
