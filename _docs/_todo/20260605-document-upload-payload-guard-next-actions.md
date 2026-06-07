# 2026-06-05 Todo - Document Upload Payload Guard Next Actions

## Next A-track Slice

- 继续按覆盖率增量选择低覆盖且用户必经组件。
- 当前候选：
  - `DocumentUpload.vue`：行覆盖率 `65.80%`，可继续覆盖导入证据坏载荷和质量知识版本坏载荷。
  - `AuditDecisionReplayPanel.vue`：分支覆盖率 `14.86%`，审计回放坏载荷仍可加强。
  - `ScheduleBoard.vue`：分支覆盖率 `32.19%`，排产主链路仍有异步分支风险。
  - `ChatPanel.vue`：行覆盖率 `61.86%`，本轮已连续收口聊天历史和知识问答坏载荷，短期不继续精修。
- 不继续精修 `LoginPage.vue`，除非出现新的真实用户风险。

## B-track Gate

- GitHub hosted CI 仍需 GitHub repo/remote URL 后才能推进。
- staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍需独立证据。
