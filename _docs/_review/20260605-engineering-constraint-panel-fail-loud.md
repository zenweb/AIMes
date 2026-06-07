# 2026-06-05 EngineeringConstraintPanel Fail-loud Review

## Findings

- 审计结论：本片修复工程约束证据同步失败时没有 fail-loud 的问题。
- 行为覆盖：`upsertOtdEvidenceChainRecord()` 抛错时，组件必须保留当前工程约束解释，并显示 `[role="alert"]` 说明 OTD 复盘证据未完整写入。
- 可访问性覆盖：失败提示必须使用 `aria-live="assertive"`，避免同步失败只停留在不可感知的事件异常里。
- TDD 证据：新增用例先失败于 Vue unhandled error 与缺失 `role="alert"`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 1 test passed`；全量前端 unit coverage `82 files / 443 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `75.70%`，`EngineeringConstraintPanel.vue` 行覆盖率 `100%`。

## Residual Risk

- 本片关闭工程约束同步写入失败的前端 fail-loud 缺口。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据；当前仓库仍需要真实 GitHub repo/remote 绑定才能取得 Hosted CI run。
