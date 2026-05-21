# 2026-05-21 P3 — 质量再训练发布前校验闭环

## 触发

`QK-TRAIN-20260521-R2` 已经能审批、回滚并进入 Agent 治理监管，但发布前校验门仍只是文字说明。真实 AI MES 需要能执行校验，把失败原因固化为证据，并让回滚基于校验结论发生。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/knowledge/DocumentUpload.vue`
- 更新 `src/frontend/src/components/knowledge/KnowledgeGovernancePanel.vue`
- 更新 `src/frontend/tests/e2e/knowledge.spec.ts`
- 更新 `src/frontend/tests/e2e/admin.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `QualityKnowledgeRetrainingVersionRecord` 新增 `validation_failed` 状态和校验字段。
- `文档上传 / 知识库治理` 对已批准训练集版本新增 `运行发布前校验` 动作。
- 校验失败生成：
  - 校验审计：`AUD-KG-QA-RETRAINING-VALIDATION-20260521-001`
  - 校验追踪：`TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-VALIDATION-FAILED`
- 校验发现包括：
  - `OP-20 扭矩工具校准字段缺失`
  - `离线 Top-3 召回仍需补充扭矩工具族特征`
  - `发布前必须保留 QK-TRAIN-20260521-R1 回滚目标`
- 校验失败写入独立 OTD 复盘证据 `知识再训练校验`。
- `报表中心` 和 `审计日志` 可同时回放审批、校验失败、回滚三段证据。
- `系统管理 / Agent 治理` 的质量再训练版本监管显示校验失败状态、校验发现、校验审计和回滚目标。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts --grep "批准再训练候选"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts --grep "质量再训练版本"`，1 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

继续推进训练集发布闭环：补“字段修复后重新校验通过”和“正式发布到 AI 推荐链路”的正向路径。
