# TODO：急单拖拽保存正式回写下一步

## 下一片建议

- 先修真实 dhtmlx e2e 基线：关闭 demo hints/offline demo 后，`.gantt_task_line` 必须能稳定渲染。
- 排查方向：
  - 是否需要在真实 dhtmlx 模式下 mock `/api/v1/scheduling/current`、`/api/v1/equipment` 和瓶颈设备接口。
  - 是否 dhtmlx 渲染出的任务条选择器不是 `.gantt_task_line` 或被容器尺寸/初始化时机影响。
  - 是否 `loadData()` fallback 与 `isOfflineDemoMode()` 的组合让真实模式没有任务数据。
- 基线稳定后，再补真实 Chrome 拖拽保存证据：采纳急单建议 -> 拖动任务条 -> `PATCH /api/v1/scheduling/plans/{planId}/items/{itemId}` 命中 -> 工作台显示“正式排产计划已更新”。

## 不建议

- 不建议在轻量甘特标记上伪造“拖拽保存”截图。
- 不建议继续反复调 Playwright 鼠标坐标；当前基础问题是任务条未渲染，不是拖拽动作坐标。
