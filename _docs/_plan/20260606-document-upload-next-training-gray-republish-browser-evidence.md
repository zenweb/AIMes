# 2026-06-06 DocumentUpload 下一训练集重新灰度发布失败 Plan

## Success Criteria

- 真实 Chromium 打开 Admin 并完成 `回滚到 R2`、`调整范围重开校验`。
- 真实 Chromium 回到知识治理页面并点击 `重新运行灰度前校验`。
- `重新灰度发布 R3` 写入失败后，页面展示 assertive alert。
- R3 仍停留在灰度前校验通过状态。
- 历史表不出现重新发布审计号或追踪号。

## Execution

- 使用现有 `seedR3GrayReleaseDemo` 和重新灰度发布 happy path。
- 只拒绝 R3 gray republish 对 `aimes_quality_knowledge_retraining_versions` 的写入。
- 保持生产代码不变，只补真实浏览器证据。

## Stop Condition

- 目标 e2e 通过。
- 文档记录变更、验证、残余风险和下一步。
- 不继续扩展新切片。
