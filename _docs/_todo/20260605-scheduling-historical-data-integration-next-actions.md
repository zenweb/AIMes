# 2026-06-05 Scheduling Historical Data Integration Next Actions

## Next
- [x] 把 `SchedulingContextSnapshot` 接入 `OptimizeScheduleAsync` 的历史数据分支。
- [x] 为历史数据为空的情况补兜底，避免默认排产路径空引用。
- [x] 跑 `SchedulingAppServiceTests` 和后端全量测试，确认改动回到绿灯。
- [ ] 按 CC plan 继续推进下一条剩余项，保持“计划 -> 实现 -> 审计 -> 验证”的闭环。
