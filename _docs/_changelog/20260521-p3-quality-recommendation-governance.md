# 2026-05-21 P3 — 质量推荐采纳反馈进入治理面

## 触发

`WO-DEMO-1018 OP-20` 已经能完成 `QK-TRAIN-20260521-R2` 发布推荐采纳，并生成 `89 -> 93 分` 效果趋势与 `QK-TRAIN-20260521-R3` 下一轮训练集候选。但如果这些信息只出现在质量页、助手和报表证据链里，治理角色仍无法监管“发布后业务反馈是否回流模型”。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/admin/AdminBoard.vue`
- 更新 `src/frontend/src/components/knowledge/DocumentUpload.vue`
- 更新 `src/frontend/tests/e2e/admin.spec.ts`
- 更新 `src/frontend/tests/e2e/knowledge.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增 `QualityKnowledgeRecommendationFeedbackGovernanceRecord` 与 `buildQualityKnowledgeRecommendationFeedbackGovernanceRecords()`。
- `系统管理 / Agent 治理` 新增 `质量推荐采纳治理`：
  - 展示 `QK-TRAIN-20260521-R2 -> QK-TRAIN-20260521-R3`
  - 展示效果趋势 `89 -> 93 分`
  - 展示反馈审计 `AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001`
  - 展示反馈追踪 `TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED`
  - 展示下一轮训练追踪 `TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3`
- Agent 治理指标新增 `推荐采纳反馈`，执行策略新增 `质量推荐采纳`。
- `文档上传 / 质量知识资产治理` 增加两类派生资产：
  - `推荐采纳`
  - `下一轮训练集`
- 派生读取 `aimes_quality_knowledge_recommendation_feedback`，不复制业务状态。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts --grep "质量推荐采纳反馈"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts --grep "质量推荐采纳反馈"`，1 passed。
- 说明：曾并行启动两个 e2e build 导致 `.nuxt` 产物和 4173 端口冲突；清理端口后顺序重跑通过。

## 下一步

继续把 R3 候选推进到“合并多条反馈 -> 审批 -> 校验 -> 灰度发布”的版本治理链路，或者先把质量推荐采纳反馈纳入审计回放细节和 CSV 导出。
