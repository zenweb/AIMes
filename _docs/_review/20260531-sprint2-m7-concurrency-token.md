# 2026-05-31 Sprint 2 M7 并发令牌审计

## 审计范围

- `EquipmentConfiguration`
- `ConcurrencyConfigurationExtensions` 既有 provider shadow token 行为
- `WorkOrder` / `Equipment` / `Material` / `SchedulePlan` 的 EF 模型并发令牌配置
- 新增迁移 `20260530174426_AddEquipmentConcurrencyToken`

不纳入本轮结论：其它实体并发治理、并发冲突 API 响应语义、前序未跟踪迁移的整体整理。

## 结论

- Code review 本地结论：APPROVE。
- Architecture 本地结论：CLEAR。
- 最终建议：APPROVE for Sprint 2 M7 target concurrency token slice。

## 检查点

- 四个 M7 点名实体在 EF 模型中均存在 `version` 或 `Version` 并发属性。
- `Equipment` 使用与 `Material`、`SchedulePlan`、`WorkOrder` 一致的 `UseProviderShadowConcurrencyToken()` 模式。
- PostgreSQL provider 下并发列映射到 `xmin` / `xid` / `ValueGeneratedOnAddOrUpdate()`。
- SQL Server provider 下架构测试可构建模型并确认 token 配置，不连接真实数据库。
- 迁移 Up/Down 只操作 `equipment.xmin`。

## 工具限制

- `oh-my-codex:code-review` 外部双 lane 当前不可用，原因仍是 `C:\Users\陈奕铭\.codex\prompts` 缺失。
- 本轮没有伪造外部 agent 审计结论，采用本地 code-review / architecture 双视角并记录限制。

## 遗留风险

- `MesDbContextModelSnapshot` 的 diff 包含前序未跟踪迁移导致的模型快照同步，不全是 M7 独有变化。
- 真实数据库应用迁移仍需在 staging 验证 `equipment.xmin` 对现有行的影响。
- 并发冲突如何映射为 API 409/重试提示属于后续端点合规或异常处理中间件治理，不在本轮范围。
