# 2026-05-31 Sprint 5 H1 CT Extension Review

## 结论

- 本地审计通过：`KnowledgeAppService` 已向向量库 I/O 传播调用方传入的 `CancellationToken`。
- 本地审计通过：`OperationService` 已向工单仓储 I/O 传播外层 `ct` 或 UoW `innerCt`。
- 新增门禁覆盖检索、上传和工序服务工单仓储调用点，避免回退到默认 `CancellationToken.None`。

## 覆盖点

- `QueryAsync`：问题 embedding 生成后，向量检索 `SearchAsync` 现在接收 `ct`。
- `UploadDocumentAsync`：文档读取、embedding 生成和向量写入均沿用同一个 `ct`。
- `OperationService.ScanAsync`：工单兜底查询和关联工单读取现在接收外层 `ct`。
- `OperationService.CompleteAsync`：UoW 内部读取和更新工单现在接收 `innerCt`。
- 复核剩余 AppService：`AdminAppService`、`AnomalyAppService`、`BomAppService`、`EmployeeAppService`、`DashboardKpiService`、`ScheduleAgentService`、`InventoryAppService`、`PurchaseAppService`、`AuditLogAppService`、`RoutingAppService` 的已审计仓储/服务 I/O 未发现同类明确裸调用。

## 剩余风险

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~KnowledgeAgentTests|FullyQualifiedName~VectorStoreServiceTests"` 在重建阶段被 `MES.Api` StaticWebAssets 压缩状态阻断，报缺失 `wwwroot/scheduling` 打包资产；同一筛选集使用 `--no-build` 通过。
- 并行运行两个架构测试命令时曾出现 `MES.Application.dll` copy retry 警告，最终通过；后续验证应避免并行构建同一测试项目。
- 本轮没有把 H1 做成通用 Roslyn analyzer；后续 Sprint 6 / 6.7 可统一系统化。
