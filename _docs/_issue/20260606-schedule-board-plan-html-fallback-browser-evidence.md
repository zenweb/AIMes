# 2026-06-06 ScheduleBoard 排产计划 HTML fallback Issue

## Issue

`ScheduleBoard` 在真实 Chromium 中遇到 `/api/v1/scheduling/current` 返回 HTML fallback 时，页面 warning 只暴露底层接口错误：`API 返回了 HTML fallback，疑似后端不可用：/scheduling/current`。这对调度员不够可诊断，无法直接判断是当前排产计划依赖坏了。

## Resolution

- 在排产页当前排产计划读取边界补充业务上下文。
- 保留底层 HTML fallback 原因。
- 增加真实 Chromium e2e 验证 warning 和 demo 甘特任务可见。

## Status

- A 轨：已关闭。
- B 轨发布闸门：未关闭，仍需单独追踪。
