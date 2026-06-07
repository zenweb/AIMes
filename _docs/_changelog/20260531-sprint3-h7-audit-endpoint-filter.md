# 2026-05-31 Sprint 3 H7 端点审计过滤器

## 变更

- H7：Admin/Bom/Inventory/Purchase/Employee/Routing 的写端点统一补 `AuditEndpointFilter`。
- H7：每个点名 endpoint 文件新增明确资源名的 `AuditEndpointFilter`：
  - `admin`
  - `bom`
  - `inventory`
  - `purchase`
  - `employee`
  - `routing`
- H7：新增架构门 `H7TargetMutatingEndpoints_ShouldUseAuditEndpointFilter`，防止点名模块写端点遗漏 endpoint-layer audit。

## 红灯证据

- 新增架构门初次执行失败：
  - `AdminEndpoints.cs: missing AuditEndpointFilter resource 'admin'`
  - 结论：Sprint 3 H7 点名模块的写端点审计覆盖仍不完整。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~H7" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：16/16
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors
- `git diff --check` 本轮触碰文件
  - 通过；仅保留既有 LF/CRLF 提示

## 备注

- 本轮只补 H7 点名模块，不扩大改动到 Anomaly/Quality/Scheduling 等已有审计模式的模块。
- `AuditEndpointFilter` 仍直接依赖 `MesDbContext`，后续 H3 会按计划改为依赖 `IAuditLogAppService`。
