# 2026-05-21 P3 — 质量再训练校验通过与 AI 推荐发布闭环

## 触发

`QK-TRAIN-20260521-R2` 已经具备审批、发布前校验失败和回滚治理，但仍缺少“字段补齐后重新校验通过 -> 正式发布到 AI 推荐链路”的正向路径。真实 AI MES 需要同时能证明失败保护和发布成功，否则训练集生命周期只停留在阻断态。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/knowledge/DocumentUpload.vue`
- 更新 `src/frontend/src/components/knowledge/KnowledgeGovernancePanel.vue`
- 更新 `src/frontend/tests/e2e/knowledge.spec.ts`
- 更新 `src/frontend/tests/e2e/admin.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `QualityKnowledgeRetrainingVersionRecord` 支持 `validation_passed` 与 `published` 状态。
- `文档上传 / 知识库治理` 对校验失败版本新增 `补齐字段并重新校验` 动作。
- 重新校验通过生成：
  - 校验审计：`AUD-KG-QA-RETRAINING-VALIDATION-PASS-20260521-001`
  - 校验追踪：`TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-PASSED`
- 校验通过后新增 `发布到 AI 推荐` 动作。
- 发布生成：
  - 发布审计：`AUD-KG-QA-RETRAINING-PUBLISH-20260521-001`
  - 发布追踪：`TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-PUBLISHED`
- 发布范围固化为 `质量知识复用排序 / AI 生产助手引用链 / CAPA 草案推荐`。
- 知识资产卡新增 references 标签展示，让校验门、校验发现和推荐范围成为可见证据。
- 校验通过和发布分别写入 OTD 复盘证据，`报表中心`、`审计日志` 和 `系统管理 / Agent 治理` 可回放全链路。
- 回滚路径保留，正向发布验证后仍可演示回退到 `validation_failed` 并回滚到 `QK-TRAIN-20260521-R1`。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts --grep "批准再训练候选"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts --grep "已发布质量再训练版本"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts tests/e2e/admin.spec.ts`，17 passed。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts tests/e2e/knowledge.spec.ts tests/e2e/chat.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts tests/e2e/admin.spec.ts`，49 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

继续把质量知识发布闭环往真实 AI MES 推进：让发布后的训练集影响 AI 助手回答排序、CAPA 草案候选解释和质量知识评分趋势，而不仅是治理证据可见。
