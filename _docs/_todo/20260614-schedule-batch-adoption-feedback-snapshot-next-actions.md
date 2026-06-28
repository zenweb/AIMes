# 2026-06-14 TODO - 批量对比采纳 feedback snapshot 持久化

## 下一步
- 候选切片：验证报告/OTD 证据视图刷新后能消费 `aimes_schedule_feedback_snapshot` 中的批量采纳记录。
- 继续保留完整 scheduling Chromium 作为排产精品化回归门槛。
- 若发现报告页未展示批量采纳 snapshot，先补红测，再做最小实现。

## 当前不做
- 不恢复 15 天灰度观察作为当前阻塞项。
- 不新增排产功能范围。
- 不改写 `schedule-feedback-sync` 的存储格式。
