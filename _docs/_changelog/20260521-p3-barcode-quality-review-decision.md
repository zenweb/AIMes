# 2026-05-21 P3 — 低分质量知识复核结论与再训练候选

## 触发

上一片已经把 `WO-DEMO-1018 OP-20` 的低分复用候选放入复核队列，但队列本身还没有形成结论。真实 AI MES 不能只把低分样本“标出来”，还要能沉淀为禁用规则、负样本和再训练候选，避免后续助手继续把错误泛化当成可执行 CAPA 推荐。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/src/components/chat/ChatPanel.vue`
- 更新 `src/frontend/src/utils/knowledge-citations.ts`
- 更新 `src/frontend/tests/e2e/quality.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`
- 更新 `_docs/_changelog/20260521-p3-barcode-quality-reuse-ranking.md`

## 功能

- `QualityKnowledgeReviewQueueRecord` 增加复核结论字段：结论审计、结论追踪、禁用规则、再训练追踪和再训练计划。
- CAPA 面板新增“完成复核并禁用直接复用”动作。
- `WO-DEMO-1018 OP-20` 人工复核后会从 `复核中` 更新为 `直接复用已禁用`：
  - 结论审计：`AUD-KG-QA-LOW-SCORE-DECISION-20260521-001`
  - 结论追踪：`TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION`
  - 再训练候选：`TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE`
- 复核结论明确：`OP-20 装配扭矩偏移` 与 `CNC 扫码返工样本` 不属于同一泛化族，禁止 AI 助手将该低分候选作为直接 CAPA 推荐。
- 禁用规则写入助手与引用链：`matchScore < 70` 或跨工序缺陷模式不一致时，只能进入复核/再训练队列。
- 再训练计划包含三项：
  - 新建装配扭矩偏移独立 CAPA 样本。
  - 将本次 61 分低分尝试作为负样本。
  - 后续推荐需同时满足工序、设备族、缺陷模式和验证效果阈值。
- 统一 OTD 证据链新增两段：
  - `低分复核结论`
  - `知识再训练`
- `报表中心` 和 `审计日志` 可回放从低分队列、结论禁用到再训练候选的完整链路。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts --grep "同类缺陷"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts tests/e2e/knowledge.spec.ts tests/e2e/chat.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts tests/e2e/scanner.spec.ts`，44 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

已由 `_docs/_changelog/20260521-p3-quality-policy-governance.md` 承接：质量知识禁用规则、复用阈值、再训练候选和 Agent 治理策略卡已形成闭环。
