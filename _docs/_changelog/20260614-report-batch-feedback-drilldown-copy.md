# 2026-06-14 报表批量采纳证据钻取文案

## 变更
- `ReportBoard.vue` 的 OTD 证据钻取详情现在显式展示当前证据的业务问题。
- `人工采纳` / `schedule-feedback` 证据不再复用通用 `Agent 推荐为什么能提升 OTD？`，会按来源显示专属问题。
- 批量对比采纳 snapshot 显示为 `批量对比采纳是否已进入 OTD 复盘？`。
- 下一步动作改为核对批量采纳记录的目标、原因和 traceId 是否已同步到 OTD 证据链。

## 验证
- RED：`npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces batch objective adoption snapshots"` 曾失败，页面仍显示通用 `Agent 推荐为什么能提升 OTD？`。
- GREEN：`npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces batch objective adoption snapshots"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/report.spec.ts --project=chromium -g "OTD 证据链消费批量对比采纳 feedback snapshot"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/report-board.test.ts`，14 passed。
- GREEN：`npm run test:e2e -- tests/e2e/report.spec.ts --project=chromium -g "OTD 经营复盘支持按证据钻取解释和跳转"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/report.spec.ts --project=chromium`，19 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 737 tests passed，lines 83.5%，`ReportBoard.vue` lines 77.18%。

## 范围
- 继续精品化现有排产采纳到报表 OTD 复盘链路，不新增业务功能。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
