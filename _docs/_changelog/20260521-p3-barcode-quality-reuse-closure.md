# 2026-05-21 P3 — 质量知识复用草案转正式 CAPA 与效果回写

## 触发

上一片已让 `WO-DEMO-1012 OP-10` 命中 `扫码返工 CAPA 样本库 QK-20260521` 并生成同类缺陷处置草案。但草案仍是“待复核”的建议，不足以代表真实质量闭环。需要把它推进为质量工程师复核、正式 CAPA、复验验证和效果反馈，才能让质量知识从一次推荐变成可持续迭代的数据。

## 产出

- 更新 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/src/components/chat/ChatPanel.vue`
- 更新 `src/frontend/src/utils/knowledge-citations.ts`
- 更新 `src/frontend/tests/e2e/quality.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`
- 更新 `_docs/_changelog/20260521-p3-barcode-quality-reuse-draft.md`

## 功能

- 新增质量知识复用闭环同步层，存储键为 `aimes_quality_knowledge_reuse_closures`。
- CAPA 面板在同类缺陷草案卡上新增两段动作：
  - `复核草案并转正式 CAPA`
  - `验证复用效果并回写`
- 复核通过后生成：
  - 审计编号：`AUD-KG-QA-REUSE-CAPA-20260521-001`
  - 正式 CAPA 追踪：`TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA`
  - OTD 阶段：`正式CAPA`
  - 验证标准：`复验尺寸 Cpk >= 1.33，OP-20 首件接收无返修`
- 验证回写后生成：
  - 效果追踪：`TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT`
  - OTD 阶段：`质量复用效果`
  - 复用评分：`88 -> 94 分`
  - 反馈指标：草案复核耗时、重复分析节省、复发风险下降
- `AI 生产助手` 在扫码返工复用回答中展示草案是否已转正式 CAPA、是否已完成效果回写。
- `AI 助手引用链` 增加正式 CAPA 与复用效果反馈来源；验证完成后阻断说明升级为“已完成正式 CAPA 验证并回写效果”。
- `报表中心` 和 `审计日志` 自动通过统一 OTD 证据链展示草案、正式 CAPA、效果回写三段证据。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts --grep "同类缺陷"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts tests/e2e/knowledge.spec.ts tests/e2e/chat.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts tests/e2e/scanner.spec.ts`，44 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

已由 `_docs/_changelog/20260521-p3-barcode-quality-reuse-ranking.md` 承接：复用排序、已验证样本优先、低分样本降权复核、AI 助手引用链、报表证据链和审计回放已形成闭环。
