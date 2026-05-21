# 2026-05-21 P3 — 质量再训练版本接入 Agent 治理监管

## 触发

再训练候选已经能在知识库治理页完成审批、生成 `QK-TRAIN-20260521-R2`，并支持回滚到 `QK-TRAIN-20260521-R1`。但如果训练集版本只在知识库页、报表和审计里可见，系统管理员仍无法在 Agent 治理面监管发布前校验门、负样本准入和回滚状态。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/admin/AdminBoard.vue`
- 更新 `src/frontend/tests/e2e/admin.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增 `QualityKnowledgeRetrainingGovernanceRecord`。
- 新增 `buildQualityKnowledgeRetrainingGovernanceRecords()`，从 `aimes_quality_knowledge_retraining_versions` 派生 Agent 治理监管卡。
- `系统管理 / Agent 治理` 新增 `质量再训练版本治理` 区块。
- 治理卡展示训练集版本、正负样本数、版本策略、发布前校验门、审批/回滚审计、追踪编号和回滚目标。
- Agent 治理指标新增 `再训练版本`。
- 执行策略新增 `质量再训练版本`，可展示 `QK-TRAIN-20260521-R2 / 已回滚到 R1`。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts --grep "质量再训练版本"`，1 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

继续把发布前校验门做成可执行任务：从静态展示推进到“校验通过/失败 -> 发布或回滚 -> 审计回放”的训练集发布闭环。

## 承接更新

- 已由 `_docs/_changelog/20260521-p3-quality-retraining-validation-gate.md` 承接。
- `QK-TRAIN-20260521-R2` 发布前校验已从静态校验门推进为可执行动作。
- 校验失败会生成独立 OTD 证据、报表证据和审计回放，并继续进入 Agent 治理监管。
