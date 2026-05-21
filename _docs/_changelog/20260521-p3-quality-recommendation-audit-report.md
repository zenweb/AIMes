# 2026-05-21 P3 — 质量推荐采纳反馈进入审计回放与报表导出

## 触发

`QK-TRAIN-20260521-R2 -> QK-TRAIN-20260521-R3` 的推荐采纳反馈已经进入质量页、AI 助手、Agent 治理和知识资产治理。但审计页仍主要通过通用 OTD 证据链呈现，报表 CSV 也缺少专门的学习闭环字段，复盘时不够直观。

## 产出

- 更新 `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
- 更新 `src/frontend/src/components/report/ReportBoard.vue`
- 更新 `src/frontend/tests/e2e/audit.spec.ts`
- 更新 `src/frontend/tests/e2e/report.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `审计日志 / AI 决策回放` 新增 `质量推荐` 专用回放卡。
- 回放详情展示：
  - `QK-TRAIN-20260521-R2` 已发布到质量知识复用排序和 AI 推荐链路。
  - 现场采纳原因、执行人和反馈审计。
  - 效果趋势 `89 -> 93 分`。
  - 下一轮训练集 `QK-TRAIN-20260521-R3` 与 `TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3`。
- `报表中心 / OTD 改善复盘报告` 新增 `质量推荐学习闭环` 区块。
- CSV 导出新增 `质量推荐学习闭环` 行，导出 `WO-DEMO-1018 OP-20`、`R2 -> R3`、效果趋势、反馈审计和下一轮训练追踪。
- 继续派生读取 `aimes_quality_knowledge_recommendation_feedback`，不复制业务状态。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/audit.spec.ts --grep "质量推荐采纳"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/report.spec.ts --grep "质量推荐采纳反馈"`，1 passed。
- 首次审计 e2e 因 R3 追踪号同时出现在步骤与风险口径触发 Playwright strict mode；已把断言收紧到 `ol li` 后通过。

## 下一步

继续推进 `QK-TRAIN-20260521-R3`：合并多条现场反馈、审批、发布前校验和灰度发布。
