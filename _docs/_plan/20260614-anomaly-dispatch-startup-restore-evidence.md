# 2026-06-14 Plan - Anomaly dispatch 启动恢复证据

## Success Criteria
- 不新增异常管理功能，只补现有启动恢复行为测试。
- 已确认分流记录在启动后恢复按钮状态。
- 最新分流 trace 在现场事件中心可见。
- 未确认事件不被误标为已确认。
- 单文件测试与完整 coverage 都通过。

## Execution
- 读取 `AnomalyBoard.vue` 与现有 `anomaly-board.test.ts`。
- 复用现有 mock 和 mount helper。
- 新增启动分流记录恢复测试。
- 先跑单文件测试，再跑完整 coverage。

## Stop Condition
- `npm run test:unit -- tests/unit/anomaly-board.test.ts` 通过。
- `npm run test:unit:coverage` 通过。
- 当天 changelog/review/todo/issue/plan 文档补齐。
