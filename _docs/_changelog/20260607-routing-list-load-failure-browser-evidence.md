# 2026-06-07 RoutingBoard 工艺路线列表加载失败 Chromium 证据

## 变更

- 新增工艺路线 e2e：`工艺路线列表加载失败时真实浏览器展示 fail-loud fallback`。
- 用真实 Chromium 模拟 `/api/v1/routing` 返回 503。
- 验证页面 fail-loud，同时保留本地工艺路线 fallback 清单。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/routing.spec.ts -g "工艺路线列表加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
