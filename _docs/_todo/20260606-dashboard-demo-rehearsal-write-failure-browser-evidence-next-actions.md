# 2026-06-06 Dashboard Demo 彩排证据下一步

- 继续按覆盖率杠杆选片，不重复精修 Dashboard 已覆盖的 A/B 报告读取失败、生产概览数据读取失败和彩排写入失败路径。
- 下一轮优先比较 `AuditLogBoard.vue`、`QualityCapaTaskPanel.vue`、`ReportBoard.vue`、`KnowledgeGovernancePanel.vue` 等低于全局覆盖率且仍缺真实浏览器证据的关键路径。
- B 轨仍需外部证据单独追踪：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
