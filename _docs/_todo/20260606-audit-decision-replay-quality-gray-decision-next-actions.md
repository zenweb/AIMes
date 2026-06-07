# 2026-06-06 审计回放质量灰度决策下一步

## Done

- 已完成：补质量灰度回滚决策默认选中回放链单测。
- 已完成：补质量灰度决策坏载荷 fail-loud 单测。
- 已完成：跑通 AuditDecisionReplayPanel 定向单测、全量前端 coverage 和真实 Chromium `audit.spec.ts`。

## Next

- 继续按覆盖率杠杆选择用户必经、低覆盖、业务关键组件。
- `AuditDecisionReplayPanel.vue` 分支覆盖仍低，后续可继续审计 OTD 证据分类、质量实验候选、知识治理或业务落库跳转分支；但下一片应先与 `ScheduleBoard.vue`、`ChatPanel.vue`、`DocumentUpload.vue` 等组件比较边际收益。
- 不用前端覆盖率提升替代发布 B 轨门禁。

## B-track

- 仍需真实 GitHub Actions run、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
