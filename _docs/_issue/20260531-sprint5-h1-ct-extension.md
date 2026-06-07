# 2026-05-31 Sprint 5 H1 CT Extension Issue

## 已关闭

- `KnowledgeAppService` 调用 `IVectorStoreService.SearchAsync` 和 `UpsertAsync` 时未传入 `CancellationToken`，导致外部向量库 I/O 无法响应调用方取消。
- `OperationService` 调用 `IWorkOrderRepository.GetAllAsync`、`GetByIdAsync` 和 `UpdateAsync` 时未传入 `CancellationToken`，导致工序扫码/完工链路的工单 I/O 无法响应调用方取消。

## 处理

- 为 `KnowledgeAppService` 增加架构门禁，锁定两个裸调用片段。
- 将 `ct` 传入 `SearchAsync` 与 `UpsertAsync`。
- 为 `OperationService` 增加架构门禁，锁定工单仓储裸调用片段。
- 在 `ScanAsync` 中传入外层 `ct`，在 `CompleteAsync` 的 UoW 内部传入 `innerCt`。

## 待跟踪

- 测试项目重建时仍可能受到 `MES.Api` StaticWebAssets 压缩缓存影响：当前报缺失 `wwwroot/scheduling` 下的前端打包资产。该问题不由本轮 H1 CT 修改引入，但会阻断带 build 的部分单测命令。
