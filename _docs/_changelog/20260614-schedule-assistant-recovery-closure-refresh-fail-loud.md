# 2026-06-14 排产 Assistant 恢复交接闭环刷新 Fail-Loud

## 变更
- `queryAssistantRecoveryPackages` 支持 `failLoud` 读取模式，默认仍保持旧的空数组兜底。
- `readAssistantRecoveryPackagesBackendFirst` 支持 `failLoud`，并合并后端与本地恢复交接包，避免后端返回空集合时误丢本地闭环建议。
- `ScheduleBoard.vue` 在确认执行 Assistant 恢复交接闭环后，如果刷新恢复交接包失败，会保留本地闭环建议并显示失败原因。
- 新增单测覆盖 API、同步工具、排产页面闭环刷新失败路径。
- 新增 Chromium 真实浏览器用例覆盖后端 503 时本地闭环建议仍保留、页面明确提示刷新失败。

## 验证
- GREEN：`npm run test:unit -- tests/unit/assistant-evidence-api.test.ts`，3 passed。
- GREEN：`npm run test:unit -- tests/unit/assistant-action-package-sync.test.ts`，7 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，29 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "Assistant 恢复交接闭环刷新失败"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，43 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 696 tests passed，lines 83.24%，`ScheduleBoard.vue` lines 77.14%。

## 范围
- 本轮继续深挖现有排产关键路径，不新增业务功能范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前推进阻塞项。
