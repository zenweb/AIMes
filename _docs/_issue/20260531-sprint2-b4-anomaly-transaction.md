# 2026-05-31 Sprint 2 B4 Anomaly 事务问题记录

## 已解决

- 问题：`AnomalyEndpoints.CreateAsync` 原先按顺序执行异常创建、审计写入、通知推送，未使用事务边界。
  - 影响：通知或审计失败时，异常记录可能已经落库，B4 验收中“异常/审计/通知失败回滚”不成立。
  - 证据：红灯测试中通知失败后，`ProductionAnomalies` 仍存在新建异常。
  - 处理：端点注入 `IUnitOfWork`，将三步包入 `ExecuteAsync`。

- 问题：B4 缺少关系型事务回归测试。
  - 影响：InMemory 测试无法证明事务回滚。
  - 处理：新增 SQLite 关系型测试工厂和通知失败桩，验证失败后异常与审计均不持久化。

## 过程中发现

- 并行执行多个 `dotnet test` 时可能产生 `MES.Domain.AssemblyInfo.cs` 文件锁。
  - 处理：按项目约束改为串行跑测试。

- `MES.Api` 静态资源压缩缓存曾引用不存在的 `wwwroot/scheduling` 构建产物。
  - 处理：执行 `dotnet clean src/backend/MES.Api/MES.Api.csproj` 清理后，定向测试可重新构建通过。

## 未解决

- 外部通知不是数据库事务资源；当前实现不能回滚“已经成功发出的通知”。后续建议引入 Outbox 或提交后通知模式。
- `InventoryAppService.StockOut` B4 事务边界仍需继续验证。
- OMX 外部代理审计仍不可用：缺 `C:\Users\陈奕铭\.codex\prompts`。
