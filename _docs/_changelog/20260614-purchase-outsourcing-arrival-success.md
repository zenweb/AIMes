# 2026-06-14 Changelog - Purchase 外协到货成功态证据

## 变更
- 按覆盖率杠杆转向 `PurchaseBoard`，聚焦采购外协承诺到货确认的现有闭环。
- 新增外协到货确认成功后的组件测试，锁定状态、trace、到货说明和重复确认保护。
- 抽出测试内 `makeOutsourcingCommitment()` helper，减少同一承诺包重复样板。

## 验证
- `npm run test:unit -- tests/unit/purchase-board.test.ts`：21 passed。
- `npm run test:unit:coverage`：105 files / 759 tests passed。
- 覆盖率：总 lines 83.98%，statements 80.41%，branches 65.26%，functions 77.25%。
- `PurchaseBoard.vue`：lines 78.04%，statements 73.44%，branches 72.01%，functions 57.69%。

## 说明
- 本片没有改生产代码；现有实现已满足成功态，只是此前缺少显式回归证据。
- 灰度观察继续按 owner 指令后置，不纳入本片 stop condition。
