# 2026-06-05 DocumentUpload Fail-loud Review

## Findings

- 审计结论：本片修复知识库入口客户工单导入证据刷新失败被静默吞掉的问题。
- 行为覆盖：`readCustomerOrderImportEvidenceBackendFirst()` 抛错时，页面仍保留客户真实工单导入样例面板和本地样例状态。
- Fail-loud 覆盖：同一场景必须显示 assertive alert，并包含“客户工单导入证据刷新失败”和后端失败原因。
- 状态覆盖：空状态仍显示“待生成导入批次”和“尚未准备客户样例”，避免把后端刷新失败误呈现为证据已导入。
- TDD 证据：新增用例先红于页面缺少 `[role="alert"]`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 13 tests passed`；全量前端 unit coverage `82 files / 481 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `76.86%`，`DocumentUpload.vue` 行覆盖率 `64.89%`。

## Residual Risk

- `DocumentUpload.vue` 仍可继续审计其它后端证据刷新链路，但不应在一个已覆盖点上无限微切片。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据。
