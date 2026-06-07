# 2026-06-06 Plan - CAPA 验证同步失败 Chromium 证据

## 成功标准

- 真实 Chromium 能渲染执行中的 CAPA 任务。
- CAPA 验证写入失败时页面展示 `CAPA 验证同步失败`。
- 失败后任务仍为 `执行中`，并保留 `推进处置` 按钮。
- 失败后不显示已验证状态、验证 trace 或成功消息。
- localStorage 和 OTD 证据链均不出现伪造 CAPA 验证证据。

## 执行

1. 在 `quality.spec.ts` 增加 CAPA 验证同步失败用例。
2. 使用初始 `执行中` 的 SPC CAPA 任务进入验证路径。
3. 拦截 `aimes_quality_capa_closure` 的 `setItem` 并抛错。
4. 点击 `推进处置` 并验证 fail-loud 与无伪证据。
5. 单独运行目标 e2e。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "CAPA 验证同步失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 停止条件

本片达到 A 轨证据标准后停止，不继续空跑 B 轨；B 轨等待外部环境/人工签字/观察窗口证据。
