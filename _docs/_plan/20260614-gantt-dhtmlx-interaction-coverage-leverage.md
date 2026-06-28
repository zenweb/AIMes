# 2026-06-14 Plan - Gantt dhtmlx 交互覆盖率杠杆

## Success Criteria
- 不新增排程功能，只补现有甘特交互行为测试。
- 点击/双击事件只对工单任务触发上下文动作。
- 解锁任务进入拖拽前会清理旧冲突标记。
- 拖拽中同设备时间重叠会标记冲突，冲突解除后会清除标记。
- 单文件测试与完整 coverage 都通过。

## Execution
- 读取 `GanttChart.vue` 与现有 `gantt-chart.test.ts`。
- 补 dhtmlx 事件回调边界测试。
- 补拖拽冲突 `$css` 状态测试。
- 先跑单文件测试，再跑完整 coverage，避免局部覆盖率阈值误判。

## Stop Condition
- `npm run test:unit -- tests/unit/gantt-chart.test.ts` 通过。
- `npm run test:unit:coverage` 通过。
- 当天 changelog/review/todo/issue/plan 文档补齐。
