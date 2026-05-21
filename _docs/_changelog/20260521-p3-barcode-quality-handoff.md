# 2026-05-21 P3 — 条码质量门与工序交接

## 触发

扫码流转卡已覆盖到达、开工、完工、物料批次消耗和异常分流，但“完工后是否通过首件/巡检质量门、是否能交给下道工序”仍缺少明确证据。本次把扫码完工继续推进到质量闭环和工序交接。

## 产出

- 更新 `src/frontend/src/components/production/ProductionBoard.vue`
- 更新 `src/frontend/src/components/quality/QualityBoard.vue`
- 更新 `src/frontend/tests/e2e/scanner.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `生产报工` 的扫码完工会自动写入 `质量门` 证据：
  - 阶段：`质量门`
  - 标题：`WO-RUSH-9001 CNC 精加工 首件巡检放行`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-QUALITY`
  - 状态：`首件巡检已放行`
- 同一次扫码完工会自动写入下道工序交接证据：
  - 阶段：`工序交接`
  - 标题：`WO-RUSH-9001 OP-10 到 OP-20 扫码交接`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-HANDOFF-OP-20`
  - 状态：`OP-20 待接收开工`
- `生产报工` 的执行闭环增加 `质量门 / 首件巡检 / 工序交接` 标签，扫码流转卡面板显示质量门与下道接收追踪编号。
- `质量闭环` 新增“扫码质量门：首件巡检与工序交接”回放区，直接读取统一 OTD 证据链中的扫码质量门和工序交接记录。
- `报表中心` 和 `审计日志` 继续复用统一 OTD 证据链，能回放质量门和交接证据。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/scanner.spec.ts --grep "扫码工单带入生产报工"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/barcode.spec.ts tests/e2e/scanner.spec.ts tests/e2e/production.spec.ts tests/e2e/quality.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts`，45 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

已在 `20260521-p3-barcode-quality-rework-freeze.md` 补上扫码质量门不合格分流、交接冻结、CAPA 和实物标签冻结。后续继续向返工复验后释放交接、标签解冻和下道接收确认扩展。
