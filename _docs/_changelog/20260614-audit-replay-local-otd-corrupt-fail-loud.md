# 2026-06-14 Changelog - Audit Replay 本地 OTD 损坏 fail loud

## 变更
- 按覆盖率杠杆继续补强 `AuditDecisionReplayPanel`，聚焦现有审计回放链路。
- 新增本地 OTD 证据链载荷损坏时的组件测试。
- 验证损坏载荷会通过 `.replay-sync-alert` 暴露，且基础回放卡片和默认决策链仍保持可用。

## 验证
- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts`：25 passed。
- `npm run test:unit:coverage`：105 files / 755 tests passed。
- 覆盖率：总 lines 83.90%，statements 80.31%，branches 65.09%，functions 77.03%。
- `AuditDecisionReplayPanel.vue`：lines 78.15%，statements 76.35%，branches 37.84%，functions 86.79%。

## 说明
- 本片没有新增功能，只补现有 fail-loud 审计边界的回归证据。
- 15 天灰度观察按 owner 指令后置，不作为当前继续工作的阻塞项。
