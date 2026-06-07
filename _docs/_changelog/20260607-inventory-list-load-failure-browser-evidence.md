# 2026-06-07 InventoryBoard 库存列表加载失败 Chromium 证据

## 变更

- 新增库存 e2e：`库存列表加载失败时真实浏览器展示 fail-loud fallback`。
- 用真实 Chromium 模拟 `/api/v1/inventory` 返回 503。
- 验证页面 fail-loud，同时保留本地库存 fallback 物料。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/inventory.spec.ts -g "库存列表加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
