# 2026-06-05 Audit Replay Signoff Fail-loud Review

## Findings

- 审计结论：本片修复 POC 复盘签署 malformed payload 导致审计回放 computed 映射崩溃的问题。
- 行为覆盖：签署载荷缺少 `evidenceBatches` 或 `reviewers` 时，基础回放卡仍保持可见。
- Fail-loud 覆盖：同一场景必须显示 assertive alert，并包含“POC 复盘签署加载失败”和具体 malformed 记录标识。
- 状态覆盖：坏签署记录不进入 `pocReviewSignoff`，避免 `mapPocReviewSignoffToReplay()` 在渲染阶段触发未处理异常。
- TDD 证据：新增用例先红于 `Cannot read properties of undefined (reading 'join')`；修复后目标 unit 变绿且无未处理异常。
- 验证证据：目标 unit `1 file / 12 tests passed`；全量前端 unit coverage `82 files / 483 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `76.89%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `65.32%`。

## Residual Risk

- `AuditDecisionReplayPanel.vue` 还有多类证据映射，后续可继续按发布关键度审计 malformed payload 边界。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据。
