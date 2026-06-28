# 2026-06-14 排产后端反馈可审计校验

## 变更
- 排产页恢复最近反馈时校验后端最新反馈是否可审计。
- 后端反馈缺少决策、分类、原因、目标或时间等关键字段时，不覆盖页面；改为回退本地有效 snapshot。
- 反馈面板通过 `sync-note` fail-loud 展示缺失字段，例如 `后端最新采纳反馈不可审计，缺少原因说明，已回退本地最近反馈。`
- 扩展真实 Chromium 用例，覆盖有效后端优先、无效后端回退本地、不可审计提示三种状态。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "falls back to the local snapshot"`，旧逻辑错误展示不可审计后端反馈。
- GREEN：同一目标单测通过。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，39 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`，1 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 741 tests passed，lines 83.52%，`ScheduleBoard.vue` lines 78.3%。

## 范围
- 精品化现有排产反馈证据链，不新增排产功能。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
