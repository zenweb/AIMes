# 2026-06-07 Issue - MRB 处置闭环失败证据缺口

## 问题

MRB 处置闭环会把 active MRB 决策更新为 closed，并写入 `TRACE-QA-WO-004-MRB-CLOSURE-20260521`。此前已有单测覆盖闭环写入失败 fail-loud，但缺少真实浏览器下“不伪造 closed”的证据。

## 影响

如果该失败态没有浏览器证据，后续回归可能出现假成功：页面显示 MRB 已闭环，或 OTD 证据链出现闭环 trace，但实际 MRB 记录仍未可靠持久化。

## 处理

- 新增 Chromium e2e 模拟 `aimes_quality_mrb_disposition` 闭环写入失败。
- 验证 alert、可重试按钮、无闭环成功消息、无闭环审计号/trace、localStorage 仍 active、无 OTD 伪证据。

## 状态

已验证通过。发布闸门 B 轨仍独立未完成。
