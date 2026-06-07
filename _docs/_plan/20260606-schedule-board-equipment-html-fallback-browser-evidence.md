# 2026-06-06 ScheduleBoard 设备列表 HTML fallback Plan

## Success Criteria

- 真实 Chromium 能模拟 `/api/v1/equipment` 返回 HTML fallback。
- 排产页 warning 同时展示排产回退、设备列表业务上下文和底层错误原因。
- 页面仍显示可执行 demo 甘特任务。
- 保持变更最小，不扩展排产新功能。

## Result

- RED：新增 e2e 首次失败，证明真实浏览器只显示底层 `/equipment` fallback 原因。
- GREEN：`ScheduleBoard.vue` 在设备列表读取边界补上下文后，目标单测和目标 e2e 均通过。

## Stop Condition

- 本片到目标单测和真实 Chromium 证据通过即停止，不继续扩大到其它 ScheduleBoard 路径。
