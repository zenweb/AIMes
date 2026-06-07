# 2026-06-06 ScheduleEventQueuePanel 事件队列语义 Next Actions

## 下一步

- 继续按覆盖率杠杆选择低覆盖且用户必经的既有组件。
- 若继续排产域，可审计 Agent 多方案决策包 `scenario-row` 是否需要 list/listitem 语义和推荐方案可访问名称。
- 若排产域边际收益下降，转向当前覆盖率更低的用户关键组件，例如 ChatPanel、AnomalyBoard 或 EmployeeBoard 的未覆盖关键路径。

## 发布 B 轨道

- hosted CI release-level run URL/run id/job summary 仍缺。
- PostgreSQL/staging rehearsal 仍缺。
- Attack Chain A/B/C manual verifier + `VerifiedAt` 仍缺。
- Security signoff、首次灰度、14 天 P0/P1=0 观察窗口仍缺。
