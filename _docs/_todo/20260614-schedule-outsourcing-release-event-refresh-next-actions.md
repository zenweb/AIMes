# 2026-06-14 Todo - Schedule 外协释放事件刷新下一步

## Done
- 复现外协释放后事件队列被旧外协包回退的问题。
- 修复同源释放态优先级，避免 backend-first 旧包覆盖本地释放证据。
- 新增 `ScheduleBoard` 事件队列刷新测试。
- 跑通 `npm run test:unit -- tests/unit/schedule-board.test.ts`。
- 跑通完整 `npm run test:unit:coverage`。

## Next
- 继续按覆盖率杠杆选片，优先用户必经且覆盖仍低的现有功能。
- 候选可考虑 `PurchaseBoard`、`ProductionBoard` 或 `ScheduleBoard` 剩余低覆盖分支。
- 不新增功能，继续补真实业务闭环、恢复路径和 fail-loud 证据。
- 灰度观察继续后置，不混入当前测试切片。
