# 2026-06-06 ScheduleBoard 批量方案反馈同步失败 Review

## Findings

- 未发现本片新增阻断问题。
- 真实浏览器验证了多目标对比采用方案、反馈接口 503、状态提示 fail-loud、本地目标切换保留。
- 拖拽保存失败暂不作为本轮浏览器切片，因为当前 e2e 轻量甘特模式无法提供真实拖拽事件源。

## Residual Risk

- 本片只跑目标 e2e，未跑整份 `scheduling.spec.ts`。
- `ScheduleBoard.vue` 仍是大型组件，后续应继续按真实 UI 路径和用户关键失败态选片。
- B 轨发布闸门仍失败：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察证据未齐。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "批量方案反馈同步失败"`：Chromium 1/1 passed。
