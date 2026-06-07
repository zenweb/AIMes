# 2026-06-06 ScheduleBoard 排产优化失败 Issue

## Issue

`ScheduleBoard` 排产优化失败已有单元覆盖，但缺真实浏览器证据。该动作是调度员主动触发的核心工作流，优化接口失败时必须可见告警，并且不能丢失当前甘特图。

## Resolution

- 增加真实 Chromium e2e。
- 拦截 `/api/v1/scheduling/optimize` 返回 503。
- 断言 fail-loud 告警和当前甘特图任务数量保留。

## Status

- A 轨：已关闭。
- B 轨发布闸门：未关闭，仍需单独追踪。
