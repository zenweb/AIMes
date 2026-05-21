# 2026-05-21 P3 — 质量知识策略治理接入 Agent 治理

## 触发

上一片已经把 `WO-DEMO-1018 OP-20` 低分复核结论回写为“禁用直接复用”，并生成再训练候选。但如果禁用规则只存在于质量页、助手回答或审计回放中，仍然不能算作可治理的 AI MES 策略资产。需要把它接入 `系统管理 / Agent 治理`，让管理员能看到阈值、规则、审计编号和再训练候选。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/admin/AdminBoard.vue`
- 更新 `src/frontend/tests/e2e/admin.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`
- 更新 `_docs/_changelog/20260521-p3-barcode-quality-review-decision.md`

## 功能

- 新增 `QualityKnowledgePolicyGovernanceRecord`，把低分复核记录派生为策略治理记录。
- 新增 `buildQualityKnowledgePolicyGovernanceRecords()`：
  - 阈值：`复用效果阈值 >= 70 分`
  - 禁用规则：`matchScore < 70 或跨工序缺陷模式不一致时，只能进入复核/再训练队列，不能进入优先推荐`
  - 审计编号：`AUD-KG-QA-LOW-SCORE-DECISION-20260521-001`
  - 结论追踪：`TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-DECISION`
  - 再训练候选：`TRACE-KG-QA-WO-DEMO-1018-OP-20-RETRAINING-CANDIDATE`
- `系统管理 / Agent 治理` 新增 `质量知识策略治理` 区块。
- Agent 治理指标新增 `质量策略规则`。
- 执行策略新增：
  - `质量复用低分阈值：70 分`
  - `质量低分候选：禁用直接复用 + 再训练候选`
- 该治理区读取 `aimes_quality_knowledge_review_queue`，与质量闭环、AI 助手、引用链、报表和审计共享同一条低分复核记录。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts --grep "质量知识低分复核规则"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts`，8 passed。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts tests/e2e/knowledge.spec.ts tests/e2e/chat.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts tests/e2e/admin.spec.ts`，45 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

继续推进样本治理清单：把再训练候选从 Agent 治理策略卡延伸到知识库治理页，形成“样本入库 / 禁用 / 负样本 / 再训练候选”的统一知识资产视图。
