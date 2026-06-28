# 2026-06-20 Issue - Schedule current 真实计划缺失

## 现象
- `/api/v1/scheduling/current` 返回 404，前端只能回退演示排产数据。
- Docker PostgreSQL 中只有 `2026-06-12` 到 `2026-06-13` 的过期计划，且 `work_orders` 为空。

## 根因
- `DemoDataSeeder.SeedScheduleAsync` 用 `SchedulePlans.AnyAsync()` 作为跳过条件，已有过期计划时不会补新的当前计划。
- `ScheduleRepository.GetCurrentPlanAsync` 没有排除空 current plan。
- 已存在 Docker volume 不会重新执行 `db/seed.sql`，所以动态 `NOW()` seed 无法自动修复历史数据。

## 处理
- seed 跳过条件改为“已有覆盖当前时间且有排产项的计划”。
- repository current 查询同样要求有排产项。
- 新增幂等 SQL 脚本补齐已有演示数据库。

## 状态
- 后端测试通过。
- 当前 Docker PostgreSQL 已手工执行恢复脚本，API 直接读取返回 200 与 3 个排产项。

