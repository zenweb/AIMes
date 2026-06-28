# 2026-06-14 报表消费批量采纳 feedback snapshot 证据

## 变更
- 补充 `report-board.test.ts`，锁定报表中心在 backend feedback 不可用时会消费批量对比采纳 snapshot。
- 补充 `report.spec.ts` 真实 Chromium 场景：写入 `aimes_schedule_feedback_snapshot` 后刷新报表页，OTD 证据链必须展示批量采纳证据卡。
- 当前生产逻辑已能通过 `scheduleFeedback` fallback 映射 `人工采纳` 证据卡，本片无需修改 `ReportBoard.vue`。

## 验证
- GREEN：`npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces batch objective adoption snapshots"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/report.spec.ts --project=chromium -g "OTD 证据链消费批量对比采纳 feedback snapshot"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/report-board.test.ts`，14 passed。
- GREEN：`npm run test:e2e -- tests/e2e/report.spec.ts --project=chromium`，19 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 737 tests passed，lines 83.47%，`ReportBoard.vue` lines 76.72%。

## 范围
- 继续精品化现有排产采纳到报表 OTD 复盘链路，不新增业务功能。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
