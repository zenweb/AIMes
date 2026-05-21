# 2026-05-21 P3 — 质量推荐多版本实验对比

## 触发

R3 灰度周期趋势已能区分首次灰度和重新灰度，但报表仍围绕单个 R3 版本展开。后续 R4/R5 质量推荐实验需要复用同一套灰度指标、反馈、决策和 CSV 复盘口径，否则无法比较“哪个训练集版本更值得扩大、哪个版本需要回滚”。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/report/ReportBoard.vue`
- 更新 `src/frontend/tests/e2e/report.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增 `QualityKnowledgeRecommendationExperimentComparisonRecord`。
- 新增 `buildQualityKnowledgeRecommendationExperimentComparisonRecords()`，从灰度发布训练集、现场推荐反馈和灰度决策派生 R3/R4/R5 实验对比记录。
- 反馈匹配优先读取该训练集自身运行反馈，同时兼容旧的 `nextTrainingSetVersion` 候选反馈，避免 R3 旧演示数据失去灰度监控指标。
- `报表中心 / OTD 改善复盘报告` 新增 `质量推荐多版本实验对比`：
  - 训练集版本
  - 灰度周期
  - 推荐采纳率
  - 复验通过率
  - 负样本误召回
  - 效果趋势
  - 实验评分
  - 灰度审计与追踪
  - 扩大/回滚决策
- CSV 导出新增 `质量推荐实验对比` 行，导出每个实验版本的指标、效果趋势、反馈审计、灰度审计和决策审计。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/report.spec.ts --grep "实验对比|R4|R5"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/report.spec.ts --grep "R3 灰度发布监控|重新灰度发布|周期趋势|实验对比|R4|R5"`，4 passed。

## 下一步

继续把多版本实验对比接入治理面：在 `系统管理 / Agent 治理` 增加 R4/R5 实验池、候选扩大范围和风险阈值，再决定是否进入主动推荐选择逻辑。
