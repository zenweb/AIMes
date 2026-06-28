# 2026-06-14 排产外协释放缺失承诺包 Fail-Loud

## 变更
- `ScheduleBoard.vue` 在外协到货建议被采纳后，如果本地排产释放确认返回空值，会展示用户可见反馈。
- 失败反馈包含“释放审计未归档”、缺失原因和 `sourceKpiId`，避免调度员误以为外协释放已进入 OTD 证据链。
- 新增单测覆盖 `confirmOutsourcingScheduleRelease` 返回 `null` 的路径。
- 新增 Chromium 真实浏览器用例：页面先展示外协到货事件，点击采纳前移除本地承诺包，验证释放归档失败提示可见且不会生成“外协排产释放已确认”建议。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "outsourcing schedule release cannot find"` 曾失败，旧逻辑只显示“反馈已同步后台”。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "outsourcing schedule release cannot find"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，32 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，45 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 701 tests passed，lines 83.25%，`ScheduleBoard.vue` lines 77.41%。

## 范围
- 继续深挖现有排产外协释放闭环，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
