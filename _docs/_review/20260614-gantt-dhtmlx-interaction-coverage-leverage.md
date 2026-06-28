# 2026-06-14 Review - Gantt dhtmlx 交互覆盖率杠杆

## Findings
- `GanttChart` 是排程核心视图，任务选择、双击打开、拖拽冲突提示都属于用户高频关键路径。
- 原有测试已覆盖部分渲染与数据转换，但 dhtmlx 事件回调和拖拽冲突标记仍有可回归空白。
- 本片聚焦现有行为精品化，没有扩展新功能，也没有改变业务实现。

## Verification
- 单文件单测：`gantt-chart.test.ts` 22 passed。
- 完整前端 coverage：105 files / 754 tests passed。
- `GanttChart.vue` 覆盖率提升到 lines 87.21%，branches 58.28%，functions 84.31%。

## Residual Risk
- 本片为组件单元证据，未重新补真实浏览器拖拽截图。
- dhtmlx 真实拖拽仍依赖既有 E2E/真实浏览器证据链继续兜底；后续若改动拖拽写回链路，应再跑真实 Chrome 验证。
