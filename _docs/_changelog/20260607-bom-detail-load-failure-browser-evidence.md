# 2026-06-07 BomBoard BOM 详情加载失败 Chromium 证据

## 变更

- 新增工程数据 e2e：`BOM 详情加载失败时真实浏览器展示 fail-loud fallback`。
- 用真实 Chromium 模拟 BOM 列表成功、`/api/v1/bom/bom-1` 返回 503。
- 验证页面 fail-loud，同时保留本地 BOM 详情和排产约束 fallback。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/engineering-data.spec.ts -g "BOM 详情加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
