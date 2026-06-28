# 2026-06-14 Plan - 批量对比采纳 feedback snapshot 持久化

## 成功标准
- 批量对比“采用此方案”成功后必须调用 `writeScheduleFeedbackSnapshot`。
- snapshot 必须包含采纳决策、批量对比分类、目标名称和 `TRACE-SCH-FEEDBACK-BATCH-*`。
- 真实 Chromium 必须验证 `aimes_schedule_feedback_snapshot` 写入，并包含 `source: local`。
- 覆盖率、diff 检查、敏感信息扫描和关键文本审计完成。

## 执行步骤
- 已补单测断言并确认旧逻辑 RED：`writeScheduleFeedbackSnapshot` calls 为 0。
- 已在 `onApplyObjective` 中复用 `feedbackRecord` 调用 `writeScheduleFeedbackSnapshot`。
- 已补真实 Chromium 断言，验证 localStorage snapshot 包含批量采纳记录。
- 已完成窄范围 GREEN、`schedule-feedback-sync` 单测、完整 `ScheduleBoard` 单测、目标 Chromium、完整 scheduling Chromium 和覆盖率验证。

## 停止条件
- 本片在审计通过后停止，不扩大到报告/OTD 页面消费链路。
