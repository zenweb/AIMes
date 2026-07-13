# 2026-07-14 审计回放双语计划

- [x] 将 AuditLogBoard 可见文案接入全局 locale。
- [x] 保持 traceId 精确查询与详情回放契约。
- [x] 增加前端双语行为测试和后端 HTTP 精确筛选测试。
- [x] 通过 PR #3 的 V1 hosted CI，并归档结果（`V1@48a3239`, CI `29268658668`, Agent Evaluation `29268658661`）。
- [x] 完成回放控制框架双语化并通过 PR #4 最终 V1 CI（`V1@3ef45fa`, CI `29271142661`, Agent Evaluation `29271142560`）。
- [x] 归档托管 CI、容器构建和 PostgreSQL 备份隔离恢复证据。
- [x] 补齐审计 PATCH 筛选、详情证据元数据、Trace 回筛、写操作 Trace 持久化、分页边界和真实证据计数。
- [x] 完成前端 119/1345、后端单测 475/475、集成 227/227、架构 130/130、lint、format 回归验证。
- [x] 对齐 CI、Docker 与 ASP.NET 的 Nuxt static 产物契约，确保 frontend-build artifact 包含 index.html 且缺失时失败。
- [ ] 取得真实灰度环境与 14 天事故证据。
