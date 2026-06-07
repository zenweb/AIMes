# QualityCapaTaskPanel 发布推荐采纳失败真实浏览器证据

日期：2026-06-06

## 目标

补齐质量知识复用排序的真实 Chromium 失败态证据：已发布训练集推荐可采纳时，如果 `aimes_quality_knowledge_recommendation_feedback` 写入失败，页面必须 fail-loud，并且不能伪造采纳反馈、下一轮训练集或 OTD 证据。

## 选片依据

- `QualityCapaTaskPanel` 是质量知识复用链路的用户关键路径，决定发布推荐是否进入现场反馈和下一轮训练集。
- 采纳反馈会生成 `TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED` 和 `TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3`，失败时必须防止假成功。
- 本片延续 A 轨精品化策略：围绕已存在的质量知识推荐功能补真实浏览器证据，不扩新功能。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`发布推荐采纳写入失败时真实浏览器展示 fail-loud 且不伪造采纳反馈`。
  - 预置已验证复用 closure、closed 低分复核队列和 `QK-TRAIN-20260521-R2` published 推荐版本。
  - route `/api/v1/scheduling/quality-knowledge-evidence` GET 返回空数组，确保页面读取本地预置状态。
  - 在预置完成后让 `Storage.prototype.setItem` 对 `aimes_quality_knowledge_recommendation_feedback` 抛错，专门模拟推荐采纳反馈写入失败。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "发布推荐采纳写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面展示 `WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐`。
- 页面展示 `已发布训练集` 和 `89 分`，采纳按钮可见。
- 点击 `采纳发布推荐并回写效果` 后显示 `role="alert"`。
- alert 包含 `质量知识发布推荐采纳失败` 和 `published recommendation adoption storage unavailable from chromium`。
- 采纳按钮仍可见，可重试。
- 不显示 `.ranking-feedback`。
- 不显示 `已采纳推荐`。
- 不显示 `TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED`。
- 不显示 `TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3`。
- 不显示 `已采纳 QK-TRAIN-20260521-R2 推荐` 成功消息。
- `localStorage.aimes_quality_knowledge_recommendation_feedback` 仍为 `null`。
- `aimes_otd_evidence_chain` 不包含推荐采纳 trace 或下一轮训练集 trace。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
