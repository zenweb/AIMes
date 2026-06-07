# 2026-06-06 Issue - 助手质量责任闭环失败证据缺口

## 问题

交期恢复执行包质量责任动作会把首件复核闭环写回 `aimes_assistant_recovery_packages`，并生成质量闭环 OTD 证据。此前已有组件级 fail-loud 单测，但缺少真实浏览器下写入失败时“不伪造 closed”的证据。

## 影响

如果该失败态没有浏览器证据，后续回归可能出现假成功：页面显示质量动作已闭合，或 OTD 证据链出现 `TRACE-CHAT-RECOVERY-QUALITY-FIRST-ARTICLE-20260521`，但实际执行包仍未可靠持久化。

## 处理

- 新增 Chromium e2e 模拟 `aimes_assistant_recovery_packages` 写入失败。
- 验证 alert、可重试按钮、无 `.assistant-quality-result`、无闭环审计号、无闭环 trace、无 localStorage closed、无 OTD 伪证据。

## 状态

已验证通过。发布闸门 B 轨仍独立未完成。
