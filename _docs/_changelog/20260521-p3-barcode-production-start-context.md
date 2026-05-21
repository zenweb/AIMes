# 2026-05-21 P3 — 条码到生产开工上下文

## 触发

上一轮已把条码扫描确认写入统一 OTD 证据链，但 `WO-*` 工单扫码后仍只是跳转到 `生产报工`，没有把扫码对象、目标工序、设备、人员和开工留痕串成一次完整现场动作。本次把扫码流转卡继续推进到开工确认。

## 产出

- 更新 `src/frontend/src/components/scanner/ScannerBoard.vue`
- 更新 `src/frontend/src/components/production/ProductionBoard.vue`
- 更新 `src/frontend/tests/e2e/scanner.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `条码扫描` 的工单上下文动作会携带 `scanCode` query 进入 `生产报工`，保留扫码对象上下文。
- `生产报工` 支持读取 `scanCode=WO-RUSH-9001`：
  - 自动补齐急单 demo 工单。
  - 自动选中 `WO-RUSH-9001`。
  - 展示“扫码流转卡”上下文，包含 `TRACE-QR-WO-RUSH-9001-ARRIVAL`、目标工序 `OP-10 CNC 精加工`、推荐设备 `CNC-002`、推荐人员 `张三 · EMP-001`。
- 点击“按扫码上下文开工”会打开开工确认弹窗，并带入推荐工位、设备、人员资质、SOP、质检点和物料齐套。
- 确认开工后写入统一 OTD 证据链：
  - 阶段：`生产开工`
  - 标题：`WO-RUSH-9001 CNC 精加工 扫码开工已确认`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-START`
  - 状态：`扫码开工已确认`
- `报表中心` 和 `审计日志` 可继续读取这条 `生产开工` 证据，形成扫码到开工的可回放链路。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/scanner.spec.ts --grep "扫码工单带入生产报工并生成开工证据"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/barcode.spec.ts tests/e2e/scanner.spec.ts tests/e2e/production.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts`，42 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

已在 `20260521-p3-barcode-production-closeout.md` 补上扫码开工后的完工报数、物料批次消耗和异常分流。后续继续向质量门、工序交接、返工闭环和实物标签状态回写扩展。
