# 2026-06-06 ChatPanel 等待回复状态 Next Actions

## 下一步

- 继续按覆盖率杠杆选择低覆盖且用户必经的现有组件。
- ChatPanel 已有大量业务路径测试；后续应先和 `AuditDecisionReplayPanel.vue`、`AnomalyBoard.vue`、`ProductionBoard.vue`、`ScheduleBoard.vue` 比较边际收益。
- 避免继续精修已经覆盖充分的 ChatPanel 微状态，除非发现真实 correctness / reliability 缺口。

## B 轨道

- GitHub remote/Actions run evidence 仍缺。
- Docker Hub 依赖镜像拉取通道仍不可用，PostgreSQL/staging 未通过。
- Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天观察窗口仍未关闭。
