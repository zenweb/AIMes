# 2026-06-06 Plan - 助手质量责任闭环失败 Chromium 证据

## 成功标准

- 真实 Chromium 能渲染助手执行包质量责任卡片。
- 质量责任闭环写入失败时页面展示 `助手执行包质量责任闭环失败`。
- 失败后闭环按钮仍可见。
- 失败后不显示质量闭环结果、闭环审计号、闭环 trace 或成功消息。
- localStorage 和 OTD 证据链均不出现伪造质量闭环证据。

## 执行

1. 在 `quality.spec.ts` 增加助手执行包质量责任闭环失败用例。
2. 使用本地预置状态渲染 `WO-RUSH-9001 交期恢复执行包`，质量责任保持 pending。
3. 拦截 `aimes_assistant_recovery_packages` 的 `setItem` 并抛错。
4. 点击 `确认首件复核闭环` 并验证 fail-loud 与无伪证据。
5. 单独运行目标 e2e。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "助手执行包质量责任闭环失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 停止条件

本片达到 A 轨证据标准后停止，不继续空跑 B 轨；B 轨等待外部环境/人工签字/观察窗口证据。
