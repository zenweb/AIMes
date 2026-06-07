# Next Actions: Audit Replay 质量再训练版本失败态

日期：2026-06-06

## A 轨道

- [ ] 继续按覆盖率杠杆选择下一个低覆盖且用户必经组件。
- [ ] `AuditDecisionReplayPanel.vue` 已补质量推荐反馈、质量再训练版本、质量灰度决策三条后端失败态；后续应转向其他仍低覆盖且用户关键的审计回放分支。
- [ ] 避免继续精修已被完整通过路径覆盖的登录页和纯 mapper 分支。

## B 轨道

- [ ] 补 hosted CI 的 GitHub run URL / run id / job summary。
- [ ] 补 PostgreSQL/staging rehearsal 证据。
- [ ] 补 Attack Chain A/B/C 人工 verifier 与 `VerifiedAt`。
- [ ] 补授权安全签字。
- [ ] 完成首次灰度与 14 个自然日 P0/P1=0 观察窗口。
