# 2026-06-14 排产 Assistant 恢复闭环本地保存 Fail-Loud

## 变更
- `ScheduleBoard.vue` 在 Assistant 恢复交接闭环本地保存失败时追加用户可见反馈。
- 闭环目标包缺失或本地持久化返回空值时，不再静默返回。
- 反馈文案包含失败场景和执行包 ID，方便调度员定位是哪张恢复执行包未能闭环。
- 真实浏览器用例新增“后端有恢复包、本地没有闭环记录”的路径，验证按钮点击后会明确提示原因，且不会生成错误的闭环复核建议。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "assistant recovery handoff closure cannot be persisted locally"` 曾失败，证明旧逻辑没有 `.sync-note`。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "assistant recovery handoff closure cannot be persisted locally"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，31 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，44 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 700 tests passed，lines 83.25%，`ScheduleBoard.vue` lines 77.34%。

## 范围
- 继续深挖现有排产 Assistant 恢复交接闭环，不扩新功能。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
