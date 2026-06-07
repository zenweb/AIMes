# 2026-06-06 ScheduleBoard 排产优化失败 Plan

## Success Criteria

- 真实 Chromium 能触发 `排产优化` 按钮。
- `/api/v1/scheduling/optimize` 失败时页面展示 `role="alert"` 告警。
- 告警包含优化失败标题和后端错误原因。
- 当前甘特图任务仍保留。
- 不修改生产行为，只补证据。

## Result

- 新增目标 e2e。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "排产优化失败"` 最终 Chromium 1/1 passed。

## Stop Condition

- 本片到真实 Chromium 证据通过即停止，不继续扩大到其它 ScheduleBoard 路径。
