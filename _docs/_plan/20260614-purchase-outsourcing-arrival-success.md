# 2026-06-14 Plan - Purchase 外协到货成功态证据

## Success Criteria
- 不新增采购功能，只补现有外协到货成功态证据。
- 到货成功后 UI 显示“外协到货已确认”。
- 到货 trace 使用 receipt trace，不再停留在承诺 trace。
- 到货按钮禁用，避免重复确认。
- 单文件测试与完整 coverage 都通过。

## Execution
- 阅读 `PurchaseBoard.vue` 外协到货处理和现有失败路径测试。
- 新增测试 helper，减少重复承诺包样板。
- 新增成功态测试。
- 跑单文件测试，再跑完整 coverage。

## Stop Condition
- `npm run test:unit -- tests/unit/purchase-board.test.ts` 通过。
- `npm run test:unit:coverage` 通过。
- 当天 changelog/review/todo/issue/plan 补齐。
