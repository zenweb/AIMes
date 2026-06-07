# 2026-06-05 ScheduleBoard 风险事件覆盖率切片审查

## Review Result

- 结论：本切片只增加测试，没有改业务实现，风险低。
- 覆盖对象是排产页核心路径：风险看板输入进入排产事件队列，再触发 Agent 建议。
- 覆盖率确有增量，且集中在 `ScheduleBoard.vue` 的低覆盖分支。

## What Was Verified

- 物料风险会进入排产事件队列，并保留 critical 严重度。
- 设备风险会进入排产事件队列，并展示健康分和维护风险描述。
- 订单交期风险会进入急单插单事件。
- 设备风险事件点击生成建议后，会给出设备维护窗口重排建议，并包含锁定期保护说明。

## Validation

- `npm run test:unit -- tests/unit/schedule-board.test.ts`：通过，`18 tests`
- `npm run test:unit:coverage`：通过，`505 tests`

## Residual Risk

- `ScheduleBoard.vue` 仍然很大，分支覆盖率虽然从 `33.11%` 提升到 `39.00%`，但仍是后续高杠杆区域。
- 本切片未覆盖浏览器级排产交互；当前只证明组件层事件映射和建议生成。
