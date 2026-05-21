# 2026-05-21 P3 — R3 待复核问题单状态流

## 触发

上一片已经让 R3 灰度回滚自动生成待复核问题单，但问题单仍只是静态记录。现场需要质量主管能继续处理：要么补充负样本后关闭，要么调整灰度范围后重新打开灰度前校验。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/admin/AdminBoard.vue`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
- 更新 `src/frontend/src/components/report/ReportBoard.vue`
- 更新 `src/frontend/tests/e2e/admin.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `QualityKnowledgeGrayReleaseDecisionRecord` 新增复核问题单字段：
  - `reviewIssueStatus`
  - `reviewIssueLabel`
  - `reviewIssueResolution`
  - `reviewIssueClosedBy`
  - `reviewIssueClosedAt`
  - `reviewIssueValidationAuditId`
  - `reviewIssueValidationTraceId`
  - `reviewIssueActions`
- `系统管理 / Agent 治理`：
  - 回滚生成的问题单打开时显示 `补充负样本并关闭`。
  - 回滚生成的问题单打开时显示 `调整范围重开校验`。
  - Agent 指标新增 `灰度复核`，统计仍打开的问题单数量。
- 关闭路径：
  - 生成 `AUD-KG-QA-RETRAINING-R3-REVIEW-CLOSE-20260521-001`。
  - 生成 `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REVIEW-CLOSED`。
  - 问题单状态变为 `问题单已关闭`。
  - 处置动作写入 OTD 证据链、审计回放、报表和 CSV。
- 重开校验路径：
  - 生成 `AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-20260521-001`。
  - 生成 `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-SCOPE-REVALIDATION`。
  - 问题单状态变为 `已重开灰度前校验`。
  - 校验通过前仍保持 R2 正式推荐版本。
- `质量闭环`：
  - R3 灰度治理决策横幅展示问题单编号和当前状态。
- `审计日志 / AI 决策回放`：
  - 质量灰度回放展示问题单状态、处置动作、处置审计和处置追踪。
- `报表中心 / OTD 改善复盘报告`：
  - `质量灰度决策统计` 增加 `已关闭 / 重开灰度前校验`。
  - CSV 导出增加问题单处置审计和追踪号。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts --grep "R3 回滚后可补充|R3 回滚后可调整|R3 灰度监控可触发回滚"`，3 passed。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts --grep "R3 灰度|质量灰度|质量推荐采纳"`，7 passed。

## 下一步

把 `已重开灰度前校验` 接到知识库治理中的 R3 校验/发布动作：质量主管调整范围后，应能重新运行灰度前校验，并基于新校验结果再次扩大、继续回滚或归档关闭。
