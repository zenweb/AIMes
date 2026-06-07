# 2026-06-07 Plan - RoutingBoard 工艺路线详情加载失败 Chromium 证据

## 成功标准

- 真实 Chromium 能覆盖工艺路线详情后端 503。
- 失败时页面必须 fail loud。
- 失败时仍保留当前路线的本地工序 fallback 详情。
- 用例必须通过点击路线触发详情读取，确保验证的是用户路径。

## 执行

- 扩展 `src/frontend/tests/e2e/routing.spec.ts`。
- 使用列表 route 返回单条 `R-A100`，再用 `/api/v1/routing/r-1` 注入 503。
- 只跑目标用例，避免重复烧整套浏览器回归成本。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/routing.spec.ts -g "工艺路线详情加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## Stop Condition

- 目标 Chromium 用例通过。
- 文档证据补齐到 report/changelog/review/todo/issue/plan。
- B 轨仍以 fail-loud 方式保留为未关闭发布阻断项。
