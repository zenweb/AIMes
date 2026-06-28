# 2026-06-14 TODO - 批量方案反馈 Warning 竞态复查

## 下一步
- 继续留在排产多目标对比精品化，不扩新模块。
- 候选下一片：前后端推荐公式单一来源，避免 `recommendationScore` 在前后端双维护后漂移。
- 如完整 Chromium 后续重新出现 `.warnings-bar` retry，先收集 trace/video 和失败时 `.warnings-bar` 完整文本，再进入修复。

## 当前不做
- 不恢复 15 天灰度观察为当前阻塞项。
- 不在未复现根因时修改 `ScheduleBoard.vue`。
