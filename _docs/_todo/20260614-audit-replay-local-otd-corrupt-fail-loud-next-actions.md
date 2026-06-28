# 2026-06-14 Todo - Audit Replay 下一步

## Done
- 补本地 OTD 证据链损坏的 fail-loud 测试。
- 验证损坏载荷不会打断基础审计回放。
- 跑通 `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts`。
- 跑通完整 `npm run test:unit:coverage`。

## Next
- 继续按覆盖率杠杆选择低覆盖且用户必经组件。
- 候选可转向 `AnomalyBoard`、`ReportBoard` 或 `ScheduleBoard`，优先选能补真实业务边界的现有功能。
- 不继续无上限精修 `AuditDecisionReplayPanel`，除非发现真实坏路径或 release 证据缺口。
- 灰度观察继续后置，不混入当前精品化测试切片。
