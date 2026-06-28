# 2026-06-14 Plan - Production 完工列表与摘要同步证据

## Success Criteria
- 不新增生产功能，只补现有完工成功态的展示一致性证据。
- 完工后详情、列表卡片和 summary 同步显示已完成。
- 单文件测试与完整 coverage 都通过。
- 当天 changelog/review/todo/issue/plan 补齐。

## Execution
- 阅读 `ProductionBoard.vue` 完工处理、summary 计算和现有完工测试。
- 新增列表/摘要同步测试。
- 跑单文件测试，再跑完整 coverage。

## Stop Condition
- `npm run test:unit -- tests/unit/production-board.test.ts` 通过。
- `npm run test:unit:coverage` 通过。
