# 2026-06-14 Todo - Report 外协释放下一步

## Done
- 补外协释放后 `product-flange` OTD 恢复口径测试。
- 验证 KPI 卡片恢复状态、详情解释和 CSV 导出。
- 跑通 `npm run test:unit -- tests/unit/report-board.test.ts`。
- 跑通完整 `npm run test:unit:coverage`。

## Next
- 继续按覆盖率杠杆选择下一片低覆盖且用户必经组件。
- 候选可考虑 `ScheduleBoard`、`PurchaseBoard` 或 `ProductionBoard`，优先补现有业务闭环弱证据。
- 不继续扩展报表中心新功能，除非发现真实坏路径或审计缺口。
- 灰度观察继续后置，不混入当前精品化测试切片。
