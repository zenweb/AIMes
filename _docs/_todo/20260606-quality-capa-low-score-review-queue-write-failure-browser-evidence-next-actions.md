# 2026-06-06 QualityCapaTaskPanel 低分复核队列下一步

- 不继续重复精修已验证的低分复核队列生成失败态。
- 若继续质量 CAPA 路径，优先比较“低分复核队列关闭失败”“发布推荐采纳失败”“助手执行包质量责任闭环失败”的真实浏览器证据缺口。
- 若 QualityCapaTaskPanel 边际收益下降，按覆盖率杠杆重新比较 `KnowledgeGovernancePanel.vue`、`ReportBoard.vue`、`AuditLogBoard.vue` 分页/过滤一致性等用户关键路径。
- B 轨仍需外部证据单独追踪：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
