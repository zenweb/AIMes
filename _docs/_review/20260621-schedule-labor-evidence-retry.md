# Review - Schedule Labor Evidence Retry

## Findings

- 未发现新的阻断问题。

## Evidence

- 选择依据：当前覆盖率摘要中 `ScheduleBoard.vue` 是核心组件里最低行覆盖率之一；排产页也是用户必经核心路径。
- 单测新增了人员证据启动失败后的可恢复动作，覆盖失败可见、重试按钮、后端读回成功和事件队列恢复。
- 相关回归：排产、员工、路由登录组合测试 127/127 通过。

## Residual Risk

- 本轮是单元层证据，尚未跑排产真实浏览器全文件。
- 后端真实环境仍可能缺少 `WO-013` 生产扫描/人员证据 seed；若后端无数据，UI 会继续 fail loud 并允许重试。
- 严格 v1.0.0 发布仍需要 hosted CI 覆盖当前 dirty worktree 和灰度观察结论。
- 2026-06-21 focused real-browser retry evidence 已通过；该用例现在覆盖首次人员证据 503、warning、重试按钮、二次读回放行证据、事件队列恢复和甘特图渲染。
- 小范围 `-g "人员"` 仍有两个相邻旧用例失败，失败点是默认 employee/scheduling live mock 未覆盖 `/employee`、`/llm/status`、`/dashboard`、`/risk/dashboard` 等启动请求导致 auth 清理；不属于本 focused 切片新增回归，但需要后续 fixture 化。
- 2026-06-21 后续复核：两个相邻旧人员用例已修复并通过；根因分别是 offline-demo 人员复核 fail-loud 未回落本地证据、以及测试在无 origin 文档上直接访问 `localStorage`。
- 员工离线入口 2/2 通过，确认用户可见层不暴露 `Offline demo mode skipped backend request`。

## Release-Candidate Boundary

- PASS for local slice readiness only: `_docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.md` identifies a bounded candidate set.
- Hosted CI has not yet covered this dirty slice. The next reviewer action is staged diff review followed by a push and SHA-pinned CI evidence.
- Risk: `ScheduleBoard.vue` has broad historical dirty changes, so staged review must verify only intended labor-evidence behavior is included.
- Recheck risk: code diff for the three candidate code files is currently large (`3691 insertions / 89 deletions`), mainly in `scheduling.spec.ts`; do not treat the current file set as push-ready until unrelated E2E work is split or explicitly accepted.
- Theme decomposition now identifies at least five mixed topics: labor evidence retry, real dhtmlx drag writeback, multi-objective feedback readback, Assistant/engineering fail-loud, and guidance links. Only the first should be in the first release-candidate slice.
