# 2026-05-21 P3 — 质量知识复用排序与低分样本复核队列

## 触发

上一片已经让 `WO-DEMO-1012 OP-10` 的同类缺陷草案完成质量工程师复核、正式 CAPA 和复用效果回写，评分从 `88` 提升到 `94`。但反馈结果还没有进入下一次复用的排序策略，也没有把低评分候选样本推入复核队列。需要让质量知识从“闭环反馈”继续变成“可排序、可降权、可复核”的持续学习链路。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/src/components/chat/ChatPanel.vue`
- 更新 `src/frontend/src/utils/knowledge-citations.ts`
- 更新 `src/frontend/tests/e2e/quality.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`
- 更新 `_docs/_changelog/20260521-p3-barcode-quality-reuse-closure.md`

## 功能

- 新增质量知识复用排序构建器，基于正式 CAPA 效果回写和草案评分生成排序列表。
- 新增低分样本复核队列同步层，存储键为 `aimes_quality_knowledge_review_queue`。
- CAPA 面板新增 `质量知识复用排序`：
  - 已验证 `WO-DEMO-1012 OP-10` 样本：`94 分 / 优先复用`。
  - 原始扫码返工样本：`88 分 / 可复用`。
  - `WO-DEMO-1018 OP-20 装配扭矩偏移复用尝试`：匹配 `63%`、效果 `61 分`、状态 `低分复核`。
- 点击“生成低分样本复核队列”后生成：
  - 队列记录：`quality-knowledge-review-low-score-wo-demo-1018-op-20`
  - 审计编号：`AUD-KG-QA-LOW-SCORE-20260521-001`
  - 追踪编号：`TRACE-KG-QA-WO-DEMO-1018-OP-20-LOW-SCORE-REVIEW`
  - OTD 阶段：`低分复核`
- `AI 生产助手` 在扫码质量复用回答中展示低分队列、降权原因和复核追踪编号。
- `AI 助手引用链` 新增 `kg-quality-low-score-review` 来源，并在阻断说明中标记低分候选不能直接复用。
- `报表中心` 和 `审计日志` 通过统一 OTD 证据链展示低分样本复核状态。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts --grep "同类缺陷"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts tests/e2e/knowledge.spec.ts tests/e2e/chat.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts tests/e2e/scanner.spec.ts`，44 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

已由 `_docs/_changelog/20260521-p3-barcode-quality-review-decision.md` 承接：低分复核结论、直接复用禁用、再训练候选、AI 助手引用链、报表证据链和审计回放已形成闭环。
