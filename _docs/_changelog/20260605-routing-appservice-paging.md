# 2026-06-05 RoutingAppService Paging Changelog

## 变更

- 将 `RoutingAppService.GetAllRoutesAsync()` 从全量加载后内存分页，改为仓储分页与计数。
- `IRoutingRepository` 新增 `GetPagedAsync(int page, int pageSize, CancellationToken ct = default)` 与 `CountAsync(CancellationToken ct = default)`。
- `RoutingRepository` 新增 SQL 级分页实现：
  - `AsNoTracking()`
  - `OrderBy(e => e.RouteCode).ThenBy(e => e.Id)`
  - `Skip((page - 1) * pageSize).Take(pageSize)`
- 新增/更新验证：
  - `RoutingAppServiceTests`
  - `PagingRepositoryTests`
  - `ArchitectureRuleTests.ListAppServices_ShouldUseRepositoryPaging`

## 验证

- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter FullyQualifiedName~RoutingAppServiceTests --no-restore`
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~PagingRepositoryTests --no-build --no-restore`
- `dotnet test .\src\backend\AIMes.slnx --no-restore`

## 结论

- 路由列表分页已收口到和设备、用户、工单一致的仓储分页模型。
