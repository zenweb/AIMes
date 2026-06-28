# 2026-06-14 报表后端导出边界提示

## 变更
- 在报表中心导出按钮旁补充边界说明：本地采纳证据随 CSV 导出，Excel/PDF 为后端报表快照。
- Excel/PDF 导出请求成功后保留 fail-loud 提示，明确本地批量采纳证据应使用 CSV 导出。
- 补充单测和真实 Chromium 断言，验证批量对比采纳 snapshot 场景下 CSV 含本地证据，Excel 点击不会静默暗示包含本地证据。

## 验证
- GREEN：`npm run test:unit -- tests/unit/report-board.test.ts`，15 passed。
- GREEN：`npm run test:e2e -- tests/e2e/report.spec.ts --project=chromium -g "OTD 证据链消费批量对比采纳 feedback snapshot"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/report.spec.ts --project=chromium`，19 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 738 tests passed，lines 83.5%，`ReportBoard.vue` lines 77.18%。

## 范围
- 只精品化现有报表导出链路的语义边界，不把 Excel/PDF 改造成前端本地证据导出。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
