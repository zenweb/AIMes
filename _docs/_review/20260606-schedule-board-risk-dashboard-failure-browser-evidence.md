# 2026-06-06 ScheduleBoard 风险看板读取失败 Review

## Findings

- 未发现本片新增阻断问题。
- 初次失败根因是测试没有提供排产计划和设备列表成功业务载荷，导致真实浏览器没有进入 `loadRiskTriggeredEvents()` 分支。
- 修正后，真实浏览器已验证风险看板 503 会展示用户可见状态，并保留本地事件队列。

## Residual Risk

- 本片只跑目标 e2e，未跑整份 `scheduling.spec.ts`。
- `ScheduleBoard.vue` 仍是大型组件，后续应继续按用户必经和真实失败态选片，不重复已通过路径。
- B 轨发布闸门仍失败：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察证据未齐。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "风险看板读取失败"`：Chromium 1/1 passed。
