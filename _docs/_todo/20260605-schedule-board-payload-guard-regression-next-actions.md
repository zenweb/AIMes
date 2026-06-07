# 2026-06-05 Todo - ScheduleBoard Payload Guard Regression Next Actions

## Next A-track Slice

- 继续按覆盖率增量选择低覆盖且用户必经组件。
- 当前候选：`ChatPanel.vue` 行覆盖率 `61.34%`，`DocumentUpload.vue` 行覆盖率 `64.89%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `63.28%`，`ScheduleBoard.vue` 分支覆盖率 `32.19%`。
- 不继续精修 `LoginPage.vue`，除非出现新的真实用户风险。

## B-track Gate

- 当前 `origin` 仍是 `https://git.code.tencent.com/zenweb/AIMes.git`。
- GitHub hosted CI 仍需 GitHub repo/remote URL 后才能触发真实 Actions run。
- staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍需独立证据。
