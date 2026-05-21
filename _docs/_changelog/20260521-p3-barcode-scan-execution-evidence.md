# 2026-05-21 P3 — 条码扫码现场执行证据

## 触发

深化计划中 P3 “条码”已把扫码从查询工具升级为现场入口，但扫码后仍主要停留在导航，缺少“现场确实执行/复核过”的可审计证据。本次把扫码动作接入统一 OTD 证据链，让条码成为现场执行留痕入口。

## 产出

- 新增 `src/frontend/src/utils/barcode-scan-evidence-sync.ts`
- 更新 `src/frontend/src/components/scanner/ScannerBoard.vue`
- 更新 `src/frontend/src/components/barcode/BarcodePrintBoard.vue`
- 更新 `src/frontend/tests/e2e/scanner.spec.ts`
- 更新 `src/frontend/tests/e2e/barcode.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `条码扫描` 扫到工单、设备或物料后，新增“现场执行证据”确认区。
- 点击“确认并写入证据链”会生成本地扫码证据，并同步写入统一 `aimes_otd_evidence_chain`：
  - `WO-RUSH-9001` 生成 `TRACE-QR-WO-RUSH-9001-ARRIVAL`，阶段为 `扫码执行`，下一核对点为生产报工开工校验。
  - `CNC-01` 生成 `TRACE-QR-CNC-01-CHECK`，用于设备点检入口确认。
  - `M-AL-6061` 生成 `TRACE-QR-M-AL-6061-KIT`，用于物料批次与齐套复核。
- `条码 / QR 打印` 的现场追溯标签批次同步展示这些 `TRACE-QR-*` 追踪编号，打印前即可知道扫码确认后会进入哪条审计链。
- `报表中心` 直接通过统一 OTD 证据链展示 `扫码执行` 记录。
- `审计日志` AI 决策回放复用 OTD 证据链，能回放扫码阶段、对象、来源、追踪编号和 CSV/报表核对点。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/barcode.spec.ts tests/e2e/scanner.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts --grep "条码|扫码|OTD 复盘证据链|回放统一"`，7 passed。
- 通过：`npm run test:e2e -- tests/e2e/barcode.spec.ts tests/e2e/scanner.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts`，20 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

已在 `20260521-p3-barcode-production-start-context.md` 补上扫码到 `生产报工` 开工上下文。后续继续把扫码开工后的完工、异常上报和物料批次消耗联动起来。
