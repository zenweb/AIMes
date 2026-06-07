# 2026-06-05 Plan - ScheduleBoard Payload Guard Regression

## Success Criteria

- 不继续投入已 100% 行覆盖的 `LoginPage.vue`。
- 用当前覆盖率选择低覆盖且用户必经的现有组件。
- 为 `ScheduleBoard` 锁定计划载荷坏数据 fallback。
- 为 `ScheduleBoard` 锁定设备载荷坏数据 fallback。
- 完成目标单测、lint、全量覆盖率验证。
- 同步 changelog、review、issue、plan、todo 五类文档。

## Result

- 已完成：覆盖率路由，选择 `ScheduleBoard.vue`。
- 已完成：新增两个坏载荷回归测试。
- 已完成：目标单测 `15 tests passed`。
- 已完成：`npm run lint` 通过。
- 已完成：全量前端覆盖率 `488 tests passed`。

## Release Boundary

- 本计划只推进 A-track 质量证据。
- B-track 仍需单独推进，不能用前端单测覆盖率替代发布闸门。
