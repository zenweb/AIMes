# 2026-06-06 DocumentUpload 下一训练集合并失败 Plan

## Success Criteria

- 真实 Chromium 打开知识治理页面。
- 真实点击 `合并现场反馈`。
- R3 合并写入失败后，页面展示 assertive alert。
- R3 仍停留在候选状态。
- 历史表不出现合并文件名或合并审计号。

## Execution

- 使用现有 R3 happy path 数据。
- 只拒绝 R3 merge 对 `aimes_quality_knowledge_retraining_versions` 的写入。
- 保持生产代码不变，只补真实浏览器证据。

## Stop Condition

- 目标 e2e 通过。
- 文档记录变更、验证、残余风险和下一步。
- 不继续扩展新切片。
