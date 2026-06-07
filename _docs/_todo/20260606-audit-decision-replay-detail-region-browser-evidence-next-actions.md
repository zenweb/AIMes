# 2026-06-06 AuditDecisionReplayPanel 回放详情区 Next Actions

## 下一步

- 继续按覆盖率杠杆选择低覆盖且用户必经的现有组件。
- 审计回放本片已覆盖详情区命名 region；后续应优先比较 `AnomalyBoard.vue`、`ProductionBoard.vue`、`ScheduleBoard.vue` 等低覆盖关键路径。
- 避免继续精修审计回放微状态，除非发现真实 correctness / reliability 缺口。

## B 轨道

- GitHub remote/Actions run evidence 仍缺。
- Docker Hub 依赖镜像拉取通道仍不可用，PostgreSQL/staging 未通过。
- Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天观察窗口仍未关闭。
