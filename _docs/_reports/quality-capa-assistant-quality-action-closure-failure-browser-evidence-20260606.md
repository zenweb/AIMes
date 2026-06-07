# QualityCapaTaskPanel 助手执行包质量责任闭环失败真实浏览器证据

日期：2026-06-06

## 目标

补齐交期恢复执行包在质量侧闭环的真实 Chromium 失败态证据：点击 `确认首件复核闭环` 时，如果 `aimes_assistant_recovery_packages` 写入失败，页面必须 fail-loud，并且不能伪造质量责任动作 closed、质量闭环 trace 或 OTD 证据。

## 选片依据

- 该动作属于现有 `QualityCapaTaskPanel` 用户关键路径，会把 AI 生产助手生成的交期恢复执行包质量责任动作回写给排产、风险队列和 OTD 证据链。
- 若失败时伪造 closed，会让质量首件复核被误判为完成，污染后续排产/风险复盘。
- 本片延续 A 轨精品化策略：只硬化既有功能失败证据，不扩新功能。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`助手执行包质量责任闭环失败时真实浏览器展示 fail-loud 且不伪造质量闭环`。
  - 预置 `WO-RUSH-9001 交期恢复执行包`，其中质量责任动作保持 `pending`。
  - route `/api/v1/assistant-evidence/recovery-packages` GET 返回空数组，确保页面读取本地预置状态。
  - 在预置完成后让 `Storage.prototype.setItem` 对 `aimes_assistant_recovery_packages` 抛错，模拟质量闭环回写失败。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "助手执行包质量责任闭环失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面展示 `助手执行包质量责任`。
- 页面展示 `WO-RUSH-9001 交期恢复执行包`。
- 页面展示待处理 trace `TRACE-QA-RECOVERY-FIRST-ARTICLE`。
- 点击 `确认首件复核闭环` 后显示 `role="alert"`。
- alert 包含 `助手执行包质量责任闭环失败` 和 `assistant quality action closure unavailable from chromium`。
- 闭环按钮仍可见，可重试。
- 不显示 `.assistant-quality-result`。
- 不显示 `AUD-CHAT-RECOVERY-QUALITY-CLOSURE-20260521-001`。
- 不显示 `TRACE-CHAT-RECOVERY-QUALITY-FIRST-ARTICLE-20260521`。
- 不显示 `交期恢复执行包质量责任动作已闭合` 成功消息。
- `localStorage.aimes_assistant_recovery_packages` 仍包含 `"qualityActionStatus":"pending"`，不包含 `"qualityActionStatus":"closed"`。
- `aimes_otd_evidence_chain` 不包含质量闭环 trace。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
