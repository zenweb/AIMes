# Next Actions: ScheduleBoard 外协排产释放证据

日期：2026-06-06

## A 轨道

- [ ] 继续按覆盖率杠杆选择下一个低覆盖且用户必经组件。
- [ ] 优先考虑 `AuditDecisionReplayPanel.vue`、`ChatPanel.vue`、`AnomalyBoard.vue` 等低覆盖且发布/用户关键路径。
- [ ] 如需继续 ScheduleBoard，优先选择未覆盖且高风险的失败态或审计闭环，不再为已证明链路反复堆微切片。
- [ ] 评估是否把 `tests/e2e/**/*.ts` 纳入 ESLint 配置；当前 e2e 只能靠 Playwright 编译与运行暴露语法/类型问题。

## B 轨道

- [ ] 补 hosted CI 的 GitHub run URL / run id / job summary。
- [ ] 补 PostgreSQL/staging rehearsal 证据。
- [ ] 补 Attack Chain A/B/C 人工 verifier 与 `VerifiedAt`。
- [ ] 补授权安全签字。
- [ ] 完成首次灰度与 14 个自然日 P0/P1=0 观察窗口。
