# QualityCapaTaskPanel 低分复核队列生成失败真实浏览器证据

日期：2026-06-06

## 目标

补齐质量知识复用排序的真实 Chromium 失败态证据：点击 `生成低分样本复核队列` 时，如果 `aimes_quality_knowledge_review_queue` 写入失败，页面必须 fail-loud，并且不能伪造复核队列、低分复核 trace 或 OTD 证据。

## 选片依据

- `QualityCapaTaskPanel.vue` 当前行覆盖率约 77.51%，低于全局 79.26%。
- 低分样本复核队列决定跨工序/跨设备推荐是否进入人工复核、负样本和再训练候选，是质量知识推荐可信度的关键护栏。
- 既有单元测试已覆盖该失败态，但真实浏览器此前主要覆盖成功长链路，缺少“不伪造低分复核队列”的 Chromium 证据。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`低分样本复核队列生成失败时真实浏览器展示 fail-loud 且不伪造复核队列`。
  - 预置质量知识样本、复用草案和已验证正式 CAPA，触发复用排序中的低分候选。
  - route `/api/v1/scheduling/quality-knowledge-evidence` GET 返回空数组，确保页面读取本地预置状态。
  - 在真实浏览器中让 `Storage.prototype.setItem` 对 `aimes_quality_knowledge_review_queue` 抛错。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "低分样本复核队列生成失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面展示 `质量知识复用排序` 和 `WO-DEMO-1018 OP-20 装配扭矩偏移复用尝试` 低分候选。
- 点击 `生成低分样本复核队列` 后显示 `role="alert"`。
- alert 包含 `低分样本复核队列生成失败` 和 `review queue storage unavailable from chromium`。
- `生成低分样本复核队列` 按钮仍可见，可重试。
- `.low-score-review-card` 不出现。
- 不显示 `TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW`。
- 不显示 `已进入低分样本复核队列` 成功消息。
- `localStorage.aimes_quality_knowledge_review_queue` 保持 `null`。
- `aimes_otd_evidence_chain` 不包含低分复核 trace。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
