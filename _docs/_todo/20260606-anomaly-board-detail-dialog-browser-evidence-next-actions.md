# 2026-06-06 AnomalyBoard 异常详情 Dialog Next Actions

## 下一步

- 继续按覆盖率杠杆选择低覆盖且用户必经的现有组件。
- AnomalyBoard 本片已覆盖详情抽屉基础语义；后续应优先比较 `ProductionBoard.vue`、`ScheduleBoard.vue` 等低覆盖关键路径。
- 避免继续精修异常管理微状态，除非发现真实 correctness / reliability 缺口。

## B 轨道

- 配置 GitHub remote 或提供 Actions RunUrl/RunId/job summary evidence。
- 准备 staging rehearsal 依赖镜像或可用 registry/proxy。
- Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天观察窗口仍未关闭。
