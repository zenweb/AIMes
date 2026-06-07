# 2026-06-05 Audit Replay Signoff Fail-loud Changelog

## POC Review Signoff Payload Guard Slice

- 选片依据：`AuditDecisionReplayPanel.vue` 是审计/合规关键路径，行覆盖率低于已收口的登录、排产甘特和路由路径；POC 复盘签署又是发布闸门证据之一。
- 问题：POC 复盘签署后端返回 malformed payload 时，`evidenceBatches.join()` / `reviewers.join()` 会在 computed replay 映射阶段触发未处理异常。
- 风险：审计回放面板会因为单条签署证据坏载荷而崩溃，基础 AI 建议回放和其它审计卡片也被影响。
- 修复：读取 POC 复盘签署后先校验 replay 必需数组；坏载荷不进入 `pocReviewSignoff`，改为通过 `replay-sync-alert` / `role="alert"` / `aria-live="assertive"` 显示失败原因。
- 行为保持：有效 POC 复盘签署仍正常生成报表中心回放链接；业务落库审计、配置审批和基础回放逻辑保持原样。
- 测试：新增 TDD 用例 `keeps base replay cards visible and alerts when the POC review signoff payload is malformed`，先红于未处理 `.join()` 异常和缺少 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`1 file / 12 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 483 tests passed`，总行覆盖率 `76.89%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `65.32%`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 审计回放可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
