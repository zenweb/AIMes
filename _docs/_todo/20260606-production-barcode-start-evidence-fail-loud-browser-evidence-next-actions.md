# Next Actions: ProductionBoard 扫码开工证据失败

日期：2026-06-06

## A 轨道

- [ ] 继续按覆盖率杠杆选择低覆盖且用户必经组件。
- [ ] 如继续生产开工路径，优先考虑人员替班证据归档失败的真实 Chromium 证据，而不是重复扫码开工 happy path。
- [ ] 评估是否将 `tests/e2e/**/*.ts` 纳入 ESLint 配置，补齐 e2e 静态检查证据。
- [ ] 下一个候选可比较：`AuditDecisionReplayPanel.vue`、`EquipmentScheduleImpactPanel.vue`、`ProductionExecutionTracePanel.vue`、`ChatPanel.vue`。

## B 轨道

- [ ] 补 hosted CI 的 GitHub run URL / run id / job summary。
- [ ] 补 PostgreSQL/staging rehearsal 证据。
- [ ] 补 Attack Chain A/B/C 人工 verifier 与 `VerifiedAt`。
- [ ] 补授权安全签字。
- [ ] 完成首次灰度与 14 个自然日 P0/P1=0 观察窗口。
