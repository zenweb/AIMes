# QualityCapaTaskPanel 低分复核队列关闭失败真实浏览器证据

日期：2026-06-06

## 目标

补齐质量知识复用排序的真实 Chromium 失败态证据：已有 open 低分复核队列时，点击 `完成复核并禁用直接复用`，如果 `aimes_quality_knowledge_review_queue` 写入失败，页面必须 fail-loud，并且不能伪造关闭结论、负样本、再训练候选或 OTD 证据。

## 选片依据

- `QualityCapaTaskPanel.vue` 当前行覆盖率约 77.51%，低于全局 79.26%。
- 低分复核关闭结论会决定是否禁用直接复用、是否生成负样本和再训练候选，是质量知识推荐可信度的关键护栏。
- 既有单元测试已覆盖该失败态，但真实浏览器此前主要覆盖成功长链路，缺少“不伪造关闭结论”的 Chromium 证据。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`低分样本复核队列关闭失败时真实浏览器展示 fail-loud 且不伪造关闭结论`。
  - 预置复用草案和 open 低分复核队列。
  - route `/api/v1/scheduling/quality-knowledge-evidence` GET 返回空数组，确保页面读取本地预置状态。
  - 在预置完成后让 `Storage.prototype.setItem` 对 `aimes_quality_knowledge_review_queue` 抛错，专门模拟关闭回写失败。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "低分样本复核队列关闭失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面展示 open 队列 `WO-DEMO-1018 OP-20 低分复用样本复核`。
- 页面展示原始复核 trace `TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW`。
- 点击 `完成复核并禁用直接复用` 后显示 `role="alert"`。
- alert 包含 `低分样本复核队列关闭失败` 和 `review queue closure storage unavailable from chromium`。
- 关闭按钮仍可见，可重试。
- 不显示 `禁止 AI 助手把该低分候选作为直接 CAPA 推荐`。
- 不显示 `TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION`。
- 不显示 `TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE`。
- 不显示 `已完成复核` 成功消息。
- `localStorage.aimes_quality_knowledge_review_queue` 仍包含 `"status":"open"`，不包含 `"status":"closed"`。
- `aimes_otd_evidence_chain` 不包含关闭结论 trace 或再训练候选 trace。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
