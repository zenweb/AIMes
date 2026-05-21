# 2026-05-21 P3 — 已发布再训练版本驱动质量知识推荐排序

## 触发

`QK-TRAIN-20260521-R2` 已经能发布到 AI 推荐链路，但上一片主要证明的是治理证据、OTD 证据和 Agent 治理可见。真实 AI MES 还需要证明“发布版本会改变业务推荐结果”，否则训练集发布仍停留在证据层。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/src/components/chat/ChatPanel.vue`
- 更新 `src/frontend/src/utils/knowledge-citations.ts`
- 更新 `src/frontend/tests/e2e/quality.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `buildQualityKnowledgeReuseRanking()` 读取 `aimes_quality_knowledge_retraining_versions`。
- 当 `WO-DEMO-1018 / OP-20` 的 `QK-TRAIN-20260521-R2` 处于 `published` 状态时，质量知识复用排序新增/升级：
  - 推荐标题：`WO-DEMO-1018 OP-20 装配扭矩偏移独立 CAPA 推荐`
  - 状态：`已发布训练集`
  - 分数：`89 分`
  - 训练集：`QK-TRAIN-20260521-R2`
  - 审计：`AUD-KG-QA-RETRAINING-PUBLISH-20260521-001`
  - 追踪：`TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED`
- 质量页排序卡显示发布训练集元数据，证明推荐结果来自已发布版本。
- `AI 生产助手` 的扫码质量复用回答读取同一发布版本，说明 OP-20 扭矩偏移已从“低分禁用”升级为“优先匹配独立 CAPA 样本”。
- `AI 助手引用链` 新增 `QK-TRAIN-20260521-R2 已发布训练集` 来源，引用治理说明展示发布审计和发布追踪。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts --grep "已发布再训练版本"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts tests/e2e/knowledge.spec.ts tests/e2e/chat.spec.ts`，26 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

继续推进发布后闭环：把发布版本的推荐采纳结果回写为质量知识评分趋势，形成“发布 -> 推荐 -> 采纳/拒绝 -> 效果趋势 -> 下一轮训练集”的持续学习链路。
