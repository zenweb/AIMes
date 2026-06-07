# 2026-05-31 Sprint 2 M8-M10 索引与 JSONB 审计

## 审计范围

- `WorkOrderConfiguration`
- `QualityInspectionConfiguration`
- `StockTransactionConfiguration`
- `ScheduleAdoptionFeedbackConfiguration`
- 迁移 `20260531120000_AddCoreCompositeIndexesAndJsonb`
- 架构测试 `M8ToM10CoreQueries_ShouldHaveCompositeIndexesAndJsonbColumns`

不纳入本轮结论：Agent 决策表索引、全文/向量索引、所有仓储查询的全量 EXPLAIN、前序未跟踪迁移整理。

## 结论

- Code review 本地结论：APPROVE。
- Architecture 本地结论：CLEAR。
- 最终建议：APPROVE for Sprint 2 M8-M10 core index/jsonb slice。

## 检查点

- 新增复合索引均来自当前仓储实际查询形状，而不是泛化猜测。
- `ScheduleAdoptionFeedback` 的三个 JSON 快照列已显式配置为 `jsonb`。
- 架构测试使用 PostgreSQL 模型构建检查列类型，避免 SQL Server 模型掩盖 `jsonb` 配置。
- 手写迁移 Up/Down 对称：创建索引、改 `jsonb`；回滚时删除索引并恢复 `text`。
- `MesDbContextModelSnapshot` 已同步本轮 5 个复合索引与 3 个 `jsonb` 列类型，后续迁移不会重复生成 M8-M10 主体变更。
- 完整架构测试和后端构建均通过。

## 工具限制

- `oh-my-codex:code-review` 外部双 lane 当前不可用，原因仍是 `C:\Users\陈奕铭\.codex\prompts` 缺失。
- 本轮没有伪造外部 agent 审计结论，采用本地 code-review / architecture 双视角并记录限制。

## 遗留风险

- `jsonb` 迁移在真实 PostgreSQL 上仍需 staging 演练；若历史数据存在非法 JSON 字符串，迁移会失败。
- 复合索引可能增加写入成本，需要后续性能基准或生产慢查询反馈校准。
- 本轮未覆盖 Agent 与 Knowledge 相关 JSON 字段，后续可按查询热度单独治理。
