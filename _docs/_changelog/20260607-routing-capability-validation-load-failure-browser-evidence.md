# 2026-06-07 RoutingBoard 能力校验记录加载失败 Chromium 证据

## 变更

- 新增工艺路线 e2e：`能力校验记录加载失败时真实浏览器展示 fail-loud 且保持待校验`。
- 修复 `RouteCapabilityValidation` 真实后端读取失败被 helper 吞成 `null` 的缺口。
- 为能力校验读取增加可选 `failLoud` 模式，RoutingBoard 使用 fail-loud，其他调用保持默认本地回退。
- 补充 helper 单元回归，确保后端失败能被需要 fail-loud 的页面感知。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/engineering-change-sync.test.ts -t "throws route capability backend failures"
npm.cmd run test:unit -- tests/unit/routing-board.test.ts -t "alerts without blocking the route list when capability validation history loading fails"
npm.cmd run test:e2e -- tests/e2e/routing.spec.ts -g "能力校验记录加载失败"
```

结果：两个 Vitest 定向用例通过，Nuxt production build passed，Chromium `1 passed`。
