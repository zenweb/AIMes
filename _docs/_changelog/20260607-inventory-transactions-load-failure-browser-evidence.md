# 2026-06-07 InventoryBoard 库存交易记录加载失败 Chromium 证据

## 变更

- 新增库存 e2e：`库存交易记录加载失败时真实浏览器展示 fail-loud fallback`。
- 用真实 Chromium 模拟 `/api/v1/inventory/transactions` 返回 503。
- 验证用户选择物料后页面 fail-loud，同时保留当前物料本地交易 fallback。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/inventory.spec.ts -g "库存交易记录加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
