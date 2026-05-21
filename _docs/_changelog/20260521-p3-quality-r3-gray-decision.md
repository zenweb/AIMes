# 2026-05-21 P3 — R3 灰度监控决策与回滚链路

## 触发

R3 灰度监控已经能展示推荐采纳率、复验通过率和负样本误召回，但达标或不达标之后还缺少治理动作。需要让灰度监控可以触发扩大范围或回滚，并让质量推荐排序和审计回放读取同一条决策记录。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/admin/AdminBoard.vue`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
- 更新 `src/frontend/tests/e2e/admin.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增 `aimes_quality_knowledge_gray_release_decisions`：
  - 支持 `expanded` 与 `rolled_back` 两类灰度决策。
  - 记录决策人、审计号、追踪号、指标快照、扩大范围或回滚目标。
- `系统管理 / Agent 治理`：
  - R3 灰度监控卡新增 `扩大灰度` 与 `回滚到 R2` 动作。
  - 生成 `AUD-KG-QA-RETRAINING-R3-GRAY-EXPAND-20260521-001` 或 `AUD-KG-QA-RETRAINING-R3-GRAY-ROLLBACK-20260521-001`。
  - 指标新增 `灰度决策`，执行策略新增 `质量灰度决策`。
- `质量闭环 / 质量知识复用排序`：
  - `selectActiveQualityKnowledgeRecommendationVersion()` 会排除已回滚的灰度版本。
  - R3 回滚后显示 `R3 回滚后 R2 生效`，推荐元数据恢复为 `QK-TRAIN-20260521-R2` 正式发布审计。
- `审计日志 / AI 决策回放`：
  - 新增 `质量灰度` 回放卡。
  - 回放灰度指标快照、决策人、回滚/扩大动作、推荐降级和追踪编号。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts --grep "R3 灰度监控可触发回滚"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts --grep "R3 灰度|质量推荐采纳"`，4 passed。

## 下一步

继续把灰度决策扩展为更接近真实 MES 的审批链：灰度扩大需要质量主管确认、回滚需要自动生成 R3 待复核问题单，并在报表中统计灰度扩大/回滚次数。
