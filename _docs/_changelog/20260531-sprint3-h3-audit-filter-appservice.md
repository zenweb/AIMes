# 2026-05-31 Sprint 3 H3 审计过滤器依赖反转

## 变更

- H3：`AuditEndpointFilter` 不再直接依赖 `MesDbContext` 或构造 `AuditLog` 实体。
- H3：端点审计写入改为调用 `IAuditLogAppService.WriteAuditLogAsync(...)`。
- H3：保留现有用户、资源、资源 ID、`X-Initiated-By`、IP、User-Agent 和 `AuditRedaction` 脱敏 payload 采集行为。
- H3：新增架构门 `H3AuditEndpointFilter_ShouldDependOnAuditAppServiceNotDbContext`，禁止 `AuditEndpointFilter` 回退到直接 EF 持久化。

## 红灯证据

- 新增 H3 架构门初次执行失败：
  - `AuditEndpointFilter.cs` 不包含 `IAuditLogAppService`
  - 源码仍包含 `MesDbContext`、`MES.Infrastructure.Data`、`new AuditLog`、`.AuditLogs`、`SaveChangesAsync`
  - 结论：端点过滤器仍越过应用层直接写数据库。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter H3AuditEndpointFilter_ShouldDependOnAuditAppServiceNotDbContext`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter CreateUser_ShouldRedactPasswordInAuditLog`
  - 通过：1/1
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：22/22
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors
- `git diff --check` 本轮触碰文件
  - 通过；仅 `AuditEndpointFilter.cs` 有 LF/CRLF 提示

## 备注

- 现有 endpoint 使用静态 `AuditEndpointFilter` 实例携带 resource 名称；本轮为保持手术式变更，仍在请求作用域内解析 `IAuditLogAppService`。
- 若后续要完全消除 filter 内服务定位器，需要把端点审计注册方式改为可注入 resource metadata 的 endpoint filter factory 或扩展方法。
