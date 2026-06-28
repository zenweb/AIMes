# 2026-06-20 Todo: Agent 配置审批后端残缺记录兜底后续

## Done

- Agent 配置审批后端残缺记录过滤已实现。
- 质量推荐实验扩大门禁 partial approved 防回归测试已覆盖。
- 目标与相邻过滤测试、lint、diff check 已通过。

## Next

- 后续可把同类完整记录 guard 复用于其他 backend-first evidence reader。
- 若后端未来提供字段级 schema/version，可将前端 guard 与 API 合约测试同步收紧。
- 在全量回归窗口补跑 AdminBoard、AuditDecisionReplayPanel、quality knowledge 相关全量测试。
