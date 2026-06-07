# 2026-06-06 ScheduleBoard 设备列表 HTML fallback Review

## Findings

- 已修复：真实浏览器中设备接口返回 HTML fallback 时，排产页原先只显示底层 `/equipment` 错误，缺少“设备列表载荷不完整”的业务上下文。
- 未发现本片新增阻断问题。
- 变更范围收敛在 `ScheduleBoard.vue` 初始化设备列表依赖和一条 e2e 用例。

## Residual Risk

- 本片只跑目标单测和目标 e2e，未跑整份 `scheduling.spec.ts`。
- `ScheduleBoard.vue` 仍是低分支覆盖组件；后续应优先选择真实用户可感知的失败态，不继续重复已通过路径。
- B 轨发布闸门仍失败：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察证据未齐。

## Verification

- `npm.cmd run test:unit -- tests/unit/schedule-board.test.ts -t "equipment page payload"`：1 passed，20 skipped。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "设备列表返回 HTML fallback"`：RED 后 GREEN，最终 Chromium 1/1 passed。
