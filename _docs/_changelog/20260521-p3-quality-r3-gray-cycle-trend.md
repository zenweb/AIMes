# 2026-05-21 P3 — R3 灰度决策周期趋势

## 触发

R3 重新灰度发布后，扩大/回滚仍按 `版本 + 动作` 生成决策记录。若重新灰度后再次回滚，会覆盖首次灰度回滚记录，报表和审计只能看到单次快照，无法比较首次灰度与重新灰度两个周期。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/admin/AdminBoard.vue`
- 更新 `src/frontend/src/components/report/ReportBoard.vue`
- 更新 `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
- 更新 `src/frontend/tests/e2e/report.spec.ts`
- 更新 `src/frontend/tests/e2e/audit.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `QualityKnowledgeGrayReleaseDecisionRecord` 新增周期归属字段：
  - `releaseCycleLabel`
  - `releaseAuditId`
  - `releaseTraceId`
  - `releaseScopeLabel`
- 灰度决策 ID 按 `initial / republish` 生成，重新灰度发布后的同动作决策不再覆盖首次灰度决策。
- 旧 localStorage 灰度决策读取时自动补齐周期字段，默认归入 `首次灰度发布`。
- `系统管理 / Agent 治理` 按灰度周期匹配监控卡和决策记录。
- `报表中心 / 质量灰度决策统计` 新增周期汇总：
  - `首次灰度发布`
  - `重新灰度发布`
  - 每个周期展示扩大、回滚、待确认和待复核数量。
- CSV 导出新增：
  - `质量灰度决策周期`
  - `发布周期审计`
- `审计日志 / AI 决策回放` 显示发布周期、发布审计、发布追踪和决策审计，支持追溯重新灰度发布后的二次回滚。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/report.spec.ts --grep "周期趋势|重新灰度发布"`，2 passed。
- 通过：`npm run test:e2e -- tests/e2e/audit.spec.ts --grep "重新灰度发布"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts --grep "R3 灰度|质量灰度|质量推荐采纳|重新灰度发布|周期趋势"`，10 passed。

## 下一步

继续把周期趋势从单版本 R3 扩展为多版本质量推荐实验对比，让 R4/R5 后续实验能复用同一套灰度周期、决策和复盘口径。
