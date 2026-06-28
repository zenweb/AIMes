# 2026-06-20 Review - Schedule current 真实计划 seed 恢复

## 结论
- 通过。排产 current 404 的根因从前端噪声推进到后端数据链路，并已补齐测试与本地演示数据恢复脚本。

## 审计点
- Repository 不再把空 current plan 当作可用计划。
- Development demo seeder 可在已有过期计划时补当前计划。
- Integration seed 保证 current plan 有真实排产项，测试不再接受 OK/NotFound 模糊结果。
- `db/ensure-current-schedule-plan.sql` 幂等执行，已有可用 current plan 时不重复插入。

## 剩余风险
- Compose API 当前以 Production 运行，不会自动执行 `DemoDataSeeder`；已有 PostgreSQL volume 需要显式执行 `db/ensure-current-schedule-plan.sql` 或重建 volume 才能补历史空洞。

