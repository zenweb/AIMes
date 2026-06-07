# 2026-05-31 Sprint 5 L1-L6 Async Blocking

## 变更

- 新增架构门禁 `Sprint5AsyncCode_ShouldNotUseBlockingResultOrWait`，扫描 `src/backend` C# 源码中的 `xxxTask.Result` 与 `.Wait(...)` 阻塞异步调用。
- `SchedulingContextProvider.GetContextAsync` 保留 BOM 与工艺路线展开的并发启动方式，但将 `bomTask.Result` / `routeTask.Result` 改为 `await bomTask` / `await routeTask`。

## 验证

- 红灯：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint5AsyncCode"` 曾因 `SchedulingContextProvider.cs` 的 `bomTask.Result` 失败。
- 绿灯：同一架构测试在实现后通过，`1/1 passed`。

## 范围说明

- 本轮只处理 Sprint 5 / 5.9 中 `.Result` 阻塞异步这一项。
- 死代码删除与 `ScanEndpoints` 优化尚未在本轮处理。
