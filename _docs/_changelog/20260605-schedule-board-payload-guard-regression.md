# 2026-06-05 ScheduleBoard Payload Guard Regression Changelog

## Change

- 选片依据：按覆盖率增量策略选择低覆盖且用户必经的 `ScheduleBoard.vue`，不继续精修已 100% 行覆盖的 `LoginPage.vue`。
- 新增 `ScheduleBoard` 单测回归：当排产计划 API 返回 HTML / 非业务载荷时，必须降级到演示排产，并在 warnings-bar 暴露原因。
- 新增 `ScheduleBoard` 单测回归：当设备分页 API 返回 HTML / 非业务载荷时，必须降级到演示排产，并在 warnings-bar 暴露原因。
- 本片只补测试证据，不新增功能，不改变生产实现。

## Validation

- `npm run test:unit -- tests/unit/schedule-board.test.ts`：1 file / 15 tests passed。
- `npm run lint`：通过。
- `npm run test:unit:coverage`：83 files / 488 tests passed。
- 覆盖率：总行覆盖率 `76.66%`；`ScheduleBoard.vue` 行覆盖率 `69.73%`，分支覆盖率 `32.19%`。

## Release Boundary

- 本片属于 A-track 现有排产主链路精品化证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍是 B-track 发布闸门，不能被本片替代。
