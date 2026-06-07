# 2026-06-07 Plan - MRB 处置闭环写入失败 Chromium 证据

## 成功标准

- 真实 Chromium 能渲染 active MRB 记录。
- MRB 闭环写入失败时页面展示 `MRB 处置闭环写入失败`。
- 失败后 MRB 状态仍为 active，闭环按钮仍可见。
- 失败后不显示闭环成功消息、闭环审计号或闭环 trace。
- localStorage 和 OTD 证据链均不出现伪造闭环证据。

## 执行

1. 在 `quality.spec.ts` 增加 MRB 处置闭环写入失败用例。
2. 预置 active MRB 决策记录。
3. 拦截 `aimes_quality_mrb_disposition` 的 `setItem` 并抛错。
4. 点击 `确认 WO-004 MRB 处置闭环`。
5. 验证 fail-loud 与无伪证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "MRB 处置闭环写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 停止条件

本片达到 A 轨证据标准后停止，不继续空跑 B 轨；B 轨等待外部环境/人工签字/观察窗口证据。
