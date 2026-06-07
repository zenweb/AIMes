# 2026-06-06 Admin 质量灰度扩大决策失败 Plan

## Success Criteria

- 真实 Chromium 打开 Admin Agent 治理。
- 真实点击 R3 质量灰度监控的 `扩大灰度`。
- 写入失败后，页面展示 assertive alert。
- R3 监控卡仍保留扩大/回滚操作。
- 卡片不出现扩大决策审计号或追踪号。

## Execution

- 使用现有 `seedR3GrayReleaseDemo`。
- 只拒绝 R3 expand decision 对 `aimes_quality_knowledge_gray_release_decisions` 的写入。
- 保持生产代码不变，只补真实浏览器证据。

## Stop Condition

- 目标 e2e 通过。
- 文档记录变更、验证、残余风险和下一步。
- 不继续扩展新切片。
