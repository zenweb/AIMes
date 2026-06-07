# 2026-05-31 Sprint 5 H1 CT Extension

## 变更

- 扩展 H1 CancellationToken 传播审计到 `KnowledgeAppService`。
- `KnowledgeAppService.QueryAsync` 调用 `_vectorStore.SearchAsync(...)` 时传播 `ct`。
- `KnowledgeAppService.UploadDocumentAsync` 调用 `_vectorStore.UpsertAsync(...)` 时传播 `ct`。
- `OperationService.ScanAsync` / `CompleteAsync` 调用 `_workOrderRepository` 时传播外层 `ct` 或 UoW `innerCt`。
- 新增架构门禁 `H1KnowledgeAppService_ShouldPropagateCancellationTokenToVectorStoreCalls`，防止向量库 I/O 重新丢失取消令牌。
- 新增架构门禁 `H1OperationService_ShouldPropagateCancellationTokenToWorkOrderRepositoryCalls`，防止工序服务访问工单仓储时重新丢失取消令牌。

## 验证

- 红灯：新增架构门禁曾因 `_vectorStore.SearchAsync(KnowledgeCollectionName, embedding, request.TopK)` 裸调用失败。
- 红灯：新增架构门禁曾因 `_workOrderRepository.GetAllAsync()` 裸调用失败。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~H1KnowledgeAppService"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~H1OperationService"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~H1"` 通过，`6/6 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-build --filter "FullyQualifiedName~KnowledgeAgentTests|FullyQualifiedName~VectorStoreServiceTests"` 通过，`10/10 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮只修复 `KnowledgeAppService` 到 `IVectorStoreService`、`OperationService` 到 `IWorkOrderRepository` 的取消令牌传播缺口。
- `GetChatHistoryAsync` 仅访问内存字典并返回 `Task.FromResult`，本轮不强行引入异步 I/O 形态。
- `RoutingAppService` 的服务层分页属于 H13 后续评估，不并入本轮 H1。
