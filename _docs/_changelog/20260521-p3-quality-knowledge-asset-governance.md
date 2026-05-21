# 2026-05-21 P3 — 质量知识资产治理接入知识库治理页

## 触发

上一片已经把 `WO-DEMO-1018 OP-20` 低分复核结论接入 `系统管理 / Agent 治理`。但知识库治理页仍只关注文档分类、版本、索引和引用链，无法让知识库管理员在一个视图里核对质量样本、禁用规则、负样本和再训练候选。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/knowledge/DocumentUpload.vue`
- 更新 `src/frontend/src/components/knowledge/KnowledgeGovernancePanel.vue`
- 更新 `src/frontend/tests/e2e/knowledge.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增 `QualityKnowledgeAssetGovernanceRecord`，把质量样本和低分复核队列统一派生为知识资产治理记录。
- 新增 `buildQualityKnowledgeAssetGovernanceRecords()`，覆盖资产阶段：
  - `样本入库`
  - `禁用`
  - `负样本`
  - `再训练候选`
  - `复核中`
- `文档上传 / 知识库治理` 新增 `质量知识资产治理` 区块。
- 已关闭的 `WO-DEMO-1018 OP-20` 低分复核会在知识库治理页形成：
  - `直接复用禁用`
  - `负样本`
  - `再训练候选`
- 资产卡展示评分、禁用规则、下一步动作、审计编号和追踪编号。
- 该视图读取 `aimes_quality_knowledge_samples` 与 `aimes_quality_knowledge_review_queue`，与质量闭环、AI 助手、Agent 治理、报表和审计共享同一份数据。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts --grep "质量低分复核结论"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts`，6 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

继续推进知识资产生命周期：把再训练候选从“待确认”推进为可执行的样本入库审批、训练集版本和回滚记录。
