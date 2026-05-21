# 2026-05-21 P3 — 扫码返工 CAPA 知识复用

## 触发

上一片已经补齐 `质量隔离` 与 `返工成本`，但扫码质量事件仍停留在证据链与页面回放。真实工厂希望同类批次、同类设备、同类缺陷下次出现时，系统能复用已验证的 CAPA、隔离和成本口径，而不是每次从零分析。

## 产出

- 新增 `src/frontend/src/utils/quality-knowledge-sample-sync.ts`
- 更新 `src/frontend/src/components/quality/QualityBoard.vue`
- 更新 `src/frontend/src/components/quality/QualityCapaTaskPanel.vue`
- 更新 `src/frontend/src/components/knowledge/DocumentUpload.vue`
- 更新 `src/frontend/src/utils/knowledge-citations.ts`
- 更新 `src/frontend/src/components/chat/ChatPanel.vue`
- 更新 `src/frontend/tests/e2e/quality.spec.ts`
- 更新 `src/frontend/tests/e2e/knowledge.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 新增扫码质量样本同步层，存储键为 `aimes_quality_knowledge_samples`。
- `质量闭环` 的扫码质量门面板新增“质量知识复用”动作，生成：
  - 文档：`扫码返工 CAPA 样本库`
  - 版本：`QK-20260521`
  - 审计编号：`AUD-KG-QA-REWORK-20260521-001`
  - 追踪编号：`TRACE-KG-QA-WO-RUSH-9001-OP-10-REWORK-SAMPLE`
- 样本覆盖的证据包括：
  - `TRACE-QR-WO-RUSH-9001-OP-10-REWORK`
  - `TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION`
  - `TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST`
  - `TRACE-QR-WO-RUSH-9001-OP-10-RECHECK`
  - `TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE`
- CAPA 面板会读取样本并展示同类缺陷推荐：
  - 同类 CNC 首件尺寸偏差先冻结下道交接并隔离 AL 批次。
  - 按不良数量预估返工工时成本，进入 OTD 与经营复盘。
  - 复验放行后同步解冻流转卡标签，并让 AI 排产复核 OP-20 窗口。
- `文档上传` 把样本展示为已索引质量文档。
- `AI 助手引用链` 新增 `扫码返工同类问题如何复用 CAPA？` 问答卡；样本未生成时显示 `需复核`，生成后显示 `可引用`。
- `AI 生产助手` 可回答“扫码返工同类问题怎么复用 CAPA？”，并引用同一份样本来源。
- `审计日志` 通过统一 OTD 证据链回放 `质量知识` 阶段。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts --grep "扫码返工样本"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts --grep "展示 AI 助手"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/quality.spec.ts tests/e2e/knowledge.spec.ts tests/e2e/chat.spec.ts tests/e2e/audit.spec.ts tests/e2e/report.spec.ts tests/e2e/scanner.spec.ts`，43 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

已由 `_docs/_changelog/20260521-p3-barcode-quality-reuse-draft.md` 承接：同类缺陷自动匹配、质量知识命中处置草案和复用效果评分已落到 `质量闭环`、CAPA 面板、AI 助手引用、报表证据链和审计回放。
