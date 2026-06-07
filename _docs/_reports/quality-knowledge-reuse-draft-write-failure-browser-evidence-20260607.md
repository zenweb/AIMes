# QualityBoard 质量知识复用草案写入失败真实浏览器证据

日期：2026-06-07

## 目标

补齐同类缺陷命中质量知识后生成处置草案的真实 Chromium 失败态证据：点击 `生成同类缺陷处置草案` 时，如果 `aimes_quality_knowledge_reuse_drafts` 写入失败，页面必须 fail-loud，并且不能伪造草案、审计号、trace 或成功消息。

## 选片依据

- 复用草案是质量知识样本进入正式 CAPA、复用评分和低分复核队列的前置步骤。
- 若失败时伪造草案，后续正式 CAPA 和推荐排序会基于不存在的复用证据继续推进。
- 本片延续 A 轨精品化策略：硬化已有 QualityBoard 关键路径，不扩新功能。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`质量知识复用草案写入失败时真实浏览器展示 fail-loud 且不伪造草案证据`。
  - 先通过真实页面操作成功沉淀扫码返工 CAPA 知识样本。
  - 随后让 `Storage.prototype.setItem` 对 `aimes_quality_knowledge_reuse_drafts` 抛错，模拟复用草案归档失败。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识复用草案写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 前置样本真实生成，页面展示 `TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE`。
- 页面展示 `WO-DEMO-1012 命中扫码返工样本`。
- 页面展示 `生成同类缺陷处置草案` 按钮。
- 点击后显示 `role="alert"`。
- alert 包含 `质量知识复用草案写入失败` 和 `quality reuse draft storage unavailable from chromium`。
- 失败后按钮仍可见，可重试。
- 不显示 `.reuse-draft-result`。
- 不显示 `WO-DEMO-1012 处置草案`。
- 不显示 `AUD-KG-QA-REUSE-20260521-001`。
- 不显示 `TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT`。
- 不显示 `.barcode-release-message` 中的草案成功消息。
- `localStorage.aimes_quality_knowledge_samples` 保留前置样本 trace。
- `localStorage.aimes_quality_knowledge_reuse_drafts` 仍为 `null`。
- `aimes_otd_evidence_chain` 不包含草案 trace。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
