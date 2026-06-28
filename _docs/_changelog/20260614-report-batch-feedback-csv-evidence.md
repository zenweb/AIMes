# 2026-06-14 报表批量采纳 CSV 证据

## 变更
- 补充 `report.spec.ts` 真实 Chromium 断言，验证批量对比采纳 snapshot 不只进入页面 OTD 钻取，也进入 CSV 导出。
- CSV 必须包含 `OTD经营钻取`、`人工采纳 / 批量对比采纳是否已进入 OTD 复盘？`、核对批量采纳记录的下一步动作和 `TRACE-SCH-FEEDBACK-BATCH-balanced`。
- 当前生产代码已通过 `otdDrilldownItems` 导出该链路，本片无需修改 `ReportBoard.vue`。

## 验证
- GREEN：`npm run test:e2e -- tests/e2e/report.spec.ts --project=chromium -g "OTD 证据链消费批量对比采纳 feedback snapshot"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/report.spec.ts --project=chromium`，19 passed。
- GREEN：`npm run test:unit -- tests/unit/report-board.test.ts`，14 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 737 tests passed，lines 83.5%，`ReportBoard.vue` lines 77.18%。

## 范围
- 继续精品化现有排产采纳到报表导出的复盘链路，不新增业务功能。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
