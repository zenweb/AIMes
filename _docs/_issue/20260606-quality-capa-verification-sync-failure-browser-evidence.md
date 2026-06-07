# 2026-06-06 Issue - CAPA 验证同步失败证据缺口

## 问题

基础 CAPA 任务验证会写入 `aimes_quality_capa_closure`，并生成审计/OTD 可读的质量闭环证据。此前已有组件级 fail-loud 单测，但缺少真实浏览器下写入失败时“不伪造已验证”的证据。

## 影响

如果该失败态没有浏览器证据，后续回归可能出现假成功：页面显示任务已验证，或 OTD 证据链出现 `TRACE-QA-CAPA-20260520-CAPA-SPC-MONITOR`，但实际 CAPA closure 未持久化。

## 处理

- 新增 Chromium e2e 模拟 `aimes_quality_capa_closure` 写入失败。
- 验证 alert、可重试按钮、任务仍执行中、无已验证按钮、无 CAPA trace、无 localStorage closure、无 OTD 伪证据。

## 状态

已验证通过。发布闸门 B 轨仍独立未完成。
