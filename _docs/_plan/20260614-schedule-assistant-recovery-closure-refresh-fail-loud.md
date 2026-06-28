# 2026-06-14 Plan - 排产 Assistant 恢复交接闭环刷新 Fail-Loud

## 成功标准
- 后端恢复交接包刷新失败时，用户能看到明确失败原因。
- 本地闭环建议不丢失。
- 默认读取路径保持兼容，不扩大异常抛出范围。
- 单测、真实浏览器 e2e、coverage 全部通过。

## 执行
- 在 API 层增加可选 `failLoud` 参数。
- 在同步工具层透传 `failLoud`，并保留默认兜底行为。
- 在 `ScheduleBoard.vue` 闭环后刷新恢复交接包时启用 `failLoud`。
- 增加 API、同步工具、组件、真实浏览器测试。

## 验证
- `npm run test:unit -- tests/unit/assistant-evidence-api.test.ts`
- `npm run test:unit -- tests/unit/assistant-action-package-sync.test.ts`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 决策
- 不等待 15 天灰度观察；该步骤已按 owner 指令跳过/延期。
- 不扩展新功能，只硬化现有排产闭环体验与可观察性。
