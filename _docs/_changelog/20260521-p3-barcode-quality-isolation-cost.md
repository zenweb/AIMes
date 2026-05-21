# 2026-05-21 P3 — 扫码质量隔离与返工成本证据

## 触发

上一片已经让扫码返工复验释放回写到 `AI 排产`，但质检不合格仍缺少现场质量管理常见的两类经营证据：批次隔离和返工工时成本。没有这两段，返工事件只能说明“冻结/放行”，还不能说明隔离对象、返工代价和后续复盘口径。

## 产出

- 更新 `src/frontend/src/components/production/ProductionBoard.vue`
- 更新 `src/frontend/src/components/quality/QualityBoard.vue`
- 更新 `src/frontend/tests/e2e/scanner.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `生产报工` 在扫码质检返工时新增两条统一 OTD 证据：
  - `TRACE-QR-WO-RUSH-9001-OP-10-ISOLATION`
  - 阶段：`质量隔离`
  - 对象：`WO-RUSH-9001 / AL-202605 / Q-HOLD-01`
  - 状态：`隔离待复验`
- `生产报工` 同步新增返工成本预估：
  - `TRACE-QR-WO-RUSH-9001-OP-10-REWORK-COST`
  - 阶段：`返工成本`
  - 口径：按不良数量估算返工工时，并按 180 元/小时估算成本
  - 状态：`成本待结算`
- `质量闭环` 的扫码质量门回放区纳入 `质量隔离` 与 `返工成本` 两类证据。
- 复验放行时会关闭隔离和成本证据：
  - 隔离记录更新为 `隔离已解除`
  - 成本记录更新为 `成本已归档`
- `报表中心` 与 `审计日志` 继续通过统一 OTD 证据链回放隔离、成本、复验释放和排产回写。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/scanner.spec.ts --grep "质检不合格"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/barcode.spec.ts tests/e2e/scanner.spec.ts tests/e2e/production.spec.ts tests/e2e/quality.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts tests/e2e/scheduling.spec.ts`，65 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

本轮下一片已把扫码质量事件沉淀为 CAPA 推荐样本和质量知识库复用链路。后续继续补“同类缺陷自动匹配 / 质量知识命中后生成处置草案 / 复用效果评分”。
