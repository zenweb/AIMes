# Plan: Demo Smoke 主链路真实浏览器证据

## 成功标准

- 使用现有 e2e，不新增功能。
- 运行 Nuxt production build + Chromium。
- 验证 `Dashboard -> Scheduling -> Audit -> Report` 主链路可回放。
- 记录 A 轨证据和 B 轨边界。

## 执行

1. 读取 `demo-smoke.spec.ts`，确认覆盖 Dashboard、Scheduling、Audit、Report。
2. 运行定向 e2e。
3. 若外层超时但无业务失败，给足构建时间复跑。
4. 写入真实浏览器证据报告。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/demo-smoke.spec.ts -g "Dashboard -> Scheduling -> Audit -> Report"
```

结果：Nuxt production build 完成，Chromium `1 passed`。

## Stop condition

- 若 Chromium 断言失败，先定位并修复具体主链路缺口。
- 若 Docker/staging 仍为 engine unavailable，不继续空转重跑 staging。
