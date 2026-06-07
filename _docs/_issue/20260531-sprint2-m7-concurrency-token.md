# 2026-05-31 Sprint 2 M7 问题记录

## 已解决

- 问题：`Equipment` 没有 EF 并发令牌。
  - 影响：设备状态更新可能发生最后写入覆盖，无法由 EF 乐观并发检测捕获。
  - 处理：`EquipmentConfiguration` 增加 `UseProviderShadowConcurrencyToken()`，并生成 `equipment.xmin` 迁移。

- 问题：M7 点名实体缺少统一防回退测试。
  - 影响：后续配置调整可能无意移除并发令牌。
  - 处理：新增架构测试直接检查 EF 模型中的并发属性。

## 过程中发现

- `WorkOrder`、`Material`、`SchedulePlan` 已在前序配置中拥有 shadow concurrency token。
- EF 迁移生成会同步当前 `MesDbContextModelSnapshot`，而工作树已有前序未跟踪迁移和模型快照漂移。

## 未解决

- 前序未跟踪迁移与快照漂移需单独整理，不能混入 M7 结论中静默处理。
- 真实 PostgreSQL 环境执行迁移仍需 staging 验证。
- API 层乐观并发冲突响应语义仍待后续治理。
