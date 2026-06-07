# 2026-06-06 ScheduleBoard 排产优化失败 Review

## Findings

- 未发现本片新增阻断问题。
- 真实浏览器验证了排产优化接口失败时的用户可见告警和当前甘特图保留。
- 产品代码已有正确 fail-loud 行为，本片只补 Chromium 证据。

## Residual Risk

- 本片只跑目标 e2e，未跑整份 `scheduling.spec.ts`。
- `ScheduleBoard.vue` 仍是低分支覆盖组件；后续应优先选择真实用户可感知的失败态，不继续重复已通过路径。
- B 轨发布闸门仍失败：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察证据未齐。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "排产优化失败"`：Chromium 1/1 passed。
