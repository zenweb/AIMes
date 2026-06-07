# QualityBoard 质量知识样本写入失败真实浏览器证据

日期：2026-06-07

## 目标

补齐扫码返工样本沉淀为 CAPA 知识的真实 Chromium 失败态证据：点击 `沉淀为 CAPA 知识样本` 时，如果 `aimes_quality_knowledge_samples` 写入失败，页面必须 fail-loud，并且不能伪造样本入库、审计号、trace 或成功消息。

## 选片依据

- 质量知识样本是后续同类缺陷处置草案、CAPA 复用、知识库引用和审计回放的前置证据。
- 若失败时伪造样本入库，后续复用链路会基于不存在的质量知识证据继续扩散。
- 本片延续 A 轨精品化策略：硬化已有 QualityBoard 关键路径，不扩新功能。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`质量知识样本写入失败时真实浏览器展示 fail-loud 且不伪造样本入库`。
  - 预置扫码返工、质量隔离、返工成本 3 条 active OTD 证据，让知识样本面板按真实条件渲染。
  - 在预置完成后让 `Storage.prototype.setItem` 对 `aimes_quality_knowledge_samples` 抛错，模拟知识样本归档失败。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识样本写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面展示 `扫码返工样本沉淀为 CAPA 推荐`。
- 页面展示 `沉淀为 CAPA 知识样本` 按钮。
- 点击后显示 `role="alert"`。
- alert 包含 `质量知识样本写入失败` 和 `quality knowledge sample storage unavailable from chromium`。
- 失败后按钮仍可见，可重试。
- 不显示 `.sample-synced`。
- 不显示 `AUD-KG-QA-REWORK-20260521-001`。
- 不显示 `TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE`。
- 不显示 `.barcode-release-message` 成功消息。
- `localStorage.aimes_quality_knowledge_samples` 仍为 `null`。
- `aimes_otd_evidence_chain` 不包含样本入库 trace。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
