# 2026-06-14 多目标方案缺少计划 Fail-Loud

## 变更
- `ScheduleBoard.vue` 的多目标方案采用流程改为先完成目标优化并拿到有效 `plan`，再切换当前目标、关闭对比弹窗、提交采纳反馈。
- 当多目标方案采用触发的优化接口返回 200 但缺少 `plan` 时，页面保留多目标对比弹窗和原优化目标。
- 该异常不再提交 `batch_optimize_apply` 采纳反馈，避免审计链记录一个实际没有落地的方案采用。
- 复用既有错误横幅展示 `优化失败: 后端优化结果缺少排产计划`。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "keeps batch objective adoption pending"` 曾失败，旧逻辑已经提交 `batch_optimize_apply` 且切换到 `balanced`。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "keeps batch objective adoption pending"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "batch objective"`，2 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "多目标方案优化缺少计划"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，35 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，48 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 704 tests passed，lines 83.25%，`ScheduleBoard.vue` lines 77.50%。

## 范围
- 继续深挖现有排产多目标对比采用路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
