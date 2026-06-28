# 2026-06-14 Issue - 本地反馈 snapshot 可能覆盖后端正式反馈

## 问题
- 上一片已让排产页刷新时回读本地 `aimes_schedule_feedback_snapshot`。
- 但若后端已经同步了更新的正式反馈，旧本地 snapshot 仍可能被优先显示。

## 影响
- 多端或后台同步成功后，调度员可能看到陈旧的本地批量采纳记录。
- 报表和排产页的反馈口径可能短暂不一致，削弱审计可信度。

## 修复
- `restoreLatestFeedbackSnapshot()` 改为后端优先：`getLatestAdoptionFeedback() ?? readScheduleFeedbackSnapshot()`。
- 单测覆盖后端反馈优先于本地旧 snapshot。
- Chromium 覆盖先本地兜底、再后端正式反馈覆盖本地回显。

## 剩余风险
- 后端返回字段完整性仍依赖 API 类型与后端契约；后续可补不可审计字段的 fail-loud。
