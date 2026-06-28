# 2026-06-14 Issue - 外协到货成功态缺少回归证据

## Problem
- 采购侧已有外协到货失败路径测试，但成功后状态、trace 和重复确认保护缺少显式证据。
- 这条链路会继续传给排产侧外协释放，如果采购侧到货状态回退或按钮未禁用，后续排产释放证据会变弱。

## Resolution
- 新增 `PurchaseBoard` 测试：外协承诺到货成功后，断言状态为“外协到货已确认”。
- 断言 trace 展示 `TRACE-OUTSOURCING-FLANGE-RECEIPT-20260521`。
- 断言到货按钮被 disabled，防止重复确认。

## Verification
- `npm run test:unit -- tests/unit/purchase-board.test.ts`：21 passed。
- `npm run test:unit:coverage`：105 files / 759 tests passed。
