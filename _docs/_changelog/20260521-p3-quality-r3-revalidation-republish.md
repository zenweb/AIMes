# 2026-05-21 P3 — R3 重开校验后重新灰度发布

## 触发

上一片已经让 R3 回滚问题单支持 `调整范围重开校验`，但该状态还没有回到知识治理执行链路。需要让质量主管从 `系统管理 / Agent 治理` 重开后，能在 `文档上传 / 质量知识资产治理` 重新运行灰度前校验、重新灰度发布 R3，并恢复 OP-20 推荐与新一轮灰度决策。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/knowledge/DocumentUpload.vue`
- 更新 `src/frontend/src/components/knowledge/KnowledgeGovernancePanel.vue`
- 更新 `src/frontend/src/components/admin/AdminBoard.vue`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/tests/e2e/knowledge.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增 R3 重新灰度发布证据判定：
  - `AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001`
  - `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED`
- `prevalidation_reopened` 回滚决策会继续阻断 R3，直到 R3 携带重新灰度发布审计或追踪号。
- `文档上传 / 质量知识资产治理`：
  - 重开后显示 `已重开灰度前校验`。
  - 支持 `重新运行灰度前校验`。
  - 支持 `重新灰度发布 R3`。
- 重开校验通过生成：
  - `AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-PASS-20260521-001`
  - `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-SCOPE-REVALIDATION-PASSED`
- 重新灰度发布生成：
  - `AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001`
  - `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED`
- `质量闭环 / 质量知识复用排序` 在没有扫码复用草案时，也能独立展示已发布或灰度发布的训练集推荐，保证 R3 重新发布后可恢复到 OP-20 推荐面。
- `系统管理 / Agent 治理` 在重新发布后恢复 `扩大灰度 / 回滚到 R2` 操作，进入新一轮灰度决策。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts --grep "R3 调整范围重开校验"`，1 passed。

## 下一步

继续补强重新灰度发布后的报表统计与审计回放聚合，让二次灰度周期能在经营复盘中区分首次灰度与重新灰度。
