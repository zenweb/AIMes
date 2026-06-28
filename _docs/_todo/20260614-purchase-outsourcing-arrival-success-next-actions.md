# 2026-06-14 Todo - Purchase 外协到货成功态下一步

## Done
- 补外协到货成功态测试。
- 锁定到货后状态、receipt trace、说明文案和按钮禁用。
- 跑通 `npm run test:unit -- tests/unit/purchase-board.test.ts`。
- 跑通完整 `npm run test:unit:coverage`。

## Next
- 继续按低覆盖 + 用户必经选片。
- 候选优先 `ProductionBoard` 现场主流程、`BomBoard` 或 `PurchaseBoard` 剩余函数分支。
- 不新增功能，继续补真实业务边界、恢复路径和 fail-loud 证据。
