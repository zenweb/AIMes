# 2026-06-07 Plan - RoutingBoard 工艺路线列表加载失败 Chromium 证据

## 成功标准

- 真实 Chromium 能覆盖工艺路线列表后端 503。
- 失败时页面必须 fail loud。
- 失败时仍保留本地工艺路线 fallback 清单。
- 用例必须关闭 offline demo，确保验证的是真实请求失败路径。

## 执行

- 新增 `src/frontend/tests/e2e/routing.spec.ts`。
- 使用 `page.route(/\/api\/v1\/routing(?:\?|$)/)` 注入 503，覆盖分页 query。
- 只跑目标用例，避免重复烧整套浏览器回归成本。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/routing.spec.ts -g "工艺路线列表加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## Stop Condition

- 目标 Chromium 用例通过。
- 文档证据补齐到 report/changelog/review/todo/issue/plan。
- B 轨仍以 fail-loud 方式保留为未关闭发布阻断项。
