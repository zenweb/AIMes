# 2026-06-06 Plan - MRB 处置证据写入失败 Chromium 证据

## 成功标准

- 真实 Chromium 能渲染 MRB 面板。
- MRB 决策写入失败时页面展示 `MRB 处置证据写入失败`。
- 失败后 MRB 状态仍为 `待 MRB 判定`，生成按钮仍可见。
- 失败后不显示成功消息或闭环按钮。
- localStorage 和 OTD 证据链均不出现伪造 MRB 决策证据。

## 执行

1. 在 `quality.spec.ts` 增加 MRB 处置证据写入失败用例。
2. 拦截 `aimes_quality_mrb_disposition` 的 `setItem` 并抛错。
3. 点击 `生成 WO-004 INS-004 MRB 报废补料决策`。
4. 验证 fail-loud 与无伪证据。
5. 单独运行目标 e2e。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "MRB 处置证据写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 停止条件

本片达到 A 轨证据标准后停止，不继续空跑 B 轨；B 轨等待外部环境/人工签字/观察窗口证据。
