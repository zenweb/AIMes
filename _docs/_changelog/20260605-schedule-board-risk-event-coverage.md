# 2026-06-05 ScheduleBoard 风险事件覆盖率切片

## Change

- 按覆盖率增量路由规则，转向用户必经且业务关键的 `ScheduleBoard.vue`，不继续精修已高覆盖的登录页。
- 在 `schedule-board.test.ts` 补充两条单测：
  - 后端风险看板的物料、设备、订单风险会映射成排产事件队列。
  - 后端设备风险事件可以生成设备维护窗口重排建议，并保留锁定期保护说明。

## Validation

- `npm run test:unit -- tests/unit/schedule-board.test.ts`：`1 file / 18 tests passed`
- `npm run test:unit:coverage`：`84 files / 505 tests passed`

## Coverage Delta

- 全局行覆盖率：`77.13% -> 77.20%`
- `ScheduleBoard.vue` 行覆盖率：`72.10% -> 73.43%`
- `ScheduleBoard.vue` 分支覆盖率：`33.11% -> 39.00%`
- `ScheduleBoard.vue` 函数覆盖率：`48.71% -> 50.42%`
