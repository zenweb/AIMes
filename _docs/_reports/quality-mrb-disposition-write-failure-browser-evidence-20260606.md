# QualityBoard MRB 处置证据写入失败真实浏览器证据

日期：2026-06-06

## 目标

补齐 MRB 报废补料决策的真实 Chromium 失败态证据：点击 `生成 WO-004 INS-004 MRB 报废补料决策` 时，如果 `aimes_quality_mrb_disposition` 写入失败，页面必须 fail-loud，并且不能伪造 MRB 决策状态、闭环入口或 OTD 证据。

## 选片依据

- MRB 处置会联动质量、采购、排产、客户说明、治理、审计和 OTD 复盘，是质量模块的关键路径。
- 若失败时伪造 MRB 决策，排产工作台可能出现不存在的报废补料重排事件。
- 本片延续 A 轨精品化策略：硬化已有 MRB 功能失败证据，不扩新功能。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`MRB 处置证据写入失败时真实浏览器展示 fail-loud 且不伪造 MRB 决策`。
  - 让 `Storage.prototype.setItem` 对 `aimes_quality_mrb_disposition` 抛错，模拟 MRB 决策写入失败。
  - 断言 MRB 状态仍为 `待 MRB 判定`，生成按钮仍可重试，不出现闭环按钮或成功消息。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "MRB 处置证据写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面展示 MRB 面板和 `待 MRB 判定`。
- 点击 `生成 WO-004 INS-004 MRB 报废补料决策` 后显示 `role="alert"`。
- alert 包含 `MRB 处置证据写入失败` 和 `MRB disposition storage unavailable from chromium`。
- 生成按钮仍可见，可重试。
- 不显示 `MRB 报废补料决策已生成` 成功消息。
- 不显示 `确认 WO-004 MRB 处置闭环` 按钮。
- `localStorage.aimes_quality_mrb_disposition` 仍为 `null`。
- `aimes_otd_evidence_chain` 不包含 `TRACE-QA-WO-004-MRB-DISPOSITION-20260521`。
- `aimes_otd_evidence_chain` 不包含 `TRACE-QA-WO-004-MRB-SCHEDULE-IMPACT-20260521`。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
