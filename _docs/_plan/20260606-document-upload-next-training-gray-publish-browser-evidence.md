# 2026-06-06 DocumentUpload 下一训练集灰度发布失败 Plan

## Success Criteria

- 真实 Chromium 打开知识治理页面。
- 真实点击 `合并现场反馈`、`批准 R3 训练集`、`运行灰度前校验`。
- `灰度发布 R3` 写入失败后，页面展示 assertive alert。
- R3 仍停留在灰度前校验通过状态。
- 历史表不出现灰度发布文件名或发布审计号。

## Execution

- 使用现有 R3 happy path 数据。
- 只拒绝 R3 gray publish 对 `aimes_quality_knowledge_retraining_versions` 的写入。
- 保持生产代码不变，只补真实浏览器证据。

## Stop Condition

- 目标 e2e 通过。
- 文档记录变更、验证、残余风险和下一步。
- 不继续扩展新切片。
