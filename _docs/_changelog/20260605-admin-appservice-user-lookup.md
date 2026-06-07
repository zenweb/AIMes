# 2026-06-05 AdminAppService User Lookup Changelog

## 变更

- 将 `AdminAppService.UpdateUserAsync()` 从全量加载系统用户后内存查找，改为仓储按 `Id` 直查。
- `IUserRepository` 新增 `GetByIdAsync(string id, CancellationToken ct = default)`。
- `UserRepository` 实现 `GetByIdAsync()`，使用 `AsNoTracking()` 直查目标用户。
- `AdminAppServiceTests` 新增/更新验证：
  - 更新路径只调用 `GetByIdAsync()`
  - 不再调用 `GetAllAsync()`
  - 用户不存在时仍抛原异常

## 验证

- `dotnet test .\\src\\tests\\MES.Tests.Unit\\MES.Tests.Unit.csproj --filter FullyQualifiedName~AdminAppServiceTests --no-restore`
- `dotnet test .\\src\\backend\\AIMes.slnx --no-restore`

## 结论

- 管理后台用户更新路径已收口为直查模式，和现有分页/直查标准保持一致。
