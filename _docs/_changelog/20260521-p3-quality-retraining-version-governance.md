# 2026-05-21 P3 — 质量知识再训练版本审批与回滚治理

## 触发

上一片已经把低分复核结论沉淀为 `文档上传 / 知识库治理` 的质量知识资产卡，但 `WO-DEMO-1018 OP-20` 的再训练候选仍停留在“待确认”。真实 AI MES 需要能把候选推进到训练集版本审批、发布前校验和回滚留痕，否则知识资产仍无法进入可控生命周期。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/knowledge/DocumentUpload.vue`
- 更新 `src/frontend/src/components/knowledge/KnowledgeGovernancePanel.vue`
- 更新 `src/frontend/tests/e2e/knowledge.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增 `aimes_quality_knowledge_retraining_versions` 训练集版本存储。
- 新增 `QualityKnowledgeRetrainingVersionRecord`，记录训练集版本、正负样本数、准入策略、发布前校验门、审批审计和回滚审计。
- `文档上传 / 知识库治理` 的 `WO-DEMO-1018 OP-20 再训练候选` 支持点击 `批准进入训练集`。
- 审批后生成：
  - 训练集版本：`QK-TRAIN-20260521-R2`
  - 训练集名称：`装配扭矩偏移 CAPA 再训练样本集`
  - 审批审计：`AUD-KG-QA-RETRAINING-APPROVAL-20260521-001`
  - 审批追踪：`TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-APPROVED`
- 训练集版本固化 `18` 条正样本、`3` 条负样本、70 分准入阈值和跨工序低分负样本降权策略。
- 已批准版本支持点击 `回滚训练集版本`。
- 回滚后生成：
  - 回滚审计：`AUD-KG-QA-RETRAINING-ROLLBACK-20260521-001`
  - 回滚追踪：`TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-ROLLBACK`
  - 回滚目标：`QK-TRAIN-20260521-R1`
- 审批与回滚分别写入独立 OTD 复盘证据，`报表中心` 和 `审计日志` 可同时回放两段证据，避免回滚覆盖审批留痕。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts --grep "批准再训练候选"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts`，7 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

继续推进训练集发布前治理：把再训练版本纳入 Agent 治理指标或增加发布前校验任务，让 `QK-TRAIN-20260521-R2` 不只是被批准和回滚，还能被策略面板持续监管。

## 承接更新

- 已新增 `QualityKnowledgeRetrainingGovernanceRecord` 与 `buildQualityKnowledgeRetrainingGovernanceRecords()`。
- `系统管理 / Agent 治理` 新增 `质量再训练版本治理` 区块，读取 `aimes_quality_knowledge_retraining_versions`。
- 治理卡展示：
  - `QK-TRAIN-20260521-R2 装配扭矩偏移 CAPA 再训练样本集`
  - 正样本 `18` 条、负样本 `3` 条
  - 发布前校验门
  - `AUD-KG-QA-RETRAINING-ROLLBACK-20260521-001`
  - `TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-ROLLBACK`
  - 回滚目标 `QK-TRAIN-20260521-R1`
- Agent 治理指标新增 `再训练版本`，执行策略新增 `质量再训练版本`。
- 新增 e2e：`Admin Agent 治理 › 质量再训练版本进入 Agent 治理监管`。
- 验证：`npx vue-tsc --noEmit -p tsconfig.json` passed；`npm run test:e2e -- tests/e2e/admin.spec.ts --grep "质量再训练版本"` 1 passed。
