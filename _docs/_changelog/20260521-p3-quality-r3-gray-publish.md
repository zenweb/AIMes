# 2026-05-21 P3 — R3 下一轮训练集灰度发布

## 触发

上一片已经把 `QK-TRAIN-20260521-R2 -> QK-TRAIN-20260521-R3` 的推荐采纳反馈纳入治理、审计和报表。但 `QK-TRAIN-20260521-R3` 仍停留在“下一轮训练集候选”，没有合并、审批、校验和发布动作，持续学习闭环还不完整。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/knowledge/KnowledgeGovernancePanel.vue`
- 更新 `src/frontend/src/components/knowledge/DocumentUpload.vue`
- 更新 `src/frontend/tests/e2e/knowledge.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `QualityKnowledgeRetrainingVersionStatus` 新增：
  - `merged`
  - `gray_published`
- `下一轮训练集` 资产卡新增动作：
  - `合并现场反馈`
  - `批准 R3 训练集`
  - `运行灰度前校验`
  - `灰度发布 R3`
- R3 合并记录：
  - `AUD-KG-QA-RETRAINING-R3-MERGE-20260521-001`
  - `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-MERGED`
  - 正样本 24 条、负样本 4 条
- R3 审批记录：
  - `AUD-KG-QA-RETRAINING-R3-APPROVAL-20260521-001`
  - `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-APPROVED`
- R3 灰度前校验：
  - `AUD-KG-QA-RETRAINING-R3-VALIDATION-PASS-20260521-001`
  - `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-VALIDATION-PASSED`
  - 校验推荐采纳反馈字段完整率、Top-3 召回和灰度范围
- R3 灰度发布：
  - `AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001`
  - `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED`
  - 范围限定 `OP-20 装配扭矩偏移 / 质量知识复用排序灰度 / AI 生产助手引用链灰度`
- R3 全链路写入统一 OTD 复盘证据链，并派生到 Agent 治理的质量再训练版本监管。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts --grep "下一轮训练集候选合并反馈"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts --grep "质量推荐采纳反馈|下一轮训练集候选合并反馈"`，2 passed。
- 首次 R3 e2e 因 `已灰度发布` 同时出现在状态标签和说明文案触发 Playwright strict mode；已收紧到 `.asset-topline` 状态标签后通过。

## 下一步

把 R3 灰度发布结果继续接入质量页推荐排序和 AI 助手引用链，让灰度版本真正影响 OP-20 质量知识推荐。
