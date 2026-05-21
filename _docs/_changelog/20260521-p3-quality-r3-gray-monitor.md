# 2026-05-21 P3 — R3 灰度推荐监控进入治理与报表

## 触发

`QK-TRAIN-20260521-R3` 已经能优先进入 OP-20 质量推荐排序和 AI 助手引用，但灰度发布后的推荐采纳率、复验通过率和负样本误召回仍只停留在发布摘要文案里，治理角色和报表导出无法结构化追踪灰度是否达标。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/admin/AdminBoard.vue`
- 更新 `src/frontend/src/components/report/ReportBoard.vue`
- 更新 `src/frontend/tests/e2e/admin.spec.ts`
- 更新 `src/frontend/tests/e2e/report.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增 `QualityKnowledgeGrayReleaseMonitorRecord` 与 `buildQualityKnowledgeGrayReleaseMonitorRecords()`：
  - 只读取 `gray_published` 的质量再训练版本。
  - 关联 `nextTrainingSetVersion = QK-TRAIN-20260521-R3` 的推荐采纳反馈。
  - 派生推荐采纳率、复验通过率、负样本误召回和灰度范围。
- `系统管理 / Agent 治理`：
  - 指标新增 `灰度监控`。
  - 执行策略新增 `质量灰度监控`。
  - 新增 `质量推荐灰度监控` 区块，展示 `QK-TRAIN-20260521-R3 灰度监控`、`OP-20 装配扭矩推荐链路`、`推荐采纳率 100%`、`复验通过率 100%`、`负样本误召回 0 次`、灰度审计和灰度追踪。
- `报表中心 / OTD 改善复盘报告`：
  - 新增 `R3 灰度发布后的采纳率、复验和误召回` 区块。
  - CSV 导出新增 `质量推荐灰度监控` 与 `灰度审计追踪` 行。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 首次 admin e2e 因 `OP-20 装配扭矩推荐链路` 在卡片多处出现触发 Playwright strict mode；已把断言收紧到 `.action-topline span`。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts --grep "R3 灰度发布进入 Agent 灰度监控"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/report.spec.ts --grep "R3 灰度发布监控"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/report.spec.ts --grep "R3 灰度发布|质量推荐采纳反馈"`，4 passed。

## 下一步

继续把灰度监控结论推进到受控扩大发布或回滚决策：当采纳率、复验或误召回不达标时，形成 Agent 治理审批、质量页降级提示和审计回放。
