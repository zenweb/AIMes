# 2026-05-21 P3 质量推荐实验候选执行链

## 变更

- `文档上传 / 质量知识资产治理` 对 R6/R7 `实验候选` 增加执行动作，支持在知识资产侧合并 R6 负样本补样，并在 R6 覆盖闭合后运行 R7 影子验证。
- R6 执行后写入 `QK-TRAIN-20260521-R6`，状态为 `补样已合并`，负样本覆盖升级到 `8 / 8 条 / 100%`，审计编号为 `AUD-KG-QA-RETRAINING-R6-NEGATIVE-COVERAGE-MERGE-20260521-001`。
- R7 执行后写入 `QK-TRAIN-20260521-R7`，状态为 `影子验证已通过`，记录 `2 个跨线影子场景 / 误召回 0 次`，审计编号为 `AUD-KG-QA-RETRAINING-R7-SHADOW-VALIDATION-PASS-20260521-001`。
- R7 影子验证通过后可在知识资产侧发布 `影子灰度已发布`，审计编号为 `AUD-KG-QA-RETRAINING-R7-SHADOW-GRAY-PUBLISH-20260521-001`，追踪编号为 `TRACE-KG-QA-WO-DEMO-1018-OP-20-R7-SHADOW-GRAY-PUBLISHED`。
- 主动推荐选择器会排除未获质量主管确认扩大的影子灰度版本；系统管理提交扩大后先显示 `待质量主管确认`，确认后 `QK-TRAIN-20260521-R7` 才会以 `实验扩大优先` 进入质量推荐排序。
- 执行状态复用 `aimes_quality_knowledge_retraining_versions`，不新增独立 localStorage 状态；Admin、Audit、Report 和 CSV 均从同一候选构建链读取执行结果。
- 新增 Knowledge e2e 覆盖从 R5 回滚候选派生，到 R6 补样合并、R7 影子验证、系统管理治理、审计回放、报表页面和 CSV 导出的完整链路。

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts --grep "R6 补样和 R7 影子验证"`
- `npm run test:e2e -- tests/e2e/quality.spec.ts --grep "R7 影子灰度需质量主管确认后才进入主动推荐"`
- `npx playwright test tests/e2e/knowledge.spec.ts --grep "R5 回滚实验沉淀为实验负样本和风险阈值资产"`
- `npm run test:e2e`：195 passed
