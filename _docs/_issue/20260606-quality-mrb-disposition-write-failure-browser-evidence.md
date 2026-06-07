# 2026-06-06 Issue - MRB 处置证据写入失败证据缺口

## 问题

MRB 报废补料决策会写入 `aimes_quality_mrb_disposition`，并生成排产影响和 OTD 证据。此前已有单测覆盖写入失败 fail-loud，但缺少真实浏览器下“不伪造 MRB 决策”的证据。

## 影响

如果该失败态没有浏览器证据，后续回归可能出现假成功：页面显示 MRB 决策已生成，或排产/OTD 证据链出现 `TRACE-QA-WO-004-MRB-DISPOSITION-20260521`，但实际 MRB 记录未持久化。

## 处理

- 新增 Chromium e2e 模拟 `aimes_quality_mrb_disposition` 写入失败。
- 验证 alert、可重试按钮、无成功消息、无闭环按钮、无 localStorage MRB 记录、无 OTD 伪证据。

## 状态

已验证通过。发布闸门 B 轨仍独立未完成。
