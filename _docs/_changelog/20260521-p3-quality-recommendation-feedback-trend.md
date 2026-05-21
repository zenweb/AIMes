# 2026-05-21 P3 — 已发布推荐采纳反馈与下一轮训练集

## 触发

上一片已经证明 `QK-TRAIN-20260521-R2` 发布后会改变 `WO-DEMO-1018 OP-20` 的质量知识推荐排序和 AI 助手引用链。为了继续接近真正的 AI MES，需要让推荐进入现场采纳反馈和持续学习，而不是停在“发布后可推荐”。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/src/components/chat/ChatPanel.vue`
- 更新 `src/frontend/src/utils/knowledge-citations.ts`
- 更新 `src/frontend/tests/e2e/quality.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增 `aimes_quality_knowledge_recommendation_feedback` 本地状态，记录已发布训练集推荐的现场采纳结果。
- `WO-DEMO-1018 OP-20` 的已发布推荐卡新增 `采纳发布推荐并回写效果` 动作。
- 采纳后推荐状态从 `已发布训练集 / 89 分` 升级为 `已采纳推荐 / 93 分`，并展示：
  - `AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001`
  - `TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED`
  - 效果趋势 `89 -> 93 分`
  - 下一轮训练集 `QK-TRAIN-20260521-R3`
- 采纳反馈写入统一 OTD 复盘证据链：
  - `推荐采纳反馈`
  - `下一轮训练集`
- `AI 生产助手` 的扫码质量复用回答展示采纳反馈、效果趋势、反馈审计和下一轮训练集追踪。
- `AI 助手引用链` 新增 `WO-DEMO-1018 OP-20 推荐采纳效果` 来源。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts --grep "采纳已发布推荐"`，1 passed。
- 首次 e2e 因 Playwright strict mode 发现 `93 分` 匹配过宽；已收紧到 `.ranking-topline strong` 后通过。

## 下一步

把推荐采纳趋势继续接入治理面：Agent 治理、知识库资产治理、审计回放和报表导出都应能明确看到 `R2 发布 -> 推荐采纳 -> R3 候选` 的持续学习链路。
