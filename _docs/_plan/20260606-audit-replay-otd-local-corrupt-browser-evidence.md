# 2026-06-06 Plan - Audit Replay OTD 本地证据链损坏真实浏览器证据

## Objective

为低覆盖且发布证据链关键的 `AuditDecisionReplayPanel.vue` 补一条真实浏览器 fail-loud 证据。

## Success Criteria

- 损坏 `aimes_otd_evidence_chain` 时页面显示明确告警。
- 基础回放仍可见。
- OTD 指标为 `0`，不生成伪造 OTD 回放卡片。
- 损坏载荷被清理。
- 真实 Chromium e2e 通过。

## Execution

1. 解析 coverage，选择 `AuditDecisionReplayPanel.vue`。
2. 先写 RED Chromium 用例。
3. 修复 e2e Nuxt 构建入口，恢复真实浏览器验证链。
4. 实现最小 fail-loud 检测。
5. 重跑定向 Chromium 验证。

## Result

完成。定向 Chromium e2e PASS。
