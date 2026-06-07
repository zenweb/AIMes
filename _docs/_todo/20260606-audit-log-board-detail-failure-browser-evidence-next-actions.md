# 2026-06-06 AuditLogBoard 详情失败下一步

- 不重复切 `AuditDecisionReplayPanel` 已覆盖的大量来源级失败态。
- 若继续审计路径，优先评估 `AuditLogBoard` 分页/过滤失败后的状态一致性，而不是继续细化已通过的列表/详情失败态。
- 下一轮也可转向 `QualityCapaTaskPanel.vue`、`KnowledgeGovernancePanel.vue`、`ReportBoard.vue` 等仍低于全局覆盖率的关键路径。
- B 轨仍需外部证据单独追踪：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
