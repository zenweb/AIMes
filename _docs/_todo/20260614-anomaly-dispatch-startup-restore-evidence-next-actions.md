# 2026-06-14 Todo - Anomaly dispatch 下一步

## Done
- 补启动时恢复已确认异常分流记录测试。
- 验证最新分流 trace 会显示在现场事件中心。
- 跑通 `npm run test:unit -- tests/unit/anomaly-board.test.ts`。
- 跑通完整 `npm run test:unit:coverage`。

## Next
- 继续按覆盖率杠杆选择下一片低覆盖且用户必经组件。
- 候选可考虑 `ReportBoard`、`ScheduleBoard` 或 `PurchaseBoard`，优先补现有业务闭环的弱证据。
- 不继续扩展异常管理新功能，除非发现真实坏路径或审计缺口。
- 灰度观察继续后置，不混入当前精品化测试切片。
