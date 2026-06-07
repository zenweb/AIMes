# QualityBoard MRB 处置闭环写入失败真实浏览器证据

日期：2026-06-07

## 目标

补齐 MRB 报废补料闭环的真实 Chromium 失败态证据：点击 `确认 WO-004 MRB 处置闭环` 时，如果 `aimes_quality_mrb_disposition` 写入失败，页面必须 fail-loud，并且不能伪造闭环状态、闭环 trace 或 OTD 证据。

## 选片依据

- MRB 闭环会把质量隔离、补料 ETA、排产重建和客户说明标记为完成，是 MRB 处置链路的关键收口动作。
- 若失败时伪造 closed，排产事件会被误判为已缓解，影响 OTD 复盘和治理判断。
- 本片延续 A 轨精品化策略：硬化已有 MRB 功能失败证据，不扩新功能。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`MRB 处置闭环写入失败时真实浏览器展示 fail-loud 且不伪造闭环结论`。
  - 预置 active MRB 决策记录。
  - 在预置完成后让 `Storage.prototype.setItem` 对 `aimes_quality_mrb_disposition` 抛错，模拟闭环回写失败。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "MRB 处置闭环写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面展示 active MRB 记录 `MRB 已判定报废补料`。
- 页面展示原始决策 trace `TRACE-QA-WO-004-MRB-DISPOSITION-20260521`。
- 点击 `确认 WO-004 MRB 处置闭环` 后显示 `role="alert"`。
- alert 包含 `MRB 处置闭环写入失败` 和 `MRB closure storage unavailable from chromium`。
- 闭环按钮仍可见，可重试。
- 不显示 `MRB 处置闭环已确认` 成功消息。
- 不显示 `AUD-QA-MRB-CLOSURE-20260521`。
- 不显示 `TRACE-QA-WO-004-MRB-CLOSURE-20260521`。
- `localStorage.aimes_quality_mrb_disposition` 仍包含 `"status":"active"`，不包含 `"status":"closed"`。
- `aimes_otd_evidence_chain` 不包含闭环 trace。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
