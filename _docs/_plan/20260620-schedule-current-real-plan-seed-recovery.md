# 2026-06-20 Plan - Schedule current 真实计划 seed 恢复

## 成功标准
- `/api/v1/scheduling/current` 在测试与本地演示数据库中返回 200。
- 返回计划必须包含至少一个排产项。
- 前端排产页不再因为缺少 current plan 进入演示 fallback warning。
- 修复不放宽核心查询为“任意最近计划”，避免展示过期或空计划。

## 执行结果
- 已定位根因：现有计划窗口过期，且旧逻辑只要 `SchedulePlans.Any()` 就跳过 demo seed。
- 已补 integration 红灯测试并修复。
- 已补幂等 SQL 恢复脚本，用于已有 Docker volume。

## 后续验证
- 跑前端 build。
- 真实浏览器验证 `/scheduling/scheduling` 使用后端 current plan，无 `后端排产服务不可用` fallback。

