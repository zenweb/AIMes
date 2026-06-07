# 2026-05-31 Sprint 2 B4 Anomaly 事务修复

## 变更

- B4：`AnomalyEndpoints.CreateAsync` 将异常创建、内联审计、通知推送包入 `IUnitOfWork.ExecuteAsync`。
- 事务内统一传播 `CancellationToken` 到异常创建和审计写入。
- 新增关系型 SQLite 集成测试 `AnomalyTransactionTests`：
  - 使用专用 `WebApplicationFactory` 保留 EF 关系型事务能力。
  - 注入失败的 `INotificationService`。
  - 验证通知失败时 `ProductionAnomalies` 与 `AuditLogs` 均不落库。
- 清理 `AnomalyControllerTests` 中既有 null-forgiving 用法，改为显式 `Assert.NotNull` 与空值判断。

## 红灯证据

- 新增测试初次红灯：
  - `Create_WhenNotificationFails_ShouldRollbackAnomalyAndAudit`
  - 失败现象：通知失败后 `ProductionAnomalies` 仍存在标题为 `IT-TX-ROLLBACK-*` 的记录。
  - 结论：原端点三步串行执行，异常创建已经 `SaveChangesAsync`，未被事务回滚。

## 验证

- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~AnomalyTransactionTests" --no-restore`
  - 通过：1/1
- `dotnet clean src/backend/MES.Api/MES.Api.csproj`
  - 通过：清理静态资源压缩缓存。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~AnomalyControllerTests|FullyQualifiedName~AnomalyTransactionTests" --no-restore`
  - 通过：2/2
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：8/8
- `git diff --check -- src/backend/MES.Api/Endpoints/AnomalyEndpoints.cs src/tests/MES.Tests.Integration/Controllers/AnomalyControllerTests.cs`
  - 通过；仅有 Git LF/CRLF 工作区提示。

## 备注

- 一次并行跑集成测试和架构测试时触发 `MES.Domain.AssemblyInfo.cs` 文件锁；后续按项目规则改为串行验证并通过。
- OMX `code-reviewer` 仍因 `C:\Users\陈奕铭\.codex\prompts` 缺失不可用，本轮采用本地双视角审计。
