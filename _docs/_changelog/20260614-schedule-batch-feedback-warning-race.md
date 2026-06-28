# 2026-06-14 批量方案采纳提示竞态修复

## 变更
- `ScheduleBoard.vue` 为排产状态写入增加 `scheduleStateVersion`。
- 初始 `loadData` 记录启动时的状态版本；如果用户已采纳批量对比方案，迟到的初始加载成功或失败结果不再覆盖当前排产状态。
- `handleOptimize` 成功应用新方案后递增状态版本，保护 `warnings`、排产计划、指标和甘特图数据不被旧请求回写。
- 补充单测复现“初始排产加载晚失败覆盖 `综合平衡方案已应用`”的竞态。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "keeps the applied compared plan warning"` 曾失败，旧逻辑将 `.warnings-bar` 覆盖为 `后端排产服务不可用...late initial schedule unavailable`。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "keeps the applied compared plan warning"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "announces batch objective feedback sync failures"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，36 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，79 passed，无 retry。
- GREEN：`npm run test:unit:coverage`，105 files / 736 tests passed，lines 83.47%，`ScheduleBoard.vue` lines 77.63%。

## 范围
- 继续精品化现有排产关键路径，专注批量对比采纳后的状态可信度。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
