# 2026-05-21 P3 — R3 灰度审批、问题单与报表统计

## 触发

上一片已经让 R3 灰度监控能触发扩大或回滚，但动作仍过于直接：扩大缺少质量主管确认门，回滚后没有形成 R3 待复核问题单，报表也不能统计灰度扩大/回滚次数。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/admin/AdminBoard.vue`
- 更新 `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
- 更新 `src/frontend/src/components/report/ReportBoard.vue`
- 更新 `src/frontend/tests/e2e/admin.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `QualityKnowledgeGrayReleaseDecisionRecord` 新增审批字段：
  - `approvalStatus`
  - `approvalLabel`
  - `approvedBy`
  - `approvedAt`
- R3 扩大灰度：
  - 点击 `扩大灰度` 后先进入 `待质量主管确认`。
  - 点击 `质量主管确认扩大` 后记录 `质量主管已确认扩大`。
- R3 回滚：
  - 自动生成待复核问题单 `R3-REVIEW-ISSUE-20260521-001`。
  - 追踪编号为 `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REVIEW-ISSUE`。
  - 问题单写入 OTD 证据链的 `灰度复核问题单` 阶段。
- `审计日志 / AI 决策回放`：
  - 质量灰度回放展示审批状态。
  - 回滚回放展示待复核问题单。
  - 扩大未确认时风险口径显示仍保持受控范围。
- `报表中心 / OTD 改善复盘报告`：
  - 新增 `质量灰度决策统计`。
  - 统计扩大次数、回滚次数、待主管确认、已确认扩大和待复核问题单。
  - CSV 导出新增 `质量灰度决策统计`、`质量灰度决策` 和 `待复核问题单` 行。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts --grep "R3 灰度扩大|R3 灰度监控可触发回滚"`，2 passed。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts --grep "R3 灰度|质量推荐采纳"`，7 passed。

## 下一步

继续把 R3 待复核问题单做成可关闭状态机：质量主管补充负样本或调整灰度范围后，应能重新打开灰度前校验并再次触发发布/回滚决策。
