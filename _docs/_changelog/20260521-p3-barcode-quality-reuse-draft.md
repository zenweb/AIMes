# 2026-05-21 P3 — 质量知识命中处置草案与复用评分

## 触发

上一片已经把 `WO-RUSH-9001 OP-10` 的扫码返工、批次隔离、返工成本、复验释放和排产回写沉淀为 `扫码返工 CAPA 样本库 QK-20260521`。但知识样本只是“可引用”，还不能在同类缺陷出现时自动给出待复核处置草案，也不能说明复用后节省了什么、风险降低了多少。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/quality/QualityBoard.vue`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/src/components/chat/ChatPanel.vue`
- 更新 `src/frontend/src/utils/knowledge-citations.ts`
- 更新 `src/frontend/tests/e2e/quality.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`
- 更新 `_docs/_changelog/20260521-p3-barcode-quality-knowledge-reuse.md`

## 功能

- 新增质量知识复用草案同步层，存储键为 `aimes_quality_knowledge_reuse_drafts`。
- `质量闭环` 的“质量知识复用”面板在样本入库后展示 `WO-DEMO-1012` 同类缺陷自动匹配：
  - 工序：`CNC 精加工`
  - 设备：`CNC-002`
  - 材料族：`AL-202605-B`
  - 缺陷模式：`首件尺寸偏差`
  - 匹配分：`92%`
- 点击“生成同类缺陷处置草案”后生成：
  - 审计编号：`AUD-KG-QA-REUSE-20260521-001`
  - 追踪编号：`TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-DRAFT`
  - 复用效果评分：`88 分`
- 草案动作覆盖：
  - 冻结 `WO-DEMO-1012 OP-10 -> OP-20` 下道交接。
  - 隔离 `AL-202605-B` 同批在制件。
  - 按 `1.5h / 270 元` 预估返工成本。
  - 复验放行后同步标签解冻与 OP-20 排产复核。
- CAPA 面板新增“知识命中草案”卡片，展示匹配分、草案动作、效果指标和追踪编号。
- `AI 生产助手` 的扫码返工复用回答会补充已生成草案、草案动作、审计编号和追踪编号。
- `AI 助手引用链` 把同类缺陷草案作为扫码返工复用问答的新来源，并标记该草案仍需质量工程师复核后转正式 CAPA。
- 草案同步写入统一 OTD 证据链的 `质量处置草案` 阶段，`报表中心` 和 `审计日志` 可直接回放。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts --grep "同类缺陷"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts tests/e2e/knowledge.spec.ts tests/e2e/chat.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts tests/e2e/scanner.spec.ts`，44 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

已由 `_docs/_changelog/20260521-p3-barcode-quality-reuse-closure.md` 承接：草案人工复核、正式 CAPA、效果回写、AI 助手引用、报表证据链和审计回放已形成闭环。
