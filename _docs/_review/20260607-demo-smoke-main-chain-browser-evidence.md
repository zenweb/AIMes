# Review: Demo Smoke 主链路真实浏览器证据

## 结论

通过。5 分钟 Demo 主链路在真实 Chromium 中可从 Dashboard 进入 AI 排产，采纳 Agent 推荐，再到审计回放和报表复盘。

## 证据

- 报告：`_docs/_reports/demo-smoke-main-chain-browser-evidence-20260607.md`
- 命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/demo-smoke.spec.ts -g "Dashboard -> Scheduling -> Audit -> Report"
```

- 结果：`1 passed`。

## 风险

- 首次 180 秒外层超时只证明 Nuxt production build 需要更长时间，不是业务断言失败。
- B 轨发布门禁仍未关闭，不能把此浏览器证据等同于 v1.0.0 ready。
