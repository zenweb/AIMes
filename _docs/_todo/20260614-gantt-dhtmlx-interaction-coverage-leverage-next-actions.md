# 2026-06-14 Todo - Gantt dhtmlx 下一步

## Done
- 补任务点击/双击只对工单生效的 dhtmlx 事件测试。
- 补解锁任务拖拽前清理旧冲突标记测试。
- 补同设备拖拽冲突 `$css` 添加与清除测试。
- 跑通 `npm run test:unit -- tests/unit/gantt-chart.test.ts`。
- 跑通完整 `npm run test:unit:coverage`。

## Next
- 继续按覆盖率杠杆选择下一片，优先低覆盖且用户必经组件。
- 推荐下一片：`AuditDecisionReplayPanel`，因为审计回放属于发布/合规关键路径，且 branches 覆盖率仍偏低。
- 若转入下一片，先读组件与现有测试，只补现有行为边界，不扩新功能。
- 灰度观察继续后置，不混入当前精品化测试切片。
