# 2026-06-06 QualityReworkImpactPanel 返工动作语义 Next Actions

## 下一步

- 继续按覆盖率杠杆选择低覆盖且用户必经的现有组件。
- 质量返工和 MRB 两条质量闭环关键动作语义已补证据；后续应优先比较 `AuditDecisionReplayPanel.vue`、`AnomalyBoard.vue`、`ProductionBoard.vue`、`ScheduleBoard.vue` 等低覆盖关键路径。
- 避免继续精修返工面板微状态，除非发现真实 correctness / reliability 缺口。

## B 轨道

- GitHub remote/Actions run evidence 仍缺。
- Docker Hub 依赖镜像拉取通道仍不可用，PostgreSQL/staging 未通过。
- Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天观察窗口仍未关闭。
