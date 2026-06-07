# Next Actions: RiskActionQueuePanel 风险 SLA 复核

## Done

- 已补风险 SLA 晨会复核包生成失败 fail-loud。
- 已补风险 SLA 晨会复核闭环失败 fail-loud。
- 已补单测和真实 Chromium 失败态证据。

## Next

- 后续按覆盖率杠杆继续比较 `RiskActionQueuePanel`、`AuditDecisionReplayPanel`、`ScheduleBoard` 等低分支组件。
- 若继续风险域，优先审查跨页 SLA 复核读取失败或审计回放失败态是否仍有静默降级。
- B 轨发布闸门等外部事实变化后再重跑，不在 A 轨测试上假绿。
