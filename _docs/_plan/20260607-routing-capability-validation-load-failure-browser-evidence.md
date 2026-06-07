# 2026-06-07 Plan - RoutingBoard 能力校验记录加载失败 Chromium 证据

## 成功标准

- 真实 Chromium 能覆盖能力校验历史后端 503。
- 失败时页面必须 fail loud。
- 失败时 `R-B200` 能力校验状态必须保持 `待校验`。
- 默认 backend-first 读取语义不能被全局破坏，其他调用仍可保留本地回退。

## 执行

- 先写 e2e 红灯，确认真实 503 不会触发 `能力校验记录加载失败`。
- 再补 helper 单元红灯，锁定需要显式 fail-loud 的读取语义。
- 增加 `failLoud` 选项，并只在 RoutingBoard 能力校验历史读取中启用。
- 重跑目标单元和真实 Chromium 用例。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/engineering-change-sync.test.ts -t "throws route capability backend failures"
npm.cmd run test:unit -- tests/unit/routing-board.test.ts -t "alerts without blocking the route list when capability validation history loading fails"
npm.cmd run test:e2e -- tests/e2e/routing.spec.ts -g "能力校验记录加载失败"
```

结果：两个 Vitest 定向用例通过，Nuxt production build passed，Chromium `1 passed`。

## Stop Condition

- 目标 Chromium 用例通过。
- 文档证据补齐到 report/changelog/review/todo/issue/plan。
- B 轨仍以 fail-loud 方式保留为未关闭发布阻断项。
