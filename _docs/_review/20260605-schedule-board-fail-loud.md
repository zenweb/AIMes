# 2026-06-05 ScheduleBoard Fail-loud Review

## Findings

- 审计结论：本片修复排产主入口初始加载失败后 fallback 提示不包含后端失败原因的问题。
- 行为覆盖：`api.getCurrentPlan()` 抛错时，页面仍应降级显示演示排产，并通过 warnings-bar 告知用户当前不是后端真实计划。
- Fail-loud 覆盖：同一场景必须包含“后端排产服务不可用”“当前显示演示排产数据”和具体错误原因。
- 状态覆盖：warnings-bar 仍是 `role="status"` / `aria-live="polite"`；不把演示 fallback 误升级成阻塞性 error banner。
- TDD 证据：新增初始计划加载失败用例先红于 warning 缺少 `current plan API unavailable`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 12 tests passed`；全量前端 unit coverage `82 files / 480 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `76.85%`，`ScheduleBoard.vue` 行覆盖率 `68.88%`。

## Residual Risk

- `ScheduleBoard.vue` 仍低于已收口的部分用户关键组件，后续可按覆盖率杠杆继续审计高风险异步证据读取边界。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据。
