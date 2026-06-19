# 2026-06-20 Plan - Schedule Repository Current Head CI Repair

## Success Criteria
- `ScheduleRepositoryTests` 能编译并执行。
- 排产读模型仍使用 no-tracking，写回/重排路径可通过 tracked read 获取聚合。
- Agent Evaluation 不再因 `GetByIdForUpdateAsync` 缺失失败。

## Steps
1. 从 Agent Evaluation 日志确认新失败点。
2. 检查本地仓储接口和实现差异。
3. 本地运行 solution build 和 `ScheduleRepositoryTests`。
4. 提交推送后继续观察 hosted CI。
