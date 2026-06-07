# 2026-06-05 AI 助手生产执行证据 fallback 下一步

## Done

- 已完成：补 AI 助手 RAG fallback 读取最新生产完工/复核证据的单测。
- 已完成：补 AI 助手 RAG fallback 读取生产异常证据和 source trace 的单测。
- 已完成：跑通 ChatPanel 定向单测、全量前端 coverage 和真实 Chromium `chat.spec.ts`。

## Next

- 继续按覆盖率杠杆选择用户必经、低覆盖、业务关键组件。
- `ChatPanel.vue` 仍有较大未覆盖面；下一步可继续审计质量知识复用、MRB、POC/Hypercare 问答分支，或转向 `AdminBoard.vue` / `AuditDecisionReplayPanel.vue` 这类低分支覆盖组件。
- 不用前端覆盖率提升替代发布 B 轨门禁。

## B-track

- 仍需真实 GitHub Actions run、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
