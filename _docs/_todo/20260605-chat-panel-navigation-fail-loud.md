# 2026-06-05 ChatPanel Navigation Fail-loud Next Actions

## Done

- 已完成：`ChatPanel.vue` 普通导航动作 fail loud。
- 已完成：新增 unit 覆盖普通导航失败告警。
- 已完成：`npm run test:unit -- tests/unit/chat-panel.test.ts`、`npm run test:unit`、`npm run lint`、`npm run build` 通过。

## Continue

- 继续：按覆盖率杠杆选择其它更低覆盖且用户必经的组件或剩余 action 分支，不继续回到已收口的普通导航失败点。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 当前 `gh` 已登录；GitHub repo/remote 仍需确认绑定状态。
