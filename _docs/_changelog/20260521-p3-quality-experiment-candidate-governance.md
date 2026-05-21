# 2026-05-21 P3 质量推荐实验候选治理

## 变更

- 新增 `QualityKnowledgeRecommendationExperimentCandidateRecord` 和 `buildQualityKnowledgeRecommendationExperimentCandidateRecords()`，从 R5 回滚记录、现场推荐反馈、训练集版本和灰度决策中派生 R6/R7 下一轮实验候选，不新增额外 localStorage 状态。
- R5 回滚后自动生成 R6 负样本补样候选，展示负样本覆盖 `6 / 8 条`、覆盖率 `75%`、缺口 `需补 2 条跨线负样本`、来源回滚审计和候选审计。
- R6 补样候选后继续派生 R7 影子验证候选，展示覆盖率 `100%`、缺口 `追加 2 个跨线影子场景`，并标记只能进入影子验证、不能直接扩大灰度。
- `系统管理 / Agent 治理` 新增 `质量实验候选治理` 区块、顶部 `实验候选` 指标和执行策略摘要，支持核对 R6/R7 候选、门禁策略、来源审计、候选审计和下一步动作。
- `审计日志 / AI 决策回放` 新增质量实验候选回放卡，支持回放 R5 回滚到 R6 补样、R7 影子验证的决策链和追踪编号。
- `报表中心 / OTD 改善复盘报告` 新增质量推荐实验候选治理区块，CSV 导出新增 `质量推荐实验候选` 行。

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`
- `npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts --grep "实验候选|R3 R4 R5 多版本质量推荐实验对比"`
