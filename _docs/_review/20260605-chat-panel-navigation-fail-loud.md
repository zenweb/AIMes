# 2026-06-05 ChatPanel Navigation Fail-loud Review

## Findings

- 审计结论：本片补上了 `ChatPanel.vue` 普通导航动作失败的可见告警。
- 行为覆盖：`router.push()` 失败时，普通导航动作不再沉默崩溃，而是以 assertive alert 显示“页面跳转失败”。
- 范围控制：只改普通 `navigate` / `schedule_suggestion` 路径，没有动特例包的成功/失败处理。
- TDD 证据：新增 unit 直接覆盖 `打开风险预警` 的普通导航失败场景，并断言 alert 文案和 route 调用。
- 验证证据：目标 unit `35 tests passed`；全量前端 unit `83 files / 496 tests passed`；`npm run lint` 和 `npm run build` 通过。

## Residual Risk

- `ChatPanel.vue` 仍有许多 action 分支可继续审计，但不应在已经收口的导航失败点上无限微切片。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据。
