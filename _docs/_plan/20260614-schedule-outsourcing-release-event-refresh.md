# 2026-06-14 Plan - Schedule 外协释放事件刷新

## Success Criteria
- 不新增排产功能，只修现有外协释放闭环状态一致性。
- 外协释放成功后，事件队列从“已到货”刷新为“已释放”。
- 释放 trace、release audit、窗口和 OTD 复盘说明都留在事件队列。
- 单文件测试与完整 coverage 都通过。
- 灰度观察后置，不作为当前 stop condition。

## Execution
- 阅读 `ScheduleBoard.vue` 的外协释放、事件增强和现有单测。
- TDD 新增事件队列刷新测试，先观察有效红灯。
- 修复 backend-first 旧包覆盖本地释放态的问题。
- 跑单文件测试，再跑完整 coverage。

## Stop Condition
- `npm run test:unit -- tests/unit/schedule-board.test.ts` 通过。
- `npm run test:unit:coverage` 通过。
- 当天 changelog/review/todo/issue/plan 文档补齐。
