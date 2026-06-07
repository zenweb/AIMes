# Next Actions: Audit Replay 业务落库审计详情

日期：2026-06-06

## A 轨道

- [x] 继续按覆盖率杠杆选择下一个低覆盖且用户必经组件：继续追 `AuditDecisionReplayPanel.vue`。
- [ ] `AuditDecisionReplayPanel.vue` 分支覆盖仍低，后续可继续检查 POC、知识治理、质量灰度回放的真实浏览器失败态。
- [ ] 避免重复验证已有单元测试覆盖且用户不可感知的 mapper 分支。

## B 轨道

- [ ] 补 hosted CI 的 GitHub run URL / run id / job summary。
- [ ] 补 PostgreSQL/staging rehearsal 证据。
- [ ] 补 Attack Chain A/B/C 人工 verifier 与 `VerifiedAt`。
- [ ] 补授权安全签字。
- [ ] 完成首次灰度与 14 个自然日 P0/P1=0 观察窗口。
