# 2026-05-21 P3 — 条码质量门不合格分流

## 触发

上一轮已把扫码完工后的首件巡检质量门和下道工序交接写入统一 OTD 证据链，但质量门不通过时仍缺少真实 MES 应有的冻结动作。本次把 `Rework / Fail` 分支做成可审计闭环：不合格时禁止下道接收，并同步返工、CAPA 和标签状态。

## 产出

- 更新 `src/frontend/src/components/production/ProductionBoard.vue`
- 更新 `src/frontend/src/components/quality/QualityBoard.vue`
- 更新 `src/frontend/src/components/barcode/BarcodePrintBoard.vue`
- 更新 `src/frontend/tests/e2e/scanner.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `生产报工` 的扫码完工在 `inspectionResult !== Pass` 或不良数量大于 0 时不再生成 `HANDOFF` 交接。
- 不合格质量门写入：
  - 阶段：`质量门`
  - 标题：`WO-RUSH-9001 CNC 精加工 首件巡检待复核`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-QUALITY`
  - 状态：`质量门待复核`
- 同步生成返工冻结证据：
  - 阶段：`扫码返工`
  - 标题：`WO-RUSH-9001 CNC 精加工 扫码返工冻结`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-REWORK`
  - 状态：`返工待复验`
- 同步冻结下道接收：
  - 阶段：`交接冻结`
  - 标题：`WO-RUSH-9001 OP-10 到 OP-20 交接冻结`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-HOLD-OP-20`
  - 状态：`下道接收冻结`
- 同步生成扫码 CAPA：
  - 阶段：`质量CAPA`
  - 标题：`WO-RUSH-9001 CNC 精加工 扫码 CAPA 处置`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-CAPA`
  - 状态：`CAPA 待验证`
- 同步更新实物流转卡标签状态：
  - 阶段：`标签状态`
  - 标题：`WO-RUSH-9001 流转卡标签冻结`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-LABEL-HOLD`
  - 状态：`质量冻结标签已更新`
- `质量闭环` 的扫码质量门面板可回放质量门、扫码返工、交接冻结、CAPA 和标签状态。
- `条码 / QR 打印` 的 `WO-RUSH-9001` 工单标签卡可读取同一 `标签状态` 证据，显示质量冻结标签追踪编号。
- `报表中心` 和 `审计日志` 继续复用统一 OTD 证据链，可回放返工冻结和标签状态。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/scanner.spec.ts --grep "质检不合格"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/barcode.spec.ts tests/e2e/scanner.spec.ts tests/e2e/production.spec.ts tests/e2e/quality.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts`，exit code 0，45 passed + 1 flaky retry passed。
- 通过：`npm run test:e2e -- tests/e2e/production.spec.ts --grep "风险预警处置队列"`，1 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

已在 `20260521-p3-barcode-rework-release.md` 继续完成返工复验后的释放闭环：质量复验通过后解冻标签、释放 `OP-20` 接收、回写排产窗口，并在审计回放中保留冻结到释放的状态转换。
