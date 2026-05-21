# 2026-05-21 P3 — R3 重新灰度发布进入报表与审计

## 触发

R3 已经支持重开灰度前校验并重新灰度发布，但经营复盘和审计回放还无法区分“首次灰度发布”和“重新灰度发布”。需要把二次灰度周期、重新发布审计、追踪编号和灰度范围明细同步到报表统计、CSV 导出和审计回放。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/report/ReportBoard.vue`
- 更新 `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
- 更新 `src/frontend/tests/e2e/report.spec.ts`
- 更新 `src/frontend/tests/e2e/audit.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `QualityKnowledgeGrayReleaseMonitorRecord` 新增：
  - `releaseCycleLabel`：派生 `首次灰度发布` / `重新灰度发布`。
  - `recommendationScope`：保留二次灰度范围明细。
- `报表中心 / 质量推荐灰度监控`：
  - 卡片标题追加灰度周期。
  - 指标区显示 `灰度周期 重新灰度发布`。
  - CSV 导出新增 `灰度周期 / 重新灰度发布` 行。
- `审计日志 / AI 决策回放`：
  - 新增 `质量灰度发布` 回放项。
  - R3 重新灰度发布回放展示重新发布审计、范围明细、监控指标和回滚目标归档状态。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/report.spec.ts --grep "重新灰度发布"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/audit.spec.ts --grep "重新灰度发布"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts --grep "R3 灰度|质量灰度|质量推荐采纳|重新灰度发布"`，9 passed。

## 下一步

继续把 R3 重新灰度发布后的新一轮扩大/回滚决策沉淀为可比较的周期趋势，避免经营复盘只看到单次快照。
