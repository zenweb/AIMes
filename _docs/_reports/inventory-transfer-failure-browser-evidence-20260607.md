# InventoryBoard 库存调拨失败真实浏览器证据报告

日期：2026-06-07

## 范围

- A 轨质量切片：`InventoryBoard` 调拨提交失败时的 fail-loud dialog 证据。
- 目标：调拨接口不可用时，真实浏览器必须保留操作弹窗，以 alert 暴露失败原因，并保留当前物料上下文，避免用户误以为调拨已经落库。

## 变更

- `src/frontend/tests/e2e/inventory.spec.ts`
  - 新增真实 Chromium 用例：`库存调拨失败时真实浏览器保留弹窗并展示 alert`。
  - 用例选择 `轴承钢圈 / MAT-A01`，打开 `调拨` 弹窗。
  - 拦截 `/api/v1/inventory/transfer` 返回 503。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/inventory.spec.ts -g "库存调拨失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 调拨失败后 `调拨` dialog 仍可见。
- dialog 内 `role="alert"` 错误提示可见。
- 告警包含真实浏览器可见的 `Request failed with status code 503`。
- dialog 仍保留 `轴承钢圈 (MAT-A01)` 上下文。

## 结论

- `InventoryBoard` 调拨失败路径已有真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud dialog 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
