# 2026-06-14 Issue - 批量对比采纳未写入 feedback snapshot

## 问题
- 批量对比方案采纳后，页面最近反馈已经能显示采纳记录。
- 但本地 `aimes_schedule_feedback_snapshot` 没有同步写入该批量采纳动作，刷新/报告/OTD 证据链缺少持久化入口。

## 影响
- 用户在当前页面能看到采纳记录，但刷新后追溯能力不足。
- 报告或 OTD evidence chain 后续消费 snapshot 时，无法拿到最近一次批量对比采纳的 traceId 和分类信息。

## 修复
- 在 `onApplyObjective` 成功采纳批量方案后调用 `writeScheduleFeedbackSnapshot`。
- 写入内容包含 `已采纳批量对比方案`、`批量对比采纳`、目标名称、采纳说明和 `TRACE-SCH-FEEDBACK-BATCH-*`。
- 单测验证调用参数，真实 Chromium 验证 localStorage snapshot 包含 `source: local`。

## 剩余风险
- 报告/OTD 页面是否完整展示该 snapshot，需要后续独立验证。
