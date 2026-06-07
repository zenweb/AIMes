# 2026-06-07 Demo Smoke 主链路真实浏览器证据

- 选片依据：停止继续榨干已覆盖微路径，转向用户必经的 5 分钟 Demo 主链路。
- 范围：仅验证现有 `Dashboard -> Scheduling -> Audit -> Report`，不新增功能。
- 证据：Nuxt production build + Chromium 定向 e2e `1 passed`。
- 结果：Dashboard OTD 摘要、Scheduling Agent 建议采纳、Audit 决策回放和 Report OTD 复盘均可在真实浏览器中串联。
- 边界：B 轨发布硬门禁仍未关闭，Docker Desktop Linux engine 当前仍不可用，staging 不能有效复跑。

验证：

```powershell
npm.cmd run test:e2e -- tests/e2e/demo-smoke.spec.ts -g "Dashboard -> Scheduling -> Audit -> Report"
```
