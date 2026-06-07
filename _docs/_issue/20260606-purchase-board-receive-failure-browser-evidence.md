# Issue：PurchaseBoard 收货失败防假收货

## 状态

已补 Chromium 证据，未发现产品逻辑缺陷。

## 风险

采购收货会影响库存齐套、排产复核和 OTD 证据链。若接口失败后 UI 误改状态或已收数量，会造成假收货，并污染后续缺料风险判断。

## 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "收货接口失败"
```

结果：`1 passed`。

## 当前表现

- 接口 409 后显示 `收货失败`。
- 收货弹窗仍打开。
- 采购单状态仍为 `已确认`。
- `MAT-A01` 已收数量仍为 `0`。
- 收货按钮仍可见。
