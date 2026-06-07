# 2026-06-05 ChatPanel Navigation Fail-loud Changelog

## Plain Navigation Slice

- 选片依据：`ChatPanel.vue` 当前仍是低覆盖且用户必经的助手入口，普通导航动作的失败兜底比继续榨已覆盖的特例包更有杠杆。
- 问题：普通 `navigate` / `schedule_suggestion` 动作在 `router.push()` 失败时会直接抛错，没有显式告警。
- 风险：用户会误以为只是按钮没反应，助手会在导航失败时表现成沉默崩溃，而不是可见的动作失败。
- 修复：为普通导航动作增加 `try/catch`，导航失败时输出 `role="alert"` 的页面跳转失败提示。
- 行为保持：不改动作生成逻辑、不改成功跳转路径、不改特例包的既有成功/失败文案。
- 测试：新增 unit，覆盖普通导航动作 `router.push()` 失败时显示 assertive alert，并确认路由调用仍发生过。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`35 tests passed`。
- 验证：`npm run test:unit` 通过，`83 files / 496 tests passed`。
- 验证：`npm run lint` 通过。
- 验证：`npm run build` 通过。

## Release Boundary

- 本片属于 A-track 助手普通导航可靠性修复。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测结果替代。
