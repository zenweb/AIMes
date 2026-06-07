# 2026-05-31 Sprint 5 M13 Request Logging

## 变更

- 删除自定义 `RequestLoggingMiddleware`。
- Program 移除 `app.UseMiddleware<RequestLoggingMiddleware>()`。
- 保留 `app.UseSerilogRequestLogging()` 作为唯一请求日志入口。
- 新增架构门禁 `M13RequestLogging_ShouldUseSerilogMiddlewareOnly`，防止自定义请求日志中间件回流。

## 验证

- 红灯：新增架构门禁曾因 `RequestLoggingMiddleware.cs` 存在失败。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M13RequestLogging"` 通过，`1/1 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。
- `rg -n "RequestLoggingMiddleware|UseSerilogRequestLogging" src/backend/MES.Api src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs` 仅剩架构门禁断言与 Program 的 `UseSerilogRequestLogging()`。

## 范围说明

- 本轮只关闭 Sprint 5 / M13 自定义请求日志中间件。
- Serilog 请求日志配置、OTLP/file sink 等可观测性接线沿用既有 Sprint 4/M14 结果。
