# 2026-05-31 Sprint 3 H4 死过滤器清理

## 变更

- H4：删除旧 MVC 过滤器 `MES.Api/Filters/ValidationFilter.cs`。
- H4：删除旧 MVC 审计特性 `MES.Api/Filters/AuditAttribute.cs`。
- H4：新增架构门 `H4ObsoleteMvcFilters_ShouldNotExistOrBeReferenced`，防止旧 MVC filter 文件或类型名重新进入 API 源码。

## 红灯证据

- 新增 H4 架构门初次执行失败：
  - `Filters/ValidationFilter.cs: obsolete MVC filter file should be removed`
  - 结论：Minimal API 已使用 `ValidationEndpointFilter` / `AuditEndpointFilter`，旧 MVC filter 文件仍残留。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter H4ObsoleteMvcFilters_ShouldNotExistOrBeReferenced`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：21/21
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors
- `git diff --check` 本轮触碰文件
  - 通过

## 验证备注

- 一次并行执行架构测试与 API build 时，架构测试构建阶段出现 StaticWebAssets 压缩资产缺失；随后串行复跑完整架构测试通过，判断为并行构建/静态资产清单争用，不归因于 H4 代码变更。

## 备注

- 本轮只删除未引用的 MVC filter 死代码，不改变当前 Minimal API endpoint filter 行为。
- H3 的 `AuditEndpointFilter` 依赖反转仍作为后续独立切片处理。
