# 2026-06-14 Plan - Audit Replay 本地 OTD 损坏 fail loud

## Success Criteria
- 不新增审计功能，只补现有本地 OTD 损坏边界测试。
- 本地 OTD 证据链 JSON 损坏时必须出现明确 alert。
- 损坏载荷不能隐藏基础回放卡片。
- 默认回放详情仍落到可用的急单重排决策链。
- 单文件测试与完整 coverage 都通过。

## Execution
- 读取 `AuditDecisionReplayPanel.vue` 与现有 `audit-decision-replay-panel.test.ts`。
- 复用现有 mount helper 与 localStorage stub。
- 新增损坏 JSON 场景测试。
- 先跑单文件测试，再跑完整 coverage。

## Stop Condition
- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过。
- `npm run test:unit:coverage` 通过。
- 当天 changelog/review/todo/issue/plan 文档补齐。
