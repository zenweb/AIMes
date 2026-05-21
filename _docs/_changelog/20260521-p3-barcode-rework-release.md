# 2026-05-21 P3 — 条码返工复验释放闭环

## 触发

上一轮已把扫码质检不合格做成返工冻结：`Rework / Fail` 会冻结 `OP-20` 接收、生成 CAPA，并把实物流转卡标签写成质量冻结状态。本次补齐后半段：复验通过后必须释放交接、解冻标签、回写排产窗口，并让报表与审计能看到冻结到释放的状态转换。

## 产出

- 更新 `src/frontend/src/components/quality/QualityBoard.vue`
- 更新 `src/frontend/src/components/barcode/BarcodePrintBoard.vue`
- 更新 `src/frontend/tests/e2e/scanner.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`
- 更新 `_docs/_changelog/20260521-p3-barcode-quality-rework-freeze.md`

## 功能

- `质量闭环` 的扫码质量门面板新增返工复验放行横幅：
  - 冻结未释放时显示 `返工复验待放行`
  - 点击 `复验通过并释放交接` 后显示 `返工复验已放行`
- 放行时关闭原有冻结证据：
  - `TRACE-QR-WO-RUSH-9001-OP-10-REWORK`：状态更新为 `返工复验已通过`
  - `TRACE-QR-WO-RUSH-9001-OP-10-HOLD-OP-20`：状态更新为 `交接冻结已释放`
  - `TRACE-QR-WO-RUSH-9001-OP-10-CAPA`：状态更新为 `CAPA 已验证`
  - `TRACE-QR-WO-RUSH-9001-OP-10-LABEL-HOLD`：状态更新为 `冻结标签已解除`
- 放行时新增释放证据：
  - 阶段：`质量复验`
  - 标题：`WO-RUSH-9001 CNC 精加工 返工复验放行`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-RECHECK`
- 同步释放下道接收：
  - 阶段：`交接释放`
  - 标题：`WO-RUSH-9001 OP-20 接收已释放`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20`
  - 状态：`OP-20 可接收`
- 同步回写排产窗口：
  - 阶段：`排产回写`
  - 标题：`WO-RUSH-9001 OP-20 接收窗口已恢复`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE`
  - 状态：`后段可排`
- 同步解冻实物流转卡标签：
  - 阶段：`标签状态`
  - 标题：`WO-RUSH-9001 流转卡标签已解冻`
  - 追踪编号：`TRACE-QR-WO-RUSH-9001-OP-10-LABEL-RELEASE`
  - 状态：`质量冻结已解除`
- `条码 / QR 打印` 读取 `标签状态` 时改为按最新时间选择，确保复验放行后优先展示解冻标签，而不是旧冻结标签。
- `报表中心` 和 `审计日志` 继续复用统一 OTD 证据链，可回放质量复验、交接释放、排产回写和标签解冻。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/scanner.spec.ts --grep "质检不合格"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/barcode.spec.ts tests/e2e/scanner.spec.ts tests/e2e/production.spec.ts tests/e2e/quality.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts`，46 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

已在 `20260521-p3-barcode-schedule-release-sync.md` 继续把 `排产回写` 从报表/审计证据推进到 `AI 排产` 事件队列。后续再沿着条码闭环向“现场异常隔离 / 返工工时成本 / 质量知识库复用”扩展，让扫码质量事件不仅能冻结和释放，还能沉淀为后续排产与 CAPA 推荐的训练样本。
