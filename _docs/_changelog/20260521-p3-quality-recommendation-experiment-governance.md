# 2026-05-21 P3 — 质量推荐实验池进入 Agent 治理

## 触发

R3/R4/R5 多版本质量推荐实验已进入报表和 CSV，但系统管理的 Agent 治理面仍只展示采纳反馈、灰度监控和灰度决策。治理角色需要直接看到哪些训练集版本正在观察、哪些版本已扩大、哪些版本已回滚，否则多版本实验仍像报表结果，而不是可治理资产。

## 产出

- 更新 `src/frontend/src/components/admin/AdminBoard.vue`
- 更新 `src/frontend/tests/e2e/admin.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `系统管理 / Agent 治理` 新增 `质量推荐实验池`。
- 实验池复用 `buildQualityKnowledgeRecommendationExperimentComparisonRecords()`，统一展示：
  - R3/R4/R5 训练集版本
  - 灰度周期
  - 推荐采纳率
  - 复验通过率
  - 负样本误召回
  - 实验评分
  - 效果趋势
  - 反馈审计
  - 灰度审计
  - 扩大/回滚决策审计
- Agent 治理顶部指标新增 `推荐实验`。
- `执行策略` 新增 `质量推荐实验池` 汇总，展示实验总数、扩大数量和回滚数量。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts --grep "实验池|R4|R5"`，1 passed。

## 下一步

把实验池结果继续推向主动推荐选择逻辑：R4 扩大后进入候选优先级，R5 回滚后进入负样本和风险阈值治理。
