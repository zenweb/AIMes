# 2026-06-14 Issue - 批量采纳反馈刷新后丢失回显

## 问题
- 批量对比采纳会写入 `aimes_schedule_feedback_snapshot`。
- 报表页可以消费该 snapshot，但排产页自身刷新后没有回读，最近反馈区域回到等待调度员决策。

## 影响
- 调度员刚采纳的批量方案在刷新/重开排产页后缺少连续回显。
- 这会削弱排产页作为调度工作台的可信度，也让“本地保留目标切换”的 fail-loud 语义不完整。

## 修复
- `ScheduleBoard.vue` 启动时调用 `readScheduleFeedbackSnapshot()`。
- 若 snapshot 有效，则恢复 `latestFeedback`，让 `ScheduleFeedbackPanel` 和 Agent 工作台继续展示最近采纳状态。
- 单测和真实 Chromium 均覆盖 reload 后回显。

## 剩余风险
- 暂未定义后端最新反馈与本地 snapshot 同时存在时的优先级。
