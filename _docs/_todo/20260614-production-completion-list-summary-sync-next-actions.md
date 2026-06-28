# 2026-06-14 Todo - Production 完工同步下一步

## Done
- 补完工成功后列表卡片和 summary 同步测试。
- 跑通 `npm run test:unit -- tests/unit/production-board.test.ts`。
- 跑通完整 `npm run test:unit:coverage`。

## Next
- 继续按低覆盖 + 用户必经选片。
- 候选可考虑 `BomBoard`、`ChatPanel`、`AdminBoard` 或 `InventoryBoard` 的真实业务边界。
- 不新增功能，继续补现有功能的正确性、恢复路径、fail-loud 和证据链。
