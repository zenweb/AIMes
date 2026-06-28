# 2026-06-14 Plan - Report 外协释放 OTD 恢复证据

## Success Criteria
- 不新增报表功能，只补外协释放后的现有 OTD 恢复口径测试。
- 外协承诺包带 `scheduleReleaseTraceId` 时，法兰盘 DN100 从 at-risk 转为 recovered。
- 报表详情解释厂外等待口径已关闭。
- CSV 导出同时包含 KPI 恢复行和外协承诺审计行。
- 单文件测试与完整 coverage 都通过。

## Execution
- 读取 `ReportBoard.vue` 与现有 `report-board.test.ts`。
- hoist 外协承诺读取 mock，保持测试可注入确定性记录。
- 新增外协释放 OTD 恢复测试。
- 先跑单文件测试，再跑完整 coverage。

## Stop Condition
- `npm run test:unit -- tests/unit/report-board.test.ts` 通过。
- `npm run test:unit:coverage` 通过。
- 当天 changelog/review/todo/issue/plan 文档补齐。
