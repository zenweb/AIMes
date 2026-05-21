# 2026-05-21 P3 — 条码生产完工与异常收尾证据

## 触发

上一轮已把 `WO-RUSH-9001` 扫码工单带入 `生产报工` 并生成 `生产开工` 证据，但现场执行链路仍停在开工。为了让扫码流转卡覆盖更真实的车间闭环，本次把开工后的完工报数、物料批次消耗和异常分流继续接入统一 OTD 证据链。

## 产出

- 更新 `src/frontend/src/components/production/ProductionBoard.vue`
- 更新 `src/frontend/tests/e2e/scanner.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `生产报工` 的“扫码流转卡”在扫码开工后展示两个现场动作：
  - `扫码完工报数`
  - `扫码异常上报`
- 点击 `扫码完工报数` 会打开完工确认弹窗，带入扫码工单、目标工序、推荐设备、推荐人员、扫码追踪和默认完工数量。
- 确认完工后写入统一 OTD 证据链：
  - 阶段：`扫码完工`
  - 标题：`WO-RUSH-9001 CNC 精加工 扫码完工报数`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-COMPLETE`
  - 状态：`扫码完工已确认`
- 同一次完工同步写入物料批次消耗证据：
  - 阶段：`物料消耗`
  - 标题：`WO-RUSH-9001 CNC 精加工 物料批次消耗`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-MATERIAL`
  - 状态：`批次消耗已绑定`
- 点击 `扫码异常上报` 会打开异常确认弹窗，默认带入扫码流转卡异常原因，并写入统一 OTD 证据链：
  - 阶段：`扫码异常`
  - 标题：`WO-RUSH-9001 CNC 精加工 扫码异常分流`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-ANOMALY`
  - 状态：`扫码异常待闭环`
- `报表中心` 和 `审计日志` 可回放扫码完工、物料批次消耗和扫码异常分流，让现场扫码从“导航入口”变成“到达、开工、完工、批次、异常”的完整执行证据。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/scanner.spec.ts --grep "扫码工单"`，2 passed。
- 通过：`npm run test:e2e -- tests/e2e/barcode.spec.ts tests/e2e/scanner.spec.ts tests/e2e/production.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts`，43 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

已在 `20260521-p3-barcode-quality-handoff.md` 补上扫码完工后的首件巡检质量门和下道工序交接。后续继续向返工闭环、实物标签状态回写和质检不合格分流扩展。
