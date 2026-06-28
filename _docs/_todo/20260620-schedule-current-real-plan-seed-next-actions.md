# 2026-06-20 Todo - Schedule current 真实计划数据后续

## 下一步
- 检查后端 seed、迁移和 `SchedulingAppService.GetCurrentPlanAsync`，确认为什么当前环境没有 current plan。
- 如果产品要求首屏必须是真实计划，应补后端 seed/current 或启动校验，而不是长期依赖演示排产数据。
- 如果允许空环境启动，应强化页面内空状态：给出创建/优化当前计划入口、关联审计日志、帮助说明，并保持中英双语提示。
- 真实浏览器回归入口：`http://127.0.0.1:4173/scheduling/scheduling`。

