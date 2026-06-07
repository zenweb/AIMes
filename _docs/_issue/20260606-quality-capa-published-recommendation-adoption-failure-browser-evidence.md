# 2026-06-06 Issue - 发布推荐采纳失败证据缺口

## 问题

发布推荐采纳会把 `QK-TRAIN-20260521-R2` 的现场采纳反馈写入推荐反馈记录，并生成下一轮训练集证据。此前已有成功路径证据，但缺少真实浏览器下写入失败时“不伪造采纳反馈”的证据。

## 影响

如果该失败态没有浏览器证据，后续回归可能出现假成功：页面显示已采纳推荐，或 OTD 证据链出现 `TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED` / `TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3`，但实际推荐反馈未持久化。

## 处理

- 新增 Chromium e2e 模拟 `aimes_quality_knowledge_recommendation_feedback` 写入失败。
- 验证 alert、可重试按钮、无 `.ranking-feedback`、无采纳 trace、无下一轮训练 trace、无 localStorage 反馈记录、无 OTD 伪证据。

## 状态

已验证通过。发布闸门 B 轨仍独立未完成。
