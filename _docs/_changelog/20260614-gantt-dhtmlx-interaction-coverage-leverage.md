# 2026-06-14 Changelog - Gantt dhtmlx 交互覆盖率杠杆

## 变更
- 按“低覆盖 + 用户必经 + 现有功能精品化”规则，从壳层测试转向排程甘特图交互证据。
- 补充 dhtmlx 任务点击/双击边界：只有工单任务触发排程上下文动作，非工单节点不误触发。
- 补充解锁任务拖拽前清理旧冲突标记的回归测试。
- 补充拖拽过程中同设备时间冲突 `$css` 标记的添加与清除测试。

## 验证
- `npm run test:unit -- tests/unit/gantt-chart.test.ts`：22 passed。
- `npm run test:unit:coverage`：105 files / 754 tests passed。
- 覆盖率：总 lines 83.86%，statements 80.28%，branches 65.07%，functions 77.03%。
- `GanttChart.vue`：lines 87.21%，statements 82.47%，branches 58.28%，functions 84.31%。

## 说明
- 本片没有新增业务功能，只把现有 dhtmlx 甘特交互和冲突提示行为固化为可回归证据。
- 15 天灰度观察按 owner 指令后置，不作为当前继续工作的阻塞项。
