# 2026-06-14 Issue - Gantt dhtmlx 关键交互缺少回归证据

## Problem
- `GanttChart` 是排程核心用户路径，但部分 dhtmlx 事件交互缺少精确回归证据。
- 任务点击/双击若误作用于非工单节点，会污染排程上下文。
- 拖拽冲突提示若旧标记未清理，用户会看到过期冲突状态；若冲突清除不及时，也会误导排程判断。

## Resolution
- 增加点击/双击仅工单节点生效的测试。
- 增加拖拽前清理旧冲突 `$css` 标记的测试。
- 增加拖拽中同设备时间冲突标记添加与清除的测试。

## Verification
- `npm run test:unit -- tests/unit/gantt-chart.test.ts`：22 passed。
- `npm run test:unit:coverage`：105 files / 754 tests passed。
