# 2026-06-07 BomBoard BOM 展开失败 Chromium 证据

## 变更

- 新增工程数据 e2e：`BOM 展开失败时真实浏览器展示 fail-loud fallback`。
- 用真实 Chromium 模拟 BOM 列表和详情成功、`/api/v1/bom/bom-1/explode` 返回 503。
- 验证页面 fail-loud，同时保留本地 BOM 展开树 fallback。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/engineering-data.spec.ts -g "BOM 展开失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
