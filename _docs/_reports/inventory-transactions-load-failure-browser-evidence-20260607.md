# InventoryBoard 库存交易记录加载失败真实浏览器证据报告

日期：2026-06-07

## 范围

- A 轨质量切片：`InventoryBoard` 用户选择物料后，库存交易记录读取失败时的 fail-loud fallback 证据。
- 目标：交易记录接口不可用时，真实浏览器必须明确告警，同时保留当前物料的本地演示交易，避免用户把静默 fallback 当作实时库存追溯。

## 变更

- `src/frontend/tests/e2e/inventory.spec.ts`
  - 新增真实 Chromium 用例：`库存交易记录加载失败时真实浏览器展示 fail-loud fallback`。
  - 用例在点击 `轴承钢圈 / MAT-A01` 前显式关闭 offline demo。
  - 拦截 `/api/v1/inventory/transactions` 返回 503。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/inventory.spec.ts -g "库存交易记录加载失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 用户点击 `轴承钢圈` 后触发真实交易记录请求失败路径。
- 页面展示 `库存交易记录加载失败`。
- 告警包含真实浏览器可见的 `chromium inventory transactions API unavailable`。
- 详情面板仍展示当前物料 fallback 交易：`采购入库`、`生产领料`、`参考: PO-20260501`。

## 结论

- `InventoryBoard` 库存交易记录加载失败路径已有真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud fallback 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
