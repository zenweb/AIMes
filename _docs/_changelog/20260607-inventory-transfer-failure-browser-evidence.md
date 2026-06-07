# 2026-06-07 InventoryBoard 库存调拨失败 Chromium 证据

## 变更

- 新增库存 e2e：`库存调拨失败时真实浏览器保留弹窗并展示 alert`。
- 用真实 Chromium 模拟 `/api/v1/inventory/transfer` 返回 503。
- 验证调拨失败后弹窗保留、错误以 alert 呈现、当前物料上下文不丢失。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/inventory.spec.ts -g "库存调拨失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
